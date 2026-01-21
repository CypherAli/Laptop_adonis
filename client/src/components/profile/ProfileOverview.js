import React from 'react';
import './ProfileTabs.css';

const ProfileOverview = ({ userData, onRefresh }) => {
    if (!userData) return <div className="tab-loading">Loading...</div>;

    const stats = userData.stats || {};
    const loyalty = userData.loyaltyPoints || {};

    return (
        <div className="profile-overview">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.totalOrders || 0}</h3>
                        <p>Orders</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{(stats.totalSpent || 0).toLocaleString()}₫</h3>
                        <p>Tổng chi tiêu</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.totalReviews || 0}</h3>
                        <p>Đánh giá</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{loyalty.available || 0}</h3>
                        <p>Điểm hiện tại</p>
                    </div>
                </div>
            </div>

            <div className="overview-sections">
                <div className="section-card">
                    <h3>Account Information</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="label">Họ tên:</span>
                            <span className="value">{userData.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Email:</span>
                            <span className="value">{userData.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Số điện thoại:</span>
                            <span className="value">{userData.phone || 'Not updated'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Hạng thành viên:</span>
                            <span className={`badge badge-${userData.membershipTier}`}>
                                {(userData.membershipTier || 'bronze').toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <h3>Điểm tích lũy</h3>
                    <div className="loyalty-details">
                        <div className="loyalty-item">
                            <span>Tổng điểm:</span>
                            <strong>{loyalty.total || 0}</strong>
                        </div>
                        <div className="loyalty-item">
                            <span>Điểm khả dụng:</span>
                            <strong>{loyalty.available || 0}</strong>
                        </div>
                        <div className="loyalty-item">
                            <span>Đã sử dụng:</span>
                            <strong>{loyalty.used || 0}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview;
