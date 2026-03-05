import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import { useWallet } from '../../../hooks/useWallet';
import BackButton from '../../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateWallet'>;

const CreateWalletScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { createNewWallet, seedPhrase, isLoading, removeWallet } = useWallet();
  const isCreating = useRef(false);

  // Navigate to seed phrase screen when wallet is created
  useEffect(() => {
    console.log('SeedPhrase effect triggered:', {
      isCreating: isCreating.current,
      seedPhrase: seedPhrase?.length,
      hasPhrase: !!seedPhrase
    });

    if (isCreating.current && seedPhrase && seedPhrase.length > 0) {
      console.log('Navigating to SeedPhrase screen with:', seedPhrase);
      isCreating.current = false;
      navigation.navigate('SeedPhrase', { seedPhrase });
    }
  }, [seedPhrase, navigation]);

  const handleCreateWallet = async () => {
    try {
      console.log('Creating wallet...');
      isCreating.current = true;
      await createNewWallet();
      console.log('Wallet created, seedPhrase from state:', seedPhrase);
    } catch (error) {
      isCreating.current = false;
      console.error('Failed to create wallet:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to create wallet';

      // Check if wallet already exists
      if (errorMessage.includes('already exists')) {
        Alert.alert(
          'Wallet Already Exists',
          'A wallet already exists on this device. Would you like to delete it and create a new one? (This will erase the existing wallet!)',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete & Create New',
              style: 'destructive',
              onPress: async () => {
                try {
                  await removeWallet();
                  // Try again after clearing
                  isCreating.current = true;
                  await createNewWallet();
                } catch (err) {
                  isCreating.current = false;
                  Alert.alert('Error', 'Failed to create wallet. Please try again.');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleImportWallet = () => {
    navigation.navigate('ImportWallet');
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Wallet</Text>
        <Text style={styles.description}>
          Choose an option to get started with PAYO
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateWallet}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : 'Create New Wallet'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleImportWallet}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Import Existing Wallet
          </Text>
        </TouchableOpacity>

        <Text style={styles.notice}>
          ⚠️ Your wallet will be non-custodial. Please save your seed phrase securely.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, padding: spacing[6], justifyContent: 'center' },
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
    borderRadius: borderRadius.md,
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
  notice: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    textAlign: 'center',
    marginTop: spacing[6]
  },
});

export default CreateWalletScreen;
