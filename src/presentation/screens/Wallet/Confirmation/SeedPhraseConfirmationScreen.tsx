import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import BackButton from '../../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import { VALIDATION } from '../../../../constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'SeedPhraseConfirmation'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'SeedPhraseConfirmation'>;

const SeedPhraseConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { seedPhrase } = route.params;
  
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const randomWords = [...seedPhrase].sort(() => Math.random() - 0.5);

  const handleWordPress = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleConfirm = () => {
    const isCorrect = selectedWords.every((word, index) => word === seedPhrase[index]);
    
    if (isCorrect && selectedWords.length === seedPhrase.length) {
      navigation.navigate('BiometricSetup');
    } else {
      Alert.alert('Incorrect Order', 'Please arrange the words in the correct order');
      setSelectedWords([]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Seed Phrase</Text>
        <Text style={styles.description}>Tap the words in the correct order</Text>

        <View style={styles.selectedContainer}>
          {selectedWords.length === 0 ? (
            <Text style={styles.placeholder}>Selected words will appear here</Text>
          ) : (
            selectedWords.map((word, index) => (
              <TouchableOpacity key={index} style={styles.selectedWord} onPress={() => handleWordPress(word)}>
                <Text style={styles.selectedWordText}>{word}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.wordsContainer}>
          {randomWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.word, selectedWords.includes(word) && styles.wordSelected]}
              onPress={() => handleWordPress(word)}
              disabled={selectedWords.includes(word)}
            >
              <Text style={[styles.wordText, selectedWords.includes(word) && styles.wordTextSelected]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, selectedWords.length !== seedPhrase.length && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={selectedWords.length !== seedPhrase.length}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: spacing[2]
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[6]
  },
  selectedContainer: {
    minHeight: 100,
    padding: spacing[4],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[6],
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  placeholder: { color: colors.text.tertiary },
  selectedWord: {
    padding: spacing[2],
    marginRight: spacing[2],
    marginBottom: spacing[2],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md
  },
  selectedWordText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium as any
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing[6]
  },
  word: {
    padding: spacing[3],
    margin: spacing[1],
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.md
  },
  wordSelected: { backgroundColor: colors.neutral[300] },
  wordText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary
  },
  wordTextSelected: { color: colors.text.tertiary },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center'
  },
  buttonDisabled: { backgroundColor: colors.neutral[300] },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse
  },
});

export default SeedPhraseConfirmationScreen;
