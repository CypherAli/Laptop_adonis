/**
 * ==================== USER MANAGEMENT COMPONENT ====================
 *
 * PHÂN QUYỀN HỆ THỐNG:
 * - All logged-in users can manage their own addresses, payment methods, preferences
 * - Ownership-based: Users can only access their own data
 * - No admin override needed (personal data management)
 *
 * CORE FUNCTIONS:
 * 1. Addresses Management
 *    - getAddresses() - GET /api/users/addresses
 *    - addAddress() - POST /api/users/addresses
 *    - updateAddress() - PUT /api/users/addresses/:addressId
 *    - deleteAddress() - DELETE /api/users/addresses/:addressId
 *    - setDefaultAddress() - PUT /api/users/addresses/:addressId/set-default
 *
 * 2. Payment Methods Management
 *    - getPaymentMethods() - GET /api/users/payment-methods
 *    - addPaymentMethod() - POST /api/users/payment-methods
 *    - deletePaymentMethod() - DELETE /api/users/payment-methods/:methodId
 *
 * 3. Preferences Management
 *    - getPreferences() - GET /api/users/preferences
 *    - updatePreferences() - PUT /api/users/preferences
 *
 * BACKEND LOGIC NOTES:
 * - Addresses: Auto-unset other defaults when setting one as default
 * - Payment Methods: Support multiple types (card/bank/ewallet)
 * - Preferences: Notifications, language, currency settings
 * - All operations are user-scoped (userId from JWT token)
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './UserManagement.css'

export default function UserManagement() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('addresses') // addresses | payments | preferences
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Addresses state
  const [addresses, setAddresses] = useState([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    phone: '',
    address: '',
    isDefault: false,
  })

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    type: 'card', // card | bank | ewallet
    provider: '',
    lastFourDigits: '',
    accountName: '',
    expiryDate: '',
    isDefault: false,
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    language: 'vi',
    currency: 'VND',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    loadData()
  }, [activeTab, navigate])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      if (activeTab === 'addresses') {
        await fetchAddresses()
      } else if (activeTab === 'payments') {
        await fetchPaymentMethods()
      } else if (activeTab === 'preferences') {
        await fetchPreferences()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // ==================== ADDRESSES ====================

  const fetchAddresses = async () => {
    const response = await axios.get('/api/users/addresses')
    setAddresses(response.data.addresses || [])
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({
      label: '',
      fullName: '',
      phone: '',
      address: '',
      isDefault: false,
    })
    setShowAddressModal(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setAddressForm({
      label: address.label || '',
      fullName: address.fullName || '',
      phone: address.phone || '',
      address: address.address || '',
      isDefault: address.isDefault || false,
    })
    setShowAddressModal(true)
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingAddress) {
        await axios.put(`/api/users/addresses/${editingAddress._id}`, addressForm)
        setSuccess('Cập nhật địa chỉ thành công')
      } else {
        await axios.post('/api/users/addresses', addressForm)
        setSuccess('Thêm địa chỉ thành công')
      }
      setShowAddressModal(false)
      await fetchAddresses()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu địa chỉ')
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return

    try {
      await axios.delete(`/api/users/addresses/${addressId}`)
      setSuccess('Xóa địa chỉ thành công')
      await fetchAddresses()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa địa chỉ')
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await axios.put(`/api/users/addresses/${addressId}/set-default`)
      setSuccess('Đã đặt làm địa chỉ mặc định')
      await fetchAddresses()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đặt địa chỉ mặc định')
    }
  }

  // ==================== PAYMENT METHODS ====================

  const fetchPaymentMethods = async () => {
    const response = await axios.get('/api/users/payment-methods')
    setPaymentMethods(response.data.paymentMethods || [])
  }

  const handleAddPaymentMethod = () => {
    setPaymentForm({
      type: 'card',
      provider: '',
      lastFourDigits: '',
      accountName: '',
      expiryDate: '',
      isDefault: false,
    })
    setShowPaymentModal(true)
  }

  const handleSavePaymentMethod = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await axios.post('/api/users/payment-methods', paymentForm)
      setSuccess('Thêm phương thức thanh toán thành công')
      setShowPaymentModal(false)
      await fetchPaymentMethods()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu phương thức thanh toán')
    }
  }

  const handleDeletePaymentMethod = async (methodId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phương thức thanh toán này?')) return

    try {
      await axios.delete(`/api/users/payment-methods/${methodId}`)
      setSuccess('Xóa phương thức thanh toán thành công')
      await fetchPaymentMethods()
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa phương thức thanh toán')
    }
  }

  // ==================== PREFERENCES ====================

  const fetchPreferences = async () => {
    const response = await axios.get('/api/users/preferences')
    setPreferences(
      response.data.preferences || {
        notifications: { email: true, push: true, sms: false },
        language: 'vi',
        currency: 'VND',
      }
    )
  }

  const handleUpdatePreferences = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await axios.put('/api/users/preferences', preferences)
      setSuccess('Cập nhật cài đặt thành công')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật cài đặt')
    }
  }

  if (loading) {
    return <div className="user-loading">Đang tải...</div>
  }

  return (
    <div className="user-container">
      <div className="user-header">
        <h1>Quản Lý Tài Khoản</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="user-tabs">
        <button
          className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
          onClick={() => setActiveTab('addresses')}
        >
          Địa Chỉ
        </button>
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Phương Thức Thanh Toán
        </button>
        <button
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Cài Đặt
        </button>
      </div>

      {/* ==================== ADDRESSES TAB ==================== */}
      {activeTab === 'addresses' && (
        <div className="addresses-section">
          <div className="section-header">
            <h2>Địa Chỉ Giao Hàng</h2>
            <button className="btn btn-primary" onClick={handleAddAddress}>
              Thêm Địa Chỉ Mới
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có địa chỉ nào. Thêm địa chỉ mới để bắt đầu.</p>
            </div>
          ) : (
            <div className="addresses-grid">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`address-card ${address.isDefault ? 'default' : ''}`}
                >
                  {address.isDefault && <span className="default-badge">Mặc Định</span>}
                  <div className="address-label">{address.label}</div>
                  <div className="address-details">
                    <p className="address-name">{address.fullName}</p>
                    <p className="address-phone">{address.phone}</p>
                    <p className="address-text">{address.address}</p>
                  </div>
                  <div className="address-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditAddress(address)}
                    >
                      Chỉnh Sửa
                    </button>
                    {!address.isDefault && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSetDefaultAddress(address._id)}
                      >
                        Đặt Mặc Định
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteAddress(address._id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== PAYMENT METHODS TAB ==================== */}
      {activeTab === 'payments' && (
        <div className="payments-section">
          <div className="section-header">
            <h2>Phương Thức Thanh Toán</h2>
            <button className="btn btn-primary" onClick={handleAddPaymentMethod}>
              Thêm Phương Thức Mới
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có phương thức thanh toán nào. Thêm mới để thanh toán nhanh hơn.</p>
            </div>
          ) : (
            <div className="payments-grid">
              {paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className={`payment-card ${method.isDefault ? 'default' : ''}`}
                >
                  {method.isDefault && <span className="default-badge">Mặc Định</span>}
                  <div className="payment-type">
                    {method.type === 'card'
                      ? 'Thẻ'
                      : method.type === 'bank'
                        ? 'Ngân Hàng'
                        : 'Ví Điện Tử'}
                  </div>
                  <div className="payment-details">
                    <p className="payment-provider">{method.provider}</p>
                    {method.accountName && <p className="payment-account">{method.accountName}</p>}
                    {method.lastFourDigits && (
                      <p className="payment-number">**** {method.lastFourDigits}</p>
                    )}
                    {method.expiryDate && (
                      <p className="payment-expiry">Hết hạn: {method.expiryDate}</p>
                    )}
                  </div>
                  <div className="payment-actions">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeletePaymentMethod(method._id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== PREFERENCES TAB ==================== */}
      {activeTab === 'preferences' && (
        <div className="preferences-section">
          <h2>Cài Đặt Cá Nhân</h2>
          <form onSubmit={handleUpdatePreferences} className="preferences-form">
            <div className="form-section">
              <h3>Thông Báo</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.notifications?.email || false}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, email: e.target.checked },
                    })
                  }
                />
                <span>Nhận thông báo qua Email</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.notifications?.push || false}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, push: e.target.checked },
                    })
                  }
                />
                <span>Nhận thông báo đẩy (Push)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.notifications?.sms || false}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, sms: e.target.checked },
                    })
                  }
                />
                <span>Nhận thông báo qua SMS</span>
              </label>
            </div>

            <div className="form-section">
              <h3>Ngôn Ngữ</h3>
              <select
                value={preferences.language || 'vi'}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="form-control"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="form-section">
              <h3>Đơn Vị Tiền Tệ</h3>
              <select
                value={preferences.currency || 'VND'}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                className="form-control"
              >
                <option value="VND">VND (Việt Nam Đồng)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Lưu Cài Đặt
            </button>
          </form>
        </div>
      )}

      {/* ==================== ADDRESS MODAL ==================== */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}</h2>
            <form onSubmit={handleSaveAddress}>
              <div className="form-group">
                <label>Nhãn (Nhà Riêng, Văn Phòng...)</label>
                <input
                  type="text"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Họ Tên</label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Số Điện Thoại</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa Chỉ Đầy Đủ</label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="form-control"
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, isDefault: e.target.checked })
                    }
                  />
                  <span>Đặt làm địa chỉ mặc định</span>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddressModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PAYMENT METHOD MODAL ==================== */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm Phương Thức Thanh Toán</h2>
            <form onSubmit={handleSavePaymentMethod}>
              <div className="form-group">
                <label>Loại</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                  className="form-control"
                  required
                >
                  <option value="card">Thẻ Tín Dụng/Ghi Nợ</option>
                  <option value="bank">Tài Khoản Ngân Hàng</option>
                  <option value="ewallet">Ví Điện Tử</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nhà Cung Cấp</label>
                <input
                  type="text"
                  value={paymentForm.provider}
                  onChange={(e) => setPaymentForm({ ...paymentForm, provider: e.target.value })}
                  className="form-control"
                  placeholder="Visa, Mastercard, Vietcombank, MoMo..."
                  required
                />
              </div>
              {paymentForm.type !== 'ewallet' && (
                <div className="form-group">
                  <label>4 Số Cuối</label>
                  <input
                    type="text"
                    value={paymentForm.lastFourDigits}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, lastFourDigits: e.target.value })
                    }
                    className="form-control"
                    maxLength="4"
                    pattern="[0-9]{4}"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Tên Chủ Tài Khoản</label>
                <input
                  type="text"
                  value={paymentForm.accountName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                  className="form-control"
                />
              </div>
              {paymentForm.type === 'card' && (
                <div className="form-group">
                  <label>Ngày Hết Hạn (MM/YY)</label>
                  <input
                    type="text"
                    value={paymentForm.expiryDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                    className="form-control"
                    placeholder="12/25"
                    pattern="[0-9]{2}/[0-9]{2}"
                  />
                </div>
              )}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={paymentForm.isDefault}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, isDefault: e.target.checked })
                    }
                  />
                  <span>Đặt làm phương thức mặc định</span>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
