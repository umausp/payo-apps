import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import { useWallet } from '../../../hooks/useWallet';
import BackButton from '../../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import { VALIDATION } from '../../../../constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ImportWallet'>;

const ImportWalletScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { importExistingWallet, isLoading } = useWallet();
  const [seedPhrase, setSeedPhrase] = useState('');

  const handleImport = async () => {
    const words = seedPhrase.trim().split(' ').filter(w => w.length > 0);

    if (words.length !== VALIDATION.SEED_PHRASE_WORDS) {
      Alert.alert(
        'Invalid Seed Phrase',
        `Please enter a valid ${VALIDATION.SEED_PHRASE_WORDS}-word seed phrase`
      );
      return;
    }

    try {
      await importExistingWallet(words);
      navigation.navigate('BiometricSetup');
    } catch (error) {
      Alert.alert('Import Failed', error instanceof Error ? error.message : 'Failed to import wallet');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Import Wallet</Text>
        <Text style={styles.description}>
          Enter your {VALIDATION.SEED_PHRASE_WORDS}-word seed phrase to restore your wallet
        </Text>

        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder={`Enter seed phrase (${VALIDATION.SEED_PHRASE_WORDS} words)`}
          placeholderTextColor={colors.text.tertiary}
          value={seedPhrase}
          onChangeText={setSeedPhrase}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, (!seedPhrase.trim() || isLoading) && styles.buttonDisabled]}
          onPress={handleImport}
          disabled={isLoading || !seedPhrase.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Importing...' : 'Import Wallet'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          🔒 Your private keys will never leave your device
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, padding: spacing[6] },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[4]
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[6]
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing[6],
    minHeight: 120,
    textAlignVertical: 'top'
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[4]
  },
  buttonDisabled: {
    backgroundColor: colors.neutral[300],
    opacity: 0.6
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse
  },
  securityNote: {
    fontSize: typography.fontSize.sm,
    color: colors.success[600],
    textAlign: 'center',
    marginTop: spacing[4]
  },
});

export default ImportWalletScreen;
