import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder';
import './DealsPage.css';

const DealsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('discount');
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 59,
        seconds: 59
    });
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

    useEffect(() => {
        fetchDeals();
    }, []);

    // Timer countdown effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else {
                    // Reset timer khi hết thời gian
                    return { hours: 23, minutes: 59, seconds: 59 };
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Filter products when category or sort changes
    useEffect(() => {
        let filtered = [...products];

        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter(p => 
                p.category?.toLowerCase() === activeCategory.toLowerCase()
            );
        }

        // Sort products
        if (sortBy === 'discount') {
            filtered.sort((a, b) => b.discountPercent - a.discountPercent);
        } else if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredProducts(filtered);
    }, [products, activeCategory, sortBy]);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            // Lấy tất cả sản phẩm có variants với discount
            const res = await axios.get('/products', {
                params: {
                    limit: 100,
                    inStock: true
                }
            });
            
            const productsData = res.data.products || res.data;
            // Lọc sản phẩm có discount từ variants
            const dealsProducts = productsData
                .filter(p => {
                    if (!p.variants || p.variants.length === 0) return false;
                    // Kiểm tra có ít nhất 1 variant có originalPrice > price
                    return p.variants.some(v => v.originalPrice && v.originalPrice > v.price && v.stock > 0);
                })
                .map(p => {
                    // Tính discount từ variant có % giảm cao nhất
                    const variantsWithDiscount = p.variants
                        .filter(v => v.originalPrice && v.originalPrice > v.price && v.stock > 0)
                        .map(v => ({
                            ...v,
                            discountPercent: Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100)
                        }));
                    
                    const maxDiscount = Math.max(...variantsWithDiscount.map(v => v.discountPercent));
                    const bestDealVariant = variantsWithDiscount.find(v => v.discountPercent === maxDiscount);
                    
                    return {
                        ...p,
                        price: bestDealVariant.price,
                        originalPrice: bestDealVariant.originalPrice,
                        discountPercent: maxDiscount,
                        soldCount: p.soldCount || Math.floor(Math.random() * 500) + 50,
                        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                        reviewCount: Math.floor(Math.random() * 200) + 20
                    };
                })
                .sort((a, b) => b.discountPercent - a.discountPercent);
            
            setProducts(dealsProducts);
            setFilteredProducts(dealsProducts);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching deals:', err);
            setError('Cannot load deals list');
            setLoading(false);
        }
    };

    // Get unique categories
    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    };

    if (loading) {
        return (
            <div className="deals-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading deals...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="deals-page">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="deals-page">
            {/* Flash Sale Banner với Timer */}
            <div className="flash-sale-banner">
                <div className="flash-sale-content">
                    <div className="flash-sale-left">
                        <h2 className="flash-sale-title">⚡ FLASH SALE ⚡</h2>
                        <p className="flash-sale-subtitle">Deal hot kết thúc trong:</p>
                    </div>
                    <div className="countdown-timer">
                        <div className="timer-box">
                            <span className="timer-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="timer-label">Giờ</span>
                        </div>
                        <span className="timer-separator">:</span>
                        <div className="timer-box">
                            <span className="timer-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="timer-label">Phút</span>
                        </div>
                        <span className="timer-separator">:</span>
                        <div className="timer-box">
                            <span className="timer-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="timer-label">Giây</span>
                        </div>
                    </div>
                    <div className="flash-sale-right">
                        <span className="deals-count">🎁 {products.length} Deals</span>
                    </div>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="deals-hero">
                <div className="deals-hero-content">
                    <h1 className="deals-title">🔥 SIÊU SALE KHỦNG</h1>
                    <p className="deals-subtitle">
                        Discounts up to 50% - Buy now before it's too late!
                    </p>
                    <div className="deals-stats">
                        <div className="stat-item">
                            <span className="stat-number">{products.length}</span>
                            <span className="stat-label">Sản phẩm</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {products.length > 0 ? Math.max(...products.map(p => p.discountPercent)) : 0}%
                            </span>
                            <span className="stat-label">Giảm tối đa</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {products.reduce((sum, p) => sum + (p.soldCount || 0), 0)}
                            </span>
                            <span className="stat-label">Đã bán</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="category-tabs">
                <div className="tabs-container">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat === 'all' ? '🎯 All' : `💻 ${cat}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="deals-filter-bar">
                <div className="filter-container">
                    <div className="filter-info">
                        <span className="result-count">
                            <strong>{filteredProducts.length}</strong> products on sale
                        </span>
                    </div>
                    <div className="filter-actions">
                        <button 
                            className={`filter-btn ${sortBy === 'discount' ? 'active' : ''}`}
                            onClick={() => setSortBy('discount')}
                        >
                            🔥 High discount
                        </button>
                        <button 
                            className={`filter-btn ${sortBy === 'price-low' ? 'active' : ''}`}
                            onClick={() => setSortBy('price-low')}
                        >
                            💰 Giá thấp
                        </button>
                        <button 
                            className={`filter-btn ${sortBy === 'price-high' ? 'active' : ''}`}
                            onClick={() => setSortBy('price-high')}
                        >
                            � Giá cao
                        </button>
                        <button 
                            className={`filter-btn ${sortBy === 'newest' ? 'active' : ''}`}
                            onClick={() => setSortBy('newest')}
                        >
                            ✨ Mới nhất
                        </button>
                    </div>
                </div>
            </div>

            {/* Flash Deals - Top 3 deals hot nhất */}
            {filteredProducts.length > 0 && (
                <div className="flash-deals-section">
                    <div className="section-header">
                        <h2 className="section-title">⚡ FLASH DEALS HOT NHẤT</h2>
                        <p className="section-subtitle">Huge discounts - Limited quantity</p>
                    </div>
                    <div className="flash-deals-grid">
                        {filteredProducts.slice(0, 3).map(product => (
                            <div key={product._id} className="flash-deal-card">
                                <div className="flash-badge">
                                    <span className="flash-icon">⚡</span>
                                    <span className="flash-text">FLASH SALE</span>
                                </div>
                                <div className="discount-badge mega">
                                    -{product.discountPercent}%
                                </div>
                                
                                <Link to={`/product/${product._id}`} className="flash-deal-image-wrapper">
                                    <img 
                                        src={product.imageUrl || PLACEHOLDER_IMAGES.product} 
                                        alt={product.name}
                                        className="flash-deal-image"
                                    />
                                </Link>

                                <div className="flash-deal-info">
                                    <Link to={`/product/${product._id}`} className="flash-deal-name">
                                        {product.name}
                                    </Link>
                                    
                                    <div className="flash-rating">
                                        <span className="stars">⭐ {product.rating}</span>
                                        <span className="reviews">({product.reviewCount} đánh giá)</span>
                                        <span className="sold">🔥 Đã bán {product.soldCount}</span>
                                    </div>

                                    <div className="flash-price-section">
                                        <div className="flash-prices">
                                            <span className="flash-current-price">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="flash-original-price">
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                        </div>
                                        <div className="flash-savings">
                                            💰 Save {formatPrice(product.originalPrice - product.price)}
                                        </div>
                                    </div>

                                    {/* Progress bar cho số lượng */}
                                    <div className="stock-progress">
                                        <div className="progress-info">
                                            <span>Đã bán {product.soldCount}</span>
                                            <span>Còn {product.stock || 10} sản phẩm</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ 
                                                    width: `${(product.soldCount / (product.soldCount + (product.stock || 10))) * 100}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <button 
                                        className="flash-buy-btn"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        <span className="btn-icon">⚡</span>
                                        <span className="btn-text">MUA NGAY</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div className="deals-content">
                <div className="section-header">
                    <h2 className="section-title">📦 ALL DEALS</h2>
                </div>
                
                {filteredProducts.length === 0 ? (
                    <div className="no-deals">
                        <p className="no-deals-icon">😔</p>
                        <h3>No promotional products found</h3>
                        <p>Vui lòng thử lại với bộ lọc khác</p>
                        <button 
                            className="back-home-btn"
                            onClick={() => {
                                setActiveCategory('all');
                                setSortBy('discount');
                            }}
                        >
                            🔄 View all
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div key={product._id} className="product-card deal-card">
                                <div className="discount-badge">
                                    -{product.discountPercent}%
                                </div>
                                
                                {product.discountPercent >= 30 && (
                                    <div className="hot-badge">🔥 HOT</div>
                                )}
                                
                                <div className="product-image-wrapper">
                                    <Link to={`/product/${product._id}`}>
                                        <img 
                                            src={product.imageUrl || PLACEHOLDER_IMAGES.product} 
                                            alt={product.name}
                                            className="product-image"
                                        />
                                    </Link>
                                    <button 
                                        className={`wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`}
                                        onClick={() => toggleWishlist(product)}
                                    >
                                        {isInWishlist(product._id) ? '❤️' : '🤍'}
                                    </button>
                                </div>

                                <div className="product-info">
                                    <Link to={`/product/${product._id}`} className="product-name">
                                        {product.name}
                                    </Link>
                                    
                                    <div className="rating-row">
                                        <span className="rating">⭐ {product.rating}</span>
                                        <span className="review-count">({product.reviewCount})</span>
                                        <span className="sold-count">Đã bán {product.soldCount}</span>
                                    </div>

                                    <div className="product-specs">
                                        <span className="spec-item">💻 {product.processor || 'Intel i5'}</span>
                                        <span className="spec-item">🎮 {product.ram || '8GB'}</span>
                                    </div>

                                    <div className="price-section">
                                        <div className="price-row">
                                            <span className="current-price">
                                                {formatPrice(product.price)}
                                            </span>
                                        </div>
                                        <div className="price-details">
                                            <span className="original-price">
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                            <span className="savings">
                                                -{formatPrice(product.originalPrice - product.price)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="product-actions">
                                        <button 
                                            className="add-to-cart-btn"
                                            onClick={() => handleAddToCart(product)}
                                            disabled={!product.inStock}
                                        >
                                            {product.inStock ? '🛒 Add to cart' : '⛔ Out of stock'}
                                        </button>
                                    </div>

                                    {product.inStock && product.stock < 10 && (
                                        <div className="stock-warning">
                                            ⚠️ Chỉ còn {product.stock} sản phẩm
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trust Signals */}
            <div className="deals-trust-section">
                <div className="trust-items">
                    <div className="trust-item">
                        <span className="trust-icon">🚚</span>
                        <h4>Miễn phí vận chuyển</h4>
                        <p>Orders over 10 million</p>
                    </div>
                    <div className="trust-item">
                        <span className="trust-icon">🔄</span>
                        <h4>Đổi trả 15 ngày</h4>
                        <p>Nếu có lỗi từ NSX</p>
                    </div>
                    <div className="trust-item">
                        <span className="trust-icon">💳</span>
                        <h4>Trả góp 0%</h4>
                        <p>Duyệt nhanh 30 phút</p>
                    </div>
                    <div className="trust-item">
                        <span className="trust-icon">🛡️</span>
                        <h4>Bảo hành chính hãng</h4>
                        <p>12-24 tháng</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DealsPage;
