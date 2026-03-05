import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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

  useEffect(() => {
    // Load balance, transactions, and gas price on mount
    if (wallet?.address) {
      refreshBalance();
      dispatch(loadTransactions(wallet.address));
      fetchGasPrice();
    }
  }, [wallet?.address]);

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
            <Text style={styles.actionText}>📷 Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Receive')}
          >
            <Text style={styles.actionText}>⬇️ Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length > 0 && (
              <Text style={styles.txCount}>({transactions.length})</Text>
            )}
          </View>
          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Scan a QR code to make your first payment
              </Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((tx, index) => {
              const statusColor =
                tx.status === 'confirmed'
                  ? colors.success[500]
                  : tx.status === 'failed'
                  ? colors.error[500]
                  : colors.warning[500];

              const statusLabel =
                tx.status === 'confirmed'
                  ? '✓ Confirmed'
                  : tx.status === 'failed'
                  ? '✗ Failed'
                  : tx.status === 'pending'
                  ? '⏳ Pending'
                  : '📤 Submitted';

              return (
                <View key={tx.id || index} style={styles.transactionItem}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txAmount}>{tx.amount || '0'} USDC</Text>
                    <Text style={styles.txAddress}>
                      To: {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : 'Unknown'}
                    </Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txStatus, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                    {tx.timestamp && (
                      <Text style={styles.txDate}>
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { flex: 1 },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    padding: spacing[6],
    paddingBottom: spacing[4]
  },
  balanceCard: {
    margin: spacing[6],
    marginTop: 0,
    padding: spacing[6],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.xl,
    alignItems: 'center'
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
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6]
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing[1],
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary
  },
  transactionsSection: {
    padding: spacing[6],
    paddingTop: 0
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  txCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    marginBottom: spacing[2],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  txLeft: {
    flex: 1,
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
  txStatus: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    marginBottom: spacing[1],
  },
  txDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

export default DashboardScreen;
