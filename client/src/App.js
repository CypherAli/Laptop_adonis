import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';

// Core Components
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/route/PrivateRoute';
import RoleBasedLayout from './components/layout/RoleBasedLayout';
import ScrollToTop from './components/common/ScrollToTop';
import AuthContext from './context/AuthContext';

// Chat Widgets - Different for each role
import PartnerLiveChat from './components/chat/PartnerLiveChat';
import AdminChatWidget from './components/chat/AdminChatWidget';
import AnonymousChatWidget from './components/chat/AnonymousChatWidget';

// Import ALL pages directly - NO LAZY LOADING for maximum stability
import HomePage from './pages/home/HomePage';
import ProductDetailPageUltra from './pages/product/ProductDetailPageUltra';
import DealsPage from './pages/deals/DealsPage';
import BestSellersPage from './pages/product/BestSellersPage';
import BlogPage from './pages/common/BlogPage';
import BlogDetailPage from './pages/common/BlogDetailPage';
import AboutPage from './pages/common/AboutPage';
import ContactPage from './pages/company/ContactPage';
import CompanyAboutPage from './pages/company/CompanyAboutPage';
import CareersPage from './pages/common/CareersPage';
import NewsPage from './pages/company/NewsPage';
import StoresPage from './pages/company/StoresPage';
import TermsPage from './pages/company/TermsPage';
import CartPage from './pages/user/cart/cart-list/CartPage';
import WishlistPage from './pages/user/wishlist/WishlistPage';
import LoginPage from './pages/user/auth/login/LoginPage';
import RegisterPage from './pages/user/auth/register/RegisterPage';
import ForgotPasswordPage from './pages/user/auth/forgot-password/ForgotPasswordPage';
import ResetPasswordPage from './pages/user/auth/reset-password/ResetPasswordPage';
import CheckoutPage from './pages/user/cart/checkout/CheckoutPage';
import OrdersPage from './pages/user/orders/orders-list/OrdersPage';
import OrderDetailPage from './pages/user/orders/order-detail/OrderDetailPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerOrders from './pages/partner/PartnerOrders';
import HuongDanMuaHang from './pages/chat/HuongDanMuaHang';
import InstallmentGuidePage from './pages/guide/InstallmentGuidePage';
import ProfilePage from './pages/user/profile/ProfilePage';
import PaymentGuidePage from './pages/guide/PaymentGuidePage';
import WarrantyPolicyPage from './pages/user/policies/warranty/WarrantyPolicyPage';
import ReturnPolicyPage from './pages/user/policies/return/ReturnPolicyPage';
import ShippingPolicyPage from './pages/user/policies/shipping/ShippingPolicyPage';

function App() {
  const { user } = useContext(AuthContext);
  return (
    <ErrorBoundary>
      <RoleBasedLayout>
        <ScrollToTop />
        <Header />
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
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />

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

        {/* === Protected User Routes === */}
        <Route element={<PrivateRoute allowedRoles={['client', 'partner', 'admin']} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* === Protected Partner Routes === */}
        <Route element={<PrivateRoute allowedRoles={['partner', 'admin']} />}>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          <Route path="/partner/orders" element={<PartnerOrders />} />
          <Route path="/partner-dashboard" element={<PartnerDashboard />} />
          <Route path="/dashboard/partner" element={<PartnerDashboard />} />
        </Route>

        {/* === Protected Admin Routes === */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
            <p>URL: {window.location.pathname}</p>
            <button onClick={() => window.location.href = '/'} style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}>
              Go to Home
            </button>
          </div>
        } />
      </Routes>
      <Footer />
      
      {/* Chat Widget - Support cả guest và logged-in users */}
      {user?.role === 'partner' ? (
        <PartnerLiveChat />
      ) : user?.role === 'admin' ? (
        <AdminChatWidget />
      ) : (
        <AnonymousChatWidget />
      )}
    </RoleBasedLayout>
    </ErrorBoundary>
  );
}

export default App;
