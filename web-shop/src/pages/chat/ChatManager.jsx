/**
 * ==================== CHAT MANAGER COMPONENT ====================
 *
 * PHÂN QUYỀN HỆ THỐNG:
 * - Customer: Can chat with partners, view own conversations
 * - Partner: Can view all customer conversations, respond to messages
 * - Anonymous: Can chat with partners using anonymousId header
 * - Socket.IO: Real-time message delivery (if implemented)
 *
 * CORE FUNCTIONS:
 * 1. Conversation Management
 *    - createConversation() - POST /api/chat/conversations (create or get existing)
 *    - getGuestConversations() - GET /api/chat/guest-conversations (for anonymous)
 *    - getPartnerCustomers() - GET /api/chat/partners/:partnerId/customers (partner view)
 *
 * 2. Message Operations
 *    - getMessages() - GET /api/chat/conversations/:conversationId/messages
 *    - sendMessage() - POST /api/chat/messages
 *
 * 3. Partner Discovery
 *    - getActivePartners() - GET /api/chat/active-partners (list available partners)
 *
 * BACKEND LOGIC NOTES:
 * - Anonymous users: Use X-Anonymous-Id and X-Anonymous-Name headers
 * - Conversations: Unique per participant pair
 * - Messages: Sender can be user or anonymous
 * - Real-time: Socket.IO events for instant message delivery
 * - lastMessage: Auto-updated on conversation when message sent
 */

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './ChatManager.css'

export default function ChatManager() {
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Chat state
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Partner list (for starting new conversations)
  const [activePartners, setActivePartners] = useState([])
  const [showPartnerList, setShowPartnerList] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!token) {
      navigate('/login')
      return
    }
    setCurrentUser(user)
    initializeChat(user)
  }, [navigate])

  useEffect(() => {
    if (activeConversation) {
      scrollToBottom()
    }
  }, [messages, activeConversation])

  const initializeChat = async (user) => {
    setLoading(true)
    setError('')
    try {
      if (user.role === 'partner') {
        await fetchPartnerCustomers(user.id)
      } else {
        await fetchConversations()
      }
      await fetchActivePartners()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải chat')
    } finally {
      setLoading(false)
    }
  }

  // ==================== FETCH CONVERSATIONS ====================

  const fetchConversations = async () => {
    try {
      // For customers: get their conversations
      // Backend endpoint might need to be created for this
      // For now, we'll use partner customers endpoint as reference
      const response = await axios.get('/api/chat/guest-conversations', {
        headers: {
          'X-Anonymous-Id': localStorage.getItem('anonymousId') || crypto.randomUUID(),
        },
      })
      setConversations(response.data.conversations || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }

  const fetchPartnerCustomers = async (partnerId) => {
    try {
      const response = await axios.get(`/api/chat/partners/${partnerId}/customers`)
      setConversations(response.data.customers || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải khách hàng')
    }
  }

  const fetchActivePartners = async () => {
    try {
      const response = await axios.get('/api/chat/active-partners')
      setActivePartners(response.data.partners || [])
    } catch (err) {
      console.error('Error fetching partners:', err)
    }
  }

  // ==================== MESSAGES ====================

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}/messages`)
      setMessages(response.data.messages || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải tin nhắn')
    }
  }

  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation)
    await fetchMessages(conversation.conversationId || conversation._id)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !activeConversation || sendingMessage) return

    setSendingMessage(true)
    setError('')

    try {
      const response = await axios.post('/api/chat/messages', {
        conversationId: activeConversation.conversationId || activeConversation._id,
        content: messageInput.trim(),
      })

      setMessages([...messages, response.data.message])
      setMessageInput('')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi tin nhắn')
    } finally {
      setSendingMessage(false)
    }
  }

  // ==================== START NEW CONVERSATION ====================

  const handleStartConversation = async (partner) => {
    try {
      const response = await axios.post('/api/chat/conversations', {
        targetUserId: partner._id,
        subject: `Chat với ${partner.shopName || partner.username}`,
      })

      const newConversation = response.data.conversation
      setActiveConversation(newConversation)
      setMessages([])
      setShowPartnerList(false)

      // Refresh conversations list
      if (currentUser?.role === 'partner') {
        await fetchPartnerCustomers(currentUser.id)
      } else {
        await fetchConversations()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo cuộc trò chuyện')
    }
  }

  // ==================== HELPERS ====================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatMessageTime = (date) => {
    const messageDate = new Date(date)
    const now = new Date()
    const diffMs = now - messageDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút`
    if (diffHours < 24) return `${diffHours} giờ`
    return messageDate.toLocaleDateString('vi-VN')
  }

  const getConversationName = (conversation) => {
    if (currentUser?.role === 'partner') {
      return conversation.customerName || 'Khách hàng'
    }
    return conversation.participants?.find((p) => p.role === 'partner')?.shopName || 'Đối tác'
  }

  if (loading) {
    return <div className="chat-loading">Đang tải...</div>
  }

  return (
    <div className="chat-container">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="chat-layout">
        {/* ==================== CONVERSATIONS LIST ==================== */}
        <div className="conversations-panel">
          <div className="panel-header">
            <h2>Tin Nhắn</h2>
            {currentUser?.role !== 'partner' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowPartnerList(true)}>
                + Tin Nhắn Mới
              </button>
            )}
          </div>

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="empty-state">
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.conversationId || conversation._id}
                  className={`conversation-item ${activeConversation?.conversationId === conversation.conversationId || activeConversation?._id === conversation._id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    {getConversationName(conversation)[0]?.toUpperCase()}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{getConversationName(conversation)}</div>
                    {conversation.lastMessage && (
                      <div className="conversation-preview">
                        {conversation.lastMessage.content?.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <div className="conversation-time">
                      {formatMessageTime(
                        conversation.lastMessage.timestamp || conversation.updatedAt
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ==================== MESSAGES PANEL ==================== */}
        <div className="messages-panel">
          {activeConversation ? (
            <>
              <div className="messages-header">
                <h3>{getConversationName(activeConversation)}</h3>
                {activeConversation.subject && (
                  <span className="conversation-subject">{activeConversation.subject}</span>
                )}
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>Chưa có tin nhắn. Bắt đầu cuộc trò chuyện!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`message-item ${message.sender?._id === currentUser?.id || message.senderType === 'user' ? 'sent' : 'received'}`}
                    >
                      <div className="message-bubble">
                        <div className="message-content">{message.content}</div>
                        <div className="message-time">{formatMessageTime(message.createdAt)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="message-input"
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sendingMessage || !messageInput.trim()}
                >
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation">
              <div className="no-conversation-icon">💬</div>
              <p>Chọn cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== PARTNER LIST MODAL ==================== */}
      {showPartnerList && (
        <div className="modal-overlay" onClick={() => setShowPartnerList(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chọn Đối Tác</h2>
            <div className="partners-list">
              {activePartners.length === 0 ? (
                <p>Không có đối tác nào khả dụng</p>
              ) : (
                activePartners.map((partner) => (
                  <div
                    key={partner._id}
                    className="partner-item"
                    onClick={() => handleStartConversation(partner)}
                  >
                    <div className="partner-avatar">
                      {partner.shopName?.[0]?.toUpperCase() || partner.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="partner-info">
                      <div className="partner-name">{partner.shopName || partner.username}</div>
                      <div className="partner-email">{partner.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPartnerList(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
