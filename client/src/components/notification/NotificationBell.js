import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import AuthContext from '../../context/AuthContext';
import './NotificationBell.css';

const NotificationBell = () => {
    // eslint-disable-next-line no-unused-vars
    const [notifications] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [unreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [loading] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        // TODO: Implement notification API endpoint
        // try {
        //     const response = await axios.get('/notifications/unread-count');
        //     setUnreadCount(response.data.unreadCount || 0);
        // } catch (error) {
        //     console.error('Error fetching unread count:', error);
        // }
    };

    const fetchRecentNotifications = async () => {
        // TODO: Implement notification API endpoint
        // try {
        //     setLoading(true);
        //     const response = await axios.get('/notifications/my-notifications', {
        //         params: { limit: 5, status: 'unread' }
        //     });
        //     const notifs = response.data.notifications || response.data;
        //     setNotifications(Array.isArray(notifs) ? notifs : []);
        // } catch (error) {
        //     console.error('Error fetching notifications:', error);
        // } finally {
        //     setLoading(false);
        // }
    };

    const handleBellClick = async () => {
        if (!showDropdown) {
            await fetchRecentNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read
            await axios.post(`/notifications/${notification._id}/read`);
            
            // Navigate to related page
            if (notification.actionUrl) {
                navigate(notification.actionUrl);
            } else if (notification.relatedOrder) {
                navigate(`/orders/${notification.relatedOrder}`);
            }
            
            setShowDropdown(false);
            fetchUnreadCount();
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            // Customer notifications
            'order_confirmed': '✅',
            'order_processing': '⚙️',
            'order_shipped': '🚚',
            'order_delivered': '📦',
            'order_cancelled': '❌',
            'price_drop': '🔥',
            'back_in_stock': '✨',
            'warranty_expiring': '⚠️',
            'voucher_received': '🎁',
            'payment_confirmed': '💳',
            'system_announcement': '📢',
            'new_promotion': '🎉',
            
            // Staff notifications (admin/partner)
            'new_order': '🛒',
            'order_status_update': '🔄',
            'low_stock': '⚠️',
            'customer_review': '⭐',
            'support_ticket': '🎫'
        };
        return icons[type] || '🔔';
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const created = new Date(date);
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        return `${diffDays} days ago`;
    };

    if (!user) return null;

    return (
        <div className="notification-bell-wrapper" ref={dropdownRef}>
            <button 
                className="notification-bell-btn"
                onClick={handleBellClick}
                aria-label="Notifications"
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <Link 
                            to="/profile?tab=notifications" 
                            className="view-all-link"
                            onClick={() => setShowDropdown(false)}
                        >
                            Xem tất cả
                        </Link>
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">
                                <div className="spinner-small"></div>
                                <p>Đang tải...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`notification-item ${notif.status === 'unread' ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <div className="notif-icon">
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                    <div className="notif-content">
                                        <h4>{notif.title}</h4>
                                        <p>{notif.message}</p>
                                        <span className="notif-time">{getTimeAgo(notif.createdAt)}</span>
                                    </div>
                                    {notif.status === 'unread' && (
                                        <div className="unread-dot"></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="notification-empty">
                                <span className="empty-icon">🔕</span>
                                <p>No new notifications</p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <Link 
                                to="/profile?tab=notifications" 
                                className="view-all-btn"
                                onClick={() => setShowDropdown(false)}
                            >
                                View all notifications →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
