import React, { useState, useEffect, useContext } from 'react';
import axios from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { 
    FiPackage, FiTruck, FiCheckCircle, FiXCircle, 
    FiClock, FiUser, FiPhone, FiMapPin, FiDollarSign,
    FiChevronDown, FiChevronUp, FiArrowRight
} from 'react-icons/fi';
import './PartnerOrders.css';

const PartnerOrders = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingItem, setUpdatingItem] = useState(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        fetchOrders();
        // eslint-disable-next-line
    }, [currentPage, selectedStatus]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                page: currentPage,
                limit: 10
            };
            
            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }
            
            const response = await axios.get('/partner/orders', { params });
            
            setOrders(response.data.orders || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalOrders(response.data.totalOrders || 0);
            setCurrentPage(response.data.currentPage || 1);
            
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const updateItemStatus = async (orderId, itemId, newStatus, note = '') => {
        try {
            setUpdatingItem(itemId);
            
            await axios.patch(`/partner/orders/${orderId}/items/${itemId}/status`, {
                status: newStatus,
                note: note || `Cập nhật bởi ${user.shopName || user.username}`
            });
            
            // Refresh orders
            await fetchOrders();
            
            alert('✅ Cập nhật trạng thái thành công!');
        } catch (err) {
            console.error('Failed to update item status:', err);
            alert(err.response?.data?.message || 'Không thể cập nhật. Vui lòng thử lại.');
        } finally {
            setUpdatingItem(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            confirmed: { 
                label: 'Đã xác nhận', 
                icon: <FiClock />, 
                color: '#3b82f6',
                bg: '#dbeafe'
            },
            processing: { 
                label: 'Đang xử lý', 
                icon: <FiPackage />, 
                color: '#f59e0b',
                bg: '#fef3c7'
            },
            shipped: { 
                label: 'Đang giao', 
                icon: <FiTruck />, 
                color: '#8b5cf6',
                bg: '#ede9fe'
            },
            delivered: { 
                label: 'Đã giao', 
                icon: <FiCheckCircle />, 
                color: '#10b981',
                bg: '#d1fae5'
            },
            cancelled: { 
                label: 'Đã hủy', 
                icon: <FiXCircle />, 
                color: '#ef4444',
                bg: '#fee2e2'
            },
            returned: { 
                label: 'Đã trả', 
                icon: <FiXCircle />, 
                color: '#6b7280',
                bg: '#f3f4f6'
            }
        };
        
        const config = statusConfig[status] || statusConfig.confirmed;
        
        return (
            <span className="status-badge" style={{ 
                background: config.bg, 
                color: config.color,
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const getNextStatus = (currentStatus) => {
        const transitions = {
            confirmed: 'processing',
            processing: 'shipped',
            shipped: 'delivered'
        };
        return transitions[currentStatus];
    };

    const getNextStatusLabel = (currentStatus) => {
        const labels = {
            confirmed: 'Bắt đầu xử lý',
            processing: 'Đã giao shipper',
            shipped: 'Đã giao thành công'
        };
        return labels[currentStatus];
    };

    const canUpdateStatus = (item) => {
        // Check if this item belongs to current partner
        return item.seller === user._id && 
               ['confirmed', 'processing', 'shipped'].includes(item.status);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && orders.length === 0) {
        return (
            <div className="partner-orders-loading">
                <div className="spinner"></div>
                <h2>Đang tải đơn hàng...</h2>
            </div>
        );
    }

    return (
        <div className="partner-orders-page">
            {/* Header */}
            <div className="orders-header">
                <div>
                    <h1>📦 Quản lý đơn hàng</h1>
                    <p>Xem và cập nhật trạng thái đơn hàng chứa sản phẩm của shop bạn</p>
                </div>
                <button 
                    className="btn-back"
                    onClick={() => navigate('/partner/dashboard')}
                >
                    ← Về Dashboard
                </button>
            </div>

            {/* Filters */}
            <div className="orders-filters">
                <button 
                    className={selectedStatus === 'all' ? 'active' : ''}
                    onClick={() => setSelectedStatus('all')}
                >
                    Tất cả ({totalOrders})
                </button>
                <button 
                    className={selectedStatus === 'confirmed' ? 'active' : ''}
                    onClick={() => setSelectedStatus('confirmed')}
                >
                    <FiClock /> Chờ xử lý
                </button>
                <button 
                    className={selectedStatus === 'processing' ? 'active' : ''}
                    onClick={() => setSelectedStatus('processing')}
                >
                    <FiPackage /> Đang xử lý
                </button>
                <button 
                    className={selectedStatus === 'shipped' ? 'active' : ''}
                    onClick={() => setSelectedStatus('shipped')}
                >
                    <FiTruck /> Đang giao
                </button>
                <button 
                    className={selectedStatus === 'delivered' ? 'active' : ''}
                    onClick={() => setSelectedStatus('delivered')}
                >
                    <FiCheckCircle /> Đã giao
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="error-message">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button onClick={fetchOrders}>Thử lại</button>
                </div>
            )}

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="no-orders">
                    <FiPackage size={64} />
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>Các đơn hàng chứa sản phẩm của bạn sẽ hiển thị ở đây</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => {
                        // Filter items belonging to current partner
                        const myItems = order.items.filter(item => 
                            item.seller === user._id
                        );
                        const otherItems = order.items.filter(item => 
                            item.seller !== user._id
                        );
                        
                        return (
                            <div key={order._id} className="order-card">
                                {/* Order Header */}
                                <div className="order-header">
                                    <div className="order-info">
                                        <h3>#{order.orderNumber}</h3>
                                        <span className="order-date">
                                            <FiClock /> {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    <div className="order-status">
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="customer-info">
                                    <div>
                                        <FiUser /> <strong>{order.user?.username}</strong>
                                    </div>
                                    <div>
                                        <FiPhone /> {order.shippingAddress?.phone}
                                    </div>
                                    <div>
                                        <FiMapPin /> {order.shippingAddress?.address}
                                    </div>
                                </div>

                                {/* My Items */}
                                <div className="order-items-section">
                                    <h4>🏪 Sản phẩm của shop bạn ({myItems.length})</h4>
                                    {myItems.map(item => (
                                        <div key={item._id} className="order-item my-item">
                                            <img 
                                                src={item.imageUrl || '/default-shoe.png'} 
                                                alt={item.name}
                                                onError={(e) => e.target.src = '/default-shoe.png'}
                                            />
                                            <div className="item-details">
                                                <h5>{item.name}</h5>
                                                <p className="item-specs">
                                                    {item.brand} | {item.specifications?.processor}
                                                </p>
                                                <div className="item-meta">
                                                    <span>Số lượng: {item.quantity}</span>
                                                    <span className="item-price">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="item-status-control">
                                                {getStatusBadge(item.status)}
                                                
                                                {/* Update Status Button */}
                                                {canUpdateStatus(item) && (
                                                    <button 
                                                        className="btn-update-status"
                                                        onClick={() => {
                                                            const nextStatus = getNextStatus(item.status);
                                                            if (nextStatus) {
                                                                const confirmed = window.confirm(
                                                                    `Xác nhận chuyển sang "${getNextStatusLabel(item.status)}"?`
                                                                );
                                                                if (confirmed) {
                                                                    updateItemStatus(order._id, item._id, nextStatus);
                                                                }
                                                            }
                                                        }}
                                                        disabled={updatingItem === item._id}
                                                    >
                                                        {updatingItem === item._id ? (
                                                            'Đang cập nhật...'
                                                        ) : (
                                                            <>
                                                                {getNextStatusLabel(item.status)} <FiArrowRight />
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                
                                                {item.status === 'delivered' && (
                                                    <span className="status-done">✅ Hoàn thành</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Other Items (if any) */}
                                {otherItems.length > 0 && (
                                    <div className="order-items-section other-items">
                                        <button 
                                            className="toggle-other-items"
                                            onClick={() => setExpandedOrder(
                                                expandedOrder === order._id ? null : order._id
                                            )}
                                        >
                                            <span>🏪 Sản phẩm từ shop khác ({otherItems.length})</span>
                                            {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                                        </button>
                                        
                                        {expandedOrder === order._id && (
                                            <div className="other-items-list">
                                                {otherItems.map(item => (
                                                    <div key={item._id} className="order-item">
                                                        <img 
                                                            src={item.imageUrl || '/default-shoe.png'} 
                                                            alt={item.name}
                                                        />
                                                        <div className="item-details">
                                                            <h5>{item.name}</h5>
                                                            <p className="seller-name">
                                                                Shop: {item.sellerName}
                                                            </p>
                                                            <div className="item-meta">
                                                                <span>x{item.quantity}</span>
                                                                {getStatusBadge(item.status)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Order Total */}
                                <div className="order-footer">
                                    <div className="order-total">
                                        <FiDollarSign />
                                        <span>Tổng đơn hàng:</span>
                                        <strong>{formatCurrency(order.totalAmount)}</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ← Trước
                    </button>
                    <span>Trang {currentPage} / {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default PartnerOrders;
