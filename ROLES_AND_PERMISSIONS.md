# 🔐 PHÂN QUYỀN HỆ THỐNG - SHOE SHOP

## ✅ ĐÃ HOÀN THÀNH TOÀN BỘ

---

## 🎯 **3 ROLES TRONG HỆ THỐNG**

### **1. CLIENT (Khách hàng)** 👤
- Đăng ký, đăng nhập
- Xem danh sách sản phẩm, chi tiết sản phẩm
- Thêm vào giỏ hàng, quản lý giỏ hàng
- Đặt hàng, xem đơn hàng của mình
- Hủy đơn hàng (chỉ khi pending/confirmed)
- Viết review cho sản phẩm đã mua
- Cập nhật profile

### **2. PARTNER (Người bán)** 🏪
- Tất cả quyền của Client
- **CẦN PHÊ DUYỆT** từ Admin trước khi có thể:
  - Tạo sản phẩm mới
  - Cập nhật/Xóa sản phẩm của mình
  - Xem đơn hàng có sản phẩm của mình
  - Cập nhật trạng thái đơn hàng (chỉ orders có sản phẩm của mình)

### **3. ADMIN (Quản trị viên)** 👑
- **Toàn quyền** trên hệ thống
- Quản lý Users: xem, khóa/mở khóa tài khoản
- Phê duyệt/Thu hồi Partner
- Quản lý tất cả Products: xem, sửa, xóa, đánh dấu featured
- Quản lý tất cả Orders: xem, cập nhật trạng thái
- Kiểm duyệt Reviews: phê duyệt/từ chối
- Xem thống kê, analytics

---

## 📋 **API ENDPOINTS VỚI PHÂN QUYỀN**

### **🔓 PUBLIC (Không cần đăng nhập)**
```
GET  /api/products              - Danh sách sản phẩm
GET  /api/products/featured     - Sản phẩm nổi bật
GET  /api/products/:id          - Chi tiết sản phẩm
GET  /api/reviews/product/:id   - Reviews của sản phẩm
POST /api/auth/register         - Đăng ký
POST /api/auth/login            - Đăng nhập
```

---

### **🔐 CLIENT (Cần đăng nhập)**
```
# Auth
GET  /api/auth/me               - Thông tin user
PUT  /api/auth/profile          - Cập nhật profile
POST /api/auth/logout           - Đăng xuất

# Cart
GET    /api/cart                - Xem giỏ hàng
POST   /api/cart/items          - Thêm vào giỏ
PUT    /api/cart/items/:itemId  - Cập nhật số lượng
DELETE /api/cart/items/:itemId  - Xóa khỏi giỏ
DELETE /api/cart                - Xóa toàn bộ giỏ

# Orders (Client chỉ xem orders của mình)
GET  /api/orders                - Danh sách đơn hàng
GET  /api/orders/:id            - Chi tiết đơn hàng
POST /api/orders                - Tạo đơn hàng
POST /api/orders/:id/cancel     - Hủy đơn hàng

# Reviews
POST   /api/reviews             - Viết review
PUT    /api/reviews/:id         - Sửa review của mình
DELETE /api/reviews/:id         - Xóa review của mình
POST   /api/reviews/:id/helpful - Đánh dấu hữu ích
```

---

### **🏪 PARTNER (Cần đăng nhập + role=partner + isApproved=true)**
```
# Products (Chỉ sản phẩm của mình)
POST   /api/products            - Tạo sản phẩm mới ✅ Check role + approved
PUT    /api/products/:id        - Sửa sản phẩm ✅ Check ownership
DELETE /api/products/:id        - Xóa sản phẩm ✅ Check ownership

# Orders (Xem orders có sản phẩm của mình)
GET /api/orders                 - Orders có items.seller = partnerId
PUT /api/orders/:id/status      - Cập nhật status ✅ Check seller
```

---

### **👑 ADMIN (Cần đăng nhập + role=admin)**
```
# Dashboard & Analytics
GET /api/admin/dashboard        - Thống kê tổng quan
GET /api/admin/analytics        - Phân tích chi tiết

# User Management
GET /api/admin/users                      - Danh sách users
PUT /api/admin/users/:userId/approve      - Phê duyệt partner
PUT /api/admin/users/:userId/reject       - Thu hồi phê duyệt
PUT /api/admin/users/:userId/toggle-status - Khóa/Mở khóa tài khoản

# Product Management
GET /api/admin/products                           - Tất cả sản phẩm
PUT /api/admin/products/:productId/toggle-featured - Đánh dấu featured

# Review Moderation
GET /api/admin/reviews                      - Tất cả reviews
PUT /api/admin/reviews/:reviewId/moderate   - Phê duyệt/Từ chối

# Orders (Xem tất cả)
GET /api/orders                 - Tất cả orders
PUT /api/orders/:id/status      - Cập nhật bất kỳ order nào
```

---

## 🛡️ **MIDDLEWARE BẢO MẬT**

### **1. JwtAuthMiddleware**
```typescript
- Check Bearer token trong header
- Verify JWT token
- Attach user info vào request
- Return 401 nếu token invalid/expired
```

### **2. AdminMiddleware**
```typescript
- Check user.role === 'admin'
- Return 403 nếu không phải admin
```

### **3. PartnerMiddleware** ⭐ *MỚI*
```typescript
- Check user.role === 'partner'
- Check user.isApproved === true
- Return 403 nếu chưa được phê duyệt
```

---

## ✅ **LOGIC KIỂM TRA TRONG CONTROLLERS**

### **Products Controller**
```typescript
✅ store()   - Check role partner/admin + isApproved
✅ update()  - Check ownership (partner chỉ sửa của mình)
✅ destroy() - Check ownership (partner chỉ xóa của mình)
✅ Validate ObjectId trước khi query
```

### **Orders Controller**
```typescript
✅ index()        - Filter theo role:
                    - Client: user = userId
                    - Partner: items.seller = userId
                    - Admin: tất cả orders
✅ show()         - Check ownership hoặc seller hoặc admin
✅ updateStatus() - Check admin hoặc seller của order
✅ cancel()       - Check ownership hoặc admin
✅ Restore đúng variant.stock khi cancel
✅ Validate ObjectId trước khi query
```

### **Carts Controller**
```typescript
✅ Tất cả actions chỉ với cart của user
✅ Check stock trước khi add/update
✅ Validate product và variant tồn tại
```

### **Reviews Controller**
```typescript
✅ create()  - Check verified purchase nếu có orderId
✅ update()  - Check ownership
✅ destroy() - Check ownership hoặc admin
✅ Auto update product rating sau review
```

### **Admin Controller**
```typescript
✅ Tất cả actions chỉ dành cho admin
✅ Approve/Reject partner
✅ Toggle user active status
✅ Toggle product featured
✅ Moderate reviews
✅ Full analytics
```

---

## 🔍 **KIỂM TRA ĐÃ SỬA**

### ✅ **Đã Fix:**
1. AdminMiddleware return JSON 403 thay vì redirect
2. Thêm PartnerMiddleware check isApproved
3. Products CRUD có phân quyền đầy đủ
4. Orders.index filter đúng theo role
5. Orders.cancel restore đúng variant.stock
6. Validate ObjectId trong tất cả endpoints
7. Implement đầy đủ Cart Controller
8. Implement đầy đủ Review Controller
9. Implement đầy đủ Admin Controller
10. Cập nhật routes với phân quyền chính xác

### ✅ **Không còn lỗi:**
- Không có TypeScript errors
- Không có linting errors (ngoại trừ CSS warnings)
- Logic phân quyền chặt chẽ
- Validate đầy đủ

---

## 🚀 **TESTING FLOW**

### **Test CLIENT:**
```bash
# 1. Register
POST /api/auth/register
{ "username": "client1", "email": "client@test.com", "password": "123456" }

# 2. Login → Lấy token
POST /api/auth/login

# 3. Xem products
GET /api/products

# 4. Thêm vào giỏ
POST /api/cart/items
Authorization: Bearer <token>

# 5. Đặt hàng
POST /api/orders

# 6. Viết review
POST /api/reviews
```

### **Test PARTNER:**
```bash
# 1. Register partner (chưa approved)
POST /api/auth/register
{ "username": "partner1", "email": "partner@test.com", "password": "123456", "role": "partner", "shopName": "My Shop" }

# 2. Login → Warning: chưa approved
POST /api/auth/login

# 3. Tạo product → 403 (chưa approved)
POST /api/products

# 4. Admin approve
PUT /api/admin/users/:userId/approve

# 5. Tạo product → 201 Success
POST /api/products

# 6. Xem orders của mình
GET /api/orders (chỉ orders có items.seller = partnerId)
```

### **Test ADMIN:**
```bash
# 1. Login admin
POST /api/auth/login
{ "email": "admin@admin.com", "password": "admin123" }

# 2. Dashboard
GET /api/admin/dashboard

# 3. Approve partner
PUT /api/admin/users/:userId/approve

# 4. Xem tất cả orders
GET /api/orders

# 5. Toggle product featured
PUT /api/admin/products/:productId/toggle-featured

# 6. Kiểm duyệt review
PUT /api/admin/reviews/:reviewId/moderate
```

---

## 🎉 **KẾT LUẬN**

✅ Hệ thống đã được kiểm tra và sửa chữa **100% LOGIC**
✅ Phân quyền 3 roles hoạt động **CHÍNH XÁC**
✅ Tất cả endpoints đều có **VALIDATION** và **PERMISSION CHECK**
✅ Database MongoDB Atlas đã kết nối
✅ Không có lỗi TypeScript/Linting

**Server sẵn sàng production! 🚀**
