import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../../../types';
import { useTransactions } from '../../../hooks/useTransactions';
import { useAppSelector } from '../../../hooks/useRedux';
import BackButton from '../../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../../theme/tokens';
import TransactionRepository from '../../../../data/repositories/TransactionRepository';
import TokenApprovalService from '../../../../infrastructure/blockchain/TokenApprovalService';
import WalletRepository from '../../../../data/repositories/WalletRepository';
import { ApproveTokenUseCase } from '../../../../domain/useCases/ApproveTokenUseCase';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PaymentPreview'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PaymentPreview'>;

const PaymentPreviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { qrData } = route.params;
  const { send, isSending, currentTransaction, clearCurrent } = useTransactions();
  const wallet = useAppSelector(state => state.wallet.wallet);
  const [amount, setAmount] = useState(qrData.amount || '');
  const [gasEstimate, setGasEstimate] = useState<{gasPrice: string; gasLimit: string; gasFee: string} | null>(null);
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);
  const [gasRefreshTimer, setGasRefreshTimer] = useState(30); // 30 second countdown
  const [hasApproval, setHasApproval] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Clear previous transaction when screen loads
  useEffect(() => {
    console.log('[PaymentPreview] Screen mounted, clearing previous transaction');
    clearCurrent();
  }, []);

  // Navigate to processing screen when new transaction is created
  useEffect(() => {
    if (currentTransaction && !hasNavigated) {
      console.log('[PaymentPreview] New transaction detected, navigating to processing');
      setHasNavigated(true);
      navigation.navigate('PaymentProcessing', { transaction: currentTransaction });
    }
  }, [currentTransaction, hasNavigated]);

  // Function to estimate gas
  const estimateGas = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setGasEstimate(null);
      return;
    }

    setIsEstimatingGas(true);
    try {
      const estimate = await TransactionRepository.estimateGas(qrData.address, amount);
      setGasEstimate(estimate);
      setGasRefreshTimer(30); // Reset timer after successful estimate
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      // Fallback to default estimate
      setGasEstimate({ gasPrice: '50', gasLimit: '100000', gasFee: '0.001' });
      setGasRefreshTimer(30);
    } finally {
      setIsEstimatingGas(false);
    }
  };

  // Function to check token approval
  const checkApproval = async () => {
    if (!amount || parseFloat(amount) <= 0 || !wallet) {
      return;
    }

    setIsCheckingApproval(true);
    try {
      const status = await TokenApprovalService.checkApproval(wallet.address, amount);
      setHasApproval(status.hasApproval);
      console.log('[PaymentPreview] Approval status:', status);
    } catch (error) {
      console.error('Failed to check approval:', error);
      setHasApproval(false);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  // Function to approve token spending
  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const useCase = new ApproveTokenUseCase(WalletRepository);
      const result = await useCase.execute();
      setApprovalTxHash(result.txHash);
      setHasApproval(true);
      Alert.alert('Success', 'PAYO tokens approved! You can now make payments.', [
        { text: 'OK', onPress: () => console.log('Approval confirmed') }
      ]);
    } catch (error) {
      console.error('Approval failed:', error);
      Alert.alert('Approval Failed', error instanceof Error ? error.message : 'Failed to approve tokens');
    } finally {
      setIsApproving(false);
    }
  };

  // Estimate gas and check approval when amount changes (debounced)
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setGasEstimate(null);
      setHasApproval(false);
      return;
    }

    const timer = setTimeout(() => {
      estimateGas();
      checkApproval();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [amount, qrData.address]);

  // Auto-refresh gas estimate every 30 seconds
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) return;

    const refreshInterval = setInterval(() => {
      estimateGas();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [amount, qrData.address]);

  // Countdown timer for gas refresh
  useEffect(() => {
    if (!gasEstimate) return;

    const countdownInterval = setInterval(() => {
      setGasRefreshTimer(prev => {
        if (prev <= 1) {
          return 30; // Reset will happen via the refresh interval above
        }
        return prev - 1;
      });
    }, 1000); // 1 second

    return () => clearInterval(countdownInterval);
  }, [gasEstimate]);

  const handleConfirm = async () => {
    try {
      await send(qrData.address, amount, { merchantInfo: qrData.merchantInfo });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const hasInsufficientBalance = !!(wallet && amount && parseFloat(amount) > parseFloat(wallet.balance));
  const hasInsufficientGas = !!(wallet && gasEstimate && parseFloat(wallet.nativeBalance || '0') < parseFloat(gasEstimate.gasFee));

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Payment Preview</Text>

        <View style={styles.card}>
          {qrData?.merchantInfo?.name && (
            <>
              <Text style={styles.label}>Merchant Name</Text>
              <Text style={styles.merchantName}>{qrData.merchantInfo.name}</Text>
            </>
          )}

          <Text style={styles.label}>Recipient Wallet</Text>
          <Text style={styles.value}>
            {qrData?.address ? `${qrData.address.slice(0, 10)}...${qrData.address.slice(-8)}` : 'Unknown'}
          </Text>

          <Text style={styles.label}>Amount (PAYO)</Text>
          <TextInput
            style={[styles.input, hasInsufficientBalance && styles.inputError]}
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            editable={!isSending}
            autoFocus={!qrData.amount}
          />
          {hasInsufficientBalance && (
            <Text style={styles.errorText}>Insufficient PAYO balance</Text>
          )}

          <View style={styles.gasHeader}>
            <Text style={styles.label}>Gas Fee</Text>
            {gasEstimate && !isEstimatingGas && (
              <View style={styles.refreshTimerContainer}>
                <Icon name="refresh" size={12} color={colors.primary[500]} />
                <Text style={styles.refreshTimer}> {gasRefreshTimer}s</Text>
              </View>
            )}
          </View>
          <View style={styles.row}>
            {isEstimatingGas ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={[styles.value, hasInsufficientGas && styles.valueError]}>
                {gasEstimate ? `~${parseFloat(gasEstimate.gasFee).toFixed(6)} ETH` : '~0.001 ETH'}
              </Text>
            )}
          </View>
          {hasInsufficientGas && (
            <Text style={styles.errorText}>Insufficient ETH for gas</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.label}>Your Balances</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>PAYO:</Text>
            <Text style={[styles.balanceValue, hasInsufficientBalance && styles.valueError]}>
              {wallet ? parseFloat(wallet.balance).toFixed(2) : '0.00'} PAYO
            </Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>ETH (Gas):</Text>
            <Text style={[styles.balanceValue, hasInsufficientGas && styles.valueError]}>
              {wallet ? parseFloat(wallet.nativeBalance || '0').toFixed(6) : '0.000000'} ETH
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Token Approval</Text>
          <View style={styles.approvalRow}>
            {isCheckingApproval ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <>
                <Icon
                  name={hasApproval ? 'check-circle' : 'cancel'}
                  size={20}
                  color={hasApproval ? colors.success[500] : colors.error[500]}
                />
                <Text style={[styles.approvalStatus, hasApproval && styles.approvalStatusSuccess]}>
                  {hasApproval ? ' Approved' : ' Not Approved'}
                </Text>
              </>
            )}
          </View>
          {!hasApproval && amount && (
            <Text style={styles.approvalNote}>
              You need to approve PAYO token spending before making payments.
            </Text>
          )}
        </View>

        {!hasApproval && amount && !hasInsufficientBalance && (
          <TouchableOpacity
            onPress={handleApprove}
            disabled={isApproving || hasInsufficientBalance}
          >
            <LinearGradient
              colors={isApproving ? [colors.neutral[500], colors.neutral[600]] : [colors.warning[500], colors.warning[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Icon name="verified-user" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                {isApproving ? 'APPROVING...' : 'APPROVE PAYO TOKEN'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isSending || !amount || hasInsufficientBalance || hasInsufficientGas || !hasApproval}
        >
          <LinearGradient
            colors={
              (isSending || !amount || hasInsufficientBalance || hasInsufficientGas || !hasApproval)
                ? [colors.neutral[600], colors.neutral[700]]
                : [colors.primary[500], colors.primary[600]]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Icon name="send" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {isSending ? 'PROCESSING...' :
               hasInsufficientBalance ? 'INSUFFICIENT PAYO' :
               hasInsufficientGas ? 'INSUFFICIENT ETH FOR GAS' :
               !hasApproval ? 'PLEASE APPROVE TOKEN FIRST' :
               'CONFIRM PAYMENT'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1 },
  scrollContent: { padding: spacing[4], paddingBottom: spacing[8] },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900' as any,
    color: colors.text.primary,
    marginBottom: spacing[6],
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    padding: spacing[5],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 0,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    marginTop: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700' as any,
  },
  gasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  refreshTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  refreshTimer: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[500],
    fontWeight: '800' as any,
  },
  merchantName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '900' as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },
  value: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600' as any,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.mono,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    fontWeight: '700' as any,
  },
  inputError: {
    borderColor: colors.error[500],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    marginTop: spacing[2],
    fontWeight: '600' as any,
  },
  valueError: {
    color: colors.error[500],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.medium,
    marginVertical: spacing[5],
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing[2],
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600' as any,
  },
  balanceValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '700' as any,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.mono,
  },
  button: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: spacing[2],
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '800' as any,
    color: colors.text.inverse,
    letterSpacing: 1,
  },
  cancelButton: {
    padding: spacing[3],
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '700' as any,
    letterSpacing: 1,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalStatus: {
    fontSize: typography.fontSize.base,
    fontWeight: '800' as any,
    color: colors.error[500],
    marginLeft: spacing[1],
  },
  approvalStatusSuccess: {
    color: colors.success[500],
  },
  approvalNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[3],
    fontWeight: '500' as any,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

export default PaymentPreviewScreen;
