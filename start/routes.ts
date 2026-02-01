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

// ==================== HOME PAGE (Inertia) ====================
router.on('/').renderInertia('home')

// ==================== ADMIN ROUTES (Inertia SSR for Backoffice) ====================
router
  .group(() => {
    router.get('/dashboard', [AdminController, 'dashboard']).as('admin.dashboard')
    
    // TODO: Add more admin pages
    // router.get('/products', [AdminController, 'products']).as('admin.products')
    // router.get('/orders', [AdminController, 'orders']).as('admin.orders')
    // router.get('/users', [AdminController, 'users']).as('admin.users')
  })
  .prefix('/admin')
  .use(middleware.jwtAuth())
  .use(middleware.admin())

// ==================== API ROUTES (REST API for web-shop) ====================
// Import API routes for REST API - web-shop (separate React app) will use these
import './api_routes.js'
