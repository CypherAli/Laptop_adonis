import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosConfig';
import './SettingsManagement.css';

export default function SettingsManagement() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('site');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/settings');
      setSettings(response.data || {});
    } catch (err) {
      setError('Không thể tải cài đặt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Validation
    if (!settings.siteName || !settings.siteName.trim()) {
      setError('Tên website không được để trống');
      setSaving(false);
      setActiveTab('site');
      return;
    }

    if (settings.siteName.length > 100) {
      setError('Tên website không được quá 100 ký tự');
      setSaving(false);
      setActiveTab('site');
      return;
    }

    if (settings.contactEmail && !isValidEmail(settings.contactEmail)) {
      setError('Email liên hệ không hợp lệ');
      setSaving(false);
      setActiveTab('site');
      return;
    }

    try {
      const response = await axios.put('/admin/settings', settings);
      setSettings(response.data.settings);
      setSuccess('Lưu cài đặt thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleReset = async () => {
    if (!window.confirm('Bạn có chắc muốn reset tất cả cài đặt về mặc định?')) return;

    try {
      const response = await axios.post('/admin/settings/reset');
      setSettings(response.data.settings);
      setSuccess('Đã reset cài đặt về mặc định');
    } catch (err) {
      setError('Không thể reset cài đặt');
    }
  };

  const updateField = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!settings) return <div className="loading">Không có dữ liệu</div>;

  return (
    <div className="settings-management">
      <div className="page-header">
        <h1>Cài đặt Hệ thống</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleReset}>
            Reset mặc định
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="settings-tabs">
        <button className={activeTab === 'site' ? 'active' : ''} onClick={() => setActiveTab('site')}>
          Thông tin Site
        </button>
        <button className={activeTab === 'order' ? 'active' : ''} onClick={() => setActiveTab('order')}>
          Đơn hàng & Vận chuyển
        </button>
        <button className={activeTab === 'email' ? 'active' : ''} onClick={() => setActiveTab('email')}>
          Email
        </button>
        <button className={activeTab === 'social' ? 'active' : ''} onClick={() => setActiveTab('social')}>
          Mạng xã hội & SEO
        </button>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        {activeTab === 'site' && (
          <div className="settings-section">
            <h2>Thông tin Website</h2>
            
            <div className="form-group">
              <label>Tên Website</label>
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={(e) => updateField('siteName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                value={settings.siteDescription || ''}
                onChange={(e) => updateField('siteDescription', e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Logo URL</label>
              <input
                type="url"
                value={settings.siteLogo || ''}
                onChange={(e) => updateField('siteLogo', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email liên hệ</label>
                <input
                  type="email"
                  value={settings.contactEmail || ''}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={settings.contactPhone || ''}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode || false}
                  onChange={(e) => updateField('maintenanceMode', e.target.checked)}
                />
                <span>Chế độ bảo trì (Maintenance Mode)</span>
              </label>
              {settings.maintenanceMode && (
                <textarea
                  value={settings.maintenanceMessage || ''}
                  onChange={(e) => updateField('maintenanceMessage', e.target.value)}
                  rows="2"
                  placeholder="Thông báo bảo trì..."
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'order' && (
          <div className="settings-section">
            <h2>Cài đặt Đơn hàng</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Giá trị đơn tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={settings.minOrderAmount || 0}
                  onChange={(e) => updateField('minOrderAmount', Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Giá trị đơn tối đa (VNĐ)</label>
                <input
                  type="number"
                  value={settings.maxOrderAmount || 100000000}
                  onChange={(e) => updateField('maxOrderAmount', Number(e.target.value))}
                />
              </div>
            </div>

            <h3>Vận chuyển</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Miễn phí ship từ (VNĐ)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold || 500000}
                  onChange={(e) => updateField('freeShippingThreshold', Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Phí ship mặc định (VNĐ)</label>
                <input
                  type="number"
                  value={settings.defaultShippingFee || 30000}
                  onChange={(e) => updateField('defaultShippingFee', Number(e.target.value))}
                />
              </div>
            </div>

            <h3>Thanh toán</h3>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.codEnabled || false}
                  onChange={(e) => updateField('codEnabled', e.target.checked)}
                />
                <span>Cho phép COD (Thanh toán khi nhận hàng)</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={settings.bankTransferEnabled || false}
                  onChange={(e) => updateField('bankTransferEnabled', e.target.checked)}
                />
                <span>Cho phép chuyển khoản ngân hàng</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="settings-section">
            <h2>Cài đặt Email</h2>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications || false}
                  onChange={(e) => updateField('emailNotifications', e.target.checked)}
                />
                <span>Bật thông báo Email</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={settings.orderConfirmationEmail || false}
                  onChange={(e) => updateField('orderConfirmationEmail', e.target.checked)}
                />
                <span>Gửi email xác nhận đơn hàng</span>
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tên người gửi</label>
                <input
                  type="text"
                  value={settings.emailFromName || ''}
                  onChange={(e) => updateField('emailFromName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email người gửi</label>
                <input
                  type="email"
                  value={settings.emailFromAddress || ''}
                  onChange={(e) => updateField('emailFromAddress', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="settings-section">
            <h2>Mạng xã hội</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Facebook URL</label>
                <input
                  type="url"
                  value={settings.facebookUrl || ''}
                  onChange={(e) => updateField('facebookUrl', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Instagram URL</label>
                <input
                  type="url"
                  value={settings.instagramUrl || ''}
                  onChange={(e) => updateField('instagramUrl', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Twitter URL</label>
                <input
                  type="url"
                  value={settings.twitterUrl || ''}
                  onChange={(e) => updateField('twitterUrl', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>YouTube URL</label>
                <input
                  type="url"
                  value={settings.youtubeUrl || ''}
                  onChange={(e) => updateField('youtubeUrl', e.target.value)}
                />
              </div>
            </div>

            <h2>SEO & Analytics</h2>
            
            <div className="form-group">
              <label>Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle || ''}
                onChange={(e) => updateField('metaTitle', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Meta Description</label>
              <textarea
                value={settings.metaDescription || ''}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Meta Keywords</label>
              <input
                type="text"
                value={settings.metaKeywords || ''}
                onChange={(e) => updateField('metaKeywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId || ''}
                  onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                  placeholder="UA-XXXXX-Y"
                />
              </div>

              <div className="form-group">
                <label>Facebook Pixel ID</label>
                <input
                  type="text"
                  value={settings.facebookPixelId || ''}
                  onChange={(e) => updateField('facebookPixelId', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
