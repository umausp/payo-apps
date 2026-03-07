/**
 * PAYO - QR-Based Digital Payment Platform
 * Main Application Entry Point
 */

import React, { useEffect, useRef } from 'react';
import { StatusBar, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values'; // Required for crypto operations

import { store, persistor } from './src/presentation/store';
import RootNavigator from './src/presentation/navigation/RootNavigator';
import { logApiConfiguration } from './src/utils/debugNetwork';
import { Web3Provider } from './src/infrastructure/web3/Web3Provider';
import { lockApp } from './src/presentation/store/slices/authSlice';

function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Log API configuration on app start
    logApiConfiguration();

    // Listen for app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    const prevState = appState.current;
    console.log('[App] ===== APP STATE CHANGE =====');
    console.log('[App] From:', prevState, '→ To:', nextAppState);

    // When app goes to background (or inactive), lock it
    if (
      prevState === 'active' &&
      (nextAppState === 'background' || nextAppState === 'inactive')
    ) {
      const state = store.getState();
      console.log('[App] 🔒 App going to background');
      console.log('[App] Current auth state:', {
        isAuthenticated: state.auth.isAuthenticated,
        hasWallet: state.app.hasWallet,
        isLoading: state.auth.isLoading,
      });

      // Only lock if user is authenticated and has a wallet
      if (state.auth.isAuthenticated && state.app.hasWallet) {
        console.log('[App] ✅ Dispatching lockApp()');
        store.dispatch(lockApp());

        // Verify state after lock
        const newState = store.getState();
        console.log('[App] After lockApp:', {
          isAuthenticated: newState.auth.isAuthenticated,
          isLoading: newState.auth.isLoading,
        });
      } else {
        console.log('[App] ⏭️  Skipping lock (not authenticated or no wallet)');
      }
    }

    // When app comes back to foreground
    if (prevState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('[App] 👋 App returning to foreground');
      const state = store.getState();
      console.log('[App] Current state:', {
        isAuthenticated: state.auth.isAuthenticated,
        isLoading: state.auth.isLoading,
        hasWallet: state.app.hasWallet,
      });
    }

    appState.current = nextAppState;
    console.log('[App] ===============================');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Web3Provider>
              <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
              <RootNavigator />
            </Web3Provider>
          </PersistGate>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
