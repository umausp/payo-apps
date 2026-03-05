import { BlockchainConfig } from '../types';
import { BLOCKCHAIN, API } from '../constants';

// Environment Configuration
export const ENV = {
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
};

// Blockchain Configuration
export const blockchainConfig: BlockchainConfig = {
  rpcUrl: BLOCKCHAIN.RPC_URL,
  chainId: BLOCKCHAIN.CHAIN_ID,
  tokenAddress: BLOCKCHAIN.TOKEN_ADDRESS,
  oracleAddress: BLOCKCHAIN.ORACLE_ADDRESS,
  explorerUrl: BLOCKCHAIN.EXPLORER_URL,
  symbol: BLOCKCHAIN.SYMBOL,
  decimals: BLOCKCHAIN.DECIMALS,
};

// API Configuration
export const apiConfig = {
  baseURL: API.BASE_URL,
  timeout: API.TIMEOUT,
  retryAttempts: API.RETRY_ATTEMPTS,
  retryDelay: API.RETRY_DELAY,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// Export all configurations
export default {
  blockchain: blockchainConfig,
  api: apiConfig,
  env: ENV,
};
