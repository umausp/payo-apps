import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../../types';
import { useWallet } from '../../hooks/useWallet';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { wallet, balance, fiatBalance, refreshBalance, isLoading } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Load balance on mount
    if (wallet?.address) {
      refreshBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.address]);

  // Refresh balance when screen comes into focus (after payment)
  useFocusEffect(
    useCallback(() => {
      if (wallet?.address) {
        refreshBalance();
      }
    }, [wallet?.address, refreshBalance])
  );

  const handleRefresh = useCallback(async () => {
    if (!wallet?.address) return;

    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [wallet?.address, refreshBalance]);

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

        <LinearGradient
          colors={colors.gradient.rainbow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceIconContainer}>
            <Icon name="account-balance-wallet" size={32} color="rgba(255,255,255,0.3)" />
          </View>
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
        </LinearGradient>

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
            <Text style={styles.actionText}>RECEIVE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="settings" size={24} color={colors.primary[500]} />
            <Text style={styles.actionText}>SETTINGS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickAccessSection}>
          {/* Transaction History Card */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <View style={styles.featureCardIcon}>
              <Icon name="history" size={32} color={colors.primary[500]} />
            </View>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureCardTitle}>Transaction History</Text>
              <Text style={styles.featureCardSubtitle}>
                View all your past transactions
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          {/* Connect Wallets Card */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.featureCardIcon}>
              <Icon name="account-balance-wallet" size={32} color={colors.primary[500]} />
            </View>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureCardTitle}>Connect Wallets</Text>
              <Text style={styles.featureCardSubtitle}>
                Link external wallets to your account
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '900' as any,
    color: colors.text.primary,
    padding: spacing[4],
    paddingBottom: spacing[3],
    letterSpacing: 0.5,
  },
  balanceCard: {
    margin: spacing[4],
    marginTop: 0,
    padding: spacing[8],
    borderRadius: 24,
    alignItems: 'center',
    elevation: 0,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceIconContainer: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
  },
  balanceLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '800' as any,
  },
  balance: {
    fontSize: 48,
    fontWeight: '900' as any,
    color: colors.text.inverse,
    marginBottom: spacing[2],
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    letterSpacing: -1,
  },
  fiatBalance: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as any,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
    elevation: 0,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700' as any,
    color: colors.text.primary,
    marginTop: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickAccessSection: {
    padding: spacing[4],
    paddingTop: 0,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[5],
    marginBottom: spacing[3],
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glass.border,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  featureCardIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  featureCardContent: {
    flex: 1,
  },
  featureCardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800' as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
    letterSpacing: 0.5,
  },
  featureCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
});

export default DashboardScreen;
