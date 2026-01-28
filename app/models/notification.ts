import mongoose, { type Document, type Model } from 'mongoose'

// Interface for notification document
interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId
  type: string
  title: string
  message: string
  status: 'unread' | 'read' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  relatedOrder?: mongoose.Types.ObjectId
  relatedProduct?: mongoose.Types.ObjectId
  actionUrl?: string
  metadata?: any
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  markAsRead(): Promise<NotificationDocument>
  archive(): Promise<NotificationDocument>
}

// Interface for notification model static methods
export interface NotificationModel extends Model<NotificationDocument> {
  createNotification(data: any): Promise<NotificationDocument>
  getUnreadCount(userId: string): Promise<number>
  markAllAsRead(userId: string): Promise<any>
  deleteAllRead(userId: string): Promise<any>
  cleanupExpired(): Promise<any>
}

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_confirmed',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'order_refunded',
        'price_drop',
        'back_in_stock',
        'warranty_expiring',
        'warranty_expired',
        'voucher_received',
        'voucher_expiring',
        'system_announcement',
        'new_promotion',
        'review_response',
        'partner_order_new',
        'partner_product_low_stock',
        'admin_new_user',
        'admin_new_partner',
        'admin_order_issue',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, type: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index

// Static methods
notificationSchema.statics.createNotification = async function (
  data: any
): Promise<NotificationDocument> {
  const notification = new this(data)
  await notification.save()
  return notification
}

notificationSchema.statics.getUnreadCount = async function (userId: string): Promise<number> {
  return await this.countDocuments({ userId, status: 'unread' })
}

notificationSchema.statics.markAllAsRead = async function (userId: string) {
  return await this.updateMany({ userId, status: 'unread' }, { $set: { status: 'read' } })
}

notificationSchema.statics.deleteAllRead = async function (userId: string) {
  return await this.deleteMany({ userId, status: 'read' })
}

notificationSchema.statics.cleanupExpired = async function () {
  const now = new Date()
  return await this.deleteMany({
    expiresAt: { $lt: now },
  })
}

// Instance methods
notificationSchema.methods.markAsRead = async function (
  this: NotificationDocument
): Promise<NotificationDocument> {
  this.status = 'read'
  await this.save()
  return this
}

notificationSchema.methods.archive = async function (
  this: NotificationDocument
): Promise<NotificationDocument> {
  this.status = 'archived'
  await this.save()
  return this
}

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument, NotificationModel>('Notification', notificationSchema)
