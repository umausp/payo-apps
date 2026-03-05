// Domain Entity: Transaction
// Represents the core transaction business logic

import { TransactionStatus, TransactionType, TransactionMetadata } from '../../types';

export class TransactionEntity {
  constructor(
    public readonly id: string,
    public readonly hash: string,
    public readonly from: string,
    public readonly to: string,
    public readonly amount: string,
    public readonly fiatAmount: string,
    public readonly gasPrice: string,
    public readonly gasLimit: string,
    public readonly gasFee: string,
    public status: TransactionStatus,
    public readonly timestamp: Date,
    public readonly type: TransactionType,
    public readonly blockNumber?: number,
    public readonly metadata?: TransactionMetadata,
  ) {}

  /**
   * Check if transaction is pending
   */
  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  /**
   * Check if transaction is confirmed
   */
  isConfirmed(): boolean {
    return this.status === TransactionStatus.CONFIRMED;
  }

  /**
   * Check if transaction is failed
   */
  isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  /**
   * Update transaction status
   */
  updateStatus(status: TransactionStatus, blockNumber?: number): void {
    this.status = status;
    if (blockNumber !== undefined) {
      (this as any).blockNumber = blockNumber;
    }
  }

  /**
   * Get total transaction cost (amount + gas fee)
   */
  getTotalCost(): string {
    return (parseFloat(this.amount) + parseFloat(this.gasFee)).toString();
  }

  /**
   * Get transaction explorer URL
   */
  getExplorerUrl(explorerBaseUrl: string): string {
    return `${explorerBaseUrl}/tx/${this.hash}`;
  }

  /**
   * Format transaction for display
   */
  getDisplayInfo() {
    return {
      id: this.id,
      hash: `${this.hash.slice(0, 10)}...${this.hash.slice(-8)}`,
      from: `${this.from.slice(0, 6)}...${this.from.slice(-4)}`,
      to: `${this.to.slice(0, 6)}...${this.to.slice(-4)}`,
      amount: this.amount,
      fiatAmount: this.fiatAmount,
      status: this.status,
      timestamp: this.timestamp.toLocaleString(),
      type: this.type,
    };
  }

  /**
   * Convert to plain object
   */
  toObject() {
    return {
      id: this.id,
      hash: this.hash,
      from: this.from,
      to: this.to,
      amount: this.amount,
      fiatAmount: this.fiatAmount,
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      gasFee: this.gasFee,
      status: this.status,
      timestamp: this.timestamp,
      type: this.type,
      blockNumber: this.blockNumber,
      metadata: this.metadata,
    };
  }
}
