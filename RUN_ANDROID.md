# 🤖 Run PAYO on Android - Complete Guide

**Updated:** March 6, 2026
**Status:** ✅ Configured for Sepolia Testnet

---

## ✅ Current Configuration

### Blockchain (Sepolia Testnet)
- **Network:** Ethereum Sepolia Testnet
- **Chain ID:** 11155111
- **RPC URL:** https://ethereum-sepolia-rpc.publicnode.com
- **Explorer:** https://sepolia.etherscan.io

### Deployed Contracts
- **PAYO Token:** `0xA5B2A8BF51de02981A52185986875C31db6B437B`
- **Payment Processor:** `0x990E95b0b12E1fcCd811E920270E68D23C135b08`
- **MinimalForwarder:** `0x5969E5EFB87f94fb4731bC8192AA725b73345A19`
- **Vesting Manager:** `0x93558E9430459cd5dCEA2Aa80A853d481910D17A`
- **Refund Manager:** `0x49E212EA1629E3AdC1FD87af9B5A4410DC468E30`

### Backend Services
- **API Gateway:** http://localhost:3000
- **Auth Service:** http://localhost:3001
- **Wallet Service:** http://localhost:3002
- **Payment Service:** http://localhost:3004

---

## 🚀 Quick Start (3 Steps)

### Step 1: Ensure Backend is Running

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend
pm2 list
```

**Expected output:** All services should show "online" status

If not running:
```bash
pm2 restart all
```

### Step 2: Start Metro Bundler

Open Terminal 1:
```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps
npm start
```

Wait for "Welcome to Metro!" message.

### Step 3: Run on Android

Open Terminal 2:
```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps
npm run android
```

---

## 📱 Android Options

### Option A: Android Emulator (Recommended)

**Prerequisites:**
1. Android Studio installed
2. Android SDK configured
3. Emulator created and running

**Start Emulator:**
```bash
# Open Android Studio
open -a "Android Studio"

# Or use command line
emulator -avd <YOUR_AVD_NAME>
```

**Network Configuration:**
- ✅ Emulator uses `10.0.2.2` to access host's localhost
- ✅ Already configured in `src/constants/index.ts`
- ✅ Backend services accessible automatically

**Run:**
```bash
npm run android
```

---

### Option B: Physical Android Device

**Prerequisites:**
1. USB Debugging enabled on device
2. Device connected via USB
3. Device authorized for debugging

**Enable USB Debugging:**
1. Settings → About Phone
2. Tap "Build Number" 7 times
3. Settings → Developer Options
4. Enable "USB Debugging"

**Check Device Connection:**
```bash
adb devices
```

Should show:
```
List of devices attached
<device-id>    device
```

**Network Configuration (IMPORTANT):**

Physical devices cannot access `localhost` or `10.0.2.2`. You need to use your computer's IP address.

**Update for Physical Device:**

Open `src/constants/index.ts` and change:
```typescript
const getApiBaseUrl = (): string => {
  // ...
  if (Platform.OS === 'android') {
    // For physical device, use your computer's IP
    return 'http://192.168.1.3'; // Your Mac's IP address
  }
  // ...
};
```

**Run:**
```bash
npm run android
```

---

## 🛠️ First-Time Setup

### Install Android SDK & Tools

```bash
# Install Android SDK via Homebrew
brew install --cask android-studio

# Or install command-line tools only
brew install --cask android-commandlinetools
```

**Configure Environment Variables:**

Add to `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Reload:
```bash
source ~/.zshrc
```

### Create Android Emulator

```bash
# List available system images
sdkmanager --list | grep system-images

# Install system image
sdkmanager "system-images;android-34;google_apis;x86_64"

# Create AVD
avdmanager create avd -n Pixel_8_API_34 -k "system-images;android-34;google_apis;x86_64" -d "pixel_8"

# List created AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_8_API_34
```

---

## 🔧 Build Commands

### Clean Build
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Clean cache
npm start -- --reset-cache
```

### Debug Build
```bash
npm run android
# Or
npx react-native run-android
```

### Release Build
```bash
cd android
./gradlew assembleRelease
cd ..

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🐛 Troubleshooting

### Issue: "SDK location not found"

**Solution:**
```bash
# Create local.properties
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

### Issue: "Command failed: ./gradlew app:installDebug"

**Solution:**
```bash
cd android
chmod +x gradlew
./gradlew clean
cd ..
npm run android
```

### Issue: "Unable to connect to development server"

**Emulator Solution:**
```bash
# Reverse port forwarding
adb reverse tcp:3000 tcp:3000
adb reverse tcp:3001 tcp:3001
adb reverse tcp:3002 tcp:3002
adb reverse tcp:3004 tcp:3004
adb reverse tcp:8081 tcp:8081
```

**Physical Device Solution:**
1. Ensure device is on same WiFi network
2. Update API_BASE_URL to use your computer's IP: `192.168.1.3`
3. Restart Metro: `npm start -- --reset-cache`
4. Rebuild: `npm run android`

### Issue: "App crashes on launch"

**Solution:**
```bash
# View logs
adb logcat *:E

# Clear app data
adb shell pm clear com.payoapps

# Reinstall
npm run android
```

### Issue: "Metro bundler not connecting"

**Solution:**
```bash
# Kill processes
lsof -ti:8081 | xargs kill -9

# Start fresh
npm start -- --reset-cache

# In another terminal
npm run android
```

### Issue: "Gradle build fails"

**Solution:**
```bash
cd android

# Clean gradle cache
./gradlew clean
rm -rf .gradle
rm -rf build
rm -rf app/build

# Rebuild
./gradlew assembleDebug
cd ..
```

---

## 📊 Verify Setup

### Check Environment
```bash
npx react-native doctor
```

Should show all checks passing:
- ✅ Node.js
- ✅ Android SDK
- ✅ Android Studio
- ✅ JDK
- ✅ Emulator/Device

### Check Backend Services
```bash
# Check all services are running
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3004/health
```

All should return:
```json
{"status": "ok", "service": "..."}
```

### Check Sepolia Connection
```bash
# Test Sepolia RPC
curl -X POST https://ethereum-sepolia-rpc.publicnode.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Should return current block number.

---

## 🎯 Testing Flow

### 1. Launch App
- See splash screen (2 seconds)
- Navigate to onboarding

### 2. Create Wallet
- Tap "Create New Wallet"
- View 12-word seed phrase
- Save securely!
- Confirm seed phrase

### 3. Check Dashboard
- View wallet address
- Balance should be 0 PAYO initially
- Try "Receive" to see QR code

### 4. Test Backend Connection
- App will connect to localhost backend
- Backend is connected to Sepolia testnet
- Transactions will be submitted to Sepolia

### 5. Send Test Payment (Optional)
- Need Sepolia ETH for gas fees
- Get from faucet: https://faucet.polygon.technology/
- Submit payment through app
- Check on Sepolia Etherscan

---

## 📱 Network Configuration Reference

### Android Emulator
```typescript
// Automatically configured
BASE_URL: 'http://10.0.2.2' // Maps to host's localhost
```

### Physical Android Device
```typescript
// Update src/constants/index.ts
BASE_URL: 'http://192.168.1.3' // Your computer's IP
```

### iOS Simulator
```typescript
BASE_URL: 'http://localhost' // Can use localhost directly
```

---

## 🔐 Backend Port Forwarding (For Emulator)

If app can't reach backend services:

```bash
# Forward all backend ports to emulator
adb reverse tcp:3000 tcp:3000  # API Gateway
adb reverse tcp:3001 tcp:3001  # Auth Service
adb reverse tcp:3002 tcp:3002  # Wallet Service
adb reverse tcp:3004 tcp:3004  # Payment Service
adb reverse tcp:3006 tcp:3006  # Indexer Service
adb reverse tcp:3007 tcp:3007  # Merchant Service
adb reverse tcp:3010 tcp:3010  # Admin Service
```

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Metro bundler shows "Welcome to Metro"
✅ Gradle build completes successfully
✅ App installs on device/emulator
✅ Splash screen appears
✅ Can navigate to dashboard
✅ Backend services respond (check logs)
✅ Blockchain connection works (Sepolia)

---

## 📝 Important Notes

### Development Mode
- App connects to localhost backend
- Backend connects to Sepolia testnet
- All transactions are real on Sepolia
- No real money involved (testnet)

### Backend Required
The app REQUIRES the backend services to be running:
```bash
cd payo-backend
pm2 list  # Verify all services are online
```

### Sepolia ETH Needed
To send transactions, you need Sepolia ETH:
- Wallet address: `0xFD379c31677A1A44cC807e569029eE94606e7695`
- Faucet: https://faucet.polygon.technology/

### Network Permissions
✅ Already configured in `AndroidManifest.xml`:
- INTERNET permission
- usesCleartextTraffic enabled

---

## 🆘 Quick Help

### Kill Everything & Restart
```bash
# Kill all processes
lsof -ti:8081 | xargs kill -9
killall -9 node
adb kill-server && adb start-server

# Clean everything
cd android && ./gradlew clean && cd ..
npm start -- --reset-cache

# Rebuild (in another terminal)
npm run android
```

### View Live Logs
```bash
# Metro bundler logs
# (Already visible in Metro terminal)

# Android system logs
adb logcat

# Filter for app logs only
adb logcat | grep -i payoapps

# Filter for errors only
adb logcat *:E
```

---

## 📚 Documentation

- React Native: https://reactnative.dev/docs/running-on-device
- Android Studio: https://developer.android.com/studio
- ADB Commands: https://developer.android.com/tools/adb

---

**Your Setup:**
- Computer IP: `192.168.1.3`
- Backend: Running on localhost (PM2)
- Blockchain: Sepolia Testnet
- App: React Native 0.84.1

**Ready to run!** 🚀
