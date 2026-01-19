# 🐳 DOCKER MONGODB SETUP - SHOE SHOP

## ✅ ĐÃ SETUP

- **docker-compose.yml** được tạo
- MongoDB container + Mongo Express (Web UI)
- Database: `shoe_shop_db`
- Connection: `mongodb://localhost:27017/shoe_shop_db`

---

## 🚀 CÁCH SỬ DỤNG

### 1. Start MongoDB Container

```powershell
cd e:\Adonis
docker-compose up -d
```

**Services sẽ chạy:**
- ✅ MongoDB: `localhost:27017`
- ✅ Mongo Express (Web UI): `http://localhost:8081`

### 2. Kiểm tra Container đang chạy

```powershell
docker ps
```

Sẽ thấy:
- `shoe_shop_mongodb`
- `shoe_shop_mongo_express`

### 3. Access Mongo Express (Web UI)

Mở browser: `http://localhost:8081`

**Login:**
- Username: `admin`
- Password: `admin123`

### 4. Start Backend & Seed Data

```powershell
# Terminal 1 - Backend
cd e:\Adonis
npm run dev

# Terminal 2 - Seed shoes
cd e:\Adonis
node ace db:seed --files="database/seeders/shoe_product_seeder.ts"
```

### 5. Xem Database

**Option A: Mongo Express**
- Vào: http://localhost:8081
- Click database: `shoe_shop_db`
- Xem collections: users, products, orders

**Option B: MongoDB Compass**
- Connection string: `mongodb://localhost:27017`
- Refresh → Thấy database `shoe_shop_db`

---

## 🛑 STOP/RESTART MONGODB

```powershell
# Stop containers
docker-compose down

# Start lại
docker-compose up -d

# Restart
docker-compose restart

# Xem logs
docker-compose logs -f mongodb
```

---

## 🗑️ XÓA DATA & CONTAINER

```powershell
# Stop và xóa containers + volumes
docker-compose down -v

# Xóa tất cả (data sẽ mất!)
docker-compose down -v --remove-orphans
```

---

## 📊 DATA PERSISTENCE

Data được lưu trong Docker volumes:
- `mongodb_data` - Database files
- `mongodb_config` - Config files

**Data sẽ được giữ** ngay cả khi stop container!

---

## ✅ VERIFIED

- ✅ MongoDB container ready
- ✅ Mongo Express web UI
- ✅ Connection string updated
- ✅ File laptopImages.js đã xóa

**Giờ chỉ cần start docker và chạy app! 🎉**

```powershell
docker-compose up -d
npm run dev
```
