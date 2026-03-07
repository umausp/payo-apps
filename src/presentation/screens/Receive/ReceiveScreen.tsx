import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
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
        <Text style={styles.title}>RECEIVE PAYO</Text>

        <View style={styles.qrPlaceholder}>
          <Icon name="qr-code-2" size={120} color={colors.primary[500]} />
          <Text style={styles.qrText}>QR Code Coming Soon</Text>
        </View>

        <Text style={styles.label}>YOUR WALLET ADDRESS</Text>
        <View style={styles.addressContainer}>
          <Text style={styles.address}>{wallet?.address}</Text>
        </View>

        <TouchableOpacity onPress={handleShare}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Icon name="share" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>SHARE ADDRESS</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: {
    flex: 1,
    padding: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900' as any,
    color: colors.text.primary,
    marginBottom: spacing[8],
    letterSpacing: 1,
  },
  qrPlaceholder: {
    width: 280,
    height: 280,
    backgroundColor: colors.glass.background,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 0,
  },
  qrText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing[4],
    fontWeight: '600' as any,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    letterSpacing: 2,
    fontWeight: '800' as any,
  },
  addressContainer: {
    backgroundColor: colors.glass.background,
    padding: spacing[5],
    borderRadius: 20,
    width: '100%',
    marginBottom: spacing[8],
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 0,
  },
  address: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600' as any,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  button: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default ReceiveScreen;
