import React, { useContext, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

// Core Components - Keep these eager loaded for better UX
import ErrorBoundary from './components/common/ErrorBoundary'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import PrivateRoute from './components/route/PrivateRoute'
import RoleBasedLayout from './components/layout/RoleBasedLayout'
import ScrollToTop from './components/common/ScrollToTop'
import AuthContext from './context/AuthContext'

// Chat Widgets - Keep eager loaded for instant availability
import PartnerLiveChat from './components/chat/PartnerLiveChat'
import AdminChatWidget from './components/chat/AdminChatWidget'
import UserLiveChat from './components/chat/UserLiveChat'
import GuestChatWidget from './components/chat/GuestChatWidget'

// Critical pages - eager load for better initial experience
import HomePage from './pages/home/HomePage'
import ProductDetailPageUltra from './pages/product/ProductDetailPageUltra'
import LoginPage from './pages/user/auth/login/LoginPage'
import RegisterPage from './pages/user/auth/register/RegisterPage'

// Lazy load less critical pages for faster initial load
const DealsPage = lazy(() => import('./pages/deals/DealsPage'))
const BestSellersPage = lazy(() => import('./pages/product/BestSellersPage'))
const BlogPage = lazy(() => import('./pages/common/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/common/BlogDetailPage'))
const AboutPage = lazy(() => import('./pages/common/AboutPage'))
const ContactPage = lazy(() => import('./pages/company/ContactPage'))
const CompanyAboutPage = lazy(() => import('./pages/company/CompanyAboutPage'))
const CareersPage = lazy(() => import('./pages/common/CareersPage'))
const NewsPage = lazy(() => import('./pages/company/NewsPage'))
const StoresPage = lazy(() => import('./pages/company/StoresPage'))
const TermsPage = lazy(() => import('./pages/company/TermsPage'))
const CartPage = lazy(() => import('./pages/user/cart/cart-list/CartPage'))
const WishlistPage = lazy(() => import('./pages/user/wishlist/WishlistPage'))
const ForgotPasswordPage = lazy(() => import('./pages/user/auth/forgot-password/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/user/auth/reset-password/ResetPasswordPage'))
const CheckoutPage = lazy(() => import('./pages/user/cart/checkout/CheckoutPage'))
const OrderManagement = lazy(() => import('./pages/orders/OrderManagement'))
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboardClean'))
const AddProduct = lazy(() => import('./pages/admin/AddProduct'))
const EditProduct = lazy(() => import('./pages/admin/EditProduct'))
const PartnerOrders = lazy(() => import('./pages/partner/PartnerOrders'))
const HuongDanMuaHang = lazy(() => import('./pages/chat/HuongDanMuaHang'))
const InstallmentGuidePage = lazy(() => import('./pages/guide/InstallmentGuidePage'))
const ProfilePage = lazy(() => import('./pages/user/profile/ProfilePage'))
const PaymentGuidePage = lazy(() => import('./pages/guide/PaymentGuidePage'))
const WarrantyPolicyPage = lazy(() => import('./pages/user/policies/warranty/WarrantyPolicyPage'))
const ReturnPolicyPage = lazy(() => import('./pages/user/policies/return/ReturnPolicyPage'))
const ShippingPolicyPage = lazy(() => import('./pages/user/policies/shipping/ShippingPolicyPage'))

// Loading component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh',
    fontSize: '18px',
    color: '#666'
  }}>
    <div className="spinner" style={{
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      marginRight: '15px'
    }}></div>
    Đang tải...
  </div>
)

function App() {
  const { user } = useContext(AuthContext)
  return (
    <ErrorBoundary>
      <RoleBasedLayout>
        <ScrollToTop />
        <Header />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* === Public Routes === */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPageUltra />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/best-sellers" element={<BestSellersPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* === Policy Pages === */}
          <Route path="/huong-dan-mua-hang" element={<HuongDanMuaHang />} />
          <Route path="/huong-dan-thanh-toan" element={<PaymentGuidePage />} />
          <Route path="/chinh-sach-bao-hanh" element={<WarrantyPolicyPage />} />
          <Route path="/chinh-sach-doi-tra" element={<ReturnPolicyPage />} />
          <Route path="/chinh-sach-van-chuyen" element={<ShippingPolicyPage />} />
          <Route path="/tra-gop" element={<InstallmentGuidePage />} />

          {/* === New Footer Content Pages === */}
          <Route path="/gioi-thieu" element={<CompanyAboutPage />} />
          <Route path="/tuyen-dung" element={<CareersPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/he-thong-cua-hang" element={<StoresPage />} />
          <Route path="/dieu-khoan" element={<TermsPage />} />
          <Route path="/lien-he" element={<ContactPage />} />

          {/* Public routes - Wishlist & Cart */}
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* === Protected User Routes === */}
          <Route element={<PrivateRoute allowedRoles={['client', 'partner', 'admin']} />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-management" element={<OrderManagement />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* === Protected Partner Routes === */}
          <Route element={<PrivateRoute allowedRoles={['partner', 'admin']} />}>
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/partner/orders" element={<PartnerOrders />} />
          </Route>

          {/* === Protected Admin Routes === */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-product" element={<AddProduct />} />
            <Route path="/admin/edit-product/:id" element={<EditProduct />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all 404 */}
          <Route
            path="*"
            element={
              <div style={{ padding: '50px', textAlign: 'center' }}>
                <h1>404 - Page Not Found</h1>
                <p>URL: {window.location.pathname}</p>
                <button
                  onClick={() => (window.location.href = '/')}
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                  }}
                >
                  Go to Home
                </button>
              </div>
            }
          />
          </Routes>
        </Suspense>
        <Footer />

        {/* Chat Widget - Support cả guest và logged-in users */}
        {user?.role === 'partner' ? (
          <PartnerLiveChat />
        ) : user?.role === 'admin' ? (
          <AdminChatWidget />
        ) : !user ? (
          <GuestChatWidget />
        ) : (
          <UserLiveChat />
        )}
      </RoleBasedLayout>
    </ErrorBoundary>
  )
}

export default App
