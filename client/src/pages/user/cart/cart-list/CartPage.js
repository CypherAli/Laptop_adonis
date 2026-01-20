import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../../../../context/CartContext';
import AuthContext from '../../../../context/AuthContext';
import axios from '../../../../api/axiosConfig';
import { PLACEHOLDER_IMAGES } from '../../../../utils/placeholder';
import './CartPage.css';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [selectedItems, setSelectedItems] = useState(cartItems.map(item => item._id));
    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.username || '',
        phone: '',
        address: '',
        city: 'Hồ Chí Minh'
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [notes, setNotes] = useState('');
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);

    // Group cart items by seller
    const groupItemsBySeller = () => {
        console.log('🔍 GROUPING CART ITEMS:', cartItems);
        const grouped = {};
        cartItems.forEach(item => {
            const sellerId = item.seller?._id || item.seller || 'unknown';
            const sellerName = item.sellerName || item.seller?.shopName || item.seller?.username || 'Unknown Shop';
            
            console.log(`🔍 Item: ${item.name}`);
            console.log(`   - sellerId: ${sellerId}`);
            console.log(`   - sellerName: ${sellerName}`);
            console.log(`   - item.sellerName: ${item.sellerName}`);
            console.log(`   - item.seller?.shopName: ${item.seller?.shopName}`);
            
            if (!grouped[sellerId]) {
                grouped[sellerId] = {
                    sellerId,
                    sellerName,
                    items: []
                };
            }
            grouped[sellerId].items.push(item);
        });
        
        const result = Object.values(grouped);
        console.log('🔍 GROUPED RESULT:', result);
        return result;
    };

    // Toggle item selection
    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Select all items
    const toggleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item._id));
        }
    };

    // Calculate selected items total
    const getSelectedTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item._id))
            .reduce((total, item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 0;
                return total + (price * quantity);
            }, 0);
    };

    // Calculate shipping fee
    const getShippingFee = () => {
        const total = getSelectedTotal();
        if (total >= 15000000) return 0; // Free shipping for orders >= 15M
        return 30000; // 30k shipping
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('⚠️ Please login to place an order');
            navigate('/login');
            return;
        }

        if (selectedItems.length === 0) {
            alert('⚠️ Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));
            
            const orderData = {
                items: selectedCartItems.map(item => ({
                    product: item._id,
                    seller: item.seller?._id || item.seller,
                    sellerName: item.sellerName || item.seller?.shopName || item.seller?.username || 'Unknown Shop',
                    name: item.name,
                    brand: item.brand,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                    specifications: item.specifications
                })),
                subtotal: getSelectedTotal(),
                shippingFee: getShippingFee(),
                totalAmount: getSelectedTotal() + getShippingFee(),
                shippingAddress: shippingInfo,
                paymentMethod: paymentMethod,
                notes: notes
            };

            await axios.post('/orders', orderData);
            
            setSuccess(true);
            
            // Remove ordered items from cart
            selectedCartItems.forEach(item => removeFromCart(item._id));
            
            setTimeout(() => {
                navigate('/orders');
            }, 2000);
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.response?.data?.message || 'Order failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty-container">
                <div className="empty-cart-illustration">
                    <div className="empty-cart-icon">×</div>
                    <h2>Giỏ hàng trống</h2>
                    <p>Add products to cart to continue shopping!</p>
                    <button onClick={() => navigate('/')} className="btn-continue-shopping">
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            {/* Success Modal */}
            {success && (
                <div className="success-modal-overlay">
                    <div className="success-modal">
                        <div className="success-icon">✓</div>
                        <h2>Order placed successfully!</h2>
                        <p>Your order is being processed</p>
                        <div className="success-animation"></div>
                    </div>
                </div>
            )}

            <div className="cart-header">
                <h1>
                    Your Shopping Cart
                </h1>
                <div className="cart-count">
                    {cartItems.length} items
                </div>
            </div>

            <div className="cart-layout">
                {/* Left: Cart Items */}
                <div className="cart-items-section">
                    {/* Select All Header */}
                    <div className="cart-select-all">
                        <label className="checkbox-container">
                            <input 
                                type="checkbox"
                                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                onChange={toggleSelectAll}
                            />
                            <span className="checkmark"></span>
                            <span className="label-text">Select All ({cartItems.length})</span>
                        </label>
                        {selectedItems.length > 0 && (
                            <button 
                                onClick={() => {
                                    if (window.confirm(`Delete {selectedItems.length} selected items?`)) {
                                        selectedItems.forEach(id => removeFromCart(id));
                                        setSelectedItems([]);
                                    }
                                }}
                                className="btn-delete-selected"
                            >
                                <span>🗑️</span>
                                <span>Delete selected</span>
                            </button>
                        )}
                    </div>

                    {/* Cart Items List - Grouped by Seller */}
                    <div className="cart-items-list">
                        {groupItemsBySeller().map(sellerGroup => (
                            <div key={sellerGroup.sellerId} className="seller-group">
                                {/* Seller Header */}
                                <div className="seller-header">
                                    <div className="seller-info">
                                        <h3>{sellerGroup.sellerName}</h3>
                                    </div>
                                    <span className="items-count">
                                        {sellerGroup.items.length} sản phẩm
                                    </span>
                                </div>

                                {/* Items in this shop */}
                                {sellerGroup.items.map(item => {
                                    console.log('🔍 RENDERING ITEM:', item);
                                    console.log('   - price:', item.price);
                                    console.log('   - name:', item.name);
                                    
                                    return (
                            <div 
                                key={item._id} 
                                className={`cart-item-card ${selectedItems.includes(item._id) ? 'selected' : ''}`}
                            >
                                <label className="checkbox-container">
                                    <input 
                                        type="checkbox"
                                        checked={selectedItems.includes(item._id)}
                                        onChange={() => toggleItemSelection(item._id)}
                                    />
                                    <span className="checkmark"></span>
                                </label>

                                <div className="item-image">
                                    <img 
                                        src={item.imageUrl || PLACEHOLDER_IMAGES.cart} 
                                        alt={item.name}
                                    />
                                    {item.stock <= 5 && (
                                        <div className="low-stock-badge">Only {item.stock} left</div>
                                    )}
                                </div>

                                <div className="item-details">
                                    <h3 className="item-name">{item.name}</h3>
                                    <div className="item-meta">
                                        <span className="item-brand">{item.brand}</span>
                                        <span className="item-stock">Stock: {item.stock || 'N/A'}</span>
                                    </div>
                                    <div className="item-price-section">
                                        <div className="current-price">
                                            {(item.price || 0).toLocaleString('vi-VN')} đ
                                        </div>
                                        {item.discountedPrice && (
                                            <div className="original-price">
                                                {item.discountedPrice.toLocaleString('vi-VN')} đ
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="item-actions">
                                    <div className="quantity-controller">
                                        <button 
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="qty-btn"
                                        >
                                            <span>−</span>
                                        </button>
                                        <input 
                                            type="number" 
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                if (val >= 1 && val <= item.stock) {
                                                    updateQuantity(item._id, val);
                                                }
                                            }}
                                            min="1"
                                            max={item.stock}
                                            className="qty-input"
                                        />
                                        <button 
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                            className="qty-btn"
                                        >
                                            <span>+</span>
                                        </button>
                                    </div>

                                    <div className="item-subtotal">
                                        {((item.price || 0) * item.quantity).toLocaleString('vi-VN')} đ
                                    </div>

                                    <button 
                                        onClick={() => {
                                            if (window.confirm('Remove this product from cart?')) {
                                                removeFromCart(item._id);
                                                setSelectedItems(prev => prev.filter(id => id !== item._id));
                                            }
                                        }}
                                        className="btn-remove-item"
                                        title="Remove product"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="cart-summary-section">
                    <div className="summary-card">
                        <h2 className="summary-title">
                            <span>📋</span>
                            <span>Order Information</span>
                        </h2>

                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Subtotal ({selectedItems.length} items)</span>
                                <span className="amount">{getSelectedTotal().toLocaleString('vi-VN')} đ</span>
                            </div>
                            
                            <div className="summary-row">
                                <span>Shipping fee</span>
                                <span className={`amount ${getShippingFee() === 0 ? 'free' : ''}`}>
                                    {getShippingFee() === 0 ? 'Free' : `${getShippingFee().toLocaleString('vi-VN')} đ`}
                                </span>
                            </div>

                            {getSelectedTotal() < 15000000 && getSelectedTotal() > 0 && (
                                <div className="shipping-notice">
                                    Add {(15000000 - getSelectedTotal()).toLocaleString('vi-VN')} đ more for free shipping
                                </div>
                            )}

                            <div className="summary-divider"></div>

                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span className="total-amount">
                                    {(getSelectedTotal() + getShippingFee()).toLocaleString('vi-VN')} đ
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                if (!user) {
                                    navigate('/login');
                                    return;
                                }
                                if (selectedItems.length === 0) {
                                    alert('⚠️ Please select items to checkout');
                                    return;
                                }
                                navigate('/checkout');
                            }}
                            className="btn-checkout"
                            disabled={selectedItems.length === 0}
                        >
                            <span>Checkout ({selectedItems.length})</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="checkout-modal-overlay" onClick={() => setShowCheckoutModal(false)}>
                    <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <span>📝</span>
                                <span>Shipping Information</span>
                            </h2>
                            <button onClick={() => setShowCheckoutModal(false)} className="btn-close-modal">
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="checkout-error">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleCheckout} className="checkout-form">
                            <div className="form-section">
                                <label className="form-label">
                                    <span>👤</span>
                                    <span>Full Name</span>
                                </label>
                                <input 
                                    type="text"
                                    placeholder="John Doe"
                                    value={shippingInfo.fullName}
                                    onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-section">
                                <label className="form-label">
                                    <span>📱</span>
                                    <span>Phone Number</span>
                                </label>
                                <input 
                                    type="tel"
                                    placeholder="0901234567"
                                    value={shippingInfo.phone}
                                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                                    required
                                    pattern="[0-9]{10}"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-section">
                                <label className="form-label">
                                    <span>🏠</span>
                                    <span>Delivery Address</span>
                                </label>
                                <textarea 
                                    placeholder="House number, street, ward"
                                    value={shippingInfo.address}
                                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                                    required
                                    rows="3"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-section">
                                <label className="form-label">
                                    <span>🏙️</span>
                                    <span>Province/City</span>
                                </label>
                                <select 
                                    value={shippingInfo.city}
                                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                                    required
                                    className="form-select"
                                >
                                    <option value="Hồ Chí Minh">Ho Chi Minh City</option>
                                    <option value="Hà Nội">Hanoi</option>
                                    <option value="Đà Nẵng">Da Nang</option>
                                    <option value="Cần Thơ">Can Tho</option>
                                    <option value="Khác">Other</option>
                                </select>
                            </div>

                            <div className="form-section">
                                <label className="form-label">
                                    <span>💳</span>
                                    <span>Payment Method</span>
                                </label>
                                <div className="payment-methods">
                                    <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input 
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-content">
                                            <div>
                                                <div className="payment-name">Cash on Delivery (COD)</div>
                                                <div className="payment-desc">Pay with cash upon receiving goods</div>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`}>
                                        <input 
                                            type="radio"
                                            name="payment"
                                            value="bank_transfer"
                                            checked={paymentMethod === 'bank_transfer'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-content">
                                            <div>
                                                <div className="payment-name">Bank Transfer</div>
                                                <div className="payment-desc">Pay before receiving goods</div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="form-label">
                                    <span>📝</span>
                                    <span>Notes (optional)</span>
                                </label>
                                <textarea 
                                    placeholder="Notes for seller..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="2"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="modal-summary">
                                <div className="summary-item">
                                    <span>Subtotal:</span>
                                    <span>{getSelectedTotal().toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="summary-item">
                                    <span>Shipping fee:</span>
                                    <span>{getShippingFee().toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="summary-item total">
                                    <span>Total payment:</span>
                                    <span className="total-price">
                                        {(getSelectedTotal() + getShippingFee()).toLocaleString('vi-VN')} đ
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button"
                                    onClick={() => setShowCheckoutModal(false)}
                                    className="btn-cancel"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-submit-order"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-icon"></span>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Place Order</span>
                                            <span>→</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
