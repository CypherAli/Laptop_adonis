/**
 * ==================== DASHBOARD COMPONENT ====================
 *
 * PHÂN QUYỀN HỆ THỐNG:
 * - Admin: Full access to all statistics (products, orders, revenue)
 * - Partner: Can view own products, orders, and revenue stats
 * - Customer: Can view personal order history and stats
 *
 * CORE FUNCTIONS:
 * 1. Statistics Display
 *    - Products: Total products, active products, low stock alerts
 *    - Orders: Total, pending, processing, delivered counts
 *    - Revenue: Total revenue from paid orders
 *
 * 2. Recent Activity
 *    - Recent orders list (5 most recent)
 *    - Low stock product alerts
 *
 * BACKEND LOGIC NOTES:
 * - Revenue calculation: Sum of totalAmount for paid orders only
 * - Low stock: Products with variants.stock < 5
 * - Order status tracking: pending, processing, delivered
 * - This component adapts based on user role (admin sees all, partner sees own)
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Stats state
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!token) {
      navigate('/login')
      return
    }
    setCurrentUser(user)
    fetchDashboardData(user)
  }, [navigate])

  const fetchDashboardData = async (user) => {
    setLoading(true)
    setError('')
    try {
      // Fetch statistics based on role
      if (user.role === 'admin') {
        await fetchAdminStats()
      } else if (user.role === 'partner') {
        await fetchPartnerStats()
      } else {
        await fetchCustomerStats()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ==================== ADMIN STATS ====================

  const fetchAdminStats = async () => {
    // Get products stats
    const productsResponse = await axios.get('/api/products')
    const allProducts = productsResponse.data.products || []
    const activeProducts = allProducts.filter((p) => p.isActive)

    // Get orders stats
    const ordersResponse = await axios.get('/api/orders')
    const allOrders = ordersResponse.data.orders || []
    const pendingOrders = allOrders.filter((o) => o.status === 'pending')
    const processingOrders = allOrders.filter((o) => o.status === 'processing')
    const deliveredOrders = allOrders.filter((o) => o.status === 'delivered')
    const paidOrders = allOrders.filter((o) => o.paymentStatus === 'paid')

    // Calculate revenue
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Get recent orders (5 most recent)
    const sortedOrders = [...allOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    const recent = sortedOrders.slice(0, 5)

    // Get low stock products
    const lowStock = allProducts
      .filter((product) => {
        if (!product.variants || product.variants.length === 0) return false
        return product.variants.some((variant) => variant.isAvailable && variant.stock < 5)
      })
      .slice(0, 10)

    setStats({
      totalProducts: allProducts.length,
      activeProducts: activeProducts.length,
      totalOrders: allOrders.length,
      pendingOrders: pendingOrders.length,
      processingOrders: processingOrders.length,
      deliveredOrders: deliveredOrders.length,
      totalRevenue,
    })
    setRecentOrders(recent)
    setLowStockProducts(lowStock)
  }

  // ==================== PARTNER STATS ====================

  const fetchPartnerStats = async () => {
    // Get partner's products
    const productsResponse = await axios.get('/api/products/my')
    const myProducts = productsResponse.data.products || []
    const activeProducts = myProducts.filter((p) => p.isActive)

    // Get partner's orders
    const ordersResponse = await axios.get('/api/orders')
    const allOrders = ordersResponse.data.orders || []

    // Filter orders that contain partner's products
    const myOrders = allOrders.filter((order) =>
      order.items.some(
        (item) => item.product?.seller?._id === JSON.parse(localStorage.getItem('user') || '{}').id
      )
    )

    const pendingOrders = myOrders.filter((o) => o.status === 'pending')
    const processingOrders = myOrders.filter((o) => o.status === 'processing')
    const deliveredOrders = myOrders.filter((o) => o.status === 'delivered')
    const paidOrders = myOrders.filter((o) => o.paymentStatus === 'paid')

    // Calculate revenue from partner's products only
    const totalRevenue = paidOrders.reduce((sum, order) => {
      const partnerItemsTotal = order.items
        .filter(
          (item) =>
            item.product?.seller?._id === JSON.parse(localStorage.getItem('user') || '{}').id
        )
        .reduce((itemSum, item) => itemSum + item.price * item.quantity, 0)
      return sum + partnerItemsTotal
    }, 0)

    // Get recent orders
    const sortedOrders = [...myOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const recent = sortedOrders.slice(0, 5)

    // Get low stock products
    const lowStock = myProducts
      .filter((product) => {
        if (!product.variants || product.variants.length === 0) return false
        return product.variants.some((variant) => variant.isAvailable && variant.stock < 5)
      })
      .slice(0, 10)

    setStats({
      totalProducts: myProducts.length,
      activeProducts: activeProducts.length,
      totalOrders: myOrders.length,
      pendingOrders: pendingOrders.length,
      processingOrders: processingOrders.length,
      deliveredOrders: deliveredOrders.length,
      totalRevenue,
    })
    setRecentOrders(recent)
    setLowStockProducts(lowStock)
  }

  // ==================== CUSTOMER STATS ====================

  const fetchCustomerStats = async () => {
    // Get customer's orders
    const ordersResponse = await axios.get('/api/orders')
    const myOrders = ordersResponse.data.orders || []

    const pendingOrders = myOrders.filter((o) => o.status === 'pending')
    const processingOrders = myOrders.filter((o) => o.status === 'processing')
    const deliveredOrders = myOrders.filter((o) => o.status === 'delivered')
    const paidOrders = myOrders.filter((o) => o.paymentStatus === 'paid')

    // Calculate total spent
    const totalSpent = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // Get recent orders
    const sortedOrders = [...myOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    const recent = sortedOrders.slice(0, 5)

    setStats({
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: myOrders.length,
      pendingOrders: pendingOrders.length,
      processingOrders: processingOrders.length,
      deliveredOrders: deliveredOrders.length,
      totalRevenue: totalSpent, // For customers, this is total spent
    })
    setRecentOrders(recent)
  }

  // ==================== HELPERS ====================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      processing: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    }
    return statusClasses[status] || 'badge-secondary'
  }

  if (loading) {
    return <div className="dashboard-loading">Đang tải...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Chào mừng trở lại, {currentUser?.username}!</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ==================== STATS CARDS ==================== */}
      <div className="stats-grid">
        {(currentUser?.role === 'admin' || currentUser?.role === 'partner') && (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#667eea' }}>
                📦
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalProducts}</div>
                <div className="stat-label">Tổng Sản Phẩm</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#10b981' }}>
                ✓
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.activeProducts}</div>
                <div className="stat-label">Sản Phẩm Hoạt Động</div>
              </div>
            </div>
          </>
        )}

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b' }}>
            📋
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Tổng Đơn Hàng</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef4444' }}>
            ⏳
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingOrders}</div>
            <div className="stat-label">Đang Chờ</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>
            ⚙
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.processingOrders}</div>
            <div className="stat-label">Đang Xử Lý</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            ✓
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.deliveredOrders}</div>
            <div className="stat-label">Đã Giao</div>
          </div>
        </div>

        <div className="stat-card revenue-card">
          <div className="stat-icon" style={{ background: '#8b5cf6' }}>
            💰
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">
              {currentUser?.role === 'customer' ? 'Tổng Chi Tiêu' : 'Tổng Doanh Thu'}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== RECENT ORDERS ==================== */}
      <div className="dashboard-section">
        <h2>Đơn Hàng Gần Đây</h2>
        {recentOrders.length === 0 ? (
          <div className="empty-state">Chưa có đơn hàng nào</div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Ngày Đặt</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng Thái</th>
                  <th>Thanh Toán</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/orders/${order._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>#{order.orderNumber || order._id.slice(-8)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status === 'pending'
                          ? 'Chờ xử lý'
                          : order.status === 'processing'
                            ? 'Đang xử lý'
                            : order.status === 'delivered'
                              ? 'Đã giao'
                              : order.status === 'cancelled'
                                ? 'Đã hủy'
                                : order.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}
                      >
                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== LOW STOCK ALERTS (Admin/Partner only) ==================== */}
      {(currentUser?.role === 'admin' || currentUser?.role === 'partner') &&
        lowStockProducts.length > 0 && (
          <div className="dashboard-section">
            <h2>Cảnh Báo Tồn Kho Thấp</h2>
            <div className="low-stock-grid">
              {lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="low-stock-card"
                  onClick={() => navigate(`/products/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={product.imageUrl || '/placeholder.png'} alt={product.name} />
                  <div className="low-stock-info">
                    <h3>{product.name}</h3>
                    <p className="stock-warning">
                      Tồn kho thấp:{' '}
                      {product.variants?.filter((v) => v.isAvailable && v.stock < 5).length} biến
                      thể
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
