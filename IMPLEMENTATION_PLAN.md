# PAYO Wallet - Complete Implementation Plan

## ✅ Completed Features

### 1. Design System & Theme
- ✅ Design tokens created (`src/presentation/theme/tokens.ts`)
- ✅ Colors, typography, spacing, shadows defined
- ✅ Enterprise-level design system
- ✅ Component tokens for consistency

### 2. Navigation Enhancements
- ✅ BackButton component created
- ✅ Reusable across all screens
- ✅ Consistent navigation UX

### 3. API Integration
- ✅ Complete API service layer (`ApiService.ts`)
- ✅ Axios-based HTTP client
- ✅ Request/response interceptors
- ✅ Error handling
- ✅ Endpoints for:
  - Price oracle
  - Transactions
  - QR validation
  - Gas estimation
  - Wallet info
  - Push notifications

### 4. Seed Phrase Update
- ✅ Changed from 24-word to **12-word** seed phrase (as per PDF)
- ✅ Updated constants
- ✅ Enhanced SeedPhraseScreen with:
  - Copy to clipboard
  - Share/Save functionality
  - Confirmation dialogs

### 5. Dependencies Installed
- ✅ @react-native-clipboard/clipboard
- ✅ react-native-camera (for QR scanning)
- ✅ react-native-permissions

---

## 🚧 In Progress / To Implement

### 1. Back Buttons on All Screens
**Status:** Component created, needs integration

**Files to Update:**
```
src/presentation/screens/Wallet/Create/CreateWalletScreen.tsx
src/presentation/screens/Wallet/Import/ImportWalletScreen.tsx
src/presentation/screens/Wallet/SeedPhrase/SeedPhraseScreen.tsx
src/presentation/screens/Wallet/Confirmation/SeedPhraseConfirmationScreen.tsx
src/presentation/screens/Auth/Biometric/BiometricSetupScreen.tsx
src/presentation/screens/Payment/Preview/PaymentPreviewScreen.tsx
src/presentation/screens/Payment/Processing/PaymentProcessingScreen.tsx
src/presentation/screens/Settings/SettingsScreen.tsx
```

**Implementation:**
```typescript
import BackButton from '../../../components/BackButton';

// Add to each screen:
<SafeAreaView style={styles.container}>
  <BackButton />
  {/* rest of screen content */}
</SafeAreaView>
```

### 2. Real Camera QR Scanner
**Status:** Dependencies installed, implementation needed

**Implementation Steps:**
1. Update `QRScannerScreen.tsx` with react-native-camera
2. Add camera permissions to Info.plist (iOS)
3. Add camera permissions to AndroidManifest.xml
4. Implement QR code detection
5. Add flash toggle
6. Add manual entry fallback

**File:** `src/presentation/screens/QRScanner/QRScannerScreen.tsx`

**iOS Permissions (Info.plist):**
```xml
<key>NSCameraUsageDescription</key>
<string>PAYO needs camera access to scan QR codes for payments</string>
```

**Android Permissions (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### 3. Screenshot Protection & Screen Recording Disable
**Status:** Not implemented

**Implementation:**
- iOS: Use react-native-screenshot-prevent
- Android: Add FLAG_SECURE to activity

**Steps:**
1. Install: `npm install react-native-screenshot-prevent`
2. Add to App.tsx initialization
3. Enable on sensitive screens (SeedPhrase, Login, Settings)

### 4. Onboarding Carousel
**Status:** Current onboarding is basic

**Enhancement Needed:**
- Add carousel with Skip/Next buttons
- Multiple slides showing features
- Smooth animations
- Store onboarding completion

**Library:** react-native-swiper or react-native-snap-carousel

### 5. Transaction Filters
**Status:** Not implemented

**Add to DashboardScreen:**
- Date range filter
- Amount filter
- Status filter (pending/confirmed/failed)
- Sort options

### 6. Gas Fee Display
**Status:** Estimation logic exists, UI needed

**Add to PaymentPreviewScreen:**
- Show gas price (Gwei)
- Show gas limit
- Show total gas fee in MATIC
- Show gas fee in USD

### 7. Auto-Lock After Inactivity
**Status:** Not implemented

**Implementation:**
1. Track last activity time
2. Set timer for 5 minutes (configurable)
3. Lock app and require re-authentication
4. Store lock state in Redux

**Files:**
- `src/presentation/store/slices/authSlice.ts`
- Create hook: `useAutoLock.ts`

### 8. Failed Login Attempts & Temporary Lock
**Status:** Partial (max attempts tracked)

**Enhancement Needed:**
- Track failed attempts in Redux
- After 5 failed attempts → 30-minute lock
- Show countdown timer
- Store lock timestamp
- Clear attempts on successful login

### 9. Push Notifications
**Status:** API endpoint ready, implementation needed

**Steps:**
1. Install: `@react-native-firebase/messaging`
2. Configure Firebase
3. Request notification permissions
4. Register device token with backend
5. Handle notifications (foreground/background)

### 10. Transaction History with Backend
**Status:** API service ready, integration needed

**Implementation:**
- Call ApiService.fetchTransactions()
- Cache transactions locally
- Implement pull-to-refresh
- Pagination
- Filter & search

### 11. Price Oracle Integration
**Status:** API service ready, integration needed

**Implementation:**
- Call ApiService.fetchTokenPrice() every 60 seconds
- Cache price data
- Show price change indicator
- Convert PAYO to fiat

### 12. Webhook Integration (Merchant Notification)
**Status:** API service ready

**Implementation:**
- After successful transaction, call sendWebhook()
- Retry logic (5 attempts)
- Show webhook status in merchant portal

---

## 📐 UI/UX Improvements Needed

### 1. Apply Design Tokens
**Files to Update:** All screens

**Replace hardcoded values with tokens:**
```typescript
// Before
backgroundColor: '#FFFFFF'
color: '#6366F1'
padding: 24

// After
import { colors, spacing } from '../../../theme/tokens';

backgroundColor: colors.neutral[0]
color: colors.primary[500]
padding: spacing[6]
```

### 2. Add Loading States
- Skeleton loaders for transaction list
- Shimmer effect for balance loading
- Spinner for API calls

### 3. Add Empty States
- No transactions yet
- No internet connection
- Wallet not found

### 4. Error Boundaries
- Catch React errors
- Show user-friendly error screen
- Log errors to backend

### 5. Animations
- Screen transitions
- Button press feedback
- Success/error animations
- Loading indicators

---

## 🔒 Security Enhancements

### 1. Screenshot Protection
**Priority:** HIGH

**Implementation:**
```bash
npm install react-native-screenshot-prevent
```

```typescript
import ScreenshotPrevent from 'react-native-screenshot-prevent';

// In SeedPhraseScreen, LoginScreen
useEffect(() => {
  ScreenshotPrevent.enabled(true);
  return () => ScreenshotPrevent.enabled(false);
}, []);
```

### 2. Root Detection
- Detect jailbroken/rooted devices
- Show warning to user
- Optionally disable app

### 3. SSL Pinning
- Pin API server certificate
- Prevent man-in-the-middle attacks

### 4. Code Obfuscation
- Use React Native obfuscator
- Protect API keys
- Minimize reverse engineering risk

---

## 📱 Platform-Specific Tasks

### iOS
- [ ] Update Podfile with new dependencies
- [ ] Run `pod install`
- [ ] Add camera permission to Info.plist
- [ ] Configure push notifications
- [ ] Test on physical device

### Android
- [ ] Add camera permission to AndroidManifest.xml
- [ ] Configure ProGuard rules
- [ ] Add FLAG_SECURE for screenshot prevention
- [ ] Test on physical device
- [ ] Configure push notifications

---

## 🧪 Testing

### Unit Tests Needed
- Wallet creation/import
- Transaction signing
- Balance calculation
- QR code validation
- API service methods

### Integration Tests
- End-to-end payment flow
- Biometric authentication
- Auto-lock mechanism
- Push notification handling

### UI Tests
- Navigation flow
- Form validation
- Error handling
- Accessibility

---

## 📝 Documentation

### User-Facing
- [ ] In-app help/FAQ
- [ ] Troubleshooting guide
- [ ] Security best practices
- [ ] Backup/recovery guide

### Developer-Facing
- [ ] API documentation
- [ ] Architecture diagram
- [ ] Component library
- [ ] Deployment guide

---

## 🚀 Deployment Checklist

### Pre-Launch
- [ ] All features implemented
- [ ] Tests passing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility audit
- [ ] Beta testing completed

### App Store Submission
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support contact configured

### Backend
- [ ] API server deployed
- [ ] Database configured
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Rate limiting configured

---

## Priority Implementation Order

### Phase 1 (Critical)
1. ✅ Design tokens
2. ✅ API service layer
3. ✅ 12-word seed phrase
4. 🔲 Back buttons on all screens
5. 🔲 Camera QR scanner
6. 🔲 Screenshot protection

### Phase 2 (Important)
7. 🔲 Gas fee display
8. 🔲 Transaction filters
9. 🔲 Auto-lock mechanism
10. 🔲 Failed attempts handling
11. 🔲 Price oracle integration
12. 🔲 Apply design tokens everywhere

### Phase 3 (Enhancement)
13. 🔲 Onboarding carousel
14. 🔲 Push notifications
15. 🔲 Loading states
16. 🔲 Empty states
17. 🔲 Animations
18. 🔲 Error boundaries

### Phase 4 (Polish)
19. 🔲 Performance optimization
20. 🔲 Security hardening
21. 🔲 Accessibility
22. 🔲 Documentation
23. 🔲 Testing
24. 🔲 Deployment preparation

---

## Next Immediate Actions

1. **Add BackButton to all screens** (Quick Win - 30 min)
2. **Implement Camera QR Scanner** (High Priority - 2 hours)
3. **Add Screenshot Protection** (Security - 1 hour)
4. **Apply Design Tokens** (UI Consistency - 2 hours)
5. **Integrate Price Oracle** (User Value - 1 hour)

Total estimated time for Phase 1 completion: **8-10 hours**
