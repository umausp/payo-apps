// Async Storage Service
// Handles non-sensitive data storage operations

import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageService {
  private static instance: AsyncStorageService;

  private constructor() {}

  static getInstance(): AsyncStorageService {
    if (!AsyncStorageService.instance) {
      AsyncStorageService.instance = new AsyncStorageService();
    }
    return AsyncStorageService.instance;
  }

  /**
   * Save data to AsyncStorage
   */
  async save<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      throw new Error(
        `Failed to save to storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Retrieve data from AsyncStorage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      throw new Error(
        `Failed to retrieve from storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete data from AsyncStorage
   */
  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new Error(
        `Failed to delete from storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check if key exists in AsyncStorage
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new Error(
        `Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get multiple keys
   */
  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};

      values.forEach(([key, value]) => {
        result[key] = value != null ? JSON.parse(value) : null;
      });

      return result;
    } catch (error) {
      throw new Error(
        `Failed to retrieve multiple keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Save multiple key-value pairs
   */
  async saveMultiple(keyValuePairs: Array<[string, any]>): Promise<void> {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs as string[][]);
    } catch (error) {
      throw new Error(
        `Failed to save multiple keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

export default AsyncStorageService.getInstance();
