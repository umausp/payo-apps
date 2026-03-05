# Logging Improvements - All APIs Now Logged

## What Was Fixed

**Problem:** Logger was not capturing all API calls - specifically Auth Service and Wallet Service API calls were missing from logs.

**Root Cause:** Only `paymentClient` and `merchantClient` had logging interceptors. The `authClient` and `walletClient` were created without any logging.

**Solution:** Separated logging and authentication concerns:
1. Created dedicated `setupLoggingInterceptor()` - handles logging only
2. Applied logging interceptor to ALL clients (auth, wallet, payment, merchant)
3. Refactored `setupAuthInterceptor()` - handles JWT tokens only
4. Applied auth interceptor only to payment and merchant clients

## What's Now Logged

### All API Calls Now Have Full Logging:

**Auth Service (now logged):**
- POST /auth/challenge - Get authentication challenge
- POST /auth/verify - Verify signature and get JWT
- POST /auth/refresh - Refresh access token
- POST /auth/logout - Logout user

**Wallet Service (now logged):**
- GET /wallet/balance/:address - Get wallet balance
- GET /wallet/gas - Get current gas price
- POST /wallet/rpc - RPC calls to blockchain

**Payment Service (already logged):**
- POST /payment/submit - Submit payment transaction
- GET /payment/status - Get payment status
- GET /payment/transactions - List transactions
- GET /payment/transactions/:id - Get transaction details

**Merchant Service (already logged):**
- POST /merchant/register - Register as merchant
- GET /merchant/profile - Get merchant profile
- PUT /merchant/profile - Update merchant profile
- POST /merchant/kyc - Submit KYC
- POST /merchant/qr/static - Generate static QR
- POST /merchant/qr/dynamic - Generate dynamic QR
- GET /merchant/qr - List QR codes

## Enhanced Console Logging

Each API call now logs detailed information:

### Request Logs:
```
[API Request] POST http://10.0.2.2:3001/auth/challenge
[API Request Body] {
  "walletAddress": "0x..."
}
```

### Response Logs:
```
[API Response] 200 http://10.0.2.2:3001/auth/challenge (145ms)
[API Response Data] {
  "message": "Sign this message...",
  "nonce": "..."
}
```

### Error Logs:
```
[API Error] 401 http://10.0.2.2:3004/payment/transactions Network Error
[API Error Data] {
  "code": "UNAUTHORIZED",
  "error": "Invalid token"
}
```

## How to View Logs

### 1. React Native Console
All logs appear in Metro bundler console:
```bash
# In the terminal where you ran npm start
```

### 2. Android Logcat
View all logs in real-time:
```bash
# View all React Native logs
adb logcat | grep -E "ReactNativeJS|API"

# Or use filtered view
adb logcat -s ReactNativeJS:V

# Or view everything
adb logcat
```

**Tip:** To see only API logs:
```bash
adb logcat | grep "\[API"
```

### 3. iOS Console
```bash
# In another terminal while app is running
npx react-native log-ios
```

### 4. In-App Log Viewer
- Open app → Settings → Developer → View API Logs
- Shows all API logs from file
- Refresh, Share, and Clear functionality

### 5. Chrome DevTools (if using Remote JS Debugging)
1. Shake device → Enable Remote JS Debugging
2. Open Chrome DevTools (automatically opens)
3. View logs in Console tab

## File Logging

All API calls are also logged to file:
- **Location:** App's document directory
- **Filename:** `api_logs.log`
- **Rotation:** Automatic at 5MB
- **Content:** Full request/response details with sanitized sensitive data

**View file logs:**
1. Open app
2. Go to Settings → Developer → View API Logs
3. Or share logs via share button

## What to Look For

### During Logout
After implementing these changes, you should see:
```
[API Request] POST http://10.0.2.2:3001/auth/logout
[API Request Body] {
  "refreshToken": "eyJ..."
}
[API Response] 200 http://10.0.2.2:3001/auth/logout (67ms)
```

**Any subsequent API calls after logout will also be visible**, helping debug the network error issue.

### Network Errors
When network errors occur, you'll see:
```
[API Error] undefined http://10.0.2.2:3001/auth/challenge Network Error
[API Error Data] {
  message: "Network Error",
  ...
}
```

This provides:
- Which service failed (auth, wallet, payment)
- Full URL being called
- Error details
- Whether tokens were present

## Testing the Fix

### 1. Clear and Rebuild
```bash
# Stop Metro bundler (Ctrl+C)

# Clear cache
npm start -- --reset-cache

# In another terminal, rebuild
npm run android  # or npm run ios
```

### 2. Test API Logging
1. Open app
2. Login (should see auth API calls in logcat)
3. View Dashboard (should see wallet API calls)
4. Make a payment (should see payment API calls)
5. Check Settings → Developer → View API Logs

### 3. Test Logout Issue
1. Login successfully
2. Open another terminal: `adb logcat | grep "\[API"`
3. Click Logout
4. Watch for any API calls that happen after logout
5. Look for network errors in the logs

## What Changed in Code

**File:** `src/infrastructure/api/ApiService.ts`

### Added New Method (Line ~69):
```typescript
private setupLoggingInterceptor(client: AxiosInstance) {
  // Logs all requests and responses
  // Applied to ALL clients (auth, wallet, payment, merchant)
}
```

### Modified Constructor (Line ~40):
```typescript
private constructor() {
  this.authClient = this.createClient(API.SERVICES.AUTH);
  this.walletClient = this.createClient(API.SERVICES.WALLET);
  this.paymentClient = this.createClient(API.SERVICES.PAYMENT);
  this.merchantClient = this.createClient(API.SERVICES.MERCHANT);

  // NEW: Setup logging for ALL clients
  this.setupLoggingInterceptor(this.authClient);
  this.setupLoggingInterceptor(this.walletClient);
  this.setupLoggingInterceptor(this.paymentClient);
  this.setupLoggingInterceptor(this.merchantClient);

  // Setup JWT auth for authenticated clients only
  this.setupAuthInterceptor(this.paymentClient);
  this.setupAuthInterceptor(this.merchantClient);
}
```

### Refactored Auth Interceptor (Line ~146):
- Removed duplicate logging code
- Now only handles JWT token management
- Cleaner separation of concerns

## Debugging Logout Network Error

Now that all APIs are logged, follow these steps to find the logout issue:

### Step 1: Watch Logs During Logout
```bash
adb logcat -c  # Clear logcat
adb logcat | grep "\[API"
```

### Step 2: Click Logout in App

### Step 3: Analyze the Logs
Look for:
1. The logout API call itself (should succeed or fail clearly)
2. Any API calls AFTER logout completes
3. Which component is making the unauthorized call
4. What triggers it

### Expected Sequence:
```
[API Request] POST http://10.0.2.2:3001/auth/logout
[API Response] 200 http://10.0.2.2:3001/auth/logout (50ms)
# Tokens are now cleared
# App should navigate to login screen
# NO more API calls should happen
```

### If You See Unexpected Calls:
```
[API Request] POST http://10.0.2.2:3001/auth/logout
[API Response] 200 http://10.0.2.2:3001/auth/logout (50ms)
[API Request] GET http://10.0.2.2:3004/payment/transactions  # ← PROBLEM
[API Error] 401 http://10.0.2.2:3004/payment/transactions Unauthorized
```

This tells us:
- A component is trying to fetch transactions after logout
- Likely Dashboard or a hook that's still mounted
- Need to cancel pending requests or unmount components

## Summary

- All API calls are now logged (auth, wallet, payment, merchant)
- Logs show full URL, request body, response data, and timing
- Available in console, logcat, iOS console, and in-app viewer
- Enhanced logging will help identify the logout network error
- Ready for testing with `npm start -- --reset-cache` and rebuild

## Next Steps

1. **Rebuild the app** with cleared cache
2. **Watch logcat** while using the app: `adb logcat | grep "\[API"`
3. **Test logout** and observe which API call is failing
4. **Check in-app logs** in Settings → Developer → View API Logs
5. **Report findings** - which API is being called after logout and causing the error
