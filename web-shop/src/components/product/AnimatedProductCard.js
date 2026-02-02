import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProductImage from './ProductImage'
import CompareButton from '../comparison/CompareButton'
import './AnimatedProductCard.css'

const AnimatedProductCard = ({
  product,
  index,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  userRole,
}) => {
  // Helper function to get price range from variants
  const getPriceRange = () => {
    if (!product.variants || product.variants.length === 0) {
      return { min: product.price || 0, max: product.price || 0 }
    }
    const prices = product.variants.map((v) => v.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }

  // Helper function to calculate total stock
  const getTotalStock = () => {
    if (!product.variants || product.variants.length === 0) {
      return product.stock || 0
    }
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
  }

  const priceRange = getPriceRange()
  const totalStock = getTotalStock()
  const isOnSale = product.salePrice && product.salePrice < priceRange.min
  const discountPercent = isOnSale
    ? Math.round(((priceRange.min - product.salePrice) / priceRange.min) * 100)
    : 0

  // Animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: index * 0.1,
      },
    },
    hover: {
      y: -12,
      scale: 1.03,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  }

  const imageVariants = {
    hover: {
      scale: 1.15,
      rotate: 5,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  }

  const badgeVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.1 + 0.3,
      },
    },
  }

  const buttonVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  }

  const glowVariants = {
    animate: {
      boxShadow: [
        '0 0 20px rgba(99, 102, 241, 0.3)',
        '0 0 40px rgba(99, 102, 241, 0.5)',
        '0 0 20px rgba(99, 102, 241, 0.3)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <motion.div
      className="animated-product-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      {/* Glow Effect on Hover */}
      <motion.div className="card-glow" variants={glowVariants} animate="animate" />

      {/* Image Section */}
      <Link to={`/product/${product._id}`} className="animated-image-wrapper">
        <motion.div variants={imageVariants}>
          <ProductImage
            src={product.images?.[0] || ''}
            alt={product.name}
            className="animated-product-image"
          />
        </motion.div>

        {/* Badges */}
        {isOnSale && (
          <motion.div
            className="animated-sale-badge"
            variants={badgeVariants}
            initial="initial"
            animate="animate"
          >
            -{discountPercent}%
          </motion.div>
        )}

        {totalStock <= 0 && (
          <motion.div
            className="animated-sold-out-badge"
            variants={badgeVariants}
            initial="initial"
            animate="animate"
          >
            Hết hàng
          </motion.div>
        )}

        {/* Quick View Button */}
        <motion.button
          className="animated-quick-view-btn"
          onClick={(e) => {
            e.preventDefault()
            onQuickView(product)
          }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          ×
        </motion.button>
      </Link>

      {/* Action Buttons */}
      <div className="animated-action-buttons">
        {/* Admin và Partner không cần wishlist */}
        {userRole !== 'admin' && userRole !== 'partner' && (
          <motion.button
            className={`animated-wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`}
            onClick={() => onToggleWishlist(product)}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {isInWishlist(product._id) ? '❤' : '♡'}
          </motion.button>
        )}

        <CompareButton product={product} />
      </div>

      {/* Product Info */}
      <div className="animated-product-info">
        <motion.div
          className="animated-product-brand"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          {product.brand}
        </motion.div>

        {/* Partner/Seller Info */}
        {product.createdBy && product.createdBy.shopName && (
          <motion.div
            className="animated-partner-info"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.25 }}
          >
            <span className="partner-icon">🏪</span>
            <span className="partner-name">{product.createdBy.shopName}</span>
          </motion.div>
        )}

        <Link to={`/product/${product._id}`}>
          <motion.h3
            className="animated-product-name"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            {product.name}
          </motion.h3>
        </Link>

        <motion.p
          className="animated-product-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.4 }}
        >
          {product.description}
        </motion.p>

        {/* Price Section */}
        <motion.div
          className="animated-product-price"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.1 + 0.5,
            type: 'spring',
            stiffness: 200,
          }}
        >
          {isOnSale && (
            <span className="animated-original-price">
              {priceRange.min.toLocaleString('vi-VN')} VND
            </span>
          )}
          <span className={`animated-current-price ${isOnSale ? 'sale-price' : ''}`}>
            {product.salePrice
              ? `${product.salePrice.toLocaleString('vi-VN')} VND`
              : priceRange.min === priceRange.max
                ? `${priceRange.min.toLocaleString('vi-VN')} VND`
                : `${priceRange.min.toLocaleString('vi-VN')} - ${priceRange.max.toLocaleString('vi-VN')} VND`}
          </span>
        </motion.div>

        {/* Footer */}
        <div className="animated-product-footer">
          <span
            className="animated-stock-status"
            style={{
              color: totalStock > 0 ? '#10b981' : '#e74c3c',
            }}
          >
            {totalStock > 0 ? `Còn ${totalStock} sản phẩm` : 'Hết hàng'}
          </span>

          {/* Admin và Partner không cần add to cart */}
          {userRole !== 'admin' &&
            userRole !== 'partner' &&
            (totalStock > 0 ? (
              <motion.button
                className="animated-add-btn"
                onClick={() => onAddToCart(product)}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Thêm
              </motion.button>
            ) : (
              <motion.button className="animated-notify-btn" disabled>
                Thông báo
              </motion.button>
            ))}
        </div>
      </div>
    </motion.div>
  )
}

export default AnimatedProductCard
