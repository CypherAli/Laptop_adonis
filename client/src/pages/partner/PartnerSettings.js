import React, { useState, useEffect, useContext } from 'react'
import axios from '../../api/axiosConfig'
import AuthContext from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingBag,
  FiLock,
  FiCamera,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiBell,
  FiCreditCard,
  FiGlobe,
} from 'react-icons/fi'
import './PartnerSettings.css'

const PartnerSettings = () => {
  const { user, userDetails, updateUser } = useContext(AuthContext)
  const navigate = useNavigate()

  // Tabs
  const [activeTab, setActiveTab] = useState('profile')

  // Profile Settings
  const [profileData, setProfileData] = useState({
    shopName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    businessType: '',
    taxCode: '',
    bankAccount: '',
    bankName: '',
  })

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    promotionNotifications: false,
    systemNotifications: true,
  })

  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    autoApproveOrders: false,
    minOrderAmount: 0,
    freeShippingThreshold: 0,
    workingHours: {
      start: '08:00',
      end: '22:00',
    },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  useEffect(() => {
    if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
      navigate('/login')
      return
    }
    fetchPartnerSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate])

  const fetchPartnerSettings = async () => {
    try {
      const response = await axios.get('/partner/settings')
      const data = response.data

      setProfileData({
        shopName: data.shopName || '',
        email: data.email || user.email,
        phone: data.phone || '',
        address: data.address || '',
        description: data.description || '',
        businessType: data.businessType || 'individual',
        taxCode: data.taxCode || '',
        bankAccount: data.bankAccount || '',
        bankName: data.bankName || '',
      })

      setNotificationSettings(data.notificationSettings || notificationSettings)
      setStoreSettings(data.storeSettings || storeSettings)
      setAvatarPreview(data.avatar || userDetails?.avatar)
    } catch (err) {
      console.error('Error fetching settings:', err)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const formData = new FormData()

      Object.keys(profileData).forEach((key) => {
        formData.append(key, profileData[key])
      })

      if (avatar) {
        formData.append('avatar', avatar)
      }

      console.log('Sending profile update request...')
      const response = await axios.put('/partner/settings/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log('Profile update response:', response.data)
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
      
      // Update user details in context
      if (response.data.user) {
        updateUser(response.data.user)
        
        // Update local profileData state to reflect changes
        setProfileData({
          shopName: response.data.user.shopName || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          address: response.data.user.address || '',
          description: response.data.user.description || '',
          businessType: response.data.user.businessType || 'individual',
          taxCode: response.data.user.taxCode || '',
          bankAccount: response.data.user.bankAccount || '',
          bankName: response.data.user.bankName || '',
        })
        
        // Update avatar preview if changed
        if (response.data.user.avatar) {
          setAvatarPreview(response.data.user.avatar)
        }
      }
    } catch (err) {
      console.error('Profile update error:', err)
      console.error('Error response:', err.response)
      
      let errorMessage = 'Không thể cập nhật. Vui lòng thử lại.'
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || errorMessage
        console.error('Server error message:', err.response.data)
      } else if (err.request) {
        // Request was made but no response
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
        console.error('No response from server')
      } else {
        // Error in request setup
        console.error('Request setup error:', err.message)
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp!' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự!' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await axios.put('/partner/settings/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await axios.put('/partner/settings/notifications', notificationSettings)
      setMessage({ type: 'success', text: 'Cập nhật cài đặt thông báo thành công!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể cập nhật. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }

  const handleStoreSettingsUpdate = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await axios.put('/partner/settings/store', storeSettings)
      setMessage({ type: 'success', text: 'Cập nhật cài đặt cửa hàng thành công!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể cập nhật. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const tabs = [
    { id: 'profile', label: 'Thông tin cửa hàng', icon: <FiShoppingBag /> },
    { id: 'password', label: 'Đổi mật khẩu', icon: <FiLock /> },
    { id: 'notifications', label: 'Thông báo', icon: <FiBell /> },
    { id: 'store', label: 'Cài đặt cửa hàng', icon: <FiGlobe /> },
    { id: 'payment', label: 'Thanh toán', icon: <FiCreditCard /> },
  ]

  return (
    <div className="partner-settings">
      <div className="settings-header">
        <h1>Cài đặt Partner</h1>
        <p>Quản lý thông tin và cài đặt cửa hàng của bạn</p>
      </div>

      {message.text && (
        <div className={`settings-message ${message.type}`}>
          {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="settings-container">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Thông tin cửa hàng</h2>

              {/* Avatar Upload */}
              <div className="avatar-section">
                <div className="avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Shop Avatar" />
                  ) : (
                    <FiShoppingBag size={50} />
                  )}
                </div>
                <div className="avatar-upload">
                  <label htmlFor="avatar-input" className="avatar-btn">
                    <FiCamera /> Chọn ảnh đại diện
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <p>JPG, PNG. Tối đa 5MB</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FiShoppingBag /> Tên cửa hàng *
                    </label>
                    <input
                      type="text"
                      value={profileData.shopName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, shopName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiMail /> Email *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiPhone /> Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FiUser /> Loại hình kinh doanh
                    </label>
                    <select
                      value={profileData.businessType}
                      onChange={(e) =>
                        setProfileData({ ...profileData, businessType: e.target.value })
                      }
                    >
                      <option value="individual">Cá nhân</option>
                      <option value="company">Công ty</option>
                      <option value="enterprise">Doanh nghiệp</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FiMapPin /> Địa chỉ
                  </label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả cửa hàng</label>
                  <textarea
                    value={profileData.description}
                    onChange={(e) =>
                      setProfileData({ ...profileData, description: e.target.value })
                    }
                    rows={4}
                    placeholder="Giới thiệu về cửa hàng của bạn..."
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Mã số thuế</label>
                    <input
                      type="text"
                      value={profileData.taxCode}
                      onChange={(e) => setProfileData({ ...profileData, taxCode: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Số tài khoản</label>
                    <input
                      type="text"
                      value={profileData.bankAccount}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bankAccount: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Ngân hàng</label>
                    <input
                      type="text"
                      value={profileData.bankName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bankName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button type="submit" className="btn-save" disabled={loading}>
                  <FiSave /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <h2>Đổi mật khẩu</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>
                    <FiLock /> Mật khẩu hiện tại *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FiLock /> Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FiLock /> Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <button type="submit" className="btn-save" disabled={loading}>
                  <FiSave /> {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Cài đặt thông báo</h2>

              <div className="notification-settings">
                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Thông báo Email</h3>
                    <p>Nhận thông báo qua email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked,
                        })
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Thông báo đơn hàng</h3>
                    <p>Nhận thông báo khi có đơn hàng mới</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.orderNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          orderNotifications: e.target.checked,
                        })
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Thông báo khuyến mãi</h3>
                    <p>Nhận thông tin về các chương trình khuyến mãi</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.promotionNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          promotionNotifications: e.target.checked,
                        })
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Thông báo hệ thống</h3>
                    <p>Nhận thông báo về cập nhật hệ thống</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemNotifications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          systemNotifications: e.target.checked,
                        })
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <button onClick={handleNotificationUpdate} className="btn-save" disabled={loading}>
                <FiSave /> {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </div>
          )}

          {/* Store Settings Tab */}
          {activeTab === 'store' && (
            <div className="settings-section">
              <h2>Cài đặt cửa hàng</h2>

              <div className="store-settings">
                <div className="notification-item">
                  <div className="notification-info">
                    <h3>Tự động duyệt đơn hàng</h3>
                    <p>Đơn hàng sẽ được tự động xác nhận</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={storeSettings.autoApproveOrders}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, autoApproveOrders: e.target.checked })
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Đơn hàng tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={storeSettings.minOrderAmount}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, minOrderAmount: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Miễn phí ship từ (VND)</label>
                  <input
                    type="number"
                    value={storeSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, freeShippingThreshold: e.target.value })
                    }
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Giờ mở cửa</label>
                    <input
                      type="time"
                      value={storeSettings.workingHours.start}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          workingHours: { ...storeSettings.workingHours, start: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Giờ đóng cửa</label>
                    <input
                      type="time"
                      value={storeSettings.workingHours.end}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          workingHours: { ...storeSettings.workingHours, end: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ngày làm việc</label>
                  <div className="days-selector">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                      (day) => (
                        <label key={day} className="day-checkbox">
                          <input
                            type="checkbox"
                            checked={storeSettings.workingDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setStoreSettings({
                                  ...storeSettings,
                                  workingDays: [...storeSettings.workingDays, day],
                                })
                              } else {
                                setStoreSettings({
                                  ...storeSettings,
                                  workingDays: storeSettings.workingDays.filter((d) => d !== day),
                                })
                              }
                            }}
                          />
                          {day}
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              <button onClick={handleStoreSettingsUpdate} className="btn-save" disabled={loading}>
                <FiSave /> {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="settings-section">
              <h2>Thông tin thanh toán</h2>
              <div className="payment-info">
                <div className="info-card">
                  <FiCreditCard size={40} />
                  <h3>Thông tin thanh toán</h3>
                  <p>Cập nhật thông tin thanh toán của bạn ở mục Thông tin cửa hàng</p>
                </div>

                <div className="payment-details">
                  <div className="detail-item">
                    <label>Số tài khoản:</label>
                    <span>{profileData.bankAccount || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngân hàng:</label>
                    <span>{profileData.bankName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Mã số thuế:</label>
                    <span>{profileData.taxCode || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PartnerSettings
