import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import axios from '../../api/axiosConfig';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';
import { useToast } from '../common/Toast';
import QuickViewModal from '../modal/QuickViewModal';
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder';
import './BestSellers.css';

const BestSellers = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const toast = useToast();

    useEffect(() => {
        fetchBestSellers();
    }, []);

    const fetchBestSellers = async () => {
        try {
            const res = await axios.get('/products', {
                params: {
                    sortBy: 'popular',
                    limit: 5
                    // Removed inStock:true filter to show real-time stock status
                }
            });
            
            // Add default values for missing fields
            const productsWithDefaults = (res.data.products || res.data).map(p => {
                // Helper to get price from variants
                const getPrice = () => {
                    if (p.variants && p.variants.length > 0) {
                        const prices = p.variants.map(v => v.price);
                        return Math.min(...prices);
                    }
                    return p.price || 0;
                };

                // Helper to get total stock
                const getTotalStock = () => {
                    if (p.variants && p.variants.length > 0) {
                        return p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                    }
                    return p.stock || 0;
                };

                const price = getPrice();
                const totalStock = getTotalStock();

                return {
                    ...p,
                    price: price,
                    totalStock: totalStock,
                    size: p.variants?.[0]?.size || 'Multiple sizes',
                    color: p.variants?.[0]?.color || 'Multiple colors',
                    material: p.variants?.[0]?.material || 'Leather',
                    description: p.description || 'Authentic shoes, nationwide warranty. Contact hotline 084.686.5650 for more details.',
                    features: p.features && p.features.length > 0 ? p.features : [
                        'Brand new 100%, authentic',
                        'Official nationwide warranty',
                        'Nationwide delivery, flexible payment',
                        '0% interest installment support'
                    ],
                    inStock: totalStock > 0
                };
            });
            
            setBestSellers(productsWithDefaults);
        } catch (err) {
            console.error('Failed to fetch best sellers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWishlistClick = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`Added ${product.name} to cart!`);
    };

    if (loading) {
        return <div className="section-loading">Loading...</div>;
    }

    return (
        <section className="best-sellers-section">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">
                        Best Sellers
                    </h2>
                </div>

                <div className="best-sellers-scroll">
                    {bestSellers.map((product, index) => (
                        <div key={product._id} className="bestseller-card-wrapper">
                            <div className="bestseller-card">
                                <div className="bestseller-rank">#{index + 1}</div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="bestseller-discount">
                                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="bestseller-actions">
                                    <button
                                        className={`bestseller-wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`}
                                        onClick={(e) => handleWishlistClick(e, product)}
                                        title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                    >
                                        {isInWishlist(product._id) ? '❤️' : '🤍'}
                                    </button>
                                    <button
                                        className="bestseller-view-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedProduct(product);
                                        }}
                                        title="Xem nhanh"
                                    >
                                        <FiEye />
                                    </button>
                                </div>

                                <Link 
                                    to={`/product/${product._id}`}
                                    className="bestseller-image-link"
                                >
                                    <div className="bestseller-image">
                                        <img 
                                            src={product.imageUrl || PLACEHOLDER_IMAGES.productSmall} 
                                            alt={product.name}
                                        />
                                    </div>
                                </Link>
                                
                                <div className="bestseller-info">
                                    <span className="bestseller-brand">{product.brand}</span>
                                    <Link to={`/product/${product._id}`}>
                                        <h3 className="bestseller-name">{product.name}</h3>
                                    </Link>
                                    <div className="bestseller-price">
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="original-price">
                                                {product.originalPrice.toLocaleString()}₫
                                            </span>
                                        )}
                                        <span className="current-price">
                                            {(product.price || 0).toLocaleString()}₫
                                        </span>
                                    </div>
                                    <div className="bestseller-stats">
                                        <span>⭐ 4.8</span>
                                        <span>📦 Đã bán {product.soldCount || Math.floor(Math.random() * 500) + 100}</span>
                                    </div>
                                    
                                    {/* Add to Cart Button */}
                                    <button
                                        className="bestseller-add-to-cart"
                                        onClick={(e) => handleAddToCart(e, product)}
                                        title="Add to cart"
                                    >
                                        <FiShoppingCart /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="section-footer">
                    <button 
                        className="view-all-btn"
                        onClick={() => {
                            const productsSection = document.getElementById('products-section');
                            if (productsSection) {
                                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }}
                    >
                        View all products →
                    </button>
                </div>
            </div>

            {/* Quick View Modal */}
            {selectedProduct && (
                <QuickViewModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={(product) => {
                        addToCart(product);
                        toast.success(`Added ${product.name} to cart!`);
                    }}
                />
            )}
        </section>
    );
};

export default BestSellers;
