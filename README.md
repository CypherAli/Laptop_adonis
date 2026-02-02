# Shoe Shop - AdonisJS 6 Backend

Backend API for shoe retail platform built with AdonisJS 6, MongoDB, and React.

## Tech Stack

- **Backend**: AdonisJS 6 (TypeScript)
- **Database**: MongoDB + Mongoose ODM
- **Frontend**: React SPA (in web-shop folder)
- **Auth**: JWT + Session-based
- **Real-time**: Socket.IO

## Project Structure

```
Adonis/                          # Backend API (THIS PROJECT)
├── app/
│   ├── controllers/            # API controllers (admin, products, orders, etc.)
│   ├── models/                 # MongoDB models
│   └── middleware/             # Auth, JWT, Admin middleware
├── inertia/
│   ├── app/                    # React app entry (Inertia.js - optional)
│   └── pages/                  # Inertia pages (not actively used)
├── start/
│   ├── api_routes.ts           # REST API endpoints
│   └── routes.ts               # Server routes
└── config/                      # App configuration

web-shop/                        # Frontend React SPA (SEPARATE PROJECT)
└── src/
    ├── pages/
    │   ├── admin/              # Admin dashboard & management
    │   ├── user/               # Customer pages (cart, orders, profile)
    │   └── partner/            # Partner/seller pages
    ├── components/             # Shared React components
    └── context/                # React context (Auth, Cart, etc.)
```

## Features

- 🎯 Admin Dashboard (React SPA in web-shop)
- 👟 Product management (multi-variant shoes)
- 📦 Order management
- 👥 User management
- 🏪 Partner/seller management
- ⭐ Reviews & ratings moderation
- 💬 Real-time chat (Socket.IO)
- 🛒 Shopping cart
- ❤️ Wishlist
- 🔔 Notifications

## Quick Start

```bash
# Install backend dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB connection

# Start backend development server
npm run dev              # Backend API on :3333

# In another terminal - Start frontend
npm run dev:web          # React app on :3000

# Or manually:
cd web-shop
npm install
npm start
```

## Development

- **Backend**: `npm run dev` (Port 3333)
- **Frontend**: `npm run dev:web` (Port 3000)
- **Build**: `npm run build`
- **Type check**: `npm run typecheck`
- **Lint**: `npm run lint`

## API Endpoints

- **Admin**: `http://localhost:3333/api/admin/*`
- **Products**: `http://localhost:3333/api/products`
- **Orders**: `http://localhost:3333/api/orders`
- **Auth**: `http://localhost:3333/api/auth/*`
- **Cart**: `http://localhost:3333/api/cart`
- **Chat**: `http://localhost:3333/api/chat`

## Frontend Routes

- **Home**: `http://localhost:3000/`
- **Admin Dashboard**: `http://localhost:3000/admin` (requires admin role)
- **Partner Dashboard**: `http://localhost:3000/manager` (requires partner role)
- **User Profile**: `http://localhost:3000/profile`
- **Cart**: `http://localhost:3000/cart`
- **Orders**: `http://localhost:3000/orders`

## Status

- Zero TypeScript errors
- Zero linting errors
- Production ready
