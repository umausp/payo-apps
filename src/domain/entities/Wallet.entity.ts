// Domain Entity: Wallet
// Represents the core wallet business logic

export class WalletEntity {
  constructor(
    public readonly address: string,
    public readonly publicKey: string,
    public balance: string = '0', // PAYO token balance
    public fiatBalance: string = '0',
    public readonly isNonCustodial: boolean = true,
    public readonly createdAt: Date = new Date(),
    public nativeBalance: string = '0', // ETH balance for gas
  ) {}

  /**
   * Update wallet balance
   */
  updateBalance(newBalance: string, fiatBalance: string, nativeBalance?: string): void {
    this.balance = newBalance;
    this.fiatBalance = fiatBalance;
    if (nativeBalance !== undefined) {
      this.nativeBalance = nativeBalance;
    }
  }

  /**
   * Check if wallet has sufficient balance for transaction
   * @param amount - Amount in PAYO tokens
   * @param gasFee - Gas fee in ETH
   */
  hasSufficientBalance(amount: string, gasFee: string): boolean {
    // Check PAYO token balance
    const hasEnoughTokens = parseFloat(this.balance) >= parseFloat(amount);

    // Check ETH balance for gas
    const hasEnoughGas = parseFloat(this.nativeBalance) >= parseFloat(gasFee);

    return hasEnoughTokens && hasEnoughGas;
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
   * Convert to plain object (Redux serializable)
   */
  toObject() {
    return {
      address: this.address,
      publicKey: this.publicKey,
      balance: this.balance,
      fiatBalance: this.fiatBalance,
      nativeBalance: this.nativeBalance,
      isNonCustodial: this.isNonCustodial,
      createdAt: this.createdAt.toISOString(), // Convert Date to string for Redux
    };
  }
}
