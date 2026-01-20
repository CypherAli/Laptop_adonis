/**
 * Seed với đa dạng giới tính (Nam, Nữ, Unisex) và nhiều màu sắc
 * Run: node scripts/seed_diverse_products.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adonis_shoe_shop')
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error)
    process.exit(1)
  }
}

// Schemas
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  brand: String,
  category: String,
  basePrice: Number,
  variants: [{
    variantName: String,
    sku: String,
    price: Number,
    originalPrice: Number,
    stock: Number,
    specifications: {
      size: String,
      color: String,
      material: String,
      gender: String,
    },
    isAvailable: Boolean,
  }],
  images: [String],
  features: [String],
  warranty: {
    duration: String,
    details: String,
  },
  isActive: Boolean,
  isFeatured: Boolean,
  createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true })

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
})

const Product = mongoose.model('Product', productSchema)
const User = mongoose.model('User', userSchema)

// Data với đa dạng giới tính và màu sắc
const diverseProducts = [
  {
    name: 'Nike Air Jordan 1 Retro High',
    description: 'Biểu tượng bóng rổ huyền thoại với thiết kế cổ điển. Đa dạng màu sắc và giới tính.',
    brand: 'Nike',
    category: 'Basketball',
    basePrice: 4500000,
    variants: [
      // Nam - 7 màu
      { variantName: 'Nam Size 41 - Black', sku: 'AJ1-M-41-BK', price: 4500000, originalPrice: 5500000, stock: 10, specifications: { size: '41', color: 'Black', material: 'Leather', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 41 - White', sku: 'AJ1-M-41-WT', price: 4500000, originalPrice: 5500000, stock: 12, specifications: { size: '41', color: 'White', material: 'Leather', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 41 - Red', sku: 'AJ1-M-41-RD', price: 4600000, originalPrice: 5600000, stock: 8, specifications: { size: '41', color: 'Red', material: 'Leather', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 41 - Blue', sku: 'AJ1-M-41-BL', price: 4550000, originalPrice: 5550000, stock: 10, specifications: { size: '41', color: 'Blue', material: 'Leather', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 41 - Green', sku: 'AJ1-M-41-GR', price: 4500000, originalPrice: 5500000, stock: 7, specifications: { size: '41', color: 'Green', material: 'Leather', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 41 - Yellow', sku: 'AJ1-M-41-YL', price: 4650000, originalPrice: 5650000, stock: 6, specifications: { size: '41', color: 'Yellow', material: 'Leather', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 41 - Orange', sku: 'AJ1-M-41-OR', price: 4600000, originalPrice: 5600000, stock: 9, specifications: { size: '41', color: 'Orange', material: 'Leather', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 41 - Purple', sku: 'AJ1-M-41-PR', price: 4700000, originalPrice: 5700000, stock: 5, specifications: { size: '41', color: 'Purple', material: 'Leather', gender: 'Nam' }, isAvailable: true },
      
      // Nữ - 7 màu
      { variantName: 'Nữ Size 36 - Black', sku: 'AJ1-F-36-BK', price: 4400000, originalPrice: 5400000, stock: 12, specifications: { size: '36', color: 'Black', material: 'Leather', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 36 - White', sku: 'AJ1-F-36-WT', price: 4400000, originalPrice: 5400000, stock: 15, specifications: { size: '36', color: 'White', material: 'Leather', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 36 - Pink', sku: 'AJ1-F-36-PK', price: 4500000, originalPrice: 5500000, stock: 18, specifications: { size: '36', color: 'Pink', material: 'Leather', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 36 - Blue', sku: 'AJ1-F-36-BL', price: 4450000, originalPrice: 5450000, stock: 10, specifications: { size: '36', color: 'Blue', material: 'Leather', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 36 - Purple', sku: 'AJ1-F-36-PR', price: 4600000, originalPrice: 5600000, stock: 14, specifications: { size: '36', color: 'Purple', material: 'Leather', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 36 - Yellow', sku: 'AJ1-F-36-YL', price: 4550000, originalPrice: 5550000, stock: 8, specifications: { size: '36', color: 'Yellow', material: 'Leather', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 36 - Red', sku: 'AJ1-F-36-RD', price: 4500000, originalPrice: 5500000, stock: 11, specifications: { size: '36', color: 'Red', material: 'Leather', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 36 - Green', sku: 'AJ1-F-36-GR', price: 4450000, originalPrice: 5450000, stock: 9, specifications: { size: '36', color: 'Green', material: 'Leather', gender: 'Nữ' }, isAvailable: true },
      
      // Unisex - 7 màu
      { variantName: 'Unisex Size 39 - Black', sku: 'AJ1-U-39-BK', price: 4500000, originalPrice: 5500000, stock: 20, specifications: { size: '39', color: 'Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - White', sku: 'AJ1-U-39-WT', price: 4500000, originalPrice: 5500000, stock: 22, specifications: { size: '39', color: 'White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Red', sku: 'AJ1-U-39-RD', price: 4550000, originalPrice: 5550000, stock: 15, specifications: { size: '39', color: 'Red', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Blue', sku: 'AJ1-U-39-BL', price: 4550000, originalPrice: 5550000, stock: 18, specifications: { size: '39', color: 'Blue', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Grey', sku: 'AJ1-U-39-GY', price: 4500000, originalPrice: 5500000, stock: 16, specifications: { size: '39', color: 'Grey', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Orange', sku: 'AJ1-U-39-OR', price: 4600000, originalPrice: 5600000, stock: 12, specifications: { size: '39', color: 'Orange', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Green', sku: 'AJ1-U-39-GR', price: 4550000, originalPrice: 5550000, stock: 10, specifications: { size: '39', color: 'Green', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes-Pz6fZ9.png',
    ],
    features: ['Thiết kế iconic', 'Upper da cao cấp', 'Đệm Air-Sole', 'Đa dạng màu sắc'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike React Infinity Run Flyknit 3',
    description: 'Giày chạy bộ với công nghệ React Foam. Đa dạng màu sắc cho cả Nam, Nữ, Unisex.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 3600000,
    variants: [
      // Nam
      { variantName: 'Nam Size 42 - Black', sku: 'REACT-M-42-BK', price: 3600000, originalPrice: 4500000, stock: 15, specifications: { size: '42', color: 'Black', material: 'Flyknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 42 - White', sku: 'REACT-M-42-WT', price: 3600000, originalPrice: 4500000, stock: 12, specifications: { size: '42', color: 'White', material: 'Flyknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 42 - Blue', sku: 'REACT-M-42-BL', price: 3650000, originalPrice: 4550000, stock: 10, specifications: { size: '42', color: 'Blue', material: 'Flyknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 42 - Red', sku: 'REACT-M-42-RD', price: 3650000, originalPrice: 4550000, stock: 8, specifications: { size: '42', color: 'Red', material: 'Flyknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 42 - Green', sku: 'REACT-M-42-GR', price: 3600000, originalPrice: 4500000, stock: 9, specifications: { size: '42', color: 'Green', material: 'Flyknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 42 - Orange', sku: 'REACT-M-42-OR', price: 3700000, originalPrice: 4600000, stock: 7, specifications: { size: '42', color: 'Orange', material: 'Flyknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 42 - Grey', sku: 'REACT-M-42-GY', price: 3600000, originalPrice: 4500000, stock: 11, specifications: { size: '42', color: 'Grey', material: 'Flyknit', gender: 'Nam' }, isAvailable: true },
      
      // Nữ
      { variantName: 'Nữ Size 37 - Black', sku: 'REACT-F-37-BK', price: 3500000, originalPrice: 4400000, stock: 14, specifications: { size: '37', color: 'Black', material: 'Flyknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 37 - White', sku: 'REACT-F-37-WT', price: 3500000, originalPrice: 4400000, stock: 16, specifications: { size: '37', color: 'White', material: 'Flyknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 37 - Pink', sku: 'REACT-F-37-PK', price: 3600000, originalPrice: 4500000, stock: 20, specifications: { size: '37', color: 'Pink', material: 'Flyknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 37 - Purple', sku: 'REACT-F-37-PR', price: 3650000, originalPrice: 4550000, stock: 18, specifications: { size: '37', color: 'Purple', material: 'Flyknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 37 - Blue', sku: 'REACT-F-37-BL', price: 3550000, originalPrice: 4450000, stock: 12, specifications: { size: '37', color: 'Blue', material: 'Flyknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 37 - Yellow', sku: 'REACT-F-37-YL', price: 3650000, originalPrice: 4550000, stock: 10, specifications: { size: '37', color: 'Yellow', material: 'Flyknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 37 - Green', sku: 'REACT-F-37-GR', price: 3550000, originalPrice: 4450000, stock: 11, specifications: { size: '37', color: 'Green', material: 'Flyknit', gender: 'Nữ' }, isAvailable: true },
      
      // Unisex
      { variantName: 'Unisex Size 39 - Black', sku: 'REACT-U-39-BK', price: 3600000, originalPrice: 4500000, stock: 22, specifications: { size: '39', color: 'Black', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - White', sku: 'REACT-U-39-WT', price: 3600000, originalPrice: 4500000, stock: 25, specifications: { size: '39', color: 'White', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Grey', sku: 'REACT-U-39-GY', price: 3600000, originalPrice: 4500000, stock: 18, specifications: { size: '39', color: 'Grey', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Blue', sku: 'REACT-U-39-BL', price: 3650000, originalPrice: 4550000, stock: 15, specifications: { size: '39', color: 'Blue', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Red', sku: 'REACT-U-39-RD', price: 3650000, originalPrice: 4550000, stock: 12, specifications: { size: '39', color: 'Red', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Green', sku: 'REACT-U-39-GR', price: 3600000, originalPrice: 4500000, stock: 10, specifications: { size: '39', color: 'Green', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 39 - Orange', sku: 'REACT-U-39-OR', price: 3700000, originalPrice: 4600000, stock: 8, specifications: { size: '39', color: 'Orange', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/ca0f57ad-f13c-40e1-aae4-f5fd81c85a6d/react-infinity-run-flyknit-3-road-running-shoes-JsPnRN.png',
    ],
    features: ['React Foam đệm', 'Flyknit upper', '7+ màu sắc', 'Cho cả Nam, Nữ, Unisex'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Giày chạy bộ Adidas với công nghệ Boost. Đa dạng màu sắc và giới tính.',
    brand: 'Adidas',
    category: 'Running',
    basePrice: 4200000,
    variants: [
      // Nam
      { variantName: 'Nam Size 43 - Black', sku: 'UB22-M-43-BK', price: 4200000, originalPrice: 5200000, stock: 12, specifications: { size: '43', color: 'Black', material: 'Primeknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 43 - White', sku: 'UB22-M-43-WT', price: 4200000, originalPrice: 5200000, stock: 10, specifications: { size: '43', color: 'White', material: 'Primeknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 43 - Blue', sku: 'UB22-M-43-BL', price: 4250000, originalPrice: 5250000, stock: 8, specifications: { size: '43', color: 'Blue', material: 'Primeknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 43 - Red', sku: 'UB22-M-43-RD', price: 4300000, originalPrice: 5300000, stock: 7, specifications: { size: '43', color: 'Red', material: 'Primeknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 43 - Green', sku: 'UB22-M-43-GR', price: 4250000, originalPrice: 5250000, stock: 9, specifications: { size: '43', color: 'Green', material: 'Primeknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 43 - Grey', sku: 'UB22-M-43-GY', price: 4200000, originalPrice: 5200000, stock: 11, specifications: { size: '43', color: 'Grey', material: 'Primeknit', gender: 'Nam' }, isAvailable: true },
      { variantName: 'Nam Size 43 - Orange', sku: 'UB22-M-43-OR', price: 4300000, originalPrice: 5300000, stock: 6, specifications: { size: '43', color: 'Orange', material: 'Primeknit', gender: 'Nam' }, isAvailable: true },
      
      // Nữ
      { variantName: 'Nữ Size 38 - Black', sku: 'UB22-F-38-BK', price: 4100000, originalPrice: 5100000, stock: 14, specifications: { size: '38', color: 'Black', material: 'Primeknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 38 - White', sku: 'UB22-F-38-WT', price: 4100000, originalPrice: 5100000, stock: 16, specifications: { size: '38', color: 'White', material: 'Primeknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 38 - Pink', sku: 'UB22-F-38-PK', price: 4200000, originalPrice: 5200000, stock: 18, specifications: { size: '38', color: 'Pink', material: 'Primeknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 38 - Purple', sku: 'UB22-F-38-PR', price: 4250000, originalPrice: 5250000, stock: 15, specifications: { size: '38', color: 'Purple', material: 'Primeknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 38 - Blue', sku: 'UB22-F-38-BL', price: 4150000, originalPrice: 5150000, stock: 12, specifications: { size: '38', color: 'Blue', material: 'Primeknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 38 - Yellow', sku: 'UB22-F-38-YL', price: 4250000, originalPrice: 5250000, stock: 10, specifications: { size: '38', color: 'Yellow', material: 'Primeknit', gender: 'Nữ' }, isAvailable: true },
      { variantName: 'Nữ Size 38 - Green', sku: 'UB22-F-38-GR', price: 4150000, originalPrice: 5150000, stock: 11, specifications: { size: '38', color: 'Green', material: 'Primeknit', gender: 'Nữ' }, isAvailable: true },
      
      // Unisex
      { variantName: 'Unisex Size 40 - Black', sku: 'UB22-U-40-BK', price: 4200000, originalPrice: 5200000, stock: 20, specifications: { size: '40', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 40 - White', sku: 'UB22-U-40-WT', price: 4200000, originalPrice: 5200000, stock: 22, specifications: { size: '40', color: 'White', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 40 - Grey', sku: 'UB22-U-40-GY', price: 4200000, originalPrice: 5200000, stock: 18, specifications: { size: '40', color: 'Grey', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 40 - Blue', sku: 'UB22-U-40-BL', price: 4250000, originalPrice: 5250000, stock: 15, specifications: { size: '40', color: 'Blue', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 40 - Red', sku: 'UB22-U-40-RD', price: 4300000, originalPrice: 5300000, stock: 12, specifications: { size: '40', color: 'Red', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 40 - Green', sku: 'UB22-U-40-GR', price: 4250000, originalPrice: 5250000, stock: 10, specifications: { size: '40', color: 'Green', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Unisex Size 40 - Orange', sku: 'UB22-U-40-OR', price: 4300000, originalPrice: 5300000, stock: 8, specifications: { size: '40', color: 'Orange', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_Light_Shoes_Black_GY9350_01_standard.jpg',
    ],
    features: ['Công nghệ Boost', 'Primeknit upper', '7+ màu sắc', 'Đa dạng giới tính'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
]

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB()

    console.log('🗑️  Clearing existing products...')
    await Product.deleteMany({})

    console.log('👤 Finding admin user...')
    let adminUser = await User.findOne({ role: 'admin' })
    
    if (!adminUser) {
      console.log('Creating admin user...')
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@adonis.com',
        role: 'admin'
      })
    }

    console.log('📦 Seeding products with diverse gender and colors...')
    const productsWithCreator = diverseProducts.map(product => ({
      ...product,
      createdBy: adminUser._id
    }))

    await Product.insertMany(productsWithCreator)

    const productCount = await Product.countDocuments()
    const variantCount = await Product.aggregate([
      { $unwind: '$variants' },
      { $count: 'total' }
    ])

    console.log('✅ Seed completed!')
    console.log(`   - ${productCount} products created`)
    console.log(`   - ${variantCount[0]?.total || 0} variants created`)
    console.log('   - 3 giới tính: Nam, Nữ, Unisex')
    console.log('   - 7+ màu sắc mỗi sản phẩm')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed Error:', error)
    process.exit(1)
  }
}

seedDatabase()
