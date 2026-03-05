# 🚀 First Run Instructions - PAYO Wallet

## ✅ Current Status

**Pod Installation:** In Progress ⏳

The iOS dependencies are currently being installed. This takes 3-5 minutes on first run.

## 📝 Steps to Run (After Pod Install Completes)

### For iOS:

```bash
# Open new terminal in project directory
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps

# Start Metro bundler
npm start

# In another terminal, run iOS app
npm run ios
```

### For Android:

```bash
# Make sure Android Studio is open with an emulator running

# Run Android app
npm run android
```

## 🎯 What to Expect

When the app launches, you'll see:

1. **Splash Screen** (2 seconds)
   - PAYO logo with gradient background
   - Loading indicator

2. **Onboarding Screen**
   - Welcome to PAYO
   - Feature overview
   - "Get Started" button

3. **Create Wallet Screen**
   - "Create New Wallet" button
   - "Import Existing Wallet" button

4. Follow the on-screen instructions!

## ⚠️ First Time Setup Checklist

Before running:
- [ ] Pod install complete (currently running)
- [ ] Metro bundler started (`npm start`)
- [ ] iOS Simulator or Android Emulator is running

## 🔧 If You Get Errors

### Metro Bundler Port in Use
```bash
# Kill existing process
lsof -ti:8081 | xargs kill -9

# Start Metro
npm start
```

### iOS Build Fails
```bash
# Clean and rebuild
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData/*
cd ..
npm run ios
```

### Android Build Fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Need Fresh Start
```bash
# Reset everything
npm start -- --reset-cache

# In another terminal
npm run ios  # or npm run android
```

## 📱 Testing the App

### Try These Features:

1. **Create a Wallet**
   - Tap "Create New Wallet"
   - Write down the 24-word seed phrase
   - Confirm the seed phrase
   - Enable biometric (Face ID / Touch ID)

2. **View Dashboard**
   - See your PAYO balance (will be 0 initially)
   - Check fiat balance in USD

3. **Try Payment Flow**
   - Tap "Scan QR" button
   - Enter address manually
   - Preview payment
   - (Transaction won't work without backend - that's expected!)

4. **Receive Screen**
   - Tap "Receive" button
   - See your wallet address
   - (QR code is placeholder - camera feature not implemented yet)

5. **Settings**
   - Tap "Settings" button
   - View wallet address
   - Try biometric toggle
   - (Logout / Delete wallet)

## ⚙️ Configuration (Optional)

### Update for Real Usage

Edit `src/constants/index.ts`:

```typescript
// Update these for production
export const BLOCKCHAIN = {
  TOKEN_ADDRESS: '0xYOUR_PAYO_TOKEN_CONTRACT',
  ORACLE_ADDRESS: '0xYOUR_PRICE_ORACLE',
  // ...
};

export const API = {
  BASE_URL: 'https://your-backend-api.com/api',
  // ...
};
```

## 🎉 First Run Complete!

Once you've successfully run the app and tested the features, you're ready to:

1. **Connect to Backend**
   - Update API endpoint in constants
   - Test with your backend API

2. **Deploy Smart Contract**
   - Deploy PAYO token contract
   - Update TOKEN_ADDRESS
   - Update ORACLE_ADDRESS

3. **Add Camera QR Scanner**
   - Install react-native-vision-camera
   - Implement camera scanning
   - Add permissions

4. **Test on Real Device**
   - Build for physical device
   - Test biometric authentication
   - Test real transactions

5. **Add More Features**
   - Transaction history pagination
   - Push notifications
   - Deep linking
   - Multi-language support

## 📚 Documentation

- **QUICK_START.md** - Quick start guide
- **README_PAYO.md** - Complete documentation
- **SETUP_GUIDE.md** - Detailed setup
- **TROUBLESHOOTING.md** - Common issues
- **IMPLEMENTATION_SUMMARY.txt** - Technical details

## 💡 Tips

- The wallet creates **real Polygon addresses**
- Test on **testnet first** before mainnet!
- **Save your seed phrase** - it's the only way to recover wallet
- Biometric works better on **real devices** than simulators
- Check the **console logs** for debugging info

## 🆘 Need Help?

1. Check TROUBLESHOOTING.md
2. Check the React Native docs
3. Check individual package docs
4. Search GitHub issues

---

## ⏱️ Current Status

**Waiting for pod install to complete...**

Once you see:
```
Pod installation complete! There are X dependencies from the Podfile and X total pods installed.
```

You can run:
```bash
npm run ios
```

## 🎯 Next Step

After pods install:
```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run iOS
npm run ios
```

**Estimated time until first run:** ~5-10 minutes (including build time)

---

**Status:** ⏳ Pod installation in progress...
**Next:** npm run ios (after pods complete)
**Then:** Test all features and enjoy your wallet! 🎉
