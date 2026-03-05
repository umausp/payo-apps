// Biometric Authentication Service
// Handles biometric authentication (Face ID / Fingerprint)

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { FEATURES } from '../../constants';

export class BiometricService {
  private static instance: BiometricService;
  private rnBiometrics: ReactNativeBiometrics;

  private constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
  }

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (!FEATURES.BIOMETRIC_AUTH) {
        return false;
      }

      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  /**
   * Get the type of biometric authentication available
   */
  async getBiometricType(): Promise<BiometryTypes | null> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();

      if (!available) {
        return null;
      }

      return biometryType || null;
    } catch (error) {
      console.error('Failed to get biometric type:', error);
      return null;
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(promptMessage?: string): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();

      if (!isAvailable) {
        throw new Error('Biometric authentication is not available on this device');
      }

      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: promptMessage || 'Authenticate to access your wallet',
        cancelButtonText: 'Cancel',
      });

      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  /**
   * Check if biometric keys exist
   */
  async hasKeys(): Promise<boolean> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Failed to check biometric keys:', error);
      return false;
    }
  }

  /**
   * Create biometric keys
   */
  async createKeys(): Promise<boolean> {
    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      return !!publicKey;
    } catch (error) {
      console.error('Failed to create biometric keys:', error);
      return false;
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Failed to delete biometric keys:', error);
      return false;
    }
  }

  /**
   * Create a signature using biometric authentication
   */
  async createSignature(
    payload: string,
    promptMessage?: string,
  ): Promise<string | null> {
    try {
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: promptMessage || 'Sign to authenticate',
        payload,
        cancelButtonText: 'Cancel',
      });

      if (!success || !signature) {
        return null;
      }

      return signature;
    } catch (error) {
      console.error('Failed to create signature:', error);
      return null;
    }
  }

  /**
   * Get biometric authentication display name
   */
  async getBiometricDisplayName(): Promise<string> {
    try {
      const biometryType = await this.getBiometricType();

      switch (biometryType) {
        case BiometryTypes.TouchID:
          return 'Touch ID';
        case BiometryTypes.FaceID:
          return 'Face ID';
        case BiometryTypes.Biometrics:
          return 'Biometric';
        default:
          return 'Biometric';
      }
    } catch (error) {
      return 'Biometric';
    }
  }
}

export default BiometricService.getInstance();
