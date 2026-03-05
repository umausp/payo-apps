# PAYO React Native App - Backend API Integration Guide

## Overview

This guide documents the complete integration between the PAYO React Native mobile app and the payo-backend microservices architecture.

## Architecture

The mobile app communicates with four main backend microservices:

1. **Auth Service** (port 3001) - User authentication via wallet signature
2. **Wallet Service** (port 3002) - Balance queries, gas price, RPC proxy
3. **Payment Service** (port 3004) - Payment processing with meta-transactions
4. **Merchant Service** (port 3007) - Merchant management and QR code generation

## API Service Implementation

**Location:** `src/infrastructure/api/ApiService.ts`

### Features

- ✅ Separate Axios clients for each microservice
- ✅ Automatic JWT token management
- ✅ Token refresh with retry queue
- ✅ Request/response interceptors
- ✅ Comprehensive TypeScript types
- ✅ Error handling with proper error codes
- ✅ Singleton pattern

### Type Definitions

**Location:** `src/infrastructure/api/types.ts`

All request/response types are defined matching the backend API contracts.

## Authentication Flow

### 1. Get Challenge Message

**Endpoint:** `POST /challenge`

**Purpose:** Get a nonce-based challenge message to sign

```typescript
import ApiService from '@/infrastructure/api/ApiService';

const response = await ApiService.getChallenge(walletAddress);
if (response.success) {
  const { message, nonce } = response.data;
  // Sign this message with user's wallet
}
```

**Backend Route:** `services/auth-service/src/routes/auth.routes.ts:36`

### 2. Verify Signature

**Endpoint:** `POST /verify`

**Purpose:** Verify the signed message and receive JWT tokens

```typescript
const response = await ApiService.verifySignature(
  walletAddress,
  signature,
  message
);

if (response.success) {
  const { accessToken, refreshToken, user } = response.data;
  // Tokens are automatically stored by ApiService
  // Save user info to Redux store
}
```

**Backend Route:** `services/auth-service/src/routes/auth.routes.ts:50`

### 3. Token Refresh

**Endpoint:** `POST /refresh`

**Handled automatically** by ApiService when a 401 response is received.

**Backend Route:** `services/auth-service/src/routes/auth.routes.ts:70`

### 4. Logout

**Endpoint:** `POST /logout`

```typescript
await ApiService.logout();
// Tokens are automatically cleared
```

**Backend Route:** `services/auth-service/src/routes/auth.routes.ts:103`

## Wallet Operations

### Get Balance

**Endpoint:** `GET /api/v1/wallet/balance/:address`

```typescript
const response = await ApiService.getBalance(walletAddress, 'payo');
if (response.success) {
  const { balanceWei, decimals, symbol } = response.data;
  // Convert wei to human-readable format
  const balance = (BigInt(balanceWei) / BigInt(10 ** decimals)).toString();
}
```

**Backend Route:** `services/wallet-service/src/routes/wallet.routes.ts:38`

**Query Parameters:**
- `token`: 'payo' | 'native' (default: 'payo' if PAYO_TOKEN_ADDRESS is set)

### Get Gas Price

**Endpoint:** `GET /api/v1/wallet/gas`

```typescript
const response = await ApiService.getGasPrice();
if (response.success) {
  const { gasPriceWei, chainId } = response.data;
}
```

**Backend Route:** `services/wallet-service/src/routes/wallet.routes.ts:68`

### RPC Proxy

**Endpoint:** `POST /api/v1/wallet/rpc`

**Purpose:** Execute whitelisted RPC methods against the blockchain

```typescript
const response = await ApiService.rpcCall('eth_blockNumber', []);
if (response.success) {
  const blockNumber = response.data.result;
}
```

**Backend Route:** `services/wallet-service/src/routes/wallet.routes.ts:83`

**Whitelisted Methods:**
- `eth_blockNumber`
- `eth_chainId`
- `eth_getBalance`
- `eth_call`
- `eth_gasPrice`
- `eth_sendRawTransaction`

## Payment Processing

### Submit Payment (Meta-Transaction)

**Endpoint:** `POST /api/v1/payment/submit`

**Authentication:** Required (JWT)

**Idempotency:** Supported via `idempotencyKey`

```typescript
import { v4 as uuidv4 } from 'uuid';

// 1. Build ForwardRequest
const forwardRequest = {
  from: userWalletAddress,
  to: paymentProcessorAddress,
  value: '0',
  gas: gasLimit.toString(),
  nonce: nonce.toString(),
  data: encodedFunctionCall,
};

// 2. Sign the ForwardRequest (EIP-712)
const signature = await signForwardRequest(forwardRequest);

// 3. Submit to backend
const idempotencyKey = uuidv4();
const response = await ApiService.submitPayment(
  forwardRequest,
  signature,
  idempotencyKey
);

if (response.success) {
  const { transactionId, status, txHash } = response.data;
  // status can be: 'submitted' | 'pending' | 'confirmed' | 'failed'
}
```

**Backend Route:** `services/payment-service/src/routes/payment.routes.ts:62`

**Request Body:**
```typescript
{
  forwardRequest: {
    from: string;
    to: string;
    value: string;
    gas: string;
    nonce: string;
    data: string;
  };
  signature: string;
  idempotencyKey: string;
}
```

**Response:**
```typescript
{
  transactionId: string;
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  message: string;
}
```

### Get Payment Status

**Endpoint:** `GET /api/v1/payment/status?idempotencyKey={key}`

**Authentication:** Required (JWT)

```typescript
const response = await ApiService.getPaymentStatus(idempotencyKey);
if (response.success) {
  const { transactionId, status, txHash, confirmedAt } = response.data;
}
```

**Backend Route:** `services/payment-service/src/routes/payment.routes.ts:105`

### List Transactions

**Endpoint:** `GET /api/v1/payment/transactions`

**Authentication:** Required (JWT)

```typescript
const response = await ApiService.getTransactions({
  walletAddress: userWalletAddress,
  status: 'confirmed',
  limit: 20,
  offset: 0,
});

if (response.success) {
  const { transactions, total, limit, offset } = response.data;
}
```

**Backend Route:** `services/payment-service/src/routes/payment.routes.ts:126`

**Query Parameters:**
- `userId`: Filter by user ID
- `walletAddress`: Filter by wallet address
- `status`: Filter by status (submitted|pending|confirmed|failed)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

### Get Transaction Details

**Endpoint:** `GET /api/v1/payment/transactions/:id`

**Authentication:** Required (JWT)

```typescript
const response = await ApiService.getTransactionById(transactionId);
if (response.success) {
  const { transaction } = response.data;
}
```

**Backend Route:** `services/payment-service/src/routes/payment.routes.ts:153`

## Merchant Operations

### Register as Merchant

**Endpoint:** `POST /register`

**Authentication:** Required (JWT)

```typescript
const response = await ApiService.registerMerchant({
  businessName: 'My Coffee Shop',
  businessType: 'food',
  walletAddress: merchantWalletAddress,
  email: 'contact@coffeeshop.com',
  phone: '+1234567890',
});

if (response.success) {
  const { merchant } = response.data;
  // merchant.merchantId, merchant.kycStatus, etc.
}
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:17`

**Business Types:**
- `retail`
- `food`
- `service`
- `online`
- `other`

### Get Merchant Profile

**Endpoint:** `GET /profile`

**Authentication:** Required (JWT + Merchant role)

```typescript
const response = await ApiService.getMerchantProfile();
if (response.success) {
  const { merchant } = response.data;
}
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:64`

### Update Merchant Profile

**Endpoint:** `PUT /profile`

**Authentication:** Required (JWT + Merchant role)

```typescript
const response = await ApiService.updateMerchantProfile({
  businessName: 'New Business Name',
  email: 'newemail@example.com',
});
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:70`

### Submit KYC

**Endpoint:** `POST /kyc`

**Authentication:** Required (JWT + Merchant role)

```typescript
const response = await ApiService.submitKYC({
  documentType: 'passport',
  documentNumber: 'AB123456',
});

if (response.success) {
  const { message, status } = response.data;
  // status: 'submitted' (waiting for admin approval)
}
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:108`

### Generate Static QR Code

**Endpoint:** `POST /qr/static`

**Authentication:** Required (JWT + Merchant role + KYC Approved)

**Purpose:** Generate a QR code with merchant address only (no fixed amount)

```typescript
const response = await ApiService.generateStaticQR();
if (response.success) {
  const { qrCode } = response.data;
  // qrCode.qrData contains JSON with merchant address
  // qrCode.qrCodeId for reference
}
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:145`

### Generate Dynamic QR Code

**Endpoint:** `POST /qr/dynamic`

**Authentication:** Required (JWT + Merchant role + KYC Approved)

**Purpose:** Generate a QR code with amount, invoice ID, and expiry time

```typescript
const response = await ApiService.generateDynamicQR({
  amount: '100000000', // Amount in token base units
  currency: 'USDC',
  invoiceId: 'INV-12345',
  expiresIn: 15, // Minutes (default: 15)
});

if (response.success) {
  const { qrCode } = response.data;
  // qrCode.qrData contains full payment details
  // qrCode.expiryTime indicates when it expires
}
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:172`

### List QR Codes

**Endpoint:** `GET /qr`

**Authentication:** Required (JWT + Merchant role)

```typescript
const response = await ApiService.listQRCodes();
if (response.success) {
  const { qrCodes } = response.data;
}
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:213`

### Get QR Code Details

**Endpoint:** `GET /qr/:qrCodeId`

**Authentication:** Required (JWT + Merchant role)

```typescript
const response = await ApiService.getQRCode(qrCodeId);
if (response.success) {
  const { qrCode } = response.data;
}
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:227`

### Deactivate QR Code

**Endpoint:** `DELETE /qr/:qrCodeId`

**Authentication:** Required (JWT + Merchant role)

```typescript
const response = await ApiService.deactivateQRCode(qrCodeId);
if (response.success) {
  // QR code is now inactive
}
```

**Backend Route:** `services/merchant-service/src/routes/merchant.routes.ts:247`

## Error Handling

All API methods return a consistent `ApiResponse<T>` structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**Example:**

```typescript
const response = await ApiService.getBalance(address);

if (response.success) {
  // Happy path
  const balance = response.data.balanceWei;
} else {
  // Error handling
  const { code, message, details } = response.error;

  if (code === 'INVALID_ADDRESS') {
    // Handle invalid address
  } else if (code === 'NETWORK_ERROR') {
    // Handle network error
  }
}
```

**Common Error Codes:**

- `INVALID_ADDRESS` - Invalid Ethereum address format
- `INVALID_REQUEST` - Request validation failed
- `NETWORK_ERROR` - Network/connectivity issue
- `RPC_ERROR` - Blockchain RPC error
- `UNAUTHORIZED` - Authentication required or failed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `METHOD_NOT_ALLOWED` - RPC method not whitelisted

## Configuration

**Location:** `src/constants/index.ts`

```typescript
export const API = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  SERVICES: {
    AUTH: 'http://localhost:3001',
    WALLET: 'http://localhost:3002',
    PAYMENT: 'http://localhost:3004',
    MERCHANT: 'http://localhost:3007',
    GATEWAY: 'http://localhost:3000',
  },
  // ... endpoints
}
```

### Environment Variables

Create `.env` file in the project root:

```bash
# API Base URLs (for production)
API_BASE_URL=https://api.payo.app
AUTH_SERVICE_URL=https://auth.payo.app
WALLET_SERVICE_URL=https://wallet.payo.app
PAYMENT_SERVICE_URL=https://payment.payo.app
MERCHANT_SERVICE_URL=https://merchant.payo.app

# Local Development (default values if not set)
# API_BASE_URL=http://localhost:3000
# AUTH_SERVICE_URL=http://localhost:3001
# etc.
```

## Integration Checklist

- [x] ApiService implementation with all backend endpoints
- [x] TypeScript types for all request/response payloads
- [x] JWT token management with automatic refresh
- [x] Error handling and retry logic
- [ ] Implement wallet signature flow in auth screens
- [ ] Update payment flow to use meta-transactions
- [ ] Integrate balance fetching in dashboard
- [ ] Add transaction list screen with backend data
- [ ] Implement merchant registration flow
- [ ] Add QR code generation for merchants
- [ ] Add proper error UI components
- [ ] Add loading states for all API calls
- [ ] Implement offline mode with cache
- [ ] Add API request retry with exponential backoff
- [ ] Setup environment-specific API URLs

## Testing

### Local Development

1. Start payo-backend services:
```bash
cd /path/to/payo-backend
pm2 list  # Check all services are running
```

2. Update API URLs in the mobile app to point to your local machine:
```typescript
// For iOS Simulator
const API_BASE = 'http://localhost:3001';

// For Android Emulator
const API_BASE = 'http://10.0.2.2:3001';

// For Physical Device
const API_BASE = 'http://192.168.1.x:3001';  // Your machine's IP
```

3. Test authentication flow
4. Test payment submission
5. Test transaction queries

### Production

- Use production URLs from environment variables
- Ensure SSL/TLS for all API calls
- Implement certificate pinning for security
- Add request signing for sensitive operations

## Next Steps

1. **Implement Authentication UI**
   - Update LoginScreen to use wallet signature flow
   - Integrate ApiService.getChallenge() and ApiService.verifySignature()
   - Store JWT tokens securely

2. **Update Payment Flow**
   - Integrate meta-transaction signing
   - Use ApiService.submitPayment()
   - Poll for transaction status updates

3. **Dashboard Integration**
   - Fetch real balance from ApiService.getBalance()
   - Display transaction history from ApiService.getTransactions()
   - Show real-time price updates

4. **Merchant Features**
   - Add merchant registration screen
   - Implement KYC submission
   - Add QR code generation UI

## Support

For backend API documentation, see:
- `/Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend/CLAUDE.md`
- Backend service READMEs in `payo-backend/services/*/README.md`
