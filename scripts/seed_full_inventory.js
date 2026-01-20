/**
 * Full Inventory Seed - Nhiều sản phẩm đa dạng, tất cả còn hàng
 * Xóa cứng database cũ và tạo mới
 * Run: node scripts/seed_full_inventory.js
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

// Helper function để tạo variants với nhiều màu
const createVariants = (baseSKU, basePrice, originalPrice, genders, sizes, colors) => {
  const variants = []
  
  genders.forEach(gender => {
    sizes.forEach(size => {
      colors.forEach(color => {
        const priceVariation = Math.floor(Math.random() * 200000) // Random +0-200k
        variants.push({
          variantName: `${gender} Size ${size} - ${color}`,
          sku: `${baseSKU}-${gender.charAt(0)}-${size}-${color.substring(0, 2).toUpperCase()}`,
          price: basePrice + priceVariation,
          originalPrice: originalPrice + priceVariation,
          stock: Math.floor(Math.random() * 30) + 10, // Random 10-40 items
          specifications: {
            size: size.toString(),
            color: color,
            material: 'Premium Material',
            gender: gender,
          },
          isAvailable: true,
        })
      })
    })
  })
  
  return variants
}

// Full product inventory
const fullInventory = [
  // ========== NIKE (10 products) ==========
  {
    name: 'Nike Air Jordan 1 Retro High OG',
    description: 'Biểu tượng bóng rổ huyền thoại với thiết kế cổ điển. Phong cách street style đỉnh cao.',
    brand: 'Nike',
    category: 'Basketball',
    basePrice: 4500000,
    variants: createVariants('AJ1-OG', 4500000, 5500000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes-Pz6fZ9.png'],
    features: ['Upper da cao cấp', 'Đệm Air-Sole', 'Cổ cao hỗ trợ', 'Thiết kế iconic'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Air Max 270 React',
    description: 'Công nghệ đệm Air Max lớn nhất kết hợp React Foam. Thoải mái tối đa cho cả ngày dài.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 3800000,
    variants: createVariants('AM270', 3800000, 4800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Blue', 'Pink', 'Grey', 'Green', 'Orange']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png'],
    features: ['Air Max đệm lớn', 'React Foam', 'Upper mesh thoáng', 'Thiết kế futuristic'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike React Infinity Run Flyknit 3',
    description: 'Giày chạy bộ với công nghệ React Foam đệm êm ái, giảm chấn thương hiệu quả.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 3600000,
    variants: createVariants('REACT3', 3600000, 4500000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Pink', 'Purple', 'Blue', 'Yellow', 'Grey']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/ca0f57ad-f13c-40e1-aae4-f5fd81c85a6d/react-infinity-run-flyknit-3-road-running-shoes-JsPnRN.png'],
    features: ['React Foam', 'Flyknit upper', 'Giảm chấn thương', 'Độ bám tốt'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Dunk Low Retro',
    description: 'Nike Dunk Low với thiết kế retro basketball. Biểu tượng streetwear không bao giờ lỗi mốt.',
    brand: 'Nike',
    category: 'Casual',
    basePrice: 2800000,
    variants: createVariants('DUNK-LOW', 2800000, 3500000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Orange', 'Purple']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/af53d53d-561f-450a-a483-70a7ceee380f/dunk-low-retro-shoes-66RGq8.png'],
    features: ['Thiết kế retro', 'Upper da mềm', 'Đế cupsole', 'Dễ phối đồ'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Blazer Mid 77 Vintage',
    description: 'Phong cách vintage clean và tối giản. Perfect cho mọi outfit từ casual đến street.',
    brand: 'Nike',
    category: 'Casual',
    basePrice: 2600000,
    variants: createVariants('BLAZ77', 2600000, 3200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Grey', 'Blue', 'Pink', 'Green', 'Red']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/d6cc0273-2759-4c36-b8d8-87ce5e5bfa00/blazer-mid-77-vintage-shoes-nw30B2.png'],
    features: ['Vintage style', 'Upper da/suede', 'Đệm foam', 'Tối giản'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Nike Air Force 1 Low 07',
    description: 'Biểu tượng sneaker kinh điển nhất mọi thời đại. Luôn fresh, luôn trendy.',
    brand: 'Nike',
    category: 'Casual',
    basePrice: 2400000,
    variants: createVariants('AF1', 2400000, 3000000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Red', 'Blue', 'Green', 'Pink', 'Orange', 'Grey']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png'],
    features: ['Thiết kế iconic', 'Upper da', 'Air-Sole đệm', 'Versatile style'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Pegasus 40',
    description: 'Giày chạy bộ huyền thoại với 40 phiên bản cải tiến. Hoàn hảo cho mọi runner.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 3200000,
    variants: createVariants('PEG40', 3200000, 4000000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Pink', 'Yellow', 'Green', 'Orange']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/a3e7dead-1ad2-4c40-996d-93ebc9df0fca/pegasus-40-road-running-shoes-Dx7K7N.png'],
    features: ['React foam', 'Zoom Air', 'Upper mesh', 'Lightweight'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Nike SB Dunk Low Pro',
    description: 'Phiên bản skateboarding của Dunk Low. Bền bỉ, grip tốt, style đỉnh cao.',
    brand: 'Nike',
    category: 'Skateboarding',
    basePrice: 2900000,
    variants: createVariants('SB-DUNK', 2900000, 3600000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Green', 'Purple', 'Orange']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/af53d53d-561f-450a-a483-70a7ceee380f/sb-dunk-low-pro-skate-shoes-5FXqpT.png'],
    features: ['Zoom Air đệm', 'Upper da bền', 'Grip cao su', 'Padded tongue'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Nike ZoomX Vaporfly Next% 2',
    description: 'Giày marathon elite với công nghệ ZoomX foam và carbon plate. Tốc độ tối đa.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 5500000,
    variants: createVariants('VAPOR', 5500000, 6500000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Pink', 'Blue', 'Green', 'Orange', 'Yellow']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/0e0c33a0-ef43-4e94-9138-4d00e4d1d25e/zoomx-vaporfly-next-2-road-racing-shoes-YQkP1r.png'],
    features: ['ZoomX foam', 'Carbon plate', 'Elite racing', 'Lightweight'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Cortez Classic',
    description: 'Running shoe huyền thoại từ 1972. Phong cách retro vượt thời gian.',
    brand: 'Nike',
    category: 'Casual',
    basePrice: 2200000,
    variants: createVariants('CORTEZ', 2200000, 2800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Red', 'Blue', 'Grey', 'Green', 'Pink']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/0a284e40-8e53-468b-ad4b-d28cc8af396a/cortez-shoe-gLlDpX.png'],
    features: ['Classic design', 'Upper nylon/suede', 'EVA midsole', 'Retro style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },

  // ========== ADIDAS (8 products) ==========
  {
    name: 'Adidas Ultraboost 22',
    description: 'Công nghệ Boost đệm vượt trội. Năng lượng trở lại cho mỗi bước chạy.',
    brand: 'Adidas',
    category: 'Running',
    basePrice: 4200000,
    variants: createVariants('UB22', 4200000, 5200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Pink', 'Grey', 'Green', 'Purple']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_Light_Shoes_Black_GY9350_01_standard.jpg'],
    features: ['Boost technology', 'Primeknit upper', 'Torsion System', 'Continental rubber'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas Stan Smith',
    description: 'Biểu tượng tennis shoe với thiết kế clean, tối giản. Không bao giờ lỗi mốt.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2400000,
    variants: createVariants('STAN', 2400000, 3000000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Green', 'Blue', 'Pink', 'Red', 'Navy', 'Grey']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/3c63ad5ba66a48068c90aad6009a0497_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg'],
    features: ['Minimalist design', 'Leather upper', 'Rubber outsole', 'Timeless style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas Superstar',
    description: 'Shell toe icon với phong cách hip-hop. Retro vibes, modern comfort.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2200000,
    variants: createVariants('SUPER', 2200000, 2800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Red', 'Blue', 'Gold', 'Pink', 'Green', 'Purple']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/12365dfd7e4a46cc95d3aad6009a0e1e_9366/Superstar_Shoes_White_EG4958_01_standard.jpg'],
    features: ['Shell toe', 'Leather upper', 'Rubber shell', 'Retro style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas NMD_R1',
    description: 'Streetwear icon với Boost technology. Futuristic design, supreme comfort.',
    brand: 'Adidas',
    category: 'Lifestyle',
    basePrice: 3400000,
    variants: createVariants('NMD', 3400000, 4200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Red', 'Grey', 'Pink', 'Green']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/e8fefe9df46f4ac29f88aff8009e9d9b_9366/NMD_S1_Shoes_Black_GZ7925_01_standard.jpg'],
    features: ['Boost cushioning', 'Primeknit', 'EVA plugs', 'Futuristic design'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas Gazelle',
    description: 'Suede classic từ những năm 60. Vintage vibes, easy styling.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2100000,
    variants: createVariants('GAZ', 2100000, 2700000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'Blue', 'Grey', 'Red', 'Green', 'Pink', 'Navy']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/12bf00fa82044c3baa15ad2f01262a54_9366/Gazelle_Shoes_Blue_BB5478_01_standard.jpg'],
    features: ['Suede upper', 'Vintage design', '3-Stripes', 'Rubber outsole'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas Yeezy Boost 350 V2',
    description: 'Collaboration icon với Kanye West. Premium materials, unique design.',
    brand: 'Adidas',
    category: 'Lifestyle',
    basePrice: 6500000,
    variants: createVariants('YEEZY', 6500000, 7500000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Grey', 'Cream', 'Blue', 'Orange', 'Green']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/YEEZY_BOOST_350_V2_Blue_GZ5348_01_standard.jpg'],
    features: ['Boost technology', 'Primeknit upper', 'Unique design', 'Premium quality'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas Forum Low',
    description: 'Basketball heritage meets street style. Retro vibes with modern comfort.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2600000,
    variants: createVariants('FORUM', 2600000, 3200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Pink', 'Yellow', 'Green', 'Red']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/e8fefe9df46f4ac29f88aff8009e9d9b_9366/Forum_Low_Shoes_White_FY7757_01_standard.jpg'],
    features: ['Leather upper', 'X-strap closure', 'Retro basketball', 'Durable outsole'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas ZX 2K Boost',
    description: 'Modern take on ZX heritage. Boost cushioning meets bold design.',
    brand: 'Adidas',
    category: 'Lifestyle',
    basePrice: 3100000,
    variants: createVariants('ZX2K', 3100000, 3900000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Blue', 'Red', 'Grey', 'Orange', 'Green']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/ZX_2K_Boost_Shoes_Black_FZ3000_01_standard.jpg'],
    features: ['Boost technology', 'Mixed materials', 'Bold design', 'Comfortable fit'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },

  // ========== PUMA (5 products) ==========
  {
    name: 'Puma Suede Classic XXI',
    description: 'Suede icon từ những năm 60. Timeless design, versatile style.',
    brand: 'Puma',
    category: 'Casual',
    basePrice: 1900000,
    variants: createVariants('SUEDE', 1900000, 2400000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Grey', 'Green', 'Pink', 'Navy']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers'],
    features: ['Suede upper', 'Classic design', 'PUMA Formstrip', 'Rubber outsole'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Puma RS-X',
    description: 'Chunky futuristic design. Bold colors, supreme comfort.',
    brand: 'Puma',
    category: 'Lifestyle',
    basePrice: 2600000,
    variants: createVariants('RSX', 2600000, 3200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Red', 'Blue', 'Yellow', 'Pink', 'Multi']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/380462/01/sv01/fnd/PNA/fmt/png/RS-X-Efekt-Luxe-Sneakers'],
    features: ['RS cushioning', 'Mixed materials', 'Chunky sole', 'Bold colors'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Puma Clyde All-Pro',
    description: 'Basketball performance meets street style. Modern tech, classic look.',
    brand: 'Puma',
    category: 'Basketball',
    basePrice: 3500000,
    variants: createVariants('CLYDE', 3500000, 4300000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Grey', 'Orange']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/194245/01/sv01/fnd/PNA/fmt/png/Clyde-All-Pro-Basketball-Shoes'],
    features: ['ProFoam cushioning', 'Textile upper', 'Rubber outsole', 'Basketball performance'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Puma Speed 500 v2',
    description: 'Running shoe với ProFoam technology. Lightweight, responsive.',
    brand: 'Puma',
    category: 'Running',
    basePrice: 2400000,
    variants: createVariants('SPEED', 2400000, 3000000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Blue', 'Pink', 'Green', 'Orange']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/194245/01/sv01/fnd/PNA/fmt/png/Speed-500-v2-Running-Shoes'],
    features: ['ProFoam cushioning', 'Mesh upper', 'Lightweight', 'Responsive ride'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Puma Mayze',
    description: 'Platform sneaker với bold design. Y2K vibes, modern comfort.',
    brand: 'Puma',
    category: 'Casual',
    basePrice: 2800000,
    variants: createVariants('MAYZE', 2800000, 3500000, 
      ['Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41'], 
      ['Black', 'White', 'Pink', 'Purple', 'Blue', 'Yellow']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/380768/01/sv01/fnd/PNA/fmt/png/Mayze-Womens-Sneakers'],
    features: ['Platform sole', 'Leather upper', 'Bold design', 'Y2K style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },

  // ========== CONVERSE (4 products) ==========
  {
    name: 'Converse Chuck Taylor All Star High',
    description: 'The original basketball shoe turned cultural icon. Timeless design since 1917.',
    brand: 'Converse',
    category: 'Casual',
    basePrice: 1500000,
    variants: createVariants('CHUCK-HI', 1500000, 1900000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Red', 'Blue', 'Grey', 'Green', 'Pink', 'Navy']),
    images: ['https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw47a3c7c1/images/a_107/M9160C_A_107X1.jpg'],
    features: ['Canvas upper', 'High-top design', 'Rubber toe cap', 'Iconic style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Converse' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Converse Chuck Taylor All Star Low',
    description: 'Low-top version of the icon. Easy on, easy off, always stylish.',
    brand: 'Converse',
    category: 'Casual',
    basePrice: 1400000,
    variants: createVariants('CHUCK-LO', 1400000, 1800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Red', 'Blue', 'Yellow', 'Green', 'Pink', 'Grey']),
    images: ['https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw47a3c7c1/images/a_107/M9166C_A_107X1.jpg'],
    features: ['Canvas upper', 'Low-top design', 'Rubber sole', 'Versatile style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Converse' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Converse Chuck 70 High',
    description: 'Premium version of the classic. Better materials, enhanced comfort.',
    brand: 'Converse',
    category: 'Casual',
    basePrice: 2200000,
    variants: createVariants('C70-HI', 2200000, 2800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Navy', 'Grey', 'Green', 'Red']),
    images: ['https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw47a3c7c1/images/a_107/162050C_A_107X1.jpg'],
    features: ['Premium canvas', 'Enhanced cushioning', 'Vintage details', 'High-top'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Converse' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Converse One Star Pro',
    description: 'Skateboarding version with enhanced durability. Pro performance, classic look.',
    brand: 'Converse',
    category: 'Skateboarding',
    basePrice: 1800000,
    variants: createVariants('ONESTAR', 1800000, 2300000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Grey', 'Red', 'Green']),
    images: ['https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw47a3c7c1/images/a_107/159579C_A_107X1.jpg'],
    features: ['Suede upper', 'Lunarlon insole', 'Durable construction', 'Skate performance'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Converse' },
    isActive: true,
    isFeatured: false,
  },

  // ========== VANS (4 products) ==========
  {
    name: 'Vans Old Skool',
    description: 'The original skate shoe với iconic side stripe. Timeless classic.',
    brand: 'Vans',
    category: 'Skateboarding',
    basePrice: 1700000,
    variants: createVariants('OLDSKOOL', 1700000, 2200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Navy', 'Grey']),
    images: ['https://images.vans.com/is/image/Vans/VN000D3HY28-HERO'],
    features: ['Canvas/suede upper', 'Signature side stripe', 'Waffle outsole', 'Padded collar'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Vans' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Vans Authentic',
    description: 'The original Vans shoe từ 1966. Simple design, endless possibilities.',
    brand: 'Vans',
    category: 'Casual',
    basePrice: 1400000,
    variants: createVariants('AUTH', 1400000, 1800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Navy', 'Green', 'Pink']),
    images: ['https://images.vans.com/is/image/Vans/EE3BKA-HERO'],
    features: ['Canvas upper', 'Metal eyelets', 'Waffle outsole', 'Simple design'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Vans' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Vans Sk8-Hi',
    description: 'High-top skate shoe with ankle support. Icon since 1978.',
    brand: 'Vans',
    category: 'Skateboarding',
    basePrice: 1900000,
    variants: createVariants('SK8HI', 1900000, 2400000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Green', 'Navy']),
    images: ['https://images.vans.com/is/image/Vans/D5IB8C-HERO'],
    features: ['High-top design', 'Padded collar', 'Reinforced toe', 'Waffle outsole'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Vans' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Vans Slip-On',
    description: 'Laceless classic for easy on/off. Checkerboard icon.',
    brand: 'Vans',
    category: 'Casual',
    basePrice: 1500000,
    variants: createVariants('SLIPON', 1500000, 1900000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Checkerboard', 'Navy', 'Red', 'Blue']),
    images: ['https://images.vans.com/is/image/Vans/EYEBWW-HERO'],
    features: ['Laceless design', 'Elastic side accents', 'Canvas upper', 'Waffle outsole'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Vans' },
    isActive: true,
    isFeatured: false,
  },

  // ========== NEW BALANCE (3 products) ==========
  {
    name: 'New Balance 574 Core',
    description: 'Timeless running icon. ENCAP cushioning, retro styling.',
    brand: 'New Balance',
    category: 'Lifestyle',
    basePrice: 2600000,
    variants: createVariants('NB574', 2600000, 3200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'Grey', 'Navy', 'Red', 'Blue', 'Green']),
    images: ['https://nb.scene7.com/is/image/NB/ml574evg_nb_02_i'],
    features: ['ENCAP cushioning', 'Suede/mesh upper', 'EVA foam', 'Rubber outsole'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng New Balance' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'New Balance 990v5',
    description: 'Made in USA premium runner. Superior craftsmanship, heritage design.',
    brand: 'New Balance',
    category: 'Running',
    basePrice: 4800000,
    variants: createVariants('NB990', 4800000, 5800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Grey', 'Navy', 'Black', 'Blue']),
    images: ['https://nb.scene7.com/is/image/NB/m990gl5_nb_02_i'],
    features: ['Made in USA', 'Premium materials', 'ENCAP cushioning', 'Blown rubber outsole'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng New Balance' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'New Balance Fresh Foam 1080v12',
    description: 'Premium running shoe với Fresh Foam X cushioning. Maximum comfort.',
    brand: 'New Balance',
    category: 'Running',
    basePrice: 3800000,
    variants: createVariants('FF1080', 3800000, 4600000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Grey', 'Pink', 'Green']),
    images: ['https://nb.scene7.com/is/image/NB/m1080b12_nb_02_i'],
    features: ['Fresh Foam X', 'Hypoknit upper', 'Data-driven design', 'Plush cushioning'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng New Balance' },
    isActive: true,
    isFeatured: false,
  },

  // ========== REEBOK (2 products) ==========
  {
    name: 'Reebok Classic Leather',
    description: 'Soft garment leather upper. Timeless design from 1983.',
    brand: 'Reebok',
    category: 'Casual',
    basePrice: 2000000,
    variants: createVariants('CLEATH', 2000000, 2500000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Navy', 'Grey', 'Red', 'Green']),
    images: ['https://assets.reebok.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8331c1bcbdd34b96a0e8ab6f01718a45_9366/Classic_Leather_Shoes_White_49799_01_standard.jpg'],
    features: ['Soft leather', 'EVA midsole', 'High abrasion rubber', 'Timeless style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Reebok' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Reebok Club C 85',
    description: 'Clean court classic. Minimalist tennis shoe turned lifestyle icon.',
    brand: 'Reebok',
    category: 'Casual',
    basePrice: 1800000,
    variants: createVariants('CLUBC', 1800000, 2300000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Grey', 'Navy', 'Pink', 'Green']),
    images: ['https://assets.reebok.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/8331c1bcbdd34b96a0e8ab6f01718a45_9366/Club_C_85_Shoes_White_AR0456_01_standard.jpg'],
    features: ['Leather upper', 'Die-cut EVA midsole', 'Low-cut design', 'Minimalist style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Reebok' },
    isActive: true,
    isFeatured: false,
  },
]

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB()

    console.log('🗑️  XÓA CỨNG toàn bộ database cũ...')
    await Product.deleteMany({})
    console.log('✅ Đã xóa cứng tất cả sản phẩm cũ')

    console.log('👤 Tìm hoặc tạo admin user...')
    let adminUser = await User.findOne({ role: 'admin' })
    
    if (!adminUser) {
      console.log('Tạo admin user mới...')
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@adonis.com',
        role: 'admin'
      })
    }

    console.log('📦 Đang seed inventory đầy đủ...')
    const productsWithCreator = fullInventory.map(product => ({
      ...product,
      createdBy: adminUser._id
    }))

    await Product.insertMany(productsWithCreator)

    const productCount = await Product.countDocuments()
    const variantCount = await Product.aggregate([
      { $unwind: '$variants' },
      { $count: 'total' }
    ])
    
    // Count brands
    const brandCounts = await Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    console.log('\n✅ SEED HOÀN THÀNH!')
    console.log('==================================================')
    console.log(`📦 Tổng số sản phẩm: ${productCount}`)
    console.log(`🎨 Tổng số variants: ${variantCount[0]?.total || 0}`)
    console.log(`\n🏷️  Brands:`)
    brandCounts.forEach(b => console.log(`   - ${b._id}: ${b.count} sản phẩm`))
    console.log(`\n✨ Features:`)
    console.log(`   - 3 giới tính: Nam, Nữ, Unisex`)
    console.log(`   - 7-8 màu sắc mỗi sản phẩm`)
    console.log(`   - Size từ 35-44 (tùy sản phẩm)`)
    console.log(`   - TẤT CẢ có hàng (stock 10-40)`)
    console.log(`   - Đa dạng categories: Running, Basketball, Casual, Lifestyle, Skateboarding`)
    console.log('==================================================\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed Error:', error)
    process.exit(1)
  }
}

seedDatabase()
