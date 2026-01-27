import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'
import CartContext from '../../context/CartContext'
import WishlistContext from '../../context/WishlistContext'
import CartSidebar from '../cart/CartSidebar'
import NotificationBell from '../notification/NotificationBell'
import { getAvatarUrl } from '../../utils/imageHelpers'

const Header = () => {
  const { user, userDetails, logout } = useContext(AuthContext)
  const { getCartCount } = useContext(CartContext)
  const { wishlist } = useContext(WishlistContext)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false)

  // Debug log
  React.useEffect(() => {
    console.log('Header - User state:', user)
    console.log('Header - UserDetails:', userDetails)
  }, [user, userDetails])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to home with search query (HomePage will handle the filter)
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <>
      {/* Main Header */}
      <nav className="main-header">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="logo">
              <div className="logo-icon-wrapper">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2589/2589903.png"
                  alt="Shoe Store Logo"
                  className="logo-image"
                />
              </div>
              <div className="logo-text-wrapper">
                <span className="logo-text">SHOE STORE</span>
                <span className="logo-tagline">PREMIUM QUALITY</span>
              </div>
            </Link>

            {/* Hotline nổi bật */}
            <a href="tel:0848565650" className="hotline-prominent">
              <span className="hotline-icon"></span>
              <div className="hotline-info">
                <span className="hotline-number">084.856.5650</span>
              </div>
            </a>
          </div>

          {/* Center Search Bar */}
          <div className="nav-center">
            <form className="header-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search shoes, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              <button type="submit" className="header-search-btn">
                Search
              </button>
            </form>
          </div>

          <div className="nav-right">
            {user ? (
              <>
                <NotificationBell />

                {/* Wishlist và Cart - CHỈ dành cho user (client), KHÔNG cho admin và partner */}
                {user.role === 'client' && (
                  <>
                    <Link to="/wishlist" className="icon-link">
                      <span className="icon"></span>
                      <span className="icon-label">Wishlist</span>
                      {wishlist.length > 0 && <span className="icon-badge">{wishlist.length}</span>}
                    </Link>
                    <button
                      className="icon-link cart-icon-btn"
                      onClick={() => setIsCartSidebarOpen(true)}
                    >
                      <span className="icon"></span>
                      <span className="icon-label">Cart</span>
                      {getCartCount() > 0 && (
                        <span className="icon-badge cart-badge">{getCartCount()}</span>
                      )}
                    </button>
                  </>
                )}

                {/* User Dropdown */}
                <div className="user-menu">
                  <button className="user-menu-btn">
                    {(() => {
                      const avatarPath = userDetails?.avatar || user?.avatar
                      const avatarUrl = getAvatarUrl(avatarPath)
                      return avatarUrl ? (
                        <img src={avatarUrl} alt={user?.username} className="user-avatar-small" />
                      ) : (
                        <span className="user-icon"></span>
                      )
                    })()}
                    <span className="user-name">
                      {user?.role === 'partner' && userDetails?.shopName 
                        ? userDetails.shopName 
                        : (userDetails?.username || user?.username)}
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      My Profile
                    </Link>
                    {user && user.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item">
                        Admin Dashboard
                      </Link>
                    )}
                    {user && user.role === 'admin' && (
                      <Link to="/admin/add-product" className="dropdown-item">
                        Add Product
                      </Link>
                    )}
                    {user && user.role === 'partner' && (
                      <Link to="/admin/add-product" className="dropdown-item">
                        Add Product
                      </Link>
                    )}
                    {user && user.role === 'partner' && (
                      <Link to="/partner/settings" className="dropdown-item">
                        Settings
                      </Link>
                    )}
                    {user && (user.role === 'admin' || user.role === 'partner') && (
                      <Link to="/manager" className="dropdown-item">
                        Product Management
                      </Link>
                    )}
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/wishlist" className="icon-link">
                  <span className="icon"></span>
                  <span className="icon-label">Wishlist</span>
                  {wishlist.length > 0 && <span className="icon-badge">{wishlist.length}</span>}
                </Link>
                <button
                  className="icon-link cart-icon-btn"
                  onClick={() => setIsCartSidebarOpen(true)}
                >
                  <span className="icon"></span>
                  <span className="icon-label">Cart</span>
                  {getCartCount() > 0 && (
                    <span className="icon-badge cart-badge">{getCartCount()}</span>
                  )}
                </button>
                <Link to="/login" className="nav-link login-link">
                  <span className="link-icon"></span>
                  Login
                </Link>
                <Link to="/register" className="nav-link register-link">
                  <span className="link-icon"></span>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Navigation Menu */}
      <div className="main-nav">
        <div className="main-nav-container">
          <Link to="/" className="nav-menu-item">
            Home
          </Link>
          <Link
            to="/#products"
            className="nav-menu-item"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault()
                const productsSection = document.getElementById('products-section')
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }
            }}
          >
            Products
          </Link>
          <Link to="/deals" className="nav-menu-item hot-item">
            Hot Deals
          </Link>
          <Link to="/best-sellers" className="nav-menu-item">
            Best Sellers
          </Link>
          <Link to="/blog" className="nav-menu-item">
            News & Reviews
          </Link>
          <Link to="/about" className="nav-menu-item">
            About Us
          </Link>
          <Link to="/contact" className="nav-menu-item">
            Contact
          </Link>
        </div>
      </div>

      {/* Cart Sidebar - CHỈ render cho client (user), KHÔNG cho admin và partner */}
      {(!user || user.role === 'client') && (
        <CartSidebar isOpen={isCartSidebarOpen} onClose={() => setIsCartSidebarOpen(false)} />
      )}
    </>
  )
}

export default Header
