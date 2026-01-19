import React from 'react';
import '../styles/PolicyPage.css';

const WarrantyPolicyPage = () => {
    return (
        <div className="policy-page">
            <div className="policy-container">
                <div className="policy-hero warranty">
                    <h1>🛡️ Chính Sách Bảo Hành</h1>
                    <p>Bảo hành chính hãng - Uy tín - Chu đáo</p>
                </div>

                <div className="policy-content">
                    <section className="policy-section">
                        <h2>📋 Điều Kiện Bảo Hành</h2>
                        <div className="info-box">
                            <ul>
                                <li>Sản phẩm còn trong thời hạn bảo hành (12-36 tháng tùy sản phẩm)</li>
                                <li>Có tem bảo hành nguyên vẹn, chưa bị rách hoặc tẩy xóa</li>
                                <li>Có hóa đơn mua hàng hoặc phiếu bảo hành</li>
                                <li>Lỗi do nhà sản xuất (không do người dùng)</li>
                            </ul>
                        </div>
                    </section>

                    <section className="policy-section">
                        <h2>⏰ Thời Gian Bảo Hành</h2>
                        <div className="warranty-table">
                            <div className="warranty-item">
                                <span className="warranty-period">6 tháng</span>
                                <span className="warranty-desc">Giày thể thao, giày casual</span>
                            </div>
                            <div className="warranty-item">
                                <span className="warranty-period">12 tháng</span>
                                <span className="warranty-desc">Giày chạy bộ, giày cao cấp</span>
                            </div>
                            <div className="warranty-item">
                                <span className="warranty-period">24 tháng</span>
                                <span className="warranty-desc">Giày da, giày formal cao cấp</span>
                            </div>
                        </div>
                    </section>

                    <section className="policy-section">
                        <h2>🔧 Quy Trình Bảo Hành</h2>
                        <div className="process-steps">
                            <div className="process-step">
                                <span className="step-number">1</span>
                                <h4>Liên hệ hỗ trợ</h4>
                                <p>Gọi hotline <strong>084.686.5650</strong> hoặc đến cửa hàng</p>
                            </div>
                            <div className="process-step">
                                <span className="step-number">2</span>
                                <h4>Kiểm tra sản phẩm</h4>
                                <p>Kỹ thuật viên kiểm tra tình trạng và xác định lỗi</p>
                            </div>
                            <div className="process-step">
                                <span className="step-number">3</span>
                                <h4>Sửa chữa</h4>
                                <p>Thời gian 3-7 ngày (cấp đổi máy tạm dùng nếu lâu hơn)</p>
                            </div>
                            <div className="process-step">
                                <span className="step-number">4</span>
                                <h4>Nhận máy</h4>
                                <p>Kiểm tra máy đã được sửa chữa và nhận lại</p>
                            </div>
                        </div>
                    </section>

                    <section className="policy-section">
                        <h2>⚠️ Trường Hợp Không Bảo Hành</h2>
                        <div className="warning-box">
                            <ul>
                                <li>Máy bị rơi, va đập, vào nước, cháy nổ</li>
                                <li>Tự ý mở máy, sửa chữa tại nơi không uy tín</li>
                                <li>Tem bảo hành bị rách, mờ hoặc tẩy xóa</li>
                                <li>Hết thời hạn bảo hành</li>
                                <li>Lỗi do phần mềm, virus</li>
                                <li>Các lỗi do người dùng</li>
                            </ul>
                        </div>
                    </section>

                    <section className="policy-section">
                        <h2>💡 Lưu Ý Quan Trọng</h2>
                        <div className="tips-grid-policy">
                            <div className="tip-card-policy">
                                <span className="tip-icon-policy">📝</span>
                                <h4>Giữ hóa đơn</h4>
                                <p>Lưu giữ hóa đơn mua hàng và phiếu bảo hành cẩn thận</p>
                            </div>
                            <div className="tip-card-policy">
                                <span className="tip-icon-policy">🏷️</span>
                                <h4>Bảo vệ tem</h4>
                                <p>Không bóc, rách tem bảo hành trên máy</p>
                            </div>
                            <div className="tip-card-policy">
                                <span className="tip-icon-policy">⚡</span>
                                <h4>Sử dụng đúng cách</h4>
                                <p>Tuân thủ hướng dẫn sử dụng từ nhà sản xuất</p>
                            </div>
                            <div className="tip-card-policy">
                                <span className="tip-icon-policy">📞</span>
                                <h4>Liên hệ sớm</h4>
                                <p>Phát hiện lỗi nên liên hệ ngay để được hỗ trợ kịp thời</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="policy-cta">
                    <h2>Cần hỗ trợ bảo hành?</h2>
                    <p>Đội ngũ kỹ thuật chuyên nghiệp luôn sẵn sàng</p>
                    <a href="tel:0846865650" className="cta-btn-primary">
                        📞 Hotline: 084.686.5650
                    </a>
                </div>
            </div>
        </div>
    );
};

export default WarrantyPolicyPage;
