import React, { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSend, FiMinus, FiUsers } from 'react-icons/fi'
import AuthContext from '../../context/AuthContext'
import axios from '../../api/axiosConfig'
import io from 'socket.io-client'
import './PartnerChatWidget.css' // Reuse the same styles

/**
 * Admin Chat Widget
 * Admin can chat with Partners and Users using new conversation system
 */
const AdminChatWidget = () => {
  const { user } = useContext(AuthContext)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showUserList, setShowUserList] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState([])
  const [partners, setPartners] = useState([])
  const [clients, setClients] = useState([])
  const [activeTab, setActiveTab] = useState('partners') // 'partners' or 'clients'
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)

  // Drag state for button
  const [buttonPosition, setButtonPosition] = useState({
    x: window.innerWidth - 100,
    y: window.innerHeight - 100,
  })
  const [isDragging, setIsDragging] = useState(false)
  const buttonDragStartRef = useRef({ x: 0, y: 0 })
  const buttonPositionRef = useRef({ x: window.innerWidth - 100, y: window.innerHeight - 100 })
  const buttonRef = useRef(null)

  const adminId = user?._id || user?.id

  // Socket.IO setup
  useEffect(() => {
    if (!user || !isOpen || !adminId) return

    console.log('🔌 AdminChatWidget: Initializing socket for admin:', adminId)

    const socketUrl =
      process.env.REACT_APP_SOCKET_URL ||
      process.env.REACT_APP_SERVER_URL ||
      'http://localhost:3333'
    const newSocket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('✅ Admin connected to chat')
      setIsConnected(true)
      newSocket.emit('user:join', adminId) // Admin joins as user
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Admin disconnected')
      setIsConnected(false)
    })

    // New conversation system - receive messages
    newSocket.on('message:received', (message) => {
      console.log('📩 Admin received message:', message)

      // Only add if it's for current conversation
      if (conversationId && message.conversation === conversationId) {
        setMessages((prev) => {
          // Check for duplicates by ID or temp message
          const exists = prev.some(
            (m) => m._id === message._id || (m.isTemp && m.message === message.message)
          )

          if (exists) {
            console.log('⚠️ Duplicate detected, replacing temp')
            return prev.map((m) =>
              m.isTemp && m.message === message.message ? { ...message, isTemp: false } : m
            )
          }

          return [...prev, message]
        })
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [user, conversationId, isOpen, adminId])

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'partners') {
        fetchPartners()
      } else {
        fetchClients()
      }
    }
     
  }, [isOpen, activeTab])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      console.log(
        '📞 Fetching partners, token:',
        localStorage.getItem('token')?.substring(0, 20) + '...'
      )
      const response = await axios.get('/admin/users?role=partner')
      console.log('✅ Partners fetched:', response.data.users?.length)
      setPartners(response.data.users || [])
    } catch (error) {
      console.error('❌ Error fetching partners:', error)
      console.error('Status:', error.response?.status, 'Message:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/admin/users?role=client')
      setClients(response.data.users || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const createOrGetConversation = async (targetUserId) => {
    try {
      console.log('🔑 Creating conversation with:', {
        targetUserId,
        hasToken: !!localStorage.getItem('token'),
      })

      const response = await axios.post('/chat/conversations', {
        targetUserId,
        subject: 'Admin Support',
      })

      console.log('✅ Conversation created:', response.data)

      if (response.data) {
        const convId = response.data._id || response.data.conversation?._id
        setConversationId(convId)
        return convId
      }
    } catch (error) {
      console.error('❌ Error creating conversation:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers,
      })
    }
    return null
  }

  const fetchMessages = async (convId) => {
    try {
      const response = await axios.get(`/chat/messages/${convId}`)
      setMessages(response.data.messages || response.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleOpenChat = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
    setShowUserList(true)
    setSelectedUser(null)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleSelectUser = async (targetUser) => {
    setSelectedUser(targetUser)
    setShowUserList(false)

    // Create or get conversation
    const convId = await createOrGetConversation(targetUser._id)
    if (convId) {
      fetchMessages(convId)

      // Join conversation room via socket
      if (socket?.connected) {
        socket.emit('conversation:join', convId)
      }
    }
  }

  const handleBackToList = () => {
    setShowUserList(true)
    setSelectedUser(null)
    setConversationId(null)
    setMessages([])
  }

  // Drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    buttonDragStartRef.current = {
      x: e.clientX - buttonPositionRef.current.x,
      y: e.clientY - buttonPositionRef.current.y,
    }
  }

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        e.preventDefault()
        const newX = e.clientX - buttonDragStartRef.current.x
        const newY = e.clientY - buttonDragStartRef.current.y

        // Keep within viewport bounds
        const maxX = window.innerWidth - 80
        const maxY = window.innerHeight - 80

        const boundedX = Math.max(0, Math.min(newX, maxX))
        const boundedY = Math.max(0, Math.min(newY, maxY))

        buttonPositionRef.current = { x: boundedX, y: boundedY }

        if (buttonRef.current) {
          buttonRef.current.style.left = `${boundedX}px`
          buttonRef.current.style.top = `${boundedY}px`
        }
      }
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setButtonPosition(buttonPositionRef.current)
    }
  }, [isDragging])

  const handleButtonClick = (e) => {
    if (!isDragging) {
      handleOpenChat()
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
     
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!messageInput.trim() || !selectedUser || !adminId || !conversationId) return

    const tempId = `temp_${Date.now()}`
    const messageData = {
      _id: tempId,
      message: messageInput.trim(),
      senderRole: 'admin',
      sender: {
        username: user.name || user.username || 'Admin',
        _id: adminId,
      },
      createdAt: new Date(),
      isTemp: true,
    }

    setMessages((prev) => [...prev, messageData])
    const messageCopy = messageInput.trim()
    setMessageInput('')

    try {
      const response = await axios.post('/chat/messages', {
        conversationId,
        content: messageCopy,
      })

      if (response.data) {
        console.log('✅ Admin message sent successfully')
        const newMessage = response.data.message || response.data

        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? { ...newMessage, isTemp: false } : msg))
        )

        // Broadcast via socket
        if (socket?.connected) {
          socket.emit('message:send', {
            conversationId,
            messageId: newMessage._id,
          })
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId))
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.')
    }
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  console.log('🔍 AdminChatWidget Debug:', {
    hasUser: !!user,
    userRole: user?.role,
    shouldRender: user && user.role === 'admin',
  })

  if (!user || user.role !== 'admin') return null

  const currentList = activeTab === 'partners' ? partners : clients

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            ref={buttonRef}
            className="partner-chat-button"
            onClick={handleButtonClick}
            onMouseDown={handleMouseDown}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: isDragging ? 1 : 1.1 }}
            title="Admin Chat - Kéo để di chuyển"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              left: `${buttonPosition.x}px`,
              top: `${buttonPosition.y}px`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            <FiUsers size={24} />
            <span className="button-label">Admin Chat</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`partner-chat-container ${isMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{ bottom: '100px', right: '30px' }}
          >
            {/* Header */}
            <div
              className="partner-chat-header"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <div className="header-left">
                {!showUserList && selectedUser && (
                  <button className="back-button" onClick={handleBackToList}>
                    ←
                  </button>
                )}
                <FiUsers />
                <span>
                  {showUserList
                    ? 'Admin Chat'
                    : selectedUser?.shopName ||
                      selectedUser?.name ||
                      selectedUser?.username ||
                      'User'}
                </span>
                {isConnected && <span className="status-dot"></span>}
              </div>
              <div className="header-actions">
                <button onClick={handleMinimize}>
                  <FiMinus />
                </button>
                <button onClick={handleClose}>
                  <FiX />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="partner-chat-content">
              {showUserList ? (
                <>
                  {/* Tab Selector */}
                  <div className="chat-tabs">
                    <button
                      className={activeTab === 'partners' ? 'active' : ''}
                      onClick={() => setActiveTab('partners')}
                    >
                      Partners ({partners.length})
                    </button>
                    <button
                      className={activeTab === 'clients' ? 'active' : ''}
                      onClick={() => setActiveTab('clients')}
                    >
                      Clients ({clients.length})
                    </button>
                  </div>

                  {/* User List */}
                  <div className="partner-list">
                    {loading ? (
                      <div className="loading-state">Đang tải...</div>
                    ) : currentList.length === 0 ? (
                      <div className="empty-state">
                        Không có {activeTab === 'partners' ? 'partner' : 'client'} nào
                      </div>
                    ) : (
                      currentList.map((item) => (
                        <div
                          key={item._id}
                          className="partner-item"
                          onClick={() => handleSelectUser(item)}
                        >
                          <div className="partner-avatar">
                            {(item.shopName || item.name || item.username || 'U')[0].toUpperCase()}
                          </div>
                          <div className="partner-info">
                            <div className="partner-name">
                              {item.shopName || item.name || item.username || 'User'}
                            </div>
                            <div className="partner-email">{item.email}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Messages */}
                  <div className="messages-container">
                    {messages.map((msg, index) => {
                      const isOwnMessage = msg.sender?._id === adminId || msg.senderRole === 'admin'

                      return (
                        <div
                          key={msg._id || index}
                          className={`message ${isOwnMessage ? 'sent' : 'received'} ${msg.isTemp ? 'temp' : ''}`}
                        >
                          <div className="message-content">
                            <div className="message-text">{msg.content || msg.message}</div>
                            <div className="message-time">
                              {formatTime(msg.createdAt || msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form className="message-input-container" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="message-input"
                    />
                    <button type="submit" className="send-button" disabled={!messageInput.trim()}>
                      <FiSend />
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminChatWidget
