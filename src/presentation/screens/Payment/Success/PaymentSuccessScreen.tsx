import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
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
          icon: 'check-circle',
          title: 'Payment Confirmed!',
          subtitle: 'Your payment has been confirmed on the blockchain',
          color: colors.success[500],
        };
      case 'failed':
        return {
          icon: 'error',
          title: 'Payment Failed',
          subtitle: 'The transaction failed on the blockchain',
          color: colors.error[500],
        };
      case 'pending':
        return {
          icon: 'schedule',
          title: 'Payment Processing',
          subtitle: 'Waiting for blockchain confirmation...',
          color: colors.warning[500],
        };
      default:
        return {
          icon: 'send',
          title: 'Payment Submitted',
          subtitle: 'Your payment has been submitted to the network',
          color: colors.primary[500],
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <Icon name={statusInfo.icon} size={64} color={statusInfo.color} style={styles.statusIcon} />
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
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Icon name="home" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>BACK TO DASHBOARD</Text>
          </LinearGradient>
        </TouchableOpacity>

        {txStatus.txHash && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={async () => {
              const explorerUrl = `${BLOCKCHAIN.EXPLORER_URL}/tx/${txStatus.txHash}`;
              console.log('[PaymentSuccess] Opening block explorer:', explorerUrl);
              try {
                await Linking.openURL(explorerUrl);
              } catch (error) {
                console.error('[PaymentSuccess] Failed to open browser:', error);
              }
            }}
          >
            <Icon name="open-in-new" size={20} color={colors.primary[500]} style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>VIEW ON BLOCK EXPLORER</Text>
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
    padding: spacing[4],
    paddingBottom: spacing[10],
  },

  // Status Header
  statusHeader: {
    backgroundColor: colors.glass.background,
    borderRadius: 24,
    padding: spacing[8],
    marginBottom: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 0,
  },
  statusIcon: {
    marginBottom: spacing[4],
  },
  statusTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '900' as any,
    marginBottom: spacing[3],
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[2],
    fontWeight: '500' as any,
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  pollingText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700' as any,
    marginLeft: spacing[2],
  },

  // Amount Card
  amountCard: {
    backgroundColor: colors.glass.background,
    borderRadius: 24,
    padding: spacing[8],
    marginBottom: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 0,
  },
  amountLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '800' as any,
  },
  amount: {
    fontSize: 56,
    fontWeight: '900' as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
    letterSpacing: -1,
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  merchantName: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    fontWeight: '600' as any,
  },

  // Card
  card: {
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    padding: spacing[5],
    marginBottom: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800' as any,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  confirmationBadge: {
    backgroundColor: 'rgba(0, 255, 163, 0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.success[500],
  },
  confirmationText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800' as any,
    color: colors.success[500],
    letterSpacing: 0.5,
  },

  // Detail Row
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '700' as any,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500' as any,
    flex: 1.5,
    textAlign: 'right',
    fontFamily: typography.fontFamily.mono,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800' as any,
    letterSpacing: 0.5,
  },

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[6],
    marginBottom: spacing[3],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '800' as any,
    color: colors.text.inverse,
    letterSpacing: 1.5,
  },
  secondaryButton: {
    backgroundColor: colors.glass.background,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.full,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 0,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '800' as any,
    color: colors.primary[500],
    letterSpacing: 1,
  },
  buttonIcon: {
    marginRight: spacing[2],
  },
});

export default PaymentSuccessScreen;
