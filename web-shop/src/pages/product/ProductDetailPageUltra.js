import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../../api/axiosConfig'
import CartContext from '../../context/CartContext'
import WishlistContext from '../../context/WishlistContext'
import AuthContext from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import ReviewList from '../../components/review/ReviewList'
import ReviewForm from '../../components/review/ReviewForm'
import ProductImage from '../../components/product/ProductImage'
import ImageModal from '../../components/modal/ImageModal'
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder'
import './ProductDetailPageUltra.css'

const ProductDetailPageUltra = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useContext(AuthContext)
  const { addToCart } = useContext(CartContext)
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [activeTab, setActiveTab] = useState('specs')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // Variant selection states
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedGender, setSelectedGender] = useState(null)
  const [currentVariant, setCurrentVariant] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/products/${id}`)

        // Process product with variant price calculation
        const rawProduct = response.data.product || response.data

        // Calculate price from variants
        const getPrice = () => {
          if (rawProduct.variants && rawProduct.variants.length > 0) {
            const prices = rawProduct.variants.map((v) => v.price)
            return Math.min(...prices)
          }
          return rawProduct.price || 0
        }

        // Calculate total stock
        const getTotalStock = () => {
          if (rawProduct.variants && rawProduct.variants.length > 0) {
            return rawProduct.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
          }
          return rawProduct.stock || 0
        }

        const processedProduct = {
          ...rawProduct,
          price: getPrice(),
          stock: getTotalStock(),
          inStock: getTotalStock() > 0,
        }

        setProduct(processedProduct)

        // Initialize variant selections
        if (processedProduct.variants && processedProduct.variants.length > 0) {
          const firstVariant = processedProduct.variants[0]
          setSelectedSize(firstVariant.specifications?.size || null)
          setSelectedColor(firstVariant.specifications?.color || null)
          setSelectedGender(firstVariant.specifications?.gender || null)
          setCurrentVariant(firstVariant)
        }

        // Fetch related products
        if (response.data?.brand) {
          try {
            const relatedRes = await axios.get(`/products?brand=${response.data.brand}&limit=6`)
            const filtered = relatedRes.data.products.filter((p) => p._id !== id)
            setRelatedProducts(filtered.slice(0, 6))
          } catch (err) {
            console.log('Related products error:', err.message)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('❌ Error loading product:', err)
        setError(err.response?.data?.message || 'Cannot load product')
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [id])

  // Update current variant when selections change
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) return

    // Filter variants based on current selections
    let filteredVariants = product.variants

    if (selectedGender) {
      filteredVariants = filteredVariants.filter((v) => v.specifications?.gender === selectedGender)
    }

    if (selectedSize) {
      filteredVariants = filteredVariants.filter((v) => v.specifications?.size === selectedSize)
    }

    if (selectedColor) {
      filteredVariants = filteredVariants.filter((v) => v.specifications?.color === selectedColor)
    }

    // Find exact match or best available variant
    const matchingVariant = filteredVariants.find((v) => v.stock > 0)

    if (matchingVariant) {
      setCurrentVariant(matchingVariant)

      // Auto-select missing attributes from the matching variant
      if (!selectedSize && matchingVariant.specifications?.size) {
        setSelectedSize(matchingVariant.specifications.size)
      }
      if (!selectedColor && matchingVariant.specifications?.color) {
        setSelectedColor(matchingVariant.specifications.color)
      }
    } else if (filteredVariants.length > 0) {
      // If no variant with stock, use the first one
      const firstVariant = filteredVariants[0]
      setCurrentVariant(firstVariant)
    }
  }, [selectedSize, selectedColor, selectedGender, product])

  // Reset size and color when gender changes
  useEffect(() => {
    if (!selectedGender || !product?.variants) return

    // Get available options for the selected gender
    const genderVariants = product.variants.filter(
      (v) => v.specifications?.gender === selectedGender
    )

    if (genderVariants.length === 0) return

    // Check if current size is available for this gender
    const sizeAvailable = genderVariants.some(
      (v) => v.specifications?.size === selectedSize && v.stock > 0
    )
    if (!sizeAvailable) {
      const firstAvailableSize = [
        ...new Set(
          genderVariants
            .filter((v) => v.stock > 0)
            .map((v) => v.specifications?.size)
            .filter(Boolean)
            .sort((a, b) => parseInt(a) - parseInt(b))
        ),
      ][0]
      setSelectedSize(firstAvailableSize || null)
    }

    // Check if current color is available
    const colorAvailable = genderVariants.some(
      (v) =>
        v.specifications?.color === selectedColor &&
        (!selectedSize || v.specifications?.size === selectedSize) &&
        v.stock > 0
    )
    if (!colorAvailable) {
      const firstAvailableColor = [
        ...new Set(
          genderVariants
            .filter(
              (v) => (!selectedSize || v.specifications?.size === selectedSize) && v.stock > 0
            )
            .map((v) => v.specifications?.color)
            .filter(Boolean)
        ),
      ][0]
      setSelectedColor(firstAvailableColor || null)
    }
  }, [selectedGender, product, selectedColor, selectedSize])

  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handleAddToCart = () => {
    const stockToCheck = currentVariant ? currentVariant.stock : product.stock
    const priceToUse = currentVariant ? currentVariant.price : product.price

    if (stockToCheck > 0) {
      const productToAdd = {
        ...product,
        price: priceToUse,
        selectedVariant: currentVariant,
        variantInfo: currentVariant
          ? {
              size: currentVariant.specifications?.size,
              color: currentVariant.specifications?.color,
              gender: currentVariant.specifications?.gender,
            }
          : null,
      }

      for (let i = 0; i < quantity; i++) {
        addToCart(productToAdd)
      }

      const variantText = currentVariant
        ? ` (${[currentVariant.specifications?.gender, currentVariant.specifications?.size, currentVariant.specifications?.color].filter(Boolean).join(', ')})`
        : ''
      toast.success(`✅ Added ${quantity}x ${product.name}${variantText} to cart!`)
    } else {
      toast.error('❌ Product is out of stock!')
    }
  }

  const handleBuyNow = () => {
    if (product && product.stock > 0) {
      handleAddToCart()
      setTimeout(() => navigate('/cart'), 300)
    }
  }

  const handleToggleWishlist = () => {
    toggleWishlist(product)
    const inWishlist = isInWishlist(product._id)
    toast[inWishlist ? 'info' : 'success'](
      inWishlist ? '💔 Removed from wishlist' : '❤️ Added to wishlist'
    )
  }

  const handleOpenImageModal = (index) => {
    setModalImageIndex(index)
    setShowImageModal(true)
  }

  const handleCloseImageModal = () => {
    setShowImageModal(false)
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="ultra-loading-container">
        <motion.div
          className="ultra-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Đang tải sản phẩm...
        </motion.h2>
      </div>
    )
  }

  // ERROR STATE
  if (error || !product) {
    return (
      <div className="ultra-error-container">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="error-badge"
        >
          ×
        </motion.div>
        <h1>Không thể tải sản phẩm</h1>
        <p>{error || 'Sản phẩm không tồn tại'}</p>
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Home
        </motion.button>
      </div>
    )
  }

  const displayImage = selectedImage || product.imageUrl || PLACEHOLDER_IMAGES.product

  // Use current variant price and stock if available
  const displayPrice = currentVariant?.price || product.price
  const displayOriginalPrice = currentVariant?.originalPrice || product.originalPrice
  const displayStock = currentVariant?.stock ?? product.stock

  const discount =
    displayOriginalPrice && displayOriginalPrice > displayPrice
      ? Math.round((1 - displayPrice / displayOriginalPrice) * 100)
      : 0

  // Prepare all images for modal
  const allImages = [product.imageUrl || PLACEHOLDER_IMAGES.product, ...(product.images || [])]

  // MAIN PRODUCT PAGE
  return (
    <div className="ultra-product-page">
      {/* Breadcrumb */}
      <motion.div
        className="ultra-breadcrumb"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Sản phẩm</Link>
        <span>/</span>
        <span className="current">{product.name}</span>
      </motion.div>

      {/* Main Content - Split Screen */}
      <div className="ultra-split-container">
        {/* LEFT SIDE - IMAGES */}
        <motion.div
          className="ultra-image-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="ultra-image-badges">
            {discount > 0 && (
              <motion.div
                className="ultra-badge discount"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                -{discount}%
              </motion.div>
            )}
            {displayStock > 0 && displayStock < 10 && (
              <motion.div
                className="ultra-badge stock"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                Chỉ còn {displayStock}
              </motion.div>
            )}
          </div>

          <motion.div
            className="ultra-main-image-wrapper"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() =>
              handleOpenImageModal(selectedImage ? product.images.indexOf(selectedImage) + 1 : 0)
            }
            whileHover={{ scale: isZoomed ? 1 : 1.02 }}
            style={{ cursor: 'pointer' }}
          >
            <ProductImage
              src={displayImage}
              alt={product.name}
              className={`ultra-main-image ${isZoomed ? 'zoomed' : ''}`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
            />
            <div className="ultra-zoom-hint">
              <span>{isZoomed ? 'Rê chuột để xem chi tiết' : 'Click để xem lớn hơn'}</span>
            </div>
          </motion.div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <motion.div
              className="ultra-thumbnails"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className={`ultra-thumbnail ${!selectedImage ? 'active' : ''}`}
                onClick={() => {
                  setSelectedImage(null)
                  handleOpenImageModal(0)
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ProductImage
                  src={product.imageUrl || PLACEHOLDER_IMAGES.productSmall}
                  alt={product.name}
                />
              </motion.div>
              {product.images.map((img, idx) => (
                <motion.div
                  key={idx}
                  className={`ultra-thumbnail ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedImage(img)
                    handleOpenImageModal(idx + 1)
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ProductImage src={img} alt={`${product.name} - ${idx + 1}`} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT SIDE - INFO & SPECS */}
        <motion.div
          className="ultra-info-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="ultra-product-header">
            <motion.span
              className="ultra-brand"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {product.brand}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {product.name}
            </motion.h1>
            <motion.div
              className="ultra-rating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star-filled">
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-count">(128 reviews)</span>
              <span className="separator">|</span>
              <span className="sold-count">Đã bán 234</span>
            </motion.div>
          </div>

          {/* Price */}
          <motion.div
            className="ultra-price-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <div className="ultra-price-box">
              <div className="current-price">{displayPrice.toLocaleString()}₫</div>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <>
                  <div className="original-price">{displayOriginalPrice.toLocaleString()}₫</div>
                  <div className="savings">
                    Save: {(displayOriginalPrice - displayPrice).toLocaleString()}₫
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Key Specs with Variant Selectors */}
          <motion.div
            className="ultra-key-specs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Thông số chính</h3>

            {/* Gender Selection */}
            {product.variants &&
              product.variants.length > 0 &&
              (() => {
                const genders = [
                  ...new Set(product.variants.map((v) => v.specifications?.gender).filter(Boolean)),
                ]
                return (
                  genders.length > 0 && (
                    <div className="variant-selector">
                      <label>GIỚI TÍNH</label>
                      <div className="variant-options">
                        {genders.map((gender) => (
                          <motion.button
                            key={gender}
                            className={`variant-option ${selectedGender === gender ? 'active' : ''}`}
                            onClick={() => setSelectedGender(gender)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {gender}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                )
              })()}

            {/* Size Slider */}
            {product.variants &&
              product.variants.length > 0 &&
              (() => {
                const availableSizes = [
                  ...new Set(
                    product.variants
                      .filter((v) => !selectedGender || v.specifications?.gender === selectedGender)
                      .map((v) => v.specifications?.size)
                      .filter(Boolean)
                  ),
                ].sort((a, b) => parseInt(a) - parseInt(b))

                if (availableSizes.length === 0) return null

                const minSize = 34
                const maxSize = 44
                const currentSize = selectedSize
                  ? parseInt(selectedSize)
                  : parseInt(availableSizes[0])

                return (
                  <div className="variant-selector">
                    <label>SIZE: {selectedSize || availableSizes[0]}</label>
                    <div className="size-slider-container">
                      <input
                        type="range"
                        min={minSize}
                        max={maxSize}
                        value={currentSize}
                        onChange={(e) => {
                          const newSize = e.target.value
                          // Check if this size is available
                          const isAvailable = product.variants.some(
                            (v) =>
                              v.specifications?.size === newSize &&
                              (!selectedGender || v.specifications?.gender === selectedGender) &&
                              v.stock > 0
                          )
                          if (isAvailable) {
                            setSelectedSize(newSize)
                          }
                        }}
                        className="size-slider"
                        style={{
                          background: `linear-gradient(to right, #FF8800 0%, #FF8800 ${((currentSize - minSize) / (maxSize - minSize)) * 100}%, #e0e0e0 ${((currentSize - minSize) / (maxSize - minSize)) * 100}%, #e0e0e0 100%)`,
                        }}
                      />
                      <div className="size-labels">
                        <span>{minSize}</span>
                        <span>{maxSize}</span>
                      </div>
                      <div className="available-sizes">
                        Sizes có sẵn: {availableSizes.join(', ')}
                      </div>
                    </div>
                  </div>
                )
              })()}

            {/* Color Selection */}
            {product.variants &&
              product.variants.length > 0 &&
              (() => {
                const colors = [
                  ...new Set(
                    product.variants
                      .filter(
                        (v) =>
                          (!selectedGender || v.specifications?.gender === selectedGender) &&
                          (!selectedSize || v.specifications?.size === selectedSize)
                      )
                      .map((v) => v.specifications?.color)
                      .filter(Boolean)
                  ),
                ]

                // Map color names to hex codes (supports both English & Vietnamese)
                const getColorHex = (colorName) => {
                  const name = (colorName || '').toLowerCase()
                  // Black / Đen
                  if (name.includes('black') || name.includes('đen') || name.includes('core black'))
                    return '#1a1a1a'
                  // White / Trắng
                  if (
                    name.includes('white') ||
                    name.includes('trắng') ||
                    name.includes('cloud white')
                  )
                    return '#ffffff'
                  // Navy
                  if (name.includes('navy')) return '#001f3f'
                  // Red / Đỏ
                  if (name.includes('red') || name.includes('đỏ')) return '#ef4444'
                  // Gray / Grey / Xám
                  if (name.includes('gray') || name.includes('grey') || name.includes('xám'))
                    return '#9ca3af'
                  // Pink / Hồng
                  if (name.includes('pink') || name.includes('hồng')) return '#ec4899'
                  // Purple / Tím
                  if (name.includes('purple') || name.includes('tím')) return '#a855f7'
                  // Blue / Xanh dương
                  if (name.includes('blue') || name.includes('xanh dương')) return '#3b82f6'
                  // Yellow / Vàng
                  if (name.includes('yellow') || name.includes('vàng')) return '#fbbf24'
                  // Orange / Cam
                  if (name.includes('orange') || name.includes('cam')) return '#f97316'
                  // Green / Xanh lá
                  if (name.includes('green') || name.includes('xanh lá')) return '#10b981'
                  // Brown / Nâu
                  if (name.includes('brown') || name.includes('nâu')) return '#92400e'
                  // Default
                  return '#cccccc'
                }

                return (
                  colors.length > 0 && (
                    <div className="variant-selector">
                      <label>MÀU SẮC</label>
                      <div className="variant-options color-options">
                        {colors.map((color) => {
                          const isAvailable = product.variants.some(
                            (v) =>
                              v.specifications?.color === color &&
                              (!selectedGender || v.specifications?.gender === selectedGender) &&
                              (!selectedSize || v.specifications?.size === selectedSize) &&
                              v.stock > 0
                          )
                          return (
                            <motion.button
                              key={color}
                              className={`variant-option color-option ${selectedColor === color ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                              onClick={() => isAvailable && setSelectedColor(color)}
                              disabled={!isAvailable}
                              whileHover={isAvailable ? { scale: 1.05 } : {}}
                              whileTap={isAvailable ? { scale: 0.95 } : {}}
                            >
                              <span
                                className="color-preview"
                                style={{
                                  backgroundColor: getColorHex(color),
                                  border:
                                    color.toLowerCase().includes('white') ||
                                    color.toLowerCase().includes('trắng')
                                      ? '1px solid #ddd'
                                      : 'none',
                                }}
                              />
                              <span className="color-name">{color}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  )
                )
              })()}

            <div className="specs-grid">
              <div className="spec-card">
                <div className="spec-content">
                  <span className="label">Chất liệu</span>
                  <span className="value">
                    {currentVariant?.specifications?.material ||
                      product.variants?.[0]?.specifications?.material ||
                      'Đang cập nhật'}
                  </span>
                </div>
              </div>
              <div className="spec-card">
                <div className="spec-content">
                  <span className="label">Loại giày</span>
                  <span className="value">
                    {currentVariant?.specifications?.shoeType ||
                      product.variants?.[0]?.specifications?.shoeType ||
                      'Đang cập nhật'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            className="ultra-benefits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="benefit-item">
              <div>
                <strong>Miễn phí vận chuyển</strong>
                <span>Cho đơn hàng trên 1 triệu</span>
              </div>
            </div>
            <div className="benefit-item">
              <div>
                <strong>Bảo hành chính hãng</strong>
                <span>12-36 tháng</span>
              </div>
            </div>
            <div className="benefit-item">
              <div>
                <strong>Đổi trả trong 7 ngày</strong>
                <span>Nếu có lỗi từ nhà sản xuất</span>
              </div>
            </div>
            <div className="benefit-item">
              <div>
                <strong>Chính hãng 100%</strong>
                <span>Cam kết hàng chính hãng</span>
              </div>
            </div>
          </motion.div>

          {/* Quantity & Actions */}
          <motion.div
            className="ultra-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="quantity-controls">
                <motion.button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={quantity <= 1}
                >
                  -
                </motion.button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={displayStock}
                />
                <motion.button
                  onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={quantity >= displayStock}
                >
                  +
                </motion.button>
              </div>
              <span className="stock-info">
                {displayStock && displayStock > 0 ? `Còn ${displayStock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            <div className="action-buttons">
              <motion.button
                className="btn-add-cart"
                onClick={handleAddToCart}
                disabled={!displayStock || displayStock <= 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add to Cart
              </motion.button>
              <motion.button
                className="btn-buy-now"
                onClick={handleBuyNow}
                disabled={!displayStock || displayStock <= 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Buy Now
              </motion.button>
              <motion.button
                className={`btn-wishlist ${isInWishlist(product._id) ? 'active' : ''}`}
                onClick={handleToggleWishlist}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isInWishlist(product._id) ? '❤' : '♡'}
              </motion.button>
            </div>
          </motion.div>

          {/* Promotions */}
          <motion.div
            className="ultra-promotions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h4>Khuyến mãi đặc biệt</h4>
            <ul>
              <li>• Giảm thêm 5% khi thanh toán qua VNPay</li>
              <li>• Tặng túi đựng giày cao cấp trị giá 500.000đ</li>
              <li>• Trả góp 0% lãi suất qua thẻ tín dụng</li>
              <li>• Thu cũ đổi mới giá cao</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Detailed Specs & Reviews */}
      <motion.div
        className="ultra-details-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="ultra-tabs">
          <motion.button
            className={activeTab === 'specs' ? 'active' : ''}
            onClick={() => setActiveTab('specs')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Specifications
          </motion.button>
          <motion.button
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Product Description
          </motion.button>
          <motion.button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reviews ({product.reviews?.length || 0})
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <div className="specs-table">
                <div className="spec-row">
                  <span className="spec-label">Thương hiệu:</span>
                  <span className="spec-value">{product.brand}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Size:</span>
                  <span className="spec-value">
                    {product.size ||
                      product.variants?.map((v) => v.size).join(', ') ||
                      'Nhiều size'}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Màu sắc:</span>
                  <span className="spec-value">
                    {product.color ||
                      product.variants?.map((v) => v.color).join(', ') ||
                      'Nhiều màu'}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Chất liệu:</span>
                  <span className="spec-value">
                    {product.material || product.variants?.[0]?.material || 'Đang cập nhật'}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Màn hình:</span>
                  <span className="spec-value">
                    {product.screen || product.specifications?.display || 'Đang cập nhật'}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Card đồ họa:</span>
                  <span className="spec-value">
                    {product.graphics || product.specifications?.graphics || 'Tích hợp'}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Hệ điều hành:</span>
                  <span className="spec-value">
                    {product.os || product.specifications?.operatingSystem || 'Windows 11'}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Trọng lượng:</span>
                  <span className="spec-value">
                    {product.weight || product.specifications?.weight || '~2kg'}
                  </span>
                </div>
                {product.specifications?.battery && (
                  <div className="spec-row">
                    <span className="spec-label">Pin:</span>
                    <span className="spec-value">{product.specifications.battery}</span>
                  </div>
                )}
                <div className="spec-row">
                  <span className="spec-label">Trọng lượng:</span>
                  <span className="spec-value">{product.weight || '~2kg'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'description' && (
            <motion.div
              key="description"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <p>
                {product.description ||
                  'Authentic product, nationwide warranty. Contact hotline 084.686.5650 for more details.'}
              </p>

              {product.features && product.features.length > 0 && (
                <>
                  <h4>✨ Tính năng nổi bật</h4>
                  <ul className="features-list">
                    {product.features.map((feature, idx) => (
                      <li key={idx}>✓ {feature}</li>
                    ))}
                  </ul>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <ReviewList productId={product._id} />

              {user ? (
                showReviewForm ? (
                  <ReviewForm
                    productId={product._id}
                    onReviewSubmitted={() => {
                      setShowReviewForm(false)
                      toast.success('Thank you for your review!')
                    }}
                  />
                ) : (
                  <motion.button
                    className="btn-write-review"
                    onClick={() => setShowReviewForm(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Write a Review
                  </motion.button>
                )
              ) : (
                <p className="login-prompt">
                  <Link to="/login">Login</Link> to write a review
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          className="ultra-related-section"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h2>Similar Products</h2>
          <div className="related-grid">
            {relatedProducts.map((relProduct, idx) => (
              <motion.div
                key={relProduct._id}
                className="related-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + idx * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Link to={`/product/${relProduct._id}`}>
                  <ProductImage
                    src={relProduct.imageUrl || PLACEHOLDER_IMAGES.product}
                    alt={relProduct.name}
                  />
                  <h4>{relProduct.name}</h4>
                  <div className="related-price">{relProduct.price.toLocaleString()}₫</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={handleCloseImageModal}
        images={allImages}
        initialIndex={modalImageIndex}
        productName={product.name}
        product={product}
      />
    </div>
  )
}

export default ProductDetailPageUltra
