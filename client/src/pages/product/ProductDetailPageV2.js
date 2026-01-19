import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';
import AuthContext from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import ReviewList from '../../components/review/ReviewList';
import ReviewForm from '../../components/review/ReviewForm';
import CompareButton from '../../components/comparison/CompareButton';

const ProductDetailPageV2 = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('🔍 Fetching product ID:', id);
                
                // Fetch main product
                const response = await axios.get(`/products/${id}`);
                console.log('✅ Product loaded:', response.data.name);
                setProduct(response.data);
                
                // Fetch related products
                if (response.data?.brand) {
                    try {
                        const relatedRes = await axios.get(`/products?brand=${response.data.brand}&limit=4`);
                        const filtered = relatedRes.data.products.filter(p => p._id !== id);
                        setRelatedProducts(filtered.slice(0, 4));
                    } catch (err) {
                        console.log('Related products error (non-critical):', err.message);
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error('❌ Error loading product:', err);
                setError(err.response?.data?.message || 'Không thể tải sản phẩm');
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
            window.scrollTo(0, 0);
        }
    }, [id]);

    const handleAddToCart = () => {
        if (product && product.stock > 0) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
            toast.success(`✅ Đã thêm ${quantity}x ${product.name} vào giỏ hàng!`);
        } else {
            toast.error('❌ Sản phẩm đã hết hàng!');
        }
    };

    const handleBuyNow = () => {
        if (product && product.stock > 0) {
            handleAddToCart();
            setTimeout(() => navigate('/cart'), 300);
        }
    };

    // LOADING STATE
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                paddingTop: '150px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #6c4de6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <h2 style={{marginTop: '20px', color: '#333'}}>Đang tải sản phẩm...</h2>
                <p style={{color: '#666'}}>ID: {id}</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // ERROR STATE
    if (error || !product) {
        return (
            <div style={{
                minHeight: '100vh',
                paddingTop: '150px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff5f5'
            }}>
                <div style={{fontSize: '4rem'}}>😞</div>
                <h1 style={{color: '#e74c3c', marginTop: '20px'}}>Lỗi tải sản phẩm</h1>
                <p style={{color: '#666', marginTop: '10px'}}>{error || 'Không tìm thấy sản phẩm'}</p>
                <button 
                    onClick={() => navigate('/')}
                    style={{
                        marginTop: '20px',
                        padding: '12px 30px',
                        background: '#6c4de6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    ← Về trang chủ
                </button>
            </div>
        );
    }

    // MAIN PRODUCT PAGE
    return (
        <div style={{
            minHeight: '100vh',
            background: '#f9f9f9',
            paddingTop: '120px',
            paddingBottom: '60px'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 30px'
            }}>
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '10px 20px',
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: '30px',
                        fontSize: '0.95rem',
                        fontWeight: '600'
                    }}
                >
                    ← Quay lại
                </button>

                {/* Product Detail Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '60px'
                    }}>
                        {/* Left: Image Gallery */}
                        <div>
                            {/* Main Image */}
                            <div style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                                borderRadius: '16px',
                                padding: '40px',
                                textAlign: 'center',
                                position: 'relative',
                                minHeight: '500px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '20px',
                                        left: '20px',
                                        background: '#e74c3c',
                                        color: 'white',
                                        padding: '8px 20px',
                                        borderRadius: '25px',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        zIndex: 2
                                    }}>
                                        SALE {Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </div>
                                )}
                                {(!product.stock || product.stock <= 0) && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(255,255,255,0.9)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '16px',
                                        zIndex: 3
                                    }}>
                                        <span style={{
                                            background: '#e74c3c',
                                            color: 'white',
                                            padding: '15px 40px',
                                            borderRadius: '8px',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold'
                                        }}>
                                            HẾT HÀNG
                                        </span>
                                    </div>
                                )}
                                <img 
                                    src={selectedImage || product.imageUrl} 
                                    alt={product.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '450px',
                                        objectFit: 'contain',
                                        cursor: 'zoom-in',
                                        transition: 'transform 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                />
                            </div>

                            {/* Image Thumbnails Gallery */}
                            {product.images && product.images.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                    gap: '12px'
                                }}>
                                    {/* Main image thumbnail */}
                                    <div 
                                        onClick={() => setSelectedImage(null)}
                                        style={{
                                            background: 'white',
                                            border: selectedImage === null ? '3px solid #6c4de6' : '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: selectedImage === null ? '0 4px 12px rgba(108, 77, 230, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                                            transform: selectedImage === null ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedImage !== null) {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.borderColor = '#6c4de6';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedImage !== null) {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.borderColor = '#e0e0e0';
                                            }
                                        }}
                                    >
                                        <img 
                                            src={product.imageUrl} 
                                            alt="Main"
                                            style={{
                                                width: '100%',
                                                height: '80px',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Additional images */}
                                    {product.images.map((img, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            style={{
                                                background: 'white',
                                                border: selectedImage === img ? '3px solid #6c4de6' : '2px solid #e0e0e0',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                boxShadow: selectedImage === img ? '0 4px 12px rgba(108, 77, 230, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                                                transform: selectedImage === img ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedImage !== img) {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.borderColor = '#6c4de6';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedImage !== img) {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                                }
                                            }}
                                        >
                                            <img 
                                                src={img} 
                                                alt={`View ${idx + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '80px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Info */}
                        <div>
                            {/* Brand & Wishlist */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #6c4de6 0%, #5a3ec9 100%)',
                                    color: 'white',
                                    padding: '8px 20px',
                                    borderRadius: '25px',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold'
                                }}>
                                    {product.brand}
                                </span>
                                <button
                                    onClick={() => toggleWishlist(product)}
                                    style={{
                                        background: isInWishlist(product._id) ? '#ff4757' : 'white',
                                        color: isInWishlist(product._id) ? 'white' : '#333',
                                        border: '2px solid ' + (isInWishlist(product._id) ? '#ff4757' : '#ddd'),
                                        borderRadius: '50%',
                                        width: '50px',
                                        height: '50px',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    title={isInWishlist(product._id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                                >
                                    {isInWishlist(product._id) ? '❤️' : '🤍'}
                                </button>
                            </div>

                            {/* Name */}
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#2c3e50',
                                marginBottom: '20px',
                                lineHeight: '1.3'
                            }}>
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div style={{marginBottom: '25px'}}>
                                {product.originalPrice && product.originalPrice > product.price ? (
                                    <div>
                                        <div style={{
                                            fontSize: '1.2rem',
                                            color: '#999',
                                            textDecoration: 'line-through',
                                            marginBottom: '5px'
                                        }}>
                                            {product.originalPrice.toLocaleString()} VND
                                        </div>
                                        <div style={{
                                            fontSize: '2.2rem',
                                            fontWeight: 'bold',
                                            color: '#e74c3c'
                                        }}>
                                            {product.price.toLocaleString()} VND
                                        </div>
                                        <span style={{
                                            display: 'inline-block',
                                            marginTop: '10px',
                                            background: '#fff3cd',
                                            color: '#856404',
                                            padding: '5px 15px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold'
                                        }}>
                                            Tiết kiệm {(product.originalPrice - product.price).toLocaleString()} VND
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{
                                        fontSize: '2.2rem',
                                        fontWeight: 'bold',
                                        color: '#2c3e50'
                                    }}>
                                        {product.price.toLocaleString()} VND
                                    </div>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div style={{
                                padding: '15px',
                                background: (product.stock && product.stock > 0) ? '#d4edda' : '#f8d7da',
                                borderRadius: '8px',
                                marginBottom: '25px'
                            }}>
                                <span style={{
                                    color: (product.stock && product.stock > 0) ? '#155724' : '#721c24',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}>
                                    {(product.stock && product.stock > 0) ? `✓ Còn hàng (${product.stock} sản phẩm)` : '✗ Hết hàng'}
                                </span>
                            </div>

                            {/* Description */}
                            <p style={{
                                color: '#666',
                                lineHeight: '1.8',
                                marginBottom: '25px',
                                fontSize: '1rem'
                            }}>
                                {product.description}
                            </p>

                            {/* Specifications */}
                            {product.specifications && (
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '25px'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        color: '#2c3e50'
                                    }}>
                                        Thông số kỹ thuật:
                                    </h3>
                                    <div style={{display: 'grid', gap: '12px'}}>
                                        {product.specifications.size && (
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <span style={{fontWeight: 'bold', minWidth: '100px'}}>👟 Size:</span>
                                                <span>{product.specifications.size}</span>
                                            </div>
                                        )}
                                        {product.specifications.color && (
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <span style={{fontWeight: 'bold', minWidth: '100px'}}>🎨 Màu:</span>
                                                <span>{product.specifications.color}</span>
                                            </div>
                                        )}
                                        {product.specifications.material && (
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <span style={{fontWeight: 'bold', minWidth: '100px'}}>✨ Chất liệu:</span>
                                                <span>{product.specifications.material}</span>
                                            </div>
                                        )}
                                        {product.specifications.display && (
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <span style={{fontWeight: 'bold', minWidth: '100px'}}>📺 Màn hình:</span>
                                                <span>{product.specifications.display}</span>
                                            </div>
                                        )}
                                        {product.specifications.graphics && (
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <span style={{fontWeight: 'bold', minWidth: '100px'}}>🎮 GPU:</span>
                                                <span>{product.specifications.graphics}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quantity & Actions */}
                            {(product.stock && product.stock > 0) && (
                                <>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '15px',
                                        marginBottom: '20px'
                                    }}>
                                        <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Số lượng:</span>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                border: '2px solid #ddd',
                                                background: 'white',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            −
                                        </button>
                                        <span style={{
                                            fontSize: '1.3rem',
                                            fontWeight: 'bold',
                                            minWidth: '50px',
                                            textAlign: 'center'
                                        }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                border: '2px solid #ddd',
                                                background: 'white',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div style={{display: 'flex', gap: '15px'}}>
                                        <button
                                            onClick={handleAddToCart}
                                            style={{
                                                flex: 1,
                                                padding: '18px',
                                                background: 'white',
                                                color: '#6c4de6',
                                                border: '2px solid #6c4de6',
                                                borderRadius: '12px',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.background = '#6c4de6';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.background = 'white';
                                                e.target.style.color = '#6c4de6';
                                            }}
                                        >
                                            🛒 Thêm vào giỏ
                                        </button>
                                        <button
                                            onClick={handleBuyNow}
                                            style={{
                                                flex: 1,
                                                padding: '18px',
                                                background: 'linear-gradient(135deg, #6c4de6 0%, #5a3ec9 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 4px 15px rgba(108, 77, 230, 0.3)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 20px rgba(108, 77, 230, 0.4)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 15px rgba(108, 77, 230, 0.3)';
                                            }}
                                        >
                                            ⚡ Mua ngay
                                        </button>
                                    </div>
                                </>
                            )}

                            {(!product.stock || product.stock <= 0) && (
                                <button
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '18px',
                                        background: '#ccc',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        cursor: 'not-allowed'
                                    }}
                                >
                                    Hết hàng
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Compare Button */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    marginTop: '30px'
                }}>
                    <h3 style={{marginBottom: '15px', color: '#2c3e50'}}>So sánh sản phẩm</h3>
                    <CompareButton product={product} />
                </div>

                {/* Reviews Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    marginTop: '40px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: '#2c3e50'
                        }}>
                            ⭐ Đánh giá sản phẩm
                        </h2>
                        {user && (
                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                {showReviewForm ? '✕ Đóng' : '✍️ Viết đánh giá'}
                            </button>
                        )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm && user && (
                        <div style={{marginBottom: '30px'}}>
                            <ReviewForm 
                                productId={id} 
                                onSuccess={() => {
                                    setShowReviewForm(false);
                                    toast.success('Đã gửi đánh giá thành công!');
                                    // Refresh reviews by re-mounting ReviewList
                                    window.location.reload();
                                }}
                            />
                        </div>
                    )}

                    {/* Reviews List */}
                    <ReviewList productId={id} />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div style={{marginTop: '60px'}}>
                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            marginBottom: '30px',
                            color: '#2c3e50'
                        }}>
                            Sản phẩm liên quan
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '20px'
                        }}>
                            {relatedProducts.map(related => (
                                <div
                                    key={related._id}
                                    onClick={() => navigate(`/product/${related._id}`)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    }}
                                >
                                    <CompareButton product={related} style={{marginBottom: '10px'}} />
                                    <img 
                                        src={related.imageUrl} 
                                        alt={related.name}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'contain',
                                            marginBottom: '15px'
                                        }}
                                    />
                                    <h4 style={{
                                        fontSize: '1rem',
                                        marginBottom: '10px',
                                        color: '#2c3e50',
                                        height: '48px',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {related.name}
                                    </h4>
                                    <div style={{
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: '#e74c3c'
                                    }}>
                                        {related.price.toLocaleString()} VND
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailPageV2;
