import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../../types';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import ApiService from '../../../../infrastructure/api/ApiService';
import { BLOCKCHAIN } from '../../../../constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PaymentSuccess'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;

interface TransactionStatus {
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  blockNumber?: number;
  confirmations?: number;
}

const PaymentSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { transaction } = route.params;

  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    status: transaction?.status || 'submitted',
    txHash: transaction?.hash,
    blockNumber: transaction?.blockNumber,
  });
  const [isPolling, setIsPolling] = useState(true);

  // Poll transaction status from backend
  useEffect(() => {
    const transactionId = (transaction as any)?.transactionId;

    if (!transactionId) {
      console.log('[PaymentSuccess] No transaction ID, stopping polling');
      setIsPolling(false);
      return;
    }

    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        console.log('[PaymentSuccess] Checking transaction status:', transactionId);
        const response = await ApiService.getTransactionById(transactionId);

        if (response.success && response.data) {
          const tx = response.data.transaction;
          console.log('[PaymentSuccess] Status update:', tx.status, 'Block:', tx.blockNumber);

          setTxStatus({
            status: tx.status,
            txHash: tx.txHash,
            blockNumber: tx.blockNumber,
            confirmations: tx.confirmations,
          });

          // Stop polling if confirmed or failed
          if (tx.status === 'confirmed' || tx.status === 'failed') {
            console.log('[PaymentSuccess] Final status reached, stopping polling');
            setIsPolling(false);
            if (pollInterval) clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('[PaymentSuccess] Failed to check transaction status:', error);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 5 seconds if not final state
    if (txStatus.status !== 'confirmed' && txStatus.status !== 'failed') {
      console.log('[PaymentSuccess] Starting status polling (every 5s)');
      pollInterval = setInterval(checkStatus, 5000);
    }

    return () => {
      if (pollInterval) {
        console.log('[PaymentSuccess] Cleaning up polling interval');
        clearInterval(pollInterval);
      }
    };
  }, [(transaction as any)?.transactionId, txStatus.status]);

  const getStatusInfo = () => {
    switch (txStatus.status) {
      case 'confirmed':
        return {
          icon: '✅',
          title: 'Payment Confirmed!',
          subtitle: 'Your payment has been confirmed on the blockchain',
          color: colors.success[500],
          bgColor: colors.success[50],
        };
      case 'failed':
        return {
          icon: '❌',
          title: 'Payment Failed',
          subtitle: 'The transaction failed on the blockchain',
          color: colors.error[500],
          bgColor: colors.error[50],
        };
      case 'pending':
        return {
          icon: '⏳',
          title: 'Payment Processing',
          subtitle: 'Waiting for blockchain confirmation...',
          color: colors.warning[500],
          bgColor: colors.warning[50],
        };
      default:
        return {
          icon: '📤',
          title: 'Payment Submitted',
          subtitle: 'Your payment has been submitted to the network',
          color: colors.primary[500],
          bgColor: colors.primary[50],
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Status Header */}
        <View style={[styles.statusHeader, { backgroundColor: statusInfo.bgColor }]}>
          <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.title}
          </Text>
          <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>

          {isPolling && (
            <View style={styles.pollingIndicator}>
              <ActivityIndicator size="small" color={statusInfo.color} />
              <Text style={[styles.pollingText, { color: statusInfo.color }]}>
                Checking status...
              </Text>
            </View>
          )}
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Sent</Text>
          <Text style={styles.amount}>{transaction.amount} PAYO</Text>
          {transaction?.metadata?.merchantInfo?.name && (
            <Text style={styles.merchantName}>
              to {transaction.metadata.merchantInfo.name}
            </Text>
          )}
        </View>

        {/* Transaction Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Transaction Details</Text>
            {txStatus.confirmations !== undefined && txStatus.confirmations > 0 && (
              <View style={styles.confirmationBadge}>
                <Text style={styles.confirmationText}>
                  {txStatus.confirmations} {txStatus.confirmations === 1 ? 'confirmation' : 'confirmations'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Hash</Text>
            <Text style={styles.detailValue} selectable>
              {txStatus.txHash ? `${txStatus.txHash.slice(0, 10)}...${txStatus.txHash.slice(-8)}` : 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>From</Text>
            <Text style={styles.detailValue} selectable>
              {transaction?.from ? `${transaction.from.slice(0, 10)}...${transaction.from.slice(-8)}` : 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To</Text>
            <Text style={styles.detailValue} selectable>
              {transaction?.to ? `${transaction.to.slice(0, 10)}...${transaction.to.slice(-8)}` : 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                {txStatus.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {transaction?.timestamp && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.timestamp).toLocaleString()}
              </Text>
            </View>
          )}

          {txStatus.blockNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Block Number</Text>
              <Text style={styles.detailValue}>#{txStatus.blockNumber}</Text>
            </View>
          )}
        </View>

        {/* Gas Details Card */}
        {transaction?.gasFee && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gas Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gas Fee</Text>
              <Text style={styles.detailValue}>
                {parseFloat(transaction.gasFee).toFixed(6)} ETH
              </Text>
            </View>

            {transaction?.gasPrice && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gas Price</Text>
                <Text style={styles.detailValue}>
                  {parseFloat(transaction.gasPrice).toFixed(2)} Gwei
                </Text>
              </View>
            )}

            {transaction?.gasLimit && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Gas Limit</Text>
                <Text style={styles.detailValue}>{transaction.gasLimit}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {txStatus.txHash && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              const explorerUrl = `${BLOCKCHAIN.EXPLORER_URL}/tx/${txStatus.txHash}`;
              console.log('[PaymentSuccess] Opening block explorer:', explorerUrl);
              // TODO: Linking.openURL(explorerUrl);
            }}
          >
            <Text style={styles.secondaryButtonText}>View on Block Explorer</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
    paddingBottom: spacing[10],
  },

  // Status Header
  statusHeader: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[8],
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  statusTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[2],
  },
  pollingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    marginLeft: spacing[2],
  },

  // Amount Card
  amountCard: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    opacity: 0.8,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amount: {
    fontSize: 42,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.inverse,
    marginBottom: spacing[2],
  },
  merchantName: {
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
    opacity: 0.9,
  },

  // Card
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  confirmationBadge: {
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  confirmationText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.success[700],
  },

  // Detail Row
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium as any,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold as any,
    flex: 1.5,
    textAlign: 'right',
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: borderRadius.md,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold as any,
    letterSpacing: 0.5,
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[3],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[3.5],
    paddingHorizontal: spacing[8],
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.secondary,
  },
});

export default PaymentSuccessScreen;
