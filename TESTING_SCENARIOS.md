# 🧪 TESTING SCENARIOS - SHOE SHOP API

## 📋 **TEST CHECKLIST**

### **✅ 1. AUTHENTICATION & AUTHORIZATION**

#### **Test 1.1: Register & Login**
```bash
# Register Client
POST /api/auth/register
{
  "username": "client1",
  "email": "client1@test.com",
  "password": "123456",
  "role": "client"
}

# Register Partner
POST /api/auth/register
{
  "username": "partner1",
  "email": "partner1@test.com",
  "password": "123456",
  "role": "partner",
  "shopName": "Nike Store VN"
}

# Login
POST /api/auth/login
{
  "email": "client1@test.com",
  "password": "123456"
}
# Response: { token, user }
```

**Expected:**
- ✅ Client registered → role: "client"
- ✅ Partner registered → isApproved: false
- ✅ Login returns JWT token

---

### **✅ 2. ADMIN - APPROVE PARTNER**

```bash
# Login as Admin first
POST /api/auth/login
{
  "email": "admin@test.com",
  "password": "admin123"
}

# Get pending partners
GET /api/admin/users?role=partner&isApproved=false
Headers: Authorization: Bearer <admin_token>

# Approve partner
PUT /api/admin/users/{userId}/approve
Headers: Authorization: Bearer <admin_token>
```

**Expected:**
- ✅ Admin can see pending partners
- ✅ After approve, partner can create products

---

### **✅ 3. PRODUCTS - CRUD WITH PERMISSIONS**

#### **Test 3.1: Partner Create Product**
```bash
POST /api/products
Headers: Authorization: Bearer <partner_token>
{
  "name": "Nike Air Max 270",
  "description": "Giày chạy bộ cao cấp",
  "brand": "Nike",
  "category": "Running",
  "basePrice": 2500000,
  "variants": [
    {
      "variantName": "Size 42 - Đen",
      "sku": "NIKE-AM270-42-BLK",
      "price": 2500000,
      "stock": 10,
      "specifications": {
        "size": "42",
        "color": "Đen",
        "material": "Mesh + Synthetic",
        "shoeType": "Running",
        "gender": "Nam"
      },
      "isAvailable": true
    }
  ],
  "images": ["url1.jpg"],
  "features": ["Đệm khí", "Siêu nhẹ"]
}
```

**Expected:**
- ✅ Partner approved → Create success
- ❌ Partner not approved → 403 error
- ❌ Client role → 403 error

#### **Test 3.2: Partner Update Own Product**
```bash
PUT /api/products/{productId}
Headers: Authorization: Bearer <partner_token>
{
  "variants": [
    {
      "variantName": "Size 42 - Đen",
      "sku": "NIKE-AM270-42-BLK",
      "price": 2400000,  # Giảm giá
      "stock": 15,       # Tăng stock
      ...
    }
  ]
}
```

**Expected:**
- ✅ Partner can update own product
- ❌ Partner cannot update other's product → 403

---

### **🔥 4. RACE CONDITION TESTS**

#### **Test 4.1: Concurrent Order Creation**
```bash
# Scenario: 10 users đặt cùng lúc 1 sản phẩm (stock = 5)

# User 1-10 đồng thời:
POST /api/orders
{
  "items": [
    {
      "product": "productId",
      "variantSku": "NIKE-AM270-42-BLK",
      "quantity": 1
    }
  ],
  "shippingAddress": {...},
  "paymentMethod": "cod"
}
```

**Expected:**
- ✅ Only first 5 orders succeed
- ✅ Orders 6-10 get error: "Không đủ số lượng"
- ✅ Final stock = 0
- ✅ No overselling

#### **Test 4.2: Spam Add to Cart**
```bash
# Spam click 10 lần liên tiếp
POST /api/cart/items (x10 times)
{
  "productId": "...",
  "variantSku": "NIKE-AM270-42-BLK",
  "quantity": 1
}
```

**Expected:**
- ✅ Cart has only 1 item
- ✅ Quantity = 10
- ✅ No duplicate items

#### **Test 4.3: Double Cancel Order**
```bash
# Cancel 2 lần liên tiếp
POST /api/orders/{orderId}/cancel (1st time)
POST /api/orders/{orderId}/cancel (2nd time)
```

**Expected:**
- ✅ 1st cancel succeeds, stock restored
- ❌ 2nd cancel fails: "Không thể hủy đơn hàng ở trạng thái này"
- ✅ Stock correct (not double-restored)

---

### **✅ 5. ORDER FLOW - FULL CYCLE**

#### **Step 1: Add to Cart**
```bash
POST /api/cart/items
Headers: Authorization: Bearer <client_token>
{
  "productId": "...",
  "variantSku": "NIKE-AM270-42-BLK",
  "quantity": 2
}

# Check cart
GET /api/cart
```

#### **Step 2: Create Order**
```bash
POST /api/orders
Headers: Authorization: Bearer <client_token>
{
  "items": [
    {
      "product": "productId",
      "variantSku": "NIKE-AM270-42-BLK",
      "quantity": 2,
      "sellerName": "Nike Store VN"
    }
  ],
  "shippingAddress": {
    "fullName": "Nguyen Van A",
    "phone": "0123456789",
    "address": {
      "street": "123 Main St",
      "ward": "Ward 1",
      "district": "District 1",
      "city": "Ho Chi Minh",
      "zipCode": "70000"
    }
  },
  "paymentMethod": "cod",
  "notes": "Giao giờ hành chính"
}
```

**Expected:**
- ✅ Order created with status "confirmed"
- ✅ Stock reduced by 2
- ✅ Cart cleared
- ✅ soldCount increased

#### **Step 3: Partner Update Status**
```bash
# Partner login
PUT /api/orders/{orderId}/status
Headers: Authorization: Bearer <partner_token>
{
  "status": "processing",
  "note": "Đang chuẩn bị hàng"
}

# Then shipped
PUT /api/orders/{orderId}/status
{
  "status": "shipped",
  "note": "Đã giao cho shipper"
}

# Then delivered
PUT /api/orders/{orderId}/status
{
  "status": "delivered"
}
```

**Expected:**
- ✅ Partner can only update orders with their products
- ✅ Status history recorded
- ✅ actualDelivery set when delivered

#### **Step 4: Client Review**
```bash
POST /api/reviews
Headers: Authorization: Bearer <client_token>
{
  "productId": "...",
  "rating": 5,
  "title": "Giày rất tốt",
  "comment": "Đi rất êm, nhẹ",
  "pros": ["Êm", "Nhẹ", "Đẹp"],
  "cons": ["Giá hơi cao"]
}
```

**Expected:**
- ✅ Can only review after order delivered
- ✅ isVerifiedPurchase = true
- ✅ Product rating updated
- ❌ Cannot review twice

---

### **⚠️ 6. VALIDATION TESTS**

#### **Test 6.1: Invalid Shipping Address**
```bash
POST /api/orders
{
  "items": [...],
  "shippingAddress": {
    "fullName": "Test"
    # Missing phone, address
  }
}
```

**Expected:**
- ❌ 400 error: "Địa chỉ giao hàng không đầy đủ thông tin"

#### **Test 6.2: Review Without Purchase**
```bash
POST /api/reviews
{
  "productId": "never_bought_product",
  "rating": 5,
  "title": "Fake review",
  "comment": "..."
}
```

**Expected:**
- ❌ 403 error: "Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận hàng"

#### **Test 6.3: Order Out of Stock**
```bash
POST /api/orders
{
  "items": [
    {
      "product": "...",
      "variantSku": "OUT_OF_STOCK_SKU",
      "quantity": 10  # Stock = 2
    }
  ]
}
```

**Expected:**
- ❌ 400 error: "Biến thể ... không đủ số lượng. Còn 2 sản phẩm"

---

### **✅ 7. ADMIN FEATURES**

#### **Test 7.1: Dashboard Statistics**
```bash
GET /api/admin/dashboard
Headers: Authorization: Bearer <admin_token>
```

**Expected:**
```json
{
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

#### **Test 7.2: Manage Users**
```bash
# Get all users
GET /api/admin/users?page=1&limit=20

# Lock user
PUT /api/admin/users/{userId}/toggle-status

# Reject partner
PUT /api/admin/users/{userId}/reject
```

#### **Test 7.3: Manage Products**
```bash
# Get all products
GET /api/admin/products

# Toggle featured
PUT /api/admin/products/{productId}/toggle-featured
```

---

### **📊 8. SEARCH & FILTER**

```bash
# Search products
GET /api/products?search=nike&brand=Nike,Adidas&size=42&color=Đen&minPrice=1000000&maxPrice=3000000&inStock=true&sortBy=price_asc

# Filter orders
GET /api/orders?status=delivered&page=1
```

**Expected:**
- ✅ Correct filtering
- ✅ Pagination works
- ✅ Multiple filters combine

---

## 🎯 **PERFORMANCE TESTS**

### **Load Test Orders:**
```bash
# 100 concurrent users creating orders
ab -n 100 -c 10 -T application/json \
   -H "Authorization: Bearer <token>" \
   -p order_payload.json \
   http://localhost:3333/api/orders
```

**Expected:**
- ✅ No 500 errors
- ✅ Correct stock updates
- ✅ Response time < 2s

---

## ✅ **SUCCESS CRITERIA**

- [ ] All authentication tests pass
- [ ] Race conditions handled correctly
- [ ] No overselling (stock always correct)
- [ ] Permissions enforced (403 for unauthorized)
- [ ] Validations work (400 for invalid data)
- [ ] Transactions rollback on error
- [ ] Admin features work
- [ ] Review requires purchase

---

**Test Date:** 2026-01-20  
**Status:** Ready for Testing  
**MongoDB:** Connected  
**Server:** Running on port 3333
