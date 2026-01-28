/**
 * Centralized Logger Utility
 * Provides consistent logging across the application
 */

import app from '@adonisjs/core/services/app'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = !app.inProduction
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    }
    console.error(this.formatMessage('error', message, errorContext))
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  /**
   * Log HTTP request
   */
  request(method: string, path: string, userId?: string): void {
    if (this.isDevelopment) {
      this.info(`${method} ${path}`, { userId })
    }
  }

  /**
   * Log HTTP response
   */
  response(method: string, path: string, statusCode: number, duration?: number): void {
    if (this.isDevelopment) {
      this.info(`${method} ${path} - ${statusCode}`, { duration: `${duration}ms` })
    }
  }

  /**
   * Log database query
   */
  query(operation: string, collection: string, duration?: number, context?: LogContext): void {
    if (this.isDevelopment) {
      this.debug(`DB ${operation} on ${collection}`, { ...context, duration: `${duration}ms` })
    }
  }

  /**
   * Log performance metric
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      const level = duration > 1000 ? 'warn' : 'info'
      const message = `Performance: ${operation} took ${duration}ms`
      if (level === 'warn') {
        this.warn(message, context)
      } else {
        this.info(message, context)
      }
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export class for testing
export { Logger }
