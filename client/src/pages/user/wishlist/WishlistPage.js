import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../../../context/AuthContext'
import WishlistContext from '../../../context/WishlistContext'
import CartContext from '../../../context/CartContext'
import { PLACEHOLDER_IMAGES } from '../../../utils/placeholder'
import './WishlistPage.css'

const WishlistPage = () => {
  const { user } = useContext(AuthContext)
  const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext)
  const { addToCart } = useContext(CartContext)
  const navigate = useNavigate()

  // Redirect admin to home page - Admin không cần wishlist
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/')
    }
  }, [user, navigate])

  // Helper to get product price
  const getProductPrice = (product) => {
    if (product.finalPrice) return product.finalPrice
    if (product.displayPrice) return product.displayPrice
    if (product.price) return product.price
    if (product.variants && product.variants.length > 0) {
      return product.variants[0].price || 0
    }
    if (product.basePrice) return product.basePrice
    return 0
  }

  // Helper to get product stock
  const getProductStock = (product) => {
    if (product.stock !== undefined) return product.stock
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((total, v) => total + (v.stock || 0), 0)
    }
    return 0
  }

   
  const handleAddToCart = (product) => {
    addToCart(product)
    alert(`${product.name} has been added to cart!`)
  }

  const handleMoveToCart = (product) => {
    addToCart(product)
    removeFromWishlist(product._id)
    alert(`${product.name} has been moved to cart!`)
  }

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <div className="empty-icon">❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Add products you love to view them later!</p>
          <button className="btn-shop" onClick={() => navigate('/')}>
            Explore Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div className="header-left">
          <h1>
            <span className="heart-icon">❤️</span>
            My Wishlist
          </h1>
          <span className="wishlist-count">{wishlist.length} items</span>
        </div>
        <button className="btn-clear-all" onClick={clearWishlist}>
          Delete all
        </button>
      </div>

      <div className="wishlist-grid">
        {wishlist.map((product) => (
          <div key={product._id} className="wishlist-card">
            <button
              className="btn-remove-item"
              onClick={() => removeFromWishlist(product._id)}
              title="Remove from wishlist"
            >
              ✕
            </button>

            <div className="wishlist-image-wrapper">
              <img
                src={product.imageUrl || PLACEHOLDER_IMAGES.product}
                alt={product.name}
                className="wishlist-image"
              />
              {getProductStock(product) <= 0 && (
                <div className="out-of-stock-overlay">
                  <span>Hết hàng</span>
                </div>
              )}
            </div>

            <div className="wishlist-info">
              <h3 className="wishlist-product-name">{product.name}</h3>
              <p className="wishlist-brand">{product.brand}</p>

              <div className="wishlist-price">
                <span className="price-value">{getProductPrice(product).toLocaleString()} VNĐ</span>
              </div>

              <div className="wishlist-stock">
                {getProductStock(product) > 0 ? (
                  <span className="in-stock">✓ Còn {getProductStock(product)} sản phẩm</span>
                ) : (
                  <span className="out-of-stock">✕ Hết hàng</span>
                )}
              </div>

              <div className="wishlist-actions">
                <button
                  className="btn-move-to-cart"
                  onClick={() => handleMoveToCart(product)}
                  disabled={getProductStock(product) <= 0}
                >
                  Add to cart
                </button>
                <button className="btn-remove" onClick={() => removeFromWishlist(product._id)}>
                  Remove
                </button>
              </div>
            </div>

            {product.addedAt && (
              <div className="added-date">
                Đã thêm: {new Date(product.addedAt).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishlistPage
