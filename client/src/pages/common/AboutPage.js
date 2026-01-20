import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import './AboutPage.css';

const AboutPage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const res = await axios.get('/products', {
                    params: { limit: 4, inStock: true }
                });
                setFeaturedProducts(res.data.products || []);
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };
        fetchFeaturedProducts();
    }, []);

    return (
        <div className="about-page">
            {/* Hero Section */}
            <div className="about-hero">
                <div className="about-hero-content">
                    <h1 className="about-title">Về Chúng Tôi</h1>
                    <p className="about-subtitle">
                        Hệ Thống Bán Lẻ Giày Sneaker Uy Tín Hàng Đầu Việt Nam
                    </p>
                </div>
            </div>

            {/* Company Story */}
            <div className="company-story">
                <div className="story-container">
                    <div className="story-content">
                        <h2>Câu Chuyện Của Chúng Tôi</h2>
                        <p>
                            <strong>Shoe Store</strong> được thành lập từ năm 2020 với sứ mệnh mang đến 
                            cho khách hàng Việt những đôi giày sneaker chính hãng, chất lượng cao với giá cả hợp lý nhất.
                        </p>
                        <p>
                            Qua hơn 5 năm phát triển, chúng tôi đã trở thành một trong những 
                            đơn vị phân phối giày sneaker hàng đầu Việt Nam với hơn <strong>20 cửa hàng</strong> trên toàn quốc 
                            và hơn <strong>200,000 khách hàng tin tưởng</strong>.
                        </p>
                    </div>
                    <div className="story-image">
                        <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600" alt="Our Team" />
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="mission-vision">
                <div className="mv-container">
                    <div className="mv-item mission">
                        <h3>Sứ Mệnh</h3>
                        <p>
                            Cung cấp giày sneaker chất lượng cao và dịch vụ tận tâm, 
                            giúp khách hàng thể hiện phong cách và nâng cao chất lượng cuộc sống.
                        </p>
                    </div>
                    <div className="mv-item vision">
                        <h3>Tầm Nhìn</h3>
                        <p>
                            Trở thành hệ thống bán lẻ giày sneaker số 1 Việt Nam, được tin yêu 
                            và lựa chọn để mua sắm giày chính hãng.
                        </p>
                    </div>
                    <div className="mv-item values">
                        <h3>Giá Trị Cốt Lõi</h3>
                        <p>
                            Chính trực - Chuyên nghiệp - Chất lượng - Cam kết. 
                            Luôn đặt lợi ích khách hàng lên hàng đầu.
                        </p>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="core-values">
                <div className="values-container">
                    <h2>Giá Trị Cốt Lõi</h2>
                    <div className="values-grid">
                        <div className="value-item">
                            <h4>100% Chính Hãng</h4>
                            <p>Tất cả sản phẩm đều chính hãng có đầy đủ hóa đơn VAT</p>
                        </div>
                        <div className="value-item">
                            <h4>Bảo Hành Uy Tín</h4>
                            <p>Bảo hành chính hãng tại các trung tâm ủy quyền</p>
                        </div>
                        <div className="value-item">
                            <h4>Giá Tốt Nhất</h4>
                            <p>Giá cạnh tranh, hoàn tiền nếu tìm thấy rẻ hơn</p>
                        </div>
                        <div className="value-item">
                            <h4>Giao Hàng Nhanh</h4>
                            <p>Giao trong 2-4 giờ nội thành, 1-3 ngày toàn quốc</p>
                        </div>
                        <div className="value-item">
                            <h4>Tư Vấn Chuyên Nghiệp</h4>
                            <p>Đội ngũ am hiểu sản phẩm, tư vấn nhiệt tình</p>
                        </div>
                        <div className="value-item">
                            <h4>Đổi Trả Linh Hoạt</h4>
                            <p>Đổi trả trong 15 ngày nếu lỗi nhà sản xuất</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="stat-number">5+</div>
                        <div className="stat-label">Năm kinh nghiệm</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">20+</div>
                        <div className="stat-label">Cửa hàng toàn quốc</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">200K+</div>
                        <div className="stat-label">Khách hàng tin tưởng</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">4.9★</div>
                        <div className="stat-label">Đánh giá trung bình</div>
                    </div>
                </div>
            </div>

            {/* Team */}
            <div className="team-section">
                <div className="team-container">
                    <h2>Đội Ngũ Lãnh Đạo</h2>
                    <div className="team-grid">
                        <div className="team-member">
                            <h4>Trịnh Việt Hoàng</h4>
                            <p className="member-title">CEO & Founder</p>
                            <p className="member-desc">15 years of experience in the technology industry</p>
                        </div>
                        <div className="team-member">
                            <h4>Trịnh Việt Hoàng</h4>
                            <p className="member-title">CTO</p>
                            <p className="member-desc">Technology expert with 12 years of experience</p>
                        </div>
                        <div className="team-member">
                            <h4>Trịnh Việt Hoàng</h4>
                            <p className="member-title">COO</p>
                            <p className="member-desc">Operations and logistics expert</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partners */}
            <div className="partners-section">
                <div className="partners-container">
                    <h2>Đối Tác Chiến Lược</h2>
                    <p className="partners-subtitle">Chúng tôi tự hào là đối tác chính thức của các thương hiệu hàng đầu</p>
                    <div className="partners-grid">
                        <div className="partner-logo">Nike</div>
                        <div className="partner-logo">Adidas</div>
                        <div className="partner-logo">Puma</div>
                        <div className="partner-logo">Asics</div>
                        <div className="partner-logo">Vans</div>
                        <div className="partner-logo">Converse</div>
                        <div className="partner-logo">New Balance</div>
                        <div className="partner-logo">Under Armour</div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <div className="about-products">
                    <div className="products-container">
                        <h2>Sản Phẩm Nổi Bật</h2>
                        <div className="products-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px',
                            marginTop: '30px'
                        }}>
                            {featuredProducts.map(product => (
                                <Link 
                                    key={product._id} 
                                    to={`/product/${product._id}`}
                                    style={{
                                        textDecoration: 'none',
                                        padding: '20px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s',
                                        backgroundColor: 'white'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '200px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '60px',
                                        marginBottom: '15px'
                                    }}>
                                        👟
                                    </div>
                                    <h4 style={{ color: '#333', marginBottom: '10px', fontSize: '16px' }}>
                                        {product.name}
                                    </h4>
                                    <p style={{ 
                                        color: '#e74c3c', 
                                        fontWeight: 'bold',
                                        fontSize: '18px',
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

            {/* CTA */}
            <div className="about-cta">
                <div className="cta-content">
                    <h2>Ready to shop with us?</h2>
                    <p>Discover hundreds of genuine laptop models at the best prices</p>
                    <div className="cta-actions">
                        <Link to="/" className="cta-btn primary">
                            🛍️ View Products
                        </Link>
                        <Link to="/contact" className="cta-btn secondary">
                            📧 Contact Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
