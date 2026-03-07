import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import BackButton from '../../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import { VALIDATION } from '../../../../constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SeedPhrase'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'SeedPhrase'>;

const SeedPhraseScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { seedPhrase } = route.params;
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    const phrase = seedPhrase.join(' ');
    Clipboard.setString(phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert(
      'Copied!',
      'Your seed phrase has been copied to clipboard. Make sure to paste it somewhere safe immediately.',
      [{ text: 'OK' }]
    );
  };

  const handleDownload = async () => {
    const phrase = seedPhrase.join(' ');
    const message = `PAYO Wallet - Recovery Seed Phrase\n\n` +
                   `⚠️ KEEP THIS SECURE - Anyone with this phrase can access your funds!\n\n` +
                   `${phrase}\n\n` +
                   `Created: ${new Date().toLocaleString()}\n\n` +
                   `Instructions:\n` +
                   `1. Store this in a safe place (not on your phone)\n` +
                   `2. Never share it with anyone\n` +
                   `3. Use it to restore your wallet if you lose access`;

    try {
      await Share.share({
        message,
        title: 'PAYO Wallet Recovery Phrase',
      });
    } catch (error) {
      console.error('Error sharing seed phrase:', error);
    }
  };

  const handleContinue = () => {
    Alert.alert(
      'Have you saved your seed phrase?',
      `You will need these ${VALIDATION.SEED_PHRASE_WORDS} words to recover your wallet. Make sure you have saved them securely before continuing.`,
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Yes, Continue',
          onPress: () => navigation.navigate('SeedPhraseConfirmation', { seedPhrase }),
          style: 'default'
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Your Seed Phrase</Text>
        <Text style={styles.warning}>
          ⚠️ Write down these {VALIDATION.SEED_PHRASE_WORDS} words in order. This is the ONLY way to recover your wallet.
        </Text>

        <View style={styles.grid}>
          {seedPhrase.map((word, index) => (
            <View key={index} style={styles.wordContainer}>
              <Text style={styles.wordNumber}>{index + 1}.</Text>
              <Text style={styles.word}>{word}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.saveTitle}>Save Your Seed Phrase</Text>
        <Text style={styles.saveDescription}>
          Choose one or more options to securely save your recovery phrase:
        </Text>

        <TouchableOpacity
          style={[styles.actionButton, copied && styles.actionButtonSuccess]}
          onPress={handleCopyToClipboard}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            {copied ? '✓ Copied to Clipboard' : '📋 Copy to Clipboard'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDownload}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>💾 Save/Share Seed Phrase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>I've Saved It - Continue</Text>
        </TouchableOpacity>
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
  warning: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    marginBottom: spacing[6],
    padding: spacing[4],
    backgroundColor: colors.error[100],
    borderRadius: borderRadius.md
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing[6] },
  wordContainer: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    marginBottom: spacing[3],
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.base
  },
  wordNumber: { fontSize: typography.fontSize.sm, color: colors.text.primary, marginRight: spacing[2] },
  word: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium as any, color: colors.text.primary },
  saveTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginTop: spacing[2],
    marginBottom: spacing[2]
  },
  saveDescription: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[4] },
  actionButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[3]
  },
  actionButtonSuccess: { backgroundColor: colors.success[100], borderColor: colors.success[500] },
  actionButtonText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold as any, color: colors.text.primary },
  continueButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[3],
    marginBottom: spacing[8]
  },
  buttonText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold as any, color: colors.text.inverse },
});

export default SeedPhraseScreen;
