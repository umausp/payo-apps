# Testing Send Payment Flow

Complete guide to test the payment flow in PAYO app.

## Prerequisites

### 1. Backend Services Running

All backend services must be running on the correct ports:

```bash
# Check if services are running
lsof -i :3001  # Auth Service
lsof -i :3002  # Wallet Service
lsof -i :3004  # Payment Service

# If not running, start them
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend

# In separate terminals:
npm run start:auth    # Port 3001
npm run start:wallet  # Port 3002
npm run start:payment # Port 3004
```

### 2. MongoDB Running

```bash
# Check MongoDB
mongosh

# Or start MongoDB
brew services start mongodb-community
```

### 3. Blockchain Node/RPC

The app uses `https://polygon-rpc.com` by default (check `src/constants/index.ts`).

For local testing, you can use:
- Ganache (local blockchain)
- Hardhat node
- Or any Polygon testnet RPC

### 4. App Built and Running

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps

# Clear cache and rebuild
npm start -- --reset-cache

# In another terminal
npm run android
```

## Send Payment Flow Architecture

### Flow Diagram:
```
User → QR Scanner → Payment Preview → Payment Processing → Payment Success
         ↓              ↓                   ↓                      ↓
      Scan QR      Confirm Amount    Submit to Backend      Show Receipt
                                          ↓
                                   Blockchain Transaction
```

### Technical Flow:
```
1. QRScannerScreen
   → Scans QR code with recipient address & amount
   → Navigates to PaymentPreviewScreen

2. PaymentPreviewScreen
   → Shows recipient, amount, gas fee
   → User confirms
   → Calls useTransactions().send()

3. useTransactions Hook
   → Dispatches sendPayment() thunk
   → Calls SendPaymentUseCase

4. SendPaymentUseCase
   → Validates address & amount
   → Gets wallet & private key
   → Estimates gas
   → Calls TransactionRepository.sendTransaction()

5. TransactionRepository
   → Calls BlockchainService.sendTransaction()
   → Returns transaction with hash
   → Saves to local storage

6. BlockchainService
   → Signs transaction with private key
   → Sends to blockchain via RPC
   → Returns transaction receipt

7. PaymentProcessingScreen
   → Shows loading state
   → Simulates confirmation (3 seconds)
   → Navigates to PaymentSuccessScreen

8. PaymentSuccessScreen
   → Shows success message
   → Displays transaction hash
   → Shows recipient address
```

## Step-by-Step Testing

### Step 1: Start Logging

**Terminal 1 - Watch all logs:**
```bash
adb logcat -c  # Clear logs
adb logcat | grep -E "API|Payment|Transaction|Blockchain"
```

**Terminal 2 - Watch only API logs:**
```bash
adb logcat | grep "\[API"
```

### Step 2: Login to App

1. Open the app
2. Login with your wallet
3. Verify you see in logs:
```
[API Request] POST http://10.0.2.2:3001/api/v1/auth/challenge
[API Response] 200 http://10.0.2.2:3001/api/v1/auth/challenge
[API Request] POST http://10.0.2.2:3001/api/v1/auth/verify
[API Response] 200 http://10.0.2.2:3001/api/v1/auth/verify
```

### Step 3: Check Dashboard

The dashboard should load:
- Your wallet balance
- Recent transactions (if any)
- Gas price

**Expected logs:**
```
[API Request] GET http://10.0.2.2:3002/api/v1/wallet/balance/0x...
[API Response] 200 http://10.0.2.2:3002/api/v1/wallet/balance/0x...
[API Request] GET http://10.0.2.2:3002/api/v1/wallet/gas
[API Response] 200 http://10.0.2.2:3002/api/v1/wallet/gas
[API Request] GET http://10.0.2.2:3004/api/v1/payment/transactions
[API Response] 200 http://10.0.2.2:3004/api/v1/payment/transactions
```

### Step 4: Generate Test QR Code

**Option A: Use Online QR Generator**
Create QR with this JSON:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "10",
  "merchantInfo": {
    "name": "Test Merchant",
    "id": "test123"
  }
}
```

**Option B: Use Backend Merchant Service**
```bash
# If you have merchant registration
curl -X POST http://localhost:3007/qr/dynamic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": "10",
    "currency": "PAYO",
    "description": "Test payment"
  }'
```

### Step 5: Scan QR Code

1. Click "Scan QR" button on Dashboard
2. Grant camera permission if needed
3. Point camera at QR code
4. App should navigate to Payment Preview

**Expected logs:**
```
[Navigation] QRScanner → PaymentPreview
[QR Data] { address: "0x...", amount: "10", ... }
```

### Step 6: Preview Payment

On Payment Preview screen you should see:
- Recipient address (truncated)
- Amount input field (pre-filled if QR had amount)
- Gas fee estimate
- Confirm button

**Expected logs:**
```
[API Request] GET http://10.0.2.2:3002/api/v1/wallet/gas
[API Response] 200 http://10.0.2.2:3002/api/v1/wallet/gas
```

### Step 7: Confirm Payment

1. Verify amount is correct
2. Click "Confirm Payment" button
3. Watch logs closely

**Expected logs sequence:**
```
[Payment] Initiating payment to 0x... for 10 PAYO
[Blockchain] Estimating gas...
[API Request] GET http://10.0.2.2:3002/api/v1/wallet/gas
[API Response] 200 http://10.0.2.2:3002/api/v1/wallet/gas

[Blockchain] Signing transaction...
[Blockchain] Sending transaction to RPC...
[Blockchain] Transaction sent: 0x[txHash]

[API Request] POST http://10.0.2.2:3004/api/v1/payment/submit
[API Request Body] {
  "forwardRequest": { ... },
  "signature": "0x...",
  "idempotencyKey": "..."
}
[API Response] 200 http://10.0.2.2:3004/api/v1/payment/submit
[API Response Data] {
  "transactionId": "...",
  "txHash": "0x...",
  "status": "submitted"
}

[Navigation] PaymentPreview → PaymentProcessing
```

### Step 8: Processing Screen

Shows:
- Loading spinner
- "Processing Payment" message
- Transaction hash (truncated)

The screen simulates a 3-second wait (line 19-22 in PaymentProcessingScreen.tsx).

**Expected logs:**
```
[Payment Processing] Transaction: 0x...
[Navigation] PaymentProcessing → PaymentSuccess (after 3s)
```

### Step 9: Success Screen

Shows:
- Success checkmark
- Amount sent
- Transaction hash
- Recipient address
- Status
- "Back to Dashboard" button

### Step 10: Verify on Dashboard

1. Click "Back to Dashboard"
2. Transaction should appear in "Recent Transactions"
3. Status should show "Submitted" initially

**Expected logs:**
```
[API Request] GET http://10.0.2.2:3004/api/v1/payment/transactions
[API Response] 200 http://10.0.2.2:3004/api/v1/payment/transactions
[Transactions] Loaded 1 transaction(s)
```

## What to Look For in Logs

### Successful Payment:
```
✓ QR scanned successfully
✓ Gas estimated
✓ Transaction signed
✓ Transaction sent to blockchain (hash received)
✓ Payment submitted to backend (200 response)
✓ Navigation to success screen
✓ Transaction appears in dashboard
```

### Common Errors:

**1. Insufficient Balance**
```
[Payment Error] Insufficient balance for this transaction
[Error] Balance: 5 PAYO, Required: 10 PAYO + gas
```

**2. Invalid Address**
```
[Payment Error] Invalid recipient address
```

**3. Network Error**
```
[API Error] Network Error
[Error] Failed to connect to http://10.0.2.2:3004
```

**4. Backend Not Running**
```
[API Error] 404 Not Found
[API Error] ECONNREFUSED
```

**5. RPC Error**
```
[Blockchain Error] Failed to send transaction
[Error] Could not connect to RPC endpoint
```

**6. Gas Estimation Failed**
```
[Blockchain Error] Gas estimation failed
```

## Debugging Tips

### Check Backend Logs

**Auth Service:**
```bash
# In payo-backend directory
npm run start:auth

# Watch for:
POST /api/v1/auth/challenge
POST /api/v1/auth/verify
```

**Payment Service:**
```bash
npm run start:payment

# Watch for:
POST /api/v1/payment/submit
GET /api/v1/payment/transactions
```

**Wallet Service:**
```bash
npm run start:wallet

# Watch for:
GET /api/v1/wallet/balance/:address
GET /api/v1/wallet/gas
```

### Check MongoDB

```bash
mongosh

use payo_auth
db.users.find()

use payo_payment
db.transactions.find().sort({createdAt: -1}).limit(5)
```

### Check In-App Logs

1. Go to Settings → Developer → View API Logs
2. Scroll to see recent API calls
3. Look for failed requests or error responses

### Check Network Diagnostics

1. Go to Settings → Developer → Test Backend Connection
2. Verifies connectivity to all services
3. Shows which services are reachable

### Trace Code Path

**Files involved in payment flow:**

1. **QRScannerScreen.tsx** (line 1-100)
   - Handles QR scanning
   - Parses QR data
   - Navigates to preview

2. **PaymentPreviewScreen.tsx** (line 1-133)
   - Shows payment details
   - Calls `useTransactions().send()`

3. **useTransactions.ts** (hook)
   - Dispatches Redux action
   - Uses `transactionSlice.ts`

4. **transactionSlice.ts** (line 27-47)
   - `sendPayment` thunk
   - Calls `SendPaymentUseCase`

5. **SendPaymentUseCase.ts** (line 21-74)
   - Validates inputs
   - Gets wallet & private key
   - Calls `TransactionRepository.sendTransaction()`

6. **TransactionRepository.ts** (line 18-58)
   - Calls `BlockchainService.sendTransaction()`
   - Saves transaction locally

7. **BlockchainService.ts**
   - Signs transaction
   - Sends to blockchain
   - Returns transaction receipt

## Test with Different Scenarios

### 1. Small Amount (Should Succeed)
```json
{"address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "amount": "0.01"}
```

### 2. Large Amount (May Fail - Insufficient Balance)
```json
{"address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "amount": "10000"}
```

### 3. Invalid Address (Should Fail Validation)
```json
{"address": "0xinvalid", "amount": "10"}
```

### 4. Zero Amount (Should Fail Validation)
```json
{"address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", "amount": "0"}
```

### 5. With Metadata
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "10",
  "merchantInfo": {
    "name": "Coffee Shop",
    "orderId": "ORD-123"
  }
}
```

## Verify Transaction on Blockchain

### If using Polygon Testnet:
```
https://mumbai.polygonscan.com/tx/[TRANSACTION_HASH]
```

### If using Local Ganache:
Check Ganache UI for transaction details

### Using RPC:
```bash
curl -X POST https://polygon-rpc.com \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getTransactionReceipt",
    "params": ["0x[TRANSACTION_HASH]"],
    "id": 1
  }'
```

## Quick Checklist

- [ ] Backend services running (3001, 3002, 3004)
- [ ] MongoDB running
- [ ] App built with cleared cache
- [ ] Logged into app successfully
- [ ] Can see balance on dashboard
- [ ] QR code generated with valid address
- [ ] Can scan QR code (camera permission granted)
- [ ] Payment preview shows correct details
- [ ] Confirm payment button works
- [ ] Logs show transaction hash
- [ ] Backend received payment submission (200 response)
- [ ] Processing screen shows
- [ ] Success screen shows transaction details
- [ ] Transaction appears in dashboard

## Troubleshooting

### Payment Button Disabled
- Check if amount is filled
- Check if wallet has sufficient balance
- Look for console errors

### QR Scanner Not Working
- Check camera permission
- Try manual input instead
- Check QR code format

### Transaction Pending Forever
- Check blockchain RPC connection
- Verify transaction on block explorer
- Check gas price (might be too low)

### Backend Errors
- Verify JWT token is valid
- Check if services are running
- Review backend logs for errors

### App Crashes
- Check logcat for crash logs
- Look for JavaScript errors in Metro console
- Check for null/undefined values

## Success Criteria

A successful payment flow should:
1. Complete in under 10 seconds
2. Show clear feedback at each step
3. Log all API calls without errors
4. Create a transaction with valid hash
5. Store transaction locally
6. Submit to backend successfully (200 response)
7. Display transaction in dashboard
8. Not crash or freeze the app

## Next Steps After Testing

Once payment flow works:
1. Test transaction status polling
2. Test transaction history refresh
3. Test multiple payments in sequence
4. Test network interruption scenarios
5. Test with different wallet addresses
6. Test logout and re-login (transactions persist)
