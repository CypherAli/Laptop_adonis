import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import AuthContext from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiPackage,
  FiBarChart2,
  FiGrid,
  FiTag,
  FiSettings,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiSave,
} from 'react-icons/fi'
import './AdminDashboard.clean.css'

// Separate components for better organization
const StatCard = ({ icon: Icon, title, value, change, changeLabel, colorClass }) => (
  <div className="stat-card-clean">
    <div className="stat-card-header">
      <div className={`stat-icon ${colorClass}`}>
        <Icon />
      </div>
    </div>
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value?.toLocaleString() || '0'}</div>
    {change && (
      <div className="stat-footer">
        <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <span className="stat-change-label">{changeLabel}</span>
      </div>
    )}
  </div>
)

const StatusBadge = ({ status }) => {
  const statusMap = {
    confirmed: { label: 'Confirmed', class: 'info' },
    processing: { label: 'Processing', class: 'warning' },
    delivered: { label: 'Delivered', class: 'success' },
    cancelled: { label: 'Cancelled', class: 'danger' },
    pending: { label: 'Pending', class: 'warning' },
    approved: { label: 'Approved', class: 'success' },
    rejected: { label: 'Rejected', class: 'danger' },
  }
  
  const badge = statusMap[status] || { label: status, class: 'gray' }
  
  return (
    <span className={`status-badge ${badge.class}`}>
      {badge.label}
    </span>
  )
}

const AdminDashboardClean = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardStats, setDashboardStats] = useState(null)

  // Data states
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [settings, setSettings] = useState({
    siteName: 'ShoeStore',
    siteDescription: '',
    siteLogo: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    maintenanceMode: false,
    maintenanceMessage: '',
    emailNotifications: true,
    orderConfirmationEmail: true,
    emailFromName: 'ShoeStore',
    emailFromAddress: '',
    minOrderAmount: 0,
    maxOrderAmount: 100000000,
    freeShippingThreshold: 500000,
    defaultShippingFee: 30000,
    codEnabled: true,
    bankTransferEnabled: true,
    defaultProductsPerPage: 12,
    maxProductImages: 10,
    allowGuestReviews: false,
    requireReviewApproval: true,
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    googleAnalyticsId: '',
    facebookPixelId: ''
  })
  const [settingsTab, setSettingsTab] = useState('site')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Chỉ Admin mới có quyền truy cập!')
      navigate('/')
      return
    }
    fetchDashboardData()
  }, [user, navigate, toast])

  useEffect(() => {
    setCurrentPage(1)
    if (activeTab === 'products') fetchProducts(1)
    else if (activeTab === 'orders') fetchOrders(1)
    else if (activeTab === 'users') fetchUsers(1)
    else if (activeTab === 'reviews') fetchReviews(1)
    else if (activeTab === 'categories') fetchCategories()
    else if (activeTab === 'brands') fetchBrands(1)
    else if (activeTab === 'settings') fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'products') fetchProducts(currentPage)
    else if (activeTab === 'orders') fetchOrders(currentPage)
    else if (activeTab === 'users') fetchUsers(currentPage)
    else if (activeTab === 'reviews') fetchReviews(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/admin/stats')
      setDashboardStats(res.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Không thể tải dữ liệu dashboard')
      setLoading(false)
    }
  }

  const fetchProducts = async (page = 1) => {
    try {
      const res = await axios.get(`/api/admin/products?page=${page}&limit=10`)
      setProducts(res.data.products || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm')
    }
  }

  const fetchOrders = async (page = 1) => {
    try {
      const res = await axios.get(`/api/admin/orders?page=${page}&limit=10`)
      setOrders(res.data.orders || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng')
    }
  }

  const fetchUsers = async (page = 1) => {
    try {
      const res = await axios.get(`/api/admin/users?page=${page}&limit=10`)
      setUsers(res.data.users || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng')
    }
  }

  const fetchReviews = async (page = 1) => {
    try {
      const res = await axios.get(`/api/admin/reviews?page=${page}&limit=10`)
      setReviews(res.data.reviews || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      toast.error('Không thể tải danh sách đánh giá')
    }
  }

  // Action handlers
  const handleToggleFeatured = async (productId, currentStatus) => {
    try {
      await axios.put(`/api/admin/products/${productId}/toggle-featured`)
      toast.success(currentStatus ? 'Đã bỏ nổi bật' : 'Đã đánh dấu nổi bật')
      fetchProducts(currentPage)
    } catch (error) {
      toast.error('Không thể cập nhật sản phẩm')
    }
  }

  const handleApprovePartner = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/approve`)
      toast.success('Đã duyệt Partner thành công!')
      fetchUsers(currentPage)
    } catch (error) {
      toast.error('Không thể duyệt Partner')
    }
  }

  const handleToggleUserStatus = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/toggle-status`)
      toast.success('Đã cập nhật trạng thái người dùng')
      fetchUsers(currentPage)
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const handleModerateReview = async (reviewId, isApproved) => {
    try {
      await axios.put(`/api/admin/reviews/${reviewId}/moderate`, { isApproved })
      toast.success(isApproved ? 'Đã duyệt đánh giá' : 'Đã từ chối đánh giá')
      fetchReviews(currentPage)
    } catch (error) {
      toast.error('Không thể cập nhật đánh giá')
    }
  }

  // Categories functions
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories/tree')
      const flattenTree = (items, result = [], level = 0) => {
        items.forEach(item => {
          result.push({ ...item, level })
          if (item.children && item.children.length > 0) {
            flattenTree(item.children, result, level + 1)
          }
        })
        return result
      }
      setCategories(flattenTree(res.data.tree || []))
    } catch (error) {
      toast.error('Không thể tải danh mục')
    }
  }

  const handleToggleCategoryActive = async (categoryId) => {
    try {
      await axios.put(`/api/admin/categories/${categoryId}/toggle-active`)
      toast.success('Đã cập nhật trạng thái danh mục')
      fetchCategories()
    } catch (error) {
      toast.error('Không thể cập nhật danh mục')
    }
  }

  // Brands functions
  const fetchBrands = async (page = 1) => {
    try {
      const res = await axios.get(`/api/admin/brands?page=${page}&limit=10`)
      setBrands(res.data.brands || [])
      setTotalPages(res.data.totalPages || 1)
    } catch (error) {
      toast.error('Không thể tải thương hiệu')
    }
  }

  const handleToggleBrandActive = async (brandId) => {
    try {
      await axios.put(`/api/admin/brands/${brandId}/toggle-active`)
      toast.success('Đã cập nhật trạng thái thương hiệu')
      fetchBrands(currentPage)
    } catch (error) {
      toast.error('Không thể cập nhật thương hiệu')
    }
  }

  // Settings functions
  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/admin/settings')
      if (res.data) {
        // Merge with defaults to ensure no null/undefined values
        setSettings(prevSettings => ({
          ...prevSettings,
          ...Object.fromEntries(
            Object.entries(res.data).map(([key, value]) => [
              key,
              value ?? prevSettings[key] ?? ''
            ])
          )
        }))
      }
    } catch (error) {
      toast.error('Không thể tải cài đặt')
    }
  }

  const handleUpdateSettings = async (e) => {
    e.preventDefault()
    try {
      await axios.put('/api/admin/settings', settings)
      toast.success('Đã cập nhật cài đặt thành công!')
    } catch (error) {
      toast.error('Không thể cập nhật cài đặt')
    }
  }

  if (loading) {
    return (
      <div className="admin-loading-clean">
        <div className="spinner-clean"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  const stats = dashboardStats?.stats || {}

  return (
    <div className="admin-dashboard-clean">
      {/* Header */}
      <header className="admin-header-clean">
        <div className="admin-header-left">
          <div className="admin-logo">ShoeStore</div>
          <div className="admin-title">Administration</div>
        </div>
        <div className="admin-header-right">
          <div className="admin-user-badge">
            <div className="admin-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-user-details">
              <div className="admin-username">{user?.username || 'Admin'}</div>
              <div className="admin-role-tag">Administrator</div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="admin-layout-clean">
        {/* Sidebar */}
        <aside className="admin-sidebar-clean">
          <nav className="sidebar-nav-clean">
            <div className="nav-section-title">Overview</div>
            <button
              className={`nav-item-clean ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FiBarChart2 />
              <span>Dashboard</span>
            </button>

            <div className="nav-section-title">Management</div>
            <button
              className={`nav-item-clean ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FiUsers />
              <span>Users</span>
              <span className="nav-badge">{stats.totalUsers || 0}</span>
            </button>
            <button
              className={`nav-item-clean ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <FiPackage />
              <span>Products</span>
              <span className="nav-badge">{stats.totalProducts || 0}</span>
            </button>
            <button
              className="nav-item-clean"
              onClick={() => navigate('/manager')}
              title="Go to Product Manager"
            >
              <FiGrid />
              <span>Product Manager</span>
            </button>
            <button
              className={`nav-item-clean ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FiShoppingBag />
              <span>Orders</span>
              <span className="nav-badge">{stats.totalOrders || 0}</span>
            </button>
            <button
              className={`nav-item-clean ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <FiMessageSquare />
              <span>Reviews</span>
              <span className="nav-badge">{stats.totalReviews || 0}</span>
            </button>

            <div className="nav-section-title">Catalog</div>
            <button
              className={`nav-item-clean ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <FiGrid />
              <span>Categories</span>
            </button>
            <button
              className={`nav-item-clean ${activeTab === 'brands' ? 'active' : ''}`}
              onClick={() => setActiveTab('brands')}
            >
              <FiTag />
              <span>Brands</span>
            </button>

            <div className="nav-section-title">System</div>
            <button
              className={`nav-item-clean ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-content-clean">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="stats-grid-clean">
                <StatCard
                  icon={FiDollarSign}
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  colorClass="green"
                />
                <StatCard
                  icon={FiShoppingBag}
                  title="Total Orders"
                  value={stats.totalOrders}
                  colorClass="blue"
                />
                <StatCard
                  icon={FiPackage}
                  title="Products"
                  value={stats.totalProducts}
                  colorClass="purple"
                />
                <StatCard
                  icon={FiUsers}
                  title="Users"
                  value={stats.totalUsers}
                  colorClass="cyan"
                />
              </div>

              {/* Quick Stats */}
              <div className="stats-grid-clean" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <StatCard
                  icon={FiAlertCircle}
                  title="Out of Stock"
                  value={stats.outOfStockProducts}
                  colorClass="red"
                />
                <StatCard
                  icon={FiClock}
                  title="Low Stock"
                  value={stats.lowStockProducts}
                  colorClass="orange"
                />
                <StatCard
                  icon={FiUsers}
                  title="Pending Partners"
                  value={stats.pendingPartners}
                  colorClass="orange"
                />
                <StatCard
                  icon={FiMessageSquare}
                  title="Pending Reviews"
                  value={stats.pendingReviews}
                  colorClass="blue"
                />
                <StatCard
                  icon={FiCheckCircle}
                  title="Delivered Orders"
                  value={stats.deliveredOrders}
                  colorClass="green"
                />
                <StatCard
                  icon={FiClock}
                  title="Pending Orders"
                  value={stats.pendingOrders}
                  colorClass="orange"
                />
              </div>

              {/* Alerts Section */}
              {(stats.pendingPartners > 0 || stats.lowStockProducts > 0) && (
                <div className="data-section-clean">
                  <div className="data-section-header">
                    <h3 className="data-section-title">
                      <FiAlertCircle />
                      Requires Attention
                    </h3>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    {stats.pendingPartners > 0 && (
                      <div style={{ padding: '0.75rem', background: 'var(--admin-gray-50)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <strong>{stats.pendingPartners}</strong> partner approval{stats.pendingPartners > 1 ? 's' : ''} pending
                      </div>
                    )}
                    {stats.lowStockProducts > 0 && (
                      <div style={{ padding: '0.75rem', background: 'var(--admin-gray-50)', borderRadius: '8px' }}>
                        <strong>{stats.lowStockProducts}</strong> product{stats.lowStockProducts > 1 ? 's' : ''} low on stock
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'products' && (
            <div className="data-section-clean">
              <div className="data-section-header">
                <h3 className="data-section-title">
                  <FiPackage />
                  Products Management
                </h3>
              </div>
              <table className="data-table-clean">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state-clean">
                          <div className="empty-state-icon"><FiPackage /></div>
                          <div className="empty-state-text">No products found</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id}>
                        <td className="text-bold">{product.name}</td>
                        <td className="text-muted">{product.brand}</td>
                        <td>
                          {product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0}
                        </td>
                        <td>{product.basePrice?.toLocaleString()}đ</td>
                        <td>
                          {product.isFeatured ? (
                            <span className="status-badge success">Featured</span>
                          ) : (
                            <span className="status-badge gray">Normal</span>
                          )}
                        </td>
                        <td>
                          <div className="actions-group">
                            <button
                              className="btn-clean btn-sm btn-secondary"
                              onClick={() => handleToggleFeatured(product._id, product.isFeatured)}
                            >
                              {product.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination-clean">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="data-section-clean">
              <div className="data-section-header">
                <h3 className="data-section-title">
                  <FiShoppingBag />
                  Orders Management
                </h3>
              </div>
              <table className="data-table-clean">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state-clean">
                          <div className="empty-state-icon"><FiShoppingBag /></div>
                          <div className="empty-state-text">No orders found</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id}>
                        <td className="text-bold">#{order._id.slice(-8)}</td>
                        <td>{order.user?.username || order.user?.email || 'N/A'}</td>
                        <td>{order.totalAmount?.toLocaleString()}đ</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td className="text-muted text-sm">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination-clean">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="data-section-clean">
              <div className="data-section-header">
                <h3 className="data-section-title">
                  <FiUsers />
                  Users Management
                </h3>
              </div>
              <table className="data-table-clean">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state-clean">
                          <div className="empty-state-icon"><FiUsers /></div>
                          <div className="empty-state-text">No users found</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id}>
                        <td className="text-bold">{u.username}</td>
                        <td className="text-muted text-sm">{u.email}</td>
                        <td>
                          <span className={`status-badge ${u.role === 'admin' ? 'danger' : u.role === 'partner' ? 'info' : 'gray'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.role === 'partner' && !u.isApproved ? (
                            <span className="status-badge warning">Pending</span>
                          ) : u.isActive === false ? (
                            <span className="status-badge danger">Inactive</span>
                          ) : (
                            <span className="status-badge success">Active</span>
                          )}
                        </td>
                        <td>
                          <div className="actions-group">
                            {u.role === 'partner' && !u.isApproved && (
                              <button
                                className="btn-clean btn-sm btn-success"
                                onClick={() => handleApprovePartner(u._id)}
                              >
                                Approve
                              </button>
                            )}
                            <button
                              className="btn-clean btn-sm btn-secondary"
                              onClick={() => handleToggleUserStatus(u._id)}
                            >
                              {u.isActive === false ? 'Activate' : 'Deactivate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination-clean">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="data-section-clean">
              <div className="data-section-header">
                <h3 className="data-section-title">
                  <FiMessageSquare />
                  Reviews Management
                </h3>
              </div>
              <table className="data-table-clean">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Product</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state-clean">
                          <div className="empty-state-icon"><FiMessageSquare /></div>
                          <div className="empty-state-text">No reviews found</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review._id}>
                        <td>{review.user?.username || 'Anonymous'}</td>
                        <td className="text-muted text-sm">{review.product?.name || 'N/A'}</td>
                        <td>
                          <span style={{ color: '#f59e0b' }}>★</span> {review.rating}/5
                        </td>
                        <td>
                          <div style={{ maxWidth: '300px' }}>
                            <strong>{review.title}</strong>
                            <div style={{ 
                              fontSize: '0.875rem', 
                              color: '#6b7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {review.comment}
                            </div>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={review.isApproved ? 'approved' : 'pending'} />
                        </td>
                        <td>
                          <div className="actions-group">
                            {!review.isApproved && (
                              <button
                                className="btn-clean btn-sm btn-success"
                                onClick={() => handleModerateReview(review._id, true)}
                              >
                                Approve
                              </button>
                            )}
                            <button
                              className="btn-clean btn-sm btn-danger"
                              onClick={() => handleModerateReview(review._id, false)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination-clean">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'categories' || activeTab === 'brands' || activeTab === 'settings') && (
            <div className="data-section-clean">
              <div className="data-section-header">
                <h3 className="data-section-title">
                  {activeTab === 'categories' && <><FiGrid /> Categories Management</>}
                  {activeTab === 'brands' && <><FiTag /> Brands Management</>}
                  {activeTab === 'settings' && <><FiSettings /> System Settings</>}
                </h3>
              </div>
              
              {/* Categories Content */}
              {activeTab === 'categories' && (
                <table className="data-table-clean">
                  <thead>
                    <tr>
                      <th style={{width: '40%'}}>Category Name</th>
                      <th>Slug</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>
                          No categories found
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category._id}>
                          <td>
                            <div style={{ 
                              paddingLeft: `${category.level * 24}px`, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px' 
                            }}>
                              {category.level > 0 && <span style={{color: '#94a3b8'}}>└─</span>}
                              <span style={{ fontWeight: category.level === 0 ? '600' : '400' }}>
                                {category.name}
                              </span>
                            </div>
                          </td>
                          <td><span className="badge-clean">{category.slug}</span></td>
                          <td>{category.productCount || 0} products</td>
                          <td>
                            <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="action-btn-clean"
                              onClick={() => handleToggleCategoryActive(category._id)}
                            >
                              {category.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Brands Content */}
              {activeTab === 'brands' && (
                <>
                  <table className="data-table-clean">
                    <thead>
                      <tr>
                        <th style={{width: '10%'}}>Logo</th>
                        <th style={{width: '25%'}}>Brand Name</th>
                        <th>Slug</th>
                        <th>Products</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>
                            No brands found
                          </td>
                        </tr>
                      ) : (
                        brands.map((brand) => {
                          const hasValidLogo = brand.logo && (brand.logo.startsWith('http://') || brand.logo.startsWith('https://') || brand.logo.startsWith('/'))
                          return (
                          <tr key={brand._id}>
                            <td>
                              <div className="brand-logo-cell" style={{position: 'relative'}}>
                                {hasValidLogo && (
                                  <img 
                                    src={brand.logo} 
                                    alt={brand.name} 
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      objectFit: 'contain',
                                      borderRadius: '4px'
                                    }} 
                                    onLoad={(e) => {
                                      const placeholder = e.target.nextElementSibling
                                      if (placeholder) placeholder.style.display = 'none'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                      const placeholder = e.target.nextElementSibling
                                      if (placeholder) placeholder.style.display = 'flex'
                                    }}
                                  />
                                )}
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  background: '#f1f5f9',
                                  borderRadius: '4px',
                                  display: hasValidLogo ? 'none' : 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#94a3b8'
                                }}>
                                  <FiPackage size={20} />
                                </div>
                              </div>
                            </td>
                            <td><strong>{brand.name}</strong></td>
                            <td><span className="badge-clean">{brand.slug}</span></td>
                            <td>{brand.productCount || 0} products</td>
                            <td>
                              <span className={`status-badge ${brand.isActive ? 'active' : 'inactive'}`}>
                                {brand.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="action-btn-clean"
                                onClick={() => handleToggleBrandActive(brand._id)}
                              >
                                {brand.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <div className="pagination-clean">
                      <button
                        className="pagination-btn"
                        onClick={() => {
                          setCurrentPage(currentPage - 1)
                          fetchBrands(currentPage - 1)
                        }}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={() => {
                          setCurrentPage(currentPage + 1)
                          fetchBrands(currentPage + 1)
                        }}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Settings Content */}
              {activeTab === 'settings' && (
                <div className="settings-wrapper">
                  {/* Settings Tabs */}
                  <div className="settings-tabs">
                    <button 
                      className={`settings-tab ${settingsTab === 'site' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('site')}
                    >
                      <FiGlobe /> Site Info
                    </button>
                    <button 
                      className={`settings-tab ${settingsTab === 'email' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('email')}
                    >
                      <FiMessageSquare /> Email
                    </button>
                    <button 
                      className={`settings-tab ${settingsTab === 'order' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('order')}
                    >
                      <FiShoppingBag /> Orders
                    </button>
                    <button 
                      className={`settings-tab ${settingsTab === 'product' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('product')}
                    >
                      <FiPackage /> Products
                    </button>
                    <button 
                      className={`settings-tab ${settingsTab === 'social' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('social')}
                    >
                      <FiUsers /> Social
                    </button>
                    <button 
                      className={`settings-tab ${settingsTab === 'seo' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('seo')}
                    >
                      <FiBarChart2 /> SEO
                    </button>
                  </div>

                  <form onSubmit={handleUpdateSettings} className="settings-form-clean">
                    {/* Site Info Tab */}
                    {settingsTab === 'site' && (
                      <div className="settings-section">
                        <h4><FiGlobe /> Website Information</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Site Name *</label>
                            <input 
                              type="text" 
                              value={settings.siteName}
                              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                              required
                              placeholder="Enter your site name"
                            />
                          </div>
                          <div className="form-group">
                            <label>Site Logo URL</label>
                            <input 
                              type="text" 
                              value={settings.siteLogo}
                              onChange={(e) => setSettings({...settings, siteLogo: e.target.value})}
                              placeholder="https://example.com/logo.png"
                            />
                          </div>
                          <div className="form-group">
                            <label>Contact Email</label>
                            <input 
                              type="email" 
                              value={settings.contactEmail}
                              onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                              placeholder="contact@example.com"
                            />
                          </div>
                          <div className="form-group">
                            <label>Contact Phone</label>
                            <input 
                              type="tel" 
                              value={settings.contactPhone}
                              onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                              placeholder="+84 123 456 789"
                            />
                          </div>
                          <div className="form-group full-width">
                            <label>Site Description</label>
                            <textarea 
                              value={settings.siteDescription}
                              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                              rows="3"
                              placeholder="Brief description of your website"
                            />
                          </div>
                          <div className="form-group full-width">
                            <label>Address</label>
                            <input 
                              type="text" 
                              value={settings.address}
                              onChange={(e) => setSettings({...settings, address: e.target.value})}
                              placeholder="Physical store address"
                            />
                          </div>
                          <div className="form-group full-width">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                              />
                              <span>Enable Maintenance Mode</span>
                            </label>
                            {settings.maintenanceMode && (
                              <textarea 
                                value={settings.maintenanceMessage}
                                onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                                rows="2"
                                placeholder="Maintenance message to display"
                                style={{marginTop: '8px'}}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email Settings Tab */}
                    {settingsTab === 'email' && (
                      <div className="settings-section">
                        <h4><FiMessageSquare /> Email Configuration</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Email From Name</label>
                            <input 
                              type="text" 
                              value={settings.emailFromName}
                              onChange={(e) => setSettings({...settings, emailFromName: e.target.value})}
                              placeholder="Your Store Name"
                            />
                          </div>
                          <div className="form-group">
                            <label>Email From Address</label>
                            <input 
                              type="email" 
                              value={settings.emailFromAddress}
                              onChange={(e) => setSettings({...settings, emailFromAddress: e.target.value})}
                              placeholder="noreply@example.com"
                            />
                          </div>
                          <div className="form-group full-width">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                              />
                              <span>Enable Email Notifications</span>
                            </label>
                          </div>
                          <div className="form-group full-width">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={settings.orderConfirmationEmail}
                                onChange={(e) => setSettings({...settings, orderConfirmationEmail: e.target.checked})}
                              />
                              <span>Send Order Confirmation Emails</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Settings Tab */}
                    {settingsTab === 'order' && (
                      <div className="settings-section">
                        <h4><FiShoppingBag /> Order Configuration</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Minimum Order Amount (VND)</label>
                            <input 
                              type="number" 
                              value={settings.minOrderAmount}
                              onChange={(e) => setSettings({...settings, minOrderAmount: parseInt(e.target.value) || 0})}
                              min="0"
                            />
                          </div>
                          <div className="form-group">
                            <label>Maximum Order Amount (VND)</label>
                            <input 
                              type="number" 
                              value={settings.maxOrderAmount}
                              onChange={(e) => setSettings({...settings, maxOrderAmount: parseInt(e.target.value) || 0})}
                              min="0"
                            />
                          </div>
                          <div className="form-group">
                            <label>Free Shipping Threshold (VND)</label>
                            <input 
                              type="number" 
                              value={settings.freeShippingThreshold}
                              onChange={(e) => setSettings({...settings, freeShippingThreshold: parseInt(e.target.value) || 0})}
                              min="0"
                            />
                            <small>Orders above this amount get free shipping</small>
                          </div>
                          <div className="form-group">
                            <label>Default Shipping Fee (VND)</label>
                            <input 
                              type="number" 
                              value={settings.defaultShippingFee}
                              onChange={(e) => setSettings({...settings, defaultShippingFee: parseInt(e.target.value) || 0})}
                              min="0"
                            />
                          </div>
                          <div className="form-group">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={settings.codEnabled}
                                onChange={(e) => setSettings({...settings, codEnabled: e.target.checked})}
                              />
                              <span>Enable Cash on Delivery (COD)</span>
                            </label>
                          </div>
                          <div className="form-group">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={settings.bankTransferEnabled}
                                onChange={(e) => setSettings({...settings, bankTransferEnabled: e.target.checked})}
                              />
                              <span>Enable Bank Transfer</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Product Settings Tab */}
                    {settingsTab === 'product' && (
                      <div className="settings-section">
                        <h4><FiPackage /> Product Configuration</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Products Per Page</label>
                            <input 
                              type="number" 
                              value={settings.defaultProductsPerPage}
                              onChange={(e) => setSettings({...settings, defaultProductsPerPage: parseInt(e.target.value) || 12})}
                              min="1"
                              max="100"
                            />
                          </div>
                          <div className="form-group">
                            <label>Max Product Images</label>
                            <input 
                              type="number" 
                              value={settings.maxProductImages}
                              onChange={(e) => setSettings({...settings, maxProductImages: parseInt(e.target.value) || 10})}
                              min="1"
                              max="50"
                            />
                          </div>
                          <div className="form-group full-width">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={settings.allowGuestReviews}
                                onChange={(e) => setSettings({...settings, allowGuestReviews: e.target.checked})}
                              />
                              <span>Allow Guest Reviews (without login)</span>
                            </label>
                          </div>
                          <div className="form-group full-width">
                            <label className="checkbox-label">
                              <input 
                                type="checkbox" 
                                checked={settings.requireReviewApproval}
                                onChange={(e) => setSettings({...settings, requireReviewApproval: e.target.checked})}
                              />
                              <span>Require Review Approval Before Publishing</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Links Tab */}
                    {settingsTab === 'social' && (
                      <div className="settings-section">
                        <h4><FiUsers /> Social Media Links</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Facebook URL</label>
                            <input 
                              type="url" 
                              value={settings.facebookUrl}
                              onChange={(e) => setSettings({...settings, facebookUrl: e.target.value})}
                              placeholder="https://facebook.com/yourpage"
                            />
                          </div>
                          <div className="form-group">
                            <label>Instagram URL</label>
                            <input 
                              type="url" 
                              value={settings.instagramUrl}
                              onChange={(e) => setSettings({...settings, instagramUrl: e.target.value})}
                              placeholder="https://instagram.com/yourprofile"
                            />
                          </div>
                          <div className="form-group">
                            <label>Twitter URL</label>
                            <input 
                              type="url" 
                              value={settings.twitterUrl}
                              onChange={(e) => setSettings({...settings, twitterUrl: e.target.value})}
                              placeholder="https://twitter.com/yourhandle"
                            />
                          </div>
                          <div className="form-group">
                            <label>YouTube URL</label>
                            <input 
                              type="url" 
                              value={settings.youtubeUrl}
                              onChange={(e) => setSettings({...settings, youtubeUrl: e.target.value})}
                              placeholder="https://youtube.com/yourchannel"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SEO Settings Tab */}
                    {settingsTab === 'seo' && (
                      <div className="settings-section">
                        <h4><FiBarChart2 /> SEO & Analytics</h4>
                        <div className="form-grid">
                          <div className="form-group full-width">
                            <label>Meta Title</label>
                            <input 
                              type="text" 
                              value={settings.metaTitle}
                              onChange={(e) => setSettings({...settings, metaTitle: e.target.value})}
                              placeholder="Your Site - Best Shoes Online"
                              maxLength="60"
                            />
                            <small>{settings.metaTitle.length}/60 characters</small>
                          </div>
                          <div className="form-group full-width">
                            <label>Meta Description</label>
                            <textarea 
                              value={settings.metaDescription}
                              onChange={(e) => setSettings({...settings, metaDescription: e.target.value})}
                              rows="3"
                              placeholder="Description for search engines"
                              maxLength="160"
                            />
                            <small>{settings.metaDescription.length}/160 characters</small>
                          </div>
                          <div className="form-group full-width">
                            <label>Meta Keywords</label>
                            <input 
                              type="text" 
                              value={settings.metaKeywords}
                              onChange={(e) => setSettings({...settings, metaKeywords: e.target.value})}
                              placeholder="shoes, sneakers, footwear"
                            />
                            <small>Separate keywords with commas</small>
                          </div>
                          <div className="form-group">
                            <label>Google Analytics ID</label>
                            <input 
                              type="text" 
                              value={settings.googleAnalyticsId}
                              onChange={(e) => setSettings({...settings, googleAnalyticsId: e.target.value})}
                              placeholder="G-XXXXXXXXXX"
                            />
                          </div>
                          <div className="form-group">
                            <label>Facebook Pixel ID</label>
                            <input 
                              type="text" 
                              value={settings.facebookPixelId}
                              onChange={(e) => setSettings({...settings, facebookPixelId: e.target.value})}
                              placeholder="123456789012345"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="settings-actions">
                      <button type="submit" className="btn-primary-clean">
                        <FiSave /> Save Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardClean
