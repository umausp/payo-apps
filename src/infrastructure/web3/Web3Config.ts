/**
 * Web3 Configuration for PAYO Wallet
 * Reown AppKit (WalletConnect) Setup for React Native
 *
 * IMPORTANT: This file must import polyfills first!
 */

import '@walletconnect/react-native-compat';

import { createAppKit } from '@reown/appkit-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { mainnet, sepolia, polygon, polygonAmoy } from '@reown/appkit/networks';
import AsyncStorage from '@react-native-async-storage/async-storage';

// WalletConnect Project ID (from https://cloud.reown.com/)
export const WALLETCONNECT_PROJECT_ID = '3b2b27577a8eb189176a6f9cd6dbd0c5';

// Initialize Ethers adapter
const ethersAdapter = new EthersAdapter();

// Storage adapter for AppKit
const storage = {
  async getKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter((key) => key.startsWith('@appkit:'));
  },
  async getEntries<T = any>(): Promise<[string, T][]> {
    const keys = await this.getKeys();
    const entries = await AsyncStorage.multiGet(keys);
    return entries.map(([key, value]) => [key, JSON.parse(value || '{}')]);
  },
  async getItem<T = any>(key: string): Promise<T | undefined> {
    const value = await AsyncStorage.getItem(`@appkit:${key}`);
    return value ? JSON.parse(value) : undefined;
  },
  async setItem<T = any>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(`@appkit:${key}`, JSON.stringify(value));
  },
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(`@appkit:${key}`);
  },
};

// Create AppKit instance
export const appKit = createAppKit({
  projectId: WALLETCONNECT_PROJECT_ID,
  networks: [mainnet, sepolia, polygon, polygonAmoy],
  adapters: [ethersAdapter],
  storage,
  metadata: {
    name: 'PAYO Wallet',
    description: 'Gen Z Crypto Payment App',
    url: 'https://payo.app',
    icons: ['https://payo.app/icon.png'],
    redirect: {
      native: 'payo://',
      universal: 'https://payo.app',
    },
  },
});

console.log('[Web3Config] ✓ AppKit initialized with Ethers adapter and storage');

// Deep linking configuration for mobile wallets
export const DEEP_LINK_CONFIG = {
  scheme: 'payo',
  universalLink: 'https://payo.app',
};

// Supported wallet list for custom UI
export const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    deepLink: 'metamask://',
    downloadUrl: 'https://metamask.io/download/',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    deepLink: 'rainbow://',
    downloadUrl: 'https://rainbow.me/',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    deepLink: 'trust://',
    downloadUrl: 'https://trustwallet.com/',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    deepLink: 'cbwallet://',
    downloadUrl: 'https://www.coinbase.com/wallet',
  },
] as const;

// Default export
export default appKit;
