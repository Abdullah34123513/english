/**
 * Custom logging utility to avoid Next.js error interception
 * Provides safe logging that won't trigger the Next.js error system
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel
  message: string
  details?: any
  timestamp: number
  component?: string
}

class Logger {
  private component: string;

  constructor(component?: string) {
    this.component = component;
  }

  private formatLogEntry(level: LogLevel, message: string, details?: any): LogEntry {
    return {
      level,
      message,
      details,
      timestamp: Date.now(),
      component: this.component
    };
  }

  private logToConsole(level: LogLevel, entry: LogEntry) {
    const prefix = `[${entry.level.toUpperCase()}]${entry.component ? ` [${entry.component}]` : ''}`;
    const timestamp = new Date(entry.timestamp).toISOString();
    
    switch (level) {
      case LogLevel.ERROR:
        // Use console.log instead of console.error to avoid Next.js interception
        console.log(`${prefix} ${timestamp}: ${entry.message}`);
        if (entry.details) {
          console.log(`${prefix} Details:`, this.safelyStringify(entry.details));
        }
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${timestamp}: ${entry.message}`);
        if (entry.details) {
          console.warn(`${prefix} Details:`, this.safelyStringify(entry.details));
        }
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${timestamp}: ${entry.message}`);
        if (entry.details) {
          console.info(`${prefix} Details:`, this.safelyStringify(entry.details));
        }
        break;
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${timestamp}: ${entry.message}`);
        if (entry.details) {
          console.debug(`${prefix} Details:`, this.safelyStringify(entry.details));
        }
        break;
    }
  }

  private safelyStringify(obj: any): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return `[Object could not be stringified: ${error}]`;
    }
  }

  error(message: string, details?: any) {
    const entry = this.formatLogEntry(LogLevel.ERROR, message, details);
    this.logToConsole(LogLevel.ERROR, entry);
  }

  warn(message: string, details?: any) {
    const entry = this.formatLogEntry(LogLevel.WARN, message, details);
    this.logToConsole(LogLevel.WARN, entry);
  }

  info(message: string, details?: any) {
    const entry = this.formatLogEntry(LogLevel.INFO, message, details);
    this.logToConsole(LogLevel.INFO, entry);
  }

  debug(message: string, details?: any) {
    const entry = this.formatLogEntry(LogLevel.DEBUG, message, details);
    this.logToConsole(LogLevel.DEBUG, entry);
  }

  // Specialized error logging for payment flow
  logPaymentError(message: string, error: any, additionalDetails?: any) {
    this.error(message, {
      errorMessage: error?.message || 'Unknown error',
      errorType: error?.type || error?.name || 'Unknown',
      errorDetails: error?.details || undefined,
      timestamp: error?.timestamp || Date.now(),
      ...additionalDetails
    });
  }

  // Specialized validation error logging
  logValidationError(message: string, validationDetails: any) {
    this.error(message, {
      type: 'ValidationError',
      validationDetails,
      timestamp: Date.now()
    });
  }

  // Specialized booking error logging
  logBookingError(message: string, bookingDetails: any) {
    this.error(message, {
      type: 'BookingError',
      bookingDetails,
      timestamp: Date.now()
    });
  }
}

// Create default logger instance
export const logger = new Logger();

// Component-specific logger factory
export function createLogger(component: string): Logger {
  return new Logger(component);
}

// Export the Logger class for advanced usage
export { Logger };