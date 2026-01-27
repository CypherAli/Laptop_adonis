import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import AuthContext from '../../context/AuthContext'
import { FiSave, FiX, FiImage, FiPackage } from 'react-icons/fi'
import './AddProduct.css'

const AddProduct = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    brand: 'Nike',
    imageUrl: '',
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
    'Bitis',
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Transform form data to match API structure
      const productData = {
        name: formData.name,
        description: formData.description,
        basePrice: Number(formData.price),
        category: 'Shoes', // Default category
        brand: formData.brand,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        variants: [
          {
            variantName: 'Default',
            sku: `${formData.brand}-${Date.now()}`,
            price: Number(formData.price),
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
            stock: Number(formData.stock),
            attributes: {
              size: '42', // Default size
              color: 'Default',
            },
          },
        ],
        features: [],
        warranty: '6 months',
        // Admin creates products that are active immediately
        isActive: user?.role === 'admin',
        isFeatured: false,
      }

      await axios.post('/products', productData)

      setSuccess('Tạo sản phẩm thành công!')

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        stock: '',
        brand: 'Nike',
        imageUrl: '',
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/manager')
      }, 2000)
    } catch (err) {
      console.error('Product submission error:', err)
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
            <h1>Thêm Sản Phẩm Mới</h1>
            <p>Nhập thông tin sản phẩm để thêm vào cửa hàng</p>
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
            <div className="form-section">
              <h2>Thông tin cơ bản</h2>
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
            </div>

            <div className="form-section">
              <h2>Giá & Tồn kho</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Giá bán (VNĐ) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="2500000"
                  />
                </div>

                <div className="form-group">
                  <label>Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
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
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Hình ảnh</h2>
              <div className="form-group">
                <label>
                  <FiImage className="label-icon" />
                  Link hình ảnh
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Preview" />
                  </div>
                )}
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
