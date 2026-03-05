// Use Case: Import Wallet
// Handles the business logic for importing an existing wallet

import { IWalletRepository } from '../repositories/IWalletRepository';
import { WalletEntity } from '../entities/Wallet.entity';

export class ImportWalletUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(seedPhrase: string[]): Promise<WalletEntity> {
    try {
      // Validate seed phrase format
      if (!seedPhrase || seedPhrase.length !== 24) {
        throw new Error('Invalid seed phrase. Must be 24 words.');
      }

      // Validate seed phrase using repository
      const isValid = this.walletRepository.validateSeedPhrase(seedPhrase);
      if (!isValid) {
        throw new Error('Invalid seed phrase. Please check and try again.');
      }

      // Check if wallet already exists
      const existingWallet = await this.walletRepository.getWallet();
      if (existingWallet) {
        throw new Error('Wallet already exists. Please delete existing wallet first.');
      }

      // Import wallet from seed phrase
      const wallet = await this.walletRepository.importWallet(seedPhrase);

      return wallet;
    } catch (error) {
      throw new Error(
        `Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
