import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { FiClock, FiUser, FiTag, FiTrendingUp, FiSearch } from 'react-icons/fi';
import './NewsPage.css';

const NewsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const res = await axios.get('/products', {
                    params: { limit: 4, inStock: true }
                });
                setRelatedProducts(res.data.products || []);
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };
        fetchRelatedProducts();
    }, []);

    const categories = [
        { id: 'all', name: 'Tất cả', icon: '📰' },
        { id: 'products', name: 'Sản phẩm mới', icon: '�' },
        { id: 'promotions', name: 'Khuyến mãi', icon: '🎁' },
        { id: 'events', name: 'Sự kiện', icon: '🎉' },
        { id: 'tips', name: 'Mẹo hay', icon: '💡' },
        { id: 'reviews', name: 'Đánh giá', icon: '⭐' }
    ];

    const newsArticles = [
        {
            id: 1,
            title: 'Nike Air Max 2025 - Công nghệ đệm khí thế hệ mới',
            excerpt: 'Nike vừa chính thức ra mắt dòng Air Max 2025 với công nghệ đệm khí Air Max hoàn toàn mới, thiết kế đột phá và màu sắc ấn tượng...',
            category: 'products',
            author: 'Nguyễn Văn A',
            date: '2026-01-15',
            image: '👟',
            tags: ['Nike', 'Air Max', 'Sneakers', 'Mới'],
            views: 1250
        },
        {
            id: 2,
            title: 'Black Friday 2026: Giảm đến 50% cho hàng ngàn đôi giày',
            excerpt: 'Chương trình Black Friday lớn nhất năm với ưu đãi cực sốc, giảm giá sập sàn cho Nike, Adidas, Puma và nhiều thương hiệu nổi tiếng...',
            category: 'promotions',
            author: 'Trần Thị B',
            date: '2026-01-12',
            image: '🎁',
            tags: ['Sale', 'Black Friday', 'Khuyến mãi'],
            views: 3420
        },
        {
            id: 3,
            title: 'Adidas Ultraboost 24: Đánh giá chi tiết công nghệ Boost mới nhất',
            excerpt: 'Cùng khám phá Ultraboost 24 của Adidas với công nghệ đệm Boost cải tiến, upper Primeknit+ thoáng khí và nhiều nâng cấp đáng chú ý...',
            category: 'reviews',
            author: 'Lê Văn C',
            date: '2026-01-10',
            image: '⭐',
            tags: ['Adidas', 'Ultraboost', 'Review', 'Boost'],
            views: 2100
        },
        {
            id: 4,
            title: '10 mẹo bảo quản giày để giữ form và màu sắc lâu dài',
            excerpt: 'Chia sẻ 10 mẹo hay giúp bạn bảo quản giày sneaker, giữ form đẹp, màu sắc tươi mới và kéo dài tuổi thọ sản phẩm...',
            category: 'tips',
            author: 'Phạm Thị D',
            date: '2026-01-08',
            image: '💡',
            tags: ['Tips', 'Bảo quản', 'Chăm sóc giày'],
            views: 890
        },
        {
            id: 5,
            title: 'Sự kiện Sneaker Fest 2026: Shoe Store trưng bày hơn 500 mẫu giày',
            excerpt: 'Shoe Store tham gia Sneaker Fest 2026 với không gian triển lãm hoành tráng, giới thiệu hơn 500 mẫu giày từ các thương hiệu nổi tiếng...',
            category: 'events',
            author: 'Hoàng Văn E',
            date: '2026-01-05',
            image: '🎉',
            tags: ['Event', 'Sneaker Fest', 'Triển lãm'],
            views: 670
        },
        {
            id: 6,
            title: 'Vans Old Skool: Biểu tượng thời trang đường phố bất hủ',
            excerpt: 'Old Skool - mẫu giày kinh điển của Vans với thiết kế sọc đặc trưng, chất liệu canvas bền bỉ và phong cách streetwear không bao giờ lỗi mốt...',
            category: 'products',
            author: 'Nguyễn Văn A',
            date: '2026-01-03',
            image: '👟',
            tags: ['Vans', 'Old Skool', 'Streetwear'],
            views: 1580
        }
    ];

    const filteredNews = newsArticles.filter(article => {
        const matchCategory = selectedCategory === 'all' || article.category === selectedCategory;
        const matchSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    const getCategoryName = (catId) => {
        return categories.find(c => c.id === catId)?.name || catId;
    };

    return (
        <div className="news-page">
            {/* Hero */}
            <motion.section 
                className="news-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="news-hero-content">
                    <motion.h1
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        📰 Tin Tức & Sự Kiện
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Cập nhật tin tức giày sneaker mới nhất, ưu đãi hấp dẫn và sự kiện đặc biệt
                    </motion.p>
                </div>
            </motion.section>

            {/* Filter Section */}
            <section className="news-filter">
                <div className="container">
                    {/* Search Bar */}
                    <motion.div 
                        className="news-search"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </motion.div>

                    {/* Categories */}
                    <div className="news-categories">
                        {categories.map((category, index) => (
                            <motion.button
                                key={category.id}
                                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="category-icon">{category.icon}</span>
                                {category.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* News Grid */}
            <section className="news-grid-section">
                <div className="container">
                    {filteredNews.length === 0 ? (
                        <div className="no-results">
                            <p>🔍 Không tìm thấy bài viết nào phù hợp</p>
                        </div>
                    ) : (
                        <div className="news-grid">
                            {filteredNews.map((article, index) => (
                                <motion.div
                                    key={article.id}
                                    className="news-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10 }}
                                >
                                    <div className="news-card-image">
                                        <div className="news-image-placeholder">
                                            {article.image}
                                        </div>
                                        <span className="news-category-badge">
                                            {getCategoryName(article.category)}
                                        </span>
                                    </div>

                                    <div className="news-card-content">
                                        <h3>{article.title}</h3>
                                        <p className="news-excerpt">{article.excerpt}</p>

                                        <div className="news-meta">
                                            <span><FiUser /> {article.author}</span>
                                            <span><FiClock /> {new Date(article.date).toLocaleDateString('vi-VN')}</span>
                                            <span><FiTrendingUp /> {article.views} lượt xem</span>
                                        </div>

                                        <div className="news-tags">
                                            {article.tags.map((tag, idx) => (
                                                <span key={idx} className="news-tag">
                                                    <FiTag /> {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <Link to={`/blog/${article.id}`} className="news-read-more">
                                            Đọc thêm →
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredNews.length > 0 && (
                        <div className="news-pagination">
                            <button className="pagination-btn">← Trước</button>
                            <span className="pagination-info">Trang 1 / 3</span>
                            <button className="pagination-btn">Sau →</button>
                        </div>
                    )}
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="news-products" style={{
                    padding: '60px 0',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div className="container">
                        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>
                            🛍️ Products You May Like
                        </h2>
                        <div className="products-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '25px',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }}>
                            {relatedProducts.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link 
                                        to={`/product/${product._id}`}
                                        style={{
                                            textDecoration: 'none',
                                            display: 'block',
                                            padding: '20px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s',
                                            backgroundColor: 'white'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
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
                                        <h4 style={{ 
                                            color: '#333', 
                                            marginBottom: '10px', 
                                            fontSize: '16px',
                                            fontWeight: '600'
                                        }}>
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
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default NewsPage;
