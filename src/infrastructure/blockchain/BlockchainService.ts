// Blockchain Service
// Handles blockchain interactions with Polygon network using ethers.js

import { ethers } from 'ethers';
import { blockchainConfig } from '../../config';
import { BLOCKCHAIN, TRANSACTION } from '../../constants';

export class BlockchainService {
  private static instance: BlockchainService;
  private provider: ethers.JsonRpcProvider;

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl, {
      chainId: blockchainConfig.chainId,
      name: 'polygon',
    });
  }

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  /**
   * Get provider instance
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Create a new wallet with mnemonic
   */
  createWallet(): { wallet: ethers.HDNodeWallet; mnemonic: string[] } {
    try {
      const wallet = ethers.Wallet.createRandom();
      const mnemonic = wallet.mnemonic?.phrase.split(' ') || [];

      return {
        wallet: wallet as ethers.HDNodeWallet,
        mnemonic,
      };
    } catch (error) {
      throw new Error(
        `Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Import wallet from mnemonic
   */
  importWalletFromMnemonic(mnemonic: string[]): ethers.HDNodeWallet {
    try {
      const mnemonicPhrase = mnemonic.join(' ');
      const wallet = ethers.Wallet.fromPhrase(mnemonicPhrase);

      return wallet as ethers.HDNodeWallet;
    } catch (error) {
      throw new Error(
        `Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Import wallet from private key
   */
  importWalletFromPrivateKey(privateKey: string): ethers.Wallet {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      return wallet;
    } catch (error) {
      throw new Error(
        `Failed to import wallet from private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get wallet balance (PAYO tokens)
   */
  async getBalance(address: string): Promise<string> {
    try {
      // For ERC-20 token, we need to interact with the token contract
      const tokenContract = new ethers.Contract(
        blockchainConfig.tokenAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ],
        this.provider,
      );

      const balance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();

      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  /**
   * Get native token balance (MATIC for gas)
   */
  async getNativeBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get native balance:', error);
      return '0';
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(to: string, amount: string): Promise<{
    gasPrice: string;
    gasLimit: string;
    gasFee: string;
  }> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('50', 'gwei');

      const tokenContract = new ethers.Contract(
        blockchainConfig.tokenAddress,
        ['function transfer(address to, uint256 amount) returns (bool)'],
        this.provider,
      );

      const amountInWei = ethers.parseUnits(amount, BLOCKCHAIN.DECIMALS);
      const gasLimit = await tokenContract.transfer.estimateGas(to, amountInWei);

      const gasFee = ethers.formatEther(gasPrice * gasLimit);

      return {
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        gasLimit: gasLimit.toString(),
        gasFee,
      };
    } catch (error) {
      // Return fallback gas estimates
      return {
        gasPrice: '50',
        gasLimit: BLOCKCHAIN.GAS_LIMIT.toString(),
        gasFee: '0.001',
      };
    }
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    to: string,
    amount: string,
    privateKey: string,
  ): Promise<{
    hash: string;
    from: string;
    to: string;
    amount: string;
    gasPrice: string;
    gasLimit: string;
  }> {
    try {
      const wallet = this.importWalletFromPrivateKey(privateKey);

      const tokenContract = new ethers.Contract(
        blockchainConfig.tokenAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)',
        ],
        wallet,
      );

      const amountInWei = ethers.parseUnits(amount, BLOCKCHAIN.DECIMALS);

      const tx = await tokenContract.transfer(to, amountInWei);

      return {
        hash: tx.hash,
        from: wallet.address,
        to,
        amount,
        gasPrice: ethers.formatUnits(tx.gasPrice || '0', 'gwei'),
        gasLimit: tx.gasLimit?.toString() || '0',
      };
    } catch (error) {
      throw new Error(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(
    hash: string,
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const receipt = await this.provider.getTransactionReceipt(hash);
      return receipt;
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      return null;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    hash: string,
    confirmations: number = TRANSACTION.CONFIRMATION_BLOCKS,
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      const receipt = await this.provider.waitForTransaction(hash, confirmations);
      return receipt;
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      return null;
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Failed to get block number:', error);
      return 0;
    }
  }

  /**
   * Validate mnemonic
   */
  isValidMnemonic(mnemonic: string[]): boolean {
    try {
      const mnemonicPhrase = mnemonic.join(' ');
      return ethers.Mnemonic.isValidMnemonic(mnemonicPhrase);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
}

export default BlockchainService.getInstance();
