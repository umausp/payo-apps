// Use Case: Send Payment
// Handles the business logic for sending a payment transaction

import { IWalletRepository } from '../repositories/IWalletRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { TransactionEntity } from '../entities/Transaction.entity';
import { WalletEntity } from '../entities/Wallet.entity';

export interface SendPaymentParams {
  to: string;
  amount: string;
  metadata?: any;
}

export class SendPaymentUseCase {
  constructor(
    private walletRepository: IWalletRepository,
    private transactionRepository: ITransactionRepository,
  ) {}

  async execute(params: SendPaymentParams): Promise<TransactionEntity> {
    try {
      const { to, amount, metadata } = params;

      // Validate recipient address
      if (!WalletEntity.isValidAddress(to)) {
        throw new Error('Invalid recipient address.');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount. Must be greater than 0.');
      }

      // Get wallet from storage
      const wallet = await this.walletRepository.getWallet();
      if (!wallet) {
        throw new Error('Wallet not found. Please create or import a wallet.');
      }

      // Get private key
      const privateKey = await this.walletRepository.getPrivateKey();
      if (!privateKey) {
        throw new Error('Private key not found. Cannot sign transaction.');
      }

      // Estimate gas fee
      const { gasFee } = await this.transactionRepository.estimateGas(to, amount);

      // Check if wallet has sufficient balance
      if (!wallet.hasSufficientBalance(amount, gasFee)) {
        throw new Error('Insufficient balance for this transaction.');
      }

      // Send transaction
      const transaction = await this.transactionRepository.sendTransaction(
        to,
        amount,
        privateKey,
        metadata,
      );

      // Save transaction to local storage
      await this.transactionRepository.saveTransaction(transaction);

      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to send payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
