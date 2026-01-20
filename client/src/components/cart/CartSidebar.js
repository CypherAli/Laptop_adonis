import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import CartContext from '../../context/CartContext';
import ProductImage from '../product/ProductImage';
import './CartSidebar.css';

const CartSidebar = ({ isOpen, onClose }) => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useContext(CartContext);

    // Close sidebar when clicking outside
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('cart-sidebar-backdrop')) {
            onClose();
        }
    };

    const handleQuantityChange = (productId, variantSku, newQuantity) => {
        if (newQuantity < 1) return;
        updateQuantity(productId, newQuantity, variantSku);
    };

    const handleRemoveFromCart = (productId, variantSku) => {
        removeFromCart(productId, variantSku);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Get price from item, fallback to variants or basePrice
    const getItemPrice = (item) => {
        if (item.price && !isNaN(item.price)) {
            return parseFloat(item.price);
        }
        // Try to get from variants
        if (item.variants && item.variants.length > 0) {
            const variant = item.variants.find(v => v.isAvailable && v.stock > 0) || item.variants[0];
            if (variant?.price) return parseFloat(variant.price);
        }
        // Fallback to basePrice
        if (item.basePrice) return parseFloat(item.basePrice);
        return 0;
    };

    // Safety check - nếu cartItems undefined, return empty sidebar
    if (!cartItems) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="cart-sidebar-backdrop" 
                    onClick={handleBackdropClick}
                />
            )}

            {/* Sidebar */}
            <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="cart-sidebar-header">
                    <h2>Shopping Cart</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="cart-sidebar-items">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-cart-icon">🛒</div>
                            <p>Giỏ hàng trống</p>
                            <button className="continue-shopping-btn" onClick={onClose}>
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={`${item._id}-${item.variantSku || ''}`} className="cart-sidebar-item">
                                {/* Product Image */}
                                <div className="item-image">
                                    <ProductImage 
                                        product={item}
                                        alt={item.name}
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="item-details">
                                    <h4 className="item-name">{item.name}</h4>
                                    
                                    {/* Variant Info */}
                                    {item.selectedOptions && (
                                        <div className="item-variant-info" style={{fontSize: '12px', color: '#666', marginBottom: '5px'}}>
                                            {item.selectedOptions.gender && <span>{item.selectedOptions.gender}</span>}
                                            {item.selectedOptions.size && <span> • Size {item.selectedOptions.size}</span>}
                                            {item.selectedOptions.color && <span> • {item.selectedOptions.color}</span>}
                                        </div>
                                    )}
                                    
                                    {/* Quantity Controls */}
                                    <div className="item-quantity">
                                        <button 
                                            className="qty-btn"
                                            onClick={() => handleQuantityChange(item._id, item.variantSku, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button 
                                            className="qty-btn"
                                            onClick={() => handleQuantityChange(item._id, item.variantSku, item.quantity + 1)}
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>

                                    {/* Price */}
                                    <div className="item-price">
                                        <span className="price-value">
                                            {formatPrice(getItemPrice(item) * item.quantity)} VND
                                        </span>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button 
                                    className="remove-btn"
                                    onClick={() => handleRemoveFromCart(item._id, item.variantSku)}
                                    title="Xóa sản phẩm"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer - Subtotal and Actions */}
                {cartItems.length > 0 && (
                    <div className="cart-sidebar-footer">
                        <div className="subtotal-row">
                            <span className="subtotal-label">SUBTOTAL:</span>
                            <span className="subtotal-value">
                                {formatPrice(cartItems.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0))} VND
                            </span>
                        </div>

                        <div className="footer-actions">
                            <Link 
                                to="/cart" 
                                className="view-cart-btn"
                                onClick={onClose}
                            >
                                View cart
                            </Link>
                            <Link 
                                to="/checkout" 
                                className="checkout-btn"
                                onClick={onClose}
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
