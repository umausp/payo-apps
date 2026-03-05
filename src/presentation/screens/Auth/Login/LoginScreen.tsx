import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import { useBiometric } from '../../../hooks/useBiometric';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { loginWithWallet, clearAuthError } from '../../../store/slices/authSlice';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { isAvailable, authenticate } = useBiometric();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Navigate to dashboard if already authenticated
    if (isAuthenticated) {
      navigation.replace('Dashboard');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    // Show error alert if login fails
    if (error) {
      Alert.alert(
        'Authentication Failed',
        error,
        [
          {
            text: 'OK',
            onPress: () => dispatch(clearAuthError()),
          },
        ]
      );
    }
  }, [error, dispatch]);

  const handleWalletLogin = async () => {
    try {
      const result = await dispatch(loginWithWallet()).unwrap();
      console.log('Login successful:', result.user);
    } catch (error) {
      // Error is handled by the effect above
      console.error('Login failed:', error);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticate();
    if (success) {
      // After biometric auth, authenticate with backend
      await handleWalletLogin();
    } else {
      Alert.alert('Authentication Failed', 'Biometric authentication was not successful');
    }
  };

  const handlePinLogin = async () => {
    // TODO: Implement PIN verification
    // For now, directly authenticate with backend
    await handleWalletLogin();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.description}>Authenticate to access your wallet</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Authenticating...</Text>
          </View>
        ) : (
          <>
            {isAvailable && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Use Biometric</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handlePinLogin}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Use PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.tertiaryButton]}
              onPress={handleWalletLogin}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.tertiaryButtonText]}>Login with Wallet</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center'
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8]
  },
  errorContainer: {
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[500],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[700],
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing[4],
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center'
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse
  },
  secondaryButton: {
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.primary[500]
  },
  secondaryButtonText: { color: colors.primary[500] },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  tertiaryButtonText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
  },
});

export default LoginScreen;
