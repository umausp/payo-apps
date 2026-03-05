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

function App() {
  useEffect(() => {
    // Log API configuration on app start
    logApiConfiguration();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <RootNavigator />
          </SafeAreaProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

export default App;
