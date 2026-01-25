import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig';
import './AttributesManagement.css';

export default function AttributesManagement() {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'select',
    isVariant: false,
    isFilterable: true,
    isRequired: false,
    values: [],
    isActive: true
  });
  
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/attributes');
      setAttributes(response.data.attributes || []);
    } catch (err) {
      setError('Không thể tải thuộc tính');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) {
      setError('Tên thuộc tính không được để trống');
      return;
    }

    if (formData.name.length > 100) {
      setError('Tên thuộc tính không được quá 100 ký tự');
      return;
    }

    if (formData.values.length === 0) {
      setError('Thuộc tính phải có ít nhất 1 giá trị');
      return;
    }

    try {
      if (editingAttribute) {
        await axios.put(`/admin/attributes/${editingAttribute._id}`, formData);
        setSuccess('Cập nhật thuộc tính thành công');
      } else {
        await axios.post('/admin/attributes', formData);
        setSuccess('Tạo thuộc tính mới thành công');
      }
      
      resetForm();
      loadAttributes();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      name: attribute.name,
      type: attribute.type,
      isVariant: attribute.isVariant || false,
      isFilterable: attribute.isFilterable,
      isRequired: attribute.isRequired,
      values: attribute.values || [],
      isActive: attribute.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thuộc tính này?')) return;

    try {
      await axios.delete(`/admin/attributes/${id}`);
      setSuccess('Xóa thuộc tính thành công');
      loadAttributes();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/admin/attributes/${id}/toggle-active`);
      setSuccess(currentStatus ? 'Đã ẩn thuộc tính' : 'Đã kích hoạt thuộc tính');
      loadAttributes();
    } catch (err) {
      setError('Không thể thay đổi trạng thái');
    }
  };

  const handleAddValue = () => {
    const trimmedValue = newValue.trim();
    
    if (!trimmedValue) {
      setError('Giá trị không được để trống');
      return;
    }

    if (trimmedValue.length > 50) {
      setError('Giá trị không được quá 50 ký tự');
      return;
    }

    if (formData.values.includes(trimmedValue)) {
      setError('Giá trị đã tồn tại');
      return;
    }

    if (formData.values.length >= 50) {
      setError('Tối đa 50 giá trị');
      return;
    }

    setError(''); // Clear error
    setFormData({
      ...formData,
      values: [...formData.values, trimmedValue]
    });
    setNewValue('');
  };

  const handleRemoveValue = (value) => {
    setFormData({
      ...formData,
      values: formData.values.filter(v => v !== value)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'select',
      isVariant: false,
      isFilterable: true,
      isRequired: false,
      values: [],
      isActive: true
    });
    setEditingAttribute(null);
    setShowForm(false);
    setNewValue('');
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="attributes-management">
      <div className="page-header">
        <h1>Quản lý Thuộc tính</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hủy' : '+ Thêm Thuộc tính'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="form-container">
          <h2>{editingAttribute ? 'Sửa Thuộc tính' : 'Thêm Thuộc tính Mới'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tên thuộc tính *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Size, Color, Material..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Loại hiển thị *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="select">Chọn đơn (Select)</option>
                  <option value="multiselect">Chọn nhiều (Multiselect)</option>
                  <option value="color">Màu sắc (Color Picker)</option>
                  <option value="text">Văn bản (Text)</option>
                  <option value="number">Số (Number)</option>
                </select>
              </div>
            </div>

            <div className="form-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isVariant}
                  onChange={(e) => setFormData({ ...formData, isVariant: e.target.checked })}
                />
                <span>Dùng cho Variant (Biến thể sản phẩm - Size, Color...)</span>
              </label>
            </div>

            <div className="form-group">
              <label>Giá trị (Values)</label>
              <div className="value-input-group">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Nhập giá trị và nhấn Thêm..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                />
                <button type="button" className="btn-add-value" onClick={handleAddValue}>
                  + Thêm
                </button>
              </div>
              <div className="values-list">
                {formData.values.map((value, index) => (
                  <div key={index} className="value-tag">
                    <span>{value}</span>
                    <button type="button" onClick={() => handleRemoveValue(value)}>
                      ×
                    </button>
                  </div>
                ))}
                {formData.values.length === 0 && (
                  <div className="empty-values">Chưa có giá trị nào</div>
                )}
              </div>
            </div>

            <div className="form-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isFilterable}
                  onChange={(e) => setFormData({ ...formData, isFilterable: e.target.checked })}
                />
                <span>Có thể lọc (Hiển thị trong bộ lọc)</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                />
                <span>Bắt buộc (Required khi tạo sản phẩm)</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Kích hoạt</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingAttribute ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Attributes Table */}
      <div className="attributes-table-container">
        <table className="attributes-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Slug</th>
              <th>Loại</th>
              <th>Số giá trị</th>
              <th>Variant</th>
              <th>Lọc được</th>
              <th>Bắt buộc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {attributes.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  Chưa có thuộc tính nào. Hãy thêm thuộc tính đầu tiên!
                </td>
              </tr>
            ) : (
              attributes.map(attr => (
                <tr key={attr._id}>
                  <td>
                    <strong>{attr.name}</strong>
                  </td>
                  <td className="slug-cell">{attr.slug}</td>
                  <td>
                    <span className={`type-badge type-${attr.type}`}>
                      {attr.type}
                    </span>
                  </td>
                  <td>{attr.values?.length || 0}</td>
                  <td>
                    <span className={`bool-badge ${attr.isVariant ? 'yes' : 'no'}`}>
                      {attr.isVariant ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>
                    <span className={`bool-badge ${attr.isFilterable ? 'yes' : 'no'}`}>
                      {attr.isFilterable ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>
                    <span className={`bool-badge ${attr.isRequired ? 'yes' : 'no'}`}>
                      {attr.isRequired ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${attr.isActive ? 'active' : 'inactive'}`}>
                      {attr.isActive ? 'Hoạt động' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sm btn-edit" onClick={() => handleEdit(attr)}>
                        Sửa
                      </button>
                      <button 
                        className="btn-sm btn-toggle"
                        onClick={() => handleToggleActive(attr._id, attr.isActive)}
                      >
                        {attr.isActive ? 'Ẩn' : 'Hiện'}
                      </button>
                      <button className="btn-sm btn-delete" onClick={() => handleDelete(attr._id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
