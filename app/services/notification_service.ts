import { Notification } from '#models/notification'
import type { ObjectId } from 'mongoose'

interface NotificationDataInput {
  userId: string | ObjectId
  type: string
  title: string
  message: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  relatedOrder?: string | ObjectId
  relatedProduct?: string | ObjectId
  actionUrl?: string
  metadata?: any
  expiresAt?: Date
}

/**
 * Notification Service
 * Centralized service for creating and managing notifications
 */
export class NotificationService {
  /**
   * Create a new notification
   */
  static async create(data: NotificationDataInput) {
    try {
      const notification = await Notification.createNotification(data)
      // TODO: Emit real-time notification via WebSocket/Socket.io if connected
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  /**
   * Send order notification to customer
   */
  static async sendOrderNotification(
    userId: string | ObjectId,
    orderId: string | ObjectId,
    status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
    orderNumber: string
  ) {
    const notifications = {
      confirmed: {
        type: 'order_confirmed',
        title: '✅ Order Confirmed',
        message: `Your order #${orderNumber} has been confirmed and is being processed`,
        priority: 'normal' as const,
      },
      shipped: {
        type: 'order_shipped',
        title: '📦 Order Shipped',
        message: `Your order #${orderNumber} has been shipped and is on its way`,
        priority: 'high' as const,
      },
      delivered: {
        type: 'order_delivered',
        title: '🎉 Order Delivered',
        message: `Your order #${orderNumber} has been delivered successfully`,
        priority: 'normal' as const,
      },
      cancelled: {
        type: 'order_cancelled',
        title: '❌ Order Cancelled',
        message: `Your order #${orderNumber} has been cancelled`,
        priority: 'high' as const,
      },
      refunded: {
        type: 'order_refunded',
        title: '💰 Order Refunded',
        message: `Your order #${orderNumber} has been refunded`,
        priority: 'normal' as const,
      },
    }

    const notifData = notifications[status]

    return await this.create({
      userId,
      ...notifData,
      relatedOrder: orderId,
      actionUrl: `/orders/${orderId}`,
    })
  }

  /**
   * Send new order notification to partner
   */
  static async sendPartnerOrderNotification(
    partnerId: string | ObjectId,
    orderId: string | ObjectId,
    orderNumber: string,
    totalAmount: number
  ) {
    return await this.create({
      userId: partnerId,
      type: 'partner_order_new',
      title: '📦 New Order Received',
      message: `You have a new order #${orderNumber} for $${totalAmount.toFixed(2)}`,
      priority: 'high',
      relatedOrder: orderId,
      actionUrl: `/partner/orders/${orderId}`,
    })
  }

  /**
   * Send low stock alert to partner
   */
  static async sendLowStockAlert(
    partnerId: string | ObjectId,
    productId: string | ObjectId,
    productName: string,
    currentStock: number
  ) {
    return await this.create({
      userId: partnerId,
      type: 'partner_product_low_stock',
      title: '⚠️ Low Stock Alert',
      message: `${productName} is running low on stock (${currentStock} left)`,
      priority: 'high',
      relatedProduct: productId,
      actionUrl: `/partner/products/${productId}`,
    })
  }

  /**
   * Send admin notification
   */
  static async sendAdminNotification(
    adminId: string | ObjectId,
    type: 'admin_new_user' | 'admin_new_partner' | 'admin_order_issue',
    title: string,
    message: string,
    actionUrl?: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ) {
    return await this.create({
      userId: adminId,
      type,
      title,
      message,
      priority,
      actionUrl,
    })
  }

  /**
   * Send price drop notification
   */
  static async sendPriceDropNotification(
    userId: string | ObjectId,
    productId: string | ObjectId,
    productName: string,
    oldPrice: number,
    newPrice: number
  ) {
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100)

    return await this.create({
      userId,
      type: 'price_drop',
      title: '💰 Price Drop Alert!',
      message: `${productName} is now ${discount}% off! Was $${oldPrice}, now $${newPrice}`,
      priority: 'normal',
      relatedProduct: productId,
      actionUrl: `/product/${productId}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })
  }

  /**
   * Send back in stock notification
   */
  static async sendBackInStockNotification(
    userId: string | ObjectId,
    productId: string | ObjectId,
    productName: string
  ) {
    return await this.create({
      userId,
      type: 'back_in_stock',
      title: '🎉 Back in Stock!',
      message: `${productName} is back in stock. Order now before it runs out!`,
      priority: 'normal',
      relatedProduct: productId,
      actionUrl: `/product/${productId}`,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    })
  }

  /**
   * Send promotion notification
   */
  static async sendPromotionNotification(
    userId: string | ObjectId,
    title: string,
    message: string,
    actionUrl?: string
  ) {
    return await this.create({
      userId,
      type: 'new_promotion',
      title: `🎁 ${title}`,
      message,
      priority: 'normal',
      actionUrl,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    })
  }

  /**
   * Send system announcement
   */
  static async sendSystemAnnouncement(
    userId: string | ObjectId,
    title: string,
    message: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ) {
    return await this.create({
      userId,
      type: 'system_announcement',
      title: `📢 ${title}`,
      message,
      priority,
    })
  }

  /**
   * Send notification to all users of a specific role
   */
  static async sendToRole(
    role: 'client' | 'partner' | 'admin',
    type: string,
    title: string,
    message: string,
    options?: {
      priority?: 'low' | 'normal' | 'high' | 'urgent'
      actionUrl?: string
      expiresAt?: Date
    }
  ) {
    try {
      // Import User model dynamically to avoid circular dependencies
      const { User } = await import('#models/user')

      // Find all users with the specified role
      const users = await User.find({ role }).select('_id').lean()

      // Create notifications for all users
      const notifications = await Promise.all(
        users.map((user) =>
          this.create({
            userId: user._id as any,
            type,
            title,
            message,
            priority: options?.priority || 'normal',
            actionUrl: options?.actionUrl,
            expiresAt: options?.expiresAt,
          })
        )
      )

      return notifications
    } catch (error) {
      console.error('Error sending notifications to role:', error)
      throw error
    }
  }
}
