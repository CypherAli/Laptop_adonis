/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AdminController = () => import('#controllers/admin_controller')
const AuthController = () => import('#controllers/auth_controller')

// ==================== HOME PAGE (Inertia) ====================
router.on('/').renderInertia('home')

// ==================== AUTH ROUTES (Inertia) ====================
router.get('/auth/login', [AuthController, 'showLogin']).as('auth.login')
router.post('/auth/login', [AuthController, 'loginInertia']).as('auth.login.post')
router.post('/auth/register', [AuthController, 'registerAdmin']).as('auth.register')
router.post('/auth/logout', [AuthController, 'logout']).as('auth.logout')

// ==================== ADMIN ROUTES (Inertia SSR for Backoffice) ====================
const ProductsController = () => import('#controllers/products_controller')
const CategoriesController = () => import('#controllers/categories_controller')
const BrandsController = () => import('#controllers/brands_controller')
const AttributesController = () => import('#controllers/attributes_controller')
const OrdersController = () => import('#controllers/orders_controller')
const UsersController = () => import('#controllers/users_controller')
const ReviewsController = () => import('#controllers/reviews_controller')
const SettingsController = () => import('#controllers/settings_controller')

router
  .group(() => {
    // Redirect /admin to /admin/dashboard
    router.get('/', ({ response }) => response.redirect('/admin/dashboard'))
    
    // Dashboard
    router.get('/dashboard', [AdminController, 'dashboard']).as('admin.dashboard')
    
    // Products Management
    router.get('/products', [ProductsController, 'showProducts']).as('admin.products')
    router.get('/products/create', [ProductsController, 'createProduct']).as('admin.products.create')
    router.post('/products', [ProductsController, 'storeProduct']).as('admin.products.store')
    router.put('/products/:id', [ProductsController, 'updateProduct']).as('admin.products.update')
    router.delete('/products/:id', [ProductsController, 'deleteProduct']).as('admin.products.delete')
    
    // Categories Management
    router.get('/categories', [CategoriesController, 'index']).as('admin.categories')
    router.post('/categories', [CategoriesController, 'store']).as('admin.categories.store')
    router.put('/categories/:id', [CategoriesController, 'update']).as('admin.categories.update')
    router.delete('/categories/:id', [CategoriesController, 'destroy']).as('admin.categories.delete')
    
    // Brands Management
    router.get('/brands', [BrandsController, 'index']).as('admin.brands')
    router.post('/brands', [BrandsController, 'store']).as('admin.brands.store')
    router.put('/brands/:id', [BrandsController, 'update']).as('admin.brands.update')
    router.delete('/brands/:id', [BrandsController, 'destroy']).as('admin.brands.delete')
    
    // Attributes Management
    router.get('/attributes', [AttributesController, 'index']).as('admin.attributes')
    router.post('/attributes', [AttributesController, 'store']).as('admin.attributes.store')
    router.put('/attributes/:id', [AttributesController, 'update']).as('admin.attributes.update')
    router.delete('/attributes/:id', [AttributesController, 'destroy']).as('admin.attributes.delete')
    
    // Orders, Users, Reviews
    router.get('/orders', [OrdersController, 'showOrders']).as('admin.orders')
    router.get('/users', [UsersController, 'showUsers']).as('admin.users')
    router.put('/users/:id', [UsersController, 'updateUser']).as('admin.users.update')
    router.delete('/users/:id', [UsersController, 'deleteUser']).as('admin.users.delete')
    router.get('/reviews', [ReviewsController, 'showReviews']).as('admin.reviews')
    
    // Settings
    router.get('/settings', [SettingsController, 'showSettings']).as('admin.settings')
    router.put('/settings', [SettingsController, 'updateSettings']).as('admin.settings.update')
  })
  .prefix('/admin')
  .use(middleware.auth())

// ==================== API ROUTES (REST API for web-shop) ====================
// Import API routes for REST API - web-shop (separate React app) will use these
import './api_routes.js'
