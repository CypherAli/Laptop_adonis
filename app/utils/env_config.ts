/**
 * Environment Configuration Helper
 * Centralized environment variables management
 */

import env from '#start/env'

export class EnvConfig {
  // ==================== APPLICATION ====================
  static get app() {
    return {
      port: env.get('PORT', 3333),
      host: env.get('HOST', '0.0.0.0'),
      nodeEnv: env.get('NODE_ENV', 'development'),
      appKey: env.get('APP_KEY'),
      logLevel: env.get('LOG_LEVEL', 'info'),
      timezone: env.get('TZ', 'UTC'),
      debug: env.get('DEBUG', 'false') === 'true',
      prettyPrintLogs: env.get('PRETTY_PRINT_LOGS', 'true') === 'true',
    }
  }

  // ==================== DATABASE ====================
  static get database() {
    return {
      mongoUri: env.get('MONGO_URI', 'mongodb://localhost:27017/laptop-shop'),
      connectionTimeout: Number.parseInt(env.get('DB_CONNECTION_TIMEOUT', '10000')),
      poolSize: Number.parseInt(env.get('DB_POOL_SIZE', '10')),
    }
  }

  // ==================== JWT ====================
  static get jwt() {
    return {
      secret: env.get('JWT_SECRET'),
      expiresIn: env.get('JWT_EXPIRES_IN', '7d'),
    }
  }

  // ==================== SESSION ====================
  static get session() {
    return {
      driver: env.get('SESSION_DRIVER', 'cookie'),
    }
  }

  // ==================== CORS ====================
  static get cors() {
    return {
      enabled: env.get('CORS_ENABLED', 'true') === 'true',
      origin: env.get('CORS_ORIGIN', 'http://localhost:3000'),
      methods: env.get('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE').split(','),
      credentials: env.get('CORS_CREDENTIALS', 'true') === 'true',
    }
  }

  // ==================== FILE UPLOAD ====================
  static get fileUpload() {
    return {
      maxSize: Number.parseInt(env.get('MAX_FILE_SIZE', '5242880')), // 5MB default
      allowedTypes: env
        .get('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/webp,image/gif')
        .split(','),
    }
  }

  // ==================== PAGINATION ====================
  static get pagination() {
    return {
      defaultPageSize: Number.parseInt(env.get('DEFAULT_PAGE_SIZE', '10')),
      maxPageSize: Number.parseInt(env.get('MAX_PAGE_SIZE', '100')),
    }
  }

  // ==================== CACHE ====================
  static get cache() {
    return {
      driver: env.get('CACHE_DRIVER', 'memory'),
      ttl: Number.parseInt(env.get('CACHE_TTL', '300')),
    }
  }

  // ==================== MAIL ====================
  static get mail() {
    return {
      host: env.get('SMTP_HOST', 'smtp.gmail.com'),
      port: Number.parseInt(env.get('SMTP_PORT', '587')),
      username: env.get('SMTP_USERNAME'),
      password: env.get('SMTP_PASSWORD'),
      fromAddress: env.get('MAIL_FROM_ADDRESS', 'noreply@laptopshop.com'),
      fromName: env.get('MAIL_FROM_NAME', 'Laptop Shop'),
    }
  }

  // ==================== PAYMENT ====================
  static get payment() {
    return {
      stripe: {
        publicKey: env.get('STRIPE_PUBLIC_KEY'),
        secretKey: env.get('STRIPE_SECRET_KEY'),
      },
      paypal: {
        clientId: env.get('PAYPAL_CLIENT_ID'),
        secret: env.get('PAYPAL_SECRET'),
      },
    }
  }

  // ==================== FRONTEND ====================
  static get frontend() {
    return {
      clientUrl: env.get('CLIENT_URL', 'http://localhost:3000'),
    }
  }

  // ==================== WEBSOCKET ====================
  static get socket() {
    return {
      port: Number.parseInt(env.get('SOCKET_PORT', '3334')),
      corsOrigin: env.get('SOCKET_CORS_ORIGIN', 'http://localhost:3000'),
    }
  }

  // ==================== RATE LIMITING ====================
  static get rateLimit() {
    return {
      enabled: env.get('RATE_LIMIT_ENABLED', 'true') === 'true',
      maxRequests: Number.parseInt(env.get('RATE_LIMIT_MAX_REQUESTS', '100')),
      windowMs: Number.parseInt(env.get('RATE_LIMIT_WINDOW_MS', '900000')),
    }
  }

  // ==================== SECURITY ====================
  static get security() {
    return {
      bcryptRounds: Number.parseInt(env.get('BCRYPT_ROUNDS', '10')),
      passwordMinLength: Number.parseInt(env.get('PASSWORD_MIN_LENGTH', '8')),
    }
  }

  // ==================== FEATURES ====================
  static get features() {
    return {
      reviews: env.get('FEATURE_REVIEWS_ENABLED', 'true') === 'true',
      chat: env.get('FEATURE_CHAT_ENABLED', 'true') === 'true',
      notifications: env.get('FEATURE_NOTIFICATIONS_ENABLED', 'true') === 'true',
      wishlist: env.get('FEATURE_WISHLIST_ENABLED', 'true') === 'true',
      comparison: env.get('FEATURE_COMPARISON_ENABLED', 'true') === 'true',
    }
  }

  // ==================== ANALYTICS ====================
  static get analytics() {
    return {
      sentryDsn: env.get('SENTRY_DSN'),
      enabled: env.get('ANALYTICS_ENABLED', 'false') === 'true',
    }
  }

  // ==================== EXTERNAL SERVICES ====================
  static get aws() {
    return {
      accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
      region: env.get('AWS_REGION', 'us-east-1'),
      bucket: env.get('AWS_BUCKET'),
    }
  }

  static get cdn() {
    return {
      url: env.get('CDN_URL'),
    }
  }

  // ==================== ADMIN ====================
  static get admin() {
    return {
      email: env.get('ADMIN_EMAIL', 'admin@laptopshop.com'),
      password: env.get('ADMIN_PASSWORD', 'change-this-password'),
    }
  }

  // ==================== HELPERS ====================

  /**
   * Check if running in production
   */
  static get isProduction(): boolean {
    return this.app.nodeEnv === 'production'
  }

  /**
   * Check if running in development
   */
  static get isDevelopment(): boolean {
    return this.app.nodeEnv === 'development'
  }

  /**
   * Check if running in test
   */
  static get isTest(): boolean {
    return this.app.nodeEnv === 'test'
  }

  /**
   * Get all configuration
   */
  static getAll() {
    return {
      app: this.app,
      database: this.database,
      jwt: this.jwt,
      session: this.session,
      cors: this.cors,
      fileUpload: this.fileUpload,
      pagination: this.pagination,
      cache: this.cache,
      mail: this.mail,
      payment: this.payment,
      frontend: this.frontend,
      socket: this.socket,
      rateLimit: this.rateLimit,
      security: this.security,
      features: this.features,
      analytics: this.analytics,
      aws: this.aws,
      cdn: this.cdn,
      admin: this.admin,
    }
  }
}
