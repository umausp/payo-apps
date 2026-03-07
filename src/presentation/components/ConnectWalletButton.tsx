/**
 * ConnectWalletButton Component
 * Gen Z styled wallet connection button with animations
 */

import React, { useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { usePayoWallet } from '../hooks/usePayoWallet';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ConnectWalletButtonProps {
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onPress,
  variant = 'primary',
  size = 'medium',
}) => {
  const {
    isConnected,
    isConnecting,
    displayName,
    connect,
    error,
  } = usePayoWallet();

  // Animation values
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  // Press animation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Pulse animation for loading state
  useEffect(() => {
    if (isConnecting) {
      pulseOpacity.value = withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 })
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [isConnecting]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Handle press with scale animation
  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    if (!isConnected && !isConnecting) {
      try {
        await connect();
      } catch (err) {
        // Error is handled in the hook
        console.error('[ConnectWalletButton] Connection failed:', err);
      }
    }
  };

  // Size variants
  const sizeStyles = {
    small: { paddingVertical: spacing[3], paddingHorizontal: spacing[5] },
    medium: { paddingVertical: spacing[4], paddingHorizontal: spacing[6] },
    large: { paddingVertical: spacing[5], paddingHorizontal: spacing[8] },
  };

  const textSizeStyles = {
    small: { fontSize: typography.fontSize.sm },
    medium: { fontSize: typography.fontSize.base },
    large: { fontSize: typography.fontSize.lg },
  };

  // Connected state rendering
  if (isConnected) {
    return (
      <AnimatedTouchable
        style={[styles.container, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[styles.connectedButton, sizeStyles[size]]}>
          <View style={styles.connectedDot} />
          <Text style={[styles.connectedText, textSizeStyles[size]]} numberOfLines={1}>
            {displayName}
          </Text>
          <Icon name="account-balance-wallet" size={20} color={colors.text.primary} />
        </View>
      </AnimatedTouchable>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <Animated.View style={[styles.container, animatedStyle, pulseStyle]}>
        <View style={[styles.loadingButton, sizeStyles[size]]}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
          <Text style={[styles.loadingText, textSizeStyles[size]]}>
            CONNECTING...
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Default connect button
  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        style={[styles.container, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, sizeStyles[size]]}
        >
          <Icon name="account-balance-wallet" size={20} color={colors.text.inverse} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, textSizeStyles[size]]}>
            CONNECT WALLET
          </Text>
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  // Secondary variant
  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.secondaryButton, sizeStyles[size]]}>
        <Icon name="account-balance-wallet" size={20} color={colors.primary[500]} style={styles.buttonIcon} />
        <Text style={[styles.secondaryButtonText, textSizeStyles[size]]}>
          CONNECT WALLET
        </Text>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
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
    fontWeight: '800' as any,
    color: colors.text.inverse,
    letterSpacing: 1.5,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.background,
    borderWidth: 2,
    borderColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 0,
  },
  secondaryButtonText: {
    fontWeight: '800' as any,
    color: colors.primary[500],
    letterSpacing: 1.5,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  loadingText: {
    fontWeight: '700' as any,
    color: colors.text.secondary,
    letterSpacing: 1.5,
    marginLeft: spacing[2],
  },
  connectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.success[500],
    shadowColor: colors.success[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 0,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success[500],
    marginRight: spacing[2],
    shadowColor: colors.success[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  connectedText: {
    fontWeight: '700' as any,
    color: colors.text.primary,
    letterSpacing: 0.5,
    marginRight: spacing[2],
    fontFamily: typography.fontFamily.mono,
  },
});

export default ConnectWalletButton;
