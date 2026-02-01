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

// ==================== INERTIA ROUTES (Backoffice Admin) ====================
router
  .group(() => {
    // Admin Dashboard - Inertia SSR
    router.get('/dashboard', [AdminController, 'dashboard']).as('admin.dashboard')

    // Thêm các admin pages khác ở đây
    // router.get('/products', [AdminController, 'products'])
    // router.get('/orders', [AdminController, 'orders'])
  })
  .prefix('/admin')
  .use(middleware.inertia())
  .use(middleware.jwtAuth())
  .use(middleware.admin())

// ==================== WEB-SHOP ROUTES (User/Partner Frontend) ====================
// TODO: Thêm Inertia routes cho web-shop
// router.group(() => {
//   router.get('/', 'HomeController.index')
//   router.get('/products', 'ProductsController.index')
// }).use(middleware.inertia())

// Import API routes for REST API
import './api_routes.js'

// SPA Catch-all route - serve React app for all routes that don't match API or static files
// This allows client-side routing to work properly (fixes F5/refresh on React routes)
router.get('*', async ({ response, request }) => {
  const path = request.url()

  // Skip API routes and static assets
  if (path.startsWith('/api') || path.startsWith('/assets')) {
    return response.notFound({ message: 'Resource not found' })
  }

  // In development, proxy to React dev server (port 3000)
  if (process.env.NODE_ENV !== 'production') {
    return response.redirect(`http://localhost:3000${path}`)
  }

  // In production, serve the React build
  // Note: You need to build React first with: cd client && npm run build
  // Then copy the build folder contents to public/
  return response.download('public/index.html')
})
