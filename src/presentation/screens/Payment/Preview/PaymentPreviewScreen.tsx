import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import { useTransactions } from '../../../hooks/useTransactions';
import BackButton from '../../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PaymentPreview'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PaymentPreview'>;

const PaymentPreviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { qrData } = route.params;
  const { send, isSending, currentTransaction } = useTransactions();
  const [amount, setAmount] = useState(qrData.amount || '');

  useEffect(() => {
    if (currentTransaction) {
      navigation.navigate('PaymentProcessing', { transaction: currentTransaction });
    }
  }, [currentTransaction]);

  const handleConfirm = async () => {
    try {
      await send(qrData.address, amount, { merchantInfo: qrData.merchantInfo });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text style={styles.title}>Payment Preview</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Recipient</Text>
          <Text style={styles.value}>
            {qrData?.address ? `${qrData.address.slice(0, 10)}...${qrData.address.slice(-8)}` : 'Unknown'}
          </Text>

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gas Fee</Text>
          <Text style={styles.value}>~0.001 MATIC</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isSending && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={isSending || !amount}
        >
          <Text style={styles.buttonText}>
            {isSending ? 'Processing...' : 'Confirm Payment'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
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
    marginBottom: spacing[6]
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[6]
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    marginTop: spacing[4]
  },
  value: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.fontSize.lg,
    color: colors.text.primary
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[4]
  },
  buttonDisabled: { backgroundColor: colors.neutral[300] },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    textAlign: 'center'
  },
});

export default PaymentPreviewScreen;
