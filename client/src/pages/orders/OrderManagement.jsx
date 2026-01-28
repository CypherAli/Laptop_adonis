import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './OrderManagement.css'

/**
 * ============================================
 * ORDER MANAGEMENT SYSTEM - REACT TEMPLATE
 * ============================================
 * 
 * PHÂN QUYỀN HỆ THỐNG:
 * 
 * 1. ADMIN (Backend Only):
 *    - Quản lý toàn bộ cấu hình, nội dung hệ thống
 *    - Không sử dụng giao diện này (có admin dashboard riêng)
 *    - Có quyền cao nhất để debug/fix data
 * 
 * 2. PARTNER/SELLER (Frontend - Shop Owner):
 *    - Xem orders có sản phẩm của họ
 *    - Cập nhật trạng thái đơn hàng (confirmed → shipped)
 *    - KHÔNG được hủy đơn
 *    - KHÔNG được xem orders của shop khác
 * 
 * 3. USER/CUSTOMER (Frontend - Người mua):
 *    - Xem orders của chính họ
 *    - Tạo order mới
 *    - Hủy đơn hàng (nếu chưa shipped)
 *    - KHÔNG được đổi trạng thái
 * 
 * 4. GUEST (Frontend - Chưa đăng nhập):
 *    - KHÔNG truy cập được trang này
 *    → Redirect về /login
 * 
 * DATA SNAPSHOT PATTERN:
 * - Order items lưu SNAPSHOT (name, price, sellerName...) tại thời điểm mua
 * - LÝ DO: Hóa đơn phải BẤT BIẾN theo chuẩn kế toán
 * - Nếu seller đổi tên → order cũ VẪN hiển thị tên lúc mua (ĐÚNG pháp lý)
 * - Không populate từ Product/User → tránh data bị thay đổi
 * 
 * 5 CORE FUNCTIONS:
 * 1. fetchOrders() - GET /api/orders - List với pagination
 * 2. fetchOrderDetail() - GET /api/orders/:id - Chi tiết 1 order
 * 3. createOrder() - POST /api/orders - Tạo order mới + transaction
 * 4. updateOrderStatus() - PATCH /api/orders/:id/status - Partner/Admin only
 * 5. cancelOrder() - POST /api/orders/:id/cancel - Customer/Admin only + refund
 */

const OrderManagement = () => {
  // ==================== STATE MANAGEMENT ====================
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Pagination & Filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalOrders: 0,
  })
  const [filters, setFilters] = useState({
    status: '', // pending, confirmed, processing, shipped, delivered, cancelled
  })

  // Form states
  const [createMode, setCreateMode] = useState(false)
  const [newOrder, setNewOrder] = useState({
    items: [],
    shippingAddress: {
      fullName: '',
      phone: '',
      address: { street: '', district: '', city: '' },
    },
    paymentMethod: 'cod',
    notes: '',
  })

  // ==================== LOAD USER FROM LOCALSTORAGE ====================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user && user.id) {
      setCurrentUser(user)
      console.log('User loaded:', { id: user.id, role: user.role, name: user.fullName })
    } else {
      console.log('No user found in localStorage')
    }
  }, [])

  // ==================== PERMISSION CHECKS ====================
  /**
   * hasPermission() - Kiểm tra quyền theo ROLE
   * 
   * LƯU Ý: Component này là cho FRONTEND users (Partner + Customer)
   * Admin có dashboard riêng, nhưng vẫn có full permission để debug
   * 
   * CUSTOMER (role: 'customer') - NGƯỜI MUA:
   *   - VIEW_OWN_ORDERS - Xem đơn hàng của họ
   *   - CREATE_ORDER - Đặt hàng mới
   *   - CANCEL_ORDER - Hủy đơn (nếu chưa shipped)
   *   - UPDATE_ORDER_STATUS - KHÔNG đổi trạng thái
   * 
   * PARTNER/SELLER (role: 'partner') - CHỦ SHOP:
   *   - VIEW_OWN_ORDERS - Xem đơn có sản phẩm của shop họ
   *   - CREATE_ORDER - Đặt hàng (nếu họ cũng mua)
   *   - UPDATE_ORDER_STATUS - Đổi status: confirmed → processing → shipped
   *   - CANCEL_ORDER - KHÔNG được hủy (chỉ customer/admin)
   * 
   * ADMIN (role: 'admin') - QUẢN TRỊ (Backend):
   *   - Thông thường KHÔNG dùng giao diện này
   *   - Full permissions (để debug/support)
   *   - Có admin dashboard riêng với nhiều tính năng hơn
   */
  const hasPermission = useCallback((action) => {
    if (!currentUser) {
      console.log('❌ Permission denied: No user logged in')
      return false
    }

    const permissions = {
      VIEW_OWN_ORDERS: true, // TẤT CẢ users
      UPDATE_ORDER_STATUS: ['admin', 'partner'].includes(currentUser.role), // Admin + Partner
      CREATE_ORDER: true, // TẤT CẢ users
      // CANCEL_ORDER: Không dùng hasPermission!
      // Backend check ownership (order.user === userId || isAdmin), không check role
      // → Xem canCancelOrder() bên dưới
    }

    const hasAccess = permissions[action] || false
    console.log(`Permission Check: ${action} | Role: ${currentUser.role} | Result: ${hasAccess ? 'GRANTED' : 'DENIED'}`)
    
    return hasAccess
  }, [currentUser])

  /**
   * canCancelOrder() - Check quyền hủy order dựa trên OWNERSHIP
   * Backend logic (line 366): order.user === userId || role === 'admin'
   * 
   * KHÔNG PHỤ THUỘC ROLE!
   * - Partner mua hàng → có thể hủy đơn của họ
   * - Customer mua hàng → có thể hủy đơn của họ
   * - Admin → có thể hủy bất kỳ đơn nào
   */
  const canCancelOrder = useCallback((order) => {
    if (!currentUser) return false
    
    const isOwner = order.user?._id === currentUser.id || order.user === currentUser.id
    const isAdmin = currentUser.role === 'admin'
    
    const canCancel = isOwner || isAdmin
    console.log(`Can Cancel Check: Order ${order._id} | isOwner: ${isOwner} | isAdmin: ${isAdmin} | Result: ${canCancel}`)
    
    return canCancel
  }, [currentUser])

  /**
   * canAccessOrder() - Kiểm tra quyền truy cập CHI TIẾT 1 order cụ thể
   * Backend: show() method (lines 82-87 trong orders_controller.ts)
   * 
   * Backend Logic (KHÔNG CHECK ROLE):
   * if (
   *   order.user !== currentUser.id &&              // KHÔNG phải người mua
   *   currentUser.role !== 'admin' &&               // KHÔNG phải admin
   *   !order.items.some(seller === currentUser.id) // KHÔNG có items bán
   * ) → 403 FORBIDDEN
   * 
   * ⇒ Ai cũng xem được NẾU: là người mua HOẶC admin HOẶC seller có items
   * 
   * LƯU Ý: Order chứa SNAPSHOT data (sellerName, price, productName...)
   * → Không cần populate, data đã được lưu tại thời điểm mua
   * → Đảm bảo hóa đơn KHÔNG thay đổi dù seller sửa tên/giá
   */
  const canAccessOrder = useCallback((order) => {
    if (!currentUser) {
      console.log('Access denied: No user')
      return false
    }

    // Check 1: Là người mua của order này?
    const isOwner = order.user?._id === currentUser.id || order.user === currentUser.id
    
    // Check 2: Là admin?
    const isAdmin = currentUser.role === 'admin'
    
    // Check 3: Là seller có items trong order này?
    const isSeller = order.items?.some(item => {
      const sellerId = item.seller?._id || item.seller
      return sellerId === currentUser.id
    })

    // GRANT ACCESS nếu 1 trong 3 điều kiện thỏa mãn
    if (isOwner || isAdmin || isSeller) {
      console.log('Access granted:', { isOwner, isAdmin, isSeller })
      return true
    }

    console.log('Access denied: Not owner/admin/seller')
    return false
  }, [currentUser])

  // ==================== API CALLS ====================

  // GET ALL ORDERS (with pagination & filters)
  /**
   * fetchOrders() - Backend: index() method
   * API: GET /api/orders
   * 
   * Params:
   * - page: số trang hiện tại
   * - limit: số orders mỗi trang
   * - status: lọc theo trạng thái (pending, confirmed, processing, shipped, delivered, cancelled)
   * 
   * Backend Logic:
   * - TẤT CẢ users chỉ xem orders của CHÍNH HỌ (filter by user.id)
   * - Không có "view all" cho admin trong hàm index()
   */
  const fetchOrders = useCallback(async (page = 1, statusFilter = '') => {
    console.log('Fetching orders...', { page, statusFilter, role: currentUser?.role })
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/orders', {
        params: {
          page,
          limit: pagination.limit,
          status: statusFilter || undefined,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { orders: fetchedOrders, currentPage, totalPages, totalOrders } = response.data
      console.log('Orders fetched:', { count: fetchedOrders.length, totalOrders })

      setOrders(fetchedOrders)
      setPagination({ page: currentPage, limit: pagination.limit, totalPages, totalOrders })
      setFilters({ ...filters, status: statusFilter })
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải đơn hàng')
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, filters, currentUser?.role])

  // GET SINGLE ORDER DETAIL
  /**
   * fetchOrderDetail() - Backend: show() method
   * API: GET /api/orders/:id
   * 
   * Backend Logic:
   * - ADMIN: Xem tất cả orders
   * - PARTNER: Xem orders có items của họ (isOrderSeller check)
   * - CUSTOMER: Chỉ xem orders của họ
   */
  const fetchOrderDetail = useCallback(async (orderId) => {
    console.log('Fetching order detail:', orderId)
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { order } = response.data

      // Check permission
      if (!canAccessOrder(order)) {
        console.log('Permission denied for order:', orderId)
        setError('Bạn không có quyền xem đơn hàng này')
        return
      }

      console.log('Order detail loaded:', order._id)
      setSelectedOrder(order)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải chi tiết đơn hàng')
      console.error('Fetch order detail error:', err)
    } finally {
      setLoading(false)
    }
  }, [canAccessOrder])

  // CREATE NEW ORDER
  /**
   * createOrder() - Backend: store() method (lines 105-260)
   * API: POST /api/orders
   * 
   * Request Body:
   * - items: [{product, variantSku, quantity}]
   * - shippingAddress: {fullName, phone, address: {street, district, city}}
   * - paymentMethod: 'cod' | 'bank_transfer' | 'momo'
   * - notes: optional
   * 
   * Backend Transaction Flow:
   * 1. Validate cart không rỗng
   * 2. Validate địa chỉ đầy đủ
   * 3. FOR EACH item:
   *    - Lock Product document (findById + session)
   *    - Check variant tồn tại & isAvailable
   *    - Check stock đủ
   *    - SNAPSHOT: Lưu name, price, sellerName, brand, image... (lines 187-205)
   *    - Trừ stock atomically
   * 4. Calculate totals (subtotal, shipping, tax, discount)
   * 5. Create Order + Save
   * 6. Delete Cart
   * 7. Commit transaction
   * 
   * Snapshot Pattern:
   * - Order items chứa FULL DATA snapshot tại thời điểm mua
   * - Lý do: Hóa đơn phải BẤT BIẾN theo chuẩn kế toán/pháp lý
   * - Nếu seller đổi tên/giá → Order cũ VẪN hiển thị data lúc mua
   * - Tránh populate Product/User → đảm bảo data không thay đổi
   */
  const createOrder = useCallback(async (orderData) => {
    console.log('Creating order...', orderData)
    setLoading(true)
    setError(null)

    try {
      // Validation
      if (!orderData.items || orderData.items.length === 0) {
        console.log('Validation failed: Empty cart')
        setError('Giỏ hàng trống')
        setLoading(false)
        return
      }

      if (!orderData.shippingAddress?.fullName || !orderData.shippingAddress?.phone) {
        console.log('Validation failed: Incomplete address')
        setError('Địa chỉ giao hàng không đầy đủ thông tin')
        setLoading(false)
        return
      }

      const response = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { order, message } = response.data
      console.log('Order created:', order._id)

      setSuccess(message)
      setOrders([order, ...orders])
      setCreateMode(false)
      setNewOrder({
        items: [],
        shippingAddress: {
          fullName: '',
          phone: '',
          address: { street: '', district: '', city: '' },
        },
        paymentMethod: 'cod',
        notes: '',
      })

      // Auto-refresh list
      setTimeout(() => fetchOrders(1), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo đơn hàng')
      console.error('Create order error:', err)
    } finally {
      setLoading(false)
    }
  }, [orders, fetchOrders])

  // UPDATE ORDER STATUS (Admin/Seller only)
  /**
   * updateOrderStatus() - Backend: updateStatus() method
   * API: PATCH /api/orders/:id/status
   * 
   * Body:
   * - status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
   * - note: optional
   * 
   * Backend Logic:
   * - Chỉ ADMIN và SELLER (isOrderSeller) được update
   * - Seller chỉ update orders có items của họ
   * - Không thể update khi status = 'delivered' hoặc 'cancelled'
   */
  const updateOrderStatus = useCallback(async (orderId, newStatus, note = '') => {
    console.log('Updating order status:', { orderId, newStatus, note })
    
    if (!hasPermission('UPDATE_ORDER_STATUS')) {
      console.log('Permission denied: UPDATE_ORDER_STATUS')
      setError('Bạn không có quyền cập nhật trạng thái đơn hàng')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.patch(
        `/api/orders/${orderId}/status`,
        { status: newStatus, note },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )

      const { order, message } = response.data
      console.log('Status updated:', order.status)

      setSuccess(message)
      setSelectedOrder(order)

      // Update in list
      setOrders(orders.map(o => o._id === orderId ? order : o))
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
      console.error('Update status error:', err)
    } finally {
      setLoading(false)
    }
  }, [hasPermission, orders])

  // CANCEL ORDER (User/Admin only)
  /**
   * cancelOrder() - Backend: cancel() method  
   * API: POST /api/orders/:id/cancel
   * 
   * Body:
   * - reason: lý do hủy
   * 
   * Backend Logic:
   * - Chỉ CUSTOMER và ADMIN được hủy
   * - Customer chỉ hủy orders của họ
   * - Restore stock về Product
   * - Refund vào User wallet
   */
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    console.log('Cancelling order:', { orderId, reason })
    
    // Backend sẽ check ownership trên server
    // Ở đây chỉ cần đảm bảo user đã đăng nhập
    if (!currentUser) {
      console.log('Permission denied: No user')
      setError('Bạn chưa đăng nhập')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `/api/orders/${orderId}/cancel`,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )

      const { order, message } = response.data
      console.log('Order cancelled:', order._id)

      setSuccess(message)
      setSelectedOrder(order)
      setOrders(orders.map(o => o._id === orderId ? order : o))
    } catch (err) {
      // Backend sẽ trả 403 nếu không phải owner/admin
      setError(err.response?.data?.message || 'Lỗi khi hủy đơn hàng')
      console.error('Cancel order error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentUser, orders])

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    // Get current user from context/localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchOrders(1)
    }
  }, [currentUser, fetchOrders])

  // ==================== UI COMPONENTS ====================

  if (loading && orders.length === 0) {
    return <div className="order-loading">Đang tải...</div>
  }

  return (
    <div className="order-management-container">
      <header className="order-header">
        <h1>Quản Lý Đơn Hàng</h1>
        
        {/* USER INFO */}
        <div className="header-info">
          <div className="user-info">
            <span>{currentUser?.fullName || currentUser?.username || 'Guest'}</span>
            <span className={`role-badge role-${currentUser?.role}`}>
              {currentUser?.role === 'customer' && 'KHÁCH HÀNG'}
              {currentUser?.role === 'partner' && 'CHỦ SHOP'}
              {currentUser?.role === 'admin' && 'QUẢN TRỊ (Debug Mode)'}
            </span>
          </div>
          
          {/* PERMISSIONS DISPLAY */}
          <div className="permissions-info">
            <small>Quyền của bạn trong hệ thống:</small>
            <div className="permission-badges">
              {hasPermission('VIEW_OWN_ORDERS') && (
                <span className="perm perm-view" title="Xem đơn hàng của bạn">
                  Xem đơn
                </span>
              )}
              {hasPermission('CREATE_ORDER') && (
                <span className="perm perm-create" title="Đặt hàng mới">
                  Đặt hàng
                </span>
              )}
              {hasPermission('UPDATE_ORDER_STATUS') && (
                <span className="perm perm-update" title="Cập nhật trạng thái đơn hàng">
                  Đổi trạng thái
                </span>
              )}
              <span className="perm perm-info" title="Ai cũng hủy được đơn của chính họ">
                Hủy đơn: Theo ownership
              </span>
            </div>
            {currentUser?.role === 'admin' && (
              <small className="admin-note">
                Admin thường dùng Dashboard riêng. Đây là chế độ debug.
              </small>
            )}
          </div>
        </div>
      </header>

      {/* ============ ERROR & SUCCESS MESSAGES ============ */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ============ TOOLBAR ============ */}
      <div className="order-toolbar">
        {hasPermission('CREATE_ORDER') && !createMode && (
          <button className="btn btn-primary" onClick={() => setCreateMode(true)}>
            + Tạo Đơn Hàng Mới
          </button>
        )}

        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => fetchOrders(1, e.target.value)}
            className="filter-select"
          >
            <option value="">Tất Cả Trạng Thái</option>
            <option value="pending">Chờ Xác Nhận</option>
            <option value="confirmed">Đã Xác Nhận</option>
            <option value="processing">Đang Xử Lý</option>
            <option value="shipped">Đã Gửi</option>
            <option value="delivered">Đã Giao</option>
            <option value="cancelled">Đã Hủy</option>
          </select>
        </div>
      </div>

      {/* ============ CREATE ORDER FORM ============ */}
      {createMode && (
        <CreateOrderForm
          order={newOrder}
          setOrder={setNewOrder}
          onSubmit={createOrder}
          onCancel={() => setCreateMode(false)}
          loading={loading}
        />
      )}

      {/* ============ ORDERS LIST ============ */}
      <div className="orders-list">
        <div className="list-header">
          <span>Tổng: {pagination.totalOrders} đơn hàng</span>
        </div>

        {orders.length === 0 ? (
          <div className="no-data">Không có đơn hàng nào</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Ngày Đặt</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Số Lượng</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className={`status-${order.status}`}>
                  <td>
                    <code>{order._id.substring(0, 8)}</code>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="amount">{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>{order.items.length} sản phẩm</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => fetchOrderDetail(order._id)}
                    >
                      Chi Tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ============ PAGINATION ============ */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => fetchOrders(pagination.page - 1)}
          >
            ← Trang Trước
          </button>
          <span>
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchOrders(pagination.page + 1)}
          >
            Trang Sau →
          </button>
        </div>
      )}

      {/* ============ ORDER DETAIL MODAL ============ */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          currentUser={currentUser}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={updateOrderStatus}
          onCancel={cancelOrder}
          canUpdateStatus={hasPermission('UPDATE_ORDER_STATUS')}
          canCancel={canCancelOrder(selectedOrder)}
          loading={loading}
        />
      )}
    </div>
  )
}

// ==================== SUB-COMPONENTS ====================

/**
 * Form để tạo đơn hàng mới
 * - Chọn sản phẩm từ giỏ hàng
 * - Nhập địa chỉ giao hàng
 * - Chọn phương thức thanh toán
 */
const CreateOrderForm = ({ order, setOrder, onSubmit, onCancel, loading }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Tạo Đơn Hàng Mới</h2>

        <div className="form-group">
          <label>Họ Tên *</label>
          <input
            type="text"
            value={order.shippingAddress.fullName}
            onChange={(e) =>
              setOrder({
                ...order,
                shippingAddress: {
                  ...order.shippingAddress,
                  fullName: e.target.value,
                },
              })
            }
            placeholder="Nhập họ tên"
          />
        </div>

        <div className="form-group">
          <label>Số Điện Thoại *</label>
          <input
            type="tel"
            value={order.shippingAddress.phone}
            onChange={(e) =>
              setOrder({
                ...order,
                shippingAddress: {
                  ...order.shippingAddress,
                  phone: e.target.value,
                },
              })
            }
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Địa Chỉ *</label>
            <input
              type="text"
              value={order.shippingAddress.address.street}
              onChange={(e) =>
                setOrder({
                  ...order,
                  shippingAddress: {
                    ...order.shippingAddress,
                    address: {
                      ...order.shippingAddress.address,
                      street: e.target.value,
                    },
                  },
                })
              }
              placeholder="Đường"
            />
          </div>

          <div className="form-group">
            <label>Quận/Huyện *</label>
            <input
              type="text"
              value={order.shippingAddress.address.district}
              onChange={(e) =>
                setOrder({
                  ...order,
                  shippingAddress: {
                    ...order.shippingAddress,
                    address: {
                      ...order.shippingAddress.address,
                      district: e.target.value,
                    },
                  },
                })
              }
              placeholder="Quận/Huyện"
            />
          </div>

          <div className="form-group">
            <label>Tỉnh/Thành Phố *</label>
            <input
              type="text"
              value={order.shippingAddress.address.city}
              onChange={(e) =>
                setOrder({
                  ...order,
                  shippingAddress: {
                    ...order.shippingAddress,
                    address: {
                      ...order.shippingAddress.address,
                      city: e.target.value,
                    },
                  },
                })
              }
              placeholder="Tỉnh/Thành Phố"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Phương Thức Thanh Toán</label>
          <select
            value={order.paymentMethod}
            onChange={(e) => setOrder({ ...order, paymentMethod: e.target.value })}
          >
            <option value="cod">Thanh Toán Khi Nhận (COD)</option>
            <option value="card">Thẻ Tín Dụng</option>
            <option value="wallet">Ví Điện Tử</option>
          </select>
        </div>

        <div className="form-group">
          <label>Ghi Chú</label>
          <textarea
            value={order.notes}
            onChange={(e) => setOrder({ ...order, notes: e.target.value })}
            placeholder="Ghi chú thêm (tùy chọn)"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={() => onSubmit(order)}
            disabled={loading}
          >
            {loading ? 'Đang Tạo...' : 'Tạo Đơn Hàng'}
          </button>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Modal chi tiết đơn hàng
 * - Hiển thị đầy đủ thông tin order
 * - Cho phép cập nhật trạng thái (nếu có quyền)
 * - Cho phép hủy đơn (nếu có quyền)
 * 
 * PERMISSIONS:
 * - canUpdateStatus: admin/partner có thể đổi status
 * - canCancel: customer/admin có thể hủy đơn
 */
const OrderDetailModal = ({
  order,
  currentUser,
  onClose,
  onStatusUpdate,
  onCancel,
  canUpdateStatus,
  canCancel,
  loading,
}) => {
  const [newStatus, setNewStatus] = useState(order.status)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)

  console.log('Order Detail Modal opened:', { 
    orderId: order._id, 
    currentRole: currentUser?.role,
    canUpdateStatus, 
    canCancel 
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>Chi Tiết Đơn Hàng #{order._id.substring(0, 8)}</h2>

        {/* ---- ORDER INFO ---- */}
        <section className="order-info">
          <h3>Thông Tin Đơn Hàng</h3>
          <div className="info-grid">
            <div>
              <strong>Trạng Thái:</strong>
              <span className={`status-badge ${order.status}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div>
              <strong>Ngày Đặt:</strong>
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </div>
            <div>
              <strong>Tổng Tiền:</strong>
              <span className="amount">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div>
              <strong>Phương Thức Thanh Toán:</strong>
              {order.paymentMethod === 'cod' ? 'Tiền Mặt' : order.paymentMethod.toUpperCase()}
            </div>
          </div>
        </section>

        {/* ---- SHIPPING ADDRESS ---- */}
        <section className="shipping-info">
          <h3>Địa Chỉ Giao Hàng</h3>
          <p>
            <strong>{order.shippingAddress.fullName}</strong>
            <br />
            {order.shippingAddress.address.street}, {order.shippingAddress.address.district}
            <br />
            {order.shippingAddress.address.city}
            <br />
            {order.shippingAddress.phone}
          </p>
        </section>

        {/* ---- ORDER ITEMS ---- */}
        <section className="order-items">
          <h3>Sản Phẩm (Snapshot Data)</h3>
          <p className="snapshot-note">
            Thông tin này là SNAPSHOT tại thời điểm mua hàng.
            Nếu seller đổi tên/giá, đơn hàng này VẪN hiển thị data gốc (đúng chuẩn hóa đơn).
          </p>
          <table className="items-table">
            <thead>
              <tr>
                <th>Tên Sản Phẩm</th>
                <th>Variant</th>
                <th>Giá (Lúc Mua)</th>
                <th>Số Lượng</th>
                <th>Tổng</th>
                <th>Nhà Bán (Lúc Mua)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '40px', marginRight: '8px' }}
                    />
                    {item.name}
                  </td>
                  <td>{item.variantName}</td>
                  <td>{item.price.toLocaleString('vi-VN')}đ</td>
                  <td>{item.quantity}</td>
                  <td className="amount">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </td>
                  <td>{item.sellerName}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="price-summary">
            <div>
              <strong>Tiền Hàng:</strong>
              {order.subtotal.toLocaleString('vi-VN')}đ
            </div>
            <div>
              <strong>Phí Vận Chuyển:</strong>
              {order.shippingFee.toLocaleString('vi-VN')}đ
            </div>
            <div>
              <strong>Thuế:</strong>
              {order.tax.toLocaleString('vi-VN')}đ
            </div>
            <div>
              <strong>Giảm Giá:</strong>
              {order.discount.toLocaleString('vi-VN')}đ
            </div>
            <div className="total">
              <strong>Tổng Cộng:</strong>
              {order.totalAmount.toLocaleString('vi-VN')}đ
            </div>
          </div>
        </section>

        {/* ---- STATUS HISTORY ---- */}
        <section className="status-history">
          <h3>Lịch Sử Trạng Thái</h3>
          <div className="timeline">
            {order.statusHistory?.map((history, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-status">{getStatusLabel(history.status)}</div>
                <div className="timeline-note">{history.note}</div>
                <div className="timeline-time">
                  {new Date(history.timestamp).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- UPDATE STATUS (Admin/Seller only) ---- */}
        {canUpdateStatus && order.status !== 'cancelled' && order.status !== 'delivered' && (
          <section className="update-status">
            <h3>Cập Nhật Trạng Thái</h3>
            <p className="help-text">
              {currentUser?.role === 'admin' && 'ADMIN: Bạn có thể đổi trạng thái bất kỳ đơn hàng nào'}
              {currentUser?.role === 'partner' && 'SELLER: Bạn chỉ đổi được trạng thái đơn có sản phẩm của bạn'}
            </p>
            <div className="form-group">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="pending">Chờ Xác Nhận</option>
                <option value="confirmed">Đã Xác Nhận</option>
                <option value="processing">Đang Xử Lý</option>
                <option value="shipped">Đã Gửi</option>
                <option value="delivered">Đã Giao</option>
              </select>
            </div>
            <button
              className="btn btn-success"
              onClick={() => onStatusUpdate(order._id, newStatus)}
              disabled={loading || newStatus === order.status}
            >
              {loading ? 'Đang Cập Nhật...' : 'Cập Nhật'}
            </button>
          </section>
        )}

        {/* ---- CANCEL ORDER (Owner or Admin only) ---- */}
        {canCancel && !['delivered', 'cancelled'].includes(order.status) && (
          <section className="cancel-section">
            <h3>Hủy Đơn Hàng</h3>
            <p className="help-text">
              {currentUser?.role === 'admin' 
                ? 'ADMIN: Bạn có thể hủy bất kỳ đơn hàng nào' 
                : 'Bạn có thể hủy đơn hàng này vì bạn là người mua'}
            </p>
            {!showCancelForm ? (
              <button className="btn btn-danger" onClick={() => setShowCancelForm(true)}>
                Hủy Đơn Hàng
              </button>
            ) : (
              <div>
                <h3>Lý Do Hủy Đơn</h3>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy đơn"
                  rows="3"
                />
                <div className="form-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => onCancel(order._id, cancelReason)}
                    disabled={loading}
                  >
                    {loading ? 'Đang Hủy...' : 'Xác Nhận Hủy'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCancelForm(false)}
                  >
                    Huỷ
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== UTILITY FUNCTIONS ====================

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ Xác Nhận',
    confirmed: 'Đã Xác Nhận',
    processing: 'Đang Xử Lý',
    shipped: 'Đã Gửi',
    delivered: 'Đã Giao',
    cancelled: 'Đã Hủy',
  }
  return labels[status] || status
}

export default OrderManagement
