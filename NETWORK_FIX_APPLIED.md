# Network Error Fix - Applied Changes

## ✅ What Was Fixed

I've automatically fixed the network error by updating the API configuration to detect your platform and use the correct URLs.

---

## 📁 Files Modified

### 1. `src/constants/index.ts`

**Before:**
```typescript
SERVICES: {
  AUTH: 'http://localhost:3001',     // ❌ Won't work on Android
  WALLET: 'http://localhost:3002',   // ❌ Won't work on Android
  PAYMENT: 'http://localhost:3004',  // ❌ Won't work on Android
}
```

**After:**
```typescript
const getApiBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2';  // ✅ Works on Android Emulator
    }
    return 'http://localhost';    // ✅ Works on iOS Simulator
  }
  return 'https://api.payo.app';   // Production
};

const API_BASE_URL = getApiBaseUrl();

SERVICES: {
  AUTH: `${API_BASE_URL}:3001`,    // ✅ Auto-detects platform
  WALLET: `${API_BASE_URL}:3002`,  // ✅ Auto-detects platform
  PAYMENT: `${API_BASE_URL}:3004`, // ✅ Auto-detects platform
}
```

### 2. `src/utils/debugNetwork.ts` (NEW)

Added network debugging utilities:
- `logApiConfiguration()` - Logs API URLs on app start
- `testBackendConnection()` - Tests connectivity to all services
- `showNetworkDiagnostics()` - Shows diagnostic alert in app

### 3. `src/presentation/screens/Settings/SettingsScreen.tsx`

Added "Test Backend Connection" button:
- Settings → Developer → Test Backend Connection 🔌
- Tests if backend services are reachable
- Shows which services are online/offline

### 4. `App.tsx`

Added initialization logging:
- Logs API configuration when app starts
- Shows what URLs will be used
- Visible in console/debugger

---

## 🚀 What You Need to Do Now

### Step 1: Make Sure Backend is Running

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend
pm2 list
```

**All these should show `online`:**
- auth-service (3001) ✓
- wallet-service (3002) ✓
- payment-service (3004) ✓
- hardhat-node (8545) ✓

**If any are stopped:**
```bash
pm2 restart all
```

### Step 2: Rebuild the App

**The changes won't take effect until you rebuild!**

```bash
# Stop Metro bundler if running (CMD+C)

# Start with cache reset
npm start -- --reset-cache

# In another terminal:
npm run ios     # For iOS
# OR
npm run android # For Android
```

### Step 3: Verify It's Working

**When the app starts, check the console:**

```
========================================
🌐 API CONFIGURATION
========================================
Platform: ios (or android)
Environment: Development

API URLs:
  Auth Service:     http://localhost:3001      (iOS)
                    http://10.0.2.2:3001      (Android)
  Wallet Service:   http://localhost:3002
  Payment Service:  http://localhost:3004
========================================
```

**The URLs should match your platform:**
- iOS Simulator: `http://localhost:XXXX` ✓
- Android Emulator: `http://10.0.2.2:XXXX` ✓

### Step 4: Test in the App

1. Open the app
2. Navigate to **Settings**
3. Scroll to **Developer** section
4. Tap **"Test Backend Connection"**

**Expected Result:**
```
Network Diagnostics - OK

Platform: ios
Environment: Development

Backend Services:

Auth: Online ✓
Wallet: Online ✓
Payment: Online ✓
```

**If you see "Offline ✗":**
- That service isn't running
- Check `pm2 list`
- Check `pm2 logs <service-name>`

### Step 5: Try to Login

1. Go back to login screen
2. Try to login
3. Should work now!

**Check console for API calls:**
```
[API Request] POST http://localhost:3001/challenge
[API Response] 200 http://localhost:3001/challenge
[API Request] POST http://localhost:3001/verify
[API Response] 200 http://localhost:3001/verify
```

---

## 🎯 How the Fix Works

### Automatic Platform Detection

```typescript
if (Platform.OS === 'android') {
  // Android Emulator → Use 10.0.2.2
  // This is Android's special IP that maps to host's localhost
  return 'http://10.0.2.2';
}
// iOS Simulator → Use localhost
// iOS can directly access host's localhost
return 'http://localhost';
```

### Why This Matters

**iOS Simulator:**
- Shares network with your Mac
- `localhost` = Your Mac's localhost ✅

**Android Emulator:**
- Runs in isolated network
- `localhost` = Emulator's own localhost (not your Mac) ❌
- `10.0.2.2` = Special IP that maps to your Mac's localhost ✅

---

## 📱 For Physical Device Testing

**If testing on a real iPhone or Android phone:**

### Get Your Mac's IP

```bash
ipconfig getifaddr en0
```

Example: `192.168.1.10`

### Update constants

**Edit:** `src/constants/index.ts`

**Find this function and add your IP:**

```typescript
const getApiBaseUrl = (): string => {
  // Uncomment this line and add your Mac's IP for physical device:
  // return 'http://192.168.1.10';  // ← YOUR IP HERE

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

**Uncomment and set:**
```typescript
return 'http://192.168.1.10';  // Your actual IP
```

**Rebuild the app.**

---

## 🔍 Debugging Tools Added

### 1. Console Logs on App Start

When you start the app, you'll see:
```
🌐 API CONFIGURATION
Platform: ios
API URLs:
  Auth Service:    http://localhost:3001
  Wallet Service:  http://localhost:3002
  Payment Service: http://localhost:3004
```

### 2. Test Backend Connection (In Settings)

- Settings → Developer → Test Backend Connection
- Tests each service individually
- Shows which are online/offline
- Gives troubleshooting tips

### 3. View API Logs (In Settings)

- Settings → Developer → View API Logs
- See all API requests/responses
- Check exact URLs being called
- See error messages

---

## ⚠️ Common Issues

### "Still getting Network Error after rebuild"

**Check:**
1. Did you actually rebuild? (not just refresh)
2. Is Metro bundler using the new code? (restart with --reset-cache)
3. Are backend services running? (pm2 list)

### "Backend services keep stopping"

**Check:**
```bash
pm2 logs <service-name>
```

Look for error messages. Common issues:
- MongoDB not running
- Redis not running
- Port already in use

### "Test Backend shows all offline"

**Your API URLs are wrong or backend is down.**

**Check:**
```bash
# Test from terminal
curl http://localhost:3001/health

# If that works but app doesn't:
# - Check the console logs for actual URLs being used
# - They might not match localhost
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Backend services running: `pm2 list` shows all online
- [ ] Terminal test works: `curl http://localhost:3001/health` succeeds
- [ ] App rebuilt: `npm start -- --reset-cache` then `npm run ios/android`
- [ ] Console shows correct URLs for your platform
- [ ] "Test Backend Connection" in app shows services online
- [ ] Can see API requests in console when trying to login

---

## 🎉 Success Indicators

**You'll know it's working when:**

1. **Console shows correct URLs** on app start
2. **"Test Backend Connection"** shows all services online ✓
3. **Login works** without network errors
4. **Dashboard loads** with real balance
5. **No red errors** in console about network

---

## 📚 Additional Help

**See these files for more details:**

- `NETWORK_ERROR_QUICKFIX.md` - Step-by-step fix guide
- `NETWORK_ERROR_DEBUGGING.md` - Comprehensive debugging guide

**Or check logs:**
- Settings → Developer → View API Logs

---

## 🤝 Summary

**What changed:**
- API URLs now auto-detect your platform (iOS/Android)
- Added debugging tools in Settings
- Added console logging for API configuration

**What you need to do:**
1. Make sure backend is running (`pm2 list`)
2. Rebuild the app (`npm start -- --reset-cache` then `npm run ios/android`)
3. Test with "Test Backend Connection" in Settings
4. Try to login

**Expected result:**
- No more network errors
- API calls succeed
- Login works
- Dashboard shows data

The fix is applied and ready! Just rebuild the app and you're good to go! 🚀
