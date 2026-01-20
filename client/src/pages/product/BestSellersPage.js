import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';
import { useToast } from '../../components/common/Toast';
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder';
import './BestSellersPage.css';

const BestSellersPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const toast = useToast();

    useEffect(() => {
        fetchBestSellers();
    }, []);

    const fetchBestSellers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/products', {
                params: {
                    limit: 100,
                    inStock: true
                }
            });
            
            const productsData = res.data.products || res.data;
            // Mock soldCount nếu không có và sắp xếp
            const bestSellers = productsData
                .filter(p => p.variants && p.variants.length > 0)
                .map(p => ({
                    ...p,
                    soldCount: p.soldCount || Math.floor(Math.random() * 1000) + 100,
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                    reviewCount: Math.floor(Math.random() * 300) + 50,
                    // Lấy giá từ variant rẻ nhất
                    price: Math.min(...p.variants.map(v => v.price)),
                    originalPrice: Math.min(...p.variants.map(v => v.originalPrice || v.price))
                }))
                .sort((a, b) => b.soldCount - a.soldCount)
                .slice(0, 50);
            
            setProducts(bestSellers);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching best sellers:', err);
            setError('Cannot load best sellers list');
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleAddToCart = (product) => {
        console.log('🛒 Adding to cart:', product);
        try {
            addToCart(product);
            toast.success(`✅ Added ${product.name} to cart!`);
            console.log('✅ Successfully added to cart');
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    const getRankBadge = (index) => {
        if (index === 0) return { emoji: '🥇', text: 'Top 1', color: '#FFD700' };
        if (index === 1) return { emoji: '🥈', text: 'Top 2', color: '#C0C0C0' };
        if (index === 2) return { emoji: '🥉', text: 'Top 3', color: '#CD7F32' };
        return { emoji: '⭐', text: `Top ${index + 1}`, color: '#4CAF50' };
    };

    if (loading) {
        return (
            <div className="bestsellers-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading best sellers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bestsellers-page">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bestsellers-page">
            {/* Hero Banner */}
            <div className="bestsellers-hero">
                <div className="bestsellers-hero-content">
                    <h1 className="bestsellers-title">⭐ Top Best Sellers</h1>
                    <p className="bestsellers-subtitle">
                        Trusted by thousands of customers
                    </p>
                    <div className="bestsellers-stats">
                        <div className="stat-item">
                            <span className="stat-number">{products.length}</span>
                            <span className="stat-label">Best Sellers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {products.reduce((sum, p) => sum + (p.soldCount || 0), 0)}
                            </span>
                            <span className="stat-label">Đã bán</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">4.8★</span>
                            <span className="stat-label">Average Rating</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Best Sellers */}
            <div className="why-bestsellers">
                <div className="why-content">
                    <h2>🏆 Why choose best sellers?</h2>
                    <div className="why-grid">
                        <div className="why-item">
                            <span className="why-icon">✓</span>
                            <h4>Verified quality</h4>
                            <p>Thousands have purchased and trusted</p>
                        </div>
                        <div className="why-item">
                            <span className="why-icon">⭐</span>
                            <h4>Highly rated</h4>
                            <p>Positive reviews from real customers</p>
                        </div>
                        <div className="why-item">
                            <span className="why-icon">💎</span>
                            <h4>Guaranteed quality</h4>
                            <p>Products carefully selected</p>
                        </div>
                        <div className="why-item">
                            <span className="why-icon">🚀</span>
                            <h4>Hot trends</h4>
                            <p>Keep up with latest technology</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="bestsellers-content">
                {products.length === 0 ? (
                    <div className="no-bestsellers">
                        <p className="no-bestsellers-icon">📦</p>
                        <h3>No best sellers yet</h3>
                        <p>Please come back later</p>
                        <Link to="/" className="back-home-btn">
                            🏠 Back to Home
                        </Link>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product, index) => {
                            const rankBadge = getRankBadge(index);
                            return (
                                <div key={product._id} className="product-card bestseller-card">
                                    <div 
                                        className="rank-badge" 
                                        style={{ background: rankBadge.color }}
                                    >
                                        <span className="rank-emoji">{rankBadge.emoji}</span>
                                        <span className="rank-text">{rankBadge.text}</span>
                                    </div>
                                    
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
                                        
                                        <div className="product-rating">
                                            <span className="stars">⭐⭐⭐⭐⭐</span>
                                            <span className="rating-count">(4.8/5)</span>
                                        </div>

                                        <div className="sold-count">
                                            🔥 Đã bán: <strong>{product.soldCount || 0}</strong> sản phẩm
                                        </div>

                                        <div className="product-specs">
                                            <span className="spec-item">� {product.variants?.[0]?.size || product.size || 'Nhiều size'}</span>
                                            <span className="spec-item">🎨 {product.variants?.[0]?.color || product.color || 'Nhiều màu'}</span>
                                        </div>

                                        <div className="price-section">
                                            {product.originalPrice && product.originalPrice > product.price ? (
                                                <>
                                                    <span className="original-price">
                                                        {formatPrice(product.originalPrice)}
                                                    </span>
                                                    <span className="current-price">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    <span className="discount-percent">
                                                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="current-price">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="product-actions">
                                            <button 
                                                type="button"
                                                className="add-to-cart-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('🔥 Button clicked!', product.name);
                                                    handleAddToCart(product);
                                                }}
                                                style={{ 
                                                    pointerEvents: 'auto', 
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    zIndex: 999
                                                }}
                                            >
                                                🛒 Add to Cart
                                            </button>
                                        </div>

                                        {product.stock && product.stock < 10 && (
                                            <div className="stock-warning">
                                                ⚠️ Chỉ còn {product.stock} sản phẩm
                                            </div>
                                        )}
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

export default BestSellersPage;
