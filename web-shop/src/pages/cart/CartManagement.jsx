import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './CartManagement.css'

/**
 * ============================================
 * CART MANAGEMENT SYSTEM - REACT TEMPLATE
 * ============================================
 *
 * 5 CORE FUNCTIONS:
 * 1. getCart() - GET /api/cart - Lấy giỏ hàng hiện tại
 * 2. addItem() - POST /api/cart/items - Thêm sản phẩm vào giỏ
 * 3. updateItem() - PUT /api/cart/items/:id - Cập nhật số lượng
 * 4. removeItem() - DELETE /api/cart/items/:id - Xóa sản phẩm
 * 5. clearCart() - DELETE /api/cart - Xóa toàn bộ giỏ hàng
 *
 * BUSINESS LOGIC:
 * - Mỗi user có 1 cart duy nhất
 * - Cart items có product + variant (sku)
 * - Auto-create cart nếu chưa có
 * - Filter deleted products khi load
 * - Check stock khi add/update
 * - Atomic operations để tránh race condition
 */

const CartManagement = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  // ==================== API CALLS ====================

  // 1. GET CART
  const fetchCart = useCallback(async () => {
    console.log('Fetching cart...')
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { items } = response.data
      console.log('Cart loaded:', items.length, 'items')

      setCartItems(items)
    } catch (err) {
      console.error('Fetch cart error:', err)
      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        setError(err.response?.data?.message || 'Lỗi khi tải giỏ hàng')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  // 2. UPDATE ITEM QUANTITY
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    console.log('Updating quantity:', itemId, newQuantity)

    if (newQuantity < 1) {
      alert('Số lượng phải lớn hơn 0')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.put(
        `/api/cart/items/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )

      const { items, message } = response.data
      console.log('Quantity updated')

      setCartItems(items)
      setSuccess(message)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Update quantity error:', err)
      setError(err.response?.data?.message || 'Lỗi khi cập nhật số lượng')
    } finally {
      setLoading(false)
    }
  }, [])

  // 3. REMOVE ITEM
  const removeItem = useCallback(async (itemId) => {
    console.log('Removing item:', itemId)

    if (!window.confirm('Xóa sản phẩm này khỏi giỏ hàng?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.delete(`/api/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { items, message } = response.data
      console.log('Item removed')

      setCartItems(items)
      setSuccess(message)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Remove item error:', err)
      setError(err.response?.data?.message || 'Lỗi khi xóa sản phẩm')
    } finally {
      setLoading(false)
    }
  }, [])

  // 4. CLEAR CART
  const clearCart = useCallback(async () => {
    console.log('Clearing cart...')

    if (!window.confirm('Xóa toàn bộ giỏ hàng?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.delete('/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      console.log('Cart cleared')

      setCartItems([])
      setSuccess(response.data.message)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Clear cart error:', err)
      setError(err.response?.data?.message || 'Lỗi khi xóa giỏ hàng')
    } finally {
      setLoading(false)
    }
  }, [])

  // ==================== CALCULATIONS ====================

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateShipping = () => {
    return cartItems.length > 0 ? 30000 : 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    fetchCart()
  }, [fetchCart, navigate])

  // ==================== RENDER ====================

  if (loading && cartItems.length === 0) {
    return <div className="cart-loading">Đang tải giỏ hàng...</div>
  }

  return (
    <div className="cart-container">
      <header className="cart-header">
        <h1>Giỏ Hàng Của Bạn</h1>
        {cartItems.length > 0 && (
          <button className="btn btn-danger" onClick={clearCart} disabled={loading}>
            Xóa Tất Cả
          </button>
        )}
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Mua Sắm Ngay
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            <h2>Sản Phẩm ({cartItems.length})</h2>

            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.product?.images?.[0] || '/placeholder.png'}
                    alt={item.product?.name}
                  />
                </div>

                <div className="item-details">
                  <h3>{item.product?.name}</h3>
                  <p className="item-brand">{item.product?.brand}</p>
                  <p className="item-variant">Phân loại: {item.variantSku}</p>
                  <p className="item-seller">
                    Nhà bán: {item.sellerName || item.seller?.shopName || item.seller?.username}
                  </p>
                </div>

                <div className="item-price">
                  <span className="price">{item.price.toLocaleString('vi-VN')}đ</span>
                </div>

                <div className="item-quantity">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={loading || item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value) || 1
                      if (newQty > 0) {
                        updateQuantity(item._id, newQty)
                      }
                    }}
                    min="1"
                    disabled={loading}
                    className="qty-input"
                  />
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={loading}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  <span className="total-price">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="item-actions">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(item._id)}
                    disabled={loading}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Tổng Đơn Hàng</h2>

            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{calculateSubtotal().toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{calculateShipping().toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span className="total-amount">{calculateTotal().toLocaleString('vi-VN')}đ</span>
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate('/checkout')}
              disabled={loading || cartItems.length === 0}
            >
              Thanh Toán
            </button>

            <button className="btn btn-secondary btn-block" onClick={() => navigate('/products')}>
              Tiếp Tục Mua Sắm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartManagement
