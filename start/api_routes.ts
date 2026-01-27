/*
|--------------------------------------------------------------------------
| API Routes file
|--------------------------------------------------------------------------
|
| API routes for the Shoe Shop application
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Import controllers
const AuthController = () => import('#controllers/auth_controller')
const ProductsController = () => import('#controllers/products_controller')
const CartsController = () => import('#controllers/carts_controller')
const ReviewsController = () => import('#controllers/reviews_controller')
const WishlistController = () => import('#controllers/wishlist_controller')
const ComparisonsController = () => import('#controllers/comparisons_controller')
const AdminController = () => import('#controllers/admin_controller')
const ChatController = () => import('#controllers/chat_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const BrandsController = () => import('#controllers/brands_controller')
const AttributesController = () => import('#controllers/attributes_controller')
const SettingsController = () => import('#controllers/settings_controller')

// API routes with /api prefix
router
  .group(() => {
    // ==================== AUTH ROUTES ====================
    router
      .group(() => {
        router.post('/register', [AuthController, 'register'])
        router.post('/login', [AuthController, 'login'])
        router.post('/logout', [AuthController, 'logout'])

        // Protected auth routes
        router.get('/me', [AuthController, 'me']).use(middleware.jwtAuth())
        router.put('/profile', [AuthController, 'updateProfile']).use(middleware.jwtAuth())
      })
      .prefix('/auth')

    // ==================== PRODUCTS ROUTES ====================
    router
      .group(() => {
        // Public routes
        router.get('/', [ProductsController, 'index'])
        router.get('/featured', [ProductsController, 'featured'])

        // Protected routes (Partner/Admin only) - MUST be before /:id
        router.get('/my-products', [ProductsController, 'myProducts']).use(middleware.jwtAuth())
        router.post('/', [ProductsController, 'store']).use(middleware.jwtAuth())

        // Dynamic routes - MUST be last
        router.get('/:id', [ProductsController, 'show'])
        router.put('/:id', [ProductsController, 'update']).use(middleware.jwtAuth())
        router.delete('/:id', [ProductsController, 'destroy']).use(middleware.jwtAuth())
      })
      .prefix('/products')

    // ==================== ORDERS ROUTES ====================
    // Removed: Admin doesn't need personal orders

    // ==================== CART ROUTES ====================
    router
      .group(() => {
        router.get('/', [CartsController, 'index'])
        router.post('/', [CartsController, 'addItem'])
        router.put('/:itemId', [CartsController, 'updateItem'])
        router.delete('/:itemId', [CartsController, 'removeItem'])
        router.delete('/clear', [CartsController, 'clear'])
      })
      .prefix('/cart')
      .use(middleware.jwtAuth())

    // ==================== REVIEWS ROUTES ====================
    router
      .group(() => {
        router.get('/', [ReviewsController, 'index']) // Get all reviews with pagination
        router.get('/product/:productId', [ReviewsController, 'getByProduct'])
        router.post('/', [ReviewsController, 'create']).use(middleware.jwtAuth())
        router.put('/:id', [ReviewsController, 'update']).use(middleware.jwtAuth())
        router.delete('/:id', [ReviewsController, 'destroy']).use(middleware.jwtAuth())
        router.post('/:id/helpful', [ReviewsController, 'markHelpful']).use(middleware.jwtAuth())
      })
      .prefix('/reviews')

    // ==================== WISHLIST ROUTES ====================
    router
      .group(() => {
        router.get('/', [WishlistController, 'index'])
        router.post('/', [WishlistController, 'add'])
        router.delete('/:productId', [WishlistController, 'remove'])
        router.delete('/clear/all', [WishlistController, 'clear'])
        router.get('/check/:productId', [WishlistController, 'check'])
      })
      .prefix('/user/wishlist')
      .use(middleware.jwtAuth())

    // ==================== USER ROUTES ====================
    const UsersController = () => import('#controllers/users_controller')
    router
      .group(() => {
        // Addresses
        router.get('/addresses', [UsersController, 'getAddresses'])
        router.post('/addresses', [UsersController, 'addAddress'])
        router.put('/addresses/:addressId', [UsersController, 'updateAddress'])
        router.delete('/addresses/:addressId', [UsersController, 'deleteAddress'])
        router.put('/addresses/:addressId/default', [UsersController, 'setDefaultAddress'])

        // Payment Methods
        router.get('/payment-methods', [UsersController, 'getPaymentMethods'])
        router.post('/payment-methods', [UsersController, 'addPaymentMethod'])
        router.delete('/payment-methods/:methodId', [UsersController, 'deletePaymentMethod'])

        // Preferences
        router.get('/preferences', [UsersController, 'getPreferences'])
        router.put('/preferences', [UsersController, 'updatePreferences'])
      })
      .prefix('/user')
      .use(middleware.jwtAuth())

    // ==================== NOTIFICATIONS ROUTES ====================
    const NotificationsController = () => import('#controllers/notifications_controller')
    router
      .group(() => {
        router.get('/unread-count', [NotificationsController, 'getUnreadCount'])
        router.get('/my-notifications', [NotificationsController, 'index'])
        router.post('/:notificationId/read', [NotificationsController, 'markAsRead'])
        router.post('/mark-all-read', [NotificationsController, 'markAllAsRead'])
        router.delete('/:notificationId', [NotificationsController, 'destroy'])
        router.delete('/read', [NotificationsController, 'deleteAllRead'])
        router.post('/test', [NotificationsController, 'createTest']) // For testing
      })
      .prefix('/notifications')
      .use(middleware.jwtAuth())

    // ==================== COMPARISON ROUTES ====================
    router
      .group(() => {
        router.post('/compare', [ComparisonsController, 'compare'])
        router.post('/save', [ComparisonsController, 'save'])
        router.get('/:slug', [ComparisonsController, 'getBySlug'])
      })
      .prefix('/comparisons')

    // ==================== PUBLIC CATALOG ROUTES ====================
    // Categories tree for navigation
    router.get('/categories/tree', [CategoriesController, 'tree'])
    
    // Brands list for filters
    router.get('/brands/list', [BrandsController, 'list'])
    
    // Filterable attributes for product filters
    router.get('/attributes/filterable', [AttributesController, 'filterable'])
    
    // Public settings (site info, social links, etc.)
    router.get('/settings/public', [SettingsController, 'getPublic'])

    // ==================== ADMIN ROUTES ====================
    router
      .group(() => {
        // Dashboard & Stats
        router.get('/stats', [AdminController, 'stats'])
        router.get('/dashboard', [AdminController, 'dashboard'])
        router.get('/analytics', [AdminController, 'analytics'])
        router.get('/revenue-by-shop', [AdminController, 'getRevenueByShop'])
        
        // Users Management
        router.get('/users', [AdminController, 'getUsers'])
        router.put('/users/:userId/approve', [AdminController, 'approvePartner'])
        router.put('/users/:userId/reject', [AdminController, 'rejectPartner'])
        router.put('/users/:userId/toggle-status', [AdminController, 'toggleUserStatus'])
        
        // Products Management
        router.get('/products', [AdminController, 'getProducts'])
        router.put('/products/:productId/toggle-featured', [
          AdminController,
          'toggleProductFeatured',
        ])
        
        // Orders Management
        router.get('/orders', [AdminController, 'getOrders'])
        
        // Reviews Management
        router.get('/reviews', [AdminController, 'getReviews'])
        router.put('/reviews/:reviewId/moderate', [AdminController, 'moderateReview'])
        
        // ==================== CATEGORIES MANAGEMENT ====================
        router.get('/categories/tree', [AdminController, 'getCategoriesTree'])
        router.put('/categories/:id/toggle-active', [AdminController, 'toggleCategoryActive'])
        
        // ==================== BRANDS MANAGEMENT ====================
        router.get('/brands', [AdminController, 'getBrands'])
        router.put('/brands/:id/toggle-active', [AdminController, 'toggleBrandActive'])
        
        // ==================== SETTINGS MANAGEMENT ====================
        router.get('/settings', [AdminController, 'getSettings'])
        router.put('/settings', [AdminController, 'updateSettings'])
      })
      .prefix('/admin')
      .use(middleware.jwtAuth())
      .use(middleware.admin())

    // ==================== PARTNER ROUTES ====================
    router
      .group(() => {
        router.get('/stats', [AdminController, 'getPartnerStats'])
        router.get('/revenue', [AdminController, 'getPartnerRevenue'])
        router.get('/revenue-by-brand', [AdminController, 'getPartnerRevenueByBrand'])
        router.get('/orders', [AdminController, 'getPartnerOrders'])
      })
      .prefix('/partner')
      .use(middleware.jwtAuth())
      .use(middleware.partner())

    // ==================== CHAT ROUTES ====================
    // Public routes for guests (chỉ xem danh sách partners)
    router.get('/chat/partners', [ChatController, 'getActivePartners'])

    // Authenticated chat routes
    router
      .group(() => {
        router.post('/conversations', [ChatController, 'createConversation'])
        router.get('/messages/:conversationId', [ChatController, 'getMessages'])
        router.post('/messages', [ChatController, 'sendMessage'])
        router.get('/conversations', [ChatController, 'getGuestConversations'])
        router.get('/partner/:partnerId/customers', [ChatController, 'getPartnerCustomers'])
      })
      .prefix('/chat')
      .use(middleware.jwtAuth())

    // Test route
    router.get('/test', async () => {
      return { message: 'API is working!' }
    })
  })
  .prefix('/api')
