import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{wallet?.address.slice(0, 10)}...{wallet?.address.slice(-8)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity style={styles.settingRow} onPress={handleToggleBiometric}>
            <Text style={styles.settingLabel}>Biometric Authentication</Text>
            <Text style={styles.settingValue}>{isEnrolled ? 'Enabled' : 'Disabled'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('LogViewer')}
          >
            <Text style={styles.settingLabel}>View API Logs</Text>
            <Text style={styles.settingValue}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={showNetworkDiagnostics}
          >
            <Text style={styles.settingLabel}>Test Backend Connection</Text>
            <Text style={styles.settingValue}>🔌</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>Logout</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleDeleteWallet}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color={colors.error[500]} />
            ) : (
              <Text style={[styles.buttonText, styles.dangerButtonText]}>Delete Wallet</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { flex: 1 },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    padding: spacing[6]
  },
  section: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing[6],
    marginBottom: spacing[4],
    borderRadius: borderRadius.lg,
    padding: spacing[4]
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.secondary,
    marginBottom: spacing[3]
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2]
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: 'monospace'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3]
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium as any
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2]
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse
  },
  dangerButton: { backgroundColor: colors.error[500] },
  dangerButtonText: { color: colors.text.inverse },
});

export default SettingsScreen;
