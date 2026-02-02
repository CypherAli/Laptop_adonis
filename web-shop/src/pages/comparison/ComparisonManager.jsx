/**
 * ==================== COMPARISON MANAGER COMPONENT ====================
 *
 * PHÂN QUYỀN HỆ THỐNG:
 * - Public: Anyone can compare products (no authentication required)
 * - Limitations: Min 2 products, max 4 products per comparison
 * - Optional: Save comparisons for sharing (requires auth)
 *
 * CORE FUNCTIONS:
 * 1. Product Comparison
 *    - compare() - POST /api/comparisons/compare (productIds array)
 *    - Validates 2-4 products, fetches full details
 *
 * 2. Comparison Display
 *    - Side-by-side table format
 *    - Categories: Price, Stock, Rating, Specifications, Warranty, Features
 *
 * 3. Optional Save/Share
 *    - save() - POST /api/comparisons/save (generates shareable slug)
 *    - getBySlug() - GET /api/comparisons/:slug (load saved comparison)
 *
 * BACKEND LOGIC NOTES:
 * - Price: Calculated from variants (lowest price)
 * - Stock: Sum of all variant stocks
 * - Rating: Average rating + count from reviews
 * - Specifications: Object with key-value pairs
 * - Features: Array of feature strings
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './ComparisonManager.css'

export default function ComparisonManager() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Products state
  const [comparisonProducts, setComparisonProducts] = useState([])
  const [selectedProductIds, setSelectedProductIds] = useState([])

  // Search for products to add
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    // Load product IDs from URL params if present
    const idsParam = searchParams.get('ids')
    if (idsParam) {
      const ids = idsParam.split(',')
      setSelectedProductIds(ids)
      if (ids.length >= 2) {
        handleCompare(ids)
      }
    }
  }, [searchParams])

  // ==================== SEARCH PRODUCTS ====================

  const handleSearchProducts = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await axios.get('/api/products', {
        params: { search: searchQuery, limit: 10 },
      })
      setSearchResults(response.data.products || [])
    } catch (err) {
      setError('Lỗi khi tìm kiếm sản phẩm')
    } finally {
      setSearching(false)
    }
  }

  const handleAddProduct = (productId) => {
    if (selectedProductIds.includes(productId)) {
      setError('Sản phẩm đã được thêm vào so sánh')
      return
    }

    if (selectedProductIds.length >= 4) {
      setError('Bạn chỉ có thể so sánh tối đa 4 sản phẩm')
      return
    }

    const newIds = [...selectedProductIds, productId]
    setSelectedProductIds(newIds)
    setSearchResults([])
    setSearchQuery('')

    if (newIds.length >= 2) {
      handleCompare(newIds)
    }
  }

  const handleRemoveProduct = (productId) => {
    const newIds = selectedProductIds.filter((id) => id !== productId)
    setSelectedProductIds(newIds)

    if (newIds.length >= 2) {
      handleCompare(newIds)
    } else {
      setComparisonProducts([])
    }
  }

  // ==================== COMPARE ====================

  const handleCompare = async (productIds) => {
    if (productIds.length < 2) {
      setError('Vui lòng chọn ít nhất 2 sản phẩm để so sánh')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await axios.post('/api/comparisons/compare', { productIds })
      setComparisonProducts(response.data.products || [])

      // Update URL with product IDs
      navigate(`/compare?ids=${productIds.join(',')}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi so sánh sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  // ==================== HELPERS ====================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const renderRating = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      )
    }
    return <div className="rating-stars">{stars}</div>
  }

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <h1>So Sánh Sản Phẩm</h1>
        <p>So sánh chi tiết để chọn sản phẩm phù hợp nhất</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ==================== PRODUCT SEARCH ==================== */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchProducts()}
            placeholder="Tìm kiếm sản phẩm để thêm vào so sánh..."
            className="search-input"
          />
          <button className="btn btn-primary" onClick={handleSearchProducts} disabled={searching}>
            {searching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((product) => (
              <div key={product._id} className="search-result-item">
                <img src={product.imageUrl || '/placeholder.png'} alt={product.name} />
                <div className="result-info">
                  <div className="result-name">{product.name}</div>
                  <div className="result-price">{formatCurrency(product.basePrice)}</div>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleAddProduct(product._id)}
                  disabled={selectedProductIds.includes(product._id)}
                >
                  {selectedProductIds.includes(product._id) ? 'Đã thêm' : 'Thêm'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== COMPARISON TABLE ==================== */}
      {comparisonProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚖</div>
          <h2>Chưa có sản phẩm nào để so sánh</h2>
          <p>Tìm kiếm và thêm ít nhất 2 sản phẩm để bắt đầu so sánh</p>
        </div>
      ) : (
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="attribute-column">Thuộc Tính</th>
                {comparisonProducts.map((product) => (
                  <th key={product._id} className="product-column">
                    <button
                      className="remove-product-btn"
                      onClick={() => handleRemoveProduct(product._id)}
                      title="Xóa sản phẩm"
                    >
                      ×
                    </button>
                    <img src={product.imageUrl} alt={product.name} />
                    <div className="product-name">{product.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Brand */}
              <tr>
                <td className="attribute-label">Thương Hiệu</td>
                {comparisonProducts.map((p) => (
                  <td key={p._id}>{p.brand || 'N/A'}</td>
                ))}
              </tr>

              {/* Category */}
              <tr>
                <td className="attribute-label">Danh Mục</td>
                {comparisonProducts.map((p) => (
                  <td key={p._id}>{p.category || 'N/A'}</td>
                ))}
              </tr>

              {/* Price */}
              <tr className="highlight-row">
                <td className="attribute-label">Giá Bán</td>
                {comparisonProducts.map((p) => (
                  <td key={p._id} className="price-cell">
                    <div className="current-price">{formatCurrency(p.price)}</div>
                    {p.originalPrice && p.price < p.originalPrice && (
                      <div className="original-price">{formatCurrency(p.originalPrice)}</div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Stock */}
              <tr>
                <td className="attribute-label">Tồn Kho</td>
                {comparisonProducts.map((p) => (
                  <td key={p._id}>
                    {p.stock > 0 ? (
                      <span className="in-stock">Còn {p.stock}</span>
                    ) : (
                      <span className="out-of-stock">Hết hàng</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="attribute-label">Đánh Giá</td>
                {comparisonProducts.map((p) => (
                  <td key={p._id}>
                    {renderRating(p.rating?.average || 0)}
                    <div className="rating-count">({p.rating?.count || 0} đánh giá)</div>
                  </td>
                ))}
              </tr>

              {/* Specifications */}
              {comparisonProducts.some(
                (p) => p.specifications && Object.keys(p.specifications).length > 0
              ) && (
                <>
                  <tr className="section-header">
                    <td colSpan={comparisonProducts.length + 1}>THÔNG SỐ KỸ THUẬT</td>
                  </tr>
                  {Object.keys(comparisonProducts[0].specifications || {}).map((specKey) => (
                    <tr key={specKey}>
                      <td className="attribute-label">{specKey}</td>
                      {comparisonProducts.map((p) => (
                        <td key={p._id}>{p.specifications?.[specKey] || 'N/A'}</td>
                      ))}
                    </tr>
                  ))}
                </>
              )}

              {/* Features */}
              {comparisonProducts.some((p) => p.features && p.features.length > 0) && (
                <tr>
                  <td className="attribute-label">Tính Năng</td>
                  {comparisonProducts.map((p) => (
                    <td key={p._id}>
                      <ul className="features-list">
                        {(p.features || []).map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              )}

              {/* Actions */}
              <tr className="action-row">
                <td className="attribute-label">Hành Động</td>
                {comparisonProducts.map((p) => (
                  <td key={p._id}>
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => navigate(`/products/${p._id}`)}
                    >
                      Xem Chi Tiết
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
