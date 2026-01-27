import React, { useState, useEffect, useMemo, useContext } from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiShoppingCart } from 'react-icons/fi'
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder'
import ImageModal from './ImageModal'
import AuthContext from '../../context/AuthContext'
import './QuickViewModal.css'

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  const { user } = useContext(AuthContext)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // Interactive variant selection
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedGender, setSelectedGender] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  // Additional options that affect price
  const [selectedEdition, setSelectedEdition] = useState('Standard') // Standard, Premium, Limited
  const [selectedSoleType, setSelectedSoleType] = useState('Regular') // Regular, Air, Boost
  const [selectedBoxType, setSelectedBoxType] = useState('Standard') // Standard, Premium
  const [selectedWarranty, setSelectedWarranty] = useState('12') // 12, 24, 36 months
  const [hasPersonalization, setHasPersonalization] = useState(false)

  // User notes (only when logged in)
  const [userNotes, setUserNotes] = useState('')

  useEffect(() => {
    // Reset states when product changes
    if (product) {
      setSelectedImage(null)
      // Auto-select first variant or default size
      if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0]
        setSelectedSize(firstVariant.specifications?.size || firstVariant.size || '39')
        setSelectedColor(firstVariant.specifications?.color || firstVariant.color)
        setSelectedGender(firstVariant.specifications?.gender || firstVariant.gender || 'Unisex')
        setSelectedVariant(firstVariant)
      } else {
        // Default size if no variants
        setSelectedSize('39')
        setSelectedGender('Unisex')
      }
    }

    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden'

    // Handle ESC key press
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [product, onClose])

  // Edition pricing (affects base price)
  const editionPricing = {
    'Standard': 0,
    'Premium': 500000, // +500k
    'Limited Edition': 1200000, // +1.2M
  }

  // Sole type pricing
  const soleTypePricing = {
    'Regular': 0,
    'Air Max': 800000, // +800k
    'Boost Technology': 1000000, // +1M
  }

  // Box type pricing
  const boxPricing = {
    'Standard': 0,
    'Premium Box': 200000, // +200k includes cleaning kit
    'Collector Edition': 500000, // +500k includes display case
  }

  // Warranty pricing
  const warrantyPricing = {
    12: 0,
    24: 300000, // +300k for 2 years
    36: 600000, // +600k for 3 years
  }

  // Personalization pricing
  const personalizationPrice = 400000 // +400k for custom text/design

  // Get unique genders from variants
  const genderOptions = useMemo(() => {
    if (!product?.variants) return ['Nam', 'Nữ', 'Unisex']
    const genders = [
      ...new Set(product.variants.map((v) => v.specifications?.gender || v.gender)),
    ].filter(Boolean)
    // Always return default if no genders found
    return genders.length > 0 ? genders : ['Nam', 'Nữ', 'Unisex']
  }, [product])

  // Get ALL available colors (không filter theo gender - hiển thị tất cả màu)
  const availableColors = useMemo(() => {
    if (!product?.variants) return []
    // Lấy tất cả màu có trong database, không filter theo gender
    const colors = [...new Set(product.variants.map((v) => v.specifications?.color || v.color))]
    return colors.filter(Boolean)
  }, [product])

  // Get ALL available sizes (34-44, hiển thị tất cả)
  const availableSizes = useMemo(() => {
    // Tạo array đầy đủ từ 34 đến 44 với bước 0.5
    const allSizes = []
    for (let size = 34; size <= 44; size += 0.5) {
      allSizes.push(size.toString())
    }
    return allSizes
  }, [])

  // Reset logic removed - cho phép chọn bất kỳ gender/color/size nào
  // Nếu combo không có trong database, sẽ hiển thị "Hết hàng" khi add to cart
  useEffect(() => {
    // Không auto-reset nữa, user tự do chọn
  }, [selectedGender, availableColors, availableSizes, selectedColor, selectedSize, product])

  // Update selected variant when size/color/gender changes
  // IMPORTANT: Each combination of (gender + size + color) has its own price
  // Example:
  // - Black Nam Size 41 = 2,975,000đ
  // - Pink Nữ Size 36 = 4,875,000đ
  // - Black Nữ Size 36 = 3,500,000đ
  // This allows admin/partner to set different prices per variant combination
  useEffect(() => {
    if (!product?.variants || !selectedSize || !selectedColor || !selectedGender) return

    const matchedVariant = product.variants.find((v) => {
      const vSize = v.specifications?.size || v.size
      const vColor = v.specifications?.color || v.color
      const vGender = v.specifications?.gender || v.gender
      return vSize === selectedSize && vColor === selectedColor && vGender === selectedGender
    })

    if (matchedVariant) {
      setSelectedVariant(matchedVariant)
      console.log(
        'Matched variant:',
        matchedVariant.variantName,
        '- Price:',
        matchedVariant.price.toLocaleString() + 'đ'
      )
    } else {
      setSelectedVariant(null)
      console.warn('Hết hàng - No variant found for:', {
        gender: selectedGender,
        size: selectedSize,
        color: selectedColor,
      })
    }
  }, [selectedSize, selectedColor, selectedGender, product])

  // Current display price and stock
  const currentPrice = selectedVariant?.price || product?.price || 0
  const currentStock = selectedVariant?.stock || 0
  const isOutOfStock = !selectedVariant || currentStock === 0
  const currentOriginalPrice = selectedVariant?.originalPrice || product?.originalPrice

  // Calculate final price with all options (size doesn't affect price)
  const finalPrice =
    currentPrice +
    editionPricing[selectedEdition] +
    soleTypePricing[selectedSoleType] +
    boxPricing[selectedBoxType] +
    warrantyPricing[selectedWarranty] +
    (hasPersonalization ? personalizationPrice : 0)

  // Create display product with default values
  const displayProduct = useMemo(() => {
    if (!product) return null

    // Calculate price from variants
    const getPrice = () => {
      if (product.variants && product.variants.length > 0) {
        const prices = product.variants.map((v) => v.price)
        return Math.min(...prices)
      }
      return product.price || 0
    }

    // Calculate total stock
    const getTotalStock = () => {
      if (product.variants && product.variants.length > 0) {
        return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      }
      return product.stock || 0
    }

    const price = getPrice()
    const totalStock = getTotalStock()

    return {
      ...product,
      price: price,
      totalStock: totalStock,
      size:
        product.variants?.[0]?.specifications?.size ||
        product.variants?.[0]?.size ||
        'Multiple sizes',
      color:
        product.variants?.[0]?.specifications?.color ||
        product.variants?.[0]?.color ||
        'Multiple colors',
      material:
        product.variants?.[0]?.specifications?.material ||
        product.variants?.[0]?.material ||
        'Premium material',
      description:
        product.description ||
        'Authentic shoe product with high quality, modern design, suitable for all activities. Official nationwide warranty.',
      features:
        product.features && product.features.length > 0
          ? product.features
          : [
              'Brand new 100%, authentic',
              'Official warranty 12-24 months',
              'Nationwide delivery, flexible payment',
              '0% interest installment support',
              'Gift: Shoe cleaning kit',
            ],
      brand: product.brand || 'Shoe Brand',
      name: product.name || 'Shoe product',
      inStock: totalStock > 0,
    }
  }, [product])

  // Prepare all images for modal - using useMemo to ensure it updates with displayProduct
  const allImages = useMemo(() => {
    if (!displayProduct) return []
    return [displayProduct.imageUrl || PLACEHOLDER_IMAGES.product, ...(displayProduct.images || [])]
  }, [displayProduct])

  if (!displayProduct) return null

  const displayImage = selectedImage || displayProduct.imageUrl || PLACEHOLDER_IMAGES.product

  const handleCloseImageModal = () => {
    setShowImageModal(false)
  }

  // eslint-disable-next-line no-unused-vars
  const handleOpenImageModal = (index) => {
    setModalImageIndex(index)
    setShowImageModal(true)
  }

  // Log final values for debugging
  console.log('QuickView State:', {
    genderOptions: genderOptions,
    availableColors: availableColors,
    availableSizes: availableSizes,
    selected: {
      gender: selectedGender,
      size: selectedSize,
      color: selectedColor,
    },
    selectedVariant: selectedVariant
      ? {
          name: selectedVariant.variantName,
          price: selectedVariant.price,
          sku: selectedVariant.sku,
        }
      : null,
    pricing: {
      basePrice: currentPrice,
      finalPrice: finalPrice,
      stock: currentStock,
    },
  })

  // Handle add to cart with selected variant
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor || !selectedGender) {
      alert('Vui lòng chọn đầy đủ giới tính, size và màu sắc!')
      return
    }
    if (isOutOfStock) {
      alert(
        `Hết hàng!\n\nSản phẩm: ${selectedGender} • Size ${selectedSize} • ${selectedColor}\n\nKhông có sẵn trong kho. Vui lòng chọn phiên bản khác.`
      )
      return
    }
    if (currentStock <= 0) {
      alert('Sản phẩm tạm hết hàng!')
      return
    }
    onAddToCart({
      ...displayProduct,
      selectedVariant,
      selectedSize,
      selectedColor,
      selectedGender,
      userNotes: user ? userNotes : null, // Include notes if user is logged in
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quickview-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="quickview-close-btn" onClick={onClose}>
          <FiX />
        </button>

        {/* Header với Gradient Tím */}
        <div className="quickview-header">
          <h3>{displayProduct.name}</h3>
        </div>

        {/* Body - 2 Cột */}
        <div className="quickview-body">
          {/* LEFT - Images (60%) */}
          <div className="quickview-left">
            {/* Main Image với Zoom */}
            <div className="quickview-main-image">
              <img
                src={displayImage}
                alt={displayProduct.name}
                onError={(e) => (e.target.src = PLACEHOLDER_IMAGES.product)}
                className="zoomable-image"
              />
            </div>

            {/* Thumbnails */}
            {displayProduct.images && displayProduct.images.length > 0 && (
              <div className="quickview-thumbnails">
                <div
                  className={`quickview-thumb ${!selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(null)}
                >
                  <img
                    src={displayProduct.imageUrl || PLACEHOLDER_IMAGES.productSmall}
                    alt={displayProduct.name}
                    onError={(e) => (e.target.src = PLACEHOLDER_IMAGES.productSmall)}
                  />
                </div>
                {displayProduct.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`quickview-thumb ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${displayProduct.name} - ${idx + 1}`}
                      onError={(e) => (e.target.src = PLACEHOLDER_IMAGES.productSmall)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - Product Info (40%) */}
          <div className="quickview-right">
            {/* Dynamic Price - Changes with variant selection - STICKY */}
            <div className="quickview-price-section">
              {/* Brand Badge */}
              {displayProduct.brand && (
                <div className="quickview-brand-badge">{displayProduct.brand}</div>
              )}

              {/* Product Name */}
              <h2 className="quickview-product-name">{displayProduct.name}</h2>

              {/* Price Info */}
              <div
                className="quickview-current-price"
                style={{
                  fontSize: '26px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '3px',
                }}
              >
                {finalPrice.toLocaleString()}₫
              </div>
              {(selectedVariant || selectedGender) && (
                <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>
                  Giá cho:{' '}
                  <span style={{ fontWeight: '600', color: isOutOfStock ? '#dc2626' : '#1f2937' }}>
                    {selectedGender} • Size {selectedSize} • {selectedColor}
                    {isOutOfStock && (
                      <span style={{ color: '#dc2626', marginLeft: '8px' }}>Hết hàng</span>
                    )}
                  </span>
                </div>
              )}
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}
                >
                  <div
                    className="quickview-original-price"
                    style={{
                      textDecoration: 'line-through',
                      color: '#9ca3af',
                      fontSize: '14px',
                    }}
                  >
                    {currentOriginalPrice.toLocaleString()}₫
                  </div>
                  <span
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    -{Math.round((1 - currentPrice / currentOriginalPrice) * 100)}%
                  </span>
                </div>
              )}
              <div
                style={{
                  marginTop: '4px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    color: currentStock > 0 ? '#10b981' : '#ef4444',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {currentStock > 0 ? `Còn ${currentStock} sản phẩm` : 'Tạm hết hàng'}
                </div>
                {finalPrice !== currentPrice && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6366f1',
                      background: '#eef2ff',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      fontWeight: '600',
                    }}
                  >
                    +{(finalPrice - currentPrice).toLocaleString()}₫ từ options
                  </div>
                )}
              </div>
            </div>

            {/* SCROLLABLE CONTENT - Gender, Size, Color, Options */}
            <div className="quickview-scrollable-content">
              {/* Gender Selector */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    marginBottom: '10px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Giới tính
                </h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {genderOptions.map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        border:
                          selectedGender === gender ? '2px solid #6366f1' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        background: selectedGender === gender ? '#eef2ff' : 'white',
                        color: selectedGender === gender ? '#6366f1' : '#6b7280',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedGender !== gender) {
                          e.currentTarget.style.borderColor = '#cbd5e1'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedGender !== gender) {
                          e.currentTarget.style.borderColor = '#e5e7eb'
                        }
                      }}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector - Slider 34-44 */}
              <div style={{ marginBottom: '25px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <h4 style={{ fontSize: '14px', color: '#374151', fontWeight: '600', margin: 0 }}>
                    Chọn size <span style={{ color: '#ef4444' }}>*</span>
                  </h4>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#6366f1',
                      background: '#eef2ff',
                      padding: '8px 20px',
                      borderRadius: '12px',
                      border: '2px solid #6366f1',
                    }}
                  >
                    Size {selectedSize || '36'}
                  </div>
                </div>

                {/* Range Slider 34-44 */}
                <div style={{ position: 'relative', paddingTop: '10px' }}>
                  {/* Size markers */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      paddingLeft: '5px',
                      paddingRight: '5px',
                    }}
                  >
                    {[34, 36, 38, 40, 42, 44].map((size) => (
                      <span
                        key={size}
                        style={{
                          fontSize: '11px',
                          color: parseFloat(selectedSize) === size ? '#6366f1' : '#9ca3af',
                          fontWeight: parseFloat(selectedSize) === size ? '700' : '500',
                        }}
                      >
                        {size}
                      </span>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="34"
                    max="44"
                    step="0.5"
                    value={parseFloat(selectedSize) || 36}
                    onChange={(e) => {
                      const size = parseFloat(e.target.value)
                      const sizeStr = size.toString()
                      // Cho phép chọn bất kỳ size nào, không check hasVariant
                      setSelectedSize(sizeStr)
                    }}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '8px',
                      background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((parseFloat(selectedSize || 36) - 34) / 10) * 100}%, #e5e7eb ${((parseFloat(selectedSize || 36) - 34) / 10) * 100}%, #e5e7eb 100%)`,
                      outline: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>

              {/* Color Selector - Circular Color Buttons */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    marginBottom: '10px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Chọn màu sắc <span style={{ color: '#ef4444' }}>*</span>
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {availableColors.map((color) => {
                    const getColorHex = (colorName) => {
                      const name = colorName?.toLowerCase() || ''
                      if (name.includes('black') || name.includes('core black')) return '#1f2937'
                      if (name.includes('white') || name.includes('cloud white')) return '#ffffff'
                      if (name.includes('red') || name.includes('solar red')) return '#ef4444'
                      if (name.includes('navy')) return '#1e3a8a'
                      if (name.includes('blue')) return '#3b82f6'
                      if (name.includes('green')) return '#10b981'
                      if (name.includes('yellow') || name.includes('solar yellow')) return '#fbbf24'
                      if (name.includes('pink')) return '#ec4899'
                      if (name.includes('purple')) return '#a855f7'
                      if (name.includes('gray') || name.includes('grey')) return '#6b7280'
                      if (name.includes('orange')) return '#f97316'
                      if (name.includes('silver')) return '#c0c0c0'
                      if (name.includes('turquoise')) return '#14b8a6'
                      return '#9ca3af'
                    }

                    const colorHex = getColorHex(color)
                    // Check xem màu này có trong database với gender hiện tại không
                    const isAvailable = product.variants.some((v) => {
                      const matchGender = (v.specifications?.gender || v.gender) === selectedGender
                      const matchColor = (v.specifications?.color || v.color) === color
                      return matchGender && matchColor && v.stock > 0
                    })

                    return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color)
                          // Tự động nhảy đến size đầu tiên có sẵn cho màu này
                          if (isAvailable) {
                            const availableSizesForColor = product.variants
                              .filter((v) => {
                                const matchGender =
                                  (v.specifications?.gender || v.gender) === selectedGender
                                const matchColor = (v.specifications?.color || v.color) === color
                                return matchGender && matchColor && v.stock > 0
                              })
                              .map((v) => v.specifications?.size || v.size)
                              .sort((a, b) => parseFloat(a) - parseFloat(b))

                            if (availableSizesForColor.length > 0) {
                              setSelectedSize(availableSizesForColor[0])
                            }
                          }
                        }}
                        title={`${color}${!isAvailable ? ' (Hết hàng)' : ''}`}
                        style={{
                          width: '28px',
                          height: '28px',
                          border:
                            selectedColor === color
                              ? '3px solid #6366f1'
                              : colorHex === '#ffffff'
                                ? '2px solid #d1d5db'
                                : '2px solid transparent',
                          borderRadius: '50%',
                          background: colorHex,
                          cursor: 'pointer',
                          transform: selectedColor === color ? 'scale(1.05)' : 'scale(1)',
                          opacity: isAvailable ? 1 : 0.4,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform =
                            selectedColor === color ? 'scale(1.05)' : 'scale(1)'
                          e.currentTarget.style.boxShadow =
                            selectedColor === color ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                        }}
                      />
                    )
                  })}
                </div>
                {selectedColor && (
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    Màu đã chọn:{' '}
                    <span style={{ color: '#1f2937', fontWeight: '600' }}>{selectedColor}</span>
                  </div>
                )}
              </div>

              {/* Edition Selector */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    marginBottom: '10px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Phiên bản{' '}
                  <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>
                    (Ảnh hưởng giá)
                  </span>
                </h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {Object.keys(editionPricing).map((edition) => (
                    <button
                      key={edition}
                      onClick={() => setSelectedEdition(edition)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border:
                          selectedEdition === edition ? '2px solid #6366f1' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        background: selectedEdition === edition ? '#eef2ff' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: '600',
                          fontSize: '13px',
                          color: selectedEdition === edition ? '#6366f1' : '#374151',
                        }}
                      >
                        {edition}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                        {editionPricing[edition] === 0
                          ? 'Giá cơ bản'
                          : `+${(editionPricing[edition] / 1000).toFixed(0)}k`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sole Type Selector */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    marginBottom: '10px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Công nghệ đế{' '}
                  <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>
                    (Ảnh hưởng giá)
                  </span>
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {Object.keys(soleTypePricing).map((sole) => (
                    <button
                      key={sole}
                      onClick={() => setSelectedSoleType(sole)}
                      style={{
                        padding: '10px 18px',
                        border:
                          selectedSoleType === sole ? '2px solid #10b981' : '2px solid #e5e7eb',
                        borderRadius: '20px',
                        background: selectedSoleType === sole ? '#d1fae5' : 'white',
                        color: selectedSoleType === sole ? '#047857' : '#374151',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {sole}{' '}
                      {soleTypePricing[sole] > 0 &&
                        `(+${(soleTypePricing[sole] / 1000).toFixed(0)}k)`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box Type Selector */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    marginBottom: '10px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Loại hộp{' '}
                  <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>
                    (Ảnh hưởng giá)
                  </span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.keys(boxPricing).map((box) => (
                    <button
                      key={box}
                      onClick={() => setSelectedBoxType(box)}
                      style={{
                        padding: '12px 16px',
                        border: selectedBoxType === box ? '2px solid #f59e0b' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        background: selectedBoxType === box ? '#fef3c7' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: '600',
                            fontSize: '13px',
                            color: selectedBoxType === box ? '#d97706' : '#374151',
                          }}
                        >
                          {box}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {boxPricing[box] === 0
                            ? 'Miễn phí'
                            : `+${(boxPricing[box] / 1000).toFixed(0)}k`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warranty Selector */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    marginBottom: '10px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Bảo hành{' '}
                  <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>
                    (Ảnh hưởng giá)
                  </span>
                </h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {Object.keys(warrantyPricing).map((warranty) => (
                    <button
                      key={warranty}
                      onClick={() => setSelectedWarranty(warranty)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border:
                          selectedWarranty === warranty ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        background: selectedWarranty === warranty ? '#ede9fe' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: '600',
                          fontSize: '14px',
                          color: selectedWarranty === warranty ? '#7c3aed' : '#374151',
                        }}
                      >
                        {warranty} tháng
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                        {warrantyPricing[warranty] === 0
                          ? 'Miễn phí'
                          : `+${(warrantyPricing[warranty] / 1000).toFixed(0)}k`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalization Toggle */}
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    fontSize: '14px',
                    marginBottom: '10px',
                    color: '#374151',
                    fontWeight: '600',
                  }}
                >
                  Tuỳ chỉnh cá nhân{' '}
                  <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>
                    (Ảnh hưởng giá)
                  </span>
                </h4>
                <button
                  onClick={() => setHasPersonalization(!hasPersonalization)}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    border: hasPersonalization ? '2px solid #ec4899' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    background: hasPersonalization ? '#fce7f3' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div
                      style={{
                        fontWeight: '600',
                        fontSize: '13px',
                        color: hasPersonalization ? '#db2777' : '#374151',
                      }}
                    >
                      {hasPersonalization ? 'Đã chọn' : ''} In tên/thiết kế riêng
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                      Thêm text hoặc hình ảnh lên giày
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: hasPersonalization ? '#db2777' : '#6b7280',
                    }}
                  >
                    +{(personalizationPrice / 1000).toFixed(0)}k
                  </div>
                </button>
              </div>

              {/* Material Info */}
              <div
                style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                  <strong>Chất liệu:</strong>{' '}
                  {selectedVariant?.specifications?.material || displayProduct.material}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  <strong>Loại:</strong> {selectedVariant?.specifications?.shoeType || 'Sneakers'}
                </div>
              </div>

              {/* User Notes - Only when logged in */}
              {user && (
                <div style={{ marginBottom: '20px' }}>
                  <h4
                    style={{
                      fontSize: '14px',
                      marginBottom: '10px',
                      color: '#374151',
                      fontWeight: '600',
                    }}
                  >
                    Ghi chú của bạn
                  </h4>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Viết ghi chú về đôi giày này (màu sắc yêu thích, size đặc biệt, yêu cầu đặc biệt...)"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                    Ghi chú của bạn sẽ được lưu cùng đơn hàng
                  </div>
                </div>
              )}

              {/* Specs */}
              <div className="quickview-specs" style={{ display: 'none' }}>
                {/* Hidden old specs */}
              </div>

              {/* Description */}
              <div className="quickview-description">
                <h4>Product Description</h4>
                <p className="description-text">{displayProduct.description}</p>
              </div>

              {/* Features */}
              {displayProduct.features && displayProduct.features.length > 0 && (
                <div className="quickview-features">
                  <h4>Highlights</h4>
                  <ul className="features-list">
                    {displayProduct.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="quickview-actions">
              {/* Admin và Partner không cần add to cart */}
              {user?.role !== 'admin' && user?.role !== 'partner' && (
                <button
                  className="quickview-btn-cart"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  style={{
                    opacity: isOutOfStock ? 0.5 : 1,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    background: isOutOfStock ? '#f87171' : '#6366f1',
                  }}
                >
                  <FiShoppingCart /> {isOutOfStock ? '❌ Hết hàng' : 'Thêm vào giỏ'}
                </button>
              )}
              <Link
                to={`/product/${displayProduct._id}`}
                className="quickview-btn-detail"
                onClick={onClose}
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal - Popup to view images in full size - Rendered outside QuickView */}
      {showImageModal && (
        <ImageModal
          isOpen={showImageModal}
          onClose={handleCloseImageModal}
          images={allImages}
          initialIndex={modalImageIndex}
          productName={displayProduct.name}
          product={displayProduct}
        />
      )}
    </div>
  )
}

export default QuickViewModal
