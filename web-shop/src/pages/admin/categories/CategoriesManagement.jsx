import React, { useState, useEffect } from 'react'
import axios from '../../../api/axiosConfig'
import './CategoriesManagement.css'

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    image: '',
    isActive: true,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/admin/categories/tree')
      setCategories(response.data.tree || [])
    } catch (err) {
      setError('Không thể tải danh mục')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name.trim()) {
      setError('Tên danh mục không được để trống')
      return
    }

    if (formData.name.length > 100) {
      setError('Tên danh mục không được quá 100 ký tự')
      return
    }

    // Prevent circular reference
    if (editingCategory && formData.parentId === editingCategory._id) {
      setError('Không thể chọn danh mục làm cha của chính nó')
      return
    }

    try {
      if (editingCategory) {
        await axios.put(`/admin/categories/${editingCategory._id}`, formData)
        setSuccess('Cập nhật danh mục thành công')
      } else {
        await axios.post('/admin/categories', formData)
        setSuccess('Tạo danh mục mới thành công')
      }

      resetForm()
      loadCategories()
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId?._id || '',
      image: category.image || '',
      isActive: category.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      return
    }

    try {
      await axios.delete(`/admin/categories/${id}`)
      setSuccess('Xóa danh mục thành công')
      loadCategories()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể xóa danh mục'
      if (errorMsg.includes('danh mục con')) {
        setError('Không thể xóa! Danh mục này có danh mục con. Hãy xóa danh mục con trước.')
      } else {
        setError(errorMsg)
      }
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/admin/categories/${id}/toggle-active`)
      setSuccess(currentStatus ? 'Đã ẩn danh mục' : 'Đã kích hoạt danh mục')
      loadCategories()
    } catch (err) {
      setError('Không thể thay đổi trạng thái')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: '',
      image: '',
      isActive: true,
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  // Render tree recursively
  const renderCategoryTree = (categories, level = 0) => {
    if (!Array.isArray(categories)) return null
    return categories.map((category) => (
      <div key={category._id} className={`category-item level-${level}`}>
        <div className="category-content">
          <div className="category-info">
            <span className="category-name">
              {level > 0 && '└─ '}
              {category.name}
            </span>
            <span className="category-slug">/{category.slug}</span>
            <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
              {category.isActive ? 'Hoạt động' : 'Ẩn'}
            </span>
            {category.productCount > 0 && (
              <span className="product-count">{category.productCount} sản phẩm</span>
            )}
          </div>
          <div className="category-actions">
            <button className="btn-edit" onClick={() => handleEdit(category)}>
              Sửa
            </button>
            <button
              className="btn-toggle"
              onClick={() => handleToggleActive(category._id, category.isActive)}
            >
              {category.isActive ? 'Ẩn' : 'Hiện'}
            </button>
            <button className="btn-delete" onClick={() => handleDelete(category._id)}>
              Xóa
            </button>
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="category-children">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // Get flat list for parent selector
  const getFlatCategoriesList = (cats, level = 0, result = []) => {
    if (!Array.isArray(cats)) return result
    cats.forEach((cat) => {
      result.push({ ...cat, level })
      if (cat.children && cat.children.length > 0) {
        getFlatCategoriesList(cat.children, level + 1, result)
      }
    })
    return result
  }

  const flatCategories = getFlatCategoriesList(categories)

  if (loading) return <div className="loading">Đang tải...</div>

  return (
    <div className="categories-management">
      <div className="page-header">
        <h1>Quản lý Danh mục</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hủy' : '+ Thêm Danh mục'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="form-container">
          <h2>{editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục Mới'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên danh mục *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Danh mục cha</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              >
                <option value="">-- Không có (Danh mục gốc) --</option>
                {flatCategories
                  .filter((cat) => cat._id !== editingCategory?._id) // Không cho chọn chính nó
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {'─'.repeat(cat.level)} {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Hình ảnh URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Kích hoạt danh mục</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingCategory ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-tree">
        <h2>Cây Danh mục ({categories.length} danh mục gốc)</h2>
        {categories.length === 0 ? (
          <div className="empty-state">Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!</div>
        ) : (
          <div className="tree-container">{renderCategoryTree(categories)}</div>
        )}
      </div>
    </div>
  )
}
