// Backend API Request/Response Types

// ============================================================================
// Auth Service Types
// ============================================================================

export interface ChallengeRequest {
  walletAddress: string;
}

export interface ChallengeResponse {
  message: string;
  nonce: string;
}

export interface VerifyRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface VerifyResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    walletAddress: string;
    createdAt: string;
  };
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

// ============================================================================
// Wallet Service Types
// ============================================================================

export interface BalanceResponse {
  balanceWei: string;
  decimals: number;
  symbol: string;
}

export interface GasResponse {
  gasPriceWei: string;
  chainId: number;
}

export interface RpcRequest {
  method: string;
  params?: any[];
}

export interface RpcResponse {
  jsonrpc: string;
  id: number;
  result: any;
}

// ============================================================================
// Payment Service Types
// ============================================================================

export interface ForwardRequest {
  from: string;
  to: string;
  value: string;
  gas: string;
  nonce: string;
  deadline: string;
  data: string;
}

export interface PaymentSubmitRequest {
  forwardRequest: ForwardRequest;
  signature: string;
  idempotencyKey: string;
}

export interface PaymentSubmitResponse {
  id?: string; // Payment transaction ID in backend DB
  txHash: string;
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export interface PaymentStatusRequest {
  idempotencyKey: string;
}

export interface PaymentStatusResponse {
  transactionId: string;
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface TransactionListQuery {
  userId?: string;
  walletAddress?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface Transaction {
  _id: string;
  transactionId: string;
  userId: string;
  walletAddress: string;
  to: string;
  amount: string;
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  blockNumber?: number;
  confirmations?: number;
  idempotencyKey: string;
  forwardRequest: ForwardRequest;
  signature: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  failureReason?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface TransactionDetailsResponse {
  transaction: Transaction;
}

// ============================================================================
// Merchant Service Types
// ============================================================================

export interface MerchantRegisterRequest {
  businessName: string;
  businessType: 'retail' | 'food' | 'service' | 'online' | 'other';
  walletAddress: string;
  email: string;
  phone?: string;
}

export interface Merchant {
  merchantId: string;
  userId: string;
  businessName: string;
  businessType: string;
  walletAddress: string;
  email: string;
  phone?: string;
  kycStatus: 'not_submitted' | 'submitted' | 'approved' | 'rejected';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantRegisterResponse {
  merchant: Merchant;
}

export interface MerchantProfileResponse {
  merchant: Merchant;
}

export interface MerchantUpdateRequest {
  businessName?: string;
  businessType?: 'retail' | 'food' | 'service' | 'online' | 'other';
  email?: string;
  phone?: string;
}

export interface MerchantKYCRequest {
  documentType: string;
  documentNumber: string;
}

export interface MerchantKYCResponse {
  message: string;
  status: string;
}

export interface StaticQRRequest {
  // No body required, uses merchant from JWT
}

export interface QRCode {
  qrCodeId: string;
  merchantId: string;
  type: 'static' | 'dynamic';
  qrData: string;
  merchantAddress: string;
  amount?: string;
  currency?: string;
  invoiceId?: string;
  expiryTime?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StaticQRResponse {
  qrCode: QRCode;
}

export interface DynamicQRRequest {
  amount: string;
  currency?: string;
  invoiceId: string;
  expiresIn?: number; // minutes
}

export interface DynamicQRResponse {
  qrCode: QRCode;
}

export interface QRCodeListResponse {
  qrCodes: QRCode[];
}

export interface QRCodeDetailsResponse {
  qrCode: QRCode;
}

// ============================================================================
// Generic API Response Types
// ============================================================================

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: any;
}

export interface ApiSuccessResponse {
  success: boolean;
  message?: string;
}
