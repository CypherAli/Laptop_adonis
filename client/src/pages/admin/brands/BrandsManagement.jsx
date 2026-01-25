import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig';
import './BrandsManagement.css';

export default function BrandsManagement() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    categories: [],
    isActive: true
  });

  useEffect(() => {
    loadBrands();
    loadCategories();
  }, [currentPage, searchTerm, categoryFilter]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        categoryId: categoryFilter || undefined
      };
      const response = await axios.get('/admin/brands', { params });
      setBrands(response.data.brands || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Không thể tải thương hiệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/admin/categories/tree');
      setCategories(response.data.tree || []);
    } catch (err) {
      console.error('Không thể tải danh mục:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Tên thương hiệu không được để trống');
      return;
    }

    if (formData.name.length > 100) {
      setError('Tên thương hiệu không được quá 100 ký tự');
      return;
    }

    if (formData.logo && !isValidUrl(formData.logo)) {
      setError('URL logo không hợp lệ');
      return;
    }

    if (formData.website && !isValidUrl(formData.website)) {
      setError('URL website không hợp lệ');
      return;
    }

    try {
      if (editingBrand) {
        await axios.put(`/admin/brands/${editingBrand._id}`, formData);
        setSuccess('Cập nhật thương hiệu thành công');
      } else {
        await axios.post('/admin/brands', formData);
        setSuccess('Tạo thương hiệu mới thành công');
      }
      
      resetForm();
      loadBrands();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      categories: brand.categories?.map(cat => cat._id || cat) || [],
      isActive: brand.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thương hiệu này?')) return;

    try {
      await axios.delete(`/admin/brands/${id}`);
      setSuccess('Xóa thương hiệu thành công');
      loadBrands();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa thương hiệu');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/admin/brands/${id}/toggle-active`);
      setSuccess(currentStatus ? 'Đã ẩn thương hiệu' : 'Đã kích hoạt thương hiệu');
      loadBrands();
    } catch (err) {
      setError('Không thể thay đổi trạng thái');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: '',
      website: '',
      categories: [],
      isActive: true
    });
    setEditingBrand(null);
    setShowForm(false);
  };

  // Get flat categories for selection
  const getFlatCategories = (cats, level = 0, result = []) => {
    if (!Array.isArray(cats)) return result;
    cats.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        getFlatCategories(cat.children, level + 1, result);
      }
    });
    return result;
  };

  const flatCategories = getFlatCategories(categories);

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="brands-management">
      <div className="page-header">
        <h1>Quản lý Thương hiệu</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hủy' : '+ Thêm Thương hiệu'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="form-container">
          <h2>{editingBrand ? 'Sửa Thương hiệu' : 'Thêm Thương hiệu Mới'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tên thương hiệu *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Website URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://brand.com"
                />
              </div>
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
              <label>Logo URL</label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://brand.com/logo.png"
              />
              {formData.logo && (
                <div className="logo-preview">
                  <img src={formData.logo} alt="Logo preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Danh mục liên quan</label>
              <div className="categories-checkboxes">
                {flatCategories.map(cat => (
                  <label key={cat._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(cat._id)}
                      onChange={() => handleCategoryToggle(cat._id)}
                    />
                    <span>{'─'.repeat(cat.level)} {cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Kích hoạt thương hiệu</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingBrand ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm thương hiệu..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả danh mục</option>
          {flatCategories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {'─'.repeat(cat.level)} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brands Grid */}
      <div className="brands-grid">
        {brands.length === 0 ? (
          <div className="empty-state">
            Chưa có thương hiệu nào. Hãy thêm thương hiệu đầu tiên!
          </div>
        ) : (
          brands.map(brand => (
            <div key={brand._id} className="brand-card">
              {brand.logo && (
                <div className="brand-logo">
                  <img src={brand.logo} alt={brand.name} />
                </div>
              )}
              <div className="brand-info">
                <h3>{brand.name}</h3>
                <p className="brand-slug">/{brand.slug}</p>
                {brand.description && (
                  <p className="brand-description">{brand.description}</p>
                )}
                {brand.categories && brand.categories.length > 0 && (
                  <div className="brand-categories">
                    {brand.categories.slice(0, 3).map(cat => (
                      <span key={cat._id || cat} className="category-tag">
                        {cat.name || cat}
                      </span>
                    ))}
                    {brand.categories.length > 3 && (
                      <span className="category-tag">+{brand.categories.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="brand-meta">
                  <span className={`status-badge ${brand.isActive ? 'active' : 'inactive'}`}>
                    {brand.isActive ? 'Hoạt động' : 'Ẩn'}
                  </span>
                  {brand.productCount > 0 && (
                    <span className="product-count">{brand.productCount} sản phẩm</span>
                  )}
                </div>
              </div>
              <div className="brand-actions">
                <button className="btn-edit" onClick={() => handleEdit(brand)}>
                  Sửa
                </button>
                <button 
                  className="btn-toggle"
                  onClick={() => handleToggleActive(brand._id, brand.isActive)}
                >
                  {brand.isActive ? 'Ẩn' : 'Hiện'}
                </button>
                <button className="btn-delete" onClick={() => handleDelete(brand._id)}>
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Trước
          </button>
          <span>Trang {currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
