/**
 * SIMPLE WalletConnect Integration
 * No AppKit, no fancy modals - just basic connection
 */

import { Linking } from 'react-native';

const PROJECT_ID = '3b2b27577a8eb189176a6f9cd6dbd0c5';

export interface WalletConnection {
  address: string;
  chainId: number;
}

class SimpleWalletConnect {
  private connection: WalletConnection | null = null;

  // Open wallet app directly with deep link
  async connect(): Promise<WalletConnection> {
    try {
      console.log('[SimpleWalletConnect] Connecting...');

      // Generate WalletConnect URI
      const uri = await this.generateWCUri();

      // Open MetaMask with the URI
      const metamaskDeepLink = `metamask://wc?uri=${encodeURIComponent(uri)}`;

      const canOpen = await Linking.canOpenURL(metamaskDeepLink);

      if (canOpen) {
        console.log('[SimpleWalletConnect] Opening MetaMask...');
        await Linking.openURL(metamaskDeepLink);

        // Return dummy data for now - in production you'd wait for the callback
        return {
          address: '0x...', // Will be set by actual connection
          chainId: 11155111,
        };
      } else {
        throw new Error('MetaMask not installed');
      }
    } catch (error) {
      console.error('[SimpleWalletConnect] Error:', error);
      throw error;
    }
  }

  private async generateWCUri(): Promise<string> {
    // This is a simplified version
    // In production, you'd use @walletconnect/client
    const topic = this.generateRandomTopic();
    return `wc:${topic}@2?relay-protocol=irn&symKey=${this.generateSymKey()}`;
  }

  private generateRandomTopic(): string {
    return Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generateSymKey(): string {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  disconnect() {
    this.connection = null;
    console.log('[SimpleWalletConnect] Disconnected');
  }

  isConnected(): boolean {
    return this.connection !== null;
  }

  getAddress(): string | undefined {
    return this.connection?.address;
  }
}

export const simpleWalletConnect = new SimpleWalletConnect();
