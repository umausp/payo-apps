// File Logger
// Logs API requests, responses, and errors to a file

import RNFS from 'react-native-fs';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'DEBUG' | 'WARN';
  category: string;
  message: string;
  data?: any;
}

class FileLogger {
  private static instance: FileLogger;
  private logFilePath: string;
  private maxLogSize = 5 * 1024 * 1024; // 5MB
  private isEnabled = true;

  private constructor() {
    // Log file path in app's document directory
    this.logFilePath = `${RNFS.DocumentDirectoryPath}/payo-api.log`;
    this.initializeLogFile();
  }

  static getInstance(): FileLogger {
    if (!FileLogger.instance) {
      FileLogger.instance = new FileLogger();
    }
    return FileLogger.instance;
  }

  /**
   * Initialize log file
   */
  private async initializeLogFile(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.logFilePath);
      if (!exists) {
        await RNFS.writeFile(
          this.logFilePath,
          `# PAYO API Logs\n# Started: ${new Date().toISOString()}\n\n`,
          'utf8'
        );
        console.log('[FileLogger] Log file created at:', this.logFilePath);
      } else {
        // Check file size
        const stats = await RNFS.stat(this.logFilePath);
        if (parseInt(stats.size) > this.maxLogSize) {
          await this.rotateLogFile();
        }
      }
    } catch (error) {
      console.error('[FileLogger] Failed to initialize log file:', error);
    }
  }

  /**
   * Rotate log file when it gets too large
   */
  private async rotateLogFile(): Promise<void> {
    try {
      const oldLogPath = `${RNFS.DocumentDirectoryPath}/payo-api.old.log`;

      // Delete old backup if exists
      const oldExists = await RNFS.exists(oldLogPath);
      if (oldExists) {
        await RNFS.unlink(oldLogPath);
      }

      // Rename current log to old
      await RNFS.moveFile(this.logFilePath, oldLogPath);

      // Create new log file
      await RNFS.writeFile(
        this.logFilePath,
        `# PAYO API Logs (Rotated)\n# Started: ${new Date().toISOString()}\n\n`,
        'utf8'
      );

      console.log('[FileLogger] Log file rotated');
    } catch (error) {
      console.error('[FileLogger] Failed to rotate log file:', error);
    }
  }

  /**
   * Write log entry to file
   */
  private async writeLog(entry: LogEntry): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const logLine = this.formatLogEntry(entry);
      await RNFS.appendFile(this.logFilePath, logLine + '\n', 'utf8');
    } catch (error) {
      console.error('[FileLogger] Failed to write log:', error);
    }
  }

  /**
   * Format log entry
   */
  private formatLogEntry(entry: LogEntry): string {
    let formatted = `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.message}`;

    if (entry.data) {
      try {
        formatted += `\n${JSON.stringify(entry.data, null, 2)}`;
      } catch (error) {
        formatted += `\n[Unable to stringify data]`;
      }
    }

    return formatted;
  }

  /**
   * Log API request
   */
  logRequest(method: string, url: string, data?: any, headers?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'API_REQUEST',
      message: `${method} ${url}`,
      data: {
        method,
        url,
        headers: this.sanitizeHeaders(headers),
        data: this.sanitizeData(data),
      },
    };

    this.writeLog(entry);
  }

  /**
   * Log API response
   */
  logResponse(method: string, url: string, status: number, data?: any, duration?: number): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'API_RESPONSE',
      message: `${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`,
      data: {
        method,
        url,
        status,
        duration,
        data: this.sanitizeData(data),
      },
    };

    this.writeLog(entry);
  }

  /**
   * Log API error
   */
  logError(method: string, url: string, error: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      category: 'API_ERROR',
      message: `${method} ${url} - ${error.message || 'Unknown error'}`,
      data: {
        method,
        url,
        error: {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: this.sanitizeData(error.response?.data),
        },
      },
    };

    this.writeLog(entry);
  }

  /**
   * Log general info
   */
  info(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category,
      message,
      data: this.sanitizeData(data),
    };

    this.writeLog(entry);
  }

  /**
   * Log debug information
   */
  debug(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      category,
      message,
      data: this.sanitizeData(data),
    };

    this.writeLog(entry);
  }

  /**
   * Log warning
   */
  warn(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      category,
      message,
      data: this.sanitizeData(data),
    };

    this.writeLog(entry);
  }

  /**
   * Log error
   */
  error(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      category,
      message,
      data: this.sanitizeData(data),
    };

    this.writeLog(entry);
  }

  /**
   * Sanitize headers (remove sensitive data)
   */
  private sanitizeHeaders(headers?: any): any {
    if (!headers) return undefined;

    const sanitized = { ...headers };

    // Mask sensitive headers
    if (sanitized.Authorization) {
      const token = sanitized.Authorization;
      if (token.startsWith('Bearer ')) {
        const tokenValue = token.substring(7);
        sanitized.Authorization = `Bearer ${tokenValue.substring(0, 10)}...${tokenValue.substring(tokenValue.length - 10)}`;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize data (remove sensitive fields)
   */
  private sanitizeData(data?: any): any {
    if (!data) return undefined;
    if (typeof data !== 'object') return data;

    const sensitiveFields = [
      'password',
      'privateKey',
      'mnemonic',
      'seedPhrase',
      'secret',
      'token',
      'apiKey',
      'refreshToken',
    ];

    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      if (typeof obj === 'object' && obj !== null) {
        const sanitized: any = {};
        for (const key in obj) {
          if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = sanitize(obj[key]);
          }
        }
        return sanitized;
      }

      return obj;
    };

    return sanitize(data);
  }

  /**
   * Get log file path
   */
  getLogFilePath(): string {
    return this.logFilePath;
  }

  /**
   * Read log file content
   */
  async readLogs(): Promise<string> {
    try {
      const exists = await RNFS.exists(this.logFilePath);
      if (!exists) {
        return 'No logs available';
      }

      return await RNFS.readFile(this.logFilePath, 'utf8');
    } catch (error) {
      console.error('[FileLogger] Failed to read logs:', error);
      return `Error reading logs: ${error}`;
    }
  }

  /**
   * Clear log file
   */
  async clearLogs(): Promise<void> {
    try {
      await RNFS.writeFile(
        this.logFilePath,
        `# PAYO API Logs (Cleared)\n# Started: ${new Date().toISOString()}\n\n`,
        'utf8'
      );
      console.log('[FileLogger] Logs cleared');
    } catch (error) {
      console.error('[FileLogger] Failed to clear logs:', error);
    }
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get log file size
   */
  async getLogFileSize(): Promise<string> {
    try {
      const exists = await RNFS.exists(this.logFilePath);
      if (!exists) {
        return '0 KB';
      }

      const stats = await RNFS.stat(this.logFilePath);
      const sizeKB = parseInt(stats.size) / 1024;

      if (sizeKB < 1024) {
        return `${sizeKB.toFixed(2)} KB`;
      }

      const sizeMB = sizeKB / 1024;
      return `${sizeMB.toFixed(2)} MB`;
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Share log file (returns file path for sharing)
   */
  async shareLogFile(): Promise<string> {
    return this.logFilePath;
  }
}

export default FileLogger.getInstance();
