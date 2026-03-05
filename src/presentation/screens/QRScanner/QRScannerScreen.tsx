import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'react-native-camera-kit';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList, QRData } from '../../../types';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import BackButton from '../../components/BackButton';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

type NavigationProp = StackNavigationProp<RootStackParamList, 'QRScanner'>;

type ScreenMode = 'options' | 'scanning' | 'manual';

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [mode, setMode] = useState<ScreenMode>('options');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const handleScanQROption = async () => {
    // Request camera permission and switch to scanning mode
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });

      if (!permission) {
        Alert.alert('Error', 'Camera permission not available on this platform');
        return;
      }

      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
        setMode('scanning');
      } else if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          setHasPermission(true);
          setMode('scanning');
        } else {
          setHasPermission(false);
          setMode('scanning'); // Show permission denied screen
        }
      } else {
        setHasPermission(false);
        setMode('scanning'); // Show permission denied screen
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const handleManualEntryOption = () => {
    setMode('manual');
  };

  const handleManualAddressSubmit = () => {
    const address = manualAddress.trim();

    if (!address) {
      Alert.alert('Error', 'Please enter a wallet address');
      return;
    }

    if (!address.startsWith('0x') || address.length !== 42) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum address (0x...)');
      return;
    }

    const qrData: QRData = {
      address,
      amount: '0',
      merchantInfo: {
        name: 'Manual Entry',
        address: '',
      },
    };

    navigation.navigate('PaymentPreview', { qrData });
  };

  const handleBarCodeRead = (event: any) => {
    if (scanned) return;

    setScanned(true);

    try {
      const qrData = parseQRCode(event.nativeEvent.codeStringValue);

      if (qrData) {
        navigation.navigate('PaymentPreview', { qrData });
      } else {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not a valid PAYO payment request.',
          [{ text: 'Scan Again', onPress: () => setScanned(false) }]
        );
      }
    } catch (error) {
      console.error('QR scan error:', error);
      Alert.alert(
        'Scan Error',
        'Failed to read QR code. Please try again.',
        [{ text: 'Scan Again', onPress: () => setScanned(false) }]
      );
    }
  };

  const parseQRCode = (data: string): QRData | null => {
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(data);

      if (parsed.address && parsed.amount) {
        return {
          address: parsed.address,
          amount: parsed.amount,
          invoiceId: parsed.invoiceId,
          expiryTime: parsed.expiryTime,
          merchantInfo: parsed.merchantInfo || {
            name: parsed.merchantName || 'Unknown Merchant',
            address: parsed.merchantAddress || '',
          },
        };
      }

      return null;
    } catch (error) {
      // Try parsing as simple address format
      if (data.startsWith('0x') && data.length === 42) {
        return {
          address: data,
          amount: '0',
          merchantInfo: {
            name: 'Wallet Address',
            address: '',
          },
        };
      }

      return null;
    }
  };

  // Options View - Show two main options
  if (mode === 'options') {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.centerContent}>
          <Text style={styles.title}>Send Payment</Text>
          <Text style={styles.description}>
            Choose how you want to send PAYO
          </Text>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleScanQROption}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <Icon name="qr-code-outline" size={48} color={colors.primary[500]} />
            </View>
            <Text style={styles.optionTitle}>Scan QR Code</Text>
            <Text style={styles.optionDescription}>
              Scan a QR code to get payment details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleManualEntryOption}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <Icon name="create-outline" size={48} color={colors.primary[500]} />
            </View>
            <Text style={styles.optionTitle}>Enter Address Manually</Text>
            <Text style={styles.optionDescription}>
              Type in the recipient's wallet address
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Manual Entry View
  if (mode === 'manual') {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton onPress={() => setMode('options')} />
        <View style={styles.centerContent}>
          <Text style={styles.title}>Enter Wallet Address</Text>
          <Text style={styles.description}>
            Enter the recipient's Ethereum wallet address
          </Text>

          <TextInput
            style={styles.input}
            value={manualAddress}
            onChangeText={setManualAddress}
            placeholder="0x..."
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, !manualAddress.trim() && styles.buttonDisabled]}
            onPress={handleManualAddressSubmit}
            disabled={!manualAddress.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Scanning View
  const openSettings = () => {
    Linking.openSettings();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton onPress={() => setMode('options')} />
        <View style={styles.centerContent}>
          <Text style={styles.title}>Requesting Camera Permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton onPress={() => setMode('options')} />
        <View style={styles.centerContent}>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.description}>
            PAYO needs camera access to scan QR codes for payments.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleScanQROption}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={openSettings}>
            <Text style={styles.secondaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton onPress={() => setMode('options')} />

      <Camera
        style={styles.camera}
        scanBarcode
        onReadCode={handleBarCodeRead}
        flashMode={flashEnabled ? 'on' : 'off'}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.instructionText}>
            Position QR code within the frame
          </Text>
        </View>

        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>

        <View style={styles.bottomOverlay}>
          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlashEnabled(!flashEnabled)}
          >
            <Text style={styles.flashButtonText}>
              {flashEnabled ? '🔦 Flash On' : '🔦 Flash Off'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  optionCard: {
    width: '100%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[4],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  optionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing[6],
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonDisabled: {
    backgroundColor: colors.neutral[300],
    opacity: 0.6,
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    height: 300,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary[400],
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
    textAlign: 'center',
    paddingHorizontal: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    marginBottom: spacing[4],
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.primary[500],
  },
  flashButton: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.full,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  flashButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.inverse,
  },
});

export default QRScannerScreen;
