import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../api/axiosConfig';
import AuthContext from '../../../../context/AuthContext';
import { useToast } from '../../../../components/common/Toast';
import { PLACEHOLDER_IMAGES } from '../../../../utils/placeholder';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    // Shipping Information
    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        notes: ''
    });

    // Payment Method
    const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, bank, momo, zalopay

    const fetchCart = async () => {
        try {
            const res = await axios.get('/cart');
            console.log('🛒 Cart data:', res.data);
            console.log('🛒 Cart items:', res.data.items);
            setCartItems(res.data.items || []);
        } catch (err) {
            toast.error('Cannot load cart');
        } finally {
            setLoading(false);
        }
    };

    // Load cart on mount
    React.useEffect(() => {
        if (!user) {
            toast.error('Please login to checkout');
            // Save intended route before redirecting
            localStorage.setItem('redirectAfterLogin', '/checkout');
            navigate('/login');
            return;
        }
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateShipping = () => {
        const subtotal = calculateSubtotal();
        return subtotal >= 10000000 ? 0 : 30000; // Free shipping for orders >= 10M
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateShipping();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!shippingInfo.fullName.trim()) {
            toast.error('Please enter full name');
            return false;
        }
        if (!shippingInfo.phone.trim()) {
            toast.error('Please enter phone number');
            return false;
        }
        if (!shippingInfo.address.trim()) {
            toast.error('Please enter address');
            return false;
        }
        if (!shippingInfo.district.trim()) {
            toast.error('Please enter district');
            return false;
        }
        if (!shippingInfo.city.trim()) {
            toast.error('Please select Province/City');
            return false;
        }
        return true;
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            toast.error('Giỏ hàng trống');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product: item.product._id,
                    variantSku: item.variantSku,
                    quantity: item.quantity,
                    sellerName: item.sellerName
                })),
                shippingAddress: {
                    fullName: shippingInfo.fullName,
                    phone: shippingInfo.phone,
                    address: {
                        street: shippingInfo.address,
                        ward: shippingInfo.ward,
                        district: shippingInfo.district,
                        city: shippingInfo.city
                    }
                },
                paymentMethod: paymentMethod,
                notes: shippingInfo.notes
            };

            console.log('📦 Submitting order:', orderData);
            console.log('📦 Order items detail:', orderData.items);
            console.log('📦 Shipping address detail:', orderData.shippingAddress);
            const response = await axios.post('/orders', orderData);
            console.log('✅ Order response:', response.data);
            
            // Clear cart after successful order
            await axios.delete('/cart/clear');
            
            toast.success('Order placed successfully!');
            navigate(`/orders`);
        } catch (err) {
            console.error('❌ Order submission failed', err);
            console.error('❌ Error response:', err.response?.data);
            console.error('❌ Error status:', err.response?.status);
            const errorMsg = err.response?.data?.message || 'Order failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <h2>Loading information...</h2>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="empty-checkout">
                <h2>Giỏ hàng trống</h2>
                <p>Please add products to cart before checkout</p>
                <button onClick={() => navigate('/')} className="btn-shop">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <h1 className="checkout-title">
                    Checkout
                </h1>

                <form onSubmit={handleSubmitOrder} className="checkout-form">
                    <div className="checkout-main">
                        {/* Shipping Information */}
                        <div className="checkout-section">
                            <h2 className="section-title">
                                Shipping Information
                            </h2>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Full Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={shippingInfo.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={shippingInfo.email}
                                        onChange={handleInputChange}
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={shippingInfo.phone}
                                        onChange={handleInputChange}
                                        placeholder="0912345678"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Address <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleInputChange}
                                        placeholder="House number, street name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Ward</label>
                                    <input
                                        type="text"
                                        name="ward"
                                        value={shippingInfo.ward}
                                        onChange={handleInputChange}
                                        placeholder="Ward 1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>District <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={shippingInfo.district}
                                        onChange={handleInputChange}
                                        placeholder="District 1"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Province/City <span className="required">*</span></label>
                                    <select
                                        name="city"
                                        value={shippingInfo.city}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Province/City</option>
                                        <option value="Hà Nội">Hanoi</option>
                                        <option value="TP. Hồ Chí Minh">Ho Chi Minh City</option>
                                        <option value="Đà Nẵng">Da Nang</option>
                                        <option value="Hải Phòng">Hai Phong</option>
                                        <option value="Cần Thơ">Can Tho</option>
                                        <option value="Khác">Other</option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Notes (optional)</label>
                                    <textarea
                                        name="notes"
                                        value={shippingInfo.notes}
                                        onChange={handleInputChange}
                                        placeholder="Additional notes about the order (optional)"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="checkout-section">
                            <h2 className="section-title">
                                Payment Method
                            </h2>

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
                                            <strong>Cash on Delivery (COD)</strong>
                                            <p>Pay with cash upon receiving goods</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank"
                                        checked={paymentMethod === 'bank'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="payment-content">
                                        <div>
                                            <strong>Bank Transfer</strong>
                                            <p>Transfer via Internet Banking</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`payment-option ${paymentMethod === 'momo' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="momo"
                                        checked={paymentMethod === 'momo'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="payment-content">
                                        <div>
                                            <strong>MoMo Wallet</strong>
                                            <p>Pay via MoMo e-wallet</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`payment-option ${paymentMethod === 'zalopay' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="zalopay"
                                        checked={paymentMethod === 'zalopay'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="payment-content">
                                        <div>
                                            <strong>ZaloPay</strong>
                                            <p>Pay via ZaloPay e-wallet</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="checkout-sidebar">
                        <div className="order-summary">
                            <h2 className="summary-title">
                                Your Order
                            </h2>

                            <div className="summary-items">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="summary-item">
                                        <img 
                                            src={item.product?.imageUrl || PLACEHOLDER_IMAGES.avatar} 
                                            alt={item.product?.name}
                                        />
                                        <div className="item-info">
                                            <p className="item-name">{item.product?.name}</p>
                                            <p className="item-quantity">x{item.quantity}</p>
                                        </div>
                                        <p className="item-price">
                                            {(item.price * item.quantity).toLocaleString()} ₫
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-calculations">
                                <div className="calc-row">
                                    <span>Subtotal:</span>
                                    <span>{calculateSubtotal().toLocaleString()} ₫</span>
                                </div>
                                <div className="calc-row">
                                    <span>Shipping fee:</span>
                                    <span>{calculateShipping() === 0 ? 'Free' : `${calculateShipping().toLocaleString()} ₫`}</span>
                                </div>
                                {calculateShipping() === 0 && (
                                    <div className="free-shipping-note">
                                        Free shipping for orders over 10,000,000 ₫
                                    </div>
                                )}
                                <div className="calc-row total">
                                    <span>Total:</span>
                                    <span className="total-amount">{calculateTotal().toLocaleString()} ₫</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-submit-order"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>

                            <div className="checkout-note">
                                <p>Your information is secure</p>
                                <p>Hotline: 1900 xxxx</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
