// Repository Interface: Wallet Repository
// Defines the contract for wallet data operations (Dependency Inversion Principle)

import { WalletEntity } from '../entities/Wallet.entity';

export interface IWalletRepository {
  /**
   * Create a new wallet with seed phrase
   */
  createWallet(): Promise<{
    wallet: WalletEntity;
    seedPhrase: string[];
  }>;

  /**
   * Import wallet from seed phrase
   */
  importWallet(seedPhrase: string[]): Promise<WalletEntity>;

  /**
   * Get wallet from secure storage
   */
  getWallet(): Promise<WalletEntity | null>;

  /**
   * Save wallet to secure storage (encrypted)
   */
  saveWallet(wallet: WalletEntity, privateKey: string): Promise<void>;

  /**
   * Delete wallet from secure storage
   */
  deleteWallet(): Promise<void>;

  /**
   * Get wallet balance from blockchain
   */
  getBalance(address: string): Promise<string>;

  /**
   * Sign transaction with private key
   */
  signTransaction(
    transaction: any,
    privateKey: string,
  ): Promise<string>;

  /**
   * Validate seed phrase
   */
  validateSeedPhrase(seedPhrase: string[]): boolean;

  /**
   * Get private key from secure storage (decrypted)
   */
  getPrivateKey(): Promise<string | null>;
}
