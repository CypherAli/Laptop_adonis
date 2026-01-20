import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import './ContactPage.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [popularProducts, setPopularProducts] = useState([]);

    useEffect(() => {
        const fetchPopularProducts = async () => {
            try {
                const res = await axios.get('/products', {
                    params: { limit: 3, inStock: true }
                });
                setPopularProducts(res.data.products || []);
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };
        fetchPopularProducts();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for contacting us! We will respond as soon as possible.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    return (
        <div className="contact-page">
            {/* Hero */}
            <div className="contact-hero">
                <div className="contact-hero-content">
                    <h1 className="contact-title">📧 Liên Hệ Chúng Tôi</h1>
                    <p className="contact-subtitle">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
                    </p>
                </div>
            </div>

            {/* Contact Info Cards */}
            <div className="contact-info-section">
                <div className="contact-info-container">
                    <div className="info-card">
                        <div className="info-icon">📞</div>
                        <h3>Hotline</h3>
                        <p><a href="tel:0846865650">084.686.5650</a></p>
                        <span className="info-note">24/7 Support</span>
                    </div>
                    <div className="info-card">
                        <div className="info-icon">📧</div>
                        <h3>Email</h3>
                        <p><a href="mailto:trinhviethoangawm@gmail.com">trinhviethoangawm@gmail.com</a></p>
                        <span className="info-note">Response within 24h</span>
                    </div>
                    <div className="info-card">
                        <div className="info-icon">📍</div>
                        <h3>Address</h3>
                        <p>Hanoi, Vietnam</p>
                        <span className="info-note">8:00 - 21:00 daily</span>
                    </div>
                    <div className="info-card">
                        <div className="info-icon">💬</div>
                        <h3>Live Chat</h3>
                        <p>Chat directly with staff</p>
                        <span className="info-note">Instant response</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="contact-main">
                <div className="contact-container">
                    {/* Contact Form */}
                    <div className="contact-form-section">
                        <h2>📝 Send Message</h2>
                        <p className="form-description">
                            Fill in the information below and we will contact you as soon as possible
                        </p>
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="0901234567"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="example@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject *</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Select Subject --</option>
                                    <option value="tu-van">Product Consultation</option>
                                    <option value="bao-hanh">Warranty - Returns</option>
                                    <option value="don-hang">Order Tracking</option>
                                    <option value="khieu-nai">Complaints</option>
                                    <option value="khac">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="6"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your message..."
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-btn">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Map & Additional Info */}
                    <div className="contact-side">
                        <div className="map-section">
                            <h3>🗺️ Map</h3>
                            <div className="map-placeholder">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4967076167615!2d106.69254731533431!3d10.77625899231597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x5b3e5e93cc2e3af5!2sBen%20Thanh%20Market!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0, borderRadius: '15px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    title="Store Location"
                                ></iframe>
                            </div>
                        </div>

                        <div className="faq-section">
                            <h3>❓ Câu Hỏi Thường Gặp</h3>
                            <div className="faq-list">
                                <div className="faq-item">
                                    <h4>Thời gian giao hàng?</h4>
                                    <p>2-4 giờ nội thành, 1-3 ngày toàn quốc</p>
                                </div>
                                <div className="faq-item">
                                    <h4>Chính sách đổi trả?</h4>
                                    <p>Đổi trả trong 15 ngày nếu lỗi nhà sản xuất</p>
                                </div>
                                <div className="faq-item">
                                    <h4>Bảo hành như thế nào?</h4>
                                    <p>Bảo hành chính hãng 6-12 tháng</p>
                                </div>
                                <div className="faq-item">
                                    <h4>Có hỗ trợ trả góp?</h4>
                                    <p>Có, duyệt nhanh trong 30 phút</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Locations */}
            <div className="stores-section">
                <div className="stores-container">
                    <h2>🏪 Hệ Thống Cửa Hàng</h2>
                    <div className="stores-grid">
                        <div className="store-card">
                            <h4>District 1 Branch</h4>
                            <p>📍 123 Nguyen Hue, Dist 1, HCMC</p>
                            <p>📞 028 3822 xxxx</p>
                            <p>🕐 8:00 - 21:00</p>
                        </div>
                        <div className="store-card">
                            <h4>District 3 Branch</h4>
                            <p>📍 456 Le Van Sy, Dist 3, HCMC</p>
                            <p>📞 028 3930 xxxx</p>
                            <p>🕐 8:00 - 21:00</p>
                        </div>
                        <div className="store-card">
                            <h4>Hanoi Branch</h4>
                            <p>📍 789 Lang Ha, Dong Da, Hanoi</p>
                            <p>📞 024 3537 xxxx</p>
                            <p>🕐 8:00 - 21:00</p>
                        </div>
                        <div className="store-card">
                            <h4>Da Nang Branch</h4>
                            <p>📍 321 Hung Vuong, Hai Chau, Da Nang</p>
                            <p>📞 0236 3836 xxxx</p>
                            <p>🕐 8:00 - 21:00</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popular Products */}
            {popularProducts.length > 0 && (
                <div className="contact-products">
                    <div className="products-container">
                        <h2>🔥 Giày Hot Nhất</h2>
                        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
                            Xem ngay các sản phẩm bán chạy nhất
                        </p>
                        <div className="products-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '25px',
                            maxWidth: '1000px',
                            margin: '0 auto'
                        }}>
                            {popularProducts.map(product => (
                                <Link 
                                    key={product._id} 
                                    to={`/product/${product._id}`}
                                    style={{
                                        textDecoration: 'none',
                                        padding: '25px',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '12px',
                                        transition: 'all 0.3s',
                                        backgroundColor: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '220px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '70px',
                                        marginBottom: '18px'
                                    }}>
                                        👟
                                    </div>
                                    <h4 style={{ 
                                        color: '#2c3e50', 
                                        marginBottom: '12px', 
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        lineHeight: '1.4'
                                    }}>
                                        {product.name}
                                    </h4>
                                    <p style={{ 
                                        color: '#7f8c8d',
                                        fontSize: '14px',
                                        marginBottom: '12px'
                                    }}>
                                        {product.brand || 'Brand'}
                                    </p>
                                    <p style={{ 
                                        color: '#e74c3c', 
                                        fontWeight: 'bold',
                                        fontSize: '20px',
                                        margin: 0
                                    }}>
                                        {new Intl.NumberFormat('vi-VN', { 
                                            style: 'currency', 
                                            currency: 'VND' 
                                        }).format(product.basePrice || product.variants?.[0]?.price || 0)}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactPage;
