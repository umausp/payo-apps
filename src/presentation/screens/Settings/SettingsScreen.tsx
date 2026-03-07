import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../../../types';
import { useWallet } from '../../hooks/useWallet';
import { useBiometric } from '../../hooks/useBiometric';
import { useAppDispatch } from '../../hooks/useRedux';
import { logoutUser } from '../../store/slices/authSlice';
import BackButton from '../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { showNetworkDiagnostics } from '../../../utils/debugNetwork';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { wallet, removeWallet } = useWallet();
  const { isEnrolled, enable, disable } = useBiometric();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [gasPrice, setGasPrice] = useState<string | null>(null);

  useEffect(() => {
    fetchGasPrice();
  }, []);

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

  const copyToClipboard = () => {
    if (wallet?.address) {
      Clipboard.setString(wallet.address);
      Alert.alert('Copied', 'Wallet address copied to clipboard');
    }
  };

  const handleToggleBiometric = async () => {
    if (isEnrolled) {
      const success = await disable();
      if (success) {
        Alert.alert('Success', 'Biometric authentication disabled');
      }
    } else {
      const success = await enable();
      if (success) {
        Alert.alert('Success', 'Biometric authentication enabled');
      }
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logoutUser()).unwrap();
      // Navigation will be handled automatically by auth state change
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, we still want to clear local state
      // The thunk handles this in the rejected case
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteWallet = () => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await removeWallet();
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              console.error('Delete wallet error:', error);
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WALLET INFORMATION</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Icon name="account-balance-wallet" size={24} color={colors.primary[500]} />
              <Text style={styles.infoCardTitle}>Wallet Address</Text>
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {wallet?.address}
              </Text>
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Icon name="content-copy" size={20} color={colors.primary[500]} />
              </TouchableOpacity>
            </View>
          </View>

          {gasPrice && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Icon name="local-gas-station" size={24} color={colors.primary[500]} />
                <Text style={styles.infoCardTitle}>Network Gas</Text>
              </View>
              <Text style={styles.gasPrice}>{gasPrice} Gwei</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <TouchableOpacity style={styles.settingRow} onPress={handleToggleBiometric}>
            <View style={styles.settingLeft}>
              <Icon name="fingerprint" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: isEnrolled ? colors.success[500] : colors.text.secondary }]}>
                {isEnrolled ? 'Enabled' : 'Disabled'}
              </Text>
              <Icon name="chevron-right" size={24} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEVELOPER</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('LogViewer')}
          >
            <View style={styles.settingLeft}>
              <Icon name="description" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>View API Logs</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={showNetworkDiagnostics}
          >
            <View style={styles.settingLeft}>
              <Icon name="settings-ethernet" size={20} color={colors.text.secondary} />
              <Text style={styles.settingLabel}>Test Backend Connection</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout} disabled={isLoggingOut}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {isLoggingOut ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Icon name="logout" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>LOGOUT</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDeleteWallet} disabled={isLoggingOut}>
            <LinearGradient
              colors={[colors.error[500], colors.error[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.button, styles.dangerButton]}
            >
              {isLoggingOut ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Icon name="delete-forever" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>DELETE WALLET</Text>
                </>
              )}
            </LinearGradient>
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
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900' as any,
    color: colors.text.primary,
    padding: spacing[4],
    paddingBottom: spacing[3],
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: colors.glass.background,
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    borderRadius: 20,
    padding: spacing[5],
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '800' as any,
    color: colors.text.secondary,
    marginBottom: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  infoCard: {
    marginBottom: spacing[4],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  infoCardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700' as any,
    color: colors.text.secondary,
    marginLeft: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  addressText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.mono,
    fontWeight: '500' as any,
  },
  copyButton: {
    padding: spacing[2],
    marginLeft: spacing[2],
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  gasPrice: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '800' as any,
    color: colors.success[500],
    marginLeft: spacing[1],
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.medium,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as any,
    color: colors.text.primary,
    marginLeft: spacing[3],
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800' as any,
    marginRight: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    paddingVertical: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[3],
    elevation: 0,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  buttonIcon: {
    marginRight: spacing[2],
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '800' as any,
    color: colors.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  dangerButton: {
    shadowColor: colors.error[500],
  },
});

export default SettingsScreen;
