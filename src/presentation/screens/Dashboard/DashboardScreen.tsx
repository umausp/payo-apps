import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../../types';
import { useWallet } from '../../hooks/useWallet';
import { useTransactions } from '../../hooks/useTransactions';
import { useAppDispatch } from '../../hooks/useRedux';
import { loadTransactions, refreshTransactions } from '../../store/slices/transactionSlice';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { wallet, balance, fiatBalance, refreshBalance, isLoading } = useWallet();
  const { transactions } = useTransactions();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gasPrice, setGasPrice] = useState<string | null>(null);

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA; // Descending order (newest first)
  });

  useEffect(() => {
    // Load balance, transactions, and gas price on mount
    if (wallet?.address) {
      refreshBalance();
      dispatch(loadTransactions(wallet.address));
      fetchGasPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.address]);

  // Refresh transactions when screen comes into focus (after payment)
  useFocusEffect(
    useCallback(() => {
      if (wallet?.address) {
        dispatch(refreshTransactions(wallet.address));
        refreshBalance();
      }
    }, [wallet?.address, dispatch, refreshBalance])
  );

  const fetchGasPrice = async () => {
    try {
      const ApiService = (await import('../../../infrastructure/api/ApiService')).default;
      const response = await ApiService.getGasPrice();
      if (response.success) {
        const gasPriceGwei = (BigInt(response.data!.gasPriceWei) / BigInt(10 ** 9)).toString();
        setGasPrice(gasPriceGwei);
      }
    } catch (error) {
      console.error('Failed to fetch gas price:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!wallet?.address) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshBalance(),
        dispatch(refreshTransactions(wallet.address)).unwrap(),
        fetchGasPrice(),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [wallet?.address, refreshBalance, dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        <Text style={styles.title}>PAYO Wallet</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          {isLoading && !balance ? (
            <Text style={styles.balance}>Loading...</Text>
          ) : (
            <>
              <Text style={styles.balance}>
                {parseFloat(balance || '0').toFixed(2)} PAYO
              </Text>
              <Text style={styles.fiatBalance}>≈ ${fiatBalance} USD</Text>
            </>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wallet Address</Text>
            <Text style={styles.infoValue}>
              {wallet?.address.slice(0, 6)}...{wallet?.address.slice(-4)}
            </Text>
          </View>
          {gasPrice && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Network Gas</Text>
              <Text style={styles.infoValue}>{gasPrice} Gwei</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <Icon name="call-made" size={24} color={colors.primary[500]} />
            <Text style={styles.actionText}>SEND</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Receive')}
          >
            <Icon name="call-received" size={24} color={colors.primary[500]} />
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="settings" size={24} color={colors.primary[500]} />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              {sortedTransactions.length > 0 && (
                <Text style={styles.txCount}>
                  ({sortedTransactions.length})
                </Text>
              )}
            </View>
            {sortedTransactions.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('TransactionHistory')}
              >
                <Text style={styles.viewAllText}>View All →</Text>
              </TouchableOpacity>
            )}
          </View>
          {sortedTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Scan a QR code to make your first payment
              </Text>
            </View>
          ) : (
            sortedTransactions.slice(0, 5).map((tx, index) => {
              const status = String(tx.status).toUpperCase();
              const statusColor =
                status === 'CONFIRMED'
                  ? colors.success[500]
                  : status === 'FAILED'
                  ? colors.error[500]
                  : colors.warning[500];

              const statusLabel =
                status === 'CONFIRMED'
                  ? 'Confirmed'
                  : status === 'FAILED'
                  ? 'Failed'
                  : status === 'PENDING'
                  ? 'Pending'
                  : 'Submitted';

              const statusIcon =
                status === 'CONFIRMED'
                  ? 'check-circle'
                  : status === 'FAILED'
                  ? 'error'
                  : status === 'PENDING'
                  ? 'schedule'
                  : 'send';

              return (
                <TouchableOpacity
                  key={tx.id || index}
                  style={styles.transactionItem}
                  onPress={() => navigation.navigate('TransactionDetails', { transaction: tx })}
                >
                  <Icon name="account-balance-wallet" size={40} color={colors.primary[500]} />
                  <View style={styles.txMiddle}>
                    <Text style={styles.txAmount}>{tx.amount || '0'} PAYO</Text>
                    <Text style={styles.txAddress}>
                      {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Unknown'}
                    </Text>
                  </View>
                  <View style={styles.txRight}>
                    <View style={styles.txStatusContainer}>
                      <Icon name={statusIcon} size={16} color={statusColor} />
                      <Text style={[styles.txStatus, { color: statusColor }]}>
                        {statusLabel}
                      </Text>
                    </View>
                    {tx.timestamp && (
                      <Text style={styles.txDate}>
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    padding: spacing[4],
    paddingBottom: spacing[3],
  },
  balanceCard: {
    margin: spacing[4],
    marginTop: 0,
    padding: spacing[6],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[100],
    marginBottom: spacing[2]
  },
  balance: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.inverse,
    marginBottom: spacing[1]
  },
  fiatBalance: {
    fontSize: typography.fontSize.lg,
    color: colors.primary[200]
  },
  infoCard: {
    marginHorizontal: spacing[6],
    marginBottom: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  actionButton: {
    flex: 1,
    padding: spacing[3],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
    marginTop: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionsSection: {
    padding: spacing[4],
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing[2],
  },
  viewAllButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  viewAllText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.primary[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    marginBottom: spacing[2],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  txMiddle: {
    flex: 1,
    marginLeft: spacing[3],
  },
  txAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  txAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  txStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium as any,
    marginLeft: spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  txDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

export default DashboardScreen;
