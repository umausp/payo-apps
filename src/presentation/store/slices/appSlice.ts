// App State Slice
// Manages general application state

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  hasWallet: boolean;
  onboardingCompleted: boolean;
  currentPrice: number;
  priceChange24h: number;
  error: string | null;
}

const initialState: AppState = {
  isLoading: true,
  hasWallet: false,
  onboardingCompleted: false,
  currentPrice: 1.0,
  priceChange24h: 0,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setHasWallet(state, action: PayloadAction<boolean>) {
      state.hasWallet = action.payload;
    },
    completeOnboarding(state) {
      state.onboardingCompleted = true;
    },
    updatePrice(state, action: PayloadAction<{ price: number; change24h: number }>) {
      state.currentPrice = action.payload.price;
      state.priceChange24h = action.payload.change24h;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    resetApp(state) {
      state.hasWallet = false;
      state.onboardingCompleted = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setHasWallet,
  completeOnboarding,
  updatePrice,
  setError,
  clearError,
  resetApp,
} = appSlice.actions;

export default appSlice.reducer;
