import React, { useState, useEffect } from 'react';
import './HeroBanner.css';

const HeroBanner = ({ onBrandClick }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const slides = [
        {
            title: 'Running Shoes',
            subtitle: 'Run Every Mile',
            description: 'Up to 30% Off - Latest Collections',
            cta: 'Shop Now',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
            color: '#e74c3c',
            backInfo: {
                brand: 'Nike',
                features: ['Air Max Technology', 'Breathable Mesh', 'Lightweight Design', 'Premium Cushioning'],
                warranty: '12 months',
                origin: 'USA'
            }
        },
        {
            title: 'Casual Shoes',
            subtitle: 'Step in Style',
            description: 'Comfortable & Trendy - All Day Wear',
            cta: 'Explore',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=500&fit=crop',
            color: '#3498db',
            backInfo: {
                brand: 'Adidas',
                features: ['Boost Technology', 'Comfortable Fit', 'Durable Outsole', 'Style & Performance'],
                warranty: '12 months',
                origin: 'Germany'
            }
        },
        {
            title: 'Hot Deals',
            subtitle: '0% Interest Installment',
            description: 'Free nationwide shipping',
            cta: 'View Now',
            image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=500&fit=crop',
            color: '#f39c12',
            backInfo: {
                brand: 'Puma',
                features: ['Sport Performance', 'Flexible Sole', 'Modern Design', 'All-Day Comfort'],
                warranty: '12 months',
                origin: 'Germany'
            }
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
            setIsFlipped(false); // Reset flip when slide changes
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const scrollToProducts = () => {
        const productsSection = document.querySelector('.homepage-container');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            {/* Hero Slider */}
            <section className="hero-banner">
                <div className="hero-slider">
                    {slides.map((slide, index) => (
                        <div 
                            key={index}
                            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ '--accent-color': slide.color }}
                        >
                            <div className="hero-content">
                                <span className="hero-tag">HOT DEAL</span>
                                <h1 className="hero-title">
                                    {slide.title}
                                </h1>
                                <h2 className="hero-subtitle">{slide.subtitle}</h2>
                                <p className="hero-description">{slide.description}</p>
                                <button className="hero-cta" onClick={scrollToProducts}>
                                    {slide.cta} →
                                </button>
                                
                                {/* Trust Badges */}
                                <div className="hero-badges">
                                    <div className="badge-item">
                                        <span className="badge-icon"></span>
                                        <div className="badge-text">
                                            <strong>4.8/5</strong>
                                            <small>15K+ reviews</small>
                                        </div>
                                    </div>
                                    <div className="badge-item">
                                        <span className="badge-icon"></span>
                                        <div className="badge-text">
                                            <strong>Top #1</strong>
                                            <small>Shoe Store</small>
                                        </div>
                                    </div>
                                    <div className="badge-item">
                                        <span className="badge-icon"></span>
                                        <div className="badge-text">
                                            <strong>100%</strong>
                                            <small>Authentic</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`hero-image-container ${isFlipped ? 'flipped' : ''}`}>
                                <div className="flip-card">
                                    {/* Front Side - Image */}
                                    <div className="flip-card-front" onClick={() => setIsFlipped(true)}>
                                        <img src={slide.image} alt={slide.title} />
                                        <div className="flip-hint">Click to see details</div>
                                    </div>
                                    
                                    {/* Back Side - Product Info */}
                                    <div className="flip-card-back" onClick={() => setIsFlipped(false)}>
                                        <div className="back-content">
                                            <div className="shop-header">
                                                <div className="shop-name">SHOE STORE</div>
                                                <div className="shop-tagline">PREMIUM QUALITY</div>
                                            </div>
                                            
                                            <div className="product-section">
                                                <div className="product-category">{slide.title}</div>
                                                <div className="divider"></div>
                                            </div>
                                            
                                            <div className="brand-section">
                                                <div className="brand-name">{slide.backInfo.brand}</div>
                                            </div>
                                            
                                            <div className="features-section">
                                                <div className="features-title">KEY FEATURES:</div>
                                                <ul className="features-list">
                                                    {slide.backInfo.features.map((feature, idx) => (
                                                        <li key={idx}>{feature}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            
                                            <div className="product-meta">
                                                <div className="meta-item">
                                                    <span className="meta-label">Warranty</span>
                                                    <span className="meta-value">{slide.backInfo.warranty}</span>
                                                </div>
                                                <div className="meta-divider"></div>
                                                <div className="meta-item">
                                                    <span className="meta-label">Origin</span>
                                                    <span className="meta-value">{slide.backInfo.origin}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flip-hint">Click to return</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Slider Navigation */}
                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </section>

            {/* Brand Showcase - Partners */}
            <section className="brand-showcase">
                <div className="brand-container">
                    <h3 className="brand-title">Partner</h3>
                    <div className="brand-logos">
                        <div 
                            className="brand-logo" 
                            onClick={() => onBrandClick && onBrandClick('Nike')}
                            title="Nike - Official Partner"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/300px-Logo_NIKE.svg.png" 
                                alt="Nike Logo"
                            />
                        </div>
                        <div 
                            className="brand-logo" 
                            onClick={() => onBrandClick && onBrandClick('Adidas')}
                            title="Adidas - Official Partner"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/300px-Adidas_Logo.svg.png" 
                                alt="Adidas Logo"
                            />
                        </div>
                        <div 
                            className="brand-logo" 
                            onClick={() => onBrandClick && onBrandClick('Puma')}
                            title="Puma - Official Partner"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/en/thumb/d/da/Puma_complete_logo.svg/300px-Puma_complete_logo.svg.png" 
                                alt="Puma Logo"
                            />
                        </div>
                        <div 
                            className="brand-logo" 
                            onClick={() => onBrandClick && onBrandClick('Converse')}
                            title="Converse - Official Partner"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Converse_logo.svg/300px-Converse_logo.svg.png" 
                                alt="Converse Logo"
                            />
                        </div>
                        <div 
                            className="brand-logo" 
                            onClick={() => onBrandClick && onBrandClick('Vans')}
                            title="Vans - Official Partner"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/300px-Vans-logo.svg.png" 
                                alt="Vans Logo"
                            />
                        </div>
                        <div 
                            className="brand-logo" 
                            onClick={() => onBrandClick && onBrandClick('New Balance')}
                            title="New Balance - Official Partner"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/300px-New_Balance_logo.svg.png" 
                                alt="New Balance Logo"
                            />
                        </div>
                        <div 
                            className="brand-logo" 
                            onClick={() => onBrandClick && onBrandClick('Apple')}
                            title="Apple - Official Partner"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png" 
                                alt="Apple Logo"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Highlights */}
            <section className="service-highlights">
                <div className="service-container">
                    <div className="service-item">
                        <span className="service-icon"></span>
                        <div className="service-text">
                            <strong>Free Shipping</strong>
                            <small>Nationwide from 10 million</small>
                        </div>
                    </div>
                    <div className="service-item">
                        <span className="service-icon"></span>
                        <div className="service-text">
                            <strong>15-day Return</strong>
                            <small>If manufacturer defect</small>
                        </div>
                    </div>
                    <div className="service-item">
                        <span className="service-icon"></span>
                        <div className="service-text">
                            <strong>Official Warranty</strong>
                            <small>12-24 months</small>
                        </div>
                    </div>
                    <div className="service-item">
                        <span className="service-icon"></span>
                        <div className="service-text">
                            <strong>0% Installment</strong>
                            <small>Quick approval in 30 min</small>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HeroBanner;
