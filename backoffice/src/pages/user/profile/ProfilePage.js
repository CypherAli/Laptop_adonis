import React, { useState, useEffect, useContext } from 'react'
import axios from '../../../api/axiosConfig'
import AuthContext from '../../../context/AuthContext'
import { getAvatarUrl } from '../../../utils/imageHelpers'
import './ProfilePage.css'

// Tab components - CHỈ giữ lại những tab cần thiết cho admin
import ProfileOverview from '../../../components/profile/ProfileOverview'
import PersonalInfoEnhanced from '../../../components/profile/PersonalInfoEnhanced'
import AddressManagement from '../../../components/profile/AddressManagement'
import PaymentMethods from '../../../components/profile/PaymentMethods'

const ProfilePage = () => {
  const { user, userDetails } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('overview')
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'personal', label: 'Thông tin cá nhân' },
    { id: 'addresses', label: 'Địa chỉ' },
    { id: 'payment', label: 'Payment' },
  ]

  useEffect(() => {
    fetchUserData()
  }, [])

  // Update userData when userDetails changes (after profile update)
  useEffect(() => {
    if (userDetails) {
      setUserData((prevData) => ({
        ...prevData,
        ...userDetails,
      }))
    }
  }, [userDetails])

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUserData({
        ...response.data.user,
        stats: response.data.stats || {},
      })
    } catch (error) {
      console.error('Fetch user error:', error)
      // Fallback to userDetails if API fails
      if (userDetails) {
        setUserData(userDetails)
      }
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview userData={userData} onRefresh={fetchUserData} />
      case 'personal':
        return <PersonalInfoEnhanced userData={userData} onUpdate={fetchUserData} />
      case 'addresses':
        return <AddressManagement />
      case 'payment':
        return <PaymentMethods />
      default:
        return <ProfileOverview userData={userData} onRefresh={fetchUserData} />
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading information...</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container-new">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-header">
            <div className="profile-avatar">
              {(() => {
                const avatarPath = userData?.avatar || userDetails?.avatar
                const avatarUrl = getAvatarUrl(avatarPath)
                return avatarUrl ? (
                  <img src={avatarUrl} alt={userData?.name || user?.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {userData?.name?.charAt(0).toUpperCase() ||
                      user?.username?.charAt(0).toUpperCase() ||
                      'U'}
                  </div>
                )
              })()}
            </div>
            <h2>{userData?.name || userDetails?.name || user?.username || 'User'}</h2>
            <p className="profile-email">{userData?.email || userDetails?.email || user?.email}</p>
          </div>

          <nav className="profile-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-label">{tab.label}</span>
                {tab.badge > 0 && <span className="nav-badge">{tab.badge}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-content-new">
          <div className="content-header">
            <h1>{tabs.find((t) => t.id === activeTab)?.label}</h1>
          </div>
          <div className="content-body">{renderTabContent()}</div>
        </main>
      </div>
    </div>
  )
}

export default ProfilePage
