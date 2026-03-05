import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../../hooks/useWallet';
import BackButton from '../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

const ReceiveScreen: React.FC = () => {
  const { wallet } = useWallet();

  const handleShare = async () => {
    if (wallet) {
      try {
        await Share.share({
          message: `My PAYO wallet address: ${wallet.address}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text style={styles.title}>Receive PAYO</Text>
        
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>QR Code</Text>
          <Text style={styles.qrText}>Would display here</Text>
        </View>

        <Text style={styles.label}>Your Address</Text>
        <View style={styles.addressContainer}>
          <Text style={styles.address}>{wallet?.address}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>Share Address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: {
    flex: 1,
    padding: spacing[6],
    alignItems: 'center'
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[8]
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8]
  },
  qrText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[2]
  },
  addressContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    width: '100%',
    marginBottom: spacing[6]
  },
  address: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.text.primary,
    textAlign: 'center'
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    alignItems: 'center'
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse
  },
});

export default ReceiveScreen;
