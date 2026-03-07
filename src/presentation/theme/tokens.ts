// Design Tokens - Enterprise Design System
// PAYO Wallet Design Tokens following design system best practices

export const colors = {
  // Primary Brand - Electric Violet (Gen Z Crypto)
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6', // Electric Violet - Main brand
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Success/Gains - Neo-Mint
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#00FFA3', // Neo-Mint - Gains/Success
    600: '#00E693',
    700: '#00CC82',
  },

  // Error/Losses - Hot Pink
  error: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#FF2E63', // Hot Pink - Losses/Error
    600: '#E11D48',
    700: '#BE123C',
  },

  // Warning - Cyber Yellow
  warning: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    500: '#FFD60A',
    600: '#FACC15',
    700: '#EAB308',
  },

  // Info/Accent - Cyber Blue
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
  },

  // Neutrals - OLED Black & Deep Ink
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#A1A1AA', // Slate
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    850: '#1A1A1D',
    900: '#121212', // Deep Ink
    950: '#0A0A0A',
    1000: '#050505', // OLED Black
  },

  // Background - Dark First
  background: {
    primary: '#050505', // OLED Black
    secondary: '#121212', // Deep Ink
    tertiary: '#1A1A1D',
    card: 'rgba(18, 18, 18, 0.8)', // Glassmorphism
    overlay: 'rgba(5, 5, 5, 0.95)',
  },

  // Text - High Contrast
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA', // Slate
    tertiary: '#71717A',
    inverse: '#050505',
    disabled: '#52525B',
    error: '#FF2E63',
    success: '#00FFA3',
  },

  // Border - Subtle Glow
  border: {
    light: 'rgba(161, 161, 170, 0.1)', // Subtle
    medium: 'rgba(161, 161, 170, 0.2)',
    dark: 'rgba(161, 161, 170, 0.3)',
    focus: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.5)',
    error: '#FF2E63',
  },

  // Gradients - High Energy
  gradient: {
    primary: ['#8B5CF6', '#A78BFA'], // Violet gradient
    success: ['#00FFA3', '#00E693'], // Mint gradient
    error: ['#FF2E63', '#FB7185'], // Pink gradient
    rainbow: ['#8B5CF6', '#00FFA3', '#0EA5E9'], // Purple-Mint-Blue
    dark: ['#121212', '#1A1A1D'], // Dark gradient
  },

  // Glassmorphism
  glass: {
    background: 'rgba(18, 18, 18, 0.4)',
    border: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(139, 92, 246, 0.1)',
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const typography = {
  fontFamily: {
    primary: 'System',
    mono: 'Courier',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const animation = {
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
    slower: 500,
  },

  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const layout = {
  containerPadding: spacing[6],
  screenPadding: spacing[4],
  cardPadding: spacing[4],

  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};

export const components = {
  button: {
    height: {
      sm: 32,
      base: 44,
      lg: 56,
    },
    padding: {
      horizontal: spacing[4],
      vertical: spacing[3],
    },
  },

  input: {
    height: 48,
    padding: spacing[4],
    borderRadius: borderRadius.md,
  },

  card: {
    padding: spacing[4],
    borderRadius: borderRadius.lg,
  },
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
  layout,
  components,
  zIndex,
};
