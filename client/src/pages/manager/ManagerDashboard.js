import React, { useState, useEffect, useContext } from 'react';
import axios from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        stock: '',
        brand: 'Nike',
        imageUrl: ''
    });
    
    // UI states
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Converse', 'Vans', 'Asics', 'Under Armour', 'Fila'];

    useEffect(() => {
        if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        
        // Check if partner is approved
        if (user.role === 'partner' && !user.isApproved) {
            // Show pending approval message but don't redirect
            setError('Your Partner account is pending Admin approval. You can view but cannot add products yet.');
        }
        
        fetchMyProducts();
        // eslint-disable-next-line
    }, [user]);

    const fetchMyProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/products/my-products');
            setMyProducts(res.data.products || []);
        } catch (err) {
            console.error('Failed to fetch products', err);
            setError('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const productData = {
                ...formData,
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
                stock: Number(formData.stock)
            };

            if (editingProduct) {
                await axios.put(`/products/${editingProduct._id}`, productData);
                setSuccess('Cập nhật sản phẩm thành công!');
            } else {
                await axios.post('/products', productData);
                setSuccess('Tạo sản phẩm thành công! Đang chờ admin duyệt.');
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                originalPrice: '',
                stock: '',
                brand: 'Nike',
                imageUrl: ''
            });
            setEditingProduct(null);
            setShowForm(false);
            
            // Refresh products list
            fetchMyProducts();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || '',
            stock: product.stock,
            brand: product.brand,
            imageUrl: product.imageUrl
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            await axios.delete(`/products/${productId}`);
            setSuccess('Xóa sản phẩm thành công!');
            fetchMyProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            originalPrice: '',
            stock: '',
            brand: 'Nike',
            imageUrl: ''
        });
        setShowForm(false);
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { label: 'Chờ duyệt', color: '#f39c12', icon: '⏳' },
            approved: { label: 'Đã duyệt', color: '#27ae60', icon: '✅' },
            rejected: { label: 'Từ chối', color: '#e74c3c', icon: '❌' }
        };
        return statusMap[status] || { label: status, color: '#95a5a6', icon: '❓' };
    };

    if (loading && myProducts.length === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <h2>Đang tải...</h2>
            </div>
        );
    }

    return (
        <div className="partner-dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>
                        <span className="header-icon">🏪</span>
                        Quản lý Sản phẩm
                        {user?.shopName && <span className="shop-name-badge">{user.shopName}</span>}
                    </h1>
                </div>
                <div className="header-actions">
                    {(user?.role === 'partner' || user?.role === 'admin') && (
                        <button 
                            className="btn-action btn-revenue"
                            onClick={() => navigate('/partner-dashboard')}
                        >
                            <span className="btn-icon">💰</span>
                            <span className="btn-text">Revenue Analytics</span>
                        </button>
                    )}
                    {user?.role === 'partner' && user?.isApproved && (
                        <button 
                            className={`btn-action ${showForm ? 'btn-close' : 'btn-add'}`}
                            onClick={() => {
                                setShowForm(!showForm);
                                if (editingProduct) cancelEdit();
                            }}
                        >
                            <span className="btn-icon">{showForm ? '✕' : '+'}</span>
                            <span className="btn-text">{showForm ? 'Close' : 'Add Product'}</span>
                        </button>
                    )}
                    {user?.role === 'admin' && (
                        <button 
                            className={`btn-action ${showForm ? 'btn-close' : 'btn-add'}`}
                            onClick={() => {
                                setShowForm(!showForm);
                                if (editingProduct) cancelEdit();
                            }}
                        >
                            <span className="btn-icon">{showForm ? '✕' : '+'}</span>
                            <span className="btn-text">{showForm ? 'Close' : 'Add Product'}</span>
                        </button>
                    )}
                </div>
            </div>
            
            {/* Partner Approval Status */}
            {user?.role === 'partner' && !user?.isApproved && (
                <div className="alert alert-warning" style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '24px' }}>⏳</span>
                    <div>
                        <strong>Tài khoản đang chờ phê duyệt</strong>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                            Tài khoản Partner của bạn đang chờ Admin phê duyệt. 
                            Sau khi được duyệt, bạn sẽ có thể thêm và quản lý sản phẩm.
                        </p>
                    </div>
                </div>
            )}

            {/* Alert Messages */}
            {error && (
                <div className="alert alert-error">
                    ❌ {error}
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    ✅ {success}
                    <button onClick={() => setSuccess('')}>✕</button>
                </div>
            )}

            {/* Product Form */}
            {showForm && (
                <div className="product-form-card">
                    <h2>{editingProduct ? '✏️ Edit product' : '➕ Add new product'}</h2>
                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tên sản phẩm *</label>
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
                                <label>Thương hiệu *</label>
                                <select
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mô tả *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                placeholder="Mô tả chi tiết sản phẩm..."
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Giá bán (VNĐ) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    placeholder="25000000"
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
                                    placeholder="30000000"
                                />
                            </div>

                            <div className="form-group">
                                <label>Tồn kho *</label>
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

                        <div className="form-group">
                            <label>Link hình ảnh</label>
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

                        <div className="form-actions">
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? '⏳ Processing...' : editingProduct ? '💾 Update' : '➕ Create product'}
                            </button>
                            {editingProduct && (
                                <button type="button" className="btn-cancel" onClick={cancelEdit}>
                                    ❌ Hủy
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Products List */}
            <div className="products-section">
                <h2>
                    📦 Sản phẩm của tôi
                    <span className="product-count">({myProducts.length})</span>
                </h2>

                {myProducts.length === 0 ? (
                    <div className="no-products">
                        <div className="empty-icon">📦</div>
                        <p>No products yet</p>
                        <button className="btn-add-first" onClick={() => setShowForm(true)}>
                            ➕ Add first product
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {myProducts.map(product => {
                            const statusInfo = getStatusInfo(product.status);
                            // Get price and stock from variants or fallback
                            const price = product.variants?.[0]?.price || product.price || 0;
                            const stock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || product.stock || 0;
                            
                            return (
                                <div key={product._id} className="product-card-dashboard">
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: statusInfo.color }}
                                    >
                                        {statusInfo.icon} {statusInfo.label}
                                    </span>

                                    <div className="product-image-wrapper">
                                        <img 
                                            src={product.imageUrl || PLACEHOLDER_IMAGES.productSmall} 
                                            alt={product.name}
                                        />
                                    </div>

                                    <div className="product-details">
                                        <h3>{product.name}</h3>
                                        <p className="product-brand">🏷️ {product.brand}</p>
                                        <p className="product-description">{product.description}</p>
                                        
                                        <div className="product-meta">
                                            <span className="price">{price.toLocaleString()} VNĐ</span>
                                            <span className="stock">
                                                📦 {stock} {stock > 0 ? 'in stock' : 'out of stock'}
                                            </span>
                                        </div>

                                        <div className="product-actions">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEdit(product)}
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;