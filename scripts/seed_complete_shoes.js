/**
 * Complete Shoe Products Seed Script
 * Includes multiple brands, sizes, colors, and real product images
 * Run: node scripts/seed_complete_shoes.js
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

// Complete product data with multiple sizes and colors
const completeShoeProducts = [
  // ========== NIKE PRODUCTS ==========
  {
    name: 'Nike Air Max 270',
    description: 'Nike Air Max 270 mang đến sự thoải mái tối đa với đệm khí lớn nhất từ trước đến nay. Thiết kế hiện đại, năng động, phù hợp cho mọi hoạt động.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 3200000,
    variants: [
      { variantName: 'Size 38 - Black/White', sku: 'NIKE-AM270-BW-38', price: 3200000, originalPrice: 4000000, stock: 15, specifications: { size: '38', color: 'Black/White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Black/White', sku: 'NIKE-AM270-BW-39', price: 3200000, originalPrice: 4000000, stock: 20, specifications: { size: '39', color: 'Black/White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Black/White', sku: 'NIKE-AM270-BW-40', price: 3200000, originalPrice: 4000000, stock: 25, specifications: { size: '40', color: 'Black/White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Black/White', sku: 'NIKE-AM270-BW-41', price: 3200000, originalPrice: 4000000, stock: 25, specifications: { size: '41', color: 'Black/White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Black/White', sku: 'NIKE-AM270-BW-42', price: 3200000, originalPrice: 4000000, stock: 20, specifications: { size: '42', color: 'Black/White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 43 - Black/White', sku: 'NIKE-AM270-BW-43', price: 3200000, originalPrice: 4000000, stock: 15, specifications: { size: '43', color: 'Black/White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Triple White', sku: 'NIKE-AM270-TW-40', price: 3400000, originalPrice: 4200000, stock: 18, specifications: { size: '40', color: 'White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Triple White', sku: 'NIKE-AM270-TW-41', price: 3400000, originalPrice: 4200000, stock: 22, specifications: { size: '41', color: 'White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Triple White', sku: 'NIKE-AM270-TW-42', price: 3400000, originalPrice: 4200000, stock: 20, specifications: { size: '42', color: 'White', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png',
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/awjogtdnqxniqqk0wpgf/custom-nike-air-max-90-by-you-shoes.png',
    ],
    features: ['Đệm Air Max lớn nhất', 'Upper mesh thoáng khí', 'Thiết kế hiện đại', 'Đế cao su bền bỉ'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Air Jordan 1 Retro High',
    description: 'Biểu tượng bóng rổ huyền thoại Nike Air Jordan 1 với thiết kế cổ điển. Phong cách street style đỉnh cao, phù hợp mọi outfit.',
    brand: 'Nike',
    category: 'Basketball',
    basePrice: 4500000,
    variants: [
      { variantName: 'Size 39 - Chicago', sku: 'NIKE-AJ1-CHI-39', price: 4500000, originalPrice: 5500000, stock: 10, specifications: { size: '39', color: 'Red/White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Chicago', sku: 'NIKE-AJ1-CHI-40', price: 4500000, originalPrice: 5500000, stock: 15, specifications: { size: '40', color: 'Red/White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Chicago', sku: 'NIKE-AJ1-CHI-41', price: 4500000, originalPrice: 5500000, stock: 20, specifications: { size: '41', color: 'Red/White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Chicago', sku: 'NIKE-AJ1-CHI-42', price: 4500000, originalPrice: 5500000, stock: 18, specifications: { size: '42', color: 'Red/White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Bred', sku: 'NIKE-AJ1-BRD-40', price: 4800000, originalPrice: 5800000, stock: 12, specifications: { size: '40', color: 'Black/Red', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Bred', sku: 'NIKE-AJ1-BRD-41', price: 4800000, originalPrice: 5800000, stock: 15, specifications: { size: '41', color: 'Black/Red', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Bred', sku: 'NIKE-AJ1-BRD-42', price: 4800000, originalPrice: 5800000, stock: 14, specifications: { size: '42', color: 'Black/Red', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Royal Blue', sku: 'NIKE-AJ1-RBL-41', price: 4700000, originalPrice: 5700000, stock: 10, specifications: { size: '41', color: 'Blue/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes-Pz6fZ9.png',
    ],
    features: ['Thiết kế iconic', 'Upper da cao cấp', 'Đệm Air-Sole', 'Cổ cao hỗ trợ mắt cá'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike React Infinity Run Flyknit 3',
    description: 'Giày chạy bộ Nike React với công nghệ đệm React Foam mang lại cảm giác êm ái, đàn hồi tuyệt vời cho mọi cự ly.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 3600000,
    variants: [
      { variantName: 'Size 39 - Black', sku: 'NIKE-REACT-BK-39', price: 3600000, originalPrice: 4500000, stock: 16, specifications: { size: '39', color: 'Black', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Black', sku: 'NIKE-REACT-BK-40', price: 3600000, originalPrice: 4500000, stock: 20, specifications: { size: '40', color: 'Black', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Black', sku: 'NIKE-REACT-BK-41', price: 3600000, originalPrice: 4500000, stock: 22, specifications: { size: '41', color: 'Black', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Black', sku: 'NIKE-REACT-BK-42', price: 3600000, originalPrice: 4500000, stock: 18, specifications: { size: '42', color: 'Black', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - White/Blue', sku: 'NIKE-REACT-WB-40', price: 3600000, originalPrice: 4500000, stock: 15, specifications: { size: '40', color: 'White/Blue', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - White/Blue', sku: 'NIKE-REACT-WB-41', price: 3600000, originalPrice: 4500000, stock: 18, specifications: { size: '41', color: 'White/Blue', material: 'Flyknit', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/ca0f57ad-f13c-40e1-aae4-f5fd81c85a6d/react-infinity-run-flyknit-3-road-running-shoes-JsPnRN.png',
    ],
    features: ['React Foam đệm êm', 'Flyknit upper co giãn', 'Giảm chấn thương', 'Độ bám đường tốt'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Dunk Low Retro',
    description: 'Nike Dunk Low với thiết kế retro basketball trở thành biểu tượng streetwear. Phong cách cổ điển, dễ phối đồ.',
    brand: 'Nike',
    category: 'Casual',
    basePrice: 2800000,
    variants: [
      { variantName: 'Size 38 - Panda', sku: 'NIKE-DUNK-PD-38', price: 2800000, originalPrice: 3500000, stock: 20, specifications: { size: '38', color: 'Black/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Panda', sku: 'NIKE-DUNK-PD-39', price: 2800000, originalPrice: 3500000, stock: 25, specifications: { size: '39', color: 'Black/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Panda', sku: 'NIKE-DUNK-PD-40', price: 2800000, originalPrice: 3500000, stock: 30, specifications: { size: '40', color: 'Black/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Panda', sku: 'NIKE-DUNK-PD-41', price: 2800000, originalPrice: 3500000, stock: 28, specifications: { size: '41', color: 'Black/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Panda', sku: 'NIKE-DUNK-PD-42', price: 2800000, originalPrice: 3500000, stock: 25, specifications: { size: '42', color: 'Black/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Syracuse', sku: 'NIKE-DUNK-SYR-39', price: 3000000, originalPrice: 3700000, stock: 15, specifications: { size: '39', color: 'Orange/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Syracuse', sku: 'NIKE-DUNK-SYR-40', price: 3000000, originalPrice: 3700000, stock: 18, specifications: { size: '40', color: 'Orange/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Syracuse', sku: 'NIKE-DUNK-SYR-41', price: 3000000, originalPrice: 3700000, stock: 20, specifications: { size: '41', color: 'Orange/White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/af53d53d-561f-450a-a483-70a7ceee380f/dunk-low-retro-shoes-66RGq8.png',
    ],
    features: ['Thiết kế retro', 'Upper da mềm mại', 'Đế cupsole bền', 'Dễ phối đồ'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Blazer Mid 77 Vintage',
    description: 'Nike Blazer Mid 77 mang phong cách cổ điển vintage với thiết kế clean và tối giản. Perfect cho street style.',
    brand: 'Nike',
    category: 'Casual',
    basePrice: 2600000,
    variants: [
      { variantName: 'Size 38 - White', sku: 'NIKE-BLAZ-WT-38', price: 2600000, originalPrice: 3200000, stock: 18, specifications: { size: '38', color: 'White', material: 'Leather/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - White', sku: 'NIKE-BLAZ-WT-39', price: 2600000, originalPrice: 3200000, stock: 22, specifications: { size: '39', color: 'White', material: 'Leather/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - White', sku: 'NIKE-BLAZ-WT-40', price: 2600000, originalPrice: 3200000, stock: 25, specifications: { size: '40', color: 'White', material: 'Leather/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - White', sku: 'NIKE-BLAZ-WT-41', price: 2600000, originalPrice: 3200000, stock: 23, specifications: { size: '41', color: 'White', material: 'Leather/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Black', sku: 'NIKE-BLAZ-BK-39', price: 2600000, originalPrice: 3200000, stock: 16, specifications: { size: '39', color: 'Black', material: 'Leather/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Black', sku: 'NIKE-BLAZ-BK-40', price: 2600000, originalPrice: 3200000, stock: 20, specifications: { size: '40', color: 'Black', material: 'Leather/Suede', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/d6cc0273-2759-4c36-b8d8-87ce5e5bfa00/blazer-mid-77-vintage-shoes-nw30B2.png',
    ],
    features: ['Thiết kế vintage', 'Upper da/suede cao cấp', 'Đệm foam êm ái', 'Style tối giản'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },

  // ========== ADIDAS PRODUCTS ==========
  {
    name: 'Adidas Ultraboost 22',
    description: 'Adidas Ultraboost 22 với công nghệ Boost đệm vượt trội, mang lại năng lượng trở lại cho mỗi bước chạy. Thiết kế hiện đại, năng động.',
    brand: 'Adidas',
    category: 'Running',
    basePrice: 4200000,
    variants: [
      { variantName: 'Size 39 - Core Black', sku: 'ADS-UB22-BK-39', price: 4200000, originalPrice: 5200000, stock: 15, specifications: { size: '39', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Core Black', sku: 'ADS-UB22-BK-40', price: 4200000, originalPrice: 5200000, stock: 20, specifications: { size: '40', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Core Black', sku: 'ADS-UB22-BK-41', price: 4200000, originalPrice: 5200000, stock: 22, specifications: { size: '41', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Core Black', sku: 'ADS-UB22-BK-42', price: 4200000, originalPrice: 5200000, stock: 20, specifications: { size: '42', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - White/Blue', sku: 'ADS-UB22-WB-40', price: 4200000, originalPrice: 5200000, stock: 18, specifications: { size: '40', color: 'White/Blue', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - White/Blue', sku: 'ADS-UB22-WB-41', price: 4200000, originalPrice: 5200000, stock: 20, specifications: { size: '41', color: 'White/Blue', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - White/Blue', sku: 'ADS-UB22-WB-42', price: 4200000, originalPrice: 5200000, stock: 16, specifications: { size: '42', color: 'White/Blue', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_Light_Shoes_Black_GY9350_01_standard.jpg',
    ],
    features: ['Công nghệ Boost đệm', 'Primeknit upper co giãn', 'Torsion System ổn định', 'Continental rubber outsole'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas Stan Smith',
    description: 'Biểu tượng giày tennis Adidas Stan Smith với thiết kế clean, tối giản. Một đôi giày không bao giờ lỗi mốt.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2400000,
    variants: [
      { variantName: 'Size 38 - White/Green', sku: 'ADS-STAN-WG-38', price: 2400000, originalPrice: 3000000, stock: 25, specifications: { size: '38', color: 'White/Green', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - White/Green', sku: 'ADS-STAN-WG-39', price: 2400000, originalPrice: 3000000, stock: 30, specifications: { size: '39', color: 'White/Green', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - White/Green', sku: 'ADS-STAN-WG-40', price: 2400000, originalPrice: 3000000, stock: 35, specifications: { size: '40', color: 'White/Green', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - White/Green', sku: 'ADS-STAN-WG-41', price: 2400000, originalPrice: 3000000, stock: 32, specifications: { size: '41', color: 'White/Green', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - White/Green', sku: 'ADS-STAN-WG-42', price: 2400000, originalPrice: 3000000, stock: 28, specifications: { size: '42', color: 'White/Green', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Triple White', sku: 'ADS-STAN-TW-40', price: 2400000, originalPrice: 3000000, stock: 20, specifications: { size: '40', color: 'White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Triple White', sku: 'ADS-STAN-TW-41', price: 2400000, originalPrice: 3000000, stock: 22, specifications: { size: '41', color: 'White', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/3c63ad5ba66a48068c90aad6009a0497_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg',
    ],
    features: ['Thiết kế minimalist', 'Upper da cao cấp', 'Đế cao su bền', 'Phong cách vượt thời gian'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas Superstar',
    description: 'Adidas Superstar - biểu tượng giày thể thao với mũi shell toe đặc trưng. Phong cách hip-hop, street culture.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2200000,
    variants: [
      { variantName: 'Size 38 - White/Black', sku: 'ADS-SUPER-WB-38', price: 2200000, originalPrice: 2800000, stock: 22, specifications: { size: '38', color: 'White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - White/Black', sku: 'ADS-SUPER-WB-39', price: 2200000, originalPrice: 2800000, stock: 28, specifications: { size: '39', color: 'White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - White/Black', sku: 'ADS-SUPER-WB-40', price: 2200000, originalPrice: 2800000, stock: 30, specifications: { size: '40', color: 'White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - White/Black', sku: 'ADS-SUPER-WB-41', price: 2200000, originalPrice: 2800000, stock: 28, specifications: { size: '41', color: 'White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - White/Black', sku: 'ADS-SUPER-WB-42', price: 2200000, originalPrice: 2800000, stock: 25, specifications: { size: '42', color: 'White/Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Core Black', sku: 'ADS-SUPER-CB-40', price: 2200000, originalPrice: 2800000, stock: 18, specifications: { size: '40', color: 'Black', material: 'Leather', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/12365dfd7e4a46cc95d3aad6009a0e1e_9366/Superstar_Shoes_White_EG4958_01_standard.jpg',
    ],
    features: ['Shell toe iconic', 'Upper da mềm', 'Đế cao su bền', 'Phong cách retro'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas NMD_R1',
    description: 'Adidas NMD_R1 kết hợp công nghệ Boost với thiết kế streetwear. Năng động, trẻ trung và cực kỳ thoải mái.',
    brand: 'Adidas',
    category: 'Lifestyle',
    basePrice: 3400000,
    variants: [
      { variantName: 'Size 39 - Core Black', sku: 'ADS-NMD-BK-39', price: 3400000, originalPrice: 4200000, stock: 16, specifications: { size: '39', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Core Black', sku: 'ADS-NMD-BK-40', price: 3400000, originalPrice: 4200000, stock: 20, specifications: { size: '40', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Core Black', sku: 'ADS-NMD-BK-41', price: 3400000, originalPrice: 4200000, stock: 22, specifications: { size: '41', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Core Black', sku: 'ADS-NMD-BK-42', price: 3400000, originalPrice: 4200000, stock: 18, specifications: { size: '42', color: 'Black', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - White/Blue', sku: 'ADS-NMD-WB-40', price: 3400000, originalPrice: 4200000, stock: 15, specifications: { size: '40', color: 'White/Blue', material: 'Primeknit', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/e8fefe9df46f4ac29f88aff8009e9d9b_9366/NMD_S1_Shoes_Black_GZ7925_01_standard.jpg',
    ],
    features: ['Công nghệ Boost', 'Primeknit upper', 'EVA plugs độc đáo', 'Thiết kế futuristic'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas Gazelle',
    description: 'Adidas Gazelle với thiết kế suede cổ điển từ những năm 60. Phong cách vintage, dễ phối đồ casual.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2100000,
    variants: [
      { variantName: 'Size 38 - Blue', sku: 'ADS-GAZ-BL-38', price: 2100000, originalPrice: 2700000, stock: 18, specifications: { size: '38', color: 'Blue', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Blue', sku: 'ADS-GAZ-BL-39', price: 2100000, originalPrice: 2700000, stock: 22, specifications: { size: '39', color: 'Blue', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Blue', sku: 'ADS-GAZ-BL-40', price: 2100000, originalPrice: 2700000, stock: 25, specifications: { size: '40', color: 'Blue', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Blue', sku: 'ADS-GAZ-BL-41', price: 2100000, originalPrice: 2700000, stock: 20, specifications: { size: '41', color: 'Blue', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Grey', sku: 'ADS-GAZ-GR-39', price: 2100000, originalPrice: 2700000, stock: 16, specifications: { size: '39', color: 'Grey', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Grey', sku: 'ADS-GAZ-GR-40', price: 2100000, originalPrice: 2700000, stock: 18, specifications: { size: '40', color: 'Grey', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/12bf00fa82044c3baa15ad2f01262a54_9366/Gazelle_Shoes_Blue_BB5478_01_standard.jpg',
    ],
    features: ['Upper suede cao cấp', 'Thiết kế vintage', '3-Stripes trademark', 'Đế cao su bền'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },

  // ========== PUMA PRODUCTS ==========
  {
    name: 'Puma Suede Classic XXI',
    description: 'Puma Suede Classic với upper suede mềm mại, thiết kế iconic từ những năm 60. Perfect cho street style.',
    brand: 'Puma',
    category: 'Casual',
    basePrice: 1900000,
    variants: [
      { variantName: 'Size 39 - Black', sku: 'PUMA-SUED-BK-39', price: 1900000, originalPrice: 2400000, stock: 20, specifications: { size: '39', color: 'Black', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Black', sku: 'PUMA-SUED-BK-40', price: 1900000, originalPrice: 2400000, stock: 25, specifications: { size: '40', color: 'Black', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Black', sku: 'PUMA-SUED-BK-41', price: 1900000, originalPrice: 2400000, stock: 22, specifications: { size: '41', color: 'Black', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Black', sku: 'PUMA-SUED-BK-42', price: 1900000, originalPrice: 2400000, stock: 20, specifications: { size: '42', color: 'Black', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Red', sku: 'PUMA-SUED-RD-40', price: 1900000, originalPrice: 2400000, stock: 15, specifications: { size: '40', color: 'Red', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Red', sku: 'PUMA-SUED-RD-41', price: 1900000, originalPrice: 2400000, stock: 18, specifications: { size: '41', color: 'Red', material: 'Suede', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers',
    ],
    features: ['Upper suede mềm mại', 'Thiết kế classic', 'Đế cao su bền', 'PUMA Formstrip'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Puma RS-X',
    description: 'Puma RS-X với thiết kế chunky futuristic, màu sắc bold và năng động. Perfect cho streetwear hiện đại.',
    brand: 'Puma',
    category: 'Lifestyle',
    basePrice: 2600000,
    variants: [
      { variantName: 'Size 39 - Multi-Color', sku: 'PUMA-RSX-MC-39', price: 2600000, originalPrice: 3200000, stock: 15, specifications: { size: '39', color: 'Multi', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Multi-Color', sku: 'PUMA-RSX-MC-40', price: 2600000, originalPrice: 3200000, stock: 20, specifications: { size: '40', color: 'Multi', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Multi-Color', sku: 'PUMA-RSX-MC-41', price: 2600000, originalPrice: 3200000, stock: 18, specifications: { size: '41', color: 'Multi', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Multi-Color', sku: 'PUMA-RSX-MC-42', price: 2600000, originalPrice: 3200000, stock: 16, specifications: { size: '42', color: 'Multi', material: 'Mesh/Synthetic', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/380462/01/sv01/fnd/PNA/fmt/png/RS-X-Efekt-Luxe-Sneakers',
    ],
    features: ['Thiết kế chunky', 'RS cushioning', 'Màu sắc bold', 'Upper mixed materials'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },

  // ========== CONVERSE PRODUCTS ==========
  {
    name: 'Converse Chuck Taylor All Star',
    description: 'Biểu tượng Converse Chuck Taylor All Star - đôi giày canvas kinh điển không bao giờ lỗi mốt. Dễ phối đồ, phù hợp mọi style.',
    brand: 'Converse',
    category: 'Casual',
    basePrice: 1400000,
    variants: [
      { variantName: 'Size 38 - Black', sku: 'CONV-CT-BK-38', price: 1400000, originalPrice: 1800000, stock: 30, specifications: { size: '38', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Black', sku: 'CONV-CT-BK-39', price: 1400000, originalPrice: 1800000, stock: 35, specifications: { size: '39', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Black', sku: 'CONV-CT-BK-40', price: 1400000, originalPrice: 1800000, stock: 40, specifications: { size: '40', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Black', sku: 'CONV-CT-BK-41', price: 1400000, originalPrice: 1800000, stock: 35, specifications: { size: '41', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Black', sku: 'CONV-CT-BK-42', price: 1400000, originalPrice: 1800000, stock: 30, specifications: { size: '42', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - White', sku: 'CONV-CT-WT-39', price: 1400000, originalPrice: 1800000, stock: 25, specifications: { size: '39', color: 'White', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - White', sku: 'CONV-CT-WT-40', price: 1400000, originalPrice: 1800000, stock: 30, specifications: { size: '40', color: 'White', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - White', sku: 'CONV-CT-WT-41', price: 1400000, originalPrice: 1800000, stock: 28, specifications: { size: '41', color: 'White', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw6f1c0e4d/images/a_107/M9160_A_107X1.jpg',
    ],
    features: ['Thiết kế iconic', 'Upper canvas bền', 'Đế cao su vulcanized', 'Dễ phối đồ'],
    warranty: { duration: '3 tháng', details: 'Bảo hành lỗi sản xuất' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Converse Chuck 70',
    description: 'Converse Chuck 70 - phiên bản premium của Chuck Taylor với chất liệu cao cấp hơn, đệm êm hơn và thiết kế vintage.',
    brand: 'Converse',
    category: 'Casual',
    basePrice: 1800000,
    variants: [
      { variantName: 'Size 38 - Black', sku: 'CONV-C70-BK-38', price: 1800000, originalPrice: 2300000, stock: 20, specifications: { size: '38', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Black', sku: 'CONV-C70-BK-39', price: 1800000, originalPrice: 2300000, stock: 25, specifications: { size: '39', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Black', sku: 'CONV-C70-BK-40', price: 1800000, originalPrice: 2300000, stock: 28, specifications: { size: '40', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Black', sku: 'CONV-C70-BK-41', price: 1800000, originalPrice: 2300000, stock: 25, specifications: { size: '41', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Cream', sku: 'CONV-C70-CR-40', price: 1800000, originalPrice: 2300000, stock: 18, specifications: { size: '40', color: 'Cream', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Cream', sku: 'CONV-C70-CR-41', price: 1800000, originalPrice: 2300000, stock: 20, specifications: { size: '41', color: 'Cream', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dwa1ec70e7/images/a_107/162050C_A_107X1.jpg',
    ],
    features: ['Canvas cao cấp', 'Đệm OrthoLite', 'Chi tiết vintage', 'Cổ cao hơn'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Converse' },
    isActive: true,
    isFeatured: false,
  },

  // ========== NEW BALANCE PRODUCTS ==========
  {
    name: 'New Balance 574 Classic',
    description: 'New Balance 574 - đôi giày running heritage với thiết kế retro, phù hợp cho everyday wear. Thoải mái và bền bỉ.',
    brand: 'New Balance',
    category: 'Casual',
    basePrice: 2400000,
    variants: [
      { variantName: 'Size 39 - Grey', sku: 'NB-574-GR-39', price: 2400000, originalPrice: 3000000, stock: 18, specifications: { size: '39', color: 'Grey', material: 'Suede/Mesh', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Grey', sku: 'NB-574-GR-40', price: 2400000, originalPrice: 3000000, stock: 22, specifications: { size: '40', color: 'Grey', material: 'Suede/Mesh', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Grey', sku: 'NB-574-GR-41', price: 2400000, originalPrice: 3000000, stock: 25, specifications: { size: '41', color: 'Grey', material: 'Suede/Mesh', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Grey', sku: 'NB-574-GR-42', price: 2400000, originalPrice: 3000000, stock: 20, specifications: { size: '42', color: 'Grey', material: 'Suede/Mesh', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Navy', sku: 'NB-574-NV-40', price: 2400000, originalPrice: 3000000, stock: 18, specifications: { size: '40', color: 'Navy', material: 'Suede/Mesh', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Navy', sku: 'NB-574-NV-41', price: 2400000, originalPrice: 3000000, stock: 20, specifications: { size: '41', color: 'Navy', material: 'Suede/Mesh', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://nb.scene7.com/is/image/NB/ml574evb_nb_02_i',
    ],
    features: ['Đệm ENCAP midsole', 'Upper suede/mesh', 'Đế ngoài cao su', 'Phong cách retro'],
    warranty: { duration: '6 tháng', details: 'Bảo hành lỗi sản xuất' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'New Balance 327',
    description: 'New Balance 327 kết hợp heritage design với twist hiện đại. Oversized N logo và đế răng cưa độc đáo.',
    brand: 'New Balance',
    category: 'Lifestyle',
    basePrice: 2700000,
    variants: [
      { variantName: 'Size 39 - Grey/Orange', sku: 'NB-327-GO-39', price: 2700000, originalPrice: 3400000, stock: 15, specifications: { size: '39', color: 'Grey/Orange', material: 'Suede/Nylon', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Grey/Orange', sku: 'NB-327-GO-40', price: 2700000, originalPrice: 3400000, stock: 20, specifications: { size: '40', color: 'Grey/Orange', material: 'Suede/Nylon', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Grey/Orange', sku: 'NB-327-GO-41', price: 2700000, originalPrice: 3400000, stock: 22, specifications: { size: '41', color: 'Grey/Orange', material: 'Suede/Nylon', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Grey/Orange', sku: 'NB-327-GO-42', price: 2700000, originalPrice: 3400000, stock: 18, specifications: { size: '42', color: 'Grey/Orange', material: 'Suede/Nylon', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://nb.scene7.com/is/image/NB/ms327pb_nb_02_i',
    ],
    features: ['Oversized N logo', 'Đế răng cưa', 'Upper suede/nylon', 'Thiết kế retro-modern'],
    warranty: { duration: '6 tháng', details: 'Bảo hành lỗi sản xuất' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'New Balance 990v5',
    description: 'New Balance 990v5 - đỉnh cao của công nghệ giày chạy. Made in USA, chất lượng premium, thoải mái tối đa.',
    brand: 'New Balance',
    category: 'Running',
    basePrice: 4800000,
    variants: [
      { variantName: 'Size 40 - Grey', sku: 'NB-990-GR-40', price: 4800000, originalPrice: 6000000, stock: 10, specifications: { size: '40', color: 'Grey', material: 'Pigskin/Mesh', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Grey', sku: 'NB-990-GR-41', price: 4800000, originalPrice: 6000000, stock: 12, specifications: { size: '41', color: 'Grey', material: 'Pigskin/Mesh', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Grey', sku: 'NB-990-GR-42', price: 4800000, originalPrice: 6000000, stock: 10, specifications: { size: '42', color: 'Grey', material: 'Pigskin/Mesh', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://nb.scene7.com/is/image/NB/m990gl5_nb_02_i',
    ],
    features: ['Made in USA', 'ENCAP midsole', 'Premium materials', 'Đệm tối ưu'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng New Balance' },
    isActive: true,
    isFeatured: true,
  },

  // ========== VANS PRODUCTS ==========
  {
    name: 'Vans Old Skool',
    description: 'Vans Old Skool với sidestripe iconic - biểu tượng skate culture. Thiết kế đơn giản, bền bỉ, phù hợp mọi style.',
    brand: 'Vans',
    category: 'Skate',
    basePrice: 1600000,
    variants: [
      { variantName: 'Size 38 - Black/White', sku: 'VANS-OS-BW-38', price: 1600000, originalPrice: 2000000, stock: 25, specifications: { size: '38', color: 'Black/White', material: 'Canvas/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - Black/White', sku: 'VANS-OS-BW-39', price: 1600000, originalPrice: 2000000, stock: 30, specifications: { size: '39', color: 'Black/White', material: 'Canvas/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Black/White', sku: 'VANS-OS-BW-40', price: 1600000, originalPrice: 2000000, stock: 35, specifications: { size: '40', color: 'Black/White', material: 'Canvas/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - Black/White', sku: 'VANS-OS-BW-41', price: 1600000, originalPrice: 2000000, stock: 32, specifications: { size: '41', color: 'Black/White', material: 'Canvas/Suede', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 42 - Black/White', sku: 'VANS-OS-BW-42', price: 1600000, originalPrice: 2000000, stock: 28, specifications: { size: '42', color: 'Black/White', material: 'Canvas/Suede', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800',
    ],
    features: ['Sidestripe iconic', 'Canvas/Suede upper', 'Waffle outsole', 'Skate-ready'],
    warranty: { duration: '3 tháng', details: 'Bảo hành lỗi sản xuất' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Vans Authentic',
    description: 'Vans Authentic - đôi giày canvas đơn giản nhất nhưng cũng kinh điển nhất của Vans. Perfect cho casual style.',
    brand: 'Vans',
    category: 'Casual',
    basePrice: 1400000,
    variants: [
      { variantName: 'Size 38 - True White', sku: 'VANS-AUTH-WT-38', price: 1400000, originalPrice: 1800000, stock: 22, specifications: { size: '38', color: 'White', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 39 - True White', sku: 'VANS-AUTH-WT-39', price: 1400000, originalPrice: 1800000, stock: 28, specifications: { size: '39', color: 'White', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - True White', sku: 'VANS-AUTH-WT-40', price: 1400000, originalPrice: 1800000, stock: 30, specifications: { size: '40', color: 'White', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 41 - True White', sku: 'VANS-AUTH-WT-41', price: 1400000, originalPrice: 1800000, stock: 28, specifications: { size: '41', color: 'White', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
      { variantName: 'Size 40 - Black', sku: 'VANS-AUTH-BK-40', price: 1400000, originalPrice: 1800000, stock: 25, specifications: { size: '40', color: 'Black', material: 'Canvas', gender: 'Unisex' }, isAvailable: true },
    ],
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
    ],
    features: ['Thiết kế minimalist', 'Canvas upper', 'Waffle outsole', 'Low-top silhouette'],
    warranty: { duration: '3 tháng', details: 'Bảo hành lỗi sản xuất' },
    isActive: true,
    isFeatured: false,
  },
]

// Main seed function
const seedProducts = async () => {
  try {
    await connectDB()

    // Find seller
    const seller = await User.findOne({ role: { $in: ['admin', 'partner'] } })
    if (!seller) {
      console.log('❌ No admin/partner found. Please seed users first!')
      process.exit(1)
    }

    console.log(`✅ Found seller: ${seller.username}`)
    console.log(`🚀 Starting to seed ${completeShoeProducts.length} products...`)
    console.log('')

    let created = 0
    let skipped = 0

    for (const product of completeShoeProducts) {
      const existing = await Product.findOne({ name: product.name })
      if (existing) {
        console.log(`⚠️  Skipped: "${product.name}" (already exists)`)
        skipped++
        continue
      }

      await Product.create({
        ...product,
        createdBy: seller._id,
      })
      
      const variantsCount = product.variants.length
      const colorsCount = [...new Set(product.variants.map(v => v.specifications.color))].length
      const sizesCount = [...new Set(product.variants.map(v => v.specifications.size))].length
      
      console.log(`✅ Created: ${product.name}`)
      console.log(`   Brand: ${product.brand} | Category: ${product.category}`)
      console.log(`   Variants: ${variantsCount} (${sizesCount} sizes, ${colorsCount} colors)`)
      console.log(`   Price: ${product.basePrice.toLocaleString()}₫`)
      console.log('')
      created++
    }

    console.log('═══════════════════════════════════════')
    console.log(`🎉 Seeding completed!`)
    console.log(`   ✅ Created: ${created} products`)
    console.log(`   ⚠️  Skipped: ${skipped} products`)
    console.log(`   📦 Total: ${created + skipped} products`)
    console.log('═══════════════════════════════════════')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding products:', error)
    process.exit(1)
  }
}

// Run seed
seedProducts()
