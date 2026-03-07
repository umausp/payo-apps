# 🚀 Web3 Integration - Quick Start

Complete external wallet connection for PAYO with **MetaMask, Rainbow, Trust Wallet** support.

---

## ⚡ 1-Minute Setup

### Install Dependencies
```bash
chmod +x WEB3_INSTALL.sh
./WEB3_INSTALL.sh
```

### Get WalletConnect Project ID
1. Visit https://cloud.walletconnect.com/
2. Create project → Copy Project ID
3. Add to `.env`: 
```env
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Update Your App Entry Point

**Edit `index.js`** - Add polyfills at the **very top**:
```javascript
import './polyfills'; // ⚠️ MUST BE FIRST LINE

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### Wrap Your App with Web3Provider

**Edit `App.tsx`**:
```tsx
import { Web3Provider } from './src/infrastructure/web3/Web3Provider';

const App = () => {
  return (
    <ReduxProvider store={store}>
      <Web3Provider>  {/* Add this wrapper */}
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </Web3Provider>
    </ReduxProvider>
  );
};
```

### Add to Navigation

**Edit your navigator (e.g., `RootNavigator.tsx`)**:
```tsx
import ConnectWalletScreen from './screens/ConnectWallet/ConnectWalletScreen';

// Inside Stack.Navigator
<Stack.Screen
  name="ConnectWallet"
  component={ConnectWalletScreen}
  options={{ headerShown: false }}
/>
```

### Rebuild Native Apps
```bash
# If using Expo
npx expo prebuild --clean

# If bare React Native
cd ios && pod install && cd ..
```

---

## 🎨 What You Get

### ✅ Files Created

```
src/
├── infrastructure/
│   └── web3/
│       ├── Web3Config.ts           # Wagmi + Web3Modal setup
│       └── Web3Provider.tsx        # React provider wrapper
├── presentation/
│   ├── hooks/
│   │   └── usePayoWallet.ts        # Custom wallet hook
│   ├── components/
│   │   └── ConnectWalletButton.tsx # Animated button component
│   └── screens/
│       └── ConnectWallet/
│           └── ConnectWalletScreen.tsx  # Full wallet management screen
└── types/
    └── index.ts                    # Updated with ConnectWallet route

polyfills.ts                        # Required polyfills
WEB3_INSTALL.sh                     # Installation script
WEB3_INTEGRATION_GUIDE.md           # Complete guide
```

### ✅ Features Included

- **🔗 Multi-Wallet Support**: MetaMask, Rainbow, Trust Wallet, Coinbase Wallet
- **✨ Animations**: Smooth scale animations with React Native Reanimated
- **🎨 Gen Z Design**: Matches your existing PAYO theme
- **🌐 ENS Support**: Shows ENS names or truncated addresses
- **💰 Balance Display**: Real-time ETH balance
- **🔄 Network Switching**: Auto-detects wrong network
- **⚡ Deep Linking**: Mobile wallet app integration
- **🛡️ Error Handling**: Gen Z friendly error messages
- **♿ Accessibility**: SafeAreaView, proper touch targets

---

## 🎯 Usage Examples

### In Any Component

```tsx
import { ConnectWalletButton } from '../components/ConnectWalletButton';

<ConnectWalletButton
  variant="primary"
  size="medium"
  onPress={() => navigation.navigate('ConnectWallet')}
/>
```

### Using the Hook

```tsx
import { usePayoWallet } from '../hooks/usePayoWallet';

const MyComponent = () => {
  const {
    isConnected,
    displayName,
    formattedBalance,
    connect,
    disconnect,
  } = usePayoWallet();

  return (
    <View>
      {isConnected ? (
        <>
          <Text>{displayName}</Text>
          <Text>{formattedBalance}</Text>
          <Button title="Disconnect" onPress={disconnect} />
        </>
      ) : (
        <Button title="Connect" onPress={connect} />
      )}
    </View>
  );
};
```

---

## 🧪 Test It Out

1. **Start your app**: `npm start`
2. **Navigate**: Dashboard → "Connect Wallets" card
3. **Connect**: Tap "Connect Wallet" → Select wallet → Approve
4. **See**: Connected state with your ENS/address + balance
5. **Disconnect**: Tap "Disconnect Wallet"

---

## 📱 Button States

| State | Appearance |
|-------|-----------|
| **Disconnected** | Purple gradient "CONNECT WALLET" button |
| **Connecting** | Skeleton with pulse animation |
| **Connected** | Glass card with green dot + ENS/address |
| **Wrong Network** | Warning banner + "Switch Network" |

---

## 🎨 Customization

### Change Target Network
```typescript
// src/presentation/hooks/usePayoWallet.ts
const EXPECTED_CHAIN_ID = mainnet.id; // or polygon.id, etc.
```

### Add More Wallets
```typescript
// src/infrastructure/web3/Web3Config.ts
export const SUPPORTED_WALLETS = [
  // ... existing wallets
  {
    id: 'my-wallet',
    name: 'My Wallet',
    icon: '💎',
    deepLink: 'mywallet://',
    downloadUrl: 'https://mywallet.com',
  },
];
```

### Customize Theme
```typescript
// src/infrastructure/web3/Web3Config.ts
themeVariables: {
  '--w3m-accent': '#YOUR_COLOR',
  '--w3m-background': '#YOUR_BG',
}
```

---

## 🐛 Common Issues

**Metro bundler error after install?**
```bash
npm start -- --reset-cache
```

**Deep linking not working?**
- Check `Info.plist` (iOS) and `AndroidManifest.xml` (Android)
- Rebuild: `npx expo prebuild --clean`

**"Cannot find module wagmi"?**
- Run `./WEB3_INSTALL.sh` again
- Check `package.json` has all dependencies

**Web3Modal not opening?**
- Verify `<Web3Provider>` wraps your app
- Check console for errors
- Verify WalletConnect Project ID is set

---

## 📚 Next Steps

- Read full guide: `WEB3_INTEGRATION_GUIDE.md`
- Configure deep linking for iOS/Android
- Test on physical device with real wallet
- Customize supported wallet list
- Add additional chains

---

## ✨ You're Ready!

Your PAYO app now has **full Web3 integration** with a **Gen Z aesthetic**!

Users can connect MetaMask, Rainbow, Trust Wallet, and more with smooth animations and error handling.

**Happy building!** 🚀💜
