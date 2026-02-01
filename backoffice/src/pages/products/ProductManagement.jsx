import React, { useState, useEffect, useCallback, useContext } from 'react'
import axios from '../../api/axiosConfig'
import AuthContext from '../../context/AuthContext'
import './ProductManagement.css'

/**
 * ============================================
 * PRODUCT MANAGEMENT SYSTEM - REACT TEMPLATE
 * ============================================
 * 
 * PHÂN QUYỀN HỆ THỐNG:
 * 
 * 1. ADMIN (Backend - Full Access):
 *    - Quản lý TẤT CẢ sản phẩm (CRUD)
 *    - Approve/Reject partner products
 *    - View all stats
 * 
 * 2. PARTNER/SELLER (Frontend - Shop Owner):
 *    - Xem sản phẩm CỦA SHOP MÌNH
 *    - Tạo sản phẩm mới (nếu isApproved = true)
 *    - Sửa/Xóa sản phẩm của mình
 *    - KHÔNG được sửa sản phẩm của shop khác
 * 
 * 3. CUSTOMER (Frontend - Người mua):
 *    - Xem tất cả sản phẩm (chỉ đọc)
 *    - Tìm kiếm, lọc, sắp xếp
 *    - KHÔNG được tạo/sửa/xóa
 * 
 * 4. GUEST (Chưa đăng nhập):
 *    - Xem sản phẩm công khai
 *    - KHÔNG được thực hiện thao tác CRUD
 * 
 * PRODUCT VARIANTS:
 * - Mỗi product có nhiều variants (size, color, material...)
 * - Mỗi variant có: sku, price, stock, specs
 * - Validation: product phải có ít nhất 1 variant
 * 
 * 6 CORE FUNCTIONS:
 * 1. fetchMyProducts() - GET /api/products/my - Lấy sản phẩm của partner
 * 2. fetchProducts() - GET /api/products - List với filters + pagination
 * 3. fetchProductDetail() - GET /api/products/:id - Chi tiết + increment view
 * 4. createProduct() - POST /api/products - Tạo mới (Partner/Admin only)
 * 5. updateProduct() - PUT /api/products/:id - Cập nhật (Owner/Admin only)
 * 6. deleteProduct() - DELETE /api/products/:id - Xóa cứng + cascade cleanup
 */

const ProductManagement = () => {
  // ==================== AUTH CONTEXT ====================
  const { user: currentUser } = useContext(AuthContext)
  
  // ==================== STATE MANAGEMENT ====================
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Pagination & Filters
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    totalProducts: 0,
  })
  
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    brand: '',
    inStock: '',
    sortBy: 'createdAt',
    size: '',
    color: '',
    material: '',
  })

  // Form states
  const [createMode, setCreateMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    category: '',
    brand: '',
    images: [],
    features: [],
    warranty: '',
    isFeatured: false,
    isActive: true,
    variants: [
      {
        variantName: 'Mặc định',
        sku: '',
        price: 0,
        stock: 0,
        size: '',
        color: '',
        material: '',
        weight: '',
        isAvailable: true,
      },
    ],
  })

  // ==================== PERMISSION CHECKS ====================
  /**
   * hasPermission() - Kiểm tra quyền theo ROLE
   * 
   * PARTNER (role: 'partner'):
   *   - VIEW_OWN_PRODUCTS - Xem sản phẩm của shop mình
   *   - CREATE_PRODUCT - Tạo sản phẩm (nếu isApproved)
   *   - UPDATE_OWN_PRODUCT - Sửa sản phẩm của mình
   *   - DELETE_OWN_PRODUCT - Xóa sản phẩm của mình
   * 
   * ADMIN (role: 'admin'):
   *   - Full permissions (tất cả sản phẩm)
   * 
   * CUSTOMER (role: 'customer'):
   *   - VIEW_PRODUCTS - Chỉ xem, không CRUD
   */
  const hasPermission = useCallback((action) => {
    if (!currentUser) return false

    const permissions = {
      VIEW_PRODUCTS: true, // Tất cả users
      VIEW_OWN_PRODUCTS: ['admin', 'partner'].includes(currentUser.role),
      CREATE_PRODUCT: ['admin', 'partner'].includes(currentUser.role) && 
                      (currentUser.role === 'admin' || currentUser.isApproved),
      UPDATE_PRODUCT: ['admin', 'partner'].includes(currentUser.role),
      DELETE_PRODUCT: ['admin', 'partner'].includes(currentUser.role),
    }

    return permissions[action] || false
  }, [currentUser])

  /**
   * canModifyProduct() - Kiểm tra quyền sửa/xóa 1 product cụ thể
   * Backend logic: partner chỉ sửa/xóa được product của mình
   */
  const canModifyProduct = useCallback((product) => {
    if (!currentUser) return false
    
    const isAdmin = currentUser.role === 'admin'
    const isOwner = product.createdBy === currentUser.id || 
                    product.createdBy?._id === currentUser.id
    
    return isAdmin || isOwner
  }, [currentUser])

  // ==================== API CALLS ====================

  // 1. GET MY PRODUCTS (Partner only)
  /**
   * fetchMyProducts() - Backend: myProducts() method
   * API: GET /api/products/my
   * 
   * Backend Logic:
   * - Partner: filter by partnerId = user.id
   * - Admin: no filter (xem tất cả)
   */
  const fetchMyProducts = useCallback(async () => {
    console.log('Fetching my products...')
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/products/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { products: fetchedProducts } = response.data
      console.log('My products fetched:', fetchedProducts.length)

      setProducts(fetchedProducts)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải sản phẩm')
      console.error('Fetch my products error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 2. GET ALL PRODUCTS (with filters)
  /**
   * fetchProducts() - Backend: index() method
   * API: GET /api/products
   * 
   * Params:
   * - page, limit
   * - search, minPrice, maxPrice, brand
   * - size, color, material
   * - inStock, sortBy
   */
  const fetchProducts = useCallback(async (page = 1) => {
    console.log('🔍 Fetching products...', { 
      page, 
      filters,
      axiosBaseURL: axios.defaults.baseURL,
      axiosInstance: axios
    })
    setLoading(true)
    setError(null)

    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters,
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key]
        }
      })

      // Debug: Check nếu baseURL có chứa /api
      const hasApiInBase = axios.defaults.baseURL?.includes('/api')
      const apiPath = hasApiInBase ? '/products' : '/api/products'
      
      console.log('📡 API Request:', {
        hasApiInBase,
        apiPath,
        params,
        baseURL: axios.defaults.baseURL,
        finalUrl: `${axios.defaults.baseURL}${apiPath}`
      })

      const response = await axios.get(apiPath, { params })

      const { products: fetchedProducts, currentPage, totalPages, totalProducts } = response.data
      console.log('✅ Products fetched:', {
        total: totalProducts,
        count: fetchedProducts?.length
      })

      setProducts(fetchedProducts)
      setPagination({ ...pagination, page: currentPage, totalPages, totalProducts })
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi tải sản phẩm'
      console.error('❌ Fetch products error:', {
        status: err.response?.status,
        message: errorMsg,
        url: err.config?.url,
        fullError: err
      })
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit])

  // 3. GET PRODUCT DETAIL
  /**
   * fetchProductDetail() - Backend: show() method
   * API: GET /api/products/:id
   * 
   * Backend auto increment viewCount
   */
  const fetchProductDetail = useCallback(async (productId) => {
    console.log('Fetching product detail:', productId)
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/products/${productId}`)
      const { product } = response.data

      console.log('Product detail loaded:', product._id)
      setSelectedProduct(product)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải chi tiết sản phẩm')
      console.error('Fetch product detail error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 4. CREATE PRODUCT
  /**
   * createProduct() - Backend: store() method
   * API: POST /api/products
   * 
   * Backend Logic:
   * - Chỉ partner (isApproved) và admin
   * - Validation: name, description, basePrice, category, brand
   * - Phải có ít nhất 1 variant
   * - Auto set createdBy = user.id
   */
  const createProduct = useCallback(async (productData) => {
    console.log('Creating product...', productData)
    setLoading(true)
    setError(null)

    try {
      // Validation
      if (!productData.name || !productData.description) {
        setError('Tên và mô tả sản phẩm là bắt buộc')
        setLoading(false)
        return
      }

      if (!productData.category || !productData.brand) {
        setError('Danh mục và thương hiệu là bắt buộc')
        setLoading(false)
        return
      }

      if (!productData.variants || productData.variants.length === 0) {
        setError('Sản phẩm phải có ít nhất 1 biến thể')
        setLoading(false)
        return
      }

      // Validate variants
      for (const variant of productData.variants) {
        if (!variant.variantName || !variant.sku || variant.price === undefined) {
          setError('Mỗi biến thể phải có tên, SKU và giá')
          setLoading(false)
          return
        }
      }

      const response = await axios.post('/api/products', productData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { product, message } = response.data
      console.log('Product created:', product._id)

      setSuccess(message)
      setProducts([product, ...products])
      setCreateMode(false)
      resetFormData()

      // Auto-refresh list
      setTimeout(() => fetchMyProducts(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo sản phẩm')
      console.error('Create product error:', err)
    } finally {
      setLoading(false)
    }
  }, [products, fetchMyProducts])

  // 5. UPDATE PRODUCT
  /**
   * updateProduct() - Backend: update() method
   * API: PUT /api/products/:id
   * 
   * Backend Logic:
   * - Partner chỉ sửa product của mình (check ownership)
   * - Admin sửa tất cả
   */
  const updateProduct = useCallback(async (productId, productData) => {
    console.log('Updating product:', productId)
    
    if (!hasPermission('UPDATE_PRODUCT')) {
      setError('Bạn không có quyền cập nhật sản phẩm')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.put(`/api/products/${productId}`, productData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { product, message } = response.data
      console.log('Product updated:', product._id)

      setSuccess(message)
      setSelectedProduct(product)
      setProducts(products.map(p => p._id === productId ? product : p))
      setEditMode(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật sản phẩm')
      console.error('Update product error:', err)
    } finally {
      setLoading(false)
    }
  }, [hasPermission, products])

  // 6. DELETE PRODUCT (HARD DELETE)
  /**
   * deleteProduct() - Backend: destroy() method
   * API: DELETE /api/products/:id
   * 
   * Backend Logic:
   * - Partner chỉ xóa product của mình
   * - Admin xóa tất cả
   * - Xóa cứng (vĩnh viễn) + cascade:
   *   * Xóa product
   *   * Xóa reviews
   *   * Xóa khỏi carts
   *   * GIỮ orders (snapshot data)
   */
  const deleteProduct = useCallback(async (productId) => {
    console.log('Deleting product:', productId)
    
    if (!hasPermission('DELETE_PRODUCT')) {
      setError('Bạn không có quyền xóa sản phẩm')
      return
    }

    if (!window.confirm('Xóa sản phẩm này? Hành động KHÔNG THỂ HOÀN TÁC!')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      const { message } = response.data
      console.log('Product deleted:', productId)

      setSuccess(message)
      setProducts(products.filter(p => p._id !== productId))
      setSelectedProduct(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa sản phẩm')
      console.error('Delete product error:', err)
    } finally {
      setLoading(false)
    }
  }, [hasPermission, products])

  // ==================== HELPER FUNCTIONS ====================

  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      category: '',
      brand: '',
      images: [],
      features: [],
      warranty: '',
      isFeatured: false,
      isActive: true,
      variants: [
        {
          variantName: 'Mặc định',
          sku: '',
          price: 0,
          stock: 0,
          size: '',
          color: '',
          material: '',
          weight: '',
          isAvailable: true,
        },
      ],
    })
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          variantName: '',
          sku: '',
          price: 0,
          stock: 0,
          size: '',
          color: '',
          material: '',
          weight: '',
          isAvailable: true,
        },
      ],
    })
  }

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index)
    setFormData({ ...formData, variants: newVariants })
  }

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants]
    newVariants[index][field] = value
    setFormData({ ...formData, variants: newVariants })
  }

  // ==================== LIFECYCLE ====================

  useEffect(() => {
    if (currentUser) {
      console.log('👤 User loaded:', { id: currentUser.id, role: currentUser.role, username: currentUser.username })
      // Admin xem tất cả sản phẩm
      if (currentUser.role === 'admin') {
        fetchProducts(1)
      } else {
        fetchMyProducts()
      }
    }
  }, [currentUser])

  // ==================== UI COMPONENTS ====================

  if (loading && products.length === 0) {
    return <div className="product-loading">Đang tải...</div>
  }

  return (
    <div className="product-management-container">
      <header className="product-header">
        <h1>Quản Lý Sản Phẩm</h1>
        
        <div className="header-info">
          <div className="user-info">
            <span>{currentUser?.username || 'Loading...'}</span>
            <span className={`role-badge role-${currentUser?.role || 'guest'}`}>
              {!currentUser && 'ĐANG TẢI...'}
              {currentUser?.role === 'client' && 'KHÁCH HÀNG'}
              {currentUser?.role === 'partner' && 'CHỦ SHOP'}
              {currentUser?.role === 'admin' && 'QUẢN TRỊ'}
            </span>
          </div>
          
          <div className="permissions-info">
            <small>Quyền của bạn:</small>
            <div className="permission-badges">
              {hasPermission('CREATE_PRODUCT') && (
                <span className="perm perm-create">Tạo sản phẩm</span>
              )}
              {hasPermission('UPDATE_PRODUCT') && (
                <span className="perm perm-update">Sửa sản phẩm</span>
              )}
              {hasPermission('DELETE_PRODUCT') && (
                <span className="perm perm-delete">Xóa sản phẩm</span>
              )}
              {!hasPermission('CREATE_PRODUCT') && !currentUser && (
                <span className="perm perm-view">Đang tải...</span>
              )}
              {!hasPermission('CREATE_PRODUCT') && currentUser && (
                <span className="perm perm-view">Chỉ xem</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* TOOLBAR */}
      <div className="product-toolbar">
        {/* THÔNG TIN SỐ LƯỢNG SẢN PHẨM */}
        <div className="product-count-info">
          <span className="count-label">Tổng số:</span>
          <span className="count-value">{pagination.totalProducts || 0}</span>
          <span className="count-label">sản phẩm</span>
          {pagination.totalPages > 1 && (
            <span className="count-secondary">
              • Trang {pagination.page}/{pagination.totalPages}
            </span>
          )}
        </div>

        {/* FILTERS */}
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="filter-input"
          />
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="filter-select"
          >
            <option value="createdAt">Mới nhất</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
            <option value="popular">Phổ biến</option>
          </select>
          <button className="btn btn-secondary" onClick={() => fetchProducts(1)}>
            Lọc
          </button>
        </div>
      </div>

      {/* CREATE FORM */}
      {createMode && (
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={() => createProduct(formData)}
          onCancel={() => {
            setCreateMode(false)
            resetFormData()
          }}
          loading={loading}
          addVariant={addVariant}
          removeVariant={removeVariant}
          updateVariant={updateVariant}
        />
      )}

      {/* PRODUCT GRID */}
      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-data">Không có sản phẩm nào</div>
        ) : (
          products.map((product) => {
            // Tính tổng số lượng còn lại từ tất cả các variants
            const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0
            
            // Lấy thông tin shop/partner
            const shopName = product.createdBy?.shopName || product.createdBy?.username || 'N/A'
            
            return (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.images?.[0] || '/placeholder.png'} 
                  alt={product.name}
                  onClick={() => fetchProductDetail(product._id)}
                />
                {/* Badge số lượng còn */}
                <div className={`stock-badge ${totalStock === 0 ? 'out-of-stock' : totalStock < 10 ? 'low-stock' : ''}`}>
                  {totalStock === 0 ? 'Hết hàng' : `Còn ${totalStock}`}
                </div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="brand">{product.brand}</p>
                
                {/* Thông tin shop */}
                <div className="shop-info">
                  <span className="shop-label">Shop:</span>
                  <span className="shop-name">{shopName}</span>
                </div>
                
                <p className="price">{product.basePrice.toLocaleString('vi-VN')}đ</p>
                <div className="product-stats">
                  <span>Xem: {product.viewCount || 0}</span>
                  <span>Bán: {product.soldCount || 0}</span>
                </div>
              </div>
              <div className="product-actions">
                {canModifyProduct(product) && (
                  <>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => {
                        setSelectedProduct(product)
                        setFormData(product)
                        setEditMode(true)
                      }}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Xóa
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-sm btn-info"
                  onClick={() => fetchProductDetail(product._id)}
                >
                  Chi tiết
                </button>
              </div>
            </div>
            )
          })
        )}
      </div>

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => fetchProducts(pagination.page - 1)}
          >
            Trang Trước
          </button>
          <span>Trang {pagination.page} / {pagination.totalPages}</span>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchProducts(pagination.page + 1)}
          >
            Trang Sau
          </button>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && !editMode && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          canModify={canModifyProduct(selectedProduct)}
          onEdit={() => {
            setFormData(selectedProduct)
            setEditMode(true)
          }}
          onDelete={() => deleteProduct(selectedProduct._id)}
        />
      )}

      {/* EDIT MODAL */}
      {editMode && selectedProduct && (
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={() => updateProduct(selectedProduct._id, formData)}
          onCancel={() => {
            setEditMode(false)
            setSelectedProduct(null)
            resetFormData()
          }}
          loading={loading}
          addVariant={addVariant}
          removeVariant={removeVariant}
          updateVariant={updateVariant}
          isEdit={true}
        />
      )}
    </div>
  )
}

// ==================== SUB-COMPONENTS ====================

/**
 * Form tạo/sửa sản phẩm
 */
const ProductForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  loading,
  addVariant,
  removeVariant,
  updateVariant,
  isEdit = false
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <h2>{isEdit ? 'Sửa Sản Phẩm' : 'Tạo Sản Phẩm Mới'}</h2>

        <div className="form-row">
          <div className="form-group">
            <label>Tên Sản Phẩm *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div className="form-group">
            <label>Thương Hiệu *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Nike, Adidas..."
            />
          </div>
        </div>

        <div className="form-group">
          <label>Mô Tả *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả chi tiết sản phẩm"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Giá Cơ Bản *</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Danh Mục *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Giày thể thao, Giày da..."
            />
          </div>
        </div>

        {/* VARIANTS */}
        <div className="variants-section">
          <h3>Biến Thể Sản Phẩm</h3>
          {formData.variants.map((variant, index) => (
            <div key={index} className="variant-row">
              <input
                type="text"
                placeholder="Tên biến thể"
                value={variant.variantName}
                onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
              />
              <input
                type="text"
                placeholder="SKU"
                value={variant.sku}
                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
              />
              <input
                type="number"
                placeholder="Giá"
                value={variant.price}
                onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Tồn kho"
                value={variant.stock}
                onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
              />
              <input
                type="text"
                placeholder="Size"
                value={variant.size}
                onChange={(e) => updateVariant(index, 'size', e.target.value)}
              />
              <input
                type="text"
                placeholder="Màu"
                value={variant.color}
                onChange={(e) => updateVariant(index, 'color', e.target.value)}
              />
              {formData.variants.length > 1 && (
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => removeVariant(index)}
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addVariant}>
            + Thêm Biến Thể
          </button>
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (isEdit ? 'Cập Nhật' : 'Tạo Sản Phẩm')}
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
 * Modal chi tiết sản phẩm
 */
const ProductDetailModal = ({ product, onClose, canModify, onEdit, onDelete }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>{product.name}</h2>

        <div className="product-detail-grid">
          <div className="product-images">
            {product.images?.map((img, idx) => (
              <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} />
            ))}
          </div>

          <div className="product-detail-info">
            <p><strong>Thương hiệu:</strong> {product.brand}</p>
            <p><strong>Danh mục:</strong> {product.category}</p>
            <p><strong>Giá cơ bản:</strong> {product.basePrice.toLocaleString('vi-VN')}đ</p>
            <p><strong>Mô tả:</strong> {product.description}</p>
            
            <h3>Biến Thể</h3>
            <table className="variants-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>SKU</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Size</th>
                  <th>Màu</th>
                </tr>
              </thead>
              <tbody>
                {product.variants?.map((variant, idx) => (
                  <tr key={idx}>
                    <td>{variant.variantName}</td>
                    <td>{variant.sku}</td>
                    <td>{variant.price.toLocaleString('vi-VN')}đ</td>
                    <td>{variant.stock}</td>
                    <td>{variant.size || '-'}</td>
                    <td>{variant.color || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="stats">
              <span>Lượt xem: {product.viewCount || 0}</span>
              <span>Đã bán: {product.soldCount || 0}</span>
            </div>
          </div>
        </div>

        {canModify && (
          <div className="modal-actions">
            <button className="btn btn-warning" onClick={onEdit}>Sửa</button>
            <button className="btn btn-danger" onClick={onDelete}>Xóa</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductManagement
