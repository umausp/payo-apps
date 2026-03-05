# Network Error Debugging Guide

## Error: `[API Error]`, undefined, `Network Error`

This error means the mobile app **cannot connect** to the backend services.

## Common Causes & Solutions

### 1. Wrong API URL for Your Environment ⚠️ MOST COMMON

**The Issue:**
- `localhost` only works on **iOS Simulator**
- Android Emulator needs `10.0.2.2` instead of `localhost`
- Physical devices need your computer's IP address (e.g., `192.168.1.x`)

**Current Configuration:**
```typescript
// src/constants/index.ts
SERVICES: {
  AUTH: 'http://localhost:3001',      // ❌ Won't work on Android
  WALLET: 'http://localhost:3002',    // ❌ Won't work on Android
  PAYMENT: 'http://localhost:3004',   // ❌ Won't work on Android
}
```

**Solution by Platform:**

#### iOS Simulator ✅
```typescript
AUTH: 'http://localhost:3001'  // Works fine
```

#### Android Emulator 🔧
```typescript
AUTH: 'http://10.0.2.2:3001'   // Use this instead
```

#### Physical Device (iPhone/Android) 📱
```typescript
AUTH: 'http://192.168.1.x:3001'  // Replace x with your computer's IP
```

**Quick Fix - Update `src/constants/index.ts`:**

See the updated file below with automatic platform detection.

---

### 2. Backend Services Not Running

**Check if services are running:**

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend
pm2 list
```

**Expected Output:**
```
┌────┬───────────────────┬─────────┬─────────┬──────────┐
│ id │ name              │ status  │ ↺       │ port     │
├────┼───────────────────┼─────────┼─────────┼──────────┤
│ 0  │ auth-service      │ online  │ 0       │ 3001     │
│ 1  │ wallet-service    │ online  │ 0       │ 3002     │
│ 2  │ payment-service   │ online  │ 0       │ 3004     │
│ 3  │ hardhat-node      │ online  │ 0       │ 8545     │
└────┴───────────────────┴─────────┴─────────┴──────────┘
```

**If services are stopped:**
```bash
./scripts/restart-all-pm2.sh
```

**Check individual service:**
```bash
pm2 logs auth-service --lines 20
```

---

### 3. Test Backend Connectivity

#### From Terminal (on your Mac):

```bash
# Test auth-service
curl http://localhost:3001/health

# Test wallet-service
curl http://localhost:3002/health

# Test payment-service
curl http://localhost:3004/health
```

**Expected Response:**
```json
{"status":"ok","service":"auth-service"}
```

**If you get connection refused:**
- Service is not running
- Check pm2 logs
- Restart the service

---

### 4. Get Your Computer's IP Address

**For Physical Device Testing:**

#### macOS:
```bash
ipconfig getifaddr en0  # WiFi
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Example Output:**
```
192.168.1.10
```

#### Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

---

### 5. iOS Simulator - Allow Local Network Access

**iOS 14+ requires explicit permission for local network access.**

**Add to `ios/payo-apps/Info.plist`:**
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

**Then rebuild:**
```bash
npm run ios
```

---

### 6. Android Emulator - Network Configuration

**Android Emulator maps:**
- `10.0.2.2` → Your computer's `localhost`
- `10.0.2.3` → First DNS server

**Add to `android/app/src/main/AndroidManifest.xml`:**
```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

**Then rebuild:**
```bash
npm run android
```

---

### 7. Firewall Blocking Connections

**macOS Firewall:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Ensure Node.js is allowed

**Or disable temporarily:**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

**Re-enable:**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

---

## Step-by-Step Debugging

### Step 1: Verify Backend is Running

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend
pm2 list
```

All services should show `online`.

### Step 2: Test from Terminal

```bash
curl http://localhost:3001/health
```

Should return `{"status":"ok"}`.

### Step 3: Check Your Environment

**Are you using:**
- iOS Simulator? → Use `localhost`
- Android Emulator? → Use `10.0.2.2`
- Physical Device? → Use your IP address

### Step 4: Update API URLs

Update `src/constants/index.ts` with correct URLs for your environment.

### Step 5: Rebuild the App

```bash
# Kill metro bundler
# CMD+C in the terminal running it

# Clear cache and rebuild
npm start -- --reset-cache

# In another terminal
npm run ios  # or npm run android
```

### Step 6: Test API Call

1. Open the app
2. Try to login
3. Check console logs for actual URL being called
4. Check if it matches your backend URL

---

## Quick Fixes

### Fix 1: Update Constants for Android

**File:** `src/constants/index.ts`

```typescript
import { Platform } from 'react-native';

// Detect environment
const getBaseURL = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2'; // Android Emulator
    }
    return 'http://localhost'; // iOS Simulator or Web
  }
  // Production
  return 'https://api.payo.app';
};

const BASE_URL = getBaseURL();

export const API = {
  BASE_URL,
  SERVICES: {
    AUTH: `${BASE_URL}:3001`,
    WALLET: `${BASE_URL}:3002`,
    PAYMENT: `${BASE_URL}:3004`,
    MERCHANT: `${BASE_URL}:3007`,
    GATEWAY: `${BASE_URL}:3000`,
  },
  // ... rest
};
```

### Fix 2: Override for Physical Device

**Create:** `src/config/api.config.ts`

```typescript
// For testing on physical device, set your computer's IP here
export const MANUAL_API_HOST = '192.168.1.10'; // Replace with your IP
export const USE_MANUAL_HOST = false; // Set to true when testing on device

export const getApiHost = () => {
  if (USE_MANUAL_HOST && MANUAL_API_HOST) {
    return `http://${MANUAL_API_HOST}`;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2';
    }
    return 'http://localhost';
  }

  return 'https://api.payo.app';
};
```

---

## Test Connectivity from App

**Add a test button in Settings:**

```typescript
const testConnection = async () => {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    Alert.alert('Success', JSON.stringify(data));
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

<TouchableOpacity onPress={testConnection}>
  <Text>Test Backend Connection</Text>
</TouchableOpacity>
```

---

## Environment-Specific Testing

### iOS Simulator
```typescript
SERVICES: {
  AUTH: 'http://localhost:3001',
}
```

✅ Works out of the box

### Android Emulator
```typescript
SERVICES: {
  AUTH: 'http://10.0.2.2:3001',
}
```

🔧 Requires change from localhost

### Physical Device (Same WiFi)
```typescript
SERVICES: {
  AUTH: 'http://192.168.1.10:3001',  // Your Mac's IP
}
```

📱 Requires both devices on same network

---

## Verify API URLs at Runtime

**Add logging to ApiService:**

```typescript
console.log('[ApiService] Auth URL:', API.SERVICES.AUTH);
console.log('[ApiService] Wallet URL:', API.SERVICES.WALLET);
console.log('[ApiService] Payment URL:', API.SERVICES.PAYMENT);
```

Check console output when app starts.

---

## Common Error Messages

### "Network Error" or "Network request failed"
- Backend not running
- Wrong URL (localhost on Android)
- Firewall blocking
- No internet connection

### "timeout of 30000ms exceeded"
- Backend is slow/crashed
- MongoDB/Redis not running
- Increase timeout in constants

### "ERR_CONNECTION_REFUSED"
- Service not running on that port
- Check pm2 list
- Check port number matches

### "getaddrinfo ENOTFOUND localhost"
- Android issue with localhost
- Use 10.0.2.2 instead

---

## Checklist

Before asking for help, verify:

- [ ] Backend services are running (`pm2 list`)
- [ ] Can curl backend from terminal (`curl http://localhost:3001/health`)
- [ ] Using correct URL for your platform (localhost/10.0.2.2/IP)
- [ ] Firewall not blocking connections
- [ ] App rebuilt after changing URLs (`npm run ios/android`)
- [ ] Metro bundler cache cleared (`--reset-cache`)
- [ ] Info.plist has NSAllowsLocalNetworking (iOS)
- [ ] AndroidManifest has usesCleartextTraffic (Android)

---

## Still Not Working?

1. **Check the logs:**
   ```bash
   pm2 logs auth-service --lines 50
   ```

2. **Check what URL is actually being called:**
   - Open React Native Debugger
   - Network tab
   - See what URL is in the failed request

3. **Try with Postman:**
   - Test `http://localhost:3001/challenge`
   - If Postman works but app doesn't → Network configuration issue
   - If Postman fails too → Backend issue

4. **Restart everything:**
   ```bash
   # Stop backend
   pm2 stop all

   # Stop Metro
   # CMD+C in terminal

   # Start backend
   pm2 start all

   # Clear and restart Metro
   npm start -- --reset-cache

   # Rebuild app
   npm run ios  # or android
   ```

---

## Production Deployment

When deploying to production:

1. Update API URLs in `.env.production`
2. Use HTTPS for all endpoints
3. Remove `NSAllowsArbitraryLoads` from Info.plist
4. Remove `usesCleartextTraffic` from AndroidManifest.xml
5. Implement certificate pinning
6. Add proper error handling

---

Need more help? Check the logs in:
- Settings → Developer → View API Logs
- See exact error messages and URLs being called
