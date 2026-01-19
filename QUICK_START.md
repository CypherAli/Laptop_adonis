# 🚀 QUICK START GUIDE - SHOE SHOP

## Bước 1: Khởi động Backend

```bash
cd e:\Adonis
npm run dev
```

✅ Backend sẽ chạy tại: `http://localhost:3333`

---

## Bước 2: Khởi động Frontend

```bash
# Terminal mới
cd e:\Adonis\client
npm start
```

✅ Frontend sẽ chạy tại: `http://localhost:3001`

---

## Bước 3: Seed Sample Shoe Products (Optional)

```bash
# Terminal mới, trong thư mục e:\Adonis
node ace db:seed --files="database/seeders/shoe_product_seeder.ts"
```

Hoặc:

```bash
node scripts/seed_shoe_products.js
```

---

## 🎯 Sample Products Include:

1. **Nike Air Max 270** - Running Shoes (3.5M - 3.6M đ)
2. **Adidas Ultraboost 22** - Running Shoes (4.5M - 4.6M đ)
3. **Converse Chuck Taylor** - Casual Shoes (1.2M - 1.25M đ)
4. **Puma Suede Classic** - Sneakers (2.2M - 2.3M đ)
5. **Vans Old Skool** - Sneakers (1.8M - 1.85M đ)

---

## 📱 Test Features:

### 1. Browse Products
- Vào trang chủ: `http://localhost:3001`
- Xem danh sách giày với filters mới (Size, Color, Brand)

### 2. Product Details
- Click vào 1 sản phẩm
- Thấy thông tin: Size, Color, Material (thay vì RAM, Processor)

### 3. Select Variants
- Chọn size khác nhau
- Thấy giá thay đổi theo variant
- Kiểm tra stock availability

### 4. Add to Cart
- Thêm sản phẩm với variant cụ thể
- Kiểm tra cart hiển thị đúng size/color

### 5. Checkout
- Complete order process
- Xem order detail với thông tin variant đầy đủ

---

## 🔑 Test Accounts

### Admin
- Email: `admin@laptopstore.com`
- Password: `Admin@123`

### Partner (Seller)
- Email: `partner@laptopstore.com`
- Password: `Partner@123`

---

## ⚙️ Database Info

- **Database Name**: `shoe_shop_db`
- **Connection**: MongoDB Atlas
- **Collections**: users, products, orders, carts, reviews

---

## 🛠️ Troubleshooting

### Backend không start?
```bash
# Check .env file
cat .env | grep MONGODB_URI
# Should show: ...shoe_shop_db?...
```

### Frontend blank page?
```bash
# Clear cache & hard refresh
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### No products showing?
```bash
# Seed sample data
node ace db:seed --files="database/seeders/shoe_product_seeder.ts"
```

---

## 📞 Support

Nếu gặp vấn đề, check file: `SHOE_SHOP_MIGRATION.md`

**Happy Testing! 👟✨**
