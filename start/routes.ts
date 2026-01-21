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

const DashboardController = () => import('#controllers/dashboard_controller')

// Public routes
router.on('/').render('pages/home')

// Admin routes (protected) - Server-side rendering for dashboard only
router
  .group(() => {
    // Dashboard
    router.get('/dashboard', [DashboardController, 'index']).as('admin.dashboard')
  })
  .prefix('/admin')
  .use(middleware.auth())

// Import API routes for REST API (used by React frontend)
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
