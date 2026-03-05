# 🔧 PAYO Wallet - Troubleshooting Guide

## iOS Build Issues

### Problem: "No pods installed" or build errors

**Solution:**
```bash
cd ios
bundle install
bundle exec pod install
cd ..
npm run ios
```

### Problem: Xcode build fails with module errors

**Solution: Clean and rebuild**
```bash
# Clean iOS build
cd ios
xcodebuild clean
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*
bundle exec pod install
cd ..

# Run again
npm run ios
```

### Problem: "Command PhaseScriptExecution failed"

**Solution:**
```bash
# Clean cache
npm start -- --reset-cache

# Clean and reinstall
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..
npm run ios
```

### Problem: Simulator not found

**Solution:**
```bash
# List available simulators
xcrun simctl list devices

# Or open Xcode and start a simulator manually
open -a Simulator

# Then run
npm run ios
```

## Android Build Issues

### Problem: Gradle build fails

**Solution:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Problem: "SDK location not found"

**Solution:**
Create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

### Problem: "Execution failed for task ':app:mergeDebugResources'"

**Solution:**
```bash
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
npm run android
```

## Metro Bundler Issues

### Problem: Metro bundler port already in use

**Solution:**
```bash
# Kill existing Metro process
lsof -ti:8081 | xargs kill -9

# Or use different port
npm start -- --port 8082
```

### Problem: Cache issues

**Solution:**
```bash
# Reset Metro cache
npm start -- --reset-cache

# Clear watchman
watchman watch-del-all

# Clear npm cache
npm cache clean --force
```

## TypeScript Errors

### Problem: Type errors in IDE

**Solution:**
```bash
# Check types
npm run type-check

# Restart TypeScript server in your IDE
# VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Problem: Module not found errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# For iOS
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

## Dependency Issues

### Problem: Peer dependency warnings

**Solution:**
These are usually safe to ignore. If causing issues:
```bash
npm install --legacy-peer-deps
```

### Problem: Package conflicts

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Runtime Errors

### Problem: "Invariant Violation: Module AppRegistry is not a registered callable module"

**Solution:**
```bash
# Reset bundler
npm start -- --reset-cache
```

### Problem: Red screen errors about missing modules

**Solution:**
```bash
# Reinstall and rebuild
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npm run ios
```

### Problem: "Unable to resolve module" errors

**Solution:**
```bash
# Clear all caches
rm -rf node_modules
npm cache clean --force
npm install
npm start -- --reset-cache
```

## Specific Package Issues

### react-native-keychain

**Problem:** Build error on iOS

**Solution:**
```bash
cd ios
pod install
cd ..
```

### react-native-reanimated

**Problem:** Build errors

**Solution:**
Add to `babel.config.js` (already added):
```javascript
plugins: ['react-native-reanimated/plugin']
```

### react-native-gesture-handler

**Problem:** Gestures not working

**Solution:**
Make sure App.tsx imports it first:
```typescript
import 'react-native-gesture-handler';
```

### @react-native-async-storage/async-storage

**Problem:** Build errors

**Solution:**
```bash
cd ios
pod install
cd ..
```

## Development Environment

### Check React Native Doctor

```bash
npx react-native doctor
```

This will check:
- Node version
- Ruby version
- Xcode installation
- Android SDK
- CocoaPods
- iOS deployment target

### Verify Setup

**Node:**
```bash
node --version  # Should be >= 18
```

**Watchman:**
```bash
watchman version
# If not installed: brew install watchman
```

**CocoaPods:**
```bash
pod --version  # Should be >= 1.10
# If not installed: sudo gem install cocoapods
```

**Xcode:**
```bash
xcodebuild -version  # Should be >= 14
```

## Complete Clean Slate

If all else fails, complete reset:

```bash
# 1. Clean everything
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf android/build
rm -rf android/app/build
rm -rf ~/Library/Developer/Xcode/DerivedData/*
watchman watch-del-all
npm cache clean --force

# 2. Reinstall everything
npm install

# 3. iOS
cd ios
bundle install
bundle exec pod install
cd ..

# 4. Run
npm start -- --reset-cache
# In another terminal:
npm run ios  # or npm run android
```

## Common Configuration Issues

### Problem: API not connecting

**Check:** `src/constants/index.ts`
```typescript
export const API = {
  BASE_URL: 'http://localhost:3000/api', // Update this
};
```

For iOS simulator, use computer's IP address:
```typescript
BASE_URL: 'http://192.168.1.XXX:3000/api',
```

### Problem: Blockchain not working

**Check:** `src/constants/index.ts`
```typescript
export const BLOCKCHAIN = {
  TOKEN_ADDRESS: '0xYOUR_TOKEN_ADDRESS',
  ORACLE_ADDRESS: '0xYOUR_ORACLE_ADDRESS',
  // Make sure these are correct
};
```

## Getting Help

1. **Check logs:**
   - iOS: Check Xcode console
   - Android: `adb logcat`
   - Metro: Check terminal output

2. **Enable debugging:**
   - iOS: Cmd+D in simulator → Enable Debug
   - Android: Cmd+M in emulator → Enable Debug

3. **React Native Debugger:**
   ```bash
   # Install
   brew install --cask react-native-debugger

   # Use
   # Enable Debug in app, then it connects automatically
   ```

4. **Common log locations:**
   - Metro: Terminal where you ran `npm start`
   - iOS: Xcode → View → Debug Area → Show Debug Area
   - Android: `android/app/build/outputs/logs/`

## Performance Issues

### Problem: Slow startup

**Solution:**
- Enable Hermes (already enabled)
- Use production build:
  ```bash
  npx react-native run-ios --configuration Release
  ```

### Problem: Slow Metro bundler

**Solution:**
```bash
# Use RAM bundle
npm start -- --reset-cache --config metro.config.js
```

## Security Issues

### Problem: Unable to save to keychain

**Check:**
- iOS: Simulator vs Real device (simulator has limited keychain)
- Android: Check device security settings

### Problem: Biometric not working

**Check:**
- Simulator: Enroll biometrics in Settings
- Real device: Settings → Face ID & Passcode

## Production Build

### iOS

```bash
# Archive for App Store
cd ios
xcodebuild archive \
  -workspace PayoApps.xcworkspace \
  -scheme PayoApps \
  -archivePath build/PayoApps.xcarchive
```

### Android

```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

## Still Having Issues?

1. Check React Native documentation: https://reactnative.dev/docs/troubleshooting
2. Check package-specific documentation
3. Search GitHub issues for the specific package
4. Check the error logs carefully for the root cause

## Quick Commands Reference

```bash
# Start fresh
npm start -- --reset-cache

# iOS
npm run ios

# Android
npm run android

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm test

# Clean iOS
cd ios && xcodebuild clean && cd ..

# Clean Android
cd android && ./gradlew clean && cd ..

# Reinstall pods
cd ios && pod deintegrate && pod install && cd ..

# Check environment
npx react-native doctor
```

---

**Tip:** Most issues can be solved by cleaning and reinstalling dependencies. Start with the "Complete Clean Slate" section if you're stuck.
