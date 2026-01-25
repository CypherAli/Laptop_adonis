/**
 * ==================== ADMIN DASHBOARD COMPONENT ====================
 * 
 * PHÂN QUYỀN HỆ THỐNG:
 * - Admin Only: Full system management access
 * - All functions require role === 'admin'
 * - Manages users, products, orders, reviews across entire platform
 * 
 * CORE FUNCTIONS:
 * 1. Dashboard Statistics
 *    - dashboard() - GET /api/admin/dashboard
 *    - Stats: Users (clients/partners/admins), Products, Orders, Reviews
 *    - Revenue: Total from paid orders
 *    - Alerts: Pending partners, low stock, pending reviews
 * 
 * 2. User Management
 *    - getUsers() - GET /api/admin/users (filters: role, isActive, search)
 *    - approvePartner() - PUT /api/admin/partners/:userId/approve
 *    - rejectPartner() - PUT /api/admin/partners/:userId/reject
 *    - toggleUserStatus() - PUT /api/admin/users/:userId/toggle-status
 * 
 * 3. Product Management
 *    - getProducts() - GET /api/admin/products (filters: isActive, isFeatured, search)
 *    - toggleProductFeatured() - PUT /api/admin/products/:productId/toggle-featured
 * 
 * 4. Order Management
 *    - getOrders() - GET /api/admin/orders (all system orders)
 * 
 * 5. Review Moderation
 *    - getReviews() - GET /api/admin/reviews (filter by isApproved)
 *    - moderateReview() - PUT /api/admin/reviews/:reviewId/moderate
 * 
 * BACKEND LOGIC NOTES:
 * - Partner approval: isApproved flag toggle
 * - User status: isActive flag (active/locked account)
 * - Product featured: isFeatured flag for homepage display
 * - Review moderation: isApproved flag with moderatedBy and moderatedAt
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | users | products | orders | reviews

  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalPartners: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    pendingPartners: 0,
    totalRevenue: 0,
    pendingReviews: 0
  });

  // Lists
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [reviewApprovedFilter, setReviewApprovedFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [navigate, activeTab, currentPage, userRoleFilter, reviewApprovedFilter]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'dashboard') {
        await fetchDashboardStats();
      } else if (activeTab === 'users') {
        await fetchUsers();
      } else if (activeTab === 'products') {
        await fetchProducts();
      } else if (activeTab === 'orders') {
        await fetchOrders();
      } else if (activeTab === 'reviews') {
        await fetchReviews();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DASHBOARD ====================

  const fetchDashboardStats = async () => {
    const response = await axios.get('/api/admin/dashboard');
    setStats(response.data.stats);
  };

  // ==================== USERS ====================

  const fetchUsers = async () => {
    const params = {
      page: currentPage,
      limit: 20,
      ...(userRoleFilter && { role: userRoleFilter })
    };
    const response = await axios.get('/api/admin/users', { params });
    setUsers(response.data.users || []);
    setTotalPages(response.data.totalPages || 1);
  };

  const handleApprovePartner = async (userId) => {
    try {
      await axios.put(`/api/admin/partners/${userId}/approve`);
      setSuccess('Đã phê duyệt partner');
      await fetchUsers();
      await fetchDashboardStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi phê duyệt partner');
    }
  };

  const handleRejectPartner = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn thu hồi phê duyệt partner này?')) return;
    try {
      await axios.put(`/api/admin/partners/${userId}/reject`);
      setSuccess('Đã thu hồi phê duyệt');
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi thu hồi phê duyệt');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/toggle-status`);
      setSuccess('Đã cập nhật trạng thái tài khoản');
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // ==================== PRODUCTS ====================

  const fetchProducts = async () => {
    const params = { page: currentPage, limit: 20 };
    const response = await axios.get('/api/admin/products', { params });
    setProducts(response.data.products || []);
    setTotalPages(response.data.totalPages || 1);
  };

  const handleToggleFeatured = async (productId) => {
    try {
      await axios.put(`/api/admin/products/${productId}/toggle-featured`);
      setSuccess('Đã cập nhật trạng thái nổi bật');
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật sản phẩm');
    }
  };

  // ==================== ORDERS ====================

  const fetchOrders = async () => {
    const params = { page: currentPage, limit: 20 };
    const response = await axios.get('/api/admin/orders', { params });
    setOrders(response.data.orders || []);
    setTotalPages(response.data.totalPages || 1);
  };

  // ==================== REVIEWS ====================

  const fetchReviews = async () => {
    const params = {
      page: currentPage,
      limit: 20,
      ...(reviewApprovedFilter && { isApproved: reviewApprovedFilter })
    };
    const response = await axios.get('/api/admin/reviews', { params });
    setReviews(response.data.reviews || []);
    setTotalPages(response.data.totalPages || 1);
  };

  const handleModerateReview = async (reviewId, isApproved) => {
    try {
      await axios.put(`/api/admin/reviews/${reviewId}/moderate`, { isApproved });
      setSuccess(isApproved ? 'Đã phê duyệt đánh giá' : 'Đã từ chối đánh giá');
      await fetchReviews();
      await fetchDashboardStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi kiểm duyệt đánh giá');
    }
  };

  // ==================== HELPERS ====================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading && activeTab === 'dashboard') {
    return <div className="admin-loading">Đang tải...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Quản Trị Hệ Thống</h1>
        <p>Chào Admin {currentUser?.username}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ==================== TABS ==================== */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setCurrentPage(1); }}>
          Dashboard
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setCurrentPage(1); }}>
          Người Dùng
        </button>
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => { setActiveTab('products'); setCurrentPage(1); }}>
          Sản Phẩm
        </button>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => navigate('/admin/categories')}>
          Danh mục
        </button>
        <button className={`tab-btn ${activeTab === 'brands' ? 'active' : ''}`} onClick={() => navigate('/admin/brands')}>
          Thương hiệu
        </button>
        <button className={`tab-btn ${activeTab === 'attributes' ? 'active' : ''}`} onClick={() => navigate('/admin/attributes')}>
          Thuộc tính
        </button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); setCurrentPage(1); }}>
          Đơn Hàng
        </button>
        <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => { setActiveTab('reviews'); setCurrentPage(1); }}>
          Đánh Giá
        </button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => navigate('/admin/settings')}>
          Cài đặt
        </button>
      </div>

      {/* ==================== DASHBOARD TAB ==================== */}
      {activeTab === 'dashboard' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f6' }}>👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Tổng Người Dùng</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>👤</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalClients}</div>
              <div className="stat-label">Khách Hàng</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>🏪</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalPartners}</div>
              <div className="stat-label">Đối Tác</div>
            </div>
          </div>
          <div className="stat-card alert-card">
            <div className="stat-icon" style={{ background: '#ef4444' }}>⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingPartners}</div>
              <div className="stat-label">Chờ Phê Duyệt</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf6' }}>📦</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-label">Sản Phẩm</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ec4899' }}>📋</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-label">Đơn Hàng</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>⏰</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingOrders}</div>
              <div className="stat-label">Đơn Chờ Xử Lý</div>
            </div>
          </div>
          <div className="stat-card alert-card">
            <div className="stat-icon" style={{ background: '#ef4444' }}>⭐</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingReviews}</div>
              <div className="stat-label">Đánh Giá Chờ Duyệt</div>
            </div>
          </div>
          <div className="stat-card revenue-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>💰</div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
              <div className="stat-label">Tổng Doanh Thu</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== USERS TAB ==================== */}
      {activeTab === 'users' && (
        <div className="data-section">
          <div className="section-header">
            <h2>Quản Lý Người Dùng</h2>
            <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="filter-select">
              <option value="">Tất cả vai trò</option>
              <option value="client">Khách hàng</option>
              <option value="partner">Đối tác</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}{user.shopName && ` (${user.shopName})`}</td>
                    <td>{user.email}</td>
                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleToggleUserStatus(user._id)}>
                        {user.isActive ? 'Khóa' : 'Mở khóa'}
                      </button>
                      {user.role === 'partner' && !user.isApproved && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleApprovePartner(user._id)}>
                          Phê duyệt
                        </button>
                      )}
                      {user.role === 'partner' && user.isApproved && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleRejectPartner(user._id)}>
                          Thu hồi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== PRODUCTS TAB ==================== */}
      {activeTab === 'products' && (
        <div className="data-section">
          <div className="section-header">
            <h2>Quản Lý Sản Phẩm</h2>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Tên Sản Phẩm</th>
                  <th>Thương Hiệu</th>
                  <th>Người Tạo</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.brand}</td>
                    <td>{product.createdBy?.shopName || product.createdBy?.username}</td>
                    <td>
                      <span className={`badge ${product.isFeatured ? 'badge-warning' : 'badge-secondary'}`}>
                        {product.isFeatured ? 'Nổi bật' : 'Thường'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/products/${product._id}`)}>
                        Xem
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={() => handleToggleFeatured(product._id)}>
                        {product.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== ORDERS TAB ==================== */}
      {activeTab === 'orders' && (
        <div className="data-section">
          <div className="section-header">
            <h2>Quản Lý Đơn Hàng</h2>
          </div>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Tạo</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} onClick={() => navigate(`/orders/${order._id}`)} style={{ cursor: 'pointer' }}>
                    <td>#{order.orderNumber || order._id.slice(-8)}</td>
                    <td>{order.user?.username}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== REVIEWS TAB ==================== */}
      {activeTab === 'reviews' && (
        <div className="data-section">
          <div className="section-header">
            <h2>Kiểm Duyệt Đánh Giá</h2>
            <select value={reviewApprovedFilter} onChange={(e) => setReviewApprovedFilter(e.target.value)} className="filter-select">
              <option value="">Tất cả</option>
              <option value="false">Chờ duyệt</option>
              <option value="true">Đã duyệt</option>
            </select>
          </div>
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header-row">
                  <div>
                    <strong>{review.user?.username}</strong> - {review.product?.name}
                  </div>
                  <div className="review-rating">{'⭐'.repeat(review.rating)}</div>
                </div>
                <h4>{review.title}</h4>
                <p>{review.comment}</p>
                <div className="review-actions">
                  {!review.isApproved && (
                    <button className="btn btn-sm btn-primary" onClick={() => handleModerateReview(review._id, true)}>
                      Phê duyệt
                    </button>
                  )}
                  {review.isApproved && (
                    <button className="btn btn-sm btn-danger" onClick={() => handleModerateReview(review._id, false)}>
                      Thu hồi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== PAGINATION ==================== */}
      {activeTab !== 'dashboard' && totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
            Trang Trước
          </button>
          <span>Trang {currentPage} / {totalPages}</span>
          <button className="btn btn-secondary" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
            Trang Sau
          </button>
        </div>
      )}
    </div>
  );
}
