import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import './AuthPages.css'

/**
 * ============================================
 * AUTHENTICATION SYSTEM - REACT TEMPLATE
 * ============================================
 *
 * 5 CORE FUNCTIONS:
 * 1. register() - POST /api/auth/register - Đăng ký user mới
 * 2. login() - POST /api/auth/login - Đăng nhập + JWT token
 * 3. me() - GET /api/auth/me - Lấy thông tin user hiện tại
 * 4. updateProfile() - PUT /api/auth/profile - Cập nhật profile
 * 5. logout() - POST /api/auth/logout - Đăng xuất (clear token)
 *
 * ROLES:
 * - customer (default): Người mua hàng
 * - partner: Chủ shop (cần isApproved = true)
 * - admin: Quản trị viên (backend only)
 *
 * JWT TOKEN:
 * - Expires: 24h
 * - Payload: { id, role, username, email, isApproved }
 * - Storage: localStorage
 */

// ==================== LOGIN COMPONENT ====================
export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('Attempting login...')
    setLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Email và mật khẩu là bắt buộc')
        setLoading(false)
        return
      }

      const response = await axios.post('/api/auth/login', formData)
      const { token, user, message, warning } = response.data

      console.log('Login success:', user.username)

      // Save to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Show warning if partner not approved
      if (warning) {
        alert(warning)
      }

      // Redirect based on role
      if (user.role === 'partner') {
        navigate('/products/my')
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/products')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Lỗi khi đăng nhập')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Đăng Nhập</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="auth-links">
          <a href="/register">Chưa có tài khoản? Đăng ký</a>
        </div>
      </div>
    </div>
  )
}

// ==================== REGISTER COMPONENT ====================
export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    shopName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    console.log('Attempting registration...')
    setLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.username || !formData.email || !formData.password) {
        setError('Tên, email và mật khẩu là bắt buộc')
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp')
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự')
        setLoading(false)
        return
      }

      if (formData.role === 'partner' && !formData.shopName) {
        setError('Tên cửa hàng là bắt buộc cho tài khoản Partner')
        setLoading(false)
        return
      }

      const { confirmPassword, ...dataToSend } = formData
      const response = await axios.post('/api/auth/register', dataToSend)

      console.log('Registration success:', response.data.user.username)
      setSuccess(true)

      // Redirect to login after 2s
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.response?.data?.message || 'Lỗi khi đăng ký')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Đăng Ký</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Tên người dùng *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Nhập tên"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu * (ít nhất 6 ký tự)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Loại tài khoản</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              disabled={loading}
            >
              <option value="customer">Khách hàng (Người mua)</option>
              <option value="partner">Partner (Chủ shop)</option>
            </select>
          </div>

          {formData.role === 'partner' && (
            <div className="form-group">
              <label>Tên cửa hàng *</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                placeholder="Tên shop của bạn"
                disabled={loading}
              />
              <small className="help-text">
                Tài khoản Partner cần được admin phê duyệt trước khi có thể bán hàng
              </small>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="auth-links">
          <a href="/login">Đã có tài khoản? Đăng nhập</a>
        </div>
      </div>
    </div>
  )
}

// ==================== PROFILE COMPONENT ====================
export const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    shopName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Fetching user profile...')
      setLoading(true)

      try {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })

        const { user: userData, stats: userStats } = response.data
        console.log('Profile loaded:', userData.username)

        setUser(userData)
        setStats(userStats)
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          shopName: userData.shopName || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } catch (err) {
        console.error('Fetch profile error:', err)
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/login')
        } else {
          setError('Lỗi khi tải thông tin người dùng')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleUpdate = async (e) => {
    e.preventDefault()
    console.log('Updating profile...')
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validation
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('Mật khẩu mới không khớp')
        setLoading(false)
        return
      }

      if (formData.newPassword && !formData.currentPassword) {
        setError('Vui lòng nhập mật khẩu hiện tại để thay đổi mật khẩu')
        setLoading(false)
        return
      }

      const dataToUpdate = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
      }

      if (user.role === 'partner') {
        dataToUpdate.shopName = formData.shopName
      }

      if (formData.currentPassword && formData.newPassword) {
        dataToUpdate.currentPassword = formData.currentPassword
        dataToUpdate.newPassword = formData.newPassword
      }

      const response = await axios.put('/api/auth/profile', dataToUpdate, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })

      console.log('Profile updated successfully')
      setSuccess(response.data.message)
      setEditMode(false)

      // Update localStorage
      const updatedUser = response.data.user
      const storedUser = JSON.parse(localStorage.getItem('user'))
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }))

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      console.error('Update profile error:', err)
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    console.log('Logging out...')
    localStorage.clear()
    navigate('/login')
  }

  if (loading && !user) {
    return <div className="profile-loading">Đang tải...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Hồ Sơ Cá Nhân</h1>
        <div className="profile-actions">
          {!editMode && (
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
              Chỉnh Sửa
            </button>
          )}
          <button className="btn btn-danger" onClick={handleLogout}>
            Đăng Xuất
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-content">
        <div className="profile-info">
          <h2>Thông Tin</h2>

          {!editMode ? (
            <div className="info-display">
              <div className="info-item">
                <label>Tên người dùng:</label>
                <span>{user.username}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Số điện thoại:</label>
                <span>{user.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <label>Vai trò:</label>
                <span className={`role-badge role-${user.role}`}>
                  {user.role === 'customer' && 'Khách hàng'}
                  {user.role === 'partner' && 'Chủ Shop'}
                  {user.role === 'admin' && 'Quản trị viên'}
                </span>
              </div>
              {user.role === 'partner' && (
                <>
                  <div className="info-item">
                    <label>Tên cửa hàng:</label>
                    <span>{user.shopName || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="info-item">
                    <label>Trạng thái phê duyệt:</label>
                    <span className={user.isApproved ? 'status-approved' : 'status-pending'}>
                      {user.isApproved ? 'Đã phê duyệt' : 'Chờ phê duyệt'}
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Tên người dùng</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0123456789"
                  disabled={loading}
                />
              </div>

              {user.role === 'partner' && (
                <div className="form-group">
                  <label>Tên cửa hàng</label>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    disabled={loading}
                  />
                </div>
              )}

              <h3>Đổi Mật Khẩu (Tùy chọn)</h3>

              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Nhập mật khẩu mới"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>

        {stats && (
          <div className="profile-stats">
            <h2>Thống Kê</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.totalOrders || 0}</div>
                <div className="stat-label">Tổng đơn hàng</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{(stats.totalSpent || 0).toLocaleString('vi-VN')}đ</div>
                <div className="stat-label">Tổng chi tiêu</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalReviews || 0}</div>
                <div className="stat-label">Đánh giá đã viết</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default { LoginPage, RegisterPage, ProfilePage }
