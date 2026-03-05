// Transaction State Slice
// Manages transaction-related state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Transaction } from '../../../types';
import TransactionRepository from '../../../data/repositories/TransactionRepository';
import { SendPaymentUseCase } from '../../../domain/useCases/SendPaymentUseCase';
import WalletRepository from '../../../data/repositories/WalletRepository';

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  currentTransaction: null,
  isLoading: false,
  isSending: false,
  error: null,
};

// Async Thunks
export const sendPayment = createAsyncThunk(
  'transaction/send',
  async (
    params: { to: string; amount: string; metadata?: any },
    { rejectWithValue },
  ) => {
    try {
      const useCase = new SendPaymentUseCase(
        WalletRepository,
        TransactionRepository,
      );
      const transaction = await useCase.execute(params);

      return transaction.toObject();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to send payment',
      );
    }
  },
);

export const loadTransactions = createAsyncThunk(
  'transaction/load',
  async (address: string, { rejectWithValue }) => {
    try {
      // Import ApiService dynamically to avoid circular dependency
      const ApiService = (await import('../../../infrastructure/api/ApiService')).default;

      // Fetch transactions from backend
      const response = await ApiService.getTransactions({
        walletAddress: address,
        limit: 50,
        offset: 0,
      });

      if (!response.success) {
        // Fallback to local storage
        const transactions = await TransactionRepository.getTransactionsByAddress(address);
        return transactions.map((tx) => tx.toObject());
      }

      const { transactions } = response.data!;

      // Map backend transaction format to app format
      return transactions.map((tx: any) => ({
        id: tx._id,
        hash: tx.txHash || '',
        from: tx.walletAddress,
        to: tx.to,
        amount: tx.amount,
        timestamp: new Date(tx.createdAt).getTime(),
        status: tx.status,
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations || 0,
        fee: '0',
      }));
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load transactions',
      );
    }
  },
);

export const refreshTransactions = createAsyncThunk(
  'transaction/refresh',
  async (address: string, { rejectWithValue }) => {
    try {
      // Import ApiService dynamically to avoid circular dependency
      const ApiService = (await import('../../../infrastructure/api/ApiService')).default;

      // Fetch transactions from backend
      const response = await ApiService.getTransactions({
        walletAddress: address,
        limit: 50,
        offset: 0,
      });

      if (!response.success) {
        // Fallback to local storage
        const transactions = await TransactionRepository.getTransactionsByAddress(address);
        return transactions.map((tx) => tx.toObject());
      }

      const { transactions } = response.data!;

      // Map backend transaction format to app format
      return transactions.map((tx: any) => ({
        id: tx._id,
        hash: tx.txHash || '',
        from: tx.walletAddress,
        to: tx.to,
        amount: tx.amount,
        timestamp: new Date(tx.createdAt).getTime(),
        status: tx.status,
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations || 0,
        fee: '0',
      }));
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to refresh transactions',
      );
    }
  },
);

// Slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearCurrentTransaction(state) {
      state.currentTransaction = null;
    },
    clearTransactionError(state) {
      state.error = null;
    },
    updateTransactionStatus(state, action) {
      const { hash, status, blockNumber } = action.payload;
      const transaction = state.transactions.find((tx) => tx.hash === hash);

      if (transaction) {
        transaction.status = status;
        if (blockNumber) {
          transaction.blockNumber = blockNumber;
        }
      }

      if (state.currentTransaction?.hash === hash) {
        state.currentTransaction.status = status;
        if (blockNumber) {
          state.currentTransaction.blockNumber = blockNumber;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Send Payment
    builder
      .addCase(sendPayment.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendPayment.fulfilled, (state, action) => {
        state.isSending = false;
        state.currentTransaction = action.payload as Transaction;
        state.transactions.unshift(action.payload as Transaction);
      })
      .addCase(sendPayment.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });

    // Load Transactions
    builder
      .addCase(loadTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload as Transaction[];
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Transactions
    builder
      .addCase(refreshTransactions.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload as Transaction[];
      })
      .addCase(refreshTransactions.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCurrentTransaction,
  clearTransactionError,
  updateTransactionStatus,
} = transactionSlice.actions;

export default transactionSlice.reducer;
