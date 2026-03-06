// Use Case: Get Wallet Balance
// Handles the business logic for fetching wallet balance

import { IWalletRepository } from '../repositories/IWalletRepository';
import { IPriceRepository } from '../repositories/IPriceRepository';

export interface WalletBalance {
  balance: string; // PAYO token balance
  fiatBalance: string;
  nativeBalance: string; // ETH balance for gas
}

export class GetWalletBalanceUseCase {
  constructor(
    private walletRepository: IWalletRepository,
    private priceRepository: IPriceRepository,
  ) {}

  async execute(): Promise<WalletBalance> {
    try {
      // Get wallet from storage
      const wallet = await this.walletRepository.getWallet();
      if (!wallet) {
        throw new Error('Wallet not found. Please create or import a wallet.');
      }

      // Fetch PAYO token balance from blockchain
      const balance = await this.walletRepository.getBalance(wallet.address);

      // Fetch native ETH balance for gas
      const nativeBalance = await this.walletRepository.getNativeBalance(wallet.address);

      // Convert to fiat
      const fiatBalance = await this.priceRepository.convertToFiat(balance);

      // Update wallet entity with both balances
      wallet.updateBalance(balance, fiatBalance, nativeBalance);

      // Save updated wallet
      const privateKey = await this.walletRepository.getPrivateKey();
      if (privateKey) {
        await this.walletRepository.saveWallet(wallet, privateKey);
      }

      return {
        balance,
        fiatBalance,
        nativeBalance,
      };
    } catch (error) {
      throw new Error(
        `Failed to get wallet balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
