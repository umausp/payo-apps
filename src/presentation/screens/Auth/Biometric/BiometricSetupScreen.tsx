import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import { useBiometric } from '../../../hooks/useBiometric';
import { useAppDispatch } from '../../../hooks/useRedux';
import { login } from '../../../store/slices/authSlice';
import BackButton from '../../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'BiometricSetup'>;

const BiometricSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { isAvailable, enable } = useBiometric();

  const handleEnable = async () => {
    const success = await enable();
    if (success) {
      // Authenticate user and navigate to dashboard
      dispatch(login());
      navigation.replace('Dashboard');
    }
  };

  const handleSkip = () => {
    // Authenticate user and navigate to dashboard
    dispatch(login());
    navigation.replace('Dashboard');
  };

  if (!isAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.content}>
          <Text style={styles.title}>Biometric Not Available</Text>
          <Text style={styles.description}>
            Biometric authentication is not available on this device
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleSkip}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text style={styles.title}>Enable Biometric</Text>
        <Text style={styles.description}>
          Use Face ID or Fingerprint to quickly access your wallet
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleEnable}>
          <Text style={styles.buttonText}>Enable Biometric</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
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
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center'
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[12]
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[4]
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse
  },
  skipText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    textAlign: 'center'
  },
});

export default BiometricSetupScreen;
