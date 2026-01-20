import type { HttpContext } from '@adonisjs/core/http'
import { Conversation } from '#models/conversation'
import { Message } from '#models/message'

export default class ChatController {
  /**
   * Create or get conversation
   */
  async createConversation({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const anonymousId = request.header('X-Anonymous-Id')
      const anonymousName = request.header('X-Anonymous-Name') || 'Guest'
      const { targetUserId, subject } = request.only(['targetUserId', 'subject'])

      if (!targetUserId) {
        return response.status(400).json({
          success: false,
          message: 'Target user ID is required'
        })
      }

      let conversation

      if (user) {
        // Logged in user
        conversation = await Conversation.findOne({
          participants: { $all: [user.id, targetUserId] },
          anonymousUser: { $exists: false }
        })

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [user.id, targetUserId],
            subject: subject || 'Product Consultation'
          })
        }
      } else if (anonymousId) {
        // Anonymous user
        conversation = await Conversation.findOne({
          'anonymousUser.id': anonymousId,
          participants: targetUserId
        })

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [targetUserId],
            anonymousUser: {
              id: anonymousId,
              name: anonymousName
            },
            subject: subject || 'Product Consultation'
          })
        }
      } else {
        return response.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      return response.json({
        success: true,
        conversation
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      })
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages({ params, response }: HttpContext) {
    try {
      const { conversationId } = params

      const messages = await Message.find({ conversation: conversationId })
        .populate('sender', 'username shopName')
        .sort({ createdAt: 1 })
        .lean()

      return response.json({
        success: true,
        messages
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      })
    }
  }

  /**
   * Send a message
   */
  async sendMessage({ request, response }: HttpContext) {
    try {
      const user = (request as any).user
      const anonymousId = request.header('X-Anonymous-Id')
      const anonymousName = request.header('X-Anonymous-Name') || 'Guest'
      const { conversationId, content } = request.only(['conversationId', 'content'])

      if (!conversationId || !content) {
        return response.status(400).json({
          success: false,
          message: 'Conversation ID and content are required'
        })
      }

      const messageData: any = {
        conversation: conversationId,
        content
      }

      if (user) {
        messageData.sender = user.id
        messageData.senderType = 'user'
      } else if (anonymousId) {
        messageData.senderType = 'anonymous'
        messageData.anonymousSender = {
          id: anonymousId,
          name: anonymousName
        }
      } else {
        return response.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const message = await Message.create(messageData)

      // Update conversation last message
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          content,
          timestamp: new Date(),
          sender: user ? user.username : anonymousName
        }
      })

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username shopName')
        .lean()

      return response.json({
        success: true,
        message: populatedMessage
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      })
    }
  }
}
