import { Server as SocketServer } from 'socket.io'
import type { ApplicationService } from '@adonisjs/core/types'
import { Message } from '#models/message'
import { Conversation } from '#models/conversation'

export default class SocketProvider {
  private io: SocketServer | null = null
  private activeUsers = new Map<string, string>() // userId/anonymousId -> socketId

  constructor(protected app: ApplicationService) {}

  async boot() {
    console.log('🔌 Booting Socket.IO provider...')
  }

  async ready() {
    try {
      console.log('🔌 Ready hook - Initializing Socket.IO...')
      // Get HTTP server from the app container using the correct method
      const server = await this.app.container.make('server')

      // Access the Node.js HTTP server instance
      const nodeServer = server?.getNodeServer?.()

      if (!nodeServer) {
        console.error('❌ Could not get Node.js HTTP server')
        console.log('   Server object:', typeof server)
        console.log(
          '   Available methods:',
          Object.getOwnPropertyNames(Object.getPrototypeOf(server))
        )
        return
      }

      this.io = new SocketServer(nodeServer, {
        cors: {
          origin: process.env.FRONTEND_URL || 'http://localhost:3001',
          methods: ['GET', 'POST'],
          credentials: true,
        },
        transports: ['websocket', 'polling'],
      })

      this.setupEventHandlers()
      console.log('✅ Socket.IO server initialized on port', process.env.PORT || 3333)
    } catch (error) {
      console.error('❌ Error initializing Socket.IO:', error)
      if (error instanceof Error) {
        console.error('   Error message:', error.message)
        console.error('   Stack:', error.stack)
      }
    }
  }

  private setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      console.log('🔌 New socket connection:', socket.id)

      // USER JOIN - Authenticated user
      socket.on('user:join', (userId: string) => {
        this.activeUsers.set(userId, socket.id)
        socket.data.userId = userId
        socket.data.userType = 'user'
        socket.join(`user:${userId}`)
        console.log(`👤 User joined: ${userId} (${socket.id})`)
        this.io?.emit('user:online', userId)
      })

      // PARTNER JOIN
      socket.on('partner:join', (partnerId: string) => {
        this.activeUsers.set(partnerId, socket.id)
        socket.data.userId = partnerId
        socket.data.userType = 'partner'
        socket.join(`user:${partnerId}`)
        console.log(`🤝 Partner joined: ${partnerId} (${socket.id})`)
        this.io?.emit('user:online', partnerId)
      })

      // GUEST JOIN - Anonymous user
      socket.on('guest:join', (anonymousId: string) => {
        this.activeUsers.set(`guest:${anonymousId}`, socket.id)
        socket.data.anonymousId = anonymousId
        socket.data.userType = 'guest'
        socket.join(`guest:${anonymousId}`)
        console.log(`👻 Guest joined: ${anonymousId} (${socket.id})`)
      })

      // JOIN CONVERSATION ROOM
      socket.on('conversation:join', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`)
        console.log(`💬 Joined conversation: ${conversationId}`)
      })

      // LEAVE CONVERSATION ROOM
      socket.on('conversation:leave', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`)
        console.log(`🚪 Left conversation: ${conversationId}`)
      })

      // SEND MESSAGE
      socket.on(
        'message:send',
        async (data: {
          conversationId: string
          content: string
          userId?: string
          userName?: string
          senderType: 'user' | 'guest' | 'partner'
          anonymousId?: string
          anonymousName?: string
        }) => {
          try {
            console.log('📤 Sending message:', data)

            // Create message in database
            const messageData: any = {
              conversation: data.conversationId,
              content: data.content,
            }

            // Handle different sender types
            if (data.senderType === 'guest' && data.anonymousId) {
              // Guest/Anonymous message
              messageData.senderType = 'anonymous'
              messageData.anonymousSender = {
                id: data.anonymousId,
                name: data.anonymousName || 'Guest',
              }
            } else if (data.userId) {
              // Logged-in user or partner message
              messageData.sender = data.userId
              messageData.senderType = 'user'
            }

            // Save message to database
            const message = await Message.create(messageData)
            const populatedMessage: any = await Message.findById(message._id)
              .populate('sender', 'username shopName role name')
              .lean()

            // Update conversation last message
            const senderName =
              data.senderType === 'guest'
                ? data.anonymousName || 'Guest'
                : data.userName ||
                  populatedMessage?.sender?.name ||
                  populatedMessage?.sender?.username ||
                  'User'

            await Conversation.findByIdAndUpdate(data.conversationId, {
              lastMessage: {
                content: data.content,
                timestamp: new Date(),
                sender: senderName,
              },
            })

            // Emit to conversation room (both participants receive)
            this.io?.to(`conversation:${data.conversationId}`).emit('message:received', {
              message: populatedMessage,
              conversationId: data.conversationId,
            })

            console.log('✅ Message sent and saved to database')
          } catch (error) {
            console.error('❌ Error sending message:', error)
            socket.emit('message:error', {
              error: 'Failed to send message',
              details: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
      )

      // TYPING START
      socket.on(
        'typing:start',
        (data: { conversationId: string; username?: string; anonymousName?: string }) => {
          const name = data.username || data.anonymousName || 'Someone'
          socket.to(`conversation:${data.conversationId}`).emit('typing:active', {
            username: name,
            conversationId: data.conversationId,
          })
        }
      )

      // TYPING STOP
      socket.on('typing:stop', (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('typing:inactive', {
          conversationId: data.conversationId,
        })
      })

      // DISCONNECT
      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected:', socket.id)

        // Remove from active users
        if (socket.data.userId) {
          this.activeUsers.delete(socket.data.userId)
          this.io?.emit('user:offline', socket.data.userId)
        } else if (socket.data.anonymousId) {
          this.activeUsers.delete(`guest:${socket.data.anonymousId}`)
        }
      })
    })
  }

  getInstance() {
    return this.io
  }
}
