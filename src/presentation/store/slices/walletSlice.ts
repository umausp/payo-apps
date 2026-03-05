// Wallet State Slice
// Manages wallet-related state

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Wallet } from '../../../types';
import WalletRepository from '../../../data/repositories/WalletRepository';
import PriceRepository from '../../../data/repositories/PriceRepository';
import { CreateWalletUseCase } from '../../../domain/useCases/CreateWalletUseCase';
import { ImportWalletUseCase } from '../../../domain/useCases/ImportWalletUseCase';
import { GetWalletBalanceUseCase } from '../../../domain/useCases/GetWalletBalanceUseCase';

interface WalletState {
  wallet: Wallet | null;
  balance: string;
  fiatBalance: string;
  isLoading: boolean;
  error: string | null;
  seedPhrase: string[] | null;
}

const initialState: WalletState = {
  wallet: null,
  balance: '0',
  fiatBalance: '0.00',
  isLoading: false,
  error: null,
  seedPhrase: null,
};

// Async Thunks
export const createWallet = createAsyncThunk(
  'wallet/create',
  async (_, { rejectWithValue }) => {
    try {
      const useCase = new CreateWalletUseCase(WalletRepository);
      const { wallet, seedPhrase } = await useCase.execute();

      return {
        wallet: wallet.toObject(),
        seedPhrase,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create wallet',
      );
    }
  },
);

export const importWallet = createAsyncThunk(
  'wallet/import',
  async (seedPhrase: string[], { rejectWithValue }) => {
    try {
      const useCase = new ImportWalletUseCase(WalletRepository);
      const wallet = await useCase.execute(seedPhrase);

      return wallet.toObject();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to import wallet',
      );
    }
  },
);

export const loadWallet = createAsyncThunk(
  'wallet/load',
  async (_, { rejectWithValue }) => {
    try {
      const wallet = await WalletRepository.getWallet();

      if (!wallet) {
        return null;
      }

      return wallet.toObject();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load wallet',
      );
    }
  },
);

export const refreshBalance = createAsyncThunk(
  'wallet/refreshBalance',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const wallet = state.wallet.wallet;

      if (!wallet || !wallet.address) {
        return rejectWithValue('No wallet address found');
      }

      // Import ApiService dynamically to avoid circular dependency
      const ApiService = (await import('../../../infrastructure/api/ApiService')).default;

      // Fetch balance from backend
      const balanceResponse = await ApiService.getBalance(wallet.address, 'payo');

      if (!balanceResponse.success) {
        // Fallback to local blockchain service
        const useCase = new GetWalletBalanceUseCase(
          WalletRepository,
          PriceRepository,
        );
        const result = await useCase.execute();
        return result;
      }

      const { balanceWei, decimals, symbol } = balanceResponse.data!;

      // Convert wei to human-readable format
      const balanceInTokens = (BigInt(balanceWei) / BigInt(10 ** decimals)).toString();

      // Get USD price
      const price = await PriceRepository.getCurrentPrice();
      const fiatBalance = (parseFloat(balanceInTokens) * price.priceUSD).toFixed(2);

      return {
        balance: balanceInTokens,
        fiatBalance,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to refresh balance',
      );
    }
  },
);

export const deleteWallet = createAsyncThunk(
  'wallet/delete',
  async (_, { rejectWithValue }) => {
    try {
      await WalletRepository.deleteWallet();
      return null;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete wallet',
      );
    }
  },
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearSeedPhrase(state) {
      state.seedPhrase = null;
    },
    clearWalletError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Wallet
    builder
      .addCase(createWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload.wallet as Wallet;
        state.seedPhrase = action.payload.seedPhrase;
        state.balance = action.payload.wallet.balance;
        state.fiatBalance = action.payload.wallet.fiatBalance;
      })
      .addCase(createWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Import Wallet
    builder
      .addCase(importWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload as Wallet;
        state.balance = action.payload.balance;
        state.fiatBalance = action.payload.fiatBalance;
      })
      .addCase(importWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load Wallet
    builder
      .addCase(loadWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.wallet = action.payload as Wallet;
          state.balance = action.payload.balance;
          state.fiatBalance = action.payload.fiatBalance;
        }
      })
      .addCase(loadWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh Balance
    builder
      .addCase(refreshBalance.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshBalance.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
        state.fiatBalance = action.payload.fiatBalance;
      })
      .addCase(refreshBalance.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Wallet
    builder
      .addCase(deleteWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWallet.fulfilled, (state) => {
        state.isLoading = false;
        state.wallet = null;
        state.balance = '0';
        state.fiatBalance = '0.00';
        state.seedPhrase = null;
      })
      .addCase(deleteWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSeedPhrase, clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
