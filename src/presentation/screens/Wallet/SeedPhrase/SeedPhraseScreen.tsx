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
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  warning: { fontSize: 14, color: '#EF4444', marginBottom: 24, padding: 16, backgroundColor: '#FEE2E2', borderRadius: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  wordContainer: { width: '48%', flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 12, backgroundColor: '#F3F4F6', borderRadius: 8 },
  wordNumber: { fontSize: 14, color: '#6B7280', marginRight: 8 },
  word: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
  saveTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 8, marginBottom: 8 },
  saveDescription: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  actionButton: { backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  actionButtonSuccess: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  continueButton: { backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12, marginBottom: 32 },
  buttonText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
});

export default SeedPhraseScreen;
