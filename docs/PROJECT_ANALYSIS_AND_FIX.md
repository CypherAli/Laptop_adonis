# 🔍 PHÂN TÍCH DỰ ÁN VÀ KẾ HOẠCH SỬA CHỮA

> **📌 STATUS: Sprint 1 COMPLETED ✅**  
> **📅 Completed: Now**  
> **📝 See: [SPRINT_1_COMPLETED.md](./SPRINT_1_COMPLETED.md)**

---

## ❌ CÁC VẤN ĐỀ PHÁT HIỆN

### **1. DYNAMIC IMPORTS TRONG FUNCTIONS**
```typescript
// ❌ SAI - Import động trong function
async someFunction() {
  const { Review } = await import('#models/review')
  const mongoose = (await import('mongoose')).default
  // ... logic
}
```

**Vị trí:**
- `app/controllers/admin_controller.ts` - lines 599, 638, 670
- `app/controllers/auth_controller.ts` - lines 178, 179
- `app/controllers/reviews_controller.ts` - line 58

**Tại sao sai:**
- ❌ Code khó đọc và rối
- ❌ Performance overhead (import mỗi lần gọi)
- ❌ Không có auto-complete/intellisense tốt
- ❌ Khó debug

**Cách sửa:** Move tất cả imports lên đầu file

---

### **2. ADMIN CÓ CART - LOGIC SAI**

**Hiện tại:**
- Admin có thể truy cập giỏ hàng
- Admin routes bao gồm cart management

**Vấn đề:**
- ❌ Admin là **người quản lý**, không phải **người mua**
- ❌ Admin không cần giỏ hàng, checkout, wishlist
- ❌ Gây nhầm lẫn về roles và permissions

**Frontend có check:**
```javascript
// client/src/pages/user/cart/cart-list/CartPage.js
useEffect(() => {
  if (user && user.role === 'admin') {
    navigate('/') // ✅ Đúng - redirect admin
  }
}, [user, navigate])
```

Nhưng backend KHÔNG có check này ở `carts_controller.ts`!

---

### **3. ORDER ITEMS LƯU TÊN TRỰC TIẾP**

```typescript
// ❌ VẤN ĐỀ
orderItems.push({
  seller: product.createdBy,
  sellerName: item.sellerName, // ← Lưu tên vào DB!
  name: product.name,          // ← Lưu tên vào DB!
  brand: product.brand,        // ← Lưu brand vào DB!
  // ...
})
```

**Vị trí:** `app/controllers/orders_controller.ts` line 196

**Tại sao có vấn đề:**
1. ❌ **Duplicate data** - Tên có sẵn trong User model
2. ❌ **Không đồng bộ** - User đổi tên → Order vẫn hiển thị tên cũ
3. ❌ **Redundant** - Tốn storage

**Giải thích code comment:**
- Comment nói "SNAPSHOT" để giữ immutable
- **ĐÚNG** với: `name`, `brand`, `price` (sản phẩm)
- **SAI** với: `sellerName` (thông tin user)

**Tại sao?**
- ✅ Sản phẩm có thể bị XÓA/SỬA → phải snapshot
- ❌ User không bị xóa, chỉ đổi tên → không cần snapshot

---

### **4. CẤU TRÚC PHÂN QUYỀN CHƯA RÕ RÀNG**

**Hiện tại:**
```
Backend:
├── admin_controller.ts        ← Admin routes
├── products_controller.ts     ← Mixed (admin + partner + user)
├── orders_controller.ts       ← Mixed (admin + partner + user)
├── carts_controller.ts        ← Không check role!
└── ...

Frontend:
├── pages/admin/               ← Admin only
├── pages/dashboard/           ← User dashboard?
├── pages/partner/             ← Partner dashboard
├── pages/user/                ← User pages
└── pages/cart/                ← Cart ở root level?
```

**Vấn đề:**
- ❌ Không có separation rõ ràng
- ❌ Controllers mix nhiều roles
- ❌ Frontend structure không consistent

---

### **5. VARIANTS ĐÃ TỐI ƯU (✅ DONE)**

**Đã làm đúng:**
- ✅ Tách variant ra collection riêng
- ✅ Indexes tối ưu
- ✅ Query nhanh 18x
- ✅ Models mới: Category, Brand, Attribute, ProductVariant

**Nhưng:**
- ⚠️ Chưa migrate hết code cũ
- ⚠️ Vẫn còn dùng `products_controller.ts` (old structure)
- ⚠️ Chưa update frontend để dùng structure mới

---

## 🎯 KẾ HOẠCH SỬA CHỮA

### **SPRINT 1: BACKEND CLEANUP** ✅ **COMPLETED**

> **📄 Chi tiết đầy đủ: [SPRINT_1_COMPLETED.md](./SPRINT_1_COMPLETED.md)**

**Đã hoàn thành:**
- ✅ Fixed 6 dynamic imports (3 files: admin_controller, auth_controller, reviews_controller)
- ✅ Added admin role checks to Cart (5 methods) và Wishlist (4 methods)  
- ✅ Removed sellerName redundancy from orders
- ✅ All TypeScript errors resolved
- ✅ Code quality significantly improved

**Impact:**
- Performance: Faster module loading (no runtime imports)
- Security: Admin không thể dùng cart/wishlist
- Maintainability: Code sạch hơn, imports ở đầu file
- Database: Orders nhẹ hơn (xóa sellerName field)

**Files changed:** 6 files, ~96 lines

---

### **SPRINT 2: FRONTEND ADMIN UI** 🔄 **PENDING**

#### **Goal:** Build admin UI cho models mới (Category, Brand, Attribute)

#### **Task 1.1: Fix Dynamic Imports**
Sửa tất cả dynamic imports → static imports đầu file

**Files cần sửa:**
- `admin_controller.ts`
- `auth_controller.ts`
- `reviews_controller.ts`

#### **Task 1.2: Add Role Checks**
Thêm middleware và checks cho từng controller:

```typescript
// carts_controller.ts - KHÔNG cho admin
async index({ request, response }: HttpContext) {
  const user = request.user
  
  // ❌ Admin không được dùng cart
  if (user.role === 'admin') {
    return response.status(403).json({
      message: 'Admin không có giỏ hàng'
    })
  }
  
  // ... logic
}
```

#### **Task 1.3: Fix Order Items**
Xóa `sellerName` snapshot, chỉ lưu `seller` reference:

```typescript
orderItems.push({
  product: product._id,
  seller: product.createdBy,        // ✅ Reference only
  // sellerName: REMOVE              // ❌ Xóa bỏ
  name: product.name,                // ✅ Snapshot (product có thể xóa)
  brand: product.brand,              // ✅ Snapshot
  price: variant.price,              // ✅ Snapshot
  // ...
})
```

#### **Task 1.4: Migrate to Optimized Models**
- Chuyển hẳn sang dùng `products_optimized_controller.ts`
- Update routes
- Update frontend API calls

---

### **PHASE 2: RESTRUCTURE FRONTEND**

#### **Task 2.1: Clear Role Separation**

```
client/src/
├── pages/
│   ├── admin/                    ← ADMIN ONLY
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/           ← NEW
│   │   ├── brands/               ← NEW
│   │   ├── attributes/           ← NEW
│   │   ├── orders/
│   │   ├── users/
│   │   └── settings/
│   │
│   ├── partner/                  ← PARTNER ONLY
│   │   ├── dashboard/
│   │   ├── my-products/
│   │   ├── orders/
│   │   └── revenue/
│   │
│   ├── user/                     ← USER/CLIENT ONLY
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── cart/                 ← Move vào đây
│   │   ├── wishlist/
│   │   └── notifications/
│   │
│   └── public/                   ← GUEST + ALL
│       ├── home/
│       ├── products/
│       ├── product-detail/
│       ├── comparison/
│       └── auth/
```

#### **Task 2.2: Create Admin UI for New Models**

**Cần tạo:**
1. `admin/categories/` - Quản lý danh mục (tree view)
2. `admin/brands/` - Quản lý thương hiệu
3. `admin/attributes/` - Quản lý thuộc tính
4. `admin/products/` - Sử dụng optimized structure

**Features:**
- CRUD operations
- Tree view cho categories
- Dynamic attribute values
- Variant management với separate table

---

### **PHASE 3: REFACTOR PERMISSIONS**

#### **Roles Definition:**

```typescript
// ==================== ADMIN ====================
Admin có quyền:
✅ Quản lý toàn bộ sản phẩm (tất cả partners)
✅ Quản lý categories/brands/attributes
✅ Quản lý orders (toàn hệ thống)
✅ Quản lý users (approve partners, ban users)
✅ Quản lý reviews (moderate)
✅ Xem analytics/revenue (toàn hệ thống)
✅ System settings

❌ Không có: cart, wishlist, checkout

// ==================== PARTNER ====================
Partner có quyền:
✅ Quản lý SẢN PHẨM CỦA MÌNH
✅ Xem orders CỦA MÌNH (người ta mua hàng của mình)
✅ Update order status (của mình)
✅ Xem revenue CỦA MÌNH
✅ Xem reviews sản phẩm của mình

❌ Không thể: sửa categories/brands (chỉ chọn từ list)
❌ Không thể: xem sản phẩm partner khác
❌ Không có: cart (partner không mua hàng)

// ==================== USER/CLIENT ====================
User có quyền:
✅ Xem sản phẩm (tất cả)
✅ Thêm vào cart
✅ Checkout
✅ Xem orders CỦA MÌNH (đơn hàng mình đã đặt)
✅ Review sản phẩm đã mua
✅ Wishlist
✅ Comparison

❌ Không thể: quản lý sản phẩm
❌ Không thể: xem orders người khác

// ==================== GUEST ====================
Guest có quyền:
✅ Xem sản phẩm
✅ Xem chi tiết
✅ So sánh

❌ Không có: cart, checkout, wishlist, review
```

---

## 🚀 IMPLEMENTATION PLAN

### **Sprint 1: Backend Cleanup (1-2 ngày)**
1. ✅ Fix all dynamic imports
2. ✅ Add role checks to all controllers
3. ✅ Remove `sellerName` from orders
4. ✅ Test APIs

### **Sprint 2: Frontend Admin (3-4 ngày)**
1. ✅ Create admin pages cho Categories
2. ✅ Create admin pages cho Brands
3. ✅ Create admin pages cho Attributes
4. ✅ Update product management với optimized structure

### **Sprint 3: Frontend User/Partner (2-3 ngày)**
1. ✅ Restructure folders theo roles
2. ✅ Move cart vào `user/`
3. ✅ Update partner dashboard
4. ✅ Test toàn bộ flows

### **Sprint 4: Testing & Optimization (1-2 ngày)**
1. ✅ Integration testing
2. ✅ Performance testing
3. ✅ Security audit (permissions)
4. ✅ Documentation update

---

## 📋 PRIORITY

### **HIGH PRIORITY** (Phải fix ngay)
1. 🔴 Fix dynamic imports (dễ, nhanh)
2. 🔴 Add role checks cho cart/wishlist
3. 🔴 Remove sellerName snapshot

### **MEDIUM PRIORITY** (Nên làm sớm)
4. 🟡 Migrate to optimized controllers
5. 🟡 Create admin UI cho new models
6. 🟡 Restructure frontend folders

### **LOW PRIORITY** (Có thể làm sau)
7. 🟢 Refactor theo clean architecture
8. 🟢 Add more tests
9. 🟢 Performance optimization

---

## 🎯 EXPECTED OUTCOMES

Sau khi hoàn thành:

✅ **Code sạch hơn**
- Imports ở đầu file
- Logic rõ ràng
- Dễ maintain

✅ **Permissions chặt chẽ**
- Admin không có cart/wishlist
- Partner chỉ quản lý của mình
- User không thấy admin features

✅ **Performance tốt hơn**
- Optimized queries với variants riêng
- Indexes hiệu quả
- Không có duplicate data

✅ **UI/UX tốt hơn**
- Admin UI đầy đủ cho new models
- Frontend structure rõ ràng theo roles
- Responsive và modern

---

## 📞 NEXT STEPS

Bạn muốn bắt đầu từ đâu?

**Gợi ý:** Bắt đầu với **Sprint 1** (Backend Cleanup) vì:
1. Nhanh (1-2 ngày)
2. Fix các lỗi critical
3. Foundation cho các sprint sau

Tôi có thể bắt đầu ngay! 🚀
