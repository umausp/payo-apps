// Application Constants

import { Platform } from 'react-native';

export const APP_NAME = 'PAYO';
export const APP_VERSION = '1.0.0';

// Blockchain Configuration - Sepolia Testnet (Deployed: March 6, 2026)
export const BLOCKCHAIN = {
  // RPC_URL: Platform.OS === 'android' ? 'http://10.0.2.2:8545' : 'http://localhost:8545', // Local Hardhat
  RPC_URL: 'https://ethereum-sepolia-rpc.publicnode.com', // Sepolia Testnet
  CHAIN_ID: 11155111, // Sepolia Testnet
  TOKEN_ADDRESS: '0xA5B2A8BF51de02981A52185986875C31db6B437B', // PAYO Token on Sepolia
  PAYMENT_PROCESSOR: '0x990E95b0b12E1fcCd811E920270E68D23C135b08', // Payment Processor
  FORWARDER_ADDRESS: '0x5969E5EFB87f94fb4731bC8192AA725b73345A19', // MinimalForwarder
  VESTING_MANAGER: '0x93558E9430459cd5dCEA2Aa80A853d481910D17A', // Vesting Manager
  REFUND_MANAGER: '0x49E212EA1629E3AdC1FD87af9B5A4410DC468E30', // Refund Manager
  ORACLE_ADDRESS: '0x...', // Price Oracle Contract Address
  EXPLORER_URL: 'https://sepolia.etherscan.io', // Sepolia Explorer
  SYMBOL: 'PAYO',
  DECIMALS: 18,
  GAS_LIMIT: 100000,
  MAX_SUPPLY: 1000000000, // 1 Billion tokens
} as const;

// API Configuration Helper
const getApiBaseUrl = (): string => {
  // Check for manual override (useful for physical device testing)
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // Development mode
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android Emulator maps 10.0.2.2 to host machine's localhost
      return 'http://10.0.2.2'; // return 'http://192.168.1.YOUR_IP';  // Your actual IP
    }
    // iOS Simulator can use localhost
    return 'http://localhost';
  }

  // Production mode
  return 'https://api.payo.app';
};

const API_BASE_URL = getApiBaseUrl();

// API Configuration
export const API = {
  BASE_URL: `${API_BASE_URL}:3000`,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  SERVICES: {
    AUTH: `${API_BASE_URL}:3001`,
    WALLET: `${API_BASE_URL}:3002`,
    PAYMENT: `${API_BASE_URL}:3004`,
    MERCHANT: `${API_BASE_URL}:3007`,
    GATEWAY: `${API_BASE_URL}:3000`,
  },
  ENDPOINTS: {
    // Auth Service
    AUTH_CHALLENGE: '/api/v1/auth/challenge',
    AUTH_VERIFY: '/api/v1/auth/verify',
    AUTH_REFRESH: '/api/v1/auth/refresh',
    AUTH_LOGOUT: '/api/v1/auth/logout',

    // Wallet Service
    WALLET_BALANCE: '/api/v1/wallet/balance',
    WALLET_GAS: '/api/v1/wallet/gas',
    WALLET_RPC: '/api/v1/wallet/rpc',

    // Payment Service
    PAYMENT_SUBMIT: '/api/v1/payment/submit',
    PAYMENT_STATUS: '/api/v1/payment/status',
    PAYMENT_TRANSACTIONS: '/api/v1/payment/transactions',

    // Merchant Service
    MERCHANT_REGISTER: '/register',
    MERCHANT_PROFILE: '/profile',
    MERCHANT_KYC: '/kyc',
    MERCHANT_QR_STATIC: '/qr/static',
    MERCHANT_QR_DYNAMIC: '/qr/dynamic',
    MERCHANT_QR_LIST: '/qr',
  },
} as const;

// Security Configuration
export const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION_MINUTES: 30,
  AUTO_LOCK_TIME_MINUTES: 5,
  PIN_LENGTH: 6,
  SESSION_TIMEOUT_MINUTES: 30,
  ENCRYPTION_ALGORITHM: 'AES-256-CBC',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  WALLET_ENCRYPTED: '@payo:wallet:encrypted',
  USER_SETTINGS: '@payo:user:settings',
  BIOMETRIC_ENABLED: '@payo:biometric:enabled',
  PIN_ENABLED: '@payo:pin:enabled',
  TRANSACTIONS_CACHE: '@payo:transactions:cache',
  PRICE_CACHE: '@payo:price:cache',
  ONBOARDING_COMPLETED: '@payo:onboarding:completed',
  LAST_ACTIVITY: '@payo:last:activity',
  LOGIN_ATTEMPTS: '@payo:login:attempts',
} as const;

// Transaction Configuration
export const TRANSACTION = {
  CONFIRMATION_BLOCKS: 12,
  POLLING_INTERVAL: 5000, // 5 seconds
  MAX_GAS_PRICE: '100', // in Gwei
  CACHE_DURATION: 60000, // 1 minute
} as const;

// Price Oracle Configuration
export const PRICE_ORACLE = {
  UPDATE_INTERVAL: 60000, // 1 minute
  CACHE_DURATION: 60000, // 1 minute
  FALLBACK_PRICE: 1.0, // 1 USD
} as const;

// UI Configuration
export const UI = {
  SPLASH_DURATION: 2000, // 2 seconds
  TOAST_DURATION: 3000, // 3 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 200, // 200ms
} as const;

// QR Code Configuration
export const QR = {
  SIZE: 300,
  ERROR_CORRECTION_LEVEL: 'M',
  QR_EXPIRY_MINUTES: 15,
} as const;

// Wallet Configuration
export const WALLET = {
  MNEMONIC_STRENGTH: 128, // 12 words (as per PDF spec)
  DERIVATION_PATH: "m/44'/60'/0'/0/0", // Ethereum standard
  // BALANCE_REFRESH_INTERVAL: 30000, // Not used - balance refreshed on-demand only
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_TRANSFER_AMOUNT: '0.000001',
  MAX_TRANSFER_AMOUNT: '1000000',
  ADDRESS_LENGTH: 42, // 0x + 40 characters
  SEED_PHRASE_WORDS: 12, // 12-word seed phrase (as per PDF spec)
} as const;

// Error Messages
export const ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
  INVALID_ADDRESS: 'Invalid wallet address.',
  INVALID_AMOUNT: 'Invalid amount.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  AUTHENTICATION_FAILED: 'Authentication failed.',
  BIOMETRIC_NOT_AVAILABLE: 'Biometric authentication is not available.',
  WALLET_LOCKED: 'Wallet is locked due to multiple failed attempts.',
  INVALID_SEED_PHRASE: 'Invalid seed phrase.',
  INVALID_PIN: 'Invalid PIN.',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  QR_SCAN_ERROR: 'Failed to scan QR code.',
  QR_INVALID: 'Invalid QR code format.',
  CAMERA_PERMISSION_DENIED: 'Camera permission denied.',
} as const;

// Success Messages
export const SUCCESS = {
  WALLET_CREATED: 'Wallet created successfully!',
  WALLET_IMPORTED: 'Wallet imported successfully!',
  TRANSACTION_SENT: 'Transaction sent successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  BIOMETRIC_ENABLED: 'Biometric authentication enabled!',
  BIOMETRIC_DISABLED: 'Biometric authentication disabled!',
} as const;

// App Routes
export const ROUTES = {
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  CREATE_WALLET: 'CreateWallet',
  IMPORT_WALLET: 'ImportWallet',
  SEED_PHRASE: 'SeedPhrase',
  SEED_PHRASE_CONFIRMATION: 'SeedPhraseConfirmation',
  BIOMETRIC_SETUP: 'BiometricSetup',
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  QR_SCANNER: 'QRScanner',
  PAYMENT_PREVIEW: 'PaymentPreview',
  PAYMENT_PROCESSING: 'PaymentProcessing',
  PAYMENT_SUCCESS: 'PaymentSuccess',
  RECEIVE: 'Receive',
  SETTINGS: 'Settings',
  TRANSACTION_HISTORY: 'TransactionHistory',
  TRANSACTION_DETAILS: 'TransactionDetails',
} as const;

// Performance Targets (from PDF)
export const PERFORMANCE = {
  TRANSACTION_CONFIRMATION_MAX_SECONDS: 5,
  API_RESPONSE_MAX_MS: 200,
  WEBHOOK_LATENCY_MAX_SECONDS: 3,
  UPTIME_TARGET: 0.999, // 99.9%
  MAX_DAU: 100000,
} as const;

// Feature Flags
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  TWO_FACTOR_AUTH: true,
  SCREENSHOT_PREVENTION: true,
  PUSH_NOTIFICATIONS: true,
  ANALYTICS: true,
} as const;
