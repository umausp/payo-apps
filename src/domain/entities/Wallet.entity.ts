// Domain Entity: Wallet
// Represents the core wallet business logic

export class WalletEntity {
  constructor(
    public readonly address: string,
    public readonly publicKey: string,
    public balance: string = '0',
    public fiatBalance: string = '0',
    public readonly isNonCustodial: boolean = true,
    public readonly createdAt: Date = new Date(),
  ) {}

  /**
   * Update wallet balance
   */
  updateBalance(newBalance: string, fiatBalance: string): void {
    this.balance = newBalance;
    this.fiatBalance = fiatBalance;
  }

  /**
   * Check if wallet has sufficient balance for transaction
   */
  hasSufficientBalance(amount: string, gasFee: string): boolean {
    const totalRequired = parseFloat(amount) + parseFloat(gasFee);
    return parseFloat(this.balance) >= totalRequired;
  }

  /**
   * Validate wallet address format
   */
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format address for display (0x1234...5678)
   */
  getShortAddress(): string {
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }

  /**
   * Convert to plain object
   */
  toObject() {
    return {
      address: this.address,
      publicKey: this.publicKey,
      balance: this.balance,
      fiatBalance: this.fiatBalance,
      isNonCustodial: this.isNonCustodial,
      createdAt: this.createdAt,
    };
  }
}
