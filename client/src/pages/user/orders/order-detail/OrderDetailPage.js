import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from '../../../../api/axiosConfig'
import AuthContext from '../../../../context/AuthContext'
import { useToast } from '../../../../components/common/Toast'
import './OrderDetailPage.css'

const OrderDetailPage = () => {
  const { orderId } = useParams()
  const { user } = useContext(AuthContext)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/orders/${orderId}`)
      console.log('Order response:', res.data) // Debug log
      setOrder(res.data.order || res.data) // Handle both response formats
    } catch (error) {
      console.error('Order fetch error:', error) // Debug log
      toast.error(error.response?.data?.message || 'Cannot load order information')
    } finally {
      setLoading(false)
    }
  }, [orderId, toast])

  useEffect(() => {
    if (user) {
      fetchOrderDetail()
    }
  }, [user, fetchOrderDetail])

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return
    }

    try {
      await axios.put(`/orders/${orderId}/cancel`)
      toast.success('Đã hủy đơn hàng thành công')
      fetchOrderDetail()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot cancel order')
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: '⏳ Chờ xác nhận', color: '#f59e0b', icon: '⏳' },
      confirmed: { label: '✅ Đã xác nhận', color: '#16a085', icon: '✅' },
      processing: { label: '📦 Đang xử lý', color: '#3b82f6', icon: '📦' },
      shipped: { label: '🚚 Đang giao', color: '#8b5cf6', icon: '🚚' },
      delivered: { label: '✅ Đã giao', color: '#10b981', icon: '✅' },
      cancelled: { label: '❌ Đã hủy', color: '#ef4444', icon: '❌' },
      refunded: { label: '💰 Đã hoàn tiền', color: '#6b7280', icon: '💰' },
    }
    return statusMap[status] || { label: status, color: '#6b7280', icon: '📋' }
  }

  const getPaymentStatusInfo = (status) => {
    const statusMap = {
      unpaid: { label: 'Chưa thanh toán', color: '#f59e0b' },
      paid: { label: 'Đã thanh toán', color: '#10b981' },
      refunded: { label: 'Đã hoàn tiền', color: '#6b7280' },
      failed: { label: 'Thanh toán thất bại', color: '#ef4444' },
    }
    return statusMap[status] || { label: status, color: '#6b7280' }
  }

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading order information...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="error-container">
          <h2>Order not found</h2>
          <Link to="/orders" className="back-link">
            ← Back to orders list
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order?.status || 'pending')
  const paymentInfo = getPaymentStatusInfo(order?.paymentStatus || 'unpaid')

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        {/* Header */}
        <div className="order-header">
          <div className="header-left">
            <Link to="/orders" className="back-button">
              ← Quay lại
            </Link>
            <div className="header-info">
              <h1>Order #{order.orderNumber}</h1>
              <p className="order-date">
                Đặt ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="header-right">
            <div className="status-badge" style={{ background: statusInfo.color }}>
              <span>{statusInfo.icon}</span>
              <span>{statusInfo.label}</span>
            </div>
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <button className="cancel-order-btn" onClick={handleCancelOrder}>
                ❌ Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="order-timeline">
          <h2>Order Status</h2>
          <div className="timeline-list">
            {order.statusHistory && order.statusHistory.length > 0 ? (
              order.statusHistory.map((history, index) => {
                const historyStatus = getStatusInfo(history.status)
                return (
                  <div key={index} className="timeline-item">
                    <div className="timeline-icon" style={{ background: historyStatus.color }}>
                      {historyStatus.icon}
                    </div>
                    <div className="timeline-content">
                      <h3>{historyStatus.label}</h3>
                      <p className="timeline-note">{history.note}</p>
                      <p className="timeline-time">
                        {new Date(history.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p>No update history yet</p>
            )}
          </div>
        </div>

        <div className="order-body">
          {/* Left Column */}
          <div className="order-left">
            {/* Products */}
            <div className="order-section">
              <h2>Sản phẩm ({order.items?.length || 0})</h2>
              <div className="order-products">
                {order.items?.map((item, index) => (
                  <div key={index} className="product-item">
                    <img
                      src={item.imageUrl || '/placeholder-shoe.png'}
                      alt={item.name}
                      onError={(e) => (e.target.src = '/placeholder-shoe.png')}
                    />
                    <div className="product-info">
                      <h3>{item.name}</h3>
                      {item.sellerName && (
                        <p className="product-seller">
                          <span className="seller-icon">🏪</span>
                          <span className="seller-name">{item.sellerName}</span>
                        </p>
                      )}
                      <p className="product-brand">{item.brand}</p>
                      {item.specifications && (
                        <div className="product-specs">
                          {item.specifications.size && (
                            <span>👟 Size: {item.specifications.size}</span>
                          )}
                          {item.specifications.color && (
                            <span>🎨 Color: {item.specifications.color}</span>
                          )}
                          {item.specifications.material && (
                            <span>✨ Material: {item.specifications.material}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="product-price">
                      <p className="quantity">x{item.quantity || 1}</p>
                      <p className="price">{((item.price || 0) * (item.quantity || 1)).toLocaleString()}đ</p>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>

            {/* Customer Notes */}
            {order.customerNotes && (
              <div className="order-section">
                <h2>Ghi chú của khách hàng</h2>
                <p className="notes-text">{order.customerNotes}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="order-right">
            {/* Payment Summary */}
            <div className="order-section summary-box">
              <h2>Thông tin thanh toán</h2>
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{(order.subtotal || 0).toLocaleString()}đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>{(order.shippingFee || 0).toLocaleString()}đ</span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>-{(order.discount || 0).toLocaleString()}đ</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{(order.totalAmount || 0).toLocaleString()}đ</span>
              </div>
              <div className="payment-method">
                <h3>Phương thức thanh toán</h3>
                <p>
                  {order.paymentMethod === 'cod'
                    ? 'Thanh toán khi nhận hàng (COD)'
                    : order.paymentMethod}
                </p>
                <div className="payment-status" style={{ color: paymentInfo.color }}>
                  {paymentInfo.label}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="order-section">
              <h2>Shipping Address</h2>
              <div className="address-info">
                {order.shippingAddress ? (
                  <>
                    <p>
                      <strong>{order.shippingAddress.fullName || 'N/A'}</strong>
                    </p>
                    <p>📞 {order.shippingAddress.phone || 'N/A'}</p>
                    {order.shippingAddress.email && <p>📧 {order.shippingAddress.email}</p>}
                    {typeof order.shippingAddress.address === 'object' ? (
                      <>
                        {order.shippingAddress.address.street && <p>📍 {order.shippingAddress.address.street}</p>}
                        {order.shippingAddress.address.ward && <p>{order.shippingAddress.address.ward}</p>}
                        {order.shippingAddress.address.district && <p>{order.shippingAddress.address.district}</p>}
                        {order.shippingAddress.address.city && <p>{order.shippingAddress.address.city}</p>}
                      </>
                    ) : (
                      <>
                        <p>📍 {order.shippingAddress.address || 'N/A'}</p>
                        {order.shippingAddress.ward && <p>{order.shippingAddress.ward}</p>}
                        {order.shippingAddress.district && <p>{order.shippingAddress.district}</p>}
                        {order.shippingAddress.city && <p>{order.shippingAddress.city}</p>}
                      </>
                    )}
                  </>
                ) : (
                  <p>No shipping address provided</p>
                )}
              </div>
            </div>

            {/* Tracking Info */}
            {order.tracking && order.tracking.trackingNumber && (
              <div className="order-section">
                <h2>Thông tin vận chuyển</h2>
                <div className="tracking-info">
                  <p>
                    <strong>Đơn vị vận chuyển:</strong> {order.tracking.carrier || 'N/A'}
                  </p>
                  <p>
                    <strong>Mã vận đơn:</strong> {order.tracking.trackingNumber}
                  </p>
                  {order.tracking.trackingUrl && (
                    <a
                      href={order.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tracking-link"
                    >
                      Track order →
                    </a>
                  )}
                  {order.tracking.estimatedDelivery && (
                    <p>
                      <strong>Dự kiến giao:</strong>{' '}
                      {new Date(order.tracking.estimatedDelivery).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
