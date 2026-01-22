import type { HttpContext } from '@adonisjs/core/http'
import { Notification } from '#models/notification'
import mongoose from 'mongoose'

export default class NotificationsController {
  /**
   * Get unread notification count
   */
  async getUnreadCount({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user?.id

      if (!userId) {
        return response.json({
          unreadCount: 0,
        })
      }

      const unreadCount = await Notification.getUnreadCount(userId)

      return response.json({
        unreadCount,
      })
    } catch (error) {
      console.error('Error getting unread count:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get all notifications for authenticated user
   */
  async index({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user?.id

      if (!userId) {
        return response.status(401).json({
          message: 'Unauthorized',
        })
      }

      // Get query parameters
      const status = request.input('status') // 'all', 'unread', 'read', 'archived'
      const type = request.input('type')
      const page = Number.parseInt(request.input('page', '1'))
      const limit = Number.parseInt(request.input('limit', '50'))
      const skip = (page - 1) * limit

      // Build query
      const query: any = { userId }

      if (status && status !== 'all') {
        query.status = status
      }

      if (type) {
        query.type = type
      }

      // Get notifications with pagination
      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-__v')
          .lean(),
        Notification.countDocuments(query),
        Notification.getUnreadCount(userId),
      ])

      return response.json({
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead({ request, response, params }: HttpContext) {
    try {
      const userId = (request as any).user?.id
      const { notificationId } = params

      if (!userId) {
        return response.status(401).json({
          message: 'Unauthorized',
        })
      }

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return response.status(400).json({
          message: 'Invalid notification ID',
        })
      }

      const notification = await Notification.findOne({
        _id: notificationId,
        userId,
      })

      if (!notification) {
        return response.status(404).json({
          message: 'Notification not found',
        })
      }

      await notification.markAsRead()

      return response.json({
        message: 'Đã đánh dấu đã đọc',
        notification,
      })
    } catch (error) {
      console.error('Error marking as read:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user?.id

      if (!userId) {
        return response.status(401).json({
          message: 'Unauthorized',
        })
      }

      const result = await Notification.markAllAsRead(userId)

      return response.json({
        message: 'Đã đánh dấu tất cả là đã đọc',
        modifiedCount: result.modifiedCount,
      })
    } catch (error) {
      console.error('Error marking all as read:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete notification
   */
  async destroy({ request, response, params }: HttpContext) {
    try {
      const userId = (request as any).user?.id
      const { notificationId } = params

      if (!userId) {
        return response.status(401).json({
          message: 'Unauthorized',
        })
      }

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return response.status(400).json({
          message: 'Invalid notification ID',
        })
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      })

      if (!notification) {
        return response.status(404).json({
          message: 'Notification not found',
        })
      }

      return response.json({
        message: 'Đã xóa thông báo',
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user?.id

      if (!userId) {
        return response.status(401).json({
          message: 'Unauthorized',
        })
      }

      const result = await Notification.deleteAllRead(userId)

      return response.json({
        message: 'Đã xóa tất cả thông báo đã đọc',
        deletedCount: result.deletedCount,
      })
    } catch (error) {
      console.error('Error deleting read notifications:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Create test notification (for testing purposes)
   */
  async createTest({ request, response }: HttpContext) {
    try {
      const userId = (request as any).user?.id
      const userRole = (request as any).user?.role

      if (!userId) {
        return response.status(401).json({
          message: 'Unauthorized',
        })
      }

      // Create role-specific test notifications
      let notificationData: any = {
        userId,
        status: 'unread',
      }

      switch (userRole) {
        case 'admin':
          notificationData = {
            ...notificationData,
            type: 'admin_new_user',
            title: '🔔 New User Registered',
            message: 'A new user has registered: test@example.com',
            priority: 'high',
            actionUrl: '/admin/users',
          }
          break

        case 'partner':
          notificationData = {
            ...notificationData,
            type: 'partner_order_new',
            title: '📦 New Order Received',
            message: 'You have a new order #ORD-12345 for $250.00',
            priority: 'high',
            actionUrl: '/partner/orders',
          }
          break

        case 'client':
        default:
          notificationData = {
            ...notificationData,
            type: 'order_confirmed',
            title: '✅ Order Confirmed',
            message: 'Your order #ORD-12345 has been confirmed and is being processed',
            priority: 'normal',
            actionUrl: '/orders',
          }
          break
      }

      const notification = await Notification.createNotification(notificationData)

      return response.json({
        message: 'Test notification created',
        notification,
      })
    } catch (error) {
      console.error('Error creating test notification:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }
}
