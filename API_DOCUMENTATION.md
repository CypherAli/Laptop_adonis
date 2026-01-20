# 📚 API DOCUMENTATION - SHOE SHOP

## 🔗 Base URL
```
http://localhost:3333/api
```

---

## 🔐 AUTHENTICATION

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string (required, 3-50 chars)",
  "email": "string (required, unique)",
  "password": "string (required, min 6 chars)",
  "role": "client | partner | admin (default: client)",
  "shopName": "string (required if role=partner)"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string (required)",
  "password": "string (required)"
}

Response: {
  "token": "JWT_TOKEN",
  "user": {...},
  "message": "Đăng nhập thành công!"
}
```

### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { "user": {...} }
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "phone": "string",
  "shopName": "string (partner only)",
  "currentPassword": "string (if changing password)",
  "newPassword": "string (if changing password)"
}
```

---

## 👟 PRODUCTS

### Get All Products (Public)
```http
GET /api/products?page=1&limit=10&search=nike&brand=Nike&size=42&color=Đen&minPrice=1000000&maxPrice=3000000&inStock=true&sortBy=price_asc

Response: {
  "products": [...],
  "currentPage": 1,
  "totalPages": 10,
  "totalProducts": 100
}
```

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string
- `brand`: comma-separated (Nike,Adidas)
- `size`: comma-separated (42,43)
- `color`: comma-separated
- `material`: comma-separated
- `minPrice`: number
- `maxPrice`: number
- `inStock`: true|false
- `sortBy`: price_asc|price_desc|popular|recent

### Get Single Product (Public)
```http
GET /api/products/:id

Response: {
  "product": {
    "_id": "...",
    "name": "Nike Air Max 270",
    "brand": "Nike",
    "category": "Running",
    "variants": [
      {
        "variantName": "Size 42 - Đen",
        "sku": "NIKE-AM270-42-BLK",
        "price": 2500000,
        "stock": 10,
        "specifications": {
          "size": "42",
          "color": "Đen",
          "material": "Mesh",
          "shoeType": "Running",
          "gender": "Nam"
        },
        "isAvailable": true
      }
    ],
    "images": ["url1.jpg"],
    "rating": { "average": 4.5, "count": 20 },
    "soldCount": 100
  }
}
```

### Create Product (Partner/Admin)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string (required)",
  "description": "string (required)",
  "brand": "string (required)",
  "category": "string (required)",
  "basePrice": number (required),
  "variants": [
    {
      "variantName": "string (required)",
      "sku": "string (required, unique)",
      "price": number (required),
      "stock": number (default: 0),
      "specifications": {
        "size": "string",
        "color": "string",
        "material": "string",
        "shoeType": "string",
        "gender": "string"
      },
      "isAvailable": boolean
    }
  ],
  "images": ["string"],
  "features": ["string"],
  "warranty": {
    "duration": "string",
    "details": "string"
  }
}
```

### Update Product (Partner/Admin)
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  # Same as Create
}
```

### Delete Product (Partner/Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <token>

Response: { "message": "Xóa sản phẩm thành công" }
```

### Get Featured Products
```http
GET /api/products/featured?limit=10

Response: { "products": [...] }
```

---

## 🛒 CART

### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>

Response: {
  "cart": {
    "items": [
      {
        "product": {...},
        "variantSku": "NIKE-AM270-42-BLK",
        "quantity": 2,
        "price": 2500000,
        "seller": {...}
      }
    ],
    "total": 5000000,
    "totalItems": 2
  }
}
```

### Add Item to Cart
```http
POST /api/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "string (required)",
  "variantSku": "string (required)",
  "quantity": number (default: 1)
}

Response: { "message": "Đã thêm vào giỏ hàng", "cart": {...} }
```

### Update Cart Item
```http
PUT /api/cart/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": number (required, min: 1)
}

Response: { "message": "Đã cập nhật giỏ hàng", "cart": {...} }
```

### Remove Cart Item
```http
DELETE /api/cart/items/:itemId
Authorization: Bearer <token>

Response: { "message": "Đã xóa sản phẩm khỏi giỏ hàng", "cart": {...} }
```

### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <token>

Response: { "message": "Đã xóa toàn bộ giỏ hàng" }
```

---

## 📦 ORDERS

### Get My Orders
```http
GET /api/orders?page=1&limit=10&status=delivered
Authorization: Bearer <token>

Response: {
  "orders": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalOrders": 50
}
```

**Roles:**
- Client: Xem orders của mình
- Partner: Xem orders có sản phẩm của mình
- Admin: Xem tất cả orders

### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>

Response: { "order": {...} }
```

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "productId (required)",
      "variantSku": "string (required)",
      "quantity": number (required)",
      "sellerName": "string"
    }
  ],
  "shippingAddress": {
    "fullName": "string (required)",
    "phone": "string (required)",
    "address": {
      "street": "string (required)",
      "ward": "string",
      "district": "string (required)",
      "city": "string (required)",
      "zipCode": "string"
    }
  },
  "paymentMethod": "cod | card | bank_transfer | ewallet (default: cod)",
  "notes": "string"
}

Response: {
  "message": "Đặt hàng thành công",
  "order": {
    "orderNumber": "ORD-20260120-1234",
    "status": "confirmed",
    "totalAmount": 5030000,
    ...
  }
}
```

### Update Order Status (Partner/Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "pending | confirmed | processing | shipped | delivered | cancelled",
  "note": "string"
}

Response: { "message": "Cập nhật trạng thái đơn hàng thành công", "order": {...} }
```

### Cancel Order
```http
POST /api/orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "string"
}

Response: { "message": "Hủy đơn hàng thành công", "order": {...} }
```

---

## ⭐ REVIEWS

### Get Reviews for Product (Public)
```http
GET /api/reviews/product/:productId?page=1&limit=10&rating=5&sortBy=recent

Response: {
  "reviews": [
    {
      "user": { "username": "...", "avatar": "..." },
      "rating": 5,
      "title": "Giày rất tốt",
      "comment": "...",
      "pros": ["Êm", "Nhẹ"],
      "cons": ["Giá cao"],
      "isVerifiedPurchase": true,
      "helpfulCount": 10,
      "createdAt": "..."
    }
  ],
  "totalReviews": 20
}
```

**Sort Options:**
- `recent`: Mới nhất
- `helpful`: Hữu ích nhất
- `rating_high`: Rating cao
- `rating_low`: Rating thấp

### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "string (required)",
  "rating": number (required, 1-5),
  "title": "string (required, max 200)",
  "comment": "string (required, max 2000)",
  "images": ["string"],
  "pros": ["string"],
  "cons": ["string"]
}

Response: { "message": "Đánh giá thành công", "review": {...} }
```

**Requirements:**
- ✅ Must have delivered order
- ✅ One review per user per product
- ✅ Auto set isVerifiedPurchase = true

### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": number,
  "title": "string",
  "comment": "string",
  "images": ["string"],
  "pros": ["string"],
  "cons": ["string"]
}

Response: { "message": "Cập nhật đánh giá thành công", "review": {...} }
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>

Response: { "message": "Xóa đánh giá thành công" }
```

### Mark Review as Helpful
```http
POST /api/reviews/:id/helpful
Authorization: Bearer <token>

Response: { "message": "Đã đánh dấu hữu ích", "review": {...} }
```

---

## 👑 ADMIN

### Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>

Response: {
  "stats": {
    "totalUsers": 100,
    "totalPartners": 10,
    "totalProducts": 500,
    "totalOrders": 1000,
    "pendingPartners": 3,
    "totalRevenue": 50000000
  },
  "orderStats": [...]
}
```

### Manage Users
```http
# Get all users
GET /api/admin/users?page=1&limit=20&role=partner&isActive=true&search=nike

# Approve partner
PUT /api/admin/users/:userId/approve

# Reject/Revoke partner
PUT /api/admin/users/:userId/reject

# Lock/Unlock user
PUT /api/admin/users/:userId/toggle-status
```

### Manage Products
```http
# Get all products (admin view)
GET /api/admin/products?page=1&isActive=true&isFeatured=false

# Toggle featured
PUT /api/admin/products/:productId/toggle-featured
```

### Manage Reviews
```http
# Get all reviews
GET /api/admin/reviews?page=1&isApproved=false

# Approve/Reject review
PUT /api/admin/reviews/:reviewId/moderate
Content-Type: application/json
{
  "isApproved": boolean
}
```

### Analytics
```http
GET /api/admin/analytics?startDate=2026-01-01&endDate=2026-01-31

Response: {
  "salesByDate": [...],
  "topProducts": [...]
}
```

---

## 🔒 PERMISSIONS MATRIX

| Endpoint | Client | Partner (Approved) | Admin |
|----------|--------|-------------------|-------|
| GET /products | ✅ | ✅ | ✅ |
| POST /products | ❌ | ✅ | ✅ |
| PUT /products/:id | ❌ | ✅ (own) | ✅ |
| DELETE /products/:id | ❌ | ✅ (own) | ✅ |
| GET /cart | ✅ | ✅ | ✅ |
| POST /orders | ✅ | ✅ | ✅ |
| PUT /orders/:id/status | ❌ | ✅ (own items) | ✅ |
| POST /reviews | ✅ (purchased) | ✅ (purchased) | ✅ |
| GET /admin/* | ❌ | ❌ | ✅ |

---

## ⚠️ ERROR RESPONSES

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 403 Forbidden
```json
{
  "message": "Bạn không có quyền truy cập"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Lỗi server",
  "error": "Error details"
}
```

---

## 🚀 POSTMAN COLLECTION

Import this URL to Postman:
```
# Coming soon
```

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-20  
**Base URL:** http://localhost:3333/api
