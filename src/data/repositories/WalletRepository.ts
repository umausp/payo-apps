// Wallet Repository Implementation
// Implements IWalletRepository interface

import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { WalletEntity } from '../../domain/entities/Wallet.entity';
import BlockchainService from '../../infrastructure/blockchain/BlockchainService';
import SecureStorageService from '../../infrastructure/storage/SecureStorageService';
import { STORAGE_KEYS } from '../../constants';

export class WalletRepository implements IWalletRepository {
  private blockchainService = BlockchainService;
  private secureStorage = SecureStorageService;

  /**
   * Create a new wallet with seed phrase
   */
  async createWallet(): Promise<{
    wallet: WalletEntity;
    seedPhrase: string[];
  }> {
    try {
      const { wallet: ethersWallet, mnemonic } =
        this.blockchainService.createWallet();

      const walletEntity = new WalletEntity(
        ethersWallet.address,
        ethersWallet.publicKey,
        '0',
        '0',
        true,
        new Date(),
      );

      // Save wallet (encrypted) to secure storage
      await this.saveWallet(walletEntity, ethersWallet.privateKey);

      return {
        wallet: walletEntity,
        seedPhrase: mnemonic,
      };
    } catch (error) {
      throw new Error(
        `Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Import wallet from seed phrase
   */
  async importWallet(seedPhrase: string[]): Promise<WalletEntity> {
    try {
      const ethersWallet =
        this.blockchainService.importWalletFromMnemonic(seedPhrase);

      const walletEntity = new WalletEntity(
        ethersWallet.address,
        ethersWallet.publicKey,
        '0',
        '0',
        true,
        new Date(),
      );

      // Save wallet (encrypted) to secure storage
      await this.saveWallet(walletEntity, ethersWallet.privateKey);

      return walletEntity;
    } catch (error) {
      throw new Error(
        `Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get wallet from secure storage
   */
  async getWallet(): Promise<WalletEntity | null> {
    try {
      const walletDataStr = await this.secureStorage.get(
        STORAGE_KEYS.WALLET_ENCRYPTED,
      );

      if (!walletDataStr) {
        return null;
      }

      const walletData = JSON.parse(walletDataStr);

      return new WalletEntity(
        walletData.address,
        walletData.publicKey,
        walletData.balance || '0',
        walletData.fiatBalance || '0',
        walletData.isNonCustodial !== false,
        new Date(walletData.createdAt),
      );
    } catch (error) {
      console.error('Failed to get wallet:', error);
      return null;
    }
  }

  /**
   * Save wallet to secure storage (encrypted)
   */
  async saveWallet(wallet: WalletEntity, privateKey: string): Promise<void> {
    try {
      const walletData = {
        ...wallet.toObject(),
        privateKey, // Will be encrypted by secure storage
      };

      await this.secureStorage.save(
        STORAGE_KEYS.WALLET_ENCRYPTED,
        JSON.stringify(walletData),
      );
    } catch (error) {
      throw new Error(
        `Failed to save wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete wallet from secure storage
   */
  async deleteWallet(): Promise<void> {
    try {
      await this.secureStorage.delete(STORAGE_KEYS.WALLET_ENCRYPTED);
    } catch (error) {
      throw new Error(
        `Failed to delete wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get wallet balance from blockchain
   */
  async getBalance(address: string): Promise<string> {
    try {
      return await this.blockchainService.getBalance(address);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Sign transaction with private key
   */
  async signTransaction(transaction: any, privateKey: string): Promise<string> {
    try {
      const wallet = this.blockchainService.importWalletFromPrivateKey(privateKey);
      const signedTx = await wallet.signTransaction(transaction);
      return signedTx;
    } catch (error) {
      throw new Error(
        `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Validate seed phrase
   */
  validateSeedPhrase(seedPhrase: string[]): boolean {
    return this.blockchainService.isValidMnemonic(seedPhrase);
  }

  /**
   * Get private key from secure storage (decrypted)
   */
  async getPrivateKey(): Promise<string | null> {
    try {
      const walletDataStr = await this.secureStorage.get(
        STORAGE_KEYS.WALLET_ENCRYPTED,
      );

      if (!walletDataStr) {
        return null;
      }

      const walletData = JSON.parse(walletDataStr);
      return walletData.privateKey || null;
    } catch (error) {
      console.error('Failed to get private key:', error);
      return null;
    }
  }
}

export default new WalletRepository();
