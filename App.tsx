/**
 * PAYO - QR-Based Digital Payment Platform
 * Main Application Entry Point
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values'; // Required for crypto operations

import { store, persistor } from './src/presentation/store';
import RootNavigator from './src/presentation/navigation/RootNavigator';
import { logApiConfiguration } from './src/utils/debugNetwork';
import { Web3Provider } from './src/infrastructure/web3/Web3Provider';

function App() {
  useEffect(() => {
    // Log API configuration on app start
    logApiConfiguration();
  }, []);

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
