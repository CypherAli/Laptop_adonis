import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { useToast } from '../common/Toast';
import { FiShield, FiAlertCircle, FiCheckCircle, FiClock, FiFileText, FiTool } from 'react-icons/fi';
import './ProfileTabs.css';

const WarrantyManagement = () => {
    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedWarranty, setSelectedWarranty] = useState(null);
    const toast = useToast();

    useEffect(() => {
        fetchWarranties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchWarranties = async () => {
        try {
            setLoading(true);
            // Get orders with warranty info
            const response = await axios.get('/orders/my-orders');
            const ordersData = response.data.orders || response.data;
            
            // Extract warranty info from delivered orders
            const warrantyItems = [];
            ordersData.forEach(order => {
                if (order.status === 'delivered' && order.items) {
                    order.items.forEach(item => {
                        warrantyItems.push({
                            orderId: order._id,
                            orderNumber: order.orderNumber,
                            orderDate: order.createdAt,
                            deliveredDate: order.tracking?.deliveredDate || order.updatedAt,
                            productId: item.product?._id || item.product,
                            productName: item.name,
                            productBrand: item.brand,
                            productImage: item.imageUrl,
                            warrantyPeriod: 12, // Default 12 months
                            warrantyStatus: 'active',
                            specifications: item.specifications
                        });
                    });
                }
            });
            
            setWarranties(warrantyItems);
        } catch (error) {
            console.error('Error fetching warranties:', error);
            toast.error('Không thể tải thông tin bảo hành');
        } finally {
            setLoading(false);
        }
    };

    const getWarrantyStatus = (deliveredDate, warrantyPeriod) => {
        const delivered = new Date(deliveredDate);
        const now = new Date();
        const expiryDate = new Date(delivered);
        expiryDate.setMonth(expiryDate.getMonth() + warrantyPeriod);
        
        const monthsLeft = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24 * 30));
        
        if (monthsLeft <= 0) {
            return { status: 'expired', label: 'Hết hạn', color: '#e74c3c', icon: <FiAlertCircle /> };
        } else if (monthsLeft <= 2) {
            return { status: 'expiring', label: `Còn ${monthsLeft} tháng`, color: '#f39c12', icon: <FiClock /> };
        } else {
            return { status: 'active', label: `Còn ${monthsLeft} tháng`, color: '#27ae60', icon: <FiCheckCircle /> };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getExpiryDate = (deliveredDate, warrantyPeriod) => {
        const date = new Date(deliveredDate);
        date.setMonth(date.getMonth() + warrantyPeriod);
        return date;
    };

    const filteredWarranties = warranties.filter(w => {
        if (activeTab === 'all') return true;
        const statusInfo = getWarrantyStatus(w.deliveredDate, w.warrantyPeriod);
        return statusInfo.status === activeTab;
    });

    if (loading) {
        return (
            <div className="warranty-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin bảo hành...</p>
            </div>
        );
    }

    return (
        <div className="warranty-management-tab">
            <div className="warranty-header">
                <h2>
                    <FiShield /> Quản lý bảo hành
                </h2>
                <p className="warranty-description">
                    Track warranty status of purchased products
                </p>
            </div>

            {/* Warranty Tabs */}
            <div className="warranty-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All ({warranties.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active ({warranties.filter(w => getWarrantyStatus(w.deliveredDate, w.warrantyPeriod).status === 'active').length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'expiring' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expiring')}
                >
                    Expiring Soon ({warranties.filter(w => getWarrantyStatus(w.deliveredDate, w.warrantyPeriod).status === 'expiring').length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'expired' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expired')}
                >
                    Expired ({warranties.filter(w => getWarrantyStatus(w.deliveredDate, w.warrantyPeriod).status === 'expired').length})
                </button>
            </div>

            {/* Warranty List */}
            {filteredWarranties.length === 0 ? (
                <div className="no-warranties">
                    <FiShield size={64} />
                    <h3>No products found</h3>
                    <p>
                        {activeTab === 'all' 
                            ? 'You have no products under warranty' 
                            : `No products ${activeTab === 'active' ? 'under warranty' : activeTab === 'expiring' ? 'expiring soon' : 'expired'}`
                        }
                    </p>
                </div>
            ) : (
                <div className="warranties-list">
                    {filteredWarranties.map((warranty, index) => {
                        const statusInfo = getWarrantyStatus(warranty.deliveredDate, warranty.warrantyPeriod);
                        const expiryDate = getExpiryDate(warranty.deliveredDate, warranty.warrantyPeriod);
                        
                        return (
                            <div key={index} className="warranty-card">
                                <div className="warranty-card-header">
                                    <div className="product-info-section">
                                        <div className="product-image">
                                            {warranty.productImage ? (
                                                <img src={warranty.productImage} alt={warranty.productName} />
                                            ) : (
                                                <div className="image-placeholder">
                                                    <FiShield />
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-details">
                                            <h3>{warranty.productName}</h3>
                                            {warranty.productBrand && (
                                                <p className="product-brand">{warranty.productBrand}</p>
                                            )}
                                            <p className="order-info">
                                                Order: #{warranty.orderNumber || warranty.orderId.slice(-8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div 
                                        className="warranty-status-badge"
                                        style={{ backgroundColor: statusInfo.color }}
                                    >
                                        {statusInfo.icon}
                                        <span>{statusInfo.label}</span>
                                    </div>
                                </div>

                                <div className="warranty-card-body">
                                    <div className="warranty-info">
                                        <div className="info-row">
                                            <span className="info-label">Ngày mua:</span>
                                            <span className="info-value">{formatDate(warranty.orderDate)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Ngày nhận:</span>
                                            <span className="info-value">{formatDate(warranty.deliveredDate)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Thời gian bảo hành:</span>
                                            <span className="info-value">{warranty.warrantyPeriod} tháng</span>
                                        </div>
                                        <div className="info-row highlight">
                                            <span className="info-label">Hết hạn:</span>
                                            <span className="info-value">{formatDate(expiryDate)}</span>
                                        </div>
                                    </div>

                                    {warranty.specifications && (
                                        <div className="product-specs">
                                            <h4>Thông số kỹ thuật:</h4>
                                            <div className="specs-grid">
                                                {warranty.specifications.size && (
                                                    <span className="spec-item">Size: {warranty.specifications.size}</span>
                                                )}
                                                {warranty.specifications.color && (
                                                    <span className="spec-item">Màu: {warranty.specifications.color}</span>
                                                )}
                                                {warranty.specifications.material && (
                                                    <span className="spec-item">Chất liệu: {warranty.specifications.material}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="warranty-card-footer">
                                    <button 
                                        className="btn-view-warranty"
                                        onClick={() => setSelectedWarranty(warranty)}
                                    >
                                        <FiFileText /> View Details
                                    </button>
                                    {statusInfo.status !== 'expired' && (
                                        <button className="btn-request-repair">
                                            <FiTool /> Request Warranty
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Warranty Detail Modal */}
            {selectedWarranty && (
                <div className="modal-overlay" onClick={() => setSelectedWarranty(null)}>
                    <div className="warranty-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><FiShield /> Warranty Details</h2>
                            <button className="btn-close" onClick={() => setSelectedWarranty(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="warranty-detail-content">
                                <div className="product-summary">
                                    {selectedWarranty.productImage && (
                                        <img src={selectedWarranty.productImage} alt={selectedWarranty.productName} />
                                    )}
                                    <div>
                                        <h3>{selectedWarranty.productName}</h3>
                                        <p>{selectedWarranty.productBrand}</p>
                                    </div>
                                </div>

                                <div className="warranty-details-grid">
                                    <div className="detail-item">
                                        <span className="label">Order Code:</span>
                                        <span className="value">#{selectedWarranty.orderNumber || selectedWarranty.orderId.slice(-8).toUpperCase()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Purchase Date:</span>
                                        <span className="value">{formatDate(selectedWarranty.orderDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Delivery Date:</span>
                                        <span className="value">{formatDate(selectedWarranty.deliveredDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Thời gian bảo hành:</span>
                                        <span className="value">{selectedWarranty.warrantyPeriod} tháng</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Ngày hết hạn:</span>
                                        <span className="value">{formatDate(getExpiryDate(selectedWarranty.deliveredDate, selectedWarranty.warrantyPeriod))}</span>
                                    </div>
                                </div>

                                <div className="warranty-terms">
                                    <h4>Điều khoản bảo hành:</h4>
                                    <ul>
                                        <li>✓ Bảo hành phần cứng trong {selectedWarranty.warrantyPeriod} tháng</li>
                                        <li>✓ Đổi mới trong 7 ngày nếu có lỗi nhà sản xuất</li>
                                        <li>✓ Hỗ trợ kỹ thuật miễn phí</li>
                                        <li>✗ Không bảo hành: va đập, rơi vỡ, ngấm nước</li>
                                        <li>✗ Không bảo hành: phần mềm, virus</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={() => {
                                toast.info('Tính năng yêu cầu bảo hành đang được phát triển');
                            }}>
                                <FiTool /> Yêu cầu bảo hành
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warranty Guide */}
            <div className="warranty-guide">
                <h3><FiFileText /> Warranty Guide</h3>
                <div className="guide-content">
                    <div className="guide-step">
                        <span className="step-number">1</span>
                        <div>
                            <h4>Check Warranty Status</h4>
                            <p>View remaining warranty time for your product</p>
                        </div>
                    </div>
                    <div className="guide-step">
                        <span className="step-number">2</span>
                        <div>
                            <h4>Submit Warranty Request</h4>
                            <p>Describe the issue in detail and attach photos if needed</p>
                        </div>
                    </div>
                    <div className="guide-step">
                        <span className="step-number">3</span>
                        <div>
                            <h4>Wait for Confirmation</h4>
                            <p>We will contact you within 24 hours</p>
                        </div>
                    </div>
                    <div className="guide-step">
                        <span className="step-number">4</span>
                        <div>
                            <h4>Send Product or Home Service</h4>
                            <p>Choose to send product or have technician visit your location</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarrantyManagement;
