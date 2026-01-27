import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import AuthContext from '../../context/AuthContext'
import { FiSave, FiX, FiImage, FiPackage, FiPlus, FiTrash2 } from 'react-icons/fi'
import './AddProduct.css'

const AddProduct = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: 'Nike',
    category: 'Sports',
    basePrice: '',
    images: [''],
    features: [''],
    variants: [
      {
        variantName: '',
        sku: '',
        price: '',
        originalPrice: '',
        stock: '',
        specifications: {
          size: '',
          color: '',
          material: '',
          gender: 'Unisex',
        },
        isAvailable: true,
      },
    ],
    warranty: {
      duration: '6 tháng',
      details: 'Bảo hành lỗi nhà sản xuất',
    },
    isFeatured: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const brands = [
    'Nike',
    'Adidas',
    'Puma',
    'Reebok',
    'New Balance',
    'Converse',
    'Vans',
    'Asics',
    'Under Armour',
    'Fila',
  ]

  const categories = ['Sports', 'Running', 'Casual', 'Lifestyle', 'Skate', 'Training']

  const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']

  const materials = ['Leather', 'Canvas', 'Mesh', 'Synthetic', 'Suede', 'Primeknit']

  const colors = [
    'Black',
    'White',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Grey',
    'Brown',
    'Orange',
    'Pink',
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleWarrantyChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      warranty: {
        ...prev.warranty,
        [name]: value,
      },
    }))
  }

  // Handle Images
  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData((prev) => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, images: newImages }))
    }
  }

  // Handle Features
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData((prev) => ({ ...prev, features: newFeatures }))
  }

  const addFeatureField = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }))
  }

  const removeFeatureField = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, features: newFeatures }))
    }
  }

  // Handle Variants
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants]
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      newVariants[index][parent][child] = value
    } else {
      newVariants[index][field] = value
    }
    setFormData((prev) => ({ ...prev, variants: newVariants }))
  }

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          variantName: '',
          sku: '',
          price: '',
          originalPrice: '',
          stock: '',
          specifications: {
            size: '',
            color: '',
            material: '',
            gender: 'Unisex',
          },
          isAvailable: true,
        },
      ],
    }))
  }

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      const newVariants = formData.variants.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, variants: newVariants }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.basePrice) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc')
        setLoading(false)
        return
      }

      // Validate variants
      for (const variant of formData.variants) {
        if (!variant.price || !variant.stock) {
          setError('Mỗi biến thể phải có giá và số lượng tồn kho')
          setLoading(false)
          return
        }
      }

      // Transform form data to match API structure
      const productData = {
        name: formData.name,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        category: formData.category,
        brand: formData.brand,
        images: formData.images.filter((img) => img.trim() !== ''),
        features: formData.features.filter((f) => f.trim() !== ''),
        warranty: formData.warranty,
        isFeatured: formData.isFeatured,
        isActive: true,
        variants: formData.variants.map((v) => ({
          variantName: v.variantName || `${v.specifications.size} - ${v.specifications.color}`,
          sku: v.sku || `${formData.brand}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          price: Number(v.price),
          originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
          stock: Number(v.stock),
          specifications: v.specifications,
          isAvailable: Number(v.stock) > 0,
        })),
      }

      console.log('Sending product data:', productData)
      await axios.post('/products', productData)

      setSuccess(
        user?.role === 'admin'
          ? 'Tạo sản phẩm thành công!'
          : 'Tạo sản phẩm thành công! Sản phẩm đã được thêm vào cửa hàng của bạn.'
      )

      // Reset form
      setFormData({
        name: '',
        description: '',
        brand: 'Nike',
        category: 'Sports',
        basePrice: '',
        images: [''],
        features: [''],
        variants: [
          {
            variantName: '',
            sku: '',
            price: '',
            originalPrice: '',
            stock: '',
            specifications: {
              size: '',
              color: '',
              material: '',
              gender: 'Unisex',
            },
            isAvailable: true,
          },
        ],
        warranty: {
          duration: '6 tháng',
          details: 'Bảo hành lỗi nhà sản xuất',
        },
        isFeatured: false,
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/manager')
      }, 2000)
    } catch (err) {
      console.error('Product submission error:', err)
      console.error('Error response:', err.response?.data)
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/manager')
  }

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <div className="header-content">
          <FiPackage className="header-icon" />
          <div>
            <h1>
              Thêm Sản Phẩm Mới
              {user?.role === 'partner' && user?.shopName && (
                <span className="shop-badge"> - {user.shopName}</span>
              )}
            </h1>
            <p>
              {user?.role === 'partner'
                ? 'Thêm sản phẩm vào cửa hàng của bạn'
                : 'Nhập thông tin sản phẩm để thêm vào cửa hàng'}
            </p>
          </div>
        </div>
      </div>

      <div className="add-product-content">
        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <FiX className="alert-icon" />
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <FiX />
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')}>
              <FiX />
            </button>
          </div>
        )}

        {/* Product Form */}
        <div className="product-form-card">
          <form onSubmit={handleSubmit} className="product-form">
            {/* Basic Info */}
            <div className="form-section">
              <h2>📦 Thông tin cơ bản</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Tên sản phẩm <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="VD: Nike Air Max 270"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Thương hiệu <span className="required">*</span>
                  </label>
                  <select name="brand" value={formData.brand} onChange={handleInputChange} required>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Danh mục <span className="required">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Mô tả <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Mô tả chi tiết về sản phẩm, tính năng, ưu điểm..."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Giá cơ bản (VNĐ) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="2500000"
                  />
                  <small>Giá khởi điểm, có thể thay đổi theo từng biến thể</small>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      style={{ width: 'auto', marginRight: '8px' }}
                    />
                    Sản phẩm nổi bật
                  </label>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="form-section">
              <h2>
                <FiImage /> Hình ảnh
              </h2>
              {formData.images.map((img, index) => (
                <div key={index} className="dynamic-field">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="btn-remove"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                  {img && (
                    <div className="image-preview-small">
                      <img src={img} alt={`Preview ${index + 1}`} />
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={addImageField} className="btn-add-field">
                <FiPlus /> Thêm ảnh
              </button>
            </div>

            {/* Features */}
            <div className="form-section">
              <h2>✨ Tính năng nổi bật</h2>
              {formData.features.map((feature, index) => (
                <div key={index} className="dynamic-field">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="VD: Đế cao su chống trượt"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeatureField(index)}
                      className="btn-remove"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addFeatureField} className="btn-add-field">
                <FiPlus /> Thêm tính năng
              </button>
            </div>

            {/* Variants */}
            <div className="form-section">
              <h2>🎨 Biến thể sản phẩm</h2>
              {formData.variants.map((variant, index) => (
                <div key={index} className="variant-card">
                  <div className="variant-header">
                    <h3>Biến thể #{index + 1}</h3>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="btn-remove-variant"
                      >
                        <FiTrash2 /> Xóa
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên biến thể</label>
                      <input
                        type="text"
                        value={variant.variantName}
                        onChange={(e) => handleVariantChange(index, 'variantName', e.target.value)}
                        placeholder="VD: Size 42 - Black"
                      />
                      <small>Để trống để tự động tạo</small>
                    </div>

                    <div className="form-group">
                      <label>SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        placeholder="Tự động tạo nếu để trống"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Size <span className="required">*</span>
                      </label>
                      <select
                        value={variant.specifications.size}
                        onChange={(e) =>
                          handleVariantChange(index, 'specifications.size', e.target.value)
                        }
                        required
                      >
                        <option value="">-- Chọn size --</option>
                        {sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Màu sắc <span className="required">*</span>
                      </label>
                      <select
                        value={variant.specifications.color}
                        onChange={(e) =>
                          handleVariantChange(index, 'specifications.color', e.target.value)
                        }
                        required
                      >
                        <option value="">-- Chọn màu --</option>
                        {colors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Chất liệu</label>
                      <select
                        value={variant.specifications.material}
                        onChange={(e) =>
                          handleVariantChange(index, 'specifications.material', e.target.value)
                        }
                      >
                        <option value="">-- Chọn chất liệu --</option>
                        {materials.map((material) => (
                          <option key={material} value={material}>
                            {material}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Giới tính</label>
                      <select
                        value={variant.specifications.gender}
                        onChange={(e) =>
                          handleVariantChange(index, 'specifications.gender', e.target.value)
                        }
                      >
                        <option value="Unisex">Unisex</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Giá bán (VNĐ) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        required
                        min="0"
                        placeholder="2500000"
                      />
                    </div>

                    <div className="form-group">
                      <label>Giá gốc (VNĐ)</label>
                      <input
                        type="number"
                        value={variant.originalPrice}
                        onChange={(e) =>
                          handleVariantChange(index, 'originalPrice', e.target.value)
                        }
                        min="0"
                        placeholder="3000000"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Tồn kho <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        required
                        min="0"
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addVariant} className="btn-add-variant">
                <FiPlus /> Thêm biến thể
              </button>
            </div>

            {/* Warranty */}
            <div className="form-section">
              <h2>🛡️ Bảo hành</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian bảo hành</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.warranty.duration}
                    onChange={handleWarrantyChange}
                    placeholder="6 tháng"
                  />
                </div>

                <div className="form-group">
                  <label>Chi tiết bảo hành</label>
                  <input
                    type="text"
                    name="details"
                    value={formData.warranty.details}
                    onChange={handleWarrantyChange}
                    placeholder="Bảo hành lỗi nhà sản xuất"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                <FiSave />
                {loading ? 'Đang xử lý...' : 'Tạo sản phẩm'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                <FiX />
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct
