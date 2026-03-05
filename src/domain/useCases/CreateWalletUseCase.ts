// Use Case: Create Wallet
// Handles the business logic for creating a new wallet (Single Responsibility Principle)

import { IWalletRepository } from '../repositories/IWalletRepository';
import { WalletEntity } from '../entities/Wallet.entity';

export class CreateWalletUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(): Promise<{
    wallet: WalletEntity;
    seedPhrase: string[];
  }> {
    try {
      // Check if wallet already exists
      const existingWallet = await this.walletRepository.getWallet();
      if (existingWallet) {
        throw new Error('Wallet already exists. Please import or restore.');
      }

      // Create new wallet
      const { wallet, seedPhrase } = await this.walletRepository.createWallet();

      return { wallet, seedPhrase };
    } catch (error) {
      throw new Error(
        `Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
