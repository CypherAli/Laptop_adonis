import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="main-footer">
            <div className="footer-content">
                {/* Company Info */}
                <div className="footer-section">
                    <h3 className="footer-title">
                        Shoe Store
                    </h3>
                    <p className="footer-description">
                        Vietnam's leading trusted shoe retail system. 
                        Specializing in genuine shoes at the best market prices.
                    </p>
                    <div className="footer-contact">
                        <p><strong>Address:</strong> Hanoi, Vietnam</p>
                        <p><strong>Hotline:</strong> <a href="tel:0846865650">084.686.5650</a></p>
                        <p><strong>Email:</strong> <a href="mailto:trinhviethoangawm@gmail.com">trinhviethoangawm@gmail.com</a></p>
                        <p><strong>Business hours:</strong> 8:00 - 21:00 (Every day)</p>
                    </div>
                </div>

                {/* Customer Support */}
                <div className="footer-section">
                    <h4 className="footer-section-title">Customer Support</h4>
                    <ul className="footer-links">
                        <li><Link to="/huong-dan-mua-hang">Shopping Guide</Link></li>
                        <li><Link to="/huong-dan-thanh-toan">Payment Guide</Link></li>
                        <li><Link to="/chinh-sach-bao-hanh">Warranty Policy</Link></li>
                        <li><Link to="/chinh-sach-doi-tra">Return Policy</Link></li>
                        <li><Link to="/chinh-sach-van-chuyen">Shipping Policy</Link></li>
                        <li><Link to="/tra-gop">0% Installment Guide</Link></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div className="footer-section">
                    <h4 className="footer-section-title">About Us</h4>
                    <ul className="footer-links">
                        <li><Link to="/gioi-thieu">Company Introduction</Link></li>
                        <li><Link to="/lien-he">Contact</Link></li>
                        <li><Link to="/tuyen-dung">Careers</Link></li>
                        <li><Link to="/tin-tuc">News & Events</Link></li>
                        <li><Link to="/he-thong-cua-hang">Store System</Link></li>
                        <li><Link to="/dieu-khoan">Terms of Use</Link></li>
                    </ul>
                </div>

                {/* Payment & Social */}
                <div className="footer-section">
                    <h4 className="footer-section-title">Payment Methods</h4>
                    <div className="payment-methods">
                        <div className="payment-icon">Visa</div>
                        <div className="payment-icon">MasterCard</div>
                        <div className="payment-icon">ATM</div>
                        <div className="payment-icon">MoMo</div>
                        <div className="payment-icon">ZaloPay</div>
                        <div className="payment-icon">COD</div>
                    </div>

                    <h4 className="footer-section-title" style={{marginTop: '25px'}}>Subscribe to Newsletter</h4>
                    <form className="newsletter-form">
                        <input 
                            type="email" 
                            placeholder="Your email" 
                            className="newsletter-input"
                        />
                        <button type="submit" className="newsletter-btn">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p className="copyright">
                        © 2025 Shoe Store. All rights reserved. | Designed with love
                    </p>
                    <div className="footer-certifications">
                        <span className="cert-badge">Registered with Ministry of Industry and Trade</span>
                        <span className="cert-badge">DMCA Protected</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
