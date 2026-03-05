// useBiometric Hook
// Custom hook for biometric authentication

import { useState, useEffect, useCallback } from 'react';
import { UseBiometricReturn } from '../../types';
import BiometricService from '../../infrastructure/biometric/BiometricService';
import { useAppDispatch, useAppSelector } from './useRedux';
import { enableBiometric as enableBiometricAction, disableBiometric as disableBiometricAction } from '../store/slices/authSlice';

export const useBiometric = (): UseBiometricReturn => {
  const dispatch = useAppDispatch();
  const { biometricEnabled } = useAppSelector((state) => state.auth);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    const available = await BiometricService.isAvailable();
    setIsAvailable(available);

    if (available) {
      const enrolled = await BiometricService.hasKeys();
      setIsEnrolled(enrolled);
    }
  };

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      const success = await BiometricService.authenticate(
        'Authenticate to access your wallet',
      );
      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    try {
      const hasKeys = await BiometricService.hasKeys();

      if (!hasKeys) {
        const created = await BiometricService.createKeys();
        if (!created) {
          return false;
        }
      }

      const success = await BiometricService.authenticate(
        'Enable biometric authentication',
      );

      if (success) {
        dispatch(enableBiometricAction());
        setIsEnrolled(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      return false;
    }
  }, [dispatch]);

  const disable = useCallback(async (): Promise<boolean> => {
    try {
      const success = await BiometricService.authenticate(
        'Disable biometric authentication',
      );

      if (success) {
        await BiometricService.deleteKeys();
        dispatch(disableBiometricAction());
        setIsEnrolled(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to disable biometric:', error);
      return false;
    }
  }, [dispatch]);

  return {
    isAvailable,
    isEnrolled: isEnrolled && biometricEnabled,
    authenticate,
    enable,
    disable,
  };
};
