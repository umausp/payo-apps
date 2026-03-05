// Price Repository Implementation
// Implements IPriceRepository interface

import { IPriceRepository } from '../../domain/repositories/IPriceRepository';
import { PriceData } from '../../types';
import ApiService from '../services/ApiService';
import AsyncStorageService from '../../infrastructure/storage/AsyncStorageService';
import { STORAGE_KEYS, PRICE_ORACLE } from '../../constants';

export class PriceRepository implements IPriceRepository {
  private apiService = ApiService;
  private asyncStorage = AsyncStorageService;

  /**
   * Get current PAYO token price in USD
   */
  async getCurrentPrice(): Promise<PriceData> {
    try {
      // Try to get from cache first
      const cached = await this.getCachedPrice();

      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      // Fetch from API
      const response = await this.apiService.get<{ price: number; change24h: number }>(
        '/price/current',
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch price');
      }

      const priceData: PriceData = {
        symbol: 'PAYO',
        priceUSD: response.data.price,
        lastUpdated: new Date(),
        change24h: response.data.change24h || 0,
      };

      // Cache the price
      await this.cachePrice(priceData);

      return priceData;
    } catch (error) {
      console.error('Failed to get current price:', error);

      // Return fallback price
      return {
        symbol: 'PAYO',
        priceUSD: PRICE_ORACLE.FALLBACK_PRICE,
        lastUpdated: new Date(),
        change24h: 0,
      };
    }
  }

  /**
   * Convert PAYO amount to fiat (USD)
   */
  async convertToFiat(payoAmount: string): Promise<string> {
    try {
      const price = await this.getCurrentPrice();
      const amount = parseFloat(payoAmount);

      if (isNaN(amount)) {
        return '0.00';
      }

      const fiatAmount = amount * price.priceUSD;
      return fiatAmount.toFixed(2);
    } catch (error) {
      console.error('Failed to convert to fiat:', error);
      return '0.00';
    }
  }

  /**
   * Convert fiat (USD) amount to PAYO
   */
  async convertFromFiat(fiatAmount: string): Promise<string> {
    try {
      const price = await this.getCurrentPrice();
      const amount = parseFloat(fiatAmount);

      if (isNaN(amount) || price.priceUSD === 0) {
        return '0';
      }

      const payoAmount = amount / price.priceUSD;
      return payoAmount.toFixed(6);
    } catch (error) {
      console.error('Failed to convert from fiat:', error);
      return '0';
    }
  }

  /**
   * Get cached price from local storage
   */
  async getCachedPrice(): Promise<PriceData | null> {
    try {
      const cached = await this.asyncStorage.get<PriceData>(
        STORAGE_KEYS.PRICE_CACHE,
      );

      if (!cached) {
        return null;
      }

      // Convert lastUpdated back to Date object
      return {
        ...cached,
        lastUpdated: new Date(cached.lastUpdated),
      };
    } catch (error) {
      console.error('Failed to get cached price:', error);
      return null;
    }
  }

  /**
   * Save price to local storage cache
   */
  async cachePrice(price: PriceData): Promise<void> {
    try {
      await this.asyncStorage.save(STORAGE_KEYS.PRICE_CACHE, price);
    } catch (error) {
      console.error('Failed to cache price:', error);
    }
  }

  /**
   * Check if cached price is still valid
   */
  private isCacheValid(priceData: PriceData): boolean {
    const now = new Date().getTime();
    const cacheTime = new Date(priceData.lastUpdated).getTime();
    const timeDiff = now - cacheTime;

    return timeDiff < PRICE_ORACLE.CACHE_DURATION;
  }
}

export default new PriceRepository();
