import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';
import { useToast } from '../../components/common/Toast';
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description'); // 'description' or 'reviews'
    const [relatedProducts, setRelatedProducts] = useState([]);

    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    
    // Debug logs
    console.log('🎯 ProductDetailPage RENDER - ID:', id, 'Loading:', loading, 'Product:', product ? 'Loaded' : 'null', 'Error:', error);

    useEffect(() => {
        console.log('📦 useEffect triggered - Product ID:', id);
        if (id) {
            fetchProductDetail();
        } else {
            console.error('❌ No product ID found!');
            setError('No product ID provided');
            setLoading(false);
        }
        window.scrollTo(0, 0); // Scroll to top when page loads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 Fetching product with id:', id);
            console.log('🌐 API URL:', `/products/${id}`);
            
            const res = await axios.get(`/products/${id}`);
            console.log('✅ Product data received:', res.data);
            
            setProduct(res.data);
            
            // Fetch related products (same brand or category)
            if (res.data && res.data.brand) {
                fetchRelatedProducts(res.data.brand, res.data._id);
            }
        } catch (err) {
            console.error("❌ Failed to fetch product details", err);
            console.error("❌ Error response:", err.response?.data);
            console.error("❌ Error status:", err.response?.status);
            console.error("❌ Error message:", err.message);
            
            if (err.response?.status === 404) {
                setError("Product does not exist or has been deleted.");
            } else if (err.response?.status === 500) {
                setError("Lỗi server. Vui lòng thử lại sau.");
            } else {
                setError("Cannot load product information. Please check your connection.");
            }
        } finally {
            setLoading(false);
            console.log('🏁 Loading finished');
        }
    };

    const fetchRelatedProducts = async (brand, currentProductId) => {
        try {
            const res = await axios.get(`/products?brand=${brand}&limit=4`);
            // Filter out current product
            const filtered = res.data.products.filter(p => p._id !== currentProductId);
            setRelatedProducts(filtered.slice(0, 4));
        } catch (err) {
            console.error("Failed to fetch related products", err);
        }
    };

    const handleAddToCart = () => {
        if (product && product.stock > 0) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
            toast.success(`✅ Added ${quantity}x ${product.name} to cart!`);
        } else {
            toast.error('❌ Product is out of stock!');
        }
    };

    const handleBuyNow = () => {
        if (product && product.stock > 0) {
            handleAddToCart();
            setTimeout(() => {
                navigate('/cart');
            }, 500);
        } else {
            toast.error('❌ Sản phẩm đã hết hàng!');
        }
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ paddingTop: '150px', paddingBottom: '100px', textAlign: 'center', minHeight: '100vh' }}>
                <div className="spinner"></div>
                <h2>Loading product information...</h2>
                <p>Product ID: {id}</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="error-container" style={{ paddingTop: '150px', paddingBottom: '100px', textAlign: 'center', minHeight: '100vh' }}>
                <h1 style={{ color: '#e74c3c' }}>❌ Lỗi</h1>
                <p>{error || 'Không tìm thấy sản phẩm'}</p>
                <p>Product ID: {id}</p>
                <button className="back-btn" onClick={() => navigate('/')} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
                    ← Quay về trang chủ
                </button>
            </div>
        );
    }

    // Mock multiple images (in real app, you'd have multiple images from backend)
    const images = [product.imageUrl, product.imageUrl, product.imageUrl];

    return (
        <div className="product-detail-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
            </button>

            <div className="product-detail-content">
                {/* Image Gallery */}
                <div className="image-section">
                    <div className="main-image">
                        {(!product.stock || product.stock <= 0) && (
                            <div className="sold-out-overlay">
                                <span>HẾT HÀNG</span>
                            </div>
                        )}
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="sale-badge">SALE</span>
                        )}
                        <img 
                            src={images[selectedImage] || PLACEHOLDER_IMAGES.productLarge} 
                            alt={product.name}
                        />
                    </div>
                    <div className="thumbnail-images">
                        {images.map((img, index) => (
                            <img 
                                key={index}
                                src={img || PLACEHOLDER_IMAGES.thumbnail}
                                alt={`${product.name} ${index + 1}`}
                                className={selectedImage === index ? 'active' : ''}
                                onClick={() => setSelectedImage(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="info-section">
                    <div className="product-header">
                        <span className="brand-badge">{product.brand}</span>
                        <button
                            className={`wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`}
                            onClick={() => toggleWishlist(product)}
                            title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {isInWishlist(product._id) ? '❤️' : '🤍'}
                        </button>
                    </div>

                    <h1 className="product-title">{product.name}</h1>
                    
                    <div className="product-pricing">
                        {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                                <span className="original-price">
                                    {product.originalPrice.toLocaleString()} VND
                                </span>
                                <span className="current-price sale-price">
                                    {product.price.toLocaleString()} VND
                                </span>
                                <span className="discount-badge">
                                    Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                                </span>
                            </>
                        ) : (
                            <span className="current-price">
                                {product.price.toLocaleString()} VND
                            </span>
                        )}
                    </div>

                    <div className="stock-info">
                        {(product.stock && product.stock > 0) ? (
                            <span className="in-stock">
                                ✓ Còn hàng ({product.stock} sản phẩm)
                            </span>
                        ) : (
                            <span className="out-of-stock">
                                ✗ Hết hàng
                            </span>
                        )}
                    </div>

                    <p className="product-description">{product.description}</p>

                    {/* Quick Specifications Summary */}
                    {product.specifications && (
                        <div className="quick-specs">
                            {product.specifications.size && (
                                <div className="quick-spec-item">
                                    <span className="spec-icon">👟</span>
                                    <div>
                                        <div className="spec-label">Size</div>
                                        <div className="spec-value">{product.specifications.size}</div>
                                    </div>
                                </div>
                            )}
                            {product.specifications.color && (
                                <div className="quick-spec-item">
                                    <span className="spec-icon">🎨</span>
                                    <div>
                                        <div className="spec-label">Color</div>
                                        <div className="spec-value">{product.specifications.color}</div>
                                    </div>
                                </div>
                            )}
                            {product.specifications.material && (
                                <div className="quick-spec-item">
                                    <span className="spec-icon">✨</span>
                                    <div>
                                        <div className="spec-label">Material</div>
                                        <div className="spec-value">{product.specifications.material}</div>
                                    </div>
                                </div>
                            )}
                            {product.specifications.display && (
                                <div className="quick-spec-item">
                                    <span className="spec-icon">📺</span>
                                    <div>
                                        <div className="spec-label">Display</div>
                                        <div className="spec-value">{product.specifications.display}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quantity Selector & Add to Cart */}
                    {product.stock > 0 && (
                        <div className="purchase-section">
                            <div className="quantity-selector">
                                <label>Quantity:</label>
                                <div className="quantity-controls">
                                    <button 
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <span className="quantity-display">{quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                                    🛒 Thêm vào giỏ
                                </button>
                                <button className="buy-now-btn" onClick={handleBuyNow}>
                                    ⚡ Mua ngay
                                </button>
                            </div>
                        </div>
                    )}

                    {(!product.stock || product.stock <= 0) && (
                        <button className="notify-btn" disabled>
                            🔔 Thông báo khi có hàng
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs Section - Description & Reviews */}
            <div className="product-tabs">
                <div className="tabs-header">
                    <button 
                        className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                        onClick={() => setActiveTab('description')}
                    >
                        DESCRIPTION
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        REVIEWS (0)
                    </button>
                </div>

                <div className="tabs-content">
                    {activeTab === 'description' && (
                        <div className="tab-panel">
                            <h2>Lenovo IdeaPad 1 82VG00DPED Specs:</h2>
                            
                            {product.specifications && (
                                <div className="detailed-specs-table">
                                    <table>
                                        <tbody>
                                            {product.specifications.display && (
                                                <tr>
                                                    <td className="spec-name">Display</td>
                                                    <td className="spec-detail">{product.specifications.display}</td>
                                                </tr>
                                            )}
                                            {product.specifications.size && (
                                                <tr>
                                                    <td className="spec-name">Size</td>
                                                    <td className="spec-detail">{product.specifications.size}</td>
                                                </tr>
                                            )}
                                            {product.specifications.shoeType && (
                                                <tr>
                                                    <td className="spec-name">Type</td>
                                                    <td className="spec-detail">{product.specifications.shoeType}</td>
                                                </tr>
                                            )}
                                            {product.specifications.color && (
                                                <tr>
                                                    <td className="spec-name">Color</td>
                                                    <td className="spec-detail">{product.specifications.color}</td>
                                                </tr>
                                            )}
                                            {product.specifications.material && (
                                                <tr>
                                                    <td className="spec-name">Material</td>
                                                    <td className="spec-detail">{product.specifications.material}</td>
                                                </tr>
                                            )}
                                            {product.specifications.weight && (
                                                <tr>
                                                    <td className="spec-name">Weight</td>
                                                    <td className="spec-detail">{product.specifications.weight}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="description-content">
                                <h3>Why Choose {product.brand} {product.name}?</h3>
                                <p>{product.description}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="tab-panel">
                            <div className="no-reviews">
                                <p>📝 No reviews yet. Be the first to review this product!</p>
                                <button className="write-review-btn">Write a Review</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h2>Related Products</h2>
                    <div className="related-products-grid">
                        {relatedProducts.map(relatedProduct => (
                            <div 
                                key={relatedProduct._id}
                                className="related-product-card"
                                onClick={() => {
                                    navigate(`/product/${relatedProduct._id}`);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                {(!relatedProduct.stock || relatedProduct.stock <= 0) && (
                                    <span className="sold-out-badge-small">SOLD OUT</span>
                                )}
                                {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                                    <span className="sale-badge-small">SALE</span>
                                )}
                                <img 
                                    src={relatedProduct.imageUrl || PLACEHOLDER_IMAGES.product} 
                                    alt={relatedProduct.name}
                                />
                                <div className="related-product-info">
                                    <h4>{relatedProduct.name}</h4>
                                    <div className="related-product-price">
                                        {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price ? (
                                            <>
                                                <span className="old-price">{relatedProduct.originalPrice.toLocaleString()} VND</span>
                                                <span className="new-price">{relatedProduct.price.toLocaleString()} VND</span>
                                            </>
                                        ) : (
                                            <span className="new-price">{relatedProduct.price.toLocaleString()} VND</span>
                                        )}
                                    </div>
                                    <button className="view-product-btn">Read more</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
