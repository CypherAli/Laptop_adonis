import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import AuthContext from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import ProductImage from '../../components/product/ProductImage'
import PartnerRevenueModal from '../../components/partner/PartnerRevenueModal'
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrash2,
  FiEye,
  FiBarChart2,
  FiGrid,
  FiTag,
  FiSettings,
  FiLayers,
} from 'react-icons/fi'
import './AdminDashboard.professional.css'

const AdminDashboard = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Analytics Data
  const [dashboardStats, setDashboardStats] = useState(null)
  const [partnerRevenue, setPartnerRevenue] = useState([])

  // Revenue Modal State
  const [selectedPartnerId, setSelectedPartnerId] = useState(null)
  const [showRevenueModal, setShowRevenueModal] = useState(false)

  // Management Data
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [attributes, setAttributes] = useState([])
  const [settings, setSettings] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Form states for new tabs
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showBrandForm, setShowBrandForm] = useState(false)
  const [showAttributeForm, setShowAttributeForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingBrand, setEditingBrand] = useState(null)
  const [editingAttribute, setEditingAttribute] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Chỉ Admin mới có quyền truy cập!')
      navigate('/')
      return
    }
    fetchDashboardData()
    // eslint-disable-next-line
  }, [user])

  useEffect(() => {
    if (activeTab === 'products') fetchProducts()
    else if (activeTab === 'orders') fetchOrders()
    else if (activeTab === 'users') fetchUsers()
    else if (activeTab === 'reviews') fetchReviews()
    else if (activeTab === 'revenue') fetchPartnerRevenue()
    else if (activeTab === 'categories') fetchCategories()
    else if (activeTab === 'brands') fetchBrands()
    else if (activeTab === 'attributes') fetchAttributes()
    else if (activeTab === 'settings') fetchSettings()
    // eslint-disable-next-line
  }, [activeTab, currentPage])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch system stats from admin endpoint
      const statsRes = await axios.get('/admin/stats')
      console.log('📊 Dashboard Stats:', statsRes.data)
      setDashboardStats(statsRes.data)

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập trang này')
        navigate('/')
      } else {
        toast.error('Không thể tải dữ liệu dashboard')
      }
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`/admin/products?page=${currentPage}&limit=10`)
      console.log('Products response:', res.data)
      setProducts(res.data.products || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      console.error('Error details:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Không thể tải danh sách sản phẩm')
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`/admin/orders?page=${currentPage}&limit=10`)
      setOrders(res.data.orders || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/admin/users?page=${currentPage}&limit=10`)
      setUsers(res.data.users || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Không thể tải danh sách người dùng')
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/reviews?page=${currentPage}&limit=10`)
      setReviews(res.data.reviews || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast.error('Không thể tải danh sách đánh giá')
    }
  }

  const fetchPartnerRevenue = async () => {
    try {
      const res = await axios.get('/admin/revenue-by-shop')
      setPartnerRevenue(res.data || [])
    } catch (error) {
      console.error('Failed to fetch partner revenue:', error)
      toast.error('Không thể tải dữ liệu doanh thu')
    }
  }

  // PRODUCT ACTIONS
  const handleApproveProduct = async (productId) => {
    try {
      await axios.put(`/products/${productId}`, { status: 'approved' })
      toast.success('Đã duyệt sản phẩm!')
      fetchProducts()
    } catch (error) {
      toast.error('Không thể duyệt sản phẩm')
    }
  }

  const handleRejectProduct = async (productId) => {
    try {
      await axios.put(`/products/${productId}`, { status: 'rejected' })
      toast.success('Đã từ chối sản phẩm!')
      fetchProducts()
    } catch (error) {
      toast.error('Không thể từ chối sản phẩm')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    try {
      await axios.delete(`/products/${productId}`)
      toast.success('Đã xóa sản phẩm!')
      fetchProducts()
    } catch (error) {
      toast.error('Không thể xóa sản phẩm')
    }
  }

  // ORDER ACTIONS
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('📤 Updating order status:', {
        orderId,
        newStatus,
        statusType: typeof newStatus,
        statusValue: newStatus,
      })

      // Ensure status is a valid string
      if (!newStatus || typeof newStatus !== 'string') {
        toast.error('Trạng thái không hợp lệ')
        return
      }

      const response = await axios.put(`/orders/${orderId}/status`, {
        status: newStatus.trim(),
      })

      console.log('✅ Update response:', response.data)
      toast.success(`Đã cập nhật trạng thái đơn hàng sang: ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('❌ Update order status error:', error)
      console.error('   Response data:', error.response?.data)
      console.error('   Status code:', error.response?.status)
      console.error('   Request payload:', { status: newStatus })

      const errorMsg = error.response?.data?.message || 'Không thể cập nhật trạng thái'
      toast.error(errorMsg)

      // Show detailed error in console
      if (error.response?.data?.validStatuses) {
        console.log('   ✅ Valid statuses:', error.response.data.validStatuses)
      }
      if (error.response?.data?.receivedStatus) {
        console.log('   ❌ Received status:', error.response.data.receivedStatus)
      }
    }
  }

  // USER ACTIONS
  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/admin/users/${userId}`, { role: newRole })
      toast.success('Đã thay đổi vai trò người dùng!')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thay đổi vai trò')
    }
  }

  const handleApprovePartner = async (userId) => {
    try {
      await axios.put(`/admin/users/${userId}`, { isApproved: true })
      toast.success('Đã duyệt tài khoản Partner!')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể duyệt Partner')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return

    try {
      await axios.delete(`/admin/users/${userId}`)
      toast.success('Đã xóa người dùng!')
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng')
    }
  }

  // REVIEW ACTIONS
  const handleApproveReview = async (reviewId) => {
    try {
      await axios.put(`/reviews/${reviewId}/moderate`, { isApproved: true })
      toast.success('Đã duyệt đánh giá!')
      fetchReviews()
    } catch (error) {
      toast.error('Không thể duyệt đánh giá')
    }
  }

  const handleRejectReview = async (reviewId) => {
    try {
      await axios.put(`/reviews/${reviewId}/moderate`, { isApproved: false })
      toast.success('Đã từ chối đánh giá!')
      fetchReviews()
    } catch (error) {
      toast.error('Không thể từ chối đánh giá')
    }
  }
  // CATEGORIES FETCH & ACTIONS
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/admin/categories/tree')
      const tree = res.data.tree || []
      // Flatten tree to show all categories
      const flattenTree = (items, result = []) => {
        items.forEach(item => {
          result.push(item)
          if (item.children && item.children.length > 0) {
            flattenTree(item.children, result)
          }
        })
        return result
      }
      setCategories(flattenTree(tree))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Không thể tải danh mục')
    }
  }

  // BRANDS FETCH & ACTIONS
  const fetchBrands = async () => {
    try {
      const res = await axios.get(`/admin/brands?page=${currentPage}&limit=12`)
      setBrands(res.data.brands || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      toast.error('Không thể tải thương hiệu')
    }
  }

  // ATTRIBUTES FETCH & ACTIONS
  const fetchAttributes = async () => {
    try {
      const res = await axios.get('/admin/attributes')
      setAttributes(res.data.attributes || [])
    } catch (error) {
      console.error('Failed to fetch attributes:', error)
      toast.error('Không thể tải thuộc tính')
    }
  }

  // SETTINGS FETCH & ACTIONS
  const fetchSettings = async () => {
    try {
      const res = await axios.get('/admin/settings')
      setSettings(res.data || {})
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Không thể tải cài đặt')
    }
  }
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-pro">
      {/* Professional Admin Header */}
      <header className="admin-pro-header">
        <div className="header-left">
          <div className="admin-badge">ADMIN</div>
          <div className="header-info">
            <h1>Control Panel</h1>
          </div>
        </div>
        <div className="header-right">
          <div className="admin-user-info">
            <span className="admin-name">{user?.username || user?.name}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FiBarChart2 />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FiUsers />
              <span>Users</span>
              <span className="badge">{dashboardStats?.stats?.totalUsers || 0}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <FiPackage />
              <span>Products</span>
              <span className="badge">{dashboardStats?.stats?.totalProducts || 0}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <FiGrid />
              <span>Danh mục</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'brands' ? 'active' : ''}`}
              onClick={() => setActiveTab('brands')}
            >
              <FiTag />
              <span>Thương hiệu</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'attributes' ? 'active' : ''}`}
              onClick={() => setActiveTab('attributes')}
            >
              <FiLayers />
              <span>Thuộc tính</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FiShoppingBag />
              <span>Orders</span>
              <span className="badge">{dashboardStats?.stats?.totalOrders || 0}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveTab('revenue')}
            >
              <FiDollarSign />
              <span>Revenue</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <FiEye />
              <span>Reviews</span>
              <span className="badge">{dashboardStats?.stats?.totalReviews || 0}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings />
              <span>Cài đặt</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-content">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && dashboardStats && (
            <div className="overview-tab-pro">
              {/* Key Metrics Grid */}
              <div className="metrics-grid-pro">
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">SYSTEM REVENUE</span>
                    <FiDollarSign className="metric-icon" />
                  </div>
                  <div className="metric-value">
                    {(dashboardStats?.stats?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                  </div>
                  <div className="metric-footer">All partners combined</div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">TOTAL ORDERS</span>
                    <FiShoppingBag className="metric-icon" />
                  </div>
                  <div className="metric-value">{dashboardStats?.stats?.totalOrders || 0}</div>
                  <div className="metric-footer">
                    Pending: {dashboardStats?.stats?.pendingOrders || 0} | Delivered:{' '}
                    {dashboardStats?.stats?.deliveredOrders || 0}
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">PRODUCTS</span>
                    <FiPackage className="metric-icon" />
                  </div>
                  <div className="metric-value">{dashboardStats?.stats?.totalProducts || 0}</div>
                  <div className="metric-footer">
                    Out of stock: {dashboardStats?.stats?.outOfStockProducts || 0} | Low:{' '}
                    {dashboardStats?.stats?.lowStockProducts || 0}
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">USERS</span>
                    <FiUsers className="metric-icon" />
                  </div>
                  <div className="metric-value">{dashboardStats?.stats?.totalUsers || 0}</div>
                  <div className="metric-footer">
                    Partners: {dashboardStats?.stats?.totalPartners || 0} | Clients:{' '}
                    {dashboardStats?.stats?.totalClients || 0}
                  </div>
                </div>
              </div>

              {/* Management Sections */}
              <div className="management-sections">
                <div className="section-card">
                  <div className="section-header">
                    <h3>Pending Actions</h3>
                    <button className="btn-link" onClick={() => setActiveTab('users')}>
                      View All →
                    </button>
                  </div>
                  <div className="action-list">
                    <div className="action-item">
                      <FiClock className="action-icon warning" />
                      <span>Partner approvals pending</span>
                      <span className="action-count">
                        {dashboardStats?.stats?.pendingPartners || 0}
                      </span>
                    </div>
                    <div className="action-item">
                      <FiClock className="action-icon warning" />
                      <span>Reviews awaiting approval</span>
                      <span className="action-count">
                        {dashboardStats?.stats?.pendingReviews || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <h3>System Alerts</h3>
                    <button className="btn-link" onClick={() => setActiveTab('products')}>
                      Manage →
                    </button>
                  </div>
                  <div className="action-list">
                    <div className="action-item">
                      <FiPackage className="action-icon danger" />
                      <span>Out of stock products</span>
                      <span className="action-count">
                        {dashboardStats?.stats?.outOfStockProducts || 0}
                      </span>
                    </div>
                    <div className="action-item">
                      <FiPackage className="action-icon warning" />
                      <span>Low stock alerts</span>
                      <span className="action-count">
                        {dashboardStats?.stats?.lowStockProducts || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="management-tab">
              <h2>Quản lý sản phẩm</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Giá</th>
                      <th>Tồn kho</th>
                      <th>Trạng thái</th>
                      <th>Người bán</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      // Get price from variants or fallback
                      const price = product.variants?.[0]?.price || product.price || 0
                      const stock =
                        product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ||
                        product.stock ||
                        0

                      return (
                        <tr key={product._id}>
                          <td>
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.name}
                              size="thumbnail"
                              className="table-img"
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>{price.toLocaleString()} VND</td>
                          <td>{stock}</td>
                          <td>
                            <span className={`status-badge ${product.status}`}>
                              {product.status === 'approved' && <FiCheckCircle />}
                              {product.status === 'pending' && <FiClock />}
                              {product.status === 'rejected' && <FiXCircle />}
                              {product.status}
                            </span>
                          </td>
                          <td>{product.seller?.name || 'N/A'}</td>
                          <td>
                            <div className="table-actions">
                              {product.status === 'pending' && (
                                <>
                                  <button
                                    className="btn-icon success"
                                    onClick={() => handleApproveProduct(product._id)}
                                    title="Approve"
                                  >
                                    <FiCheckCircle />
                                  </button>
                                  <button
                                    className="btn-icon danger"
                                    onClick={() => handleRejectProduct(product._id)}
                                    title="Reject"
                                  >
                                    <FiXCircle />
                                  </button>
                                </>
                              )}
                              <button
                                className="btn-icon"
                                onClick={() => navigate(`/product/${product._id}`)}
                                title="View"
                              >
                                <FiEye />
                              </button>
                              <button
                                className="btn-icon danger"
                                onClick={() => handleDeleteProduct(product._id)}
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="management-tab">
              <h2>Order Management</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày đặt</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order.orderNumber || order._id.slice(-8)}</td>
                        <td>{order.user?.name || 'N/A'}</td>
                        <td>{order.totalAmount?.toLocaleString() || 0} VND</td>
                        <td>
                          <select
                            className="status-select"
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipping</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => navigate(`/orders/${order._id}`)}
                          >
                            <FiEye /> Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="management-tab">
              <h2>Quản lý người dùng</h2>

              {/* Filter users */}
              <div
                className="user-filters"
                style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}
              >
                <button
                  className={`filter-btn ${currentPage === 1 ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentPage(1)
                    fetchUsers()
                  }}
                >
                  Tất cả
                </button>
                <button
                  className="filter-btn"
                  onClick={() => {
                    // Filter to show only pending partners
                    fetchUsers() // You can add query params here
                  }}
                >
                  Partner chờ duyệt
                </button>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Tên cửa hàng</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem._id}>
                        <td>{userItem.username || userItem.name || 'N/A'}</td>
                        <td>{userItem.email}</td>
                        <td>
                          <select
                            className="role-select"
                            value={userItem.role}
                            onChange={(e) => handleChangeUserRole(userItem._id, e.target.value)}
                            disabled={userItem._id === user.id}
                          >
                            <option value="client">Client</option>
                            <option value="partner">Partner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          {userItem.role === 'partner' ? (
                            <span>{userItem.shopName || 'Chưa có'}</span>
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                        <td>
                          {userItem.role === 'partner' ? (
                            userItem.isApproved ? (
                              <span className="status-badge approved">
                                <FiCheckCircle /> Đã duyệt
                              </span>
                            ) : (
                              <button
                                className="btn-icon success"
                                onClick={() => handleApprovePartner(userItem._id)}
                                title="Approve Partner"
                              >
                                <FiCheckCircle />
                              </button>
                            )
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{new Date(userItem.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDeleteUser(userItem._id)}
                            disabled={userItem._id === user.id}
                            title="Delete User"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVENUE TAB */}
          {activeTab === 'revenue' && (
            <div className="management-tab">
              <h2>💰 Doanh Thu Từng Partner (Admin View)</h2>
              <p className="tab-description">
                Xem tổng doanh thu, sản phẩm, và đơn hàng của từng đối tác. Click vào dòng để xem
                chi tiết biểu đồ.
              </p>
              <div className="table-container">
                <table className="admin-table partner-revenue-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Partner</th>
                      <th>Tên Shop</th>
                      <th>Email</th>
                      <th>Trạng thái</th>
                      <th>Sản phẩm</th>
                      <th>Đã bán</th>
                      <th>Đơn hàng</th>
                      <th>Doanh thu</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerRevenue.map((partner, index) => (
                      <tr
                        key={partner.partnerId}
                        className="clickable-row"
                        onClick={() => {
                          setSelectedPartnerId(partner.partnerId)
                          setShowRevenueModal(true)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{index + 1}</td>
                        <td>{partner.username}</td>
                        <td>
                          <strong>{partner.shopName || 'N/A'}</strong>
                        </td>
                        <td>{partner.email}</td>
                        <td>
                          {partner.isApproved ? (
                            <span className="status-badge approved">
                              <FiCheckCircle /> Đã duyệt
                            </span>
                          ) : (
                            <span className="status-badge pending">
                              <FiClock /> Chờ duyệt
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="product-stats">
                            <span>
                              {partner.activeProducts}/{partner.totalProducts}
                            </span>
                            <small>Hoạt động</small>
                          </div>
                        </td>
                        <td>
                          <strong>{partner.soldCount || 0}</strong> sp
                        </td>
                        <td>{partner.orderCount || 0}</td>
                        <td>
                          <span className="revenue-value">
                            {(partner.revenue || 0).toLocaleString()} VND
                          </span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn-view-detail"
                            onClick={() => {
                              setSelectedPartnerId(partner.partnerId)
                              setShowRevenueModal(true)
                            }}
                          >
                            <FiBarChart2 /> Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {partnerRevenue.length === 0 && (
                  <div className="no-data">
                    <p>Chưa có dữ liệu doanh thu</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Partner Revenue Detail Modal */}
          {showRevenueModal && selectedPartnerId && (
            <PartnerRevenueModal
              partnerId={selectedPartnerId}
              onClose={() => {
                setShowRevenueModal(false)
                setSelectedPartnerId(null)
              }}
            />
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="management-tab">
              <h2>Quản lý đánh giá</h2>
              <div className="reviews-grid">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card-admin">
                    <div className="review-header">
                      <div className="review-user">
                        <strong>{review.user?.name || 'Anonymous'}</strong>
                        <div className="review-rating">{'⭐'.repeat(review.rating)}</div>
                      </div>
                      <span
                        className={`review-status ${review.isApproved ? 'approved' : 'pending'}`}
                      >
                        {review.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </div>
                    <h4>{review.title}</h4>
                    <p>{review.comment}</p>
                    <div className="review-meta">
                      <span>Sản phẩm: {review.product?.name || 'N/A'}</span>
                      <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="table-actions">
                      {!review.isApproved && (
                        <button
                          className="btn-icon success"
                          onClick={() => handleApproveReview(review._id)}
                          title="Approve"
                        >
                          <FiCheckCircle />
                        </button>
                      )}
                      <button
                        className="btn-icon danger"
                        onClick={() => handleRejectReview(review._id)}
                        title="Reject"
                      >
                        <FiXCircle />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="management-tab">
              <h2>Quản lý Danh mục</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Slug</th>
                      <th>Level</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                          Chưa có danh mục nào
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category._id}>
                          <td><strong>{category.name}</strong></td>
                          <td>/{category.slug}</td>
                          <td>Level {category.level || 0}</td>
                          <td>
                            <span className={`status-badge ${category.isActive ? 'approved' : 'pending'}`}>
                              {category.isActive ? 'Hoạt động' : 'Ẩn'}
                            </span>
                          </td>
                          <td>{new Date(category.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BRANDS TAB */}
          {activeTab === 'brands' && (
            <div className="management-tab">
              <h2>Quản lý Thương hiệu</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Slug</th>
                      <th>Website</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                          Chưa có thương hiệu nào
                        </td>
                      </tr>
                    ) : (
                      brands.map((brand) => (
                        <tr key={brand._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {brand.logo && (
                                <img 
                                  src={brand.logo} 
                                  alt={brand.name}
                                  style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                                />
                              )}
                              <strong>{brand.name}</strong>
                            </div>
                          </td>
                          <td>/{brand.slug}</td>
                          <td>
                            {brand.website ? (
                              <a href={brand.website} target="_blank" rel="noopener noreferrer">
                                Link
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${brand.isActive ? 'approved' : 'pending'}`}>
                              {brand.isActive ? 'Hoạt động' : 'Ẩn'}
                            </span>
                          </td>
                          <td>{new Date(brand.createdAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ATTRIBUTES TAB */}
          {activeTab === 'attributes' && (
            <div className="management-tab">
              <h2>Quản lý Thuộc tính</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Slug</th>
                      <th>Loại</th>
                      <th>Số giá trị</th>
                      <th>Variant</th>
                      <th>Filterable</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributes.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                          Chưa có thuộc tính nào
                        </td>
                      </tr>
                    ) : (
                      attributes.map((attr) => (
                        <tr key={attr._id}>
                          <td><strong>{attr.name}</strong></td>
                          <td>/{attr.slug}</td>
                          <td>{attr.type}</td>
                          <td>{attr.values?.length || 0}</td>
                          <td>{attr.isVariant ? '✓' : '✗'}</td>
                          <td>{attr.isFilterable ? '✓' : '✗'}</td>
                          <td>
                            <span className={`status-badge ${attr.isActive ? 'approved' : 'pending'}`}>
                              {attr.isActive ? 'Hoạt động' : 'Ẩn'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="management-tab">
              <h2>Cài đặt Hệ thống</h2>
              {!settings ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>Đang tải cài đặt...</p>
                </div>
              ) : (
                <div className="settings-display">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
                    <div className="setting-item">
                      <strong>Tên website:</strong>
                      <p>{settings.siteName || 'Chưa cài đặt'}</p>
                    </div>
                    <div className="setting-item">
                      <strong>Email liên hệ:</strong>
                      <p>{settings.contactEmail || 'Chưa cài đặt'}</p>
                    </div>
                    <div className="setting-item">
                      <strong>Số điện thoại:</strong>
                      <p>{settings.contactPhone || 'Chưa cài đặt'}</p>
                    </div>
                    <div className="setting-item">
                      <strong>Địa chỉ:</strong>
                      <p>{settings.contactAddress || 'Chưa cài đặt'}</p>
                    </div>
                    <div className="setting-item">
                      <strong>Maintenance mode:</strong>
                      <p>{settings.maintenanceMode ? '✓ Bật' : '✗ Tắt'}</p>
                    </div>
                    <div className="setting-item">
                      <strong>COD enabled:</strong>
                      <p>{settings.codEnabled ? '✓ Bật' : '✗ Tắt'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && activeTab !== 'overview' && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? 'active' : ''}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
