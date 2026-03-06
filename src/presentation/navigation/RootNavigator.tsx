// Root Navigator
// Main navigation structure for the app

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { loadWallet } from '../store/slices/walletSlice';
import { setHasWallet, setLoading } from '../store/slices/appSlice';
import ApiService from '../../infrastructure/api/ApiService';

// Import screens (will be created)
import SplashScreen from '../screens/Splash/SplashScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import CreateWalletScreen from '../screens/Wallet/Create/CreateWalletScreen';
import ImportWalletScreen from '../screens/Wallet/Import/ImportWalletScreen';
import SeedPhraseScreen from '../screens/Wallet/SeedPhrase/SeedPhraseScreen';
import SeedPhraseConfirmationScreen from '../screens/Wallet/Confirmation/SeedPhraseConfirmationScreen';
import BiometricSetupScreen from '../screens/Auth/Biometric/BiometricSetupScreen';
import LoginScreen from '../screens/Auth/Login/LoginScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import QRScannerScreen from '../screens/QRScanner/QRScannerScreen';
import PaymentPreviewScreen from '../screens/Payment/Preview/PaymentPreviewScreen';
import PaymentProcessingScreen from '../screens/Payment/Processing/PaymentProcessingScreen';
import PaymentSuccessScreen from '../screens/Payment/Success/PaymentSuccessScreen';
import ReceiveScreen from '../screens/Receive/ReceiveScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import LogViewerScreen from '../screens/Logs/LogViewerScreen';
import TransactionDetailsScreen from '../screens/Transaction/TransactionDetailsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, hasWallet, onboardingCompleted } = useAppSelector(
    (state) => state.app,
  );
  const { isAuthenticated, accessToken, refreshToken } = useAppSelector((state) => state.auth);
  const { wallet } = useAppSelector((state) => state.wallet);

  useEffect(() => {
    initializeApp();
  }, []);

  // Restore JWT tokens to ApiService when auth state is rehydrated
  useEffect(() => {
    console.log('[RootNavigator] Auth state changed:');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - accessToken exists:', !!accessToken);
    console.log('  - refreshToken exists:', !!refreshToken);

    if (isAuthenticated && accessToken && refreshToken) {
      console.log('[RootNavigator] ✓ Restoring JWT tokens to ApiService');
      ApiService.setTokens(accessToken, refreshToken);
    } else if (!isAuthenticated) {
      console.log('[RootNavigator] ✗ User not authenticated, clearing tokens');
      ApiService.clearTokens();
    } else if (isAuthenticated && (!accessToken || !refreshToken)) {
      console.error('[RootNavigator] ⚠️ WARNING: User is authenticated but tokens are missing!');
      console.error('  This will cause 401 errors on API calls');
    }
  }, [isAuthenticated, accessToken, refreshToken]);

  // Only set hasWallet when wallet exists AND user is authenticated
  // This prevents navigation issues during wallet creation flow
  useEffect(() => {
    if (wallet && isAuthenticated) {
      dispatch(setHasWallet(true));
    } else if (!wallet) {
      dispatch(setHasWallet(false));
    }
  }, [wallet, isAuthenticated, dispatch]);

  const initializeApp = async () => {
    dispatch(setLoading(true));
    await dispatch(loadWallet());
    dispatch(setLoading(false));
  };

  return (
    <NavigationContainer>
      {isLoading ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      ) : (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {!onboardingCompleted ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !wallet ? (
          <>
            {/* Wallet creation/import flow */}
            <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
            <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
            <Stack.Screen name="SeedPhrase" component={SeedPhraseScreen} />
            <Stack.Screen
              name="SeedPhraseConfirmation"
              component={SeedPhraseConfirmationScreen}
            />
            <Stack.Screen
              name="BiometricSetup"
              component={BiometricSetupScreen}
            />
          </>
        ) : !isAuthenticated ? (
          <>
            {/* Login + setup screens (wallet exists but not authenticated) */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SeedPhrase" component={SeedPhraseScreen} />
            <Stack.Screen
              name="SeedPhraseConfirmation"
              component={SeedPhraseConfirmationScreen}
            />
            <Stack.Screen
              name="BiometricSetup"
              component={BiometricSetupScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
            <Stack.Screen
              name="PaymentPreview"
              component={PaymentPreviewScreen}
            />
            <Stack.Screen
              name="PaymentProcessing"
              component={PaymentProcessingScreen}
            />
            <Stack.Screen
              name="PaymentSuccess"
              component={PaymentSuccessScreen}
            />
            <Stack.Screen name="Receive" component={ReceiveScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="LogViewer" component={LogViewerScreen} />
            <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
          </>
        )}
      </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
