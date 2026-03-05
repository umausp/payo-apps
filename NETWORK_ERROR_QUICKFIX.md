# Network Error - Quick Fix Guide

## 🚨 Error: `[API Error] undefined Network Error`

Your app can't connect to the backend. Here's how to fix it:

---

## ✅ Quick Fix (5 minutes)

### Step 1: Check Backend Services

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend
pm2 list
```

**All services should show `online`:**
- auth-service (3001)
- wallet-service (3002)
- payment-service (3004)
- hardhat-node (8545)

**If any are `stopped` or `errored`:**
```bash
pm2 restart all
# or
./scripts/restart-all-pm2.sh
```

### Step 2: Test Backend from Terminal

```bash
curl http://localhost:3001/health
```

**Expected response:**
```json
{"status":"ok","service":"auth-service"}
```

**If it fails:** Backend is not running properly. Check logs:
```bash
pm2 logs auth-service --lines 20
```

### Step 3: Identify Your Environment

**Are you testing on:**

1. **iOS Simulator?** → Skip to Step 4 (should work now)
2. **Android Emulator?** → Continue to Step 4
3. **Physical Device?** → See "Physical Device Setup" below

### Step 4: Rebuild the App

The API URLs have been **automatically updated** to use:
- `localhost` on iOS Simulator ✅
- `10.0.2.2` on Android Emulator ✅

**Rebuild to apply changes:**

```bash
# Stop Metro bundler (CMD+C if running)

# Clear cache
npm start -- --reset-cache

# In another terminal:
npm run ios    # For iOS
# or
npm run android # For Android
```

### Step 5: Test the Connection

1. Open the app
2. Go to **Settings → Developer → Test Backend Connection**
3. Should show "Online ✓" for all services

**If it works:** ✅ You're done!

**If it still fails:** Continue to Advanced Fixes below.

---

## 🔧 Advanced Fixes

### iOS Simulator - Network Permissions

**Edit:** `ios/payo-apps/Info.plist`

**Add before the final `</dict>`:**
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
cd ios
pod install
cd ..
npm run ios
```

### Android Emulator - Cleartext Traffic

**Edit:** `android/app/src/main/AndroidManifest.xml`

**Find the `<application` tag and add:**
```xml
<application
    android:usesCleartextTraffic="true"
    ...
```

**Then rebuild:**
```bash
npm run android
```

---

## 📱 Physical Device Setup

**Backend must be accessible on your local network.**

### Step 1: Get Your Computer's IP Address

**On Mac:**
```bash
ipconfig getifaddr en0
```

**Example output:**
```
192.168.1.10
```

### Step 2: Update API URLs for Physical Device

**Edit:** `src/constants/index.ts`

**Change the `getApiBaseUrl` function:**

```typescript
const getApiBaseUrl = (): string => {
  // For physical device testing, uncomment and set your IP:
  // return 'http://192.168.1.10';  // ← Replace with YOUR IP

  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
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

**Uncomment and set your IP:**
```typescript
return 'http://192.168.1.10';  // ← Your Mac's IP from Step 1
```

**Rebuild:**
```bash
npm run ios    # or npm run android
```

### Step 3: Ensure Same WiFi Network

- Phone/tablet must be on same WiFi as your computer
- Cannot use Ethernet (must be WiFi)
- Check Mac's WiFi is connected

### Step 4: Disable Firewall (Temporary)

**On Mac:**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

**Test the app, then re-enable:**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

---

## 🐛 Still Not Working?

### Check API URLs at Runtime

When you start the app, look for this in the console:

```
========================================
🌐 API CONFIGURATION
========================================
Platform: ios
Environment: Development

API URLs:
  Auth Service:     http://localhost:3001
  Wallet Service:   http://localhost:3002
  Payment Service:  http://localhost:3004
========================================
```

**Verify:**
- URLs match your environment (localhost for iOS, 10.0.2.2 for Android)
- Ports are correct (3001, 3002, 3004)

### Test from Settings

1. Open app → Settings → Developer
2. Tap **"Test Backend Connection"**
3. See which services are offline
4. Fix those specific services

### Check Logs

1. Settings → Developer → View API Logs
2. Look for the actual URLs being called
3. Check error messages

### Common Issues

#### "ECONNREFUSED"
- Service not running on that port
- Run `pm2 restart all`

#### "getaddrinfo ENOTFOUND localhost" (Android)
- Still using localhost instead of 10.0.2.2
- Clear cache: `npm start -- --reset-cache`
- Rebuild: `npm run android`

#### "timeout of 30000ms exceeded"
- Backend is slow or MongoDB not running
- Check: `pm2 logs wallet-service`

#### "Network request failed"
- Firewall blocking
- Wrong URL for environment
- No internet connection (for external APIs)

---

## 📋 Troubleshooting Checklist

Work through this list:

- [ ] Backend services running: `pm2 list`
- [ ] Can curl from terminal: `curl http://localhost:3001/health`
- [ ] Using correct URL for platform (see console logs)
- [ ] Rebuilt app after URL changes
- [ ] Cleared Metro cache: `--reset-cache`
- [ ] Info.plist has NSAllowsLocalNetworking (iOS)
- [ ] AndroidManifest has usesCleartextTraffic (Android)
- [ ] Firewall not blocking (temporarily disable to test)
- [ ] MongoDB and Redis running: `pm2 list`

---

## 🎯 Expected Behavior

**When working correctly:**

1. **App starts** → Console shows API URLs
2. **Login** → See requests in console:
   ```
   [API Request] POST http://localhost:3001/challenge
   [API Response] 200 http://localhost:3001/challenge
   ```
3. **Dashboard loads** → See balance fetch:
   ```
   [API Request] GET http://localhost:3002/api/v1/wallet/balance/0x...
   [API Response] 200 http://localhost:3002/api/v1/wallet/balance/0x...
   ```
4. **Settings → Test Backend** → All services "Online ✓"

---

## 💡 Prevention Tips

**To avoid this issue in the future:**

1. Always check backend is running before testing app
2. Use "Test Backend Connection" in Settings to verify
3. Check console logs for API URLs on app start
4. Remember: Android needs 10.0.2.2, iOS uses localhost

---

## 🆘 Get Help

**If still not working, collect this info:**

1. **Platform:** iOS Simulator / Android Emulator / Physical Device
2. **Backend status:**
   ```bash
   pm2 list
   ```
3. **Curl test:**
   ```bash
   curl http://localhost:3001/health
   ```
4. **Console logs:** Copy the API URLs from console when app starts
5. **Error logs:** Settings → Developer → View API Logs

**Then share this information for further help.**

---

## ✅ Success!

Once it's working, you should see:

- Login succeeds
- Dashboard shows real balance
- Transactions appear
- No network errors in console
- "Test Backend Connection" shows all services online

**Need more details?** See `NETWORK_ERROR_DEBUGGING.md` for comprehensive guide.
