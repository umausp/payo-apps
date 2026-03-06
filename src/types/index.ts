// Core Types for PAYO Wallet Application

export interface Wallet {
  address: string;
  balance: string;
  fiatBalance: string;
  nativeBalance: string; // ETH balance for gas fees
  privateKey?: string; // Only stored encrypted in secure storage
  publicKey: string;
  isNonCustodial: boolean;
  createdAt: string; // ISO date string for Redux serialization
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  fiatAmount: string;
  gasPrice: string;
  gasLimit: string;
  gasFee: string;
  status: TransactionStatus;
  timestamp: Date;
  blockNumber?: number;
  type: TransactionType;
  metadata?: TransactionMetadata;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export enum TransactionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  MINT = 'MINT',
}

export interface TransactionMetadata {
  merchantName?: string;
  merchantAddress?: string;
  invoiceId?: string;
  description?: string;
}

export interface QRData {
  address: string;
  amount?: string;
  invoiceId?: string;
  expiryTime?: number;
  merchantInfo?: MerchantInfo;
}

export interface MerchantInfo {
  name: string;
  address: string;
  webhookUrl?: string;
}

export interface PaymentPreview {
  merchantName: string;
  merchantAddress: string;
  amount: string;
  fiatAmount: string;
  gasFee: string;
  totalAmount: string;
  totalFiatAmount: string;
}

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  phoneNumber?: string;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasWallet: boolean;
}

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  tokenAddress: string;
  oracleAddress: string;
  explorerUrl: string;
  symbol: string;
  decimals: number;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  autoLockTime: number; // in minutes
  maxLoginAttempts: number;
  lockDuration: number; // in minutes
}

export interface PriceData {
  symbol: string;
  priceUSD: number;
  lastUpdated: Date;
  change24h: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  CreateWallet: undefined;
  ImportWallet: undefined;
  SeedPhrase: { seedPhrase: string[] };
  SeedPhraseConfirmation: { seedPhrase: string[] };
  BiometricSetup: undefined;
  Login: undefined;
  Dashboard: undefined;
  QRScanner: undefined;
  PaymentPreview: { qrData: QRData };
  PaymentProcessing: { transaction: Transaction };
  PaymentSuccess: { transaction: Transaction };
  Receive: undefined;
  Settings: undefined;
  LogViewer: undefined;
  TransactionHistory: undefined;
  TransactionDetails: { transaction: Transaction };
};

export type BottomTabParamList = {
  Home: undefined;
  Scan: undefined;
  Receive: undefined;
  History: undefined;
  Profile: undefined;
};

// Hook Return Types
export interface UseWalletReturn {
  wallet: Wallet | null;
  balance: string;
  fiatBalance: string;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refreshTransactions: () => Promise<void>;
}

export interface UseBiometricReturn {
  isAvailable: boolean;
  isEnrolled: boolean;
  authenticate: () => Promise<boolean>;
  enable: () => Promise<boolean>;
  disable: () => Promise<boolean>;
}
