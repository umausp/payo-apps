import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types';
import BackButton from '../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { BLOCKCHAIN } from '../../../constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetails'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

const TransactionDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { transaction } = route.params;

  const getStatusColor = () => {
    const status = String(transaction.status).toUpperCase();
    switch (status) {
      case 'CONFIRMED':
        return colors.success[500];
      case 'FAILED':
        return colors.error[500];
      case 'PENDING':
        return colors.warning[500];
      default:
        return colors.text.secondary;
    }
  };

  const getStatusLabel = () => {
    const status = String(transaction.status).toUpperCase();
    switch (status) {
      case 'CONFIRMED':
        return '✓ Confirmed';
      case 'FAILED':
        return '✗ Failed';
      case 'PENDING':
        return '⏳ Pending';
      default:
        return '📤 Submitted';
    }
  };

  const openInExplorer = () => {
    if (transaction.hash) {
      const url = `${BLOCKCHAIN.EXPLORER_URL}/tx/${transaction.hash}`;
      console.log('Opening explorer:', url);
      // TODO: Open in browser
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Transaction Details</Text>

        <View style={styles.statusCard}>
          <Text style={[styles.statusLabel, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
          <Text style={styles.amount}>{transaction.amount || '0'} PAYO</Text>
          {transaction.timestamp && (
            <Text style={styles.timestamp}>
              {new Date(transaction.timestamp).toLocaleString()}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>

          <Text style={styles.label}>Transaction Hash</Text>
          <Text style={styles.value} selectable>
            {transaction.hash || 'N/A'}
          </Text>

          <Text style={styles.label}>From</Text>
          <Text style={styles.value} selectable>
            {transaction.from || 'N/A'}
          </Text>

          <Text style={styles.label}>To</Text>
          <Text style={styles.value} selectable>
            {transaction.to || 'N/A'}
          </Text>

          {transaction.blockNumber && (
            <>
              <Text style={styles.label}>Block Number</Text>
              <Text style={styles.value}>#{transaction.blockNumber}</Text>
            </>
          )}

          {transaction.type && (
            <>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.value}>{transaction.type}</Text>
            </>
          )}
        </View>

        {(transaction.gasPrice || transaction.gasLimit || transaction.gasFee) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Gas Information</Text>

            {transaction.gasFee && (
              <>
                <Text style={styles.label}>Gas Fee</Text>
                <Text style={styles.value}>
                  {parseFloat(transaction.gasFee).toFixed(6)} ETH
                </Text>
              </>
            )}

            {transaction.gasPrice && (
              <>
                <Text style={styles.label}>Gas Price</Text>
                <Text style={styles.value}>
                  {parseFloat(transaction.gasPrice).toFixed(2)} Gwei
                </Text>
              </>
            )}

            {transaction.gasLimit && (
              <>
                <Text style={styles.label}>Gas Limit</Text>
                <Text style={styles.value}>{transaction.gasLimit}</Text>
              </>
            )}
          </View>
        )}

        {transaction.metadata?.merchantInfo && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Merchant Information</Text>

            {transaction.metadata.merchantInfo.name && (
              <>
                <Text style={styles.label}>Merchant Name</Text>
                <Text style={styles.value}>{transaction.metadata.merchantInfo.name}</Text>
              </>
            )}

            {transaction.metadata.merchantInfo.address && (
              <>
                <Text style={styles.label}>Merchant Address</Text>
                <Text style={styles.value} selectable>
                  {transaction.metadata.merchantInfo.address}
                </Text>
              </>
            )}
          </View>
        )}

        {transaction.hash && (
          <TouchableOpacity style={styles.explorerButton} onPress={openInExplorer}>
            <Text style={styles.explorerButtonText}>View on Block Explorer</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: spacing[6] }} />
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
    marginBottom: spacing[6]
  },
  statusCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[6],
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing[2]
  },
  amount: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary[500],
    marginBottom: spacing[2]
  },
  timestamp: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[4]
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[4]
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    marginTop: spacing[3]
  },
  value: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary
  },
  explorerButton: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4]
  },
  explorerButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.primary[500]
  },
});

export default TransactionDetailsScreen;
