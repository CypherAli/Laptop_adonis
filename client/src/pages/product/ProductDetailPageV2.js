import React, { useState, useEffect, useContext, useMemo } from 'react';
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
    
    // Variant selection states
    const [selectedSize, setSelectedSize] = useState('39');
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedGender, setSelectedGender] = useState('Unisex');
    const [selectedVariant, setSelectedVariant] = useState(null);
    
    // Additional options that affect price
    const [selectedEdition, setSelectedEdition] = useState('Standard');
    const [selectedSoleType, setSelectedSoleType] = useState('Regular');
    const [selectedBoxType, setSelectedBoxType] = useState('Standard');
    const [selectedWarranty, setSelectedWarranty] = useState('12');
    const [hasPersonalization, setHasPersonalization] = useState(false);

    // Pricing for additional options
    const editionPricing = {
        'Standard': 0,
        'Premium': 500000,
        'Limited Edition': 1200000
    };
    
    const soleTypePricing = {
        'Regular': 0,
        'Air Max': 800000,
        'Boost Technology': 1000000
    };
    
    const boxPricing = {
        'Standard': 0,
        'Premium Box': 200000,
        'Collector Edition': 500000
    };
    
    const warrantyPricing = {
        '12': 0,
        '24': 300000,
        '36': 600000
    };
    
    const personalizationPrice = 400000;

    // Get unique genders from variants
    const genderOptions = useMemo(() => {
        if (!product?.variants) return ['Nam', 'Nữ', 'Unisex'];
        const genders = [...new Set(product.variants.map(v => v.specifications?.gender || v.gender))].filter(Boolean);
        return genders.length > 0 ? genders : ['Nam', 'Nữ', 'Unisex'];
    }, [product]);

    // Get ALL available colors
    const availableColors = useMemo(() => {
        if (!product?.variants) return [];
        const colors = [...new Set(product.variants.map(v => v.specifications?.color || v.color))];
        return colors.filter(Boolean);
    }, [product]);

    // Update selected variant when size/color/gender changes
    useEffect(() => {
        if (!product?.variants || !selectedSize || !selectedColor || !selectedGender) return;
        
        const matchedVariant = product.variants.find(v => {
            const vSize = v.specifications?.size || v.size;
            const vColor = v.specifications?.color || v.color;
            const vGender = v.specifications?.gender || v.gender;
            return vSize === selectedSize && vColor === selectedColor && vGender === selectedGender;
        });
        
        if (matchedVariant) {
            setSelectedVariant(matchedVariant);
            console.log('✅ Matched variant:', matchedVariant.variantName, '- Price:', matchedVariant.price.toLocaleString() + 'đ');
        } else {
            setSelectedVariant(null);
            console.warn('⚠️ No variant found for:', { gender: selectedGender, size: selectedSize, color: selectedColor });
        }
    }, [selectedSize, selectedColor, selectedGender, product]);

    // Calculate current price and stock
    const currentPrice = selectedVariant?.price || product?.price || 0;
    const currentStock = selectedVariant?.stock || 0;
    const isOutOfStock = !selectedVariant || currentStock === 0;
    const currentOriginalPrice = selectedVariant?.originalPrice || product?.originalPrice;
    
    // Calculate final price with all options
    const finalPrice = currentPrice + 
                      editionPricing[selectedEdition] + 
                      soleTypePricing[selectedSoleType] + 
                      boxPricing[selectedBoxType] + 
                      warrantyPricing[selectedWarranty] + 
                      (hasPersonalization ? personalizationPrice : 0);

    // Color hex mapping
    const getColorHex = (colorName) => {
        const name = colorName?.toLowerCase() || '';
        if (name.includes('black') || name.includes('đen')) return '#1f2937';
        if (name.includes('white') || name.includes('trắng')) return '#ffffff';
        if (name.includes('red') || name.includes('đỏ')) return '#ef4444';
        if (name.includes('navy')) return '#1e3a8a';
        if (name.includes('blue') || name.includes('xanh dương')) return '#3b82f6';
        if (name.includes('green') || name.includes('xanh lá')) return '#10b981';
        if (name.includes('yellow') || name.includes('vàng')) return '#fbbf24';
        if (name.includes('pink') || name.includes('hồng')) return '#ec4899';
        if (name.includes('purple') || name.includes('tím')) return '#a855f7';
        if (name.includes('gray') || name.includes('grey') || name.includes('xám')) return '#6b7280';
        if (name.includes('orange') || name.includes('cam')) return '#f97316';
        if (name.includes('silver') || name.includes('bạc')) return '#c0c0c0';
        if (name.includes('turquoise')) return '#14b8a6';
        if (name.includes('brown') || name.includes('nâu')) return '#92400e';
        return '#9ca3af';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('🔍 Fetching product ID:', id);
                
                // Fetch main product
                const response = await axios.get(`/products/${id}`);
                console.log('✅ Product loaded:', response.data.name);
                setProduct(response.data);
                
                // Auto-select first variant or defaults
                if (response.data.variants && response.data.variants.length > 0) {
                    const firstVariant = response.data.variants[0];
                    setSelectedSize(firstVariant.specifications?.size || firstVariant.size || '39');
                    setSelectedColor(firstVariant.specifications?.color || firstVariant.color);
                    setSelectedGender(firstVariant.specifications?.gender || firstVariant.gender || 'Unisex');
                    setSelectedVariant(firstVariant);
                } else {
                    setSelectedSize('39');
                    setSelectedGender('Unisex');
                }
                
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
        // Validate selection
        if (!selectedGender || !selectedSize || !selectedColor) {
            toast.error('⚠️ Vui lòng chọn đầy đủ giới tính, size và màu sắc!');
            return;
        }
        
        if (isOutOfStock) {
            toast.error('❌ Sản phẩm đã hết hàng với tùy chọn này!');
            return;
        }
        
        if (currentStock > 0) {
            // Create product with selected options
            const productToAdd = {
                ...product,
                selectedVariant: selectedVariant,
                selectedOptions: {
                    gender: selectedGender,
                    size: selectedSize,
                    color: selectedColor,
                    edition: selectedEdition,
                    soleType: selectedSoleType,
                    boxType: selectedBoxType,
                    warranty: selectedWarranty,
                    personalization: hasPersonalization
                },
                finalPrice: finalPrice,
                displayPrice: finalPrice
            };
            
            for (let i = 0; i < quantity; i++) {
                addToCart(productToAdd);
            }
            toast.success(`✅ Đã thêm ${quantity}x ${product.name} (${selectedGender}, Size ${selectedSize}, ${selectedColor}) vào giỏ hàng!`);
        } else {
            toast.error('❌ Sản phẩm đã hết hàng!');
        }
    };

    const handleBuyNow = () => {
        if (!selectedGender || !selectedSize || !selectedColor) {
            toast.error('⚠️ Vui lòng chọn đầy đủ giới tính, size và màu sắc!');
            return;
        }
        
        if (!isOutOfStock && currentStock > 0) {
            handleAddToCart();
            setTimeout(() => navigate('/cart'), 300);
        } else {
            toast.error('❌ Sản phẩm đã hết hàng!');
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
                                {currentOriginalPrice && currentOriginalPrice > currentPrice ? (
                                    <div>
                                        <div style={{
                                            fontSize: '1.2rem',
                                            color: '#999',
                                            textDecoration: 'line-through',
                                            marginBottom: '5px'
                                        }}>
                                            {currentOriginalPrice.toLocaleString()}đ
                                        </div>
                                        <div style={{
                                            fontSize: '2.2rem',
                                            fontWeight: 'bold',
                                            color: '#e74c3c'
                                        }}>
                                            {finalPrice.toLocaleString()}đ
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
                                            Tiết kiệm {(currentOriginalPrice - currentPrice).toLocaleString()}đ
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{
                                        fontSize: '2.2rem',
                                        fontWeight: 'bold',
                                        color: '#2c3e50'
                                    }}>
                                        {finalPrice.toLocaleString()}đ
                                    </div>
                                )}
                                {finalPrice !== currentPrice && (
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#6366f1',
                                        background: '#eef2ff',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        marginTop: '8px',
                                        display: 'inline-block'
                                    }}>
                                        +{(finalPrice - currentPrice).toLocaleString()}đ từ options
                                    </div>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div style={{
                                padding: '15px',
                                background: (!isOutOfStock && currentStock > 0) ? '#d4edda' : '#f8d7da',
                                borderRadius: '8px',
                                marginBottom: '25px'
                            }}>
                                <span style={{
                                    color: (!isOutOfStock && currentStock > 0) ? '#155724' : '#721c24',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}>
                                    {(!isOutOfStock && currentStock > 0) ? `✓ Còn hàng (${currentStock} sản phẩm)` : '✗ Hết hàng'}
                                </span>
                            </div>

                            {/* ===== OPTIONS SECTION ===== */}
                            <div style={{
                                background: '#f8f9fa',
                                padding: '25px',
                                borderRadius: '12px',
                                marginBottom: '25px',
                                maxHeight: '600px',
                                overflowY: 'auto'
                            }}>
                                {/* Gender Selector */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#374151', fontWeight: '600' }}>
                                        🚻 Giới tính <span style={{ color: '#ef4444' }}>*</span>
                                    </h4>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {genderOptions.map(gender => (
                                            <button
                                                key={gender}
                                                onClick={() => setSelectedGender(gender)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 16px',
                                                    border: selectedGender === gender ? '2px solid #6366f1' : '2px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    background: selectedGender === gender ? '#eef2ff' : 'white',
                                                    color: selectedGender === gender ? '#6366f1' : '#6b7280',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {gender}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Size Selector - Slider 34-44 */}
                                <div style={{ marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 style={{ fontSize: '14px', color: '#374151', fontWeight: '600', margin: 0 }}>
                                            👟 Chọn size <span style={{ color: '#ef4444' }}>*</span>
                                        </h4>
                                        <div style={{
                                            fontSize: '20px',
                                            fontWeight: '700',
                                            color: '#6366f1',
                                            background: '#eef2ff',
                                            padding: '8px 20px',
                                            borderRadius: '12px',
                                            border: '2px solid #6366f1'
                                        }}>
                                            Size {selectedSize || '39'}
                                        </div>
                                    </div>
                                    
                                    {/* Range Slider 34-44 */}
                                    <div style={{ position: 'relative', paddingTop: '10px' }}>
                                        {/* Size markers */}
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            marginBottom: '8px',
                                            paddingLeft: '5px',
                                            paddingRight: '5px'
                                        }}>
                                            {[34, 36, 38, 40, 42, 44].map(size => (
                                                <span key={size} style={{ 
                                                    fontSize: '11px', 
                                                    color: parseFloat(selectedSize) === size ? '#6366f1' : '#9ca3af',
                                                    fontWeight: parseFloat(selectedSize) === size ? '700' : '500'
                                                }}>
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <input
                                            type="range"
                                            min="34"
                                            max="44"
                                            step="0.5"
                                            value={parseFloat(selectedSize) || 39}
                                            onChange={(e) => {
                                                const size = parseFloat(e.target.value);
                                                setSelectedSize(size.toString());
                                            }}
                                            style={{
                                                width: '100%',
                                                height: '8px',
                                                borderRadius: '8px',
                                                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((parseFloat(selectedSize || 39) - 34) / 10) * 100}%, #e5e7eb ${((parseFloat(selectedSize || 39) - 34) / 10) * 100}%, #e5e7eb 100%)`,
                                                outline: 'none',
                                                WebkitAppearance: 'none',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Color Selector - Circular Color Buttons */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#374151', fontWeight: '600' }}>
                                        🎨 Chọn màu sắc <span style={{ color: '#ef4444' }}>*</span>
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {availableColors.length > 0 ? availableColors.map(color => {
                                            const hexColor = getColorHex(color);
                                            const isWhite = hexColor === '#ffffff';
                                            return (
                                                <div
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '50%',
                                                        background: hexColor,
                                                        border: selectedColor === color 
                                                            ? '3px solid #6366f1' 
                                                            : isWhite 
                                                                ? '2px solid #e5e7eb' 
                                                                : '2px solid transparent',
                                                        boxShadow: selectedColor === color 
                                                            ? '0 0 0 4px #eef2ff' 
                                                            : '0 2px 4px rgba(0,0,0,0.1)',
                                                        transition: 'all 0.2s',
                                                        transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)'
                                                    }} />
                                                    <span style={{
                                                        fontSize: '10px',
                                                        marginTop: '4px',
                                                        color: selectedColor === color ? '#6366f1' : '#6b7280',
                                                        fontWeight: selectedColor === color ? '600' : '400',
                                                        maxWidth: '60px',
                                                        textAlign: 'center',
                                                        wordWrap: 'break-word'
                                                    }}>
                                                        {color}
                                                    </span>
                                                </div>
                                            );
                                        }) : (
                                            <div style={{
                                                padding: '12px',
                                                background: '#fff3cd',
                                                borderRadius: '8px',
                                                color: '#856404',
                                                fontSize: '13px'
                                            }}>
                                                Không có màu sắc nào khả dụng
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Edition Selector */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#374151', fontWeight: '600' }}>
                                        ⭐ Edition
                                    </h4>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {Object.keys(editionPricing).map(edition => (
                                            <button
                                                key={edition}
                                                onClick={() => setSelectedEdition(edition)}
                                                style={{
                                                    padding: '8px 14px',
                                                    border: selectedEdition === edition ? '2px solid #6366f1' : '2px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    background: selectedEdition === edition ? '#eef2ff' : 'white',
                                                    color: selectedEdition === edition ? '#6366f1' : '#6b7280',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {edition} {editionPricing[edition] > 0 && `(+${(editionPricing[edition] / 1000).toFixed(0)}k)`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sole Type Selector */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#374151', fontWeight: '600' }}>
                                        👟 Công nghệ đế
                                    </h4>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {Object.keys(soleTypePricing).map(soleType => (
                                            <button
                                                key={soleType}
                                                onClick={() => setSelectedSoleType(soleType)}
                                                style={{
                                                    padding: '8px 14px',
                                                    border: selectedSoleType === soleType ? '2px solid #6366f1' : '2px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    background: selectedSoleType === soleType ? '#eef2ff' : 'white',
                                                    color: selectedSoleType === soleType ? '#6366f1' : '#6b7280',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {soleType} {soleTypePricing[soleType] > 0 && `(+${(soleTypePricing[soleType] / 1000).toFixed(0)}k)`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Box Type Selector */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#374151', fontWeight: '600' }}>
                                        📦 Loại hộp
                                    </h4>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {Object.keys(boxPricing).map(boxType => (
                                            <button
                                                key={boxType}
                                                onClick={() => setSelectedBoxType(boxType)}
                                                style={{
                                                    padding: '8px 14px',
                                                    border: selectedBoxType === boxType ? '2px solid #6366f1' : '2px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    background: selectedBoxType === boxType ? '#eef2ff' : 'white',
                                                    color: selectedBoxType === boxType ? '#6366f1' : '#6b7280',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {boxType} {boxPricing[boxType] > 0 && `(+${(boxPricing[boxType] / 1000).toFixed(0)}k)`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Warranty Selector */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#374151', fontWeight: '600' }}>
                                        🛡️ Bảo hành
                                    </h4>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {Object.keys(warrantyPricing).map(warranty => (
                                            <button
                                                key={warranty}
                                                onClick={() => setSelectedWarranty(warranty)}
                                                style={{
                                                    padding: '8px 14px',
                                                    border: selectedWarranty === warranty ? '2px solid #6366f1' : '2px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    background: selectedWarranty === warranty ? '#eef2ff' : 'white',
                                                    color: selectedWarranty === warranty ? '#6366f1' : '#6b7280',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {warranty} tháng {warrantyPricing[warranty] > 0 && `(+${(warrantyPricing[warranty] / 1000).toFixed(0)}k)`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Personalization Toggle */}
                                <div style={{ marginBottom: '0' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        cursor: 'pointer',
                                        padding: '12px',
                                        background: hasPersonalization ? '#eef2ff' : 'white',
                                        borderRadius: '8px',
                                        border: hasPersonalization ? '2px solid #6366f1' : '2px solid #e5e7eb',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={hasPersonalization}
                                            onChange={(e) => setHasPersonalization(e.target.checked)}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: hasPersonalization ? '#6366f1' : '#374151'
                                        }}>
                                            ✨ Tùy chỉnh cá nhân hóa (+{(personalizationPrice / 1000).toFixed(0)}k)
                                        </span>
                                    </label>
                                </div>
                            </div>
                            {/* ===== END OPTIONS SECTION ===== */}

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
                            {(!isOutOfStock && currentStock > 0) && (
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
                                            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
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

                            {(isOutOfStock || currentStock <= 0) && (
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
                                    ❌ Hết hàng
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
