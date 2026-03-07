// Redux Store Configuration
// Using Redux Toolkit for state management

import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createTransform,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import walletReducer from './slices/walletSlice';
import transactionReducer from './slices/transactionSlice';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';

// Transform to exclude transient state from auth persistence
const authTransform = createTransform(
  // Transform state on its way to being serialized and persisted
  (inboundState: any) => {
    // Remove transient state that shouldn't be persisted
    const { isLoading, error, ...persistedState } = inboundState;
    return persistedState;
  },
  // Transform state being rehydrated
  (outboundState: any) => {
    // Ensure transient state is reset on rehydration
    return {
      ...outboundState,
      isLoading: false,
      error: null,
    };
  },
  { whitelist: ['auth'] }
);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'app'], // Only persist auth and app state
  transforms: [authTransform],
};

const rootReducer = combineReducers({
  wallet: walletReducer,
  transactions: transactionReducer,
  auth: authReducer,
  app: appReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
