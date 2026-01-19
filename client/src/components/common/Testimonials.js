import React, { useState, useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const testimonials = [
        {
            id: 1,
            name: 'Trịnh Việt Hoàng',
            role: 'Software Engineer',
            rating: 5,
            comment: 'Nike Air Jordan 1 chất lượng tuyệt vời! Đế êm, form đẹp, phối đồ dễ dàng. Nhân viên tư vấn nhiệt tình, giao hàng nhanh chóng. Rất hài lòng!',
            product: 'Nike Air Jordan 1',
            date: '2 tuần trước'
        },
        {
            id: 2,
            name: 'Nguyễn Minh Anh',
            role: 'Graphic Designer',
            rating: 5,
            comment: 'Adidas Ultraboost mua ở đây cực kỳ êm chân! Chạy bộ hàng ngày rất thoải mái, thiết kế đẹp, nhẹ nhàng. Đội ngũ hỗ trợ nhiệt tình!',
            product: 'Adidas Ultraboost',
            date: '3 tuần trước'
        },
        {
            id: 3,
            name: 'Lê Hoàng Nam',
            role: 'Student',
            rating: 5,
            comment: 'Converse Chuck Taylor classic, phong cách đơn giản mà đẹp. Giá cả phải chăng, phù hợp với sinh viên. Bảo hành tốt, hỗ trợ nhanh!',
            product: 'Converse Chuck Taylor',
            date: '1 tháng trước'
        },
        {
            id: 4,
            name: 'Phạm Thu Hà',
            role: 'Content Creator',
            rating: 5,
            comment: 'Puma RS-X mua về quay content rất hợp, màu sắc bắt mắt, đi cả ngày không mỏi. Nhân viên giải thích kỹ từng chi tiết. Trải nghiệm mua sắm tuyệt vời!',
            product: 'Puma RS-X',
            date: '1 tháng trước'
        },
        {
            id: 5,
            name: 'Đỗ Văn Khánh',
            role: 'Entrepreneur',
            rating: 5,
            comment: 'Vans Old Skool dùng cho công việc và dạo phố rất bền. Đế cao su chống trượt tốt, thoáng khí. Cửa hàng uy tín, sản phẩm 100% chính hãng!',
            product: 'Vans Old Skool',
            date: '5 tuần trước'
        },
        {
            id: 6,
            name: 'Hoàng Thị Lan',
            role: 'Marketing Manager',
            rating: 5,
            comment: 'New Balance 574 mỏng nhẹ, thiết kế thanh lịch, đi làm rất tiện. Hiệu năng ổn định cho hoạt động hàng ngày. Giao hàng nhanh, đóng gói cẩn thận!',
            product: 'New Balance 574',
            date: '6 tuần trước'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    const handleDotClick = (index) => {
        setActiveIndex(index);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <h2 className="testimonials-title">
                        What Our Customers Say
                    </h2>
                    <p className="testimonials-subtitle">
                        Hơn 10,000+ khách hàng đã tin tưởng và lựa chọn chúng tôi
                    </p>
                    <div className="overall-rating">
                        <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                        <div className="rating-score">4.8/5</div>
                        <div className="rating-count">(2,547 reviews)</div>
                    </div>
                </div>

                <div className="testimonials-carousel">
                    <button className="carousel-btn prev-btn" onClick={handlePrev}>
                        ‹
                    </button>

                    <div className="testimonials-wrapper">
                        {testimonials.map((testimonial, index) => (
                            <div 
                                key={testimonial.id}
                                className={`testimonial-card ${index === activeIndex ? 'active' : ''} ${
                                    index === (activeIndex - 1 + testimonials.length) % testimonials.length ? 'prev' : ''
                                } ${
                                    index === (activeIndex + 1) % testimonials.length ? 'next' : ''
                                }`}
                            >
                                <div className="testimonial-header">
                                    <div className="testimonial-avatar">{testimonial.avatar}</div>
                                    <div className="testimonial-author">
                                        <h4>{testimonial.name}</h4>
                                        <p>{testimonial.role}</p>
                                    </div>
                                    <div className="testimonial-rating">
                                        {'⭐'.repeat(testimonial.rating)}
                                    </div>
                                </div>
                                <div className="testimonial-body">
                                    <p className="testimonial-comment">"{testimonial.comment}"</p>
                                    <div className="testimonial-meta">
                                        <span className="product-bought">{testimonial.product}</span>
                                        <span className="review-date">{testimonial.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="carousel-btn next-btn" onClick={handleNext}>
                        ›
                    </button>
                </div>

                <div className="carousel-dots">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => handleDotClick(index)}
                        />
                    ))}
                </div>

                <div className="trust-badges">
                    <div className="trust-badge">
                        <span className="badge-text">Top #1 Shoe Store</span>
                    </div>
                    <div className="trust-badge">
                        <span className="badge-text">100% Genuine Products</span>
                    </div>
                    <div className="trust-badge">
                        <span className="badge-text">Free Shipping</span>
                    </div>
                    <div className="trust-badge">
                        <span className="badge-text">12-36 Months Warranty</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
