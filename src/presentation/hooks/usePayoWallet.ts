/**
 * usePayoWallet Hook - SIMPLIFIED
 * Direct AppKit instance access - no buggy hooks
 */

import { useCallback, useState } from 'react';
import { appKit } from '../../infrastructure/web3/Web3Config';
import { useAccount } from '@reown/appkit-react-native';

// Expected chain ID (Sepolia testnet for development)
const EXPECTED_CHAIN_ID = 11155111; // Sepolia

export interface PayoWalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address?: string;
  chainId?: number;

  // Display info
  displayName: string;
  truncatedAddress: string;
  formattedBalance?: string;

  // Chain validation
  isCorrectChain: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToCorrectChain: () => Promise<void>;

  // Error handling
  error?: Error;
}

export const usePayoWallet = (): PayoWalletState => {
  const [isConnecting, setIsConnecting] = useState(false);

  // Use the correct hook name (useAccount, not useAppKitAccount)
  const { address, isConnected, caipAddress } = useAccount();

  // Extract chainId from CAIP address (format: "eip155:11155111:0x...")
  const chainId = caipAddress ? parseInt(caipAddress.split(':')[1]) : undefined;

  console.log('[usePayoWallet] Account state:', {
    address,
    isConnected,
    chainId,
    caipAddress,
  });

  // Computed values
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const displayName = truncatedAddress;
  const isCorrectChain = isConnected && chainId === EXPECTED_CHAIN_ID;

  // Connect to wallet - use appKit instance directly
  const connect = useCallback(async () => {
    try {
      console.log('[usePayoWallet] ===== CONNECTING =====');
      console.log('[usePayoWallet] AppKit instance:', appKit);

      setIsConnecting(true);

      // Use the appKit instance directly instead of the buggy hook
      if (appKit && typeof appKit.open === 'function') {
        console.log('[usePayoWallet] Opening modal via appKit.open()');
        await appKit.open({ view: 'Connect' });
        console.log('[usePayoWallet] Modal opened');
      } else {
        throw new Error('AppKit instance not available or open() is not a function');
      }
    } catch (err) {
      console.error('[usePayoWallet] ===== FAILED =====');
      console.error('[usePayoWallet] Error:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    try {
      console.log('[usePayoWallet] Disconnecting...');
      if (appKit && typeof appKit.disconnect === 'function') {
        appKit.disconnect();
        console.log('[usePayoWallet] Disconnected');
      }
    } catch (err) {
      console.error('[usePayoWallet] Disconnect failed:', err);
    }
  }, []);

  // Switch to correct chain
  const switchToCorrectChain = useCallback(async () => {
    if (!isConnected || chainId === EXPECTED_CHAIN_ID) {
      return;
    }

    try {
      console.log('[usePayoWallet] Switching to Sepolia...');
      if (appKit && typeof appKit.open === 'function') {
        await appKit.open({ view: 'Networks' });
      }
    } catch (err) {
      console.error('[usePayoWallet] Chain switch failed:', err);
      throw err;
    }
  }, [isConnected, chainId]);

  return {
    isConnected,
    isConnecting,
    address,
    chainId,
    displayName,
    truncatedAddress,
    formattedBalance: undefined,
    isCorrectChain,
    connect,
    disconnect,
    switchToCorrectChain,
    error: undefined,
  };
};

export default usePayoWallet;
