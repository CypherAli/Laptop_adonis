# Project Structure Guide

## Overview

This is a full-stack shoe e-commerce platform with:
- **Backend**: AdonisJS 6 (TypeScript) with MongoDB
- **Frontend**: React SPA with multiple user roles

## Directory Structure

```
Adonis/                                    # Root project
│
├── app/                                   # Backend application
│   ├── controllers/                       # API controllers
│   │   ├── admin_controller.ts           # Admin dashboard stats
│   │   ├── auth_controller.ts            # Authentication (login, register, JWT)
│   │   ├── products_controller.ts        # Product CRUD operations
│   │   ├── orders_controller.ts          # Order management
│   │   ├── users_controller.ts           # User management
│   │   ├── partner_controller.ts         # Partner/seller operations
│   │   ├── carts_controller.ts           # Shopping cart
│   │   ├── reviews_controller.ts         # Product reviews
│   │   ├── chat_controller.ts            # Real-time chat
│   │   └── ...
│   │
│   ├── models/                            # MongoDB/Mongoose models
│   │   ├── user.ts                       # User model (admin, partner, client)
│   │   ├── product.ts                    # Product with variants
│   │   ├── order.ts                      # Order with items
│   │   ├── cart.ts                       # Shopping cart
│   │   ├── review.ts                     # Product reviews
│   │   ├── conversation.ts               # Chat conversations
│   │   └── ...
│   │
│   ├── middleware/                        # Request middleware
│   │   ├── auth_middleware.ts            # Session authentication
│   │   ├── jwt_auth_middleware.ts        # JWT token validation
│   │   ├── admin_middleware.ts           # Admin role check
│   │   ├── partner_middleware.ts         # Partner role check
│   │   └── cors_middleware.ts            # CORS configuration
│   │
│   ├── services/                          # Business logic services
│   │   ├── cart_service.ts               # Cart operations
│   │   ├── notification_service.ts       # Notifications
│   │   └── ...
│   │
│   └── utils/                             # Utility functions
│       ├── response.ts                    # Standardized API responses
│       ├── validation.ts                  # Input validation
│       └── logger.ts                      # Logging utilities
│
├── start/                                 # Application bootstrap
│   ├── routes.ts                         # Main routes (Inertia.js - not used much)
│   ├── api_routes.ts                     # REST API routes for web-shop
│   ├── kernel.ts                         # Middleware registration
│   └── env.ts                            # Environment variables validation
│
├── config/                                # Configuration files
│   ├── app.ts                            # App settings
│   ├── database.ts                       # Database connection
│   ├── cors.ts                           # CORS settings
│   ├── session.ts                        # Session configuration
│   └── inertia.ts                        # Inertia.js config (optional)
│
├── database/                              # Database related
│   └── seeders/                          # Data seeders
│       ├── user_seeder.ts                # Create test users
│       └── ...
│
├── commands/                              # CLI commands
│   ├── seed_users.ts                     # Seed users
│   ├── seed_products.ts                  # Seed products
│   └── ...
│
├── providers/                             # Service providers
│   ├── mongo_provider.ts                 # MongoDB connection
│   └── socket_provider.ts                # Socket.IO setup
│
├── inertia/                               # Inertia.js (SSR) - Optional/Not actively used
│   ├── app/                              
│   │   ├── app.tsx                       # Client-side entry
│   │   └── ssr.tsx                       # Server-side entry
│   └── pages/                            
│       ├── admin/                        
│       │   └── dashboard.tsx             # Admin dashboard (Inertia)
│       └── home.tsx                      # Home page (Inertia)
│
└── web-shop/                              # Frontend React SPA (MAIN FRONTEND)
    ├── public/                            # Static assets
    │   ├── index.html                    
    │   └── ...
    │
    └── src/                               # React source code
        │
        ├── api/                           # API configuration
        │   └── axiosConfig.js            # Axios instance with base URL
        │
        ├── components/                    # Reusable components
        │   ├── layout/                   
        │   │   ├── Header.js             # Main header with navigation
        │   │   ├── Footer.js             # Footer
        │   │   └── RoleBasedLayout.js    # Layout based on user role
        │   ├── product/                  
        │   │   ├── ProductCard.js        
        │   │   ├── ProductImage.js       
        │   │   └── ...
        │   ├── cart/                     
        │   ├── chat/                     # Chat widgets (admin, partner, user, guest)
        │   ├── modal/                    
        │   ├── notification/             
        │   └── ...
        │
        ├── context/                       # React Context API
        │   ├── AuthContext.js            # Authentication state
        │   ├── CartContext.js            # Shopping cart state
        │   ├── WishlistContext.js        # Wishlist state
        │   ├── ChatContext.js            # Chat state
        │   └── ThemeContext.js           # Dark/light theme
        │
        ├── pages/                         # Page components
        │   │
        │   ├── admin/                    #  ADMIN PAGES
        │   │   ├── AdminDashboard.js     # Main admin dashboard
        │   │   ├── AddProduct.js         # Add new product
        │   │   ├── EditProduct.js        # Edit product
        │   │   ├── attributes/           # Attribute management
        │   │   ├── brands/               # Brand management
        │   │   ├── categories/           # Category management
        │   │   └── settings/             # System settings
        │   │
        │   ├── partner/                  #  PARTNER/SELLER PAGES
        │   │   ├── PartnerOrders.js      # Partner's orders
        │   │   └── PartnerSettings.js    # Partner settings
        │   │
        │   ├── manager/                  
        │   │   └── ManagerDashboard.js   # Partner dashboard
        │   │
        │   ├── user/                     #  USER/CUSTOMER PAGES
        │   │   ├── auth/                 
        │   │   │   ├── login/            
        │   │   │   ├── register/         
        │   │   │   ├── forgot-password/  
        │   │   │   └── reset-password/   
        │   │   ├── cart/                 
        │   │   │   ├── cart-list/        # Shopping cart page
        │   │   │   └── checkout/         # Checkout page
        │   │   ├── orders/               
        │   │   │   ├── orders-list/      # Order history
        │   │   │   └── order-detail/     # Order details
        │   │   ├── profile/              # User profile
        │   │   ├── wishlist/             # Wishlist page
        │   │   └── policies/             # Policy pages
        │   │
        │   ├── home/                     #  PUBLIC PAGES
        │   │   └── HomePage.js           # Main landing page
        │   ├── product/                  
        │   │   ├── ProductDetailPageUltra.js  # Product detail
        │   │   └── BestSellersPage.js    
        │   ├── deals/                    
        │   │   └── DealsPage.js          # Hot deals page
        │   ├── company/                  
        │   │   ├── AboutPage.js          
        │   │   ├── ContactPage.js        
        │   │   └── ...
        │   └── ...
        │
        ├── utils/                         # Utility functions
        │   ├── helpers.js                
        │   ├── constants.js              
        │   └── imageHelpers.js           
        │
        ├── styles/                        # Global styles
        │   ├── animations.css            
        │   └── dark-mode.css             
        │
        ├── App.js                         # Main React app with routes
        └── index.js                       # React entry point

```

## User Roles & Access

### 1. Admin (role: 'admin')
- Full system access
- Dashboard: `/admin` or `/admin/dashboard`
- Features:
  - View all statistics
  - Manage products, orders, users
  - Manage categories, brands, attributes
  - System settings
  - Moderate reviews

### 2. Partner/Seller (role: 'partner')
- Limited business access
- Dashboard: `/manager`
- Features:
  - View own products and orders
  - Add/edit own products
  - View revenue statistics
  - Manage own orders
  - Partner settings

### 3. Customer (role: 'client')
- Shopping features
- Access:
  - Browse products
  - Shopping cart
  - Wishlist
  - Place orders
  - Write reviews
  - Profile management

### 4. Guest (no auth)
- Public access
- Features:
  - Browse products
  - View product details
  - Public pages (about, contact, etc.)
  - Guest chat widget

## API Routes Structure

All API routes are prefixed with `/api` and defined in `start/api_routes.ts`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/admin/products` - Create product (admin/partner)
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Orders
- `GET /api/orders` - User's orders
- `GET /api/orders/:id` - Order details
- `POST /api/orders` - Create order
- `PUT /api/admin/orders/:id` - Update order status (admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/users/:id` - Update user
- ... (see api_routes.ts for full list)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove from cart

### Reviews
- `GET /api/products/:id/reviews` - Product reviews
- `POST /api/reviews` - Create review
- `PUT /api/admin/reviews/:id/moderate` - Moderate review (admin)

### Chat
- `GET /api/chat/conversations` - User conversations
- `POST /api/chat/send` - Send message
- Socket.IO for real-time messaging

## Running the Project

### Development Mode

1. **Start Backend** (Terminal 1):
```bash
npm run dev
# Backend runs on http://localhost:3333
```

2. **Start Frontend** (Terminal 2):
```bash
npm run dev:web
# Or manually: cd web-shop && npm start
# Frontend runs on http://localhost:3000
```

### Access Points

- **Frontend (Users)**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin (login with admin account)
- **Partner Dashboard**: http://localhost:3000/manager (login with partner account)
- **Backend API**: http://localhost:3333/api/*
- **Backend Home** (Inertia): http://localhost:3333 (not used much)

## Key Files to Know

### Backend
- `start/api_routes.ts` - All API endpoint definitions
- `app/controllers/` - Business logic for each endpoint
- `app/models/` - Database schema definitions
- `app/middleware/jwt_auth_middleware.ts` - JWT authentication
- `providers/mongo_provider.ts` - MongoDB connection
- `providers/socket_provider.ts` - Socket.IO setup

### Frontend
- `web-shop/src/App.js` - Main routes configuration
- `web-shop/src/api/axiosConfig.js` - API base URL and interceptors
- `web-shop/src/context/AuthContext.js` - User authentication state
- `web-shop/src/pages/admin/AdminDashboard.js` - Main admin interface
- `web-shop/src/components/route/PrivateRoute.js` - Protected route wrapper

## Notes

-  The `inertia/` folder exists but is NOT actively used. The main frontend is in `web-shop/`
-  The `backoffice/` folder should NOT exist (it's deleted/empty)
-  Admin UI is part of `web-shop/src/pages/admin/`, not a separate app
-  All user roles (admin, partner, client) use the same React app with different routes
-  Backend is pure REST API + Socket.IO, no server-side rendering for main app
