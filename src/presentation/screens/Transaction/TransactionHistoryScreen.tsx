import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList, Transaction } from '../../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'TransactionHistory'>;

const ITEMS_PER_PAGE = 10;

const TransactionHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { transactions, refreshTransactions, isLoading } = useTransactions();

  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  // Load initial transactions
  useEffect(() => {
    loadInitialTransactions();
  }, [transactions]);

  const loadInitialTransactions = () => {
    const initialItems = sortedTransactions.slice(0, ITEMS_PER_PAGE);
    setDisplayedTransactions(initialItems);
    setPage(1);
    setHasMore(sortedTransactions.length > ITEMS_PER_PAGE);
  };

  const loadMoreTransactions = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = sortedTransactions.slice(startIndex, endIndex);

      if (newItems.length > 0) {
        setDisplayedTransactions((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(endIndex < sortedTransactions.length);
      } else {
        setHasMore(false);
      }

      setIsLoadingMore(false);
    }, 500);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshTransactions();
      loadInitialTransactions();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTransactions]);

  const renderTransactionItem = ({ item: tx }: { item: Transaction }) => {
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
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
        <Text style={styles.footerText}>Loading more transactions...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions yet</Text>
        <Text style={styles.emptySubtext}>
          Your transaction history will appear here
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          Showing {displayedTransactions.length} of {sortedTransactions.length} transactions
        </Text>
      </View>

      <FlatList
        data={displayedTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item, index) => item.id || `tx-${index}`}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMoreTransactions}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: spacing[2],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  statsBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.background.primary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  statsText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: spacing[4],
    flexGrow: 1,
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
  footerLoader: {
    paddingVertical: spacing[6],
    alignItems: 'center',
  },
  footerText: {
    marginTop: spacing[2],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen;
