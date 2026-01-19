import React, { useState, useEffect, useContext } from 'react';
import axios from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { 
    FiDollarSign, FiPackage, FiTrendingUp, FiShoppingBag,
    FiCalendar, FiPieChart, FiBarChart2
} from 'react-icons/fi';
import '../manager/ManagerDashboard.css';

/**
 * Partner Dashboard
 * - Xem doanh thu theo ngày, tháng
 * - Thống kê sản phẩm, đơn hàng
 * - Top sản phẩm bán chạy
 * - Khác biệt hoàn toàn với User và Admin
 */
const PartnerDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        todayRevenue: 0,
        monthRevenue: 0,
        totalRevenue: 0,
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        totalSoldItems: 0
    });
    
    const [bestSellers, setBestSellers] = useState([]);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [revenueByBrand, setRevenueByBrand] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, products, revenue

    useEffect(() => {
        // Check if user is partner or admin
        if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        
        // Redirect admin to proper admin dashboard
        if (user.role === 'admin') {
            console.log('⚠️ Admin should use Admin Dashboard, not Partner Dashboard');
            // Admin can still view but show warning
        }
        
        // Check if partner is approved (admin không cần check)
        if (user.role === 'partner' && !user.isApproved) {
            // Partner pending approval - show limited view
        }
        
        fetchDashboardData();
        // eslint-disable-next-line
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all stats in parallel
            const [statsRes, monthRes, brandRes] = await Promise.all([
                axios.get('/partner/stats'),
                axios.get('/partner/revenue'),
                axios.get('/partner/revenue-by-brand')
            ]);
            
            // Process stats
            if (statsRes.data) {
                setStats(statsRes.data);
                setBestSellers(statsRes.data.bestSellers || []);
            }
            
            // Process monthly revenue
            if (monthRes.data) {
                setRevenueByMonth(monthRes.data);
            }
            
            // Process brand revenue
            if (brandRes.data) {
                setRevenueByBrand(brandRes.data);
            }
            
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const formatMonth = (monthStr) => {
        const [year, month] = monthStr.split('-');
        return `Tháng ${month}/${year}`;
    };

    if (loading) {
        return (
            <div className="partner-loading">
                <div className="spinner"></div>
                <h2>Đang tải dữ liệu...</h2>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="partner-dashboard-page">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h2>Có lỗi xảy ra</h2>
                    <p>{error}</p>
                    <button 
                        className="btn-primary"
                        onClick={fetchDashboardData}
                    >
                        🔄 Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="partner-dashboard" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', background: '#f5f7fa', minHeight: 'calc(100vh - 80px)' }}>
            {/* Header */}
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px 40px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)', color: 'white' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white', margin: '0 0 8px 0' }}>🏪 Partner Dashboard</h1>
                    {user?.shopName && (
                        <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>{user.shopName}</p>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn-new-product"
                        onClick={() => navigate('/partner/orders')}
                        style={{ background: 'white', color: '#667eea', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        📦 Quản lý đơn hàng
                    </button>
                    <button 
                        className="btn-new-product"
                        onClick={() => navigate('/manager')}
                        style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '2px solid white' }}
                    >
                        🛍️ Quản lý sản phẩm
                    </button>
                </div>
            </div>

            {/* Admin Info Banner */}
            {user?.role === 'admin' && (
                <div className="alert alert-info admin-banner">
                    <span>👑</span>
                    <div>
                        <strong>⚡ Chế độ Quản Trị Viên</strong>
                        <p>Đây là Partner Dashboard (xem thống kê partner). Để QUẢN LÝ TOÀN HỆ THỐNG (users, orders, products, reviews), vui lòng truy cập:</p>
                        <button 
                            className="btn-admin-dashboard"
                            onClick={() => navigate('/admin')}
                        >
                            🎯 Mở Admin Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Approval Warning */}
            {user?.role === 'partner' && !user?.isApproved && (
                <div className="alert alert-warning">
                    <span>⏳</span>
                    <div>
                        <strong>Tài khoản đang chờ phê duyệt</strong>
                        <p>Bạn có thể xem thống kê nhưng chưa thể thêm sản phẩm mới.</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <button 
                    className="btn-new-product"
                    style={{ 
                        flex: 1, 
                        background: activeTab === 'overview' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                        color: activeTab === 'overview' ? 'white' : '#718096'
                    }}
                    onClick={() => setActiveTab('overview')}
                >
                    <FiBarChart2 /> Overview
                </button>
                <button 
                    className="btn-new-product"
                    style={{ 
                        flex: 1, 
                        background: activeTab === 'revenue' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                        color: activeTab === 'revenue' ? 'white' : '#718096'
                    }}
                    onClick={() => setActiveTab('revenue')}
                >
                    <FiDollarSign /> Doanh thu
                </button>
                <button 
                    className="btn-new-product"
                    style={{ 
                        flex: 1, 
                        background: activeTab === 'products' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                        color: activeTab === 'products' ? 'white' : '#718096'
                    }}
                    onClick={() => setActiveTab('products')}
                >
                    <FiPackage /> Sản phẩm
                </button>
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s ease' }}>
                                <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <FiDollarSign size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px 0', fontWeight: 700, textTransform: 'uppercase' }}>Doanh thu hôm nay</h3>
                                    <p style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: '8px 0', lineHeight: 1 }}>{formatCurrency(stats.todayRevenue)}</p>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Cập nhật realtime</span>
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s ease' }}>
                                <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <FiCalendar size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px 0', fontWeight: 700, textTransform: 'uppercase' }}>Doanh thu tháng này</h3>
                                    <p style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: '8px 0', lineHeight: 1 }}>{formatCurrency(stats.monthRevenue)}</p>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Tháng {new Date().getMonth() + 1}</span>
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s ease' }}>
                                <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <FiTrendingUp size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px 0', fontWeight: 700, textTransform: 'uppercase' }}>Tổng doanh thu</h3>
                                    <p style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: '8px 0', lineHeight: 1 }}>{formatCurrency(stats.totalRevenue)}</p>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Tất cả thời gian</span>
                                </div>
                            </div>

                            <div 
                                style={{ background: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s ease', cursor: 'pointer' }}
                                onClick={() => navigate('/partner/orders')}
                            >
                                <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <FiShoppingBag size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px 0', fontWeight: 700, textTransform: 'uppercase' }}>Tổng đơn hàng</h3>
                                    <p style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: '8px 0', lineHeight: 1 }}>{stats.totalOrders || 0}</p>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                        {stats.totalSoldItems || 0} sản phẩm đã bán • Click để xem
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px', transition: 'all 0.3s ease' }}>
                                <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <FiPackage size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 8px 0', fontWeight: 700, textTransform: 'uppercase' }}>Sản phẩm</h3>
                                    <p style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: '8px 0', lineHeight: 1 }}>{stats.totalProducts || 0}</p>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{stats.activeProducts || 0} đang hoạt động</span>
                                </div>
                            </div>
                        </div>

                        {/* Best Sellers */}
                        <div style={{ background: 'white', padding: '36px', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '32px', border: '1px solid #f3f4f6' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', margin: '0 0 28px 0', display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '3px solid #f3f4f6' }}>
                                🔥 Top 5 Sản phẩm bán chạy
                            </h2>
                            {bestSellers.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af', fontSize: '16px', fontWeight: 500 }}>Chưa có sản phẩm nào được bán</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                    {bestSellers.map((product, index) => (
                                        <div key={product._id} style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)', padding: '20px', borderRadius: '14px', border: '2px solid #f3f4f6', transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '12px', left: '12px', width: '32px', height: '32px', background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', boxShadow: '0 4px 12px rgba(22,160,133,0.3)', zIndex: 1 }}>
                                                #{index + 1}
                                            </div>
                                            <img 
                                                src={product.imageUrl || 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png'} 
                                                alt={product.name}
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }}
                                            />
                                            <div>
                                                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', margin: '0 0 8px 0', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
                                                <p style={{ fontSize: '18px', fontWeight: 800, color: '#16a085', margin: '8px 0' }}>{formatCurrency(product.price)}</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                                                    <span>✅ Đã bán: {product.soldCount}</span>
                                                    <span>📦 Tồn kho: {product.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* REVENUE TAB */}
                {activeTab === 'revenue' && (
                    <>
                        {/* Revenue by Month */}
                        <div className="section-card">
                            <h2><FiBarChart2 /> Doanh thu 6 tháng gần đây</h2>
                            {revenueByMonth.length === 0 ? (
                                <p className="no-data">Chưa có dữ liệu doanh thu</p>
                            ) : (
                                <div className="revenue-chart">
                                    {revenueByMonth.map(item => (
                                        <div key={item.month} className="chart-bar">
                                            <div 
                                                className="bar-fill" 
                                                style={{ 
                                                    height: `${(item.revenue / Math.max(...revenueByMonth.map(r => r.revenue))) * 100}%` 
                                                }}
                                            >
                                                <span className="bar-value">{formatCurrency(item.revenue)}</span>
                                            </div>
                                            <div className="bar-label">{formatMonth(item.month)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Revenue by Brand */}
                        <div className="section-card">
                            <h2><FiPieChart /> Doanh thu theo thương hiệu</h2>
                            {revenueByBrand.length === 0 ? (
                                <p className="no-data">Chưa có dữ liệu doanh thu theo thương hiệu</p>
                            ) : (
                                <div className="brand-revenue-list">
                                    {revenueByBrand.map(brand => (
                                        <div key={brand.brand} className="brand-item">
                                            <div className="brand-header">
                                                <h4>{brand.brand}</h4>
                                                <span className="brand-revenue">{formatCurrency(brand.revenue)}</span>
                                            </div>
                                            <div className="brand-stats">
                                                <span>📦 {brand.productCount} sản phẩm</span>
                                                <span>✅ Đã bán {brand.soldCount} chiếc</span>
                                            </div>
                                            <div 
                                                className="brand-progress-bar"
                                                style={{ 
                                                    width: `${(brand.revenue / Math.max(...revenueByBrand.map(b => b.revenue))) * 100}%` 
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <div className="section-card">
                        <h2><FiPackage /> Thống kê sản phẩm</h2>
                        <div className="product-stats-grid">
                            <div className="product-stat">
                                <h3>{stats.totalProducts || 0}</h3>
                                <p>Tổng sản phẩm</p>
                            </div>
                            <div className="product-stat">
                                <h3>{stats.activeProducts || 0}</h3>
                                <p>Đang hoạt động</p>
                            </div>
                            <div className="product-stat">
                                <h3>{stats.outOfStockProducts || 0}</h3>
                                <p>Hết hàng</p>
                            </div>
                            <div className="product-stat">
                                <h3>{stats.totalSoldItems || 0}</h3>
                                <p>Đã bán</p>
                            </div>
                        </div>
                        
                        <div className="action-buttons">
                            <button 
                                className="btn-primary"
                                onClick={() => navigate('/manager')}
                            >
                                📦 Quản lý sản phẩm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerDashboard;
