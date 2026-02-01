import React, { useContext, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

// Core Components
import ErrorBoundary from './components/common/ErrorBoundary'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import PrivateRoute from './components/route/PrivateRoute'
import RoleBasedLayout from './components/layout/RoleBasedLayout'
import ScrollToTop from './components/common/ScrollToTop'
import AuthContext from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Admin Chat Widget
import AdminChatWidget from './components/chat/AdminChatWidget'

// Admin pages
import LoginPage from './pages/user/auth/login/LoginPage'

// Admin lazy-loaded pages
const ForgotPasswordPage = lazy(() => import('./pages/user/auth/forgot-password/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/user/auth/reset-password/ResetPasswordPage'))
const OrderManagement = lazy(() => import('./pages/orders/OrderManagement'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboardClean'))
const AddProduct = lazy(() => import('./pages/admin/AddProduct'))
const EditProduct = lazy(() => import('./pages/admin/EditProduct'))
const ProfilePage = lazy(() => import('./pages/user/profile/ProfilePage'))
const ProductManagement = lazy(() => import('./pages/products/ProductManagement'))

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
      <ThemeProvider>
        <RoleBasedLayout>
          <ScrollToTop />
          <Header />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* === Admin Login === */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* === Protected Admin Only Routes === */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/manager" element={<ProductManagement />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-product" element={<AddProduct />} />
            <Route path="/admin/edit-product/:id" element={<EditProduct />} />
            <Route path="/order-management" element={<OrderManagement />} />
            <Route path="/profile" element={<ProfilePage />} />
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

        {/* Admin Chat Widget */}
        {user?.role === 'admin' && <AdminChatWidget />}
      </RoleBasedLayout>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
