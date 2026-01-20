import React from 'react';
import { Link } from 'react-router-dom';
import './BlogPage.css';

const BlogPage = () => {
    const blogPosts = [
        {
            id: 1,
            title: "Top 10 Giày Sneaker Hot Nhất 2025",
            excerpt: "Điểm danh những mẫu sneaker được săn đón nhiều nhất năm nay với thiết kế độc đáo và chất lượng vượt trội...",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
            author: "Sneaker Expert",
            date: "20 Tháng 1, 2026",
            category: "Review",
            readTime: "5 phút đọc"
        },
        {
            id: 2,
            title: "Hướng Dẫn Chọn Giày Chạy Bộ Phù Hợp",
            excerpt: "Những tiêu chí quan trọng khi lựa chọn giày chạy bộ: đế giày, chất liệu, độ êm ái... để bảo vệ đôi chân của bạn...",
            image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600",
            author: "Running Coach",
            date: "18 Tháng 1, 2026",
            category: "Hướng dẫn",
            readTime: "8 phút đọc"
        },
        {
            id: 3,
            title: "So Sánh: Nike Air Max vs Adidas Ultraboost",
            excerpt: "Phân tích chi tiết sự khác biệt giữa hai dòng giày iconic nhất, giúp bạn đưa ra quyết định đúng đắn...",
            image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600",
            author: "Sneaker Insider",
            date: "15 Tháng 1, 2026",
            category: "So sánh",
            readTime: "10 phút đọc"
        },
        {
            id: 4,
            title: "5 Mẹo Bảo Quản Giày Sneaker Lâu Bền",
            excerpt: "Cách vệ sinh và bảo quản giày đúng cách để đôi giày luôn sạch đẹp và bền lâu như mới...",
            image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600",
            author: "Care Tips",
            date: "12 Tháng 1, 2026",
            category: "Tips & Tricks",
            readTime: "4 phút đọc"
        },
        {
            id: 5,
            title: "Xu Hướng Giày 2026: Sustainable & Tech",
            excerpt: "Khám phá những xu hướng giày mới nhất với công nghệ thân thiện môi trường và vật liệu tái chế...",
            image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600",
            author: "Fashion Trends",
            date: "8 Tháng 1, 2026",
            category: "Tin tức",
            readTime: "7 phút đọc"
        },
        {
            id: 6,
            title: "Giày Cho Người Mới: Lựa Chọn Thông Minh",
            excerpt: "Gợi ý các dòng giày phù hợp cho người mới bắt đầu về cả phong cách và giá cả...",
            image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
            author: "Beginner Guide",
            date: "5 Tháng 1, 2026",
            category: "Hướng dẫn",
            readTime: "6 phút đọc"
        }
    ];

    const categories = ["Tất cả", "Review", "Hướng dẫn", "So sánh", "Tin tức", "Tips & Tricks"];

    return (
        <div className="blog-page">
            {/* Hero Section */}
            <div className="blog-hero">
                <div className="blog-hero-content">
                    <h1 className="blog-title">� Tin Tức & Đánh Giá</h1>
                    <p className="blog-subtitle">
                        Tin tức thời trang giày mới nhất, đánh giá chi tiết và hướng dẫn chọn giày
                    </p>
                </div>
            </div>

            {/* Featured Post */}
            <div className="featured-section">
                <div className="featured-container">
                    <div className="featured-badge">✨ Nổi bật</div>
                    <div className="featured-post">
                        <div className="featured-image">
                            <img src={blogPosts[0].image} alt={blogPosts[0].title} />
                        </div>
                        <div className="featured-content">
                            <span className="featured-category">{blogPosts[0].category}</span>
                            <h2 className="featured-title">{blogPosts[0].title}</h2>
                            <p className="featured-excerpt">{blogPosts[0].excerpt}</p>
                            <div className="featured-meta">
                                <span className="meta-item">👤 {blogPosts[0].author}</span>
                                <span className="meta-item">📅 {blogPosts[0].date}</span>
                                <span className="meta-item">⏱️ {blogPosts[0].readTime}</span>
                            </div>
                            <button 
                                className="read-more-btn"
                                onClick={() => window.location.href = `/blog/${blogPosts[0].id}`}
                                style={{cursor: 'pointer'}}
                            >
                                Đọc thêm →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Filter */}
            <div className="categories-section">
                <div className="categories-container">
                    <h3 className="categories-title">Danh mục</h3>
                    <div className="categories-list">
                        {categories.map((category, index) => (
                            <button 
                                key={index} 
                                className={`category-btn ${index === 0 ? 'active' : ''}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="blog-content">
                <div className="blog-container">
                    <div className="posts-grid">
                        {blogPosts.slice(1).map(post => (
                            <article key={post.id} className="blog-card">
                                <div className="blog-card-image">
                                    <img src={post.image} alt={post.title} />
                                    <span className="blog-card-category">{post.category}</span>
                                </div>
                                <div className="blog-card-content">
                                    <h3 className="blog-card-title">{post.title}</h3>
                                    <p className="blog-card-excerpt">{post.excerpt}</p>
                                    <div className="blog-card-meta">
                                        <div className="meta-info">
                                            <span className="meta-item">👤 {post.author}</span>
                                            <span className="meta-item">📅 {post.date}</span>
                                        </div>
                                        <span className="read-time">{post.readTime}</span>
                                    </div>
                                    <button 
                                        className="blog-card-btn"
                                        onClick={() => window.location.href = `/blog/${post.id}`}
                                        style={{cursor: 'pointer'}}
                                    >
                                        Đọc ngay →
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <aside className="blog-sidebar">
                        {/* Newsletter */}
                        <div className="sidebar-widget newsletter-widget">
                            <h4 className="widget-title">📬 Subscribe to newsletter</h4>
                            <p className="widget-text">Get notifications about latest articles</p>
                            <form className="newsletter-form">
                                <input 
                                    type="email" 
                                    placeholder="Email của bạn"
                                    className="newsletter-input"
                                />
                                <button type="submit" className="newsletter-btn">
                                    Đăng ký
                                </button>
                            </form>
                        </div>

                        {/* Popular Posts */}
                        <div className="sidebar-widget popular-widget">
                            <h4 className="widget-title">🔥 Bài viết hot</h4>
                            <div className="popular-posts">
                                {blogPosts.slice(0, 4).map(post => (
                                    <div key={post.id} className="popular-post-item">
                                        <img src={post.image} alt={post.title} />
                                        <div className="popular-post-info">
                                            <h5>{post.title}</h5>
                                            <span className="popular-post-date">{post.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="sidebar-widget tags-widget">
                            <h4 className="widget-title">🏷️ Tags phổ biến</h4>
                            <div className="tags-list">
                                <span className="tag">Nike</span>
                                <span className="tag">Adidas</span>
                                <span className="tag">Sneakers</span>
                                <span className="tag">Running Shoes</span>
                                <span className="tag">Basketball</span>
                                <span className="tag">Vans</span>
                                <span className="tag">Converse</span>
                                <span className="tag">Limited Edition</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* CTA Section */}
            <div className="blog-cta">
                <div className="cta-content">
                    <h2>Bạn cần tư vấn chọn giày?</h2>
                    <p>Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn 24/7</p>
                    <div className="cta-actions">
                        <Link to="/" className="cta-btn primary">
                            🛍️ Xem sản phẩm
                        </Link>
                        <a href="tel:0848565650" className="cta-btn secondary">
                            📞 Gọi ngay: 084.856.5650
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
