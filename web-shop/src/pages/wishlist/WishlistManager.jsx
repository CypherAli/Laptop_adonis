/**
 * ==================== WISHLIST MANAGER COMPONENT ====================
 *
 * PHÂN QUYỀN HỆ THỐNG:
 * - All logged-in users can manage their wishlist
 * - Ownership-based: Users only access their own wishlist
 * - Guest users: Cannot access (requires authentication)
 *
 * CORE FUNCTIONS:
 * 1. Wishlist Display
 *    - index() - GET /api/wishlist (get user's wishlist with product details)
 *
 * 2. Add/Remove Operations
 *    - add() - POST /api/wishlist (add product, $addToSet avoids duplicates)
 *    - remove() - DELETE /api/wishlist/:productId (remove specific product)
 *    - clear() - DELETE /api/wishlist/clear (remove all items)
 *
 * 3. Check Status
 *    - check() - GET /api/wishlist/check/:productId (check if product in wishlist)
 *
 * BACKEND LOGIC NOTES:
 * - Wishlist stored as product IDs array in User model
 * - Products auto-populated with details when fetching
 * - Inactive products filtered out
 * - Price calculated from variants (lowest price)
 * - Stock summed from all variants
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './WishlistManager.css'

export default function WishlistManager() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [wishlistItems, setWishlistItems] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchWishlist()
  }, [navigate])

  const fetchWishlist = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get('/api/wishlist')
      setWishlistItems(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách yêu thích')
    } finally {
      setLoading(false)
    }
  }

  // ==================== REMOVE ITEM ====================

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) return

    try {
      await axios.delete(`/api/wishlist/${productId}`)
      setSuccess('Đã xóa khỏi danh sách yêu thích')
      await fetchWishlist()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa sản phẩm')
    }
  }

  // ==================== CLEAR ALL ====================

  const handleClearWishlist = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) return

    try {
      await axios.delete('/api/wishlist/clear')
      setSuccess('Đã xóa tất cả sản phẩm')
      await fetchWishlist()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa danh sách yêu thích')
    }
  }

  // ==================== ADD TO CART ====================

  const handleAddToCart = async (product) => {
    try {
      const variantToAdd = product.variants?.find((v) => v.isAvailable && v.stock > 0)
      if (!variantToAdd) {
        setError('Sản phẩm tạm hết hàng')
        return
      }

      await axios.post('/api/cart/items', {
        productId: product._id,
        variantId: variantToAdd._id,
        quantity: 1,
      })
      setSuccess('Đã thêm vào giỏ hàng')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng')
    }
  }

  // ==================== HELPERS ====================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  if (loading) {
    return <div className="wishlist-loading">Đang tải...</div>
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>Danh Sách Yêu Thích</h1>
        {wishlistItems.length > 0 && (
          <button className="btn btn-danger" onClick={handleClearWishlist}>
            Xóa Tất Cả
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ==================== WISHLIST ITEMS ==================== */}
      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">♥</div>
          <h2>Danh sách yêu thích trống</h2>
          <p>Thêm sản phẩm vào danh sách yêu thích để theo dõi và mua sau</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Khám Phá Sản Phẩm
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((item) => {
            const product = item.product
            return (
              <div key={product._id} className="wishlist-item">
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(product._id)}
                  title="Xóa khỏi danh sách yêu thích"
                >
                  ×
                </button>

                <div className="item-image" onClick={() => navigate(`/products/${product._id}`)}>
                  <img src={product.imageUrl || '/placeholder.png'} alt={product.name} />
                  {product.stock === 0 && <div className="out-of-stock-badge">Hết hàng</div>}
                </div>

                <div className="item-details">
                  <h3 onClick={() => navigate(`/products/${product._id}`)}>{product.name}</h3>
                  <p className="item-brand">{product.brand}</p>
                  <p className="item-category">{product.category}</p>

                  <div className="item-price">
                    <span className="current-price">{formatCurrency(product.price)}</span>
                    {product.price < product.basePrice && (
                      <span className="original-price">{formatCurrency(product.basePrice)}</span>
                    )}
                  </div>

                  <div className="item-stock">
                    {product.stock > 0 ? (
                      <span className="in-stock">Còn {product.stock} sản phẩm</span>
                    ) : (
                      <span className="out-of-stock">Hết hàng</span>
                    )}
                  </div>

                  <div className="item-actions">
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      Thêm Vào Giỏ
                    </button>
                    <button
                      className="btn btn-secondary btn-block"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      Xem Chi Tiết
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
