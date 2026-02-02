/**
 * ==================== NOTIFICATION MANAGER COMPONENT ====================
 *
 * PHÂN QUYỀN HỆ THỐNG:
 * - All Users: Can view, read, delete their own notifications
 * - Ownership-based: Users only access notifications with userId matching their ID
 * - Real-time: Uses Socket.IO for instant notification delivery (if implemented)
 *
 * CORE FUNCTIONS:
 * 1. Notification Display
 *    - index() - GET /api/notifications (with filters: status, type, pagination)
 *    - getUnreadCount() - GET /api/notifications/unread-count
 *
 * 2. Mark as Read
 *    - markAsRead() - PUT /api/notifications/:notificationId/read
 *    - markAllAsRead() - PUT /api/notifications/mark-all-read
 *
 * 3. Delete Operations
 *    - destroy() - DELETE /api/notifications/:notificationId
 *    - deleteAllRead() - DELETE /api/notifications/delete-all-read
 *
 * BACKEND LOGIC NOTES:
 * - Status: unread, read, archived
 * - Types: order_confirmed, partner_order_new, admin_new_user, etc.
 * - Priority: normal, high, urgent
 * - All operations scoped to current user (ownership check)
 * - Socket.IO integration for real-time updates (optional)
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './NotificationManager.css'

export default function NotificationManager() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Notifications state
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalNotifications, setTotalNotifications] = useState(0)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all') // all, unread, read, archived
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchNotifications()
  }, [currentPage, statusFilter, typeFilter, navigate])

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter,
        ...(typeFilter && { type: typeFilter }),
      }

      const response = await axios.get('/api/notifications', { params })
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
      setCurrentPage(response.data.pagination?.page || 1)
      setTotalPages(response.data.pagination?.pages || 1)
      setTotalNotifications(response.data.pagination?.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải thông báo')
    } finally {
      setLoading(false)
    }
  }

  // ==================== MARK AS READ ====================

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`)
      await fetchNotifications() // Refresh to update unread count
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đánh dấu đã đọc')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read')
      setSuccess('Đã đánh dấu tất cả là đã đọc')
      await fetchNotifications()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đánh dấu tất cả đã đọc')
    }
  }

  // ==================== DELETE ====================

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return

    try {
      await axios.delete(`/api/notifications/${notificationId}`)
      setSuccess('Đã xóa thông báo')
      await fetchNotifications()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa thông báo')
    }
  }

  const handleDeleteAllRead = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo đã đọc?')) return

    try {
      await axios.delete('/api/notifications/delete-all-read')
      setSuccess('Đã xóa tất cả thông báo đã đọc')
      await fetchNotifications()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa thông báo đã đọc')
    }
  }

  // ==================== HANDLE CLICK ====================

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      await handleMarkAsRead(notification._id)
    }

    // Navigate to action URL if exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  // ==================== HELPERS ====================

  const getNotificationIcon = (type) => {
    const icons = {
      order_confirmed: '✓',
      order_shipped: '🚚',
      order_delivered: '📦',
      order_cancelled: '✗',
      partner_order_new: '📋',
      partner_order_update: '🔄',
      admin_new_user: '👤',
      admin_new_order: '📊',
      payment_success: '💳',
      payment_failed: '⚠',
      review_new: '⭐',
      message_new: '💬',
      system: 'ℹ',
    }
    return icons[type] || '🔔'
  }

  const getPriorityClass = (priority) => {
    const classes = {
      urgent: 'priority-urgent',
      high: 'priority-high',
      normal: 'priority-normal',
      low: 'priority-low',
    }
    return classes[priority] || 'priority-normal'
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return notifDate.toLocaleDateString('vi-VN')
  }

  if (loading && notifications.length === 0) {
    return <div className="notification-loading">Đang tải...</div>
  }

  return (
    <div className="notification-container">
      <div className="notification-header">
        <div className="header-content">
          <h1>Thông Báo</h1>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount} chưa đọc</span>}
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Đánh Dấu Tất Cả Đã Đọc
          </button>
          <button className="btn btn-danger" onClick={handleDeleteAllRead}>
            Xóa Đã Đọc
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ==================== FILTERS ==================== */}
      <div className="notification-filters">
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
        </div>

        <div className="filter-stats">
          Hiển thị {notifications.length} / {totalNotifications} thông báo
        </div>
      </div>

      {/* ==================== NOTIFICATIONS LIST ==================== */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.status === 'unread' ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">{getNotificationIcon(notification.type)}</div>

              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatTimeAgo(notification.createdAt)}</div>
              </div>

              <div className="notification-actions" onClick={(e) => e.stopPropagation()}>
                {notification.status === 'unread' && (
                  <button
                    className="btn-icon"
                    onClick={() => handleMarkAsRead(notification._id)}
                    title="Đánh dấu đã đọc"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteNotification(notification._id)}
                  title="Xóa"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ==================== PAGINATION ==================== */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trang Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Trang Sau
          </button>
        </div>
      )}
    </div>
  )
}
