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
const OrdersController = () => import('#controllers/orders_controller')
const CartsController = () => import('#controllers/carts_controller')
const ReviewsController = () => import('#controllers/reviews_controller')
const WishlistController = () => import('#controllers/wishlist_controller')
const ComparisonsController = () => import('#controllers/comparisons_controller')
const AdminController = () => import('#controllers/admin_controller')
const ChatController = () => import('#controllers/chat_controller')

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
        router.get('/:id', [ProductsController, 'show'])

        // Protected routes (Partner/Admin only)
        router.post('/', [ProductsController, 'store']).use(middleware.jwtAuth())
        router.put('/:id', [ProductsController, 'update']).use(middleware.jwtAuth())
        router.delete('/:id', [ProductsController, 'destroy']).use(middleware.jwtAuth())
      })
      .prefix('/products')

    // ==================== ORDERS ROUTES ====================
    router
      .group(() => {
        router.get('/', [OrdersController, 'index'])
        router.get('/:id', [OrdersController, 'show'])
        router.post('/', [OrdersController, 'store'])
        router.put('/:id/status', [OrdersController, 'updateStatus'])
        router.post('/:id/cancel', [OrdersController, 'cancel'])
      })
      .prefix('/orders')
      .use(middleware.jwtAuth())

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

    // ==================== COMPARISON ROUTES ====================
    router
      .group(() => {
        router.post('/compare', [ComparisonsController, 'compare'])
        router.post('/save', [ComparisonsController, 'save'])
        router.get('/:slug', [ComparisonsController, 'getBySlug'])
      })
      .prefix('/comparisons')

    // ==================== ADMIN ROUTES ====================
    router
      .group(() => {
        router.get('/dashboard', [AdminController, 'dashboard'])
        router.get('/users', [AdminController, 'getUsers'])
        router.put('/users/:userId/approve', [AdminController, 'approvePartner'])
        router.put('/users/:userId/reject', [AdminController, 'rejectPartner'])
        router.put('/users/:userId/toggle-status', [AdminController, 'toggleUserStatus'])
        router.get('/products', [AdminController, 'getProducts'])
        router.put('/products/:productId/toggle-featured', [
          AdminController,
          'toggleProductFeatured',
        ])
        router.get('/reviews', [AdminController, 'getReviews'])
        router.put('/reviews/:reviewId/moderate', [AdminController, 'moderateReview'])
        router.get('/analytics', [AdminController, 'analytics'])
      })
      .prefix('/admin')
      .use(middleware.jwtAuth())
      .use(middleware.admin())

    // ==================== CHAT ROUTES ====================
    router
      .group(() => {
        // Support both authenticated and anonymous users
        router.post('/conversations', [ChatController, 'createConversation'])
        router.get('/messages/:conversationId', [ChatController, 'getMessages'])
        router.post('/messages', [ChatController, 'sendMessage'])
      })
      .prefix('/chat')

    // Test route
    router.get('/test', async () => {
      return { message: 'API is working!' }
    })
  })
  .prefix('/api')
