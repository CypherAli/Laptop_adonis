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
    // TODO: Implement CartController
    // router
    //   .group(() => {
    //     router.get('/', [CartController, 'index'])
    //     router.post('/items', [CartController, 'addItem'])
    //     router.put('/items/:itemId', [CartController, 'updateItem'])
    //     router.delete('/items/:itemId', [CartController, 'removeItem'])
    //     router.delete('/', [CartController, 'clear'])
    //   })
    //   .prefix('/cart')
    //   .use(middleware.auth())

    // ==================== REVIEWS ROUTES ====================
    // TODO: Implement ReviewController
    // router
    //   .group(() => {
    //     router.get('/product/:productId', [ReviewController, 'getByProduct'])
    //     router.post('/', [ReviewController, 'create']).use(middleware.auth())
    //     router.put('/:id', [ReviewController, 'update']).use(middleware.auth())
    //     router.delete('/:id', [ReviewController, 'destroy']).use(middleware.auth())
    //   })
    //   .prefix('/reviews')

    // ==================== ADMIN ROUTES ====================
    // TODO: Implement AdminController
    // router
    //   .group(() => {
    //     router.get('/dashboard', [AdminController, 'dashboard'])
    //     router.get('/users', [AdminController, 'getUsers'])
    //     router.put('/users/:id/approve', [AdminController, 'approvePartner'])
    //     router.get('/analytics', [AdminController, 'analytics'])
    //   })
    //   .prefix('/admin')
    //   .use(middleware.auth())
    //   .use(middleware.admin())

    // Test route
    router.get('/test', async () => {
      return { message: 'API is working!' }
    })
  })
  .prefix('/api')
