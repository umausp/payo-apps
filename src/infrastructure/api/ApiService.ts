// API Service - Complete Backend Integration
// Handles all backend API communications with payo-backend services

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API } from '../../constants';
import * as Types from './types';
import FileLogger from '../logging/FileLogger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface TokenStorage {
  accessToken: string | null;
  refreshToken: string | null;
}

export class ApiService {
  private static instance: ApiService;
  private authClient: AxiosInstance;
  private walletClient: AxiosInstance;
  private paymentClient: AxiosInstance;
  private merchantClient: AxiosInstance;

  private tokens: TokenStorage = {
    accessToken: null,
    refreshToken: null,
  };

  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    // Initialize clients for each microservice
    this.authClient = this.createClient(API.SERVICES.AUTH);
    this.walletClient = this.createClient(API.SERVICES.WALLET);
    this.paymentClient = this.createClient(API.SERVICES.PAYMENT);
    this.merchantClient = this.createClient(API.SERVICES.MERCHANT);

    // Setup logging for ALL clients
    this.setupLoggingInterceptor(this.authClient);
    this.setupLoggingInterceptor(this.walletClient);
    this.setupLoggingInterceptor(this.paymentClient);
    this.setupLoggingInterceptor(this.merchantClient);

    // Setup JWT auth interceptors for authenticated clients only
    this.setupAuthInterceptor(this.paymentClient);
    this.setupAuthInterceptor(this.merchantClient);
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private createClient(baseURL: string): AxiosInstance {
    return axios.create({
      baseURL,
      timeout: API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private setupLoggingInterceptor(client: AxiosInstance) {
    // Request interceptor - log all requests
    client.interceptors.request.use(
      (config) => {
        // Add request timestamp for duration calculation
        (config as any).startTime = Date.now();

        // Log to console with full URL
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('='.repeat(80));
        console.log('[API Request]', config.method?.toUpperCase(), fullUrl);
        console.log('[Request Headers]', JSON.stringify(config.headers, null, 2));
        console.log('[Authorization]', config.headers?.Authorization || 'MISSING');
        if (config.headers?.['Idempotency-Key']) {
          console.log('[Idempotency-Key]', config.headers['Idempotency-Key']);
        }
        if (config.data) {
          console.log('[Request Body]', JSON.stringify(config.data, null, 2));
        }
        console.log('='.repeat(80));

        // Log to file
        FileLogger.logRequest(
          config.method?.toUpperCase() || 'UNKNOWN',
          fullUrl,
          config.data,
          config.headers
        );

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        FileLogger.logError('UNKNOWN', 'REQUEST_SETUP_ERROR', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - log all responses
    client.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const duration = (response.config as any).startTime
          ? Date.now() - (response.config as any).startTime
          : undefined;

        const fullUrl = `${response.config.baseURL}${response.config.url}`;

        // Log to console
        console.log('='.repeat(80));
        console.log('[API Response]', response.status, fullUrl, `(${duration}ms)`);
        console.log('[Response Headers]', JSON.stringify(response.headers, null, 2));
        console.log('[Response Data]', JSON.stringify(response.data, null, 2));
        console.log('='.repeat(80));

        // Log to file
        FileLogger.logResponse(
          response.config.method?.toUpperCase() || 'UNKNOWN',
          fullUrl,
          response.status,
          response.data,
          duration
        );

        return response;
      },
      (error: AxiosError) => {
        const fullUrl = error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url || 'UNKNOWN';
        const duration = (error.config as any)?.startTime
          ? Date.now() - (error.config as any).startTime
          : undefined;

        console.log('='.repeat(80));
        console.error('[API Error]', error.response?.status, fullUrl, `(${duration}ms)`, error.message);
        console.error('[Error Request Headers]', JSON.stringify(error.config?.headers, null, 2));
        console.error('[Error Authorization]', error.config?.headers?.Authorization || 'MISSING');
        if (error.response?.data) {
          console.error('[Error Response Data]', JSON.stringify(error.response.data, null, 2));
        }
        console.log('='.repeat(80));

        // Log error to file
        FileLogger.logError(
          error.config?.method?.toUpperCase() || 'UNKNOWN',
          fullUrl,
          error
        );

        return Promise.reject(error);
      }
    );
  }

  private setupAuthInterceptor(client: AxiosInstance) {
    // Request interceptor - add JWT token only
    client.interceptors.request.use(
      async (config) => {
        console.log('[Auth Interceptor] Checking for access token...');

        // If tokens are not in memory, try to restore from AsyncStorage
        if (!this.tokens.accessToken) {
          console.warn('[Auth Interceptor] ⚠️ No access token in memory, attempting to restore from storage...');
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const persistedState = await AsyncStorage.getItem('persist:root');

            if (persistedState) {
              const parsedState = JSON.parse(persistedState);
              if (parsedState.auth) {
                const authState = JSON.parse(parsedState.auth);
                if (authState.accessToken && authState.refreshToken) {
                  console.log('[Auth Interceptor] ✓ Found tokens in storage, restoring...');
                  this.tokens.accessToken = authState.accessToken;
                  this.tokens.refreshToken = authState.refreshToken;
                } else {
                  console.error('[Auth Interceptor] ✗ No tokens found in persisted auth state');
                }
              }
            } else {
              console.error('[Auth Interceptor] ✗ No persisted state found');
            }
          } catch (error) {
            console.error('[Auth Interceptor] ✗ Failed to restore tokens from storage:', error);
          }
        }

        if (this.tokens.accessToken) {
          console.log('[Auth Interceptor] ✓ Adding Bearer token to request');
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`;
        } else {
          console.error('[Auth Interceptor] ✗ CRITICAL: No access token available after restoration attempt!');
          console.error('[Auth Interceptor] ✗ This request will fail with 401 Unauthorized');
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 and token refresh
    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for token refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await this.refreshAccessToken();
            if (response.success && response.data) {
              this.tokens.accessToken = response.data.accessToken;
              this.tokens.refreshToken = response.data.refreshToken;

              // Notify all waiting requests
              this.refreshSubscribers.forEach((callback) => callback(response.data!.accessToken));
              this.refreshSubscribers = [];

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              }
              return client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  setTokens(accessToken: string, refreshToken: string) {
    console.log('='.repeat(80));
    console.log('[ApiService] Setting JWT tokens');
    console.log('[Access Token]', accessToken.substring(0, 20) + '...' + accessToken.substring(accessToken.length - 10));
    console.log('[Refresh Token]', refreshToken.substring(0, 20) + '...' + refreshToken.substring(refreshToken.length - 10));
    console.log('='.repeat(80));
    this.tokens.accessToken = accessToken;
    this.tokens.refreshToken = refreshToken;
  }

  clearTokens() {
    console.log('='.repeat(80));
    console.log('[ApiService] Clearing JWT tokens');
    console.log('='.repeat(80));
    this.tokens.accessToken = null;
    this.tokens.refreshToken = null;
  }

  async getAccessTokenAsync(): Promise<string | null> {
    console.log('[ApiService] Getting access token...');

    // If token exists in memory, return it
    if (this.tokens.accessToken) {
      console.log('[ApiService] ✓ Token exists in memory');
      return this.tokens.accessToken;
    }

    // If not in memory, try to restore from AsyncStorage
    console.log('[ApiService] Token not in memory, checking AsyncStorage...');
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const persistedState = await AsyncStorage.getItem('persist:root');

      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        if (parsedState.auth) {
          const authState = JSON.parse(parsedState.auth);
          if (authState.accessToken && authState.refreshToken) {
            console.log('[ApiService] ✓ Found tokens in AsyncStorage, restoring...');
            this.tokens.accessToken = authState.accessToken;
            this.tokens.refreshToken = authState.refreshToken;
            return this.tokens.accessToken;
          }
        }
      }
      console.log('[ApiService] ✗ No tokens found in AsyncStorage');
      return null;
    } catch (error) {
      console.error('[ApiService] ✗ Failed to restore tokens from AsyncStorage:', error);
      return null;
    }
  }

  getAccessToken(): string | null {
    console.log('[ApiService] Getting access token (sync):', this.tokens.accessToken ? 'EXISTS' : 'NULL');
    return this.tokens.accessToken;
  }

  // ============================================================================
  // Generic Request Handler
  // ============================================================================

  private async request<T>(
    client: AxiosInstance,
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await client.request<T>(config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      const axiosError = error as AxiosError<Types.ApiErrorResponse>;
      return {
        success: false,
        error: {
          code: axiosError.response?.data?.code || 'NETWORK_ERROR',
          message: axiosError.response?.data?.error || axiosError.message,
          details: axiosError.response?.data?.details,
        },
      };
    }
  }

  // ============================================================================
  // Auth Service APIs
  // ============================================================================

  async getChallenge(walletAddress: string): Promise<ApiResponse<Types.ChallengeResponse>> {
    return this.request<Types.ChallengeResponse>(this.authClient, {
      method: 'POST',
      url: API.ENDPOINTS.AUTH_CHALLENGE,
      data: { walletAddress } as Types.ChallengeRequest,
    });
  }

  async verifySignature(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<ApiResponse<Types.VerifyResponse>> {
    const response = await this.request<Types.VerifyResponse>(this.authClient, {
      method: 'POST',
      url: API.ENDPOINTS.AUTH_VERIFY,
      data: { walletAddress, signature, message } as Types.VerifyRequest,
    });

    if (response.success && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async refreshAccessToken(): Promise<ApiResponse<Types.RefreshResponse>> {
    if (!this.tokens.refreshToken) {
      return {
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'No refresh token available',
        },
      };
    }

    return this.request<Types.RefreshResponse>(this.authClient, {
      method: 'POST',
      url: API.ENDPOINTS.AUTH_REFRESH,
      data: { refreshToken: this.tokens.refreshToken } as Types.RefreshRequest,
    });
  }

  async logout(): Promise<ApiResponse<Types.ApiSuccessResponse>> {
    const response = await this.request<Types.ApiSuccessResponse>(this.authClient, {
      method: 'POST',
      url: API.ENDPOINTS.AUTH_LOGOUT,
      data: { refreshToken: this.tokens.refreshToken } as Types.LogoutRequest,
      headers: this.tokens.accessToken ? { Authorization: `Bearer ${this.tokens.accessToken}` } : {},
    });

    if (response.success) {
      this.clearTokens();
    }

    return response;
  }

  // ============================================================================
  // Wallet Service APIs
  // ============================================================================

  async getBalance(
    address: string,
    token: 'payo' | 'native' = 'payo'
  ): Promise<ApiResponse<Types.BalanceResponse>> {
    return this.request<Types.BalanceResponse>(this.walletClient, {
      method: 'GET',
      url: `${API.ENDPOINTS.WALLET_BALANCE}/${address}`,
      params: { token },
    });
  }

  async getGasPrice(): Promise<ApiResponse<Types.GasResponse>> {
    return this.request<Types.GasResponse>(this.walletClient, {
      method: 'GET',
      url: API.ENDPOINTS.WALLET_GAS,
    });
  }

  async rpcCall(method: string, params: any[] = []): Promise<ApiResponse<Types.RpcResponse>> {
    return this.request<Types.RpcResponse>(this.walletClient, {
      method: 'POST',
      url: API.ENDPOINTS.WALLET_RPC,
      data: { method, params } as Types.RpcRequest,
    });
  }

  // ============================================================================
  // Payment Service APIs
  // ============================================================================

  async submitPayment(
    forwardRequest: Types.ForwardRequest,
    signature: string,
    idempotencyKey: string
  ): Promise<ApiResponse<Types.PaymentSubmitResponse>> {
    return this.request<Types.PaymentSubmitResponse>(this.paymentClient, {
      method: 'POST',
      url: API.ENDPOINTS.PAYMENT_SUBMIT,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      data: {
        request: forwardRequest, // Backend expects 'request' not 'forwardRequest'
        signature,
      },
    });
  }

  async getPaymentStatus(
    idempotencyKey: string
  ): Promise<ApiResponse<Types.PaymentStatusResponse>> {
    return this.request<Types.PaymentStatusResponse>(this.paymentClient, {
      method: 'GET',
      url: API.ENDPOINTS.PAYMENT_STATUS,
      params: { idempotencyKey },
    });
  }

  async getTransactions(
    query?: Types.TransactionListQuery
  ): Promise<ApiResponse<Types.TransactionListResponse>> {
    return this.request<Types.TransactionListResponse>(this.paymentClient, {
      method: 'GET',
      url: API.ENDPOINTS.PAYMENT_TRANSACTIONS,
      params: query,
    });
  }

  async getTransactionById(id: string): Promise<ApiResponse<Types.TransactionDetailsResponse>> {
    return this.request<Types.TransactionDetailsResponse>(this.paymentClient, {
      method: 'GET',
      url: `${API.ENDPOINTS.PAYMENT_TRANSACTIONS}/${id}`,
    });
  }

  // ============================================================================
  // Merchant Service APIs
  // ============================================================================

  async registerMerchant(
    data: Types.MerchantRegisterRequest
  ): Promise<ApiResponse<Types.MerchantRegisterResponse>> {
    return this.request<Types.MerchantRegisterResponse>(this.merchantClient, {
      method: 'POST',
      url: API.ENDPOINTS.MERCHANT_REGISTER,
      data,
    });
  }

  async getMerchantProfile(): Promise<ApiResponse<Types.MerchantProfileResponse>> {
    return this.request<Types.MerchantProfileResponse>(this.merchantClient, {
      method: 'GET',
      url: API.ENDPOINTS.MERCHANT_PROFILE,
    });
  }

  async updateMerchantProfile(
    data: Types.MerchantUpdateRequest
  ): Promise<ApiResponse<Types.MerchantProfileResponse>> {
    return this.request<Types.MerchantProfileResponse>(this.merchantClient, {
      method: 'PUT',
      url: API.ENDPOINTS.MERCHANT_PROFILE,
      data,
    });
  }

  async submitKYC(
    data: Types.MerchantKYCRequest
  ): Promise<ApiResponse<Types.MerchantKYCResponse>> {
    return this.request<Types.MerchantKYCResponse>(this.merchantClient, {
      method: 'POST',
      url: API.ENDPOINTS.MERCHANT_KYC,
      data,
    });
  }

  async generateStaticQR(): Promise<ApiResponse<Types.StaticQRResponse>> {
    return this.request<Types.StaticQRResponse>(this.merchantClient, {
      method: 'POST',
      url: API.ENDPOINTS.MERCHANT_QR_STATIC,
    });
  }

  async generateDynamicQR(
    data: Types.DynamicQRRequest
  ): Promise<ApiResponse<Types.DynamicQRResponse>> {
    return this.request<Types.DynamicQRResponse>(this.merchantClient, {
      method: 'POST',
      url: API.ENDPOINTS.MERCHANT_QR_DYNAMIC,
      data,
    });
  }

  async listQRCodes(): Promise<ApiResponse<Types.QRCodeListResponse>> {
    return this.request<Types.QRCodeListResponse>(this.merchantClient, {
      method: 'GET',
      url: API.ENDPOINTS.MERCHANT_QR_LIST,
    });
  }

  async getQRCode(qrCodeId: string): Promise<ApiResponse<Types.QRCodeDetailsResponse>> {
    return this.request<Types.QRCodeDetailsResponse>(this.merchantClient, {
      method: 'GET',
      url: `${API.ENDPOINTS.MERCHANT_QR_LIST}/${qrCodeId}`,
    });
  }

  async deactivateQRCode(qrCodeId: string): Promise<ApiResponse<Types.ApiSuccessResponse>> {
    return this.request<Types.ApiSuccessResponse>(this.merchantClient, {
      method: 'DELETE',
      url: `${API.ENDPOINTS.MERCHANT_QR_LIST}/${qrCodeId}`,
    });
  }

  // ============================================================================
  // Legacy/Compatibility Methods (for gradual migration)
  // ============================================================================

  async fetchTokenPrice(_symbol: string = 'PAYO'): Promise<ApiResponse<{ priceUSD: number; change24h: number }>> {
    // TODO: Implement when price oracle service is added
    console.warn('[ApiService] fetchTokenPrice not yet implemented in backend');
    return {
      success: true,
      data: { priceUSD: 1.0, change24h: 0 },
    };
  }

  async fetchTransactions(address: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{
    transactions: any[];
    total: number;
    page: number;
    limit: number;
  }>> {
    const offset = (page - 1) * limit;
    const response = await this.getTransactions({
      walletAddress: address,
      limit,
      offset,
    });

    if (!response.success) {
      return response as any;
    }

    return {
      success: true,
      data: {
        transactions: response.data?.transactions || [],
        total: response.data?.total || 0,
        page,
        limit,
      },
    };
  }

  async estimateGasFee(_from: string, _to: string, _amount: string): Promise<ApiResponse<{
    gasPrice: string;
    gasLimit: string;
    gasFee: string;
  }>> {
    const gasResponse = await this.getGasPrice();
    if (!gasResponse.success) {
      return gasResponse as any;
    }

    // Estimate gas limit (you may want to do an eth_estimateGas call)
    const gasLimit = '100000'; // Default gas limit
    const gasFee = (BigInt(gasResponse.data!.gasPriceWei) * BigInt(gasLimit)).toString();

    return {
      success: true,
      data: {
        gasPrice: gasResponse.data!.gasPriceWei,
        gasLimit,
        gasFee,
      },
    };
  }

  async getWalletInfo(address: string): Promise<ApiResponse<{
    balance: string;
    transactionCount: number;
    lastActivity: string;
  }>> {
    const [balanceResponse, transactionsResponse] = await Promise.all([
      this.getBalance(address),
      this.getTransactions({ walletAddress: address, limit: 1 }),
    ]);

    if (!balanceResponse.success) {
      return balanceResponse as any;
    }

    return {
      success: true,
      data: {
        balance: balanceResponse.data!.balanceWei,
        transactionCount: transactionsResponse.data?.total || 0,
        lastActivity: transactionsResponse.data?.transactions[0]?.createdAt || new Date().toISOString(),
      },
    };
  }

  // Push notification registration (TODO: implement when notification service is added)
  async registerPushToken(_address: string, _pushToken: string, _platform: 'ios' | 'android'): Promise<ApiResponse<{ registered: boolean }>> {
    console.warn('[ApiService] registerPushToken not yet implemented in backend');
    return {
      success: true,
      data: { registered: true },
    };
  }
}

export default ApiService.getInstance();
