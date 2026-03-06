// Transaction Repository Implementation
// Implements ITransactionRepository interface

import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { TransactionEntity } from '../../domain/entities/Transaction.entity';
import { TransactionStatus, TransactionType } from '../../types';
import BlockchainService from '../../infrastructure/blockchain/BlockchainService';
import AsyncStorageService from '../../infrastructure/storage/AsyncStorageService';
import PaymentService from '../../infrastructure/payment/PaymentService';
import { STORAGE_KEYS, TRANSACTION } from '../../constants';

export class TransactionRepository implements ITransactionRepository {
  private blockchainService = BlockchainService;
  private asyncStorage = AsyncStorageService;

  /**
   * Send transaction via payment service (EIP-2771 meta-transaction)
   */
  async sendTransaction(
    to: string,
    amount: string,
    privateKey: string,
    metadata?: any,
  ): Promise<TransactionEntity> {
    try {
      const wallet = this.blockchainService.importWalletFromPrivateKey(privateKey);

      // Send payment through payment service (goes through PaymentProcessor)
      const result = await PaymentService.sendPayment({
        from: wallet.address,
        to,
        amount,
        privateKey,
      });

      // Estimate gas for display purposes
      const { gasFee, gasPrice, gasLimit } = await this.estimateGas(to, amount);

      const transaction = new TransactionEntity(
        result.txHash,
        result.txHash,
        wallet.address,
        to,
        amount,
        '0', // Will be calculated with price
        gasPrice,
        gasLimit,
        gasFee,
        TransactionStatus.PENDING,
        new Date(),
        TransactionType.SEND,
        undefined,
        metadata,
      );

      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(hash: string): Promise<TransactionEntity | null> {
    try {
      const receipt = await this.blockchainService.getTransactionReceipt(hash);

      if (!receipt) {
        return null;
      }

      const status =
        receipt.status === 1
          ? TransactionStatus.CONFIRMED
          : TransactionStatus.FAILED;

      const transaction = new TransactionEntity(
        hash,
        hash,
        receipt.from,
        receipt.to || '',
        '0', // Amount would need to be parsed from logs
        '0',
        receipt.gasPrice?.toString() || '0',
        receipt.gasLimit?.toString() || '0',
        (receipt.gasUsed * (receipt.gasPrice || 0n)).toString(),
        status,
        new Date(),
        TransactionType.SEND,
        receipt.blockNumber,
      );

      return transaction;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      return null;
    }
  }

  /**
   * Get all transactions for an address
   */
  async getTransactionsByAddress(
    address: string,
    limit: number = 50,
  ): Promise<TransactionEntity[]> {
    try {
      // First, try to get from cache
      const cachedTransactions = await this.getCachedTransactions(address);

      if (cachedTransactions.length > 0) {
        return cachedTransactions.slice(0, limit);
      }

      // In a real implementation, this would fetch from a blockchain indexer API
      // For now, return cached transactions only
      return [];
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(hash: string): Promise<TransactionStatus> {
    try {
      const receipt = await this.blockchainService.getTransactionReceipt(hash);

      if (!receipt) {
        return TransactionStatus.PENDING;
      }

      return receipt.status === 1
        ? TransactionStatus.CONFIRMED
        : TransactionStatus.FAILED;
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return TransactionStatus.PENDING;
    }
  }

  /**
   * Estimate gas fee for transaction
   */
  async estimateGas(
    to: string,
    amount: string,
  ): Promise<{
    gasPrice: string;
    gasLimit: string;
    gasFee: string;
  }> {
    return await this.blockchainService.estimateGas(to, amount);
  }

  /**
   * Watch transaction status until confirmed
   */
  async watchTransaction(
    hash: string,
    onStatusChange: (status: TransactionStatus, blockNumber?: number) => void,
  ): Promise<void> {
    try {
      const pollStatus = async () => {
        const receipt = await this.blockchainService.getTransactionReceipt(hash);

        if (receipt) {
          const status =
            receipt.status === 1
              ? TransactionStatus.CONFIRMED
              : TransactionStatus.FAILED;

          onStatusChange(status, receipt.blockNumber);
        } else {
          // Transaction still pending, poll again
          setTimeout(pollStatus, TRANSACTION.POLLING_INTERVAL);
        }
      };

      // Start polling
      pollStatus();
    } catch (error) {
      console.error('Failed to watch transaction:', error);
      onStatusChange(TransactionStatus.FAILED);
    }
  }

  /**
   * Save transaction to local storage
   */
  async saveTransaction(transaction: TransactionEntity): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.TRANSACTIONS_CACHE}:${transaction.from}`;
      const cachedTransactions = await this.asyncStorage.get<any[]>(key) || [];

      cachedTransactions.unshift(transaction.toObject());

      // Keep only the last 100 transactions
      if (cachedTransactions.length > 100) {
        cachedTransactions.splice(100);
      }

      await this.asyncStorage.save(key, cachedTransactions);
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  }

  /**
   * Get cached transactions from local storage
   */
  async getCachedTransactions(address: string): Promise<TransactionEntity[]> {
    try {
      const key = `${STORAGE_KEYS.TRANSACTIONS_CACHE}:${address}`;
      const cachedData = await this.asyncStorage.get<any[]>(key);

      if (!cachedData || !Array.isArray(cachedData)) {
        return [];
      }

      return cachedData.map(
        (tx) =>
          new TransactionEntity(
            tx.id,
            tx.hash,
            tx.from,
            tx.to,
            tx.amount,
            tx.fiatAmount,
            tx.gasPrice,
            tx.gasLimit,
            tx.gasFee,
            tx.status,
            new Date(tx.timestamp),
            tx.type,
            tx.blockNumber,
            tx.metadata,
          ),
      );
    } catch (error) {
      console.error('Failed to get cached transactions:', error);
      return [];
    }
  }
}

export default new TransactionRepository();
