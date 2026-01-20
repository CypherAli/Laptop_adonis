/**
 * Thêm nhiều sản phẩm mới vào database hiện tại (KHÔNG xóa cũ)
 * Run: node scripts/add_more_products.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adonis_shoe_shop')
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error)
    process.exit(1)
  }
}

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

const createVariants = (baseSKU, basePrice, originalPrice, genders, sizes, colors) => {
  const variants = []
  genders.forEach(gender => {
    sizes.forEach(size => {
      colors.forEach(color => {
        const priceVariation = Math.floor(Math.random() * 200000)
        variants.push({
          variantName: `${gender} Size ${size} - ${color}`,
          sku: `${baseSKU}-${gender.charAt(0)}-${size}-${color.substring(0, 2).toUpperCase()}`,
          price: basePrice + priceVariation,
          originalPrice: originalPrice + priceVariation,
          stock: Math.floor(Math.random() * 40) + 15, // 15-55 items
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

// 30 sản phẩm mới
const newProducts = [
  // NIKE (7 more)
  {
    name: 'Nike Tiempo Legend 9',
    description: 'Giày bóng đá cao cấp với upper da kangaroo. Touch và control tuyệt vời.',
    brand: 'Nike',
    category: 'Football',
    basePrice: 3200000,
    variants: createVariants('TIEMPO9', 3200000, 4000000, 
      ['Nam', 'Unisex'], 
      ['38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Green', 'Orange', 'Grey']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-6098c121-7d4e-4e1d-a77c-d1c4f4e4e4e4/tiempo-legend-9-elite-fg-football-boot-VdZBTK.png'],
    features: ['Kangaroo leather', 'FlyTouch Pro', 'Anti-clog traction', 'Quadfit mesh'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Nike Metcon 8',
    description: 'Training shoe cho cross-training và gym. Ổn định, bền bỉ, đa năng.',
    brand: 'Nike',
    category: 'Training',
    basePrice: 3400000,
    variants: createVariants('METCON8', 3400000, 4200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Red', 'Blue', 'Pink', 'Orange', 'Grey']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-6098c121-7d4e-4e1d-a77c-d1c4f4e4e4e4/metcon-8-training-shoes-TKrWhg.png'],
    features: ['Wide heel', 'Rope wrap', 'Hyperlift plate', 'Textured grip'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Nike Joyride Run Flyknit',
    description: 'Công nghệ Joyride beads mang lại cảm giác mềm mại như đi trên mây.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 3600000,
    variants: createVariants('JOYRIDE', 3600000, 4400000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Blue', 'Pink', 'Grey', 'Green', 'Purple']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-6098c121-7d4e-4e1d-a77c-d1c4f4e4e4e4/joyride-run-flyknit-running-shoes-VJQQtQ.png'],
    features: ['Joyride beads', 'Flyknit upper', 'Soft cushioning', 'Flexible fit'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Free RN 5.0',
    description: 'Natural motion running. Linh hoạt, nhẹ nhàng, tự nhiên như chạy chân trần.',
    brand: 'Nike',
    category: 'Running',
    basePrice: 2800000,
    variants: createVariants('FREE5', 2800000, 3500000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Pink', 'Red', 'Green', 'Orange']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-6098c121-7d4e-4e1d-a77c-d1c4f4e4e4e4/free-rn-5-road-running-shoes-sbfC1N.png'],
    features: ['Flexible sole', 'Natural motion', 'Lightweight', 'Breathable mesh'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Nike Zoom Freak 4',
    description: 'Giannis signature shoe. Explosive power, multi-directional traction.',
    brand: 'Nike',
    category: 'Basketball',
    basePrice: 3800000,
    variants: createVariants('FREAK4', 3800000, 4600000, 
      ['Nam', 'Unisex'], 
      ['39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Blue', 'Green', 'Red', 'Orange', 'Grey']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-6098c121-7d4e-4e1d-a77c-d1c4f4e4e4e4/zoom-freak-4-basketball-shoes-GKN5NP.png'],
    features: ['Zoom Air', 'Multidirectional traction', 'Supportive fit', 'Giannis signature'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Nike Kyrie 8',
    description: 'Kyrie Irving signature với responsive cushioning và grippy traction.',
    brand: 'Nike',
    category: 'Basketball',
    basePrice: 3600000,
    variants: createVariants('KYRIE8', 3600000, 4400000, 
      ['Nam', 'Unisex'], 
      ['38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Red', 'Yellow', 'Purple', 'Green']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-6098c121-7d4e-4e1d-a77c-d1c4f4e4e4e4/kyrie-8-basketball-shoes-HZ2XBL.png'],
    features: ['Responsive cushioning', 'Grippy traction', 'Lockdown fit', 'Kyrie signature'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Nike ACG Mountain Fly 2',
    description: 'Outdoor adventure shoe. All-terrain grip, weather-resistant.',
    brand: 'Nike',
    category: 'Outdoor',
    basePrice: 3400000,
    variants: createVariants('ACG-MF2', 3400000, 4200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'Grey', 'Green', 'Brown', 'Navy', 'Orange']),
    images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/i1-6098c121-7d4e-4e1d-a77c-d1c4f4e4e4e4/acg-mountain-fly-2-gore-tex-shoes-vvJrqV.png'],
    features: ['All-terrain grip', 'GORE-TEX waterproof', 'Trail-ready', 'Durable construction'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Nike' },
    isActive: true,
    isFeatured: false,
  },

  // ADIDAS (7 more)
  {
    name: 'Adidas Alphabounce+ Run',
    description: 'Bounce cushioning với Forgedmesh upper. Comfortable và responsive.',
    brand: 'Adidas',
    category: 'Running',
    basePrice: 2600000,
    variants: createVariants('ALPHA', 2600000, 3200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Grey', 'Pink', 'Red', 'Green']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/Alphabounce_Shoes_Black_GY5429_01_standard.jpg'],
    features: ['Bounce cushioning', 'Forgedmesh upper', 'Flexible sole', 'Comfortable fit'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas Predator Edge',
    description: 'Giày bóng đá với Facet technology. Control và accuracy tuyệt vời.',
    brand: 'Adidas',
    category: 'Football',
    basePrice: 3600000,
    variants: createVariants('PRED-EDGE', 3600000, 4400000, 
      ['Nam', 'Unisex'], 
      ['38', '39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Red', 'Blue', 'Green', 'Orange']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/Predator_Edge_Firm_Ground_Boots_Black_GW4941_01_standard.jpg'],
    features: ['Facet technology', 'Control Frame', 'Primeknit collar', 'Firm ground studs'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas Terrex Swift R2 GTX',
    description: 'Hiking shoe với GORE-TEX. Waterproof và durable cho mọi địa hình.',
    brand: 'Adidas',
    category: 'Outdoor',
    basePrice: 3200000,
    variants: createVariants('TERREX-R2', 3200000, 4000000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'Grey', 'Blue', 'Green', 'Brown', 'Navy']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/Terrex_Swift_R2_GTX_Hiking_Shoes_Black_CM7492_01_standard.jpg'],
    features: ['GORE-TEX waterproof', 'Continental rubber', 'Lightweight', 'Trail-ready'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas Solar Glide 5',
    description: 'Long-distance running với Boost và Continental rubber outsole.',
    brand: 'Adidas',
    category: 'Running',
    basePrice: 3400000,
    variants: createVariants('SOLAR5', 3400000, 4200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Pink', 'Grey', 'Orange', 'Green']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/Solar_Glide_5_Shoes_Black_GZ0178_01_standard.jpg'],
    features: ['Boost cushioning', 'Continental rubber', 'Fitcounter heel', 'Long-distance comfort'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas Samba Classic',
    description: 'Indoor football icon turned streetwear staple. Timeless design.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2300000,
    variants: createVariants('SAMBA', 2300000, 2900000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Navy', 'Red', 'Green', 'Grey', 'Blue']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/Samba_Classic_Shoes_Black_034563_01_standard.jpg'],
    features: ['Leather upper', 'Gum rubber sole', 'Classic 3-Stripes', 'Indoor football heritage'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Adidas Continental 80',
    description: 'Retro tennis shoe với French terry lining. Vintage vibes.',
    brand: 'Adidas',
    category: 'Casual',
    basePrice: 2200000,
    variants: createVariants('CONT80', 2200000, 2800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['White', 'Black', 'Pink', 'Blue', 'Grey', 'Green']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/Continental_80_Shoes_White_EE5342_01_standard.jpg'],
    features: ['Leather upper', 'French terry lining', 'Retro design', 'Comfortable fit'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Adidas Questar Flow',
    description: 'Lifestyle runner với Cloudfoam cushioning. Comfort cho everyday wear.',
    brand: 'Adidas',
    category: 'Lifestyle',
    basePrice: 2000000,
    variants: createVariants('QUESTAR', 2000000, 2600000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Grey', 'Blue', 'Pink', 'Navy']),
    images: ['https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c21a96c62ea94206af6fad7a01158d22_9366/Questar_Flow_Shoes_Black_FW5122_01_standard.jpg'],
    features: ['Cloudfoam cushioning', 'Mesh upper', 'Everyday comfort', 'Versatile style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Adidas' },
    isActive: true,
    isFeatured: false,
  },

  // PUMA (5 more)
  {
    name: 'Puma Deviate Nitro',
    description: 'Racing shoe với Nitro foam. Lightweight và responsive cho marathon.',
    brand: 'Puma',
    category: 'Running',
    basePrice: 4200000,
    variants: createVariants('DEVIATE', 4200000, 5200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Red', 'Green', 'Orange']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/194245/01/sv01/fnd/PNA/fmt/png/Deviate-Nitro-Elite-Racer-Running-Shoes'],
    features: ['Nitro foam', 'Carbon plate', 'Lightweight', 'Racing geometry'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Puma Velocity Nitro 2',
    description: 'Daily training runner với Nitro foam. Versatile và comfortable.',
    brand: 'Puma',
    category: 'Running',
    basePrice: 3000000,
    variants: createVariants('VELO2', 3000000, 3800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Pink', 'Grey', 'Green', 'Orange']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/194245/01/sv01/fnd/PNA/fmt/png/Velocity-Nitro-2-Running-Shoes'],
    features: ['Nitro foam', 'Pumagrip outsole', 'Breathable mesh', 'Daily training'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Puma Future Z 1.1',
    description: 'Football boot với FUZIONFIT+ compression. Adaptive và dynamic.',
    brand: 'Puma',
    category: 'Football',
    basePrice: 3800000,
    variants: createVariants('FUTUREZ', 3800000, 4600000, 
      ['Nam', 'Unisex'], 
      ['38', '39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Blue', 'Yellow', 'Red', 'Green']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/194245/01/sv01/fnd/PNA/fmt/png/Future-Z-Football-Boots'],
    features: ['FUZIONFIT+ compression', 'Dynamic Motion System', 'Grip Control Pro', 'Adaptive fit'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Puma Cali Court',
    description: 'Platform sneaker với West Coast vibes. Bold và stylish.',
    brand: 'Puma',
    category: 'Casual',
    basePrice: 2200000,
    variants: createVariants('CALI', 2200000, 2800000, 
      ['Nữ', 'Unisex'], 
      ['35', '36', '37', '38', '39', '40', '41'], 
      ['White', 'Black', 'Pink', 'Blue', 'Grey', 'Purple']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/380768/01/sv01/fnd/PNA/fmt/png/Cali-Court-Womens-Sneakers'],
    features: ['Platform sole', 'Leather upper', 'Cali branding', 'West Coast style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Puma Tazon 6',
    description: 'Training sneaker với supportive fit. Versatile cho gym và casual.',
    brand: 'Puma',
    category: 'Training',
    basePrice: 1800000,
    variants: createVariants('TAZON6', 1800000, 2300000, 
      ['Nam', 'Unisex'], 
      ['38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Grey', 'Blue', 'Red', 'Navy']),
    images: ['https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/194245/01/sv01/fnd/PNA/fmt/png/Tazon-6-Training-Shoes'],
    features: ['TPU shank', 'EVA cushioning', 'Durable rubber', 'Supportive fit'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Puma' },
    isActive: true,
    isFeatured: false,
  },

  // UNDER ARMOUR (5 products)
  {
    name: 'Under Armour HOVR Phantom 3',
    description: 'Running shoe với UA HOVR cushioning. Energy return và connectivity.',
    brand: 'Under Armour',
    category: 'Running',
    basePrice: 3200000,
    variants: createVariants('HOVR-PH3', 3200000, 4000000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Grey', 'Blue', 'Pink', 'Red']),
    images: ['https://underarmour.scene7.com/is/image/Underarmour/3024268-001_DEFAULT'],
    features: ['UA HOVR cushioning', 'Compression mesh', 'Connected tracking', 'Energy return'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Under Armour' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Under Armour Curry 10',
    description: 'Stephen Curry signature với UA Flow technology. Grippy và responsive.',
    brand: 'Under Armour',
    category: 'Basketball',
    basePrice: 4200000,
    variants: createVariants('CURRY10', 4200000, 5200000, 
      ['Nam', 'Unisex'], 
      ['38', '39', '40', '41', '42', '43', '44'], 
      ['Black', 'White', 'Blue', 'Yellow', 'Red', 'Orange']),
    images: ['https://underarmour.scene7.com/is/image/Underarmour/3025612-001_DEFAULT'],
    features: ['UA Flow technology', 'Curry branding', 'Lightweight', 'Court grip'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Under Armour' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Under Armour Charged Assert 9',
    description: 'Affordable training shoe. Cushioning và durability cho everyday use.',
    brand: 'Under Armour',
    category: 'Training',
    basePrice: 1800000,
    variants: createVariants('ASSERT9', 1800000, 2300000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'Grey', 'White', 'Navy', 'Blue', 'Red']),
    images: ['https://underarmour.scene7.com/is/image/Underarmour/3024590-001_DEFAULT'],
    features: ['Charged Cushioning', 'Mesh upper', 'Durable outsole', 'Affordable price'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Under Armour' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Under Armour Tribase Reign 4',
    description: 'Cross-training shoe. Stable base, versatile performance.',
    brand: 'Under Armour',
    category: 'Training',
    basePrice: 3000000,
    variants: createVariants('TRIBASE4', 3000000, 3800000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Grey', 'Blue', 'Red', 'Orange']),
    images: ['https://underarmour.scene7.com/is/image/Underarmour/3025438-001_DEFAULT'],
    features: ['TriBase technology', 'Low to ground', 'Stable base', 'Cross-training'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Under Armour' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Under Armour SlipSpeed',
    description: 'Laceless innovation. Easy on/off với performance fit.',
    brand: 'Under Armour',
    category: 'Lifestyle',
    basePrice: 2800000,
    variants: createVariants('SLIPSPD', 2800000, 3500000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Grey', 'Blue', 'Pink', 'Green']),
    images: ['https://underarmour.scene7.com/is/image/Underarmour/3025442-001_DEFAULT'],
    features: ['Laceless design', 'Easy on/off', 'Knit upper', 'Modern style'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Under Armour' },
    isActive: true,
    isFeatured: false,
  },

  // ASICS (6 products)
  {
    name: 'Asics Gel-Kayano 29',
    description: 'Premium stability runner. Maximum support cho overpronators.',
    brand: 'Asics',
    category: 'Running',
    basePrice: 4600000,
    variants: createVariants('KAYANO29', 4600000, 5600000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Grey', 'Pink', 'Orange']),
    images: ['https://images.asics.com/is/image/asics/1011B440_001_SR_RT_GLB'],
    features: ['FlyteFoam Blast+', 'Gel cushioning', 'Stability support', 'Premium runner'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Asics' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Asics Gel-Nimbus 25',
    description: 'Neutral cushioned runner. Cloud-like comfort cho long distances.',
    brand: 'Asics',
    category: 'Running',
    basePrice: 4400000,
    variants: createVariants('NIMBUS25', 4400000, 5400000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Pink', 'Grey', 'Green', 'Orange']),
    images: ['https://images.asics.com/is/image/asics/1011B547_020_SR_RT_GLB'],
    features: ['FlyteFoam Blast+', 'Gel cushioning', 'Soft landing', 'Long-distance comfort'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Asics' },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Asics GT-2000 11',
    description: 'Versatile stability shoe. Balance của support và comfort.',
    brand: 'Asics',
    category: 'Running',
    basePrice: 3400000,
    variants: createVariants('GT2000', 3400000, 4200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Grey', 'Red', 'Pink']),
    images: ['https://images.asics.com/is/image/asics/1011B440_400_SR_RT_GLB'],
    features: ['FlyteFoam cushioning', 'Gel technology', 'Stability features', 'Versatile trainer'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Asics' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Asics Gel-Quantum 360 VII',
    description: '360-degree Gel cushioning. Lifestyle runner với premium comfort.',
    brand: 'Asics',
    category: 'Lifestyle',
    basePrice: 3800000,
    variants: createVariants('QUANTUM', 3800000, 4600000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42'], 
      ['Black', 'White', 'Grey', 'Blue', 'Pink', 'Green']),
    images: ['https://images.asics.com/is/image/asics/1201A948_001_SR_RT_GLB'],
    features: ['360-degree Gel', 'Scutoid technology', 'Knit upper', 'Lifestyle comfort'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Asics' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Asics Novablast 3',
    description: 'Fun và bouncy trainer. Energetic ride cho everyday runs.',
    brand: 'Asics',
    category: 'Running',
    basePrice: 3600000,
    variants: createVariants('NOVA3', 3600000, 4400000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['37', '38', '39', '40', '41', '42', '43'], 
      ['Black', 'White', 'Blue', 'Pink', 'Orange', 'Green']),
    images: ['https://images.asics.com/is/image/asics/1011B508_100_SR_RT_GLB'],
    features: ['FlyteFoam Blast+', 'Bouncy ride', 'Fun training', 'Energetic feel'],
    warranty: { duration: '12 tháng', details: 'Bảo hành chính hãng Asics' },
    isActive: true,
    isFeatured: false,
  },
  {
    name: 'Asics Gel-Lyte III',
    description: 'Retro runner icon. Split-tongue design và Gel cushioning.',
    brand: 'Asics',
    category: 'Casual',
    basePrice: 2600000,
    variants: createVariants('LYTE3', 2600000, 3200000, 
      ['Nam', 'Nữ', 'Unisex'], 
      ['36', '37', '38', '39', '40', '41', '42', '43'], 
      ['White', 'Black', 'Grey', 'Blue', 'Red', 'Green', 'Navy']),
    images: ['https://images.asics.com/is/image/asics/1191A266_100_SR_RT_GLB'],
    features: ['Split-tongue design', 'Gel cushioning', 'Retro style', 'Suede upper'],
    warranty: { duration: '6 tháng', details: 'Bảo hành chính hãng Asics' },
    isActive: true,
    isFeatured: false,
  },
]

const addProducts = async () => {
  try {
    await connectDB()

    console.log('👤 Tìm admin user...')
    let adminUser = await User.findOne({ role: 'admin' })
    
    if (!adminUser) {
      console.log('Tạo admin user...')
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@adonis.com',
        role: 'admin'
      })
    }

    console.log('📦 Đang thêm 30 sản phẩm mới...')
    const productsWithCreator = newProducts.map(product => ({
      ...product,
      createdBy: adminUser._id
    }))

    await Product.insertMany(productsWithCreator)

    const totalProducts = await Product.countDocuments()
    const totalVariants = await Product.aggregate([
      { $unwind: '$variants' },
      { $count: 'total' }
    ])
    
    const brandCounts = await Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    console.log('\n✅ ĐÃ THÊM THÀNH CÔNG!')
    console.log('==================================================')
    console.log(`📦 Tổng sản phẩm hiện tại: ${totalProducts}`)
    console.log(`🎨 Tổng variants hiện tại: ${totalVariants[0]?.total || 0}`)
    console.log(`\n🏷️  Brands:`)
    brandCounts.forEach(b => console.log(`   - ${b._id}: ${b.count} sản phẩm`))
    console.log('==================================================\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

addProducts()
