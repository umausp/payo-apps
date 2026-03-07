# 🔗 Web3 Wallet Integration Guide - PAYO

Complete guide to integrate external wallet connections (MetaMask, Rainbow, Trust Wallet) into your PAYO app using Wagmi + Web3Modal.

---

## 📦 Installation

### Step 1: Install Required Dependencies

```bash
# Core Web3 libraries
npm install wagmi viem @web3modal/wagmi-react-native @walletconnect/react-native-compat

# React Query (required by Wagmi)
npm install @tanstack/react-query

# Additional dependencies
npm install react-native-get-random-values react-native-mmkv
```

### Step 2: Install Peer Dependencies

```bash
# If using Expo
npx expo install react-native-svg

# If using bare React Native
npm install react-native-svg
cd ios && pod install && cd ..
```

### Step 3: Polyfills Setup

Create `polyfills.ts` in your root:

```typescript
// polyfills.ts
import 'react-native-get-random-values';
import '@walletconnect/react-native-compat';
```

Import at the **very top** of your `index.js`:

```javascript
// index.js
import './polyfills'; // ⚠️ MUST BE FIRST
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

---

## 🔑 Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Copy your Project ID
4. Add to your `.env` file:

```env
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

---

## 🚀 Integration Steps

### Step 1: Wrap Your App with Web3Provider

Update your `App.tsx`:

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { Web3Provider } from './src/infrastructure/web3/Web3Provider';
import { store } from './src/presentation/store';
import RootNavigator from './src/navigation/RootNavigator';

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <Web3Provider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </Web3Provider>
    </ReduxProvider>
  );
};

export default App;
```

### Step 2: Add ConnectWallet to Navigation

Update your `types/index.ts`:

```typescript
export type RootStackParamList = {
  // ... existing screens
  ConnectWallet: undefined;
};
```

Add to your `RootNavigator.tsx`:

```tsx
import ConnectWalletScreen from '../screens/ConnectWallet/ConnectWalletScreen';

// Inside Stack.Navigator
<Stack.Screen
  name="ConnectWallet"
  component={ConnectWalletScreen}
  options={{ headerShown: false }}
/>
```

### Step 3: Update Dashboard to Navigate to ConnectWallet

Update `DashboardScreen.tsx`:

```tsx
// Replace the "Connect Wallets" card onPress
<TouchableOpacity
  style={styles.featureCard}
  onPress={() => navigation.navigate('ConnectWallet')}
>
  <View style={styles.featureCardIcon}>
    <Icon name="account-balance-wallet" size={32} color={colors.primary[500]} />
  </View>
  <View style={styles.featureCardContent}>
    <Text style={styles.featureCardTitle}>Connect Wallets</Text>
    <Text style={styles.featureCardSubtitle}>
      Link external wallets to your account
    </Text>
  </View>
  <Icon name="chevron-right" size={24} color={colors.text.secondary} />
</TouchableOpacity>
```

---

## 🎨 Using the ConnectWalletButton Component

You can use the `ConnectWalletButton` component anywhere in your app:

```tsx
import { ConnectWalletButton } from '../components/ConnectWalletButton';

// In your component
<ConnectWalletButton
  variant="primary"  // or "secondary"
  size="medium"      // or "small" / "large"
  onPress={() => navigation.navigate('ConnectWallet')}
/>
```

### Button States:
- **Not Connected**: Shows "CONNECT WALLET" with gradient
- **Connecting**: Shows loading spinner with pulse animation
- **Connected**: Shows ENS name or truncated address (0x...1234) with green dot

---

## 🔧 Deep Linking Configuration

### iOS Setup

Add to your `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>com.payo.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>payo</string>
    </array>
  </dict>
</array>

<key>LSApplicationQueriesSchemes</key>
<array>
  <string>metamask</string>
  <string>rainbow</string>
  <string>trust</string>
  <string>cbwallet</string>
</array>
```

### Android Setup

Add to your `AndroidManifest.xml`:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="payo" />
</intent-filter>
```

---

## 🎯 Using the Custom Hook

The `usePayoWallet` hook provides a clean API:

```tsx
import { usePayoWallet } from '../hooks/usePayoWallet';

const MyComponent = () => {
  const {
    // State
    isConnected,
    isConnecting,
    address,
    displayName,          // ENS name or truncated address
    truncatedAddress,     // 0x...1234

    // Balance
    formattedBalance,     // "0.1234 ETH"
    isLoadingBalance,

    // Chain
    chainId,
    isCorrectChain,

    // Actions
    connect,
    disconnect,
    switchToCorrectChain,

    // Error
    error,
  } = usePayoWallet();

  return (
    <View>
      {isConnected ? (
        <Text>Connected: {displayName}</Text>
      ) : (
        <Button title="Connect" onPress={connect} />
      )}
    </View>
  );
};
```

---

## 🧪 Testing

### Test on Device/Simulator

1. **Install a Test Wallet**:
   - iOS: Install MetaMask from App Store
   - Android: Install MetaMask from Play Store

2. **Test Connection Flow**:
   ```
   1. Open PAYO app
   2. Navigate to Connect Wallet screen
   3. Tap "Connect Wallet"
   4. Select MetaMask from Web3Modal
   5. Approve connection in MetaMask
   6. Return to PAYO - should show connected state
   ```

3. **Test Network Switch**:
   - If connected to wrong network, tap warning banner
   - Approve network switch in wallet
   - Should update to correct chain

4. **Test Disconnection**:
   - Tap "Disconnect Wallet"
   - Confirm in alert
   - Should return to disconnected state

---

## 🎨 Customization

### Change Supported Wallets

Edit `Web3Config.ts`:

```typescript
export const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    deepLink: 'metamask://',
    downloadUrl: 'https://metamask.io/download/',
  },
  // Add your custom wallets here
];
```

### Change Target Network

Edit `usePayoWallet.ts`:

```typescript
const EXPECTED_CHAIN_ID = mainnet.id; // Change to your chain
```

### Customize Web3Modal Theme

Edit `Web3Config.ts`:

```typescript
themeVariables: {
  '--w3m-accent': '#8B5CF6',        // Your primary color
  '--w3m-background': '#121212',    // Background color
  '--w3m-color-mix': '#050505',     // Overlay color
},
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'wagmi'"
**Solution**: Make sure all dependencies are installed:
```bash
npm install wagmi viem @web3modal/wagmi-react-native
```

### Issue: "Crypto.getRandomValues() not supported"
**Solution**: Import polyfills at the very top of `index.js`:
```javascript
import './polyfills';
```

### Issue: Deep linking not working
**Solution**:
1. Check `Info.plist` (iOS) and `AndroidManifest.xml` (Android)
2. Rebuild native app: `npx expo prebuild --clean`
3. Test deep link: `npx uri-scheme open payo:// --ios`

### Issue: Web3Modal not opening
**Solution**: Make sure `Web3Provider` wraps your entire app and `<Web3Modal />` is rendered inside it.

### Issue: "User rejected request"
**Solution**: This is normal - user cancelled the connection in their wallet. The hook handles this gracefully with Gen Z error messages.

---

## 📚 Additional Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Web3Modal React Native](https://docs.walletconnect.com/web3modal/react-native/about)
- [Viem Documentation](https://viem.sh/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)

---

## 🎉 You're All Set!

Your PAYO app now has full Web3 wallet integration with:
- ✅ MetaMask, Rainbow, Trust Wallet support
- ✅ ENS name resolution
- ✅ Network switching
- ✅ Balance fetching
- ✅ Gen Z styled UI/UX
- ✅ Smooth animations
- ✅ Error handling

Happy building! 🚀
