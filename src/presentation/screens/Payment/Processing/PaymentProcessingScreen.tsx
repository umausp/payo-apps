import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList, TransactionStatus } from '../../../../types';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';

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
        <View style={styles.iconContainer}>
          <Icon name="hourglass-empty" size={80} color={colors.primary[500]} />
        </View>
        <ActivityIndicator size="large" color={colors.primary[500]} style={styles.loader} />
        <Text style={styles.title}>Processing Payment</Text>
        <Text style={styles.description}>
          Your transaction is being confirmed on the blockchain
        </Text>
        <View style={styles.hashContainer}>
          <Text style={styles.hashLabel}>TRANSACTION HASH</Text>
          <Text style={styles.hash}>
            {transaction?.hash ? `${transaction.hash.slice(0, 10)}...${transaction.hash.slice(-8)}` : 'Processing...'}
          </Text>
        </View>
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
  iconContainer: {
    marginBottom: spacing[6],
    opacity: 0.8,
  },
  loader: { marginBottom: spacing[8] },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900' as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8],
    fontWeight: '500' as any,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  hashContainer: {
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
  },
  hashLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    letterSpacing: 1.5,
    fontWeight: '800' as any,
  },
  hash: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.mono,
    fontWeight: '600' as any,
  },
});

export default PaymentProcessingScreen;
