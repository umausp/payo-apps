// Encryption Service
// Handles encryption and decryption of sensitive data

import CryptoJS from 'react-native-crypto-js';
import { SECURITY } from '../../constants';

export class EncryptionService {
  private static instance: EncryptionService;
  private algorithm = SECURITY.ENCRYPTION_ALGORITHM;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Encrypt data using AES-256
   */
  encrypt(data: string, password: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, password).toString();
      return encrypted;
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Decrypt data using AES-256
   */
  decrypt(encryptedData: string, password: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);

      if (!originalText) {
        throw new Error('Decryption failed: Invalid password or corrupted data');
      }

      return originalText;
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate a random encryption key
   */
  generateKey(length: number = 32): string {
    try {
      const randomBytes = CryptoJS.lib.WordArray.random(length);
      return randomBytes.toString(CryptoJS.enc.Hex);
    } catch (error) {
      throw new Error(
        `Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    try {
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      throw new Error(
        `Hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate a secure PIN hash
   */
  hashPin(pin: string): string {
    try {
      // Use multiple rounds of hashing for better security
      let hashed = pin;
      for (let i = 0; i < 1000; i++) {
        hashed = CryptoJS.SHA256(hashed).toString();
      }
      return hashed;
    } catch (error) {
      throw new Error(
        `PIN hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Verify PIN hash
   */
  verifyPin(pin: string, hashedPin: string): boolean {
    try {
      const inputHash = this.hashPin(pin);
      return inputHash === hashedPin;
    } catch (error) {
      return false;
    }
  }
}

export default EncryptionService.getInstance();
