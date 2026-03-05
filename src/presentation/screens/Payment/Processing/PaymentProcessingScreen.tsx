import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TransactionStatus } from '../../../../types';
import { colors, spacing, typography } from '../../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PaymentProcessing'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PaymentProcessing'>;

const PaymentProcessingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { transaction } = route.params;

  useEffect(() => {
    // Simulate transaction confirmation
    setTimeout(() => {
      navigation.replace('PaymentSuccess', { transaction });
    }, 3000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
        <Text style={styles.title}>Processing Payment</Text>
        <Text style={styles.description}>
          Your transaction is being confirmed on the blockchain
        </Text>
        <Text style={styles.hash}>
          {transaction?.hash ? `${transaction.hash.slice(0, 10)}...${transaction.hash.slice(-8)}` : 'Processing...'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6]
  },
  loader: { marginBottom: spacing[8] },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center'
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6]
  },
  hash: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: 'monospace'
  },
});

export default PaymentProcessingScreen;
