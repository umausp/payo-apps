// Secure Storage Service
// Handles secure storage operations using react-native-keychain

import * as Keychain from 'react-native-keychain';
import EncryptionService from '../security/EncryptionService';

export class SecureStorageService {
  private static instance: SecureStorageService;
  private encryptionService = EncryptionService;

  private constructor() {}

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Save data securely to keychain
   */
  async save(key: string, value: string): Promise<void> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: key,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      throw new Error(
        `Failed to save to secure storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Retrieve data from keychain
   */
  async get(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: key });

      if (credentials && typeof credentials !== 'boolean') {
        return credentials.password;
      }

      return null;
    } catch (error) {
      throw new Error(
        `Failed to retrieve from secure storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete data from keychain
   */
  async delete(key: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: key });
    } catch (error) {
      throw new Error(
        `Failed to delete from secure storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check if key exists in keychain
   */
  async exists(key: string): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: key });
      return credentials !== false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save encrypted data to keychain
   */
  async saveEncrypted(key: string, value: string, password: string): Promise<void> {
    try {
      const encrypted = this.encryptionService.encrypt(value, password);
      await this.save(key, encrypted);
    } catch (error) {
      throw new Error(
        `Failed to save encrypted data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Retrieve and decrypt data from keychain
   */
  async getDecrypted(key: string, password: string): Promise<string | null> {
    try {
      const encrypted = await this.get(key);

      if (!encrypted) {
        return null;
      }

      const decrypted = this.encryptionService.decrypt(encrypted, password);
      return decrypted;
    } catch (error) {
      throw new Error(
        `Failed to retrieve encrypted data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Clear all data from keychain
   */
  async clearAll(): Promise<void> {
    try {
      await Keychain.resetGenericPassword();
    } catch (error) {
      throw new Error(
        `Failed to clear secure storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

export default SecureStorageService.getInstance();
