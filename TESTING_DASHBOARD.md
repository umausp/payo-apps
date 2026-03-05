# Testing Dashboard with Backend - Quick Guide

## Prerequisites

### 1. Backend Services Running

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend
pm2 list
```

**Required:**
- ✅ wallet-service (port 3002) - Balance & gas price
- ✅ payment-service (port 3004) - Transaction history
- ✅ auth-service (port 3001) - Authentication
- ✅ MongoDB (port 27017) - Data storage
- ✅ Redis (port 6379) - Caching
- ✅ hardhat-node (port 8545) - Local blockchain

**Start all if needed:**
```bash
./scripts/restart-all-pm2.sh
```

### 2. Mobile App Configuration

Update API URLs for your environment in `src/constants/index.ts`:

```typescript
export const API = {
  SERVICES: {
    WALLET: 'http://localhost:3002',    // ← iOS Simulator
    PAYMENT: 'http://localhost:3004',   // ← iOS Simulator
    // For Android Emulator: http://10.0.2.2:3002
    // For Physical Device: http://192.168.1.x:3002
  },
}
```

## Testing Steps

### Step 1: Login and Navigate to Dashboard

1. **Launch the app**
2. **Login with wallet** (see `TESTING_AUTH_FLOW.md`)
3. **Should navigate to Dashboard automatically**

### Step 2: Verify Balance Display

**What to Check:**

1. **Balance Card Shows:**
   ```
   Total Balance
   1,234.56 PAYO
   ≈ $1,234.56 USD
   ```

2. **Initial Load:**
   - Should show "Loading..." briefly
   - Then shows actual balance from backend

3. **Backend Call:**
   ```bash
   # Check wallet-service logs
   pm2 logs wallet-service --lines 20
   ```

   **Should see:**
   ```
   GET /api/v1/wallet/balance/0xYourAddress?token=payo
   Response: { balanceWei: "...", decimals: 18, symbol: "PAYO" }
   ```

4. **Test with React Native Debugger:**
   - Open Network tab
   - Should see request to `http://localhost:3002/api/v1/wallet/balance/...`
   - Check response contains `balanceWei`, `decimals`, `symbol`

**Expected Balance Format:**
- Shows 2 decimal places: `1234.56 PAYO`
- Shows USD value: `≈ $1234.56 USD`
- Updates from backend, not hardcoded

### Step 3: Verify Wallet Info Card

**What to Check:**

1. **Info Card Shows:**
   ```
   Wallet Address: 0x1234...5678
   Network Gas: 25 Gwei
   ```

2. **Wallet Address:**
   - First 6 chars + "..." + last 4 chars
   - Matches your actual wallet address

3. **Network Gas:**
   - Shows current gas price in Gwei
   - Not hardcoded, from backend

4. **Backend Call:**
   ```bash
   pm2 logs wallet-service --lines 20
   ```

   **Should see:**
   ```
   GET /api/v1/wallet/gas
   Response: { gasPriceWei: "...", chainId: 137 }
   ```

### Step 4: Verify Transaction History

**What to Check:**

1. **If No Transactions:**
   ```
   Recent Transactions
   No transactions yet
   Scan a QR code to make your first payment
   ```

2. **If Transactions Exist:**
   ```
   Recent Transactions (3)
   ┌─────────────────────────────┐
   │ 100.00 USDC   ✓ Confirmed  │
   │ To: 0xabcd...1234 2024-03-05│
   └─────────────────────────────┘
   ```

3. **Transaction Status Colors:**
   - **✓ Confirmed** = Green
   - **⏳ Pending** = Yellow
   - **📤 Submitted** = Blue
   - **✗ Failed** = Red

4. **Backend Call:**
   ```bash
   pm2 logs payment-service --lines 20
   ```

   **Should see:**
   ```
   GET /api/v1/payment/transactions?walletAddress=0x...&limit=50
   Response: { transactions: [...], total: 3 }
   ```

5. **Test with React Native Debugger:**
   - Network tab should show request to payment-service
   - Response should contain array of transactions
   - Check JWT token is included in Authorization header

### Step 5: Test Pull-to-Refresh

1. **Pull down on the dashboard**
2. **Should see:**
   - Refresh spinner appears
   - All data updates simultaneously

3. **Backend Calls (check logs):**
   ```bash
   # Should see 3 requests in parallel:
   pm2 logs wallet-service --lines 30
   pm2 logs payment-service --lines 30
   ```

   **Expected:**
   ```
   [wallet-service] GET /api/v1/wallet/balance/...
   [wallet-service] GET /api/v1/wallet/gas
   [payment-service] GET /api/v1/payment/transactions
   ```

4. **Timing:**
   - All 3 requests happen simultaneously (Promise.all)
   - Should complete in < 1 second
   - Spinner stops after all complete

5. **Data Updates:**
   - Balance updates (if changed)
   - Transactions refresh (new ones appear)
   - Gas price updates

### Step 6: Test with Real Transaction

**Create a test transaction:**

1. **Via Backend API:**
   ```bash
   # Assuming you have a JWT token
   TOKEN="your_jwt_token"

   curl -X POST http://localhost:3004/api/v1/payment/submit \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "forwardRequest": {
         "from": "0xYourAddress",
         "to": "0xPaymentProcessor",
         "value": "0",
         "gas": "200000",
         "nonce": "0",
         "data": "0x..."
       },
       "signature": "0x...",
       "idempotencyKey": "test-'$(date +%s)'"
     }'
   ```

2. **Pull to refresh on dashboard**

3. **Should see new transaction:**
   - Appears at top of list
   - Shows status (submitted/pending)
   - Shows amount and recipient

4. **Wait for confirmation** (if indexer is running)
   - Status changes to "confirmed"
   - Pull to refresh to see update

### Step 7: Test Error Scenarios

#### Scenario 1: Wallet Service Offline

1. **Stop wallet-service:**
   ```bash
   pm2 stop wallet-service
   ```

2. **Pull to refresh**

3. **Should:**
   - Show last cached balance
   - Log error to console
   - Not crash the app

4. **Check console:**
   ```
   [Error] Failed to fetch balance from backend
   [Fallback] Using local blockchain service
   ```

5. **Start service again:**
   ```bash
   pm2 start wallet-service
   ```

#### Scenario 2: Payment Service Offline

1. **Stop payment-service:**
   ```bash
   pm2 stop payment-service
   ```

2. **Pull to refresh**

3. **Should:**
   - Show last cached transactions
   - Log error to console
   - Not crash the app

4. **Start service again:**
   ```bash
   pm2 start payment-service
   ```

#### Scenario 3: Network Timeout

1. **Simulate slow network** (in React Native Debugger)
2. **Pull to refresh**
3. **Should:**
   - Show loading spinner
   - Eventually timeout
   - Show last known data

### Step 8: Verify Redux State

**Open React Native Debugger:**

1. **Check wallet state:**
   ```javascript
   state.wallet = {
     wallet: { address: "0x...", ... },
     balance: "1234.56",
     fiatBalance: "1234.56",
     isLoading: false,
     error: null
   }
   ```

2. **Check transaction state:**
   ```javascript
   state.transaction = {
     transactions: [
       {
         id: "...",
         hash: "0x...",
         from: "0x...",
         to: "0x...",
         amount: "100.00",
         status: "confirmed",
         timestamp: 1234567890,
         blockNumber: 12345,
         confirmations: 12
       }
     ],
     isLoading: false,
     error: null
   }
   ```

3. **Check auth state:**
   ```javascript
   state.auth = {
     isAuthenticated: true,
     user: {
       userId: "...",
       walletAddress: "0x...",
       createdAt: "..."
     }
   }
   ```

## Success Criteria

✅ **Balance Display:**
- Shows loading state initially
- Fetches from backend wallet-service
- Displays PAYO balance with 2 decimals
- Shows USD equivalent
- Updates on pull-to-refresh

✅ **Wallet Info:**
- Shows truncated wallet address
- Shows current gas price in Gwei
- Updates on pull-to-refresh

✅ **Transaction History:**
- Fetches from backend payment-service
- Shows recent 5 transactions
- Correct status colors (green/yellow/red)
- Shows date and recipient
- Updates on pull-to-refresh

✅ **Pull-to-Refresh:**
- Refreshes all data simultaneously
- Shows loading indicator
- Completes in < 2 seconds
- Handles errors gracefully

✅ **Error Handling:**
- Falls back to local data on backend error
- Doesn't crash on network timeout
- Shows cached data when offline
- Logs errors for debugging

## Common Issues & Solutions

### Issue: Balance shows "Loading..." forever

**Solution:**
1. Check wallet-service is running: `pm2 list`
2. Check wallet address exists in Redux state
3. Check API URL is correct for your environment
4. Check backend logs: `pm2 logs wallet-service`
5. Test endpoint manually:
   ```bash
   curl http://localhost:3002/api/v1/wallet/balance/0xYourAddress?token=payo
   ```

### Issue: Transactions don't appear

**Solution:**
1. Check payment-service is running: `pm2 list`
2. Check you're logged in (JWT token exists)
3. Check backend logs: `pm2 logs payment-service`
4. Verify transactions exist in MongoDB:
   ```bash
   mongosh
   use payo
   db.payment_transactions.find({ walletAddress: "0x..." }).limit(5)
   ```

### Issue: Gas price doesn't show

**Solution:**
1. Check wallet-service `/gas` endpoint
2. Check hardhat-node is running (RPC provider)
3. Test endpoint:
   ```bash
   curl http://localhost:3002/api/v1/wallet/gas
   ```

### Issue: Pull-to-refresh doesn't work

**Solution:**
1. Check all 3 services are running (wallet, payment, hardhat)
2. Check network connectivity
3. Look for errors in console logs
4. Check Redux state updates

### Issue: JWT token missing/expired

**Solution:**
1. Re-login to get fresh tokens
2. Check token is stored in ApiService
3. Check Authorization header in network requests
4. Token should be: `Authorization: Bearer eyJ...`

## Performance Benchmarks

**Expected Performance:**
- Dashboard load: < 2 seconds
- Balance fetch: < 500ms
- Transaction fetch: < 500ms
- Gas price fetch: < 300ms
- Pull-to-refresh: < 1 second (parallel)

**If slower:**
- Check backend service performance
- Check MongoDB query performance
- Check network latency
- Consider adding more caching

## Demo Script

1. **Show login flow** → Dashboard appears
2. **Point to balance:** "This is fetched from wallet-service"
3. **Point to gas price:** "Real-time network gas price"
4. **Show transactions:** "Transaction history from payment-service"
5. **Pull to refresh:** "All data updates in real-time"
6. **Show React Native Debugger:** "See the API calls"
7. **Show backend logs:** "See the backend processing"

Your dashboard is production-ready with full backend integration! 🎉
