# App Lock & Splash Screen Implementation

## ✅ Features Implemented

### 1. Auto-Lock on Background
**When app goes to background, it automatically locks and requires biometric re-authentication**

#### How it Works:
1. **AppState Listener** in `App.tsx` detects when app goes to background
2. **Dispatches `lockApp()` action** which sets `isAuthenticated = false`
3. **Navigation automatically shows Login screen** when user returns
4. **User must authenticate with biometrics** to access the app again

#### Code Changes:
- **`App.tsx`**: Added AppState listener
- **`authSlice.ts`**: Added `lockApp()` reducer action
- **Logic**: Only locks if user is authenticated and has a wallet

#### Behavior:
- App goes to background → **Locked**
- App returns to foreground → **Shows Login/Biometric screen**
- User authenticates → **Returns to previous screen**

---

### 2. Enhanced Splash Screen
**Splash screen is now more visible with animations and proper timing**

#### Improvements:
1. **Minimum 2 second display** (even if wallet loads faster)
2. **Animated entrance** - Fade in + scale animation
3. **Enhanced design**:
   - Larger logo (64px)
   - "WALLET" badge below logo
   - Updated tagline: "Gen Z Crypto Payment App"
   - Loading indicator with "Loading your wallet..." text
   - Gradient background (purple theme)

#### Code Changes:
- **`SplashScreen.tsx`**:
  - Added Animated API for smooth entrance
  - Enhanced styles with badges and shadows
  - Better typography and spacing
- **`RootNavigator.tsx`**:
  - Ensures splash shows for minimum 2 seconds
  - Prevents quick flash
- **`constants/index.ts`**:
  - Updated `SPLASH_DURATION` to 3 seconds

---

## 🔒 Security Benefits

### Auto-Lock Feature:
- ✅ Prevents unauthorized access when phone is left unattended
- ✅ Requires biometric/PIN for every app session
- ✅ Protects wallet and transaction data
- ✅ Complies with mobile security best practices

### Session Management:
- App locks when going to background (inactive/background state)
- Only locks if user is authenticated (doesn't lock during onboarding)
- Preserves app state (user doesn't lose their place)
- JWT tokens remain valid (no logout)

---

## 🎨 User Experience

### Flow:
```
App Launch → Splash (2s) → Dashboard/Login
                              ↓
                         User leaves app
                              ↓
                         App locks (background)
                              ↓
                         User returns
                              ↓
                    Biometric/Login screen shown
                              ↓
                    Authenticate successfully
                              ↓
                    Resume where they left off
```

### Splash Screen Experience:
1. User opens app
2. Sees beautiful animated logo
3. "Loading your wallet..." message
4. Smooth transition to next screen
5. No jarring quick flash

---

## 📱 Testing Guide

### Test Auto-Lock:
1. Open the app and authenticate
2. Navigate to Dashboard
3. Press home button (app goes to background)
4. Wait 2 seconds
5. Return to app
6. **Expected**: Biometric/Login screen appears
7. Authenticate
8. **Expected**: Returns to Dashboard

### Test Splash Screen:
1. Force quit the app completely
2. Open the app fresh
3. **Expected**: See animated splash screen for ~2 seconds
4. **Expected**: Smooth fade-in and scale animation
5. **Expected**: "Loading your wallet..." text visible

---

## 🔧 Configuration

### Auto-Lock Settings:
```typescript
// constants/index.ts
export const SECURITY = {
  AUTO_LOCK_TIME_MINUTES: 5,     // Not used for background lock
  SESSION_TIMEOUT_MINUTES: 30,    // JWT session timeout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION_MINUTES: 30,
};
```

### Splash Screen Settings:
```typescript
// constants/index.ts
export const UI = {
  SPLASH_DURATION: 3000,  // 3 seconds
};
```

---

## 🚀 Future Enhancements

### Possible Improvements:
1. **Configurable auto-lock time** - Let users choose delay before lock
2. **Trusted devices** - Don't lock on trusted WiFi networks
3. **Quick unlock** - Face ID without full navigation
4. **Lock screen preview** - Show balance (blurred) on lock screen
5. **Emergency access** - Panic mode to hide sensitive info

---

## 🐛 Troubleshooting

### Splash screen not showing:
- Clear app cache and reinstall
- Check if `isLoading` state is properly set in Redux
- Verify PersistGate is rendering

### Auto-lock not working:
- Check AppState listener is registered
- Verify `lockApp()` action is dispatched
- Check Redux state: `auth.isAuthenticated`
- Make sure `app.hasWallet` is true

### App locks too aggressively:
- Check AppState transitions in logs
- Verify only locking on 'background' state
- May need to add debounce for quick app switches

---

## 📝 Implementation Details

### Files Modified:
1. **`App.tsx`**
   - Added AppState listener
   - Dispatch `lockApp()` on background

2. **`authSlice.ts`**
   - Added `lockApp()` reducer
   - Exported new action

3. **`SplashScreen.tsx`**
   - Complete redesign with animations
   - Enhanced visual design

4. **`RootNavigator.tsx`**
   - Added minimum splash duration logic
   - Ensures smooth transitions

5. **`constants/index.ts`**
   - Updated UI constants
   - Increased splash duration

---

## ✅ Acceptance Criteria Met

- [x] App locks when going to background
- [x] Biometric screen appears on foreground
- [x] Splash screen visible for minimum 2 seconds
- [x] Smooth animations and transitions
- [x] No loss of user state/data
- [x] Works with existing auth flow
- [x] No breaking changes

---

Built with ❤️ for PAYO Wallet
