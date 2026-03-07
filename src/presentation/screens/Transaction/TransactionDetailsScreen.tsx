import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../../types';
import BackButton from '../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { BLOCKCHAIN } from '../../../constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetails'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

interface GasDetails {
  gasUsed: string;
  effectiveGasPrice: string;
  gasFee: string;
}

const TransactionDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { transaction } = route.params;
  const [gasDetails, setGasDetails] = useState<GasDetails | null>(null);
  const [loadingGas, setLoadingGas] = useState(false);

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
        return 'Confirmed';
      case 'FAILED':
        return 'Failed';
      case 'PENDING':
        return 'Pending';
      default:
        return 'Submitted';
    }
  };

  const getStatusIcon = () => {
    const status = String(transaction.status).toUpperCase();
    switch (status) {
      case 'CONFIRMED':
        return 'check-circle';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'schedule';
      default:
        return 'send';
    }
  };

  const fetchGasDetails = async () => {
    if (!transaction.hash) return;

    setLoadingGas(true);
    try {
      const response = await fetch(BLOCKCHAIN.RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [transaction.hash],
          id: 1,
        }),
      });

      const data = await response.json();
      console.log('[TransactionDetails] Receipt data:', data.result);

      if (data.result) {
        const receipt = data.result;
        const gasUsed = parseInt(receipt.gasUsed, 16);
        const effectiveGasPrice = parseInt(receipt.effectiveGasPrice, 16);

        // Calculate gas fee using BigInt to avoid precision loss
        const gasFeeWei = BigInt(gasUsed) * BigInt(effectiveGasPrice);
        const gasFeeEth = Number(gasFeeWei) / 1e18;

        // Format gas fee with appropriate precision (show up to 9 decimals)
        let gasFeeFormatted = gasFeeEth.toFixed(9);
        // Remove trailing zeros
        gasFeeFormatted = gasFeeFormatted.replace(/\.?0+$/, '');
        // If result is empty or 0, show at least 0.000000001
        if (gasFeeFormatted === '' || gasFeeFormatted === '0') {
          gasFeeFormatted = '< 0.000000001';
        }

        console.log('[TransactionDetails] Gas calculation:', {
          gasUsed,
          effectiveGasPrice,
          gasFeeWei: gasFeeWei.toString(),
          gasFeeEth,
          gasFeeFormatted,
        });

        setGasDetails({
          gasUsed: gasUsed.toString(),
          effectiveGasPrice: (effectiveGasPrice / 1e9).toFixed(2), // Convert to Gwei
          gasFee: gasFeeFormatted,
        });
      }
    } catch (error) {
      console.error('Error fetching gas details:', error);
    } finally {
      setLoadingGas(false);
    }
  };

  useEffect(() => {
    if (transaction.status.toUpperCase() === 'CONFIRMED') {
      fetchGasDetails();
    }
  }, [transaction.hash, transaction.status]);

  const openInExplorer = async () => {
    if (!transaction.hash) {
      Alert.alert('Error', 'Transaction hash not available');
      return;
    }

    const url = `${BLOCKCHAIN.EXPLORER_URL}/tx/${transaction.hash}`;
    console.log('Opening explorer:', url);

    try {
      // Try to open directly without canOpenURL check (which can fail on some devices)
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening explorer:', error);
      Alert.alert(
        'Cannot Open Browser',
        'Please copy the transaction hash and view it manually on Etherscan.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRepay = () => {
    // Navigate to payment preview with pre-filled merchant address and amount
    navigation.navigate('PaymentPreview', {
      qrData: {
        address: transaction.to,
        amount: transaction.amount,
        merchantInfo: transaction.metadata?.merchantInfo || {
          name: 'Merchant',
          address: transaction.to,
        },
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Transaction Details</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Icon
              name={getStatusIcon()}
              size={48}
              color={getStatusColor()}
            />
          </View>
          <Text style={[styles.statusLabel, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
          <Text style={styles.amount}>{transaction.amount || '0'} PAYO</Text>
          {transaction.timestamp && (
            <View style={styles.timestampContainer}>
              <Icon name="access-time" size={16} color={colors.text.secondary} />
              <Text style={styles.timestamp}>
                {new Date(transaction.timestamp).toLocaleString()}
              </Text>
            </View>
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
          {transaction.metadata?.merchantInfo?.name && (
            <Text style={styles.merchantName}>
              {transaction.metadata.merchantInfo.name}
            </Text>
          )}
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

        {(loadingGas || gasDetails) && transaction.status.toUpperCase() === 'CONFIRMED' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Gas Information</Text>

            {loadingGas ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
                <Text style={styles.loadingText}>Loading gas details...</Text>
              </View>
            ) : gasDetails ? (
              <>
                <Text style={styles.label}>Gas Fee</Text>
                <Text style={styles.value}>{gasDetails.gasFee} ETH</Text>

                <Text style={styles.label}>Gas Used</Text>
                <Text style={styles.value}>{gasDetails.gasUsed}</Text>

                <Text style={styles.label}>Effective Gas Price</Text>
                <Text style={styles.value}>{gasDetails.effectiveGasPrice} Gwei</Text>
              </>
            ) : null}
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

        {transaction.to && (
          <TouchableOpacity onPress={handleRepay}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.repayButton}
            >
              <Icon name="replay" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
              <Text style={styles.repayButtonText}>Repay to Same Merchant</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {transaction.hash && (
          <TouchableOpacity style={styles.explorerButton} onPress={openInExplorer}>
            <Icon name="open-in-new" size={20} color={colors.primary[500]} style={styles.buttonIcon} />
            <Text style={styles.explorerButtonText}>View on Block Explorer</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: spacing[6] }} />
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
    padding: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900' as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    marginTop: spacing[2],
    letterSpacing: 0.5,
  },
  statusCard: {
    backgroundColor: colors.glass.background,
    borderRadius: 24,
    padding: spacing[8],
    marginBottom: spacing[4],
    alignItems: 'center',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  statusIconContainer: {
    marginBottom: spacing[4],
  },
  statusLabel: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800' as any,
    marginBottom: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  amount: {
    fontSize: 56,
    fontWeight: '900' as any,
    color: colors.text.primary,
    marginBottom: spacing[3],
    letterSpacing: -1,
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    fontWeight: '600' as any,
  },
  card: {
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    padding: spacing[5],
    marginBottom: spacing[4],
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800' as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  value: {
    fontSize: typography.fontSize.base,
    fontWeight: '500' as any,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.mono,
  },
  merchantName: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800' as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },
  repayButton: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[4],
    elevation: 0,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  repayButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '800' as any,
    color: colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  explorerButton: {
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary[500],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[3],
    elevation: 0,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  explorerButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '800' as any,
    color: colors.primary[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonIcon: {
    marginRight: spacing[2],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  loadingText: {
    marginLeft: spacing[2],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600' as any,
  },
});

export default TransactionDetailsScreen;
