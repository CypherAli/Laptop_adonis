import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import AuthContext from '../../context/AuthContext'
import { FiSave, FiX, FiImage, FiPackage } from 'react-icons/fi'
import './AddProduct.css'

const EditProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    brand: 'Nike',
    imageUrl: '',
    sku: '',
    variantName: 'Default',
    size: '42',
    color: 'Đen',
    gender: 'Unisex',
    material: 'Vải mesh',
    category: 'Giày Thể Thao',
    collarHeight: 'Thấp cổ',
    style: 'Thể thao',
    sole: 'Cao su',
    weight: '',
  })

  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
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

  const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
  const colors = ['Đen', 'Trắng', 'Xám', 'Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Cam', 'Hồng', 'Nâu']
  const genders = ['Nam', 'Nữ', 'Unisex']
  const materials = ['Da thật', 'Da tổng hợp', 'Vải canvas', 'Vải mesh', 'Vải dệt kim', 'Nhựa EVA']
  const categories = ['Giày Thể Thao', 'Giày Cao Gót', 'Giày Sandal', 'Giày Boot', 'Giày Lười']
  const collarHeights = ['Thấp cổ', 'Cổ vừa', 'Cao cổ']
  const styles = ['Thể thao', 'Thời trang', 'Chạy bộ', 'Bóng đá', 'Bóng rổ', 'Tennis', 'Casual', 'Formal']
  const soles = ['Cao su', 'EVA', 'PU', 'Boost', 'Air', 'Gel']

  useEffect(() => {
    fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoadingProduct(true)
      const res = await axios.get(`/products/${id}`)
      const product = res.data.product

      // Extract data from product
      const firstVariant = product.variants?.[0] || {}
      const attributes = firstVariant.attributes || {}
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: firstVariant.price || product.basePrice || '',
        originalPrice: firstVariant.originalPrice || '',
        stock: firstVariant.stock || '',
        brand: product.brand || 'Nike',
        imageUrl: product.images?.[0] || product.imageUrl || '',
        sku: firstVariant.sku || '',
        variantName: firstVariant.variantName || 'Default',
        size: attributes.size || '42',
        color: attributes.color || 'Đen',
        gender: product.gender || 'Unisex',
        material: product.material || 'Vải mesh',
        category: product.category || 'Giày Thể Thao',
        collarHeight: product.collarHeight || 'Thấp cổ',
        style: product.style || 'Thể thao',
        sole: product.sole || 'Cao su',
        weight: product.weight || '',
      })
    } catch (err) {
      console.error('Failed to fetch product:', err)
      setError('Không thể tải thông tin sản phẩm')
    } finally {
      setLoadingProduct(false)
    }
  }

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
        brand: formData.brand,
        category: formData.category,
        gender: formData.gender,
        material: formData.material,
        collarHeight: formData.collarHeight,
        style: formData.style,
        sole: formData.sole,
        weight: formData.weight ? Number(formData.weight) : undefined,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        variants: [
          {
            variantName: `${formData.size} - ${formData.color}`,
            sku: formData.sku || `${formData.brand}-${Date.now()}`,
            price: Number(formData.price),
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
            stock: Number(formData.stock),
            attributes: {
              size: formData.size,
              color: formData.color,
            },
          },
        ],
      }

      await axios.put(`/products/${id}`, productData)

      setSuccess('Cập nhật sản phẩm thành công!')

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/manager')
      }, 1500)
    } catch (err) {
      console.error('Product update error:', err)
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/manager')
  }

  if (loadingProduct) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Đang tải...</h2>
      </div>
    )
  }

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <div className="header-content">
          <FiPackage className="header-icon" />
          <div>
            <h1>Chỉnh Sửa Sản Phẩm</h1>
            <p>Cập nhật thông tin sản phẩm</p>
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
              <h2>Phân loại & Thuộc tính</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Danh mục <span className="required">*</span>
                  </label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Giới tính <span className="required">*</span>
                  </label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Size <span className="required">*</span>
                  </label>
                  <select name="size" value={formData.size} onChange={handleInputChange} required>
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Màu sắc <span className="required">*</span>
                  </label>
                  <select name="color" value={formData.color} onChange={handleInputChange} required>
                    {colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Chất liệu <span className="required">*</span>
                  </label>
                  <select name="material" value={formData.material} onChange={handleInputChange} required>
                    {materials.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Chiều cao cổ giày</label>
                  <select name="collarHeight" value={formData.collarHeight} onChange={handleInputChange}>
                    {collarHeights.map((height) => (
                      <option key={height} value={height}>
                        {height}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kiểu dáng</label>
                  <select name="style" value={formData.style} onChange={handleInputChange}>
                    {styles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Đế giày</label>
                  <select name="sole" value={formData.sole} onChange={handleInputChange}>
                    {soles.map((sole) => (
                      <option key={sole} value={sole}>
                        {sole}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Trọng lượng (gram)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="250"
                  />
                </div>
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
                {loading ? 'Đang xử lý...' : 'Cập nhật sản phẩm'}
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

export default EditProduct
