// useWallet Hook
// Custom hook for wallet operations

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  createWallet,
  importWallet,
  loadWallet,
  refreshBalance,
  deleteWallet,
  clearSeedPhrase,
} from '../store/slices/walletSlice';
import { UseWalletReturn } from '../../types';
import { WALLET } from '../../constants';

export const useWallet = (): UseWalletReturn & {
  createNewWallet: () => Promise<void>;
  importExistingWallet: (seedPhrase: string[]) => Promise<void>;
  loadExistingWallet: () => Promise<void>;
  removeWallet: () => Promise<void>;
  clearSeed: () => void;
  seedPhrase: string[] | null;
} => {
  const dispatch = useAppDispatch();
  const { wallet, balance, fiatBalance, isLoading, error, seedPhrase } =
    useAppSelector((state) => state.wallet);

  // Load wallet on mount
  useEffect(() => {
    dispatch(loadWallet());
  }, [dispatch]);

  // Auto-refresh balance
  useEffect(() => {
    if (!wallet) return;

    const interval = setInterval(() => {
      dispatch(refreshBalance());
    }, WALLET.BALANCE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [wallet, dispatch]);

  const refreshWalletBalance = useCallback(async () => {
    await dispatch(refreshBalance()).unwrap();
  }, [dispatch]);

  const createNewWallet = useCallback(async () => {
    await dispatch(createWallet()).unwrap();
  }, [dispatch]);

  const importExistingWallet = useCallback(
    async (seedPhrase: string[]) => {
      await dispatch(importWallet(seedPhrase)).unwrap();
    },
    [dispatch],
  );

  const loadExistingWallet = useCallback(async () => {
    await dispatch(loadWallet()).unwrap();
  }, [dispatch]);

  const removeWallet = useCallback(async () => {
    await dispatch(deleteWallet()).unwrap();
  }, [dispatch]);

  const clearSeed = useCallback(() => {
    dispatch(clearSeedPhrase());
  }, [dispatch]);

  return {
    wallet,
    balance,
    fiatBalance,
    isLoading,
    error,
    seedPhrase,
    refreshBalance: refreshWalletBalance,
    createNewWallet,
    importExistingWallet,
    loadExistingWallet,
    removeWallet,
    clearSeed,
  };
};
