import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PaymentSuccess'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;

const PaymentSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { transaction } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.amount}>{transaction.amount} PAYO</Text>
        
        <View style={styles.details}>
          <Text style={styles.label}>Transaction Hash</Text>
          <Text style={styles.value}>
            {transaction?.hash ? `${transaction.hash.slice(0, 10)}...${transaction.hash.slice(-8)}` : 'N/A'}
          </Text>

          <Text style={styles.label}>To</Text>
          <Text style={styles.value}>
            {transaction?.to ? `${transaction.to.slice(0, 10)}...${transaction.to.slice(-8)}` : 'N/A'}
          </Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{transaction?.status || 'Unknown'}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
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
  icon: { fontSize: 80, marginBottom: spacing[6] },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[4]
  },
  amount: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary[500],
    marginBottom: spacing[8]
  },
  details: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[8]
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    marginTop: spacing[4]
  },
  value: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    alignItems: 'center'
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse
  },
});

export default PaymentSuccessScreen;
