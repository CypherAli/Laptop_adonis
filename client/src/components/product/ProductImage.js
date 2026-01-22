import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PLACEHOLDER_IMAGES } from '../../utils/placeholder';
import './ProductImage.css';

/**
 * ProductImage Component
 * Hiển thị hình ảnh sản phẩm với error handling, loading state, và fallback
 */
const ProductImage = ({ 
    src, 
    alt = 'Product Image', 
    size = 'medium',
    className = '',
    fallback = null,
    onError = null,
    lazy = true,
    style = {}
}) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Size presets
    const sizeMap = {
        small: { width: 150, height: 150 },
        medium: { width: 300, height: 200 },
        large: { width: 600, height: 400 },
        thumbnail: { width: 100, height: 100 },
        cart: { width: 120, height: 120 }
    };

    const dimensions = sizeMap[size] || sizeMap.medium;

    // Xác định fallback image
    const getFallbackImage = () => {
        if (fallback) return fallback;
        
        switch(size) {
            case 'small':
                return PLACEHOLDER_IMAGES.productSmall;
            case 'large':
                return PLACEHOLDER_IMAGES.productLarge;
            case 'thumbnail':
                return PLACEHOLDER_IMAGES.thumbnail;
            case 'cart':
                return PLACEHOLDER_IMAGES.cart;
            default:
                return PLACEHOLDER_IMAGES.product;
        }
    };

    const handleImageError = (e) => {
        console.log('Image load error:', src);
        
        // Check if this is a 403 or CORS error by trying to detect external URLs
        const isExternalUrl = src && (
            src.includes('vans.com') || 
            src.includes('nike.com') || 
            src.includes('adidas.com') ||
            src.includes('reebok.com') ||
            src.includes('puma.com') ||
            src.startsWith('http://') ||
            (src.startsWith('https://') && !src.includes(window.location.hostname))
        );
        
        if (isExternalUrl) {
            console.warn('⚠️ External image blocked (403/CORS):', src);
        }
        
        setImageError(true);
        setIsLoading(false);
        
        // Set fallback image
        e.target.src = getFallbackImage();
        
        // Call custom error handler if provided
        if (onError) onError(e);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    // Nếu không có src hoặc src invalid, dùng fallback ngay
    const imageSrc = src && src.trim() !== '' ? src : getFallbackImage();

    return (
        <div 
            className={`product-image-wrapper ${className} ${isLoading ? 'loading' : ''}`}
            style={{ 
                width: dimensions.width, 
                height: dimensions.height,
                ...style 
            }}
        >
            {isLoading && (
                <div className="image-loading-spinner">
                    <div className="spinner"></div>
                </div>
            )}
            
            <img
                src={imageSrc}
                alt={alt}
                className={`product-image ${imageError ? 'has-error' : ''}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading={lazy ? 'lazy' : 'eager'}
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease'
                }}
            />
        </div>
    );
};

ProductImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large', 'thumbnail', 'cart']),
    className: PropTypes.string,
    fallback: PropTypes.string,
    onError: PropTypes.func,
    lazy: PropTypes.bool,
    style: PropTypes.object
};

export default ProductImage;
