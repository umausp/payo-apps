// useTransactions Hook
// Custom hook for transaction operations

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  sendPayment,
  loadTransactions,
  refreshTransactions,
  clearCurrentTransaction,
} from '../store/slices/transactionSlice';
import { UseTransactionsReturn } from '../../types';

export const useTransactions = (): UseTransactionsReturn & {
  send: (to: string, amount: string, metadata?: any) => Promise<void>;
  currentTransaction: any;
  isSending: boolean;
  clearCurrent: () => void;
} => {
  const dispatch = useAppDispatch();
  const { transactions, currentTransaction, isLoading, isSending, error } =
    useAppSelector((state) => state.transactions);
  const { wallet } = useAppSelector((state) => state.wallet);

  // Load transactions when wallet is available
  useEffect(() => {
    if (wallet?.address) {
      dispatch(loadTransactions(wallet.address));
    }
  }, [wallet?.address, dispatch]);

  const refreshTransactionList = useCallback(async () => {
    if (wallet?.address) {
      await dispatch(refreshTransactions(wallet.address)).unwrap();
    }
  }, [wallet?.address, dispatch]);

  const send = useCallback(
    async (to: string, amount: string, metadata?: any) => {
      await dispatch(sendPayment({ to, amount, metadata })).unwrap();
    },
    [dispatch],
  );

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentTransaction());
  }, [dispatch]);

  return {
    transactions,
    currentTransaction,
    isLoading,
    isSending,
    error,
    refreshTransactions: refreshTransactionList,
    send,
    clearCurrent,
  };
};
