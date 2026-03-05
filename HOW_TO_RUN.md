# 🎯 How to Run PAYO Wallet - Step by Step

## ✅ Current Status

- ✅ Project created
- ✅ Dependencies installed (963 npm packages)
- ✅ iOS Pods installed (11 pods)
- ✅ Babel config updated (reanimated plugin added)
- ⚠️ First run may have build issues (normal for React Native)

## 🚀 **EASIEST WAY: Run from Xcode**

This is the **recommended approach** for first run:

### Step 1: Open in Xcode

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps
open ios/PayoApps.xcworkspace
```

**Important:** Open the `.xcworkspace` file, NOT the `.xcodeproj` file!

### Step 2: Select Simulator

In Xcode:
1. At the top, next to the Play button
2. Click the device dropdown
3. Select "iPhone 16 Pro" (or any iPhone simulator)

### Step 3: Build and Run

1. Click the **Play button** (▶️) in the top left
2. Wait for build to complete (3-5 minutes first time)
3. The simulator will open automatically
4. Your app will launch!

### Step 4: Watch for Metro

A Terminal window should open with Metro bundler. If not:

```bash
# In a separate terminal
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps
npm start
```

---

## 🖥️ **Alternative: Command Line**

If you prefer command line:

### Method 1: Using Script

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps
./RUN_IOS.sh
```

### Method 2: Manual Steps

```bash
# Terminal 1: Start Metro
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps
npm start --reset-cache

# Terminal 2: Run iOS (wait 10 seconds after starting Metro)
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps
npx react-native run-ios --simulator="iPhone 16 Pro"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Unable to boot simulator"

**Solution:**
```bash
# Open simulator first
open -a Simulator

# Wait for it to fully load, then run:
npm run ios
```

### Issue: "Command PhaseScriptExecution failed"

**Solution:**
```bash
# Clean and rebuild
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData/*
cd ..
npm start -- --reset-cache
# Then run from Xcode
```

### Issue: "No bundle URL present"

**Solution:**
```bash
# Make sure Metro is running in another terminal
npm start

# Then build again
```

### Issue: Build errors in Xcode

**Solution:**
1. In Xcode: Product → Clean Build Folder (Cmd+Shift+K)
2. Close Xcode
3. Run:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```
4. Open Xcode again and build

### Issue: "Module not found" errors

**Solution:**
```bash
# Reset everything
watchman watch-del-all
rm -rf node_modules
npm install
cd ios
rm -rf Pods
pod install
cd ..
npm start -- --reset-cache
```

---

## 📱 First Run Checklist

Before running, make sure:

- [ ] **Xcode** is installed (from App Store)
- [ ] **Command Line Tools** are installed:
  ```bash
  xcode-select --install
  ```
- [ ] **Simulator** is installed:
  - Open Xcode
  - Xcode → Settings → Platforms
  - Make sure iOS simulator is installed
- [ ] **Node modules** are installed:
  ```bash
  ls node_modules | wc -l  # Should show ~900+
  ```
- [ ] **Pods** are installed:
  ```bash
  ls ios/Pods | wc -l  # Should show ~10+
  ```

---

## 🎬 What to Expect

When the app launches successfully:

### 1. Splash Screen (2 seconds)
- PAYO logo with gradient background
- Loading animation

### 2. Onboarding Screen
- Welcome message
- Feature overview
- "Get Started" button

### 3. Create Wallet Flow
- Choose "Create New Wallet" or "Import Existing Wallet"
- For new wallet: see 24-word seed phrase
- Save the seed phrase securely!
- Confirm seed phrase by selecting words in order

### 4. Biometric Setup (Optional)
- Enable Face ID / Touch ID
- Or skip for now

### 5. Dashboard
- Your wallet address
- Balance (will be 0)
- Send / Scan QR / Receive buttons
- Transaction history (empty initially)

### 6. Try Features:
- **Receive**: See your QR code (placeholder)
- **Scan QR**: Scanner (placeholder - camera not implemented)
- **Settings**: View wallet info, logout, delete wallet

---

## 🔧 Build Times

**First Build:**
- iOS: 5-10 minutes
- Subsequent builds: 1-2 minutes

**What's happening:**
1. Compiling React Native core
2. Compiling native dependencies
3. Linking libraries
4. Building app binary
5. Installing on simulator

---

## 💡 Pro Tips

### Faster Development

1. **Keep Metro running** - Don't stop it between runs
2. **Use Fast Refresh** - Edit code and see changes instantly
3. **Enable Debug Menu**:
   - iOS: Cmd+D in simulator
   - Select "Enable Fast Refresh"

### Debugging

1. **React Native Debugger**:
   ```bash
   brew install --cask react-native-debugger
   ```

2. **Xcode Console**:
   - View → Debug Area → Activate Console
   - See native logs here

3. **Metro Logs**:
   - Check the Metro terminal
   - JavaScript errors appear here

---

## 🎯 Success Indicators

You'll know it's working when:

✅ Metro bundler shows: "Welcome to Metro"
✅ Build succeeds in Xcode
✅ Simulator launches
✅ You see the PAYO splash screen
✅ App navigates to onboarding

---

## 🆘 Still Not Working?

### Quick Reset (Nuclear Option)

```bash
# Kill everything
killall -9 node
killall -9 Simulator

# Clean everything
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*
watchman watch-del-all

# Reinstall everything
npm install
cd ios
bundle install
bundle exec pod install
cd ..

# Start fresh
npm start -- --reset-cache

# In Xcode: Product → Clean Build Folder
# Then click Play
```

### Check Environment

```bash
npx react-native doctor
```

This will check:
- Node version
- Xcode installation
- CocoaPods
- Ruby version
- iOS deployment target

### Get Help

1. Check **TROUBLESHOOTING.md** - Common issues
2. Check **React Native docs** - https://reactnative.dev
3. Check package-specific docs
4. Search GitHub issues for specific packages

---

## 🎉 Once It's Running

Congratulations! Your PAYO wallet is now running. Next steps:

1. **Test Features**
   - Create a wallet
   - View seed phrase
   - Test biometric
   - Try navigation

2. **Configuration**
   - Update `src/constants/index.ts`
   - Add your contract addresses
   - Configure API endpoint

3. **Development**
   - Add real QR scanner (camera)
   - Connect to backend
   - Add tests
   - Polish UI

---

**Current Path:**
```
/Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps
```

**Quick Commands:**
```bash
# Open in Xcode
open ios/PayoApps.xcworkspace

# Start Metro
npm start

# Run iOS
npm run ios
```

---

**Recommended:** Start with Xcode for first run. It provides better error messages and easier debugging!
