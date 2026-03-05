// Repository Interface: Transaction Repository
// Defines the contract for transaction data operations

import { TransactionEntity } from '../entities/Transaction.entity';
import { TransactionStatus } from '../../types';

export interface ITransactionRepository {
  /**
   * Send transaction to blockchain
   */
  sendTransaction(
    to: string,
    amount: string,
    privateKey: string,
    metadata?: any,
  ): Promise<TransactionEntity>;

  /**
   * Get transaction by hash
   */
  getTransactionByHash(hash: string): Promise<TransactionEntity | null>;

  /**
   * Get all transactions for an address
   */
  getTransactionsByAddress(
    address: string,
    limit?: number,
  ): Promise<TransactionEntity[]>;

  /**
   * Get transaction status
   */
  getTransactionStatus(hash: string): Promise<TransactionStatus>;

  /**
   * Estimate gas fee for transaction
   */
  estimateGas(to: string, amount: string): Promise<{
    gasPrice: string;
    gasLimit: string;
    gasFee: string;
  }>;

  /**
   * Watch transaction status until confirmed
   */
  watchTransaction(
    hash: string,
    onStatusChange: (status: TransactionStatus, blockNumber?: number) => void,
  ): Promise<void>;

  /**
   * Save transaction to local storage
   */
  saveTransaction(transaction: TransactionEntity): Promise<void>;

  /**
   * Get cached transactions from local storage
   */
  getCachedTransactions(address: string): Promise<TransactionEntity[]>;
}
