// Use Case: Approve Token Spending
// Handles the business logic for approving PAYO token spending by PaymentProcessor

import { IWalletRepository } from '../repositories/IWalletRepository';
import TokenApprovalService from '../../infrastructure/blockchain/TokenApprovalService';

export class ApproveTokenUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(): Promise<{ txHash: string; success: boolean }> {
    try {
      console.log('[ApproveTokenUseCase] Starting token approval');

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

      console.log('[ApproveTokenUseCase] Wallet address:', wallet.address);

      // Submit approval transaction (approve max for convenience)
      const txHash = await TokenApprovalService.approvePaymentProcessor(privateKey);

      console.log('[ApproveTokenUseCase] ✓ Token approval successful');
      console.log('[ApproveTokenUseCase] TX Hash:', txHash);

      return {
        txHash,
        success: true,
      };
    } catch (error) {
      console.error('[ApproveTokenUseCase] Token approval failed:', error);
      throw new Error(
        `Failed to approve token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
