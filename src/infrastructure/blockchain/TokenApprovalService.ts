// Token Approval Service
// Manages ERC-20 token approvals for PaymentProcessor

import { ethers } from 'ethers';
import { BLOCKCHAIN } from '../../constants';

export interface ApprovalStatus {
  hasApproval: boolean;
  currentAllowance: string;
  requiredAmount: string;
}

export class TokenApprovalService {
  private static instance: TokenApprovalService;
  private provider: ethers.JsonRpcProvider;

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(BLOCKCHAIN.RPC_URL);
  }

  static getInstance(): TokenApprovalService {
    if (!TokenApprovalService.instance) {
      TokenApprovalService.instance = new TokenApprovalService();
    }
    return TokenApprovalService.instance;
  }

  /**
   * Check if PaymentProcessor has sufficient allowance
   */
  async checkApproval(
    walletAddress: string,
    amount: string
  ): Promise<ApprovalStatus> {
    try {
      console.log('[TokenApproval] Checking approval status');
      console.log('[TokenApproval] Wallet:', walletAddress);
      console.log('[TokenApproval] Amount:', amount);

      const tokenInterface = new ethers.Interface([
        'function allowance(address owner, address spender) view returns (uint256)'
      ]);

      const tokenContract = new ethers.Contract(
        BLOCKCHAIN.TOKEN_ADDRESS,
        tokenInterface,
        this.provider
      );

      // Get current allowance
      const allowance = await tokenContract.allowance(
        walletAddress,
        BLOCKCHAIN.PAYMENT_PROCESSOR
      );

      const allowanceString = ethers.formatUnits(allowance, BLOCKCHAIN.DECIMALS);
      const amountNum = parseFloat(amount);
      const allowanceNum = parseFloat(allowanceString);

      console.log('[TokenApproval] Current allowance:', allowanceString, 'PAYO');
      console.log('[TokenApproval] Required amount:', amount, 'PAYO');

      const hasApproval = allowanceNum >= amountNum;
      console.log('[TokenApproval] Has sufficient approval:', hasApproval);

      return {
        hasApproval,
        currentAllowance: allowanceString,
        requiredAmount: amount,
      };
    } catch (error) {
      console.error('[TokenApproval] Failed to check approval:', error);
      throw new Error('Failed to check token approval');
    }
  }

  /**
   * Approve PaymentProcessor to spend PAYO tokens
   */
  async approvePaymentProcessor(
    privateKey: string,
    amount?: string
  ): Promise<string> {
    try {
      console.log('[TokenApproval] Starting approval transaction');

      const wallet = new ethers.Wallet(privateKey, this.provider);
      console.log('[TokenApproval] Wallet address:', wallet.address);

      const tokenInterface = new ethers.Interface([
        'function approve(address spender, uint256 amount) returns (bool)'
      ]);

      const tokenContract = new ethers.Contract(
        BLOCKCHAIN.TOKEN_ADDRESS,
        tokenInterface,
        wallet
      );

      // Approve max uint256 for convenience (standard practice)
      // Or approve specific amount if provided
      const approvalAmount = amount
        ? ethers.parseUnits(amount, BLOCKCHAIN.DECIMALS)
        : ethers.MaxUint256;

      console.log('[TokenApproval] Approving amount:', amount || 'MAX');
      console.log('[TokenApproval] Spender:', BLOCKCHAIN.PAYMENT_PROCESSOR);

      const tx = await tokenContract.approve(
        BLOCKCHAIN.PAYMENT_PROCESSOR,
        approvalAmount
      );

      console.log('[TokenApproval] Approval tx submitted:', tx.hash);
      console.log('[TokenApproval] Waiting for confirmation...');

      const receipt = await tx.wait();

      if (receipt?.status === 0) {
        throw new Error('Approval transaction failed');
      }

      console.log('[TokenApproval] ✓ Approval confirmed in block:', receipt?.blockNumber);

      return tx.hash;
    } catch (error) {
      console.error('[TokenApproval] Approval failed:', error);
      throw new Error(
        `Failed to approve token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check balance and approval status
   */
  async checkBalanceAndApproval(
    walletAddress: string,
    amount: string
  ): Promise<{
    hasBalance: boolean;
    balance: string;
    hasApproval: boolean;
    allowance: string;
  }> {
    try {
      const tokenInterface = new ethers.Interface([
        'function balanceOf(address) view returns (uint256)',
        'function allowance(address owner, address spender) view returns (uint256)'
      ]);

      const tokenContract = new ethers.Contract(
        BLOCKCHAIN.TOKEN_ADDRESS,
        tokenInterface,
        this.provider
      );

      const [balance, allowance] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.allowance(walletAddress, BLOCKCHAIN.PAYMENT_PROCESSOR),
      ]);

      const balanceString = ethers.formatUnits(balance, BLOCKCHAIN.DECIMALS);
      const allowanceString = ethers.formatUnits(allowance, BLOCKCHAIN.DECIMALS);
      const amountNum = parseFloat(amount);

      return {
        hasBalance: parseFloat(balanceString) >= amountNum,
        balance: balanceString,
        hasApproval: parseFloat(allowanceString) >= amountNum,
        allowance: allowanceString,
      };
    } catch (error) {
      console.error('[TokenApproval] Failed to check balance and approval:', error);
      throw error;
    }
  }
}

export default TokenApprovalService.getInstance();
