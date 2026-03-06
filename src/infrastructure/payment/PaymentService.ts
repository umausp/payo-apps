// Payment Service - Handles EIP-2771 meta-transaction payments
// Builds ForwardRequest, signs with EIP-712, and submits to payment service

import { ethers } from 'ethers';
import { BLOCKCHAIN } from '../../constants';
import ApiService from '../api/ApiService';
import { ForwardRequest } from '../api/types';

export interface PaymentParams {
  from: string; // Payer wallet address
  to: string; // Merchant/recipient address
  amount: string; // Amount in PAYO tokens (human readable, e.g., "10")
  privateKey: string; // Private key to sign the request
}

export interface PaymentResult {
  txHash: string;
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  transactionId?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private provider: ethers.JsonRpcProvider;
  private apiService: typeof ApiService;

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(BLOCKCHAIN.RPC_URL);
    this.apiService = ApiService;
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Send payment through PaymentProcessor contract via payment service
   */
  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    const { from, to, amount, privateKey } = params;

    console.log('[PaymentService] Starting payment submission');
    console.log('[PaymentService] From:', from);
    console.log('[PaymentService] To:', to);
    console.log('[PaymentService] Amount:', amount);

    // 1. Build ForwardRequest
    console.log('[PaymentService] Step 1: Building ForwardRequest');
    const forwardRequest = await this.buildForwardRequest(from, to, amount);
    console.log('[PaymentService] ForwardRequest built:', JSON.stringify(forwardRequest, null, 2));

    // 2. Sign ForwardRequest with EIP-712
    console.log('[PaymentService] Step 2: Signing ForwardRequest with EIP-712');
    const signature = await this.signForwardRequest(forwardRequest, privateKey);
    console.log('[PaymentService] Signature created:', signature.substring(0, 20) + '...');

    // 3. Generate idempotency key
    const idempotencyKey = this.generateIdempotencyKey();
    console.log('[PaymentService] Idempotency key:', idempotencyKey);

    // 4. Submit to payment service
    console.log('[PaymentService] Step 3: Submitting to payment service');
    console.log('[PaymentService] Checking if user is authenticated...');
    const accessToken = await this.apiService.getAccessTokenAsync();
    console.log('[PaymentService] Access token available:', accessToken ? 'YES' : 'NO');

    if (!accessToken) {
      console.error('[PaymentService] ✗ CRITICAL: No access token available!');
      console.error('[PaymentService] User must be logged in to make payments');
      throw new Error('Authentication required. Please log in again to continue.');
    }

    console.log('[PaymentService] ✓ User authenticated, proceeding with payment submission');
    console.log('[PaymentService] Token preview:', accessToken.substring(0, 20) + '...');

    const response = await this.apiService.submitPayment(
      forwardRequest,
      signature,
      idempotencyKey
    );

    if (!response.success) {
      console.error('[PaymentService] Payment submission failed:', response.error?.message);
      throw new Error(response.error?.message || 'Payment submission failed');
    }

    console.log('[PaymentService] ✓ Payment submitted successfully');
    console.log('[PaymentService] TX Hash:', response.data?.txHash);
    console.log('[PaymentService] Status:', response.data?.status);

    return {
      txHash: response.data?.txHash || '',
      status: response.data?.status || 'submitted',
      transactionId: response.data?.id,
    };
  }

  /**
   * Build ForwardRequest for EIP-2771 meta-transaction
   */
  private async buildForwardRequest(
    from: string,
    to: string,
    amount: string
  ): Promise<ForwardRequest> {
    console.log('[PaymentService] ===== Building ForwardRequest =====');
    console.log('[PaymentService] From:', from);
    console.log('[PaymentService] To (merchant):', to);
    console.log('[PaymentService] Amount:', amount);

    // Get current nonce from MinimalForwarder contract
    const nonce = await this.getNonce(from);

    // Build PaymentProcessor.processPayment() call data
    const paymentProcessorInterface = new ethers.Interface([
      'function processPayment(address merchant, uint256 amount, bytes32 invoiceId)'
    ]);

    // Convert amount to wei
    const amountWei = ethers.parseUnits(amount, BLOCKCHAIN.DECIMALS);
    console.log('[PaymentService] Amount in wei:', amountWei.toString());

    // Generate invoice ID (random bytes32)
    const invoiceId = ethers.hexlify(ethers.randomBytes(32));
    console.log('[PaymentService] Invoice ID:', invoiceId);

    // Encode function call
    const data = paymentProcessorInterface.encodeFunctionData('processPayment', [
      to, // merchant
      amountWei,
      invoiceId
    ]);
    console.log('[PaymentService] Encoded data:', data);

    // Estimate gas for the inner call
    // PaymentProcessor needs ~250k gas for:
    // - transferFrom to merchant (~50k)
    // - transferFrom fee to processor (~50k)
    // - Event emission and state updates (~50k)
    // - Safety margin for gas price variations (~100k)
    const gasEstimate = 350000; // Increased from 200k based on trace analysis
    console.log('[PaymentService] Gas estimate:', gasEstimate);

    // Deadline: 10 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 600;
    console.log('[PaymentService] Deadline (unix timestamp):', deadline);

    const forwardRequest = {
      from: from.toLowerCase(),
      to: BLOCKCHAIN.PAYMENT_PROCESSOR.toLowerCase(),
      value: '0', // Token transfer, not ETH
      gas: gasEstimate.toString(),
      nonce: nonce.toString(),
      deadline: deadline.toString(),
      data
    };

    console.log('[PaymentService] ===== ForwardRequest Complete =====');
    console.log('[PaymentService] from:', forwardRequest.from);
    console.log('[PaymentService] to:', forwardRequest.to);
    console.log('[PaymentService] value:', forwardRequest.value);
    console.log('[PaymentService] gas:', forwardRequest.gas);
    console.log('[PaymentService] nonce:', forwardRequest.nonce);
    console.log('[PaymentService] deadline:', forwardRequest.deadline);
    console.log('[PaymentService] data:', forwardRequest.data);
    console.log('[PaymentService] ======================================');

    return forwardRequest;
  }

  /**
   * Sign ForwardRequest using EIP-712 typed data signature
   */
  private async signForwardRequest(
    request: ForwardRequest,
    privateKey: string
  ): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);

    // EIP-712 Domain (MUST match contract's eip712Domain())
    const domain = {
      name: 'MinimalForwarder',
      version: '1', // Contract uses "1" not "0.0.1"
      chainId: BLOCKCHAIN.CHAIN_ID,
      verifyingContract: BLOCKCHAIN.FORWARDER_ADDRESS
    };

    // EIP-712 Types
    const types = {
      ForwardRequest: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'data', type: 'bytes' }
      ]
    };

    // Convert string values to proper types for EIP-712
    const value = {
      from: request.from,
      to: request.to,
      value: request.value,
      gas: request.gas,
      nonce: request.nonce,
      deadline: request.deadline,
      data: request.data
    };

    console.log('[PaymentService] ===== EIP-712 Signature Details =====');
    console.log('[PaymentService] Domain:', JSON.stringify(domain, null, 2));
    console.log('[PaymentService] Types:', JSON.stringify(types, null, 2));
    console.log('[PaymentService] Value:', JSON.stringify(value, null, 2));
    console.log('[PaymentService] Signer address:', wallet.address);
    console.log('[PaymentService] ========================================');

    // Sign with EIP-712
    const signature = await wallet.signTypedData(domain, types, value);

    console.log('[PaymentService] ✓ Signature created successfully');
    console.log('[PaymentService] Signature length:', signature.length);

    return signature;
  }

  /**
   * Get current nonce for address from MinimalForwarder contract
   */
  private async getNonce(address: string): Promise<number> {
    try {
      console.log('[PaymentService] Getting nonce for address:', address);
      console.log('[PaymentService] Forwarder address:', BLOCKCHAIN.FORWARDER_ADDRESS);
      console.log('[PaymentService] RPC URL:', BLOCKCHAIN.RPC_URL);

      const forwarderInterface = new ethers.Interface([
        'function getNonce(address from) view returns (uint256)'
      ]);

      const forwarderContract = new ethers.Contract(
        BLOCKCHAIN.FORWARDER_ADDRESS,
        forwarderInterface,
        this.provider
      );

      const nonce = await forwarderContract.getNonce(address);
      console.log('[PaymentService] ✓ Current nonce from blockchain:', nonce.toString());
      return Number(nonce);
    } catch (error) {
      console.error('[PaymentService] ✗ Failed to get nonce from blockchain:', error);
      console.error('[PaymentService] This may cause signature verification to fail');
      console.error('[PaymentService] Falling back to nonce=0 (only works for first transaction)');
      // Fallback to 0 for first transaction
      return 0;
    }
  }

  /**
   * Generate unique idempotency key
   */
  private generateIdempotencyKey(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `mobile-payment-${timestamp}-${random}`;
  }
}

export default PaymentService.getInstance();
