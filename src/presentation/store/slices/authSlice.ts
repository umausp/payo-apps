// Auth State Slice
// Manages authentication state

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SECURITY } from '../../../constants';
import ApiService from '../../../infrastructure/api/ApiService';
import WalletRepository from '../../../data/repositories/WalletRepository';
import BlockchainService from '../../../infrastructure/blockchain/BlockchainService';

interface UserInfo {
  userId: string;
  walletAddress: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  loginAttempts: number;
  lockedUntil: Date | null;
  lastActivity: Date | null;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  biometricEnabled: false,
  pinEnabled: false,
  loginAttempts: 0,
  lockedUntil: null,
  lastActivity: null,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const loginWithWallet = createAsyncThunk(
  'auth/loginWithWallet',
  async (_, { rejectWithValue }) => {
    try {
      // Get wallet from repository
      const wallet = await WalletRepository.getWallet();
      if (!wallet) {
        throw new Error('No wallet found. Please create or import a wallet first.');
      }

      // Get private key for signing
      const privateKey = await WalletRepository.getPrivateKey();
      if (!privateKey) {
        throw new Error('Failed to access wallet credentials');
      }

      // Step 1: Get challenge from backend
      console.log('[Auth] Step 1: Getting challenge for wallet:', wallet.address);
      const challengeResponse = await ApiService.getChallenge(wallet.address);
      if (!challengeResponse.success) {
        throw new Error(challengeResponse.error?.message || 'Failed to get authentication challenge');
      }

      const { message } = challengeResponse.data!;
      console.log('[Auth] Challenge received:', message);

      // Step 2: Sign the challenge message
      console.log('[Auth] Step 2: Signing challenge message');
      const ethersWallet = BlockchainService.importWalletFromPrivateKey(privateKey);
      const signature = await ethersWallet.signMessage(message);
      console.log('[Auth] Signature created:', signature.substring(0, 20) + '...');

      // Step 3: Verify signature and get JWT tokens
      console.log('[Auth] Step 3: Verifying signature with backend');
      const verifyResponse = await ApiService.verifySignature(
        wallet.address,
        signature,
        message
      );

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error?.message || 'Authentication failed');
      }

      const { user, accessToken, refreshToken } = verifyResponse.data!;
      console.log('[Auth] ✓ Authentication successful');
      console.log('[Auth] User ID:', user.userId);
      console.log('[Auth] Access Token received:', accessToken ? 'YES' : 'NO');
      console.log('[Auth] Refresh Token received:', refreshToken ? 'YES' : 'NO');

      // JWT tokens are automatically stored by ApiService
      console.log('[Auth] Tokens will be stored in Redux state for persistence');

      return {
        user: {
          userId: user.userId,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      // Call backend logout endpoint
      await ApiService.logout();
      // JWT tokens are automatically cleared by ApiService
      return null;
    } catch (error) {
      // Even if backend call fails, we still clear local state
      console.error('Logout error:', error);
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.isAuthenticated = true;
      state.loginAttempts = 0;
      state.lockedUntil = null;
      state.lastActivity = new Date();
    },
    logout(state) {
      state.isAuthenticated = false;
      state.lastActivity = null;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    incrementLoginAttempts(state) {
      state.loginAttempts += 1;

      if (state.loginAttempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date();
        lockUntil.setMinutes(
          lockUntil.getMinutes() + SECURITY.LOCK_DURATION_MINUTES,
        );
        state.lockedUntil = lockUntil;
      }
    },
    resetLoginAttempts(state) {
      state.loginAttempts = 0;
      state.lockedUntil = null;
    },
    enableBiometric(state) {
      state.biometricEnabled = true;
    },
    disableBiometric(state) {
      state.biometricEnabled = false;
    },
    enablePin(state) {
      state.pinEnabled = true;
    },
    disablePin(state) {
      state.pinEnabled = false;
    },
    updateLastActivity(state) {
      state.lastActivity = new Date();
    },
    checkSessionTimeout(state) {
      if (!state.lastActivity || !state.isAuthenticated) {
        return;
      }

      const now = new Date().getTime();
      const lastActivity = new Date(state.lastActivity).getTime();
      const diff = now - lastActivity;
      const timeoutMs = SECURITY.SESSION_TIMEOUT_MINUTES * 60 * 1000;

      if (diff > timeoutMs) {
        state.isAuthenticated = false;
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
    lockApp(state) {
      // Lock the app (require re-authentication)
      state.isAuthenticated = false;
      state.lastActivity = null;
      state.isLoading = false; // Reset loading state
      state.error = null; // Clear any errors
    },
  },
  extraReducers: (builder) => {
    // Login with wallet
    builder
      .addCase(loginWithWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.loginAttempts = 0;
        state.lockedUntil = null;
        state.lastActivity = new Date();
        state.error = null;
      })
      .addCase(loginWithWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        state.loginAttempts += 1;

        if (state.loginAttempts >= SECURITY.MAX_LOGIN_ATTEMPTS) {
          const lockUntil = new Date();
          lockUntil.setMinutes(
            lockUntil.getMinutes() + SECURITY.LOCK_DURATION_MINUTES,
          );
          state.lockedUntil = lockUntil;
        }
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.lastActivity = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails on backend, clear local state
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.lastActivity = null;
      });
  },
});

export const {
  login,
  logout,
  incrementLoginAttempts,
  resetLoginAttempts,
  enableBiometric,
  disableBiometric,
  enablePin,
  disablePin,
  updateLastActivity,
  checkSessionTimeout,
  clearAuthError,
  lockApp,
} = authSlice.actions;

export default authSlice.reducer;
