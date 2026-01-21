import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../api/axiosConfig';
import AuthContext from '../../../../context/AuthContext';
import { PLACEHOLDER_IMAGES } from '../../../../utils/placeholder';
import './OrdersPage.css';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for auth to initialize
        if (authLoading) return;
        
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/orders');
            
            const ordersData = res.data.orders || res.data;
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setError(null);
        } catch (err) {
            setError('Cannot load orders. Please try again.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await axios.put(`/orders/${orderId}/cancel`);
            alert('Order has been cancelled successfully!');
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Cannot cancel order');
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { label: 'Chờ xác nhận', color: '#f39c12', icon: '' },
            confirmed: { label: 'Đã xác nhận', color: '#16a085', icon: '' },
            processing: { label: 'Đang xử lý', color: '#3498db', icon: '' },
            shipped: { label: 'Đang giao', color: '#9b59b6', icon: '' },
            delivered: { label: 'Đã giao', color: '#27ae60', icon: '' },
            cancelled: { label: 'Đã hủy', color: '#e74c3c', icon: '' }
        };
        return statusMap[status] || { label: status, color: '#95a5a6', icon: '' };
    };

    const getStatusStep = (status) => {
        const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        return steps.indexOf(status);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(order => order.status === filterStatus);

    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <h2>Loading orders...</h2>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <h2>Lỗi</h2>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h1>
                    My Orders
                </h1>
                <span className="orders-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
            </div>

            {/* Status Filter Tabs */}
            <div className="status-tabs">
                <button 
                    className={`tab ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('all')}
                >
                    All ({statusCounts.all})
                </button>
                <button 
                    className={`tab ${filterStatus === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('pending')}
                >
                    Pending ({statusCounts.pending})
                </button>
                <button 
                    className={`tab ${filterStatus === 'processing' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('processing')}
                >
                    Processing ({statusCounts.processing})
                </button>
                <button 
                    className={`tab ${filterStatus === 'shipped' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('shipped')}
                >
                    Shipping ({statusCounts.shipped})
                </button>
                <button 
                    className={`tab ${filterStatus === 'delivered' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('delivered')}
                >
                    Delivered ({statusCounts.delivered})
                </button>
                <button 
                    className={`tab ${filterStatus === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('cancelled')}
                >
                    Cancelled ({statusCounts.cancelled})
                </button>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="no-orders">
                    <h2>No orders found</h2>
                    <p>
                        {filterStatus === 'all' 
                            ? 'You have no orders yet. Start shopping!' 
                            : `No orders with status "${getStatusInfo(filterStatus).label.toLowerCase()}"`
                        }
                    </p>
                    <button onClick={() => navigate('/')} className="shop-btn">
                                                🛒 Shop Now
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map(order => {
                        const statusInfo = getStatusInfo(order.status);
                        const currentStep = getStatusStep(order.status);
                        
                        return (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-id-section">
                                        <h3>#{order.orderNumber || order._id.slice(-8).toUpperCase()}</h3>
                                        <p className="order-date">{formatDate(order.createdAt)}</p>
                                        {order.paymentMethod && (
                                            <p className="payment-method">
                                                💳 {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                                    order.paymentMethod === 'bank' ? 'Chuyển khoản' :
                                                    order.paymentMethod === 'momo' ? 'Ví MoMo' :
                                                    order.paymentMethod === 'zalopay' ? 'ZaloPay' : 'Khác'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="order-status-section">
                                        <span 
                                            className="order-status-badge"
                                            style={{ backgroundColor: statusInfo.color }}
                                        >
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                        {order.paymentStatus && (
                                            <span className="payment-status">
                                                {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Timeline */}
                                {order.status !== 'cancelled' && (
                                    <div className="status-timeline">
                                        <div className="timeline-step">
                                            <div className={`step-indicator ${currentStep >= 1 ? 'completed' : ''}`}>
                                                {currentStep >= 1 ? '✓' : '✅'}
                                            </div>
                                            <span className="step-label">Đã xác nhận</span>
                                        </div>
                                        <div className={`timeline-line ${currentStep >= 2 ? 'completed' : ''}`}></div>
                                        <div className="timeline-step">
                                            <div className={`step-indicator ${currentStep >= 2 ? 'completed' : ''}`}>
                                                {currentStep >= 2 ? '✓' : '📦'}
                                            </div>
                                            <span className="step-label">Đang xử lý</span>
                                        </div>
                                        <div className={`timeline-line ${currentStep >= 3 ? 'completed' : ''}`}></div>
                                        <div className="timeline-step">
                                            <div className={`step-indicator ${currentStep >= 3 ? 'completed' : ''}`}>
                                                {currentStep >= 3 ? '✓' : '🚚'}
                                            </div>
                                            <span className="step-label">Đang giao</span>
                                        </div>
                                        <div className={`timeline-line ${currentStep >= 4 ? 'completed' : ''}`}></div>
                                        <div className="timeline-step">
                                            <div className={`step-indicator ${currentStep >= 4 ? 'completed' : ''}`}>
                                                {currentStep >= 4 ? '✓' : '📍'}
                                            </div>
                                            <span className="step-label">Đã giao</span>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img 
                                                src={item.imageUrl || PLACEHOLDER_IMAGES.avatar} 
                                                alt={item.name}
                                                className="item-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = PLACEHOLDER_IMAGES.avatar;
                                                }}
                                            />
                                            <div className="item-details">
                                                <p className="item-name">{item.name}</p>
                                                <p className="item-quantity">x{item.quantity}</p>
                                            </div>
                                            <div className="item-price">
                                                {(item.price * item.quantity).toLocaleString()} VNĐ
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping Info */}
                                {order.shippingAddress && (
                                    <div className="shipping-section">
                                        <h4>Địa chỉ giao hàng</h4>
                                        <div className="shipping-details">
                                            <p><strong>{order.shippingAddress.fullName}</strong></p>
                                            <p>{order.shippingAddress.phone}</p>
                                            <p>{[
                                                order.shippingAddress.address?.street || order.shippingAddress.address,
                                                order.shippingAddress.address?.ward,
                                                order.shippingAddress.address?.district,
                                                order.shippingAddress.address?.city || order.shippingAddress.city
                                            ].filter(Boolean).join(', ')}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Order Footer */}
                                <div className="order-card-footer">
                                    <div className="order-total-section">
                                        <div className="price-breakdown">
                                            {order.subtotal && (
                                                <div className="price-row">
                                                    <span>Tiền hàng:</span>
                                                    <span>{order.subtotal.toLocaleString()} ₫</span>
                                                </div>
                                            )}
                                            {order.shippingFee !== undefined && (
                                                <div className="price-row">
                                                    <span>Phí vận chuyển:</span>
                                                    <span>{order.shippingFee === 0 ? 'Miễn phí' : `${order.shippingFee.toLocaleString()} ₫`}</span>
                                                </div>
                                            )}
                                            {order.discount > 0 && (
                                                <div className="price-row discount">
                                                    <span>Discount:</span>
                                                    <span>-{order.discount.toLocaleString()} ₫</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="total-row">
                                            <span className="total-label">Tổng cộng:</span>
                                            <span className="total-amount">
                                                {order.totalAmount.toLocaleString()} ₫
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-actions">
                                        <button 
                                            className="btn-detail"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            📋 Chi tiết
                                        </button>
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="btn-cancel"
                                            >
                                                ❌ Cancel
                                            </button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <>
                                                <button className="btn-reorder">
                                                    🔄 Mua lại
                                                </button>
                                                <button className="btn-review">
                                                    ⭐ Đánh giá
                                                </button>
                                            </>
                                        )}
                                        {order.tracking?.trackingNumber && (
                                            <button className="btn-track">
                                                📍 Theo dõi
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết đơn hàng</h2>
                            <button className="btn-close" onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Mã đơn hàng</h3>
                                <p>#{selectedOrder._id}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Ngày đặt</h3>
                                <p>{formatDate(selectedOrder.createdAt)}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Trạng thái</h3>
                                <span 
                                    className="order-status-badge"
                                    style={{ backgroundColor: getStatusInfo(selectedOrder.status).color }}
                                >
                                    {getStatusInfo(selectedOrder.status).icon} {getStatusInfo(selectedOrder.status).label}
                                </span>
                            </div>

                            <div className="detail-section">
                                <h3>Products</h3>
                                {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="detail-item">
                                        <img 
                                            src={item.imageUrl || PLACEHOLDER_IMAGES.avatar} 
                                            alt={item.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = PLACEHOLDER_IMAGES.avatar;
                                            }}
                                        />
                                        <div>
                                            <p><strong>{item.name}</strong></p>
                                            <p>{item.price.toLocaleString()} VNĐ × {item.quantity}</p>
                                        </div>
                                        <p><strong>{(item.price * item.quantity).toLocaleString()} VNĐ</strong></p>
                                    </div>
                                ))}
                            </div>

                            {selectedOrder.shippingAddress && (
                                <div className="detail-section">
                                    <h3>Địa chỉ giao hàng</h3>
                                    <p><strong>{selectedOrder.shippingAddress.fullName}</strong></p>
                                    <p>{selectedOrder.shippingAddress.phone}</p>
                                    <p>{[
                                        selectedOrder.shippingAddress.address?.street || selectedOrder.shippingAddress.address,
                                        selectedOrder.shippingAddress.address?.ward,
                                        selectedOrder.shippingAddress.address?.district,
                                        selectedOrder.shippingAddress.address?.city || selectedOrder.shippingAddress.city
                                    ].filter(Boolean).join(', ')}</p>
                                </div>
                            )}

                            <div className="detail-section total-section">
                                <h3>Total Payment</h3>
                                <p className="detail-total">{selectedOrder.totalAmount.toLocaleString()} VNĐ</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
