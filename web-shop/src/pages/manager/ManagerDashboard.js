import React, { useState, useEffect, useContext } from 'react'
import axios from '../../api/axiosConfig'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder'
import './ManagerDashboard.css'

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  // UI states
  const [myProducts, setMyProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
      navigate('/login')
      return
    }

    // Check if partner is approved
    if (user.role === 'partner' && !user.isApproved) {
      // Show pending approval message but don't redirect
      setError(
        'Your Partner account is pending Admin approval. You can view but cannot add products yet.'
      )
    }

    fetchMyProducts()
  }, [user])

  const fetchMyProducts = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/products/my-products', { skipCache: true })
      console.log('My products response:', res.data)
      setMyProducts(res.data.products || [])
      setError('') // Clear any previous errors
    } catch (err) {
      console.error('Failed to fetch products', err)
      console.error('Error details:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return
    }

    try {
      await axios.delete(`/products/${productId}`)
      setSuccess('Xóa sản phẩm thành công!')
      fetchMyProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm')
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Chờ duyệt', color: '#f39c12', icon: '⏳' },
      approved: { label: 'Đã duyệt', color: '#27ae60', icon: '✅' },
      rejected: { label: 'Từ chối', color: '#e74c3c', icon: '❌' },
    }
    return statusMap[status] || { label: status, color: '#95a5a6', icon: '❓' }
  }

  if (loading && myProducts.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Đang tải...</h2>
      </div>
    )
  }

  return (
    <div className="partner-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>
            <span className="header-icon">🏪</span>
            Quản lý Sản phẩm
            {user?.shopName && <span className="shop-name-badge">{user.shopName}</span>}
          </h1>
        </div>
        <div className="header-actions"></div>
      </div>

      {/* Partner Approval Status */}
      {user?.role === 'partner' && !user?.isApproved && (
        <div
          className="alert alert-warning"
          style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '24px' }}>⏳</span>
          <div>
            <strong>Tài khoản đang chờ phê duyệt</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
              Tài khoản Partner của bạn đang chờ Admin phê duyệt. Sau khi được duyệt, bạn sẽ có thể
              thêm và quản lý sản phẩm.
            </p>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          ✅ {success}
          <button onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      {/* Products List */}
      <div className="products-section">
        <h2>
          📦 Sản phẩm của tôi
          <span className="product-count">({myProducts.length})</span>
        </h2>

        {myProducts.length === 0 ? (
          <div className="no-products">
            <div className="empty-icon">📦</div>
            <p>No products yet</p>
            {user?.role === 'admin' && (
              <button className="btn-add-first" onClick={() => navigate('/admin/add-product')}>
                ➕ Add first product
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {myProducts.map((product) => {
              const statusInfo = getStatusInfo(product.status)
              // Get price and stock from variants or fallback
              const price = product.variants?.[0]?.price || product.price || 0
              const stock =
                product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || product.stock || 0

              return (
                <div key={product._id} className="product-card-dashboard">
                  <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>

                  <div className="product-image-wrapper">
                    <img
                      src={product.imageUrl || PLACEHOLDER_IMAGES.productSmall}
                      alt={product.name}
                    />
                  </div>

                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="product-brand">🏷️ {product.brand}</p>
                    <p className="product-description">{product.description}</p>

                    <div className="product-meta">
                      <span className="price">{price.toLocaleString()} VNĐ</span>
                      <span className="stock">
                        📦 {stock} {stock > 0 ? 'in stock' : 'out of stock'}
                      </span>
                    </div>

                    <div className="product-actions">
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                      >
                        ✏️ Sửa
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(product._id)}>
                        🗑️ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerDashboard
