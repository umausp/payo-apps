/**
 * Connect Wallet Screen
 * Full screen for managing external wallet connections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { usePayoWallet } from '../../hooks/usePayoWallet';
import BackButton from '../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { SUPPORTED_WALLETS } from '../../../infrastructure/web3/Web3Config';

const ConnectWalletScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    isConnected,
    isConnecting,
    displayName,
    formattedBalance,
    chainId,
    isCorrectChain,
    connect,
    disconnect,
    switchToCorrectChain,
    error,
  } = usePayoWallet();

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Handle wallet connection - just open the modal, that's it!
  const handleConnect = async () => {
    try {
      console.log('[ConnectWallet] Opening AppKit modal...');
      await connect(); // This opens the AppKit modal
      // No need for success alert - AppKit handles the UX
    } catch (err) {
      console.error('[ConnectWallet] Failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Connection Error', errorMsg);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your external wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDisconnecting(true);
              disconnect();
              Alert.alert('Disconnected', 'Your wallet has been disconnected 👋');
            } catch (err) {
              console.error('[ConnectWallet] Disconnect failed:', err);
              Alert.alert('Error', 'Failed to disconnect wallet');
            } finally {
              setIsDisconnecting(false);
            }
          },
        },
      ]
    );
  };

  // Handle network switch
  const handleSwitchNetwork = async () => {
    try {
      await switchToCorrectChain();
      Alert.alert('Success', 'Network switched successfully! ✅');
    } catch (err) {
      console.error('[ConnectWallet] Switch network failed:', err);
    }
  };

  // Open wallet app
  const openWalletApp = async (deepLink: string, downloadUrl: string) => {
    try {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
      } else {
        // Wallet not installed, open download page
        Alert.alert(
          'Wallet Not Found',
          'This wallet is not installed. Want to download it?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Download',
              onPress: () => Linking.openURL(downloadUrl),
            },
          ]
        );
      }
    } catch (err) {
      console.error('[ConnectWallet] Failed to open wallet:', err);
      Alert.alert('Error', 'Could not open wallet app');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>CONNECT WALLET</Text>
        <Text style={styles.subtitle}>
          Link your external crypto wallet to access DeFi features
        </Text>

        {/* Connected State */}
        {isConnected ? (
          <View style={styles.connectedCard}>
            <View style={styles.connectedHeader}>
              <View style={styles.connectedIconContainer}>
                <Icon name="check-circle" size={48} color={colors.success[500]} />
              </View>
              <Text style={styles.connectedTitle}>Connected</Text>
            </View>

            <View style={styles.connectedInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>WALLET ADDRESS</Text>
                <Text style={styles.infoValue}>{displayName}</Text>
              </View>

              {formattedBalance && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>BALANCE</Text>
                  <Text style={styles.infoValue}>{formattedBalance}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NETWORK</Text>
                <View style={styles.networkBadge}>
                  <View
                    style={[
                      styles.networkDot,
                      { backgroundColor: isCorrectChain ? colors.success[500] : colors.error[500] },
                    ]}
                  />
                  <Text style={styles.networkText}>
                    {chainId ? `Chain ${chainId}` : 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>

            {!isCorrectChain && (
              <TouchableOpacity onPress={handleSwitchNetwork} style={styles.warningCard}>
                <Icon name="warning" size={20} color={colors.warning[500]} />
                <Text style={styles.warningText}>
                  Wrong network. Tap to switch to Sepolia.
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleDisconnect} disabled={isDisconnecting}>
              <LinearGradient
                colors={[colors.error[500], colors.error[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.disconnectButton}
              >
                <Icon name="link-off" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>
                  {isDisconnecting ? 'DISCONNECTING...' : 'DISCONNECT WALLET'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Not Connected State */}
            <View style={styles.heroCard}>
              <Icon name="account-balance-wallet" size={80} color={colors.primary[500]} />
              <Text style={styles.heroTitle}>No Wallet Connected</Text>
              <Text style={styles.heroSubtitle}>
                Connect your favorite crypto wallet to unlock DeFi features
              </Text>
            </View>

            {/* Main Connect Button */}
            <TouchableOpacity onPress={handleConnect} disabled={isConnecting}>
              <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.connectButton}
              >
                <Icon name="link" size={24} color={colors.text.inverse} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>
                  {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Supported Wallets List */}
            <Text style={styles.sectionTitle}>SUPPORTED WALLETS</Text>
            <View style={styles.walletsList}>
              {SUPPORTED_WALLETS.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  style={styles.walletCard}
                  onPress={() => openWalletApp(wallet.deepLink, wallet.downloadUrl)}
                >
                  <View style={styles.walletIcon}>
                    <Text style={styles.walletEmoji}>{wallet.icon}</Text>
                  </View>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <Icon name="chevron-right" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <Icon name="info" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>
                Your PAYO wallet and external wallet are separate. Connect an external wallet to
                access DeFi protocols and trade on DEXs.
              </Text>
            </View>
          </>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <Icon name="error" size={20} color={colors.error[500]} />
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
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
    padding: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900' as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    fontWeight: '500' as any,
  },
  heroCard: {
    backgroundColor: colors.glass.background,
    borderRadius: 24,
    padding: spacing[8],
    alignItems: 'center',
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 0,
  },
  heroTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '800' as any,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    fontWeight: '500' as any,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[8],
    marginBottom: spacing[8],
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
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800' as any,
    color: colors.text.secondary,
    marginBottom: spacing[4],
    letterSpacing: 2,
  },
  walletsList: {
    marginBottom: spacing[6],
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 0,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  walletEmoji: {
    fontSize: 24,
  },
  walletName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: '700' as any,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  connectedCard: {
    backgroundColor: colors.glass.background,
    borderRadius: 24,
    padding: spacing[6],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.success[500],
    shadowColor: colors.success[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 0,
  },
  connectedHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  connectedIconContainer: {
    marginBottom: spacing[3],
  },
  connectedTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '800' as any,
    color: colors.success[500],
    letterSpacing: 1,
  },
  connectedInfo: {
    marginBottom: spacing[6],
  },
  infoRow: {
    marginBottom: spacing[4],
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    letterSpacing: 1.5,
    fontWeight: '800' as any,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.mono,
    fontWeight: '600' as any,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[2],
  },
  networkText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: '700' as any,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.warning[500],
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.warning[500],
    marginLeft: spacing[2],
    fontWeight: '600' as any,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    shadowColor: colors.error[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 0,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: colors.glass.background,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    fontWeight: '500' as any,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: colors.error[500],
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    marginLeft: spacing[2],
    fontWeight: '600' as any,
  },
});

export default ConnectWalletScreen;
