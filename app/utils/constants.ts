/**
 * Application Constants
 * Centralized constants for better maintainability
 */

// ==================== HTTP STATUS CODES ====================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ==================== USER ROLES ====================
export const USER_ROLES = {
  ADMIN: 'admin',
  PARTNER: 'partner',
  USER: 'user',
} as const

// ==================== ORDER STATUS ====================
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

// ==================== PAYMENT STATUS ====================
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

// ==================== PAYMENT METHODS ====================
export const PAYMENT_METHODS = {
  COD: 'cod',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  E_WALLET: 'e_wallet',
} as const

// ==================== NOTIFICATION TYPES ====================
export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_REFUNDED: 'order_refunded',
  PARTNER_ORDER_NEW: 'partner_order_new',
  PARTNER_APPROVED: 'partner_approved',
  PARTNER_REJECTED: 'partner_rejected',
  PRODUCT_APPROVED: 'product_approved',
  PRODUCT_REJECTED: 'product_rejected',
  REVIEW_RESPONSE: 'review_response',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const

// ==================== NOTIFICATION PRIORITIES ====================
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

// ==================== REVIEW STATUS ====================
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

// ==================== PAGINATION DEFAULTS ====================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

// ==================== SORT ORDERS ====================
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
} as const

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Vui lòng đăng nhập',
  FORBIDDEN: 'Bạn không có quyền truy cập',
  NOT_FOUND: 'Không tìm thấy',
  INTERNAL_ERROR: 'Lỗi server',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  USER_EXISTS: 'Email đã được sử dụng',
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
  OUT_OF_STOCK: 'Sản phẩm đã hết hàng',
  INSUFFICIENT_STOCK: 'Không đủ số lượng',
  INVALID_QUANTITY: 'Số lượng không hợp lệ',
  EMPTY_CART: 'Giỏ hàng trống',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
  ADMIN_NO_CART: 'Admin không có quyền sử dụng giỏ hàng',
  ADMIN_NO_WISHLIST: 'Admin không có quyền sử dụng wishlist',
} as const

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
  CREATED: 'Tạo thành công',
  UPDATED: 'Cập nhật thành công',
  DELETED: 'Xóa thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
} as const

// ==================== CACHE KEYS ====================
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCTS_LIST: (filter: string) => `products:${filter}`,
  CART: (userId: string) => `cart:${userId}`,
  CATEGORY_TREE: 'category:tree',
  BRANDS_LIST: 'brands:list',
  SETTINGS_PUBLIC: 'settings:public',
} as const

// ==================== CACHE TTL (seconds) ====================
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const

// ==================== REGEX PATTERNS ====================
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10,11}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
} as const

// ==================== FILE UPLOAD ====================
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
} as const

// Type exports for better TypeScript support
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS]
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
export type NotificationPriority =
  (typeof NOTIFICATION_PRIORITIES)[keyof typeof NOTIFICATION_PRIORITIES]
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]
