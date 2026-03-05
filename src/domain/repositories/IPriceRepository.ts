// Repository Interface: Price Repository
// Defines the contract for price data operations

import { PriceData } from '../../types';

export interface IPriceRepository {
  /**
   * Get current PAYO token price in USD
   */
  getCurrentPrice(): Promise<PriceData>;

  /**
   * Convert PAYO amount to fiat (USD)
   */
  convertToFiat(payoAmount: string): Promise<string>;

  /**
   * Convert fiat (USD) amount to PAYO
   */
  convertFromFiat(fiatAmount: string): Promise<string>;

  /**
   * Get cached price from local storage
   */
  getCachedPrice(): Promise<PriceData | null>;

  /**
   * Save price to local storage cache
   */
  cachePrice(price: PriceData): Promise<void>;
}
