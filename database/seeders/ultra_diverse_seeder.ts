import { BaseSeeder } from '@adonisjs/lucid/seeders'
import mongoose from 'mongoose'
import { Product } from '#models/product'
import { User } from '#models/user'

export default class extends BaseSeeder {
  async run() {
    console.log('🌈 Starting ULTRA DIVERSE Shoe Seeder (10-15 colors per product)...')

    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/laptop_shop'
      await mongoose.connect(mongoUri)
    }

    const seller = await User.findOne({ email: 'admin@shoe.com' })
    if (!seller) throw new Error('Seller not found')

    // Price logic
    const calculatePrice = (basePrice: number, gender: string) => {
      if (gender === 'Nam') return Math.round(basePrice * 0.85)
      if (gender === 'Unisex') return Math.round(basePrice * 0.8)
      return basePrice
    }

    const getColorMultiplier = (color: string) => {
      const c = color.toLowerCase()
      if (c.includes('gold') || c.includes('rose gold') || c.includes('platinum')) return 1.35
      if (c.includes('pink') || c.includes('purple') || c.includes('lavender')) return 1.25
      if (c.includes('red') || c.includes('yellow') || c.includes('orange') || c.includes('coral'))
        return 1.15
      if (c.includes('turquoise') || c.includes('mint') || c.includes('teal')) return 1.2
      if (c.includes('black') || c.includes('white') || c.includes('navy')) return 1.0
      return 1.1
    }

    const PLACEHOLDER_IMAGES = {
      nike: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      adidas: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
      converse: 'https://images.unsplash.com/photo-1514989771522-458c9b6c035a?w=800',
      vans: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      puma: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
      newbalance: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    }
    // ULTRA DIVERSE COLOR PALETTE (15 colors)
    const COLORS = [
      'Black',
      'White',
      'Navy',
      'Red',
      'Blue',
      'Pink',
      'Purple',
      'Yellow',
      'Orange',
      'Green',
      'Gray',
      'Brown',
      'Turquoise',
      'Lavender',
      'Coral',
    ]

    // SIZES
    const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43']

    // GENDERS
    const GENDERS = ['Nam', 'Nữ', 'Unisex']

    const products = [
      // 1. NIKE AIR MAX 270 - 15 colors x 3 genders x 8 sizes = 360 variants
      {
        name: 'Nike Air Max 270 Premium',
        description:
          'Giày thể thao Nike Air Max 270 với đệm khí Max Air. 15 màu sắc, 3 giới tính.',
        brand: 'Nike',
        category: 'Running',
        gender: 'Unisex',
        basePrice: 3500000,
        variants: COLORS.flatMap((color) =>
          GENDERS.flatMap((gender) =>
            SIZES.map((size) => {
              const basePrice = 3500000 * getColorMultiplier(color)
              const price = calculatePrice(basePrice, gender)
              return {
                variantName: `Size ${size} - ${color} - ${gender}`,
                sku: `NK270-${color.substring(0, 3).toUpperCase()}-${gender[0]}-${size}`,
                price: Math.round(price),
                originalPrice: Math.round(price * 1.2),
                stock: Math.floor(Math.random() * 30) + 10, // 10-40 stock
                specifications: {
                  size,
                  color,
                  material: 'Mesh/Leather',
                  shoeType: 'Running',
                  gender,
                },
                isAvailable: true,
              }
            })
          )
        ),
        images: [PLACEHOLDER_IMAGES.nike],
        createdBy: seller._id,
        features: ['Đệm khí Max Air 270', '15 màu sắc', '3 giới tính', '8 sizes'],
        isActive: true,
        isFeatured: true,
      },

      // 2. ADIDAS ULTRABOOST - 12 colors x 3 genders x 6 sizes
      {
        name: 'Adidas Ultraboost 22',
        description: 'Giày chạy bộ cao cấp Adidas Ultraboost với 12 màu sắc đa dạng.',
        brand: 'Adidas',
        category: 'Running',
        gender: 'Unisex',
        basePrice: 4500000,
        variants: COLORS.slice(0, 12).flatMap((color) =>
          GENDERS.flatMap((gender) =>
            SIZES.slice(1, 7).map((size) => {
              const basePrice = 4500000 * getColorMultiplier(color)
              const price = calculatePrice(basePrice, gender)
              return {
                variantName: `Size ${size} - ${color} - ${gender}`,
                sku: `ADS-UB-${color.substring(0, 3).toUpperCase()}-${gender[0]}-${size}`,
                price: Math.round(price),
                originalPrice: Math.round(price * 1.18),
                stock: Math.floor(Math.random() * 25) + 8,
                specifications: {
                  size,
                  color,
                  material: 'Primeknit',
                  shoeType: 'Running',
                  gender,
                },
                isAvailable: true,
              }
            })
          )
        ),
        images: [PLACEHOLDER_IMAGES.adidas],
        createdBy: seller._id,
        features: ['Công nghệ Boost', '12 màu', 'Primeknit upper'],
        isActive: true,
        isFeatured: true,
      },

      // 3. CONVERSE CHUCK TAYLOR - 15 colors x 3 genders x 7 sizes
      {
        name: 'Converse Chuck Taylor All Star',
        description: 'Giày sneaker kinh điển Converse với 15 màu sắc phong phú.',
        brand: 'Converse',
        category: 'Casual',
        gender: 'Unisex',
        basePrice: 1800000,
        variants: COLORS.flatMap((color) =>
          GENDERS.flatMap((gender) =>
            SIZES.slice(0, 7).map((size) => {
              const basePrice = 1800000 * getColorMultiplier(color)
              const price = calculatePrice(basePrice, gender)
              return {
                variantName: `Size ${size} - ${color} - ${gender}`,
                sku: `CNV-CT-${color.substring(0, 3).toUpperCase()}-${gender[0]}-${size}`,
                price: Math.round(price),
                originalPrice: Math.round(price * 1.25),
                stock: Math.floor(Math.random() * 40) + 15,
                specifications: {
                  size,
                  color,
                  material: 'Canvas',
                  shoeType: 'Sneakers',
                  gender,
                },
                isAvailable: true,
              }
            })
          )
        ),
        images: [PLACEHOLDER_IMAGES.converse],
        createdBy: seller._id,
        features: ['Thiết kế iconic', '15 màu sắc', 'Canvas bền bỉ'],
        isActive: true,
        isFeatured: true,
      },

      // 4. VANS OLD SKOOL - 10 colors x 3 genders x 6 sizes
      {
        name: 'Vans Old Skool',
        description: 'Giày Vans Old Skool với 10 màu sắc streetwear đặc trưng.',
        brand: 'Vans',
        category: 'Sneakers',
        gender: 'Unisex',
        basePrice: 1800000,
        variants: COLORS.slice(0, 10).flatMap((color) =>
          GENDERS.flatMap((gender) =>
            SIZES.slice(1, 7).map((size) => {
              const basePrice = 1800000 * getColorMultiplier(color)
              const price = calculatePrice(basePrice, gender)
              return {
                variantName: `Size ${size} - ${color} - ${gender}`,
                sku: `VN-OS-${color.substring(0, 3).toUpperCase()}-${gender[0]}-${size}`,
                price: Math.round(price),
                originalPrice: Math.round(price * 1.2),
                stock: Math.floor(Math.random() * 30) + 10,
                specifications: {
                  size,
                  color,
                  material: 'Canvas/Suede',
                  shoeType: 'Sneakers',
                  gender,
                },
                isAvailable: true,
              }
            })
          )
        ),
        images: [PLACEHOLDER_IMAGES.vans],
        createdBy: seller._id,
        features: ['Sọc Sidestripe™', '10 màu', 'Waffle outsole'],
        isActive: true,
        isFeatured: true,
      },

      // 5. PUMA SUEDE CLASSIC - 12 colors x 3 genders x 6 sizes
      {
        name: 'Puma Suede Classic XXI',
        description: 'Giày Puma Suede với da lộn cao cấp, 12 màu sắc thời trang.',
        brand: 'Puma',
        category: 'Sneakers',
        gender: 'Unisex',
        basePrice: 2200000,
        variants: COLORS.slice(0, 12).flatMap((color) =>
          GENDERS.flatMap((gender) =>
            SIZES.slice(2, 8).map((size) => {
              const basePrice = 2200000 * getColorMultiplier(color)
              const price = calculatePrice(basePrice, gender)
              return {
                variantName: `Size ${size} - ${color} - ${gender}`,
                sku: `PM-SD-${color.substring(0, 3).toUpperCase()}-${gender[0]}-${size}`,
                price: Math.round(price),
                originalPrice: Math.round(price * 1.22),
                stock: Math.floor(Math.random() * 25) + 8,
                specifications: {
                  size,
                  color,
                  material: 'Suede',
                  shoeType: 'Sneakers',
                  gender,
                },
                isAvailable: true,
              }
            })
          )
        ),
        images: [PLACEHOLDER_IMAGES.puma],
        createdBy: seller._id,
        features: ['Da lộn cao cấp', '12 màu', 'Thiết kế retro'],
        isActive: true,
        isFeatured: true,
      },

      // 6. NEW BALANCE 574 - 10 colors x 3 genders x 7 sizes
      {
        name: 'New Balance 574 Core',
        description: 'Giày New Balance 574 phong cách retro với 10 màu sắc đa dạng.',
        brand: 'New Balance',
        category: 'Lifestyle',
        gender: 'Unisex',
        basePrice: 2400000,
        variants: COLORS.slice(0, 10).flatMap((color) =>
          GENDERS.flatMap((gender) =>
            SIZES.slice(1, 8).map((size) => {
              const basePrice = 2400000 * getColorMultiplier(color)
              const price = calculatePrice(basePrice, gender)
              return {
                variantName: `Size ${size} - ${color} - ${gender}`,
                sku: `NB-574-${color.substring(0, 3).toUpperCase()}-${gender[0]}-${size}`,
                price: Math.round(price),
                originalPrice: Math.round(price * 1.2),
                stock: Math.floor(Math.random() * 30) + 10,
                specifications: {
                  size,
                  color,
                  material: 'Suede/Mesh',
                  shoeType: 'Lifestyle',
                  gender,
                },
                isAvailable: true,
              }
            })
          )
        ),
        images: [PLACEHOLDER_IMAGES.newbalance],
        createdBy: seller._id,
        features: ['ENCAP midsole', '10 màu', 'Retro running'],
        isActive: true,
        isFeatured: true,
      },

      // 7. NIKE JORDAN 1 - 15 colors x 3 genders x 7 sizes (NEW!)
      {
        name: 'Nike Air Jordan 1 Retro High',
        description: 'Giày bóng rổ huyền thoại Nike Jordan 1 với 15 màu sắc iconic.',
        brand: 'Nike',
        category: 'Basketball',
        gender: 'Unisex',
        basePrice: 4200000,
        variants: COLORS.flatMap((color) =>
          GENDERS.flatMap((gender) =>
            SIZES.slice(0, 7).map((size) => {
              const basePrice = 4200000 * getColorMultiplier(color)
              const price = calculatePrice(basePrice, gender)
              return {
                variantName: `Size ${size} - ${color} - ${gender}`,
                sku: `NKJ1-${color.substring(0, 3).toUpperCase()}-${gender[0]}-${size}`,
                price: Math.round(price),
                originalPrice: Math.round(price * 1.25),
                stock: Math.floor(Math.random() * 20) + 5,
                specifications: {
                  size,
                  color,
                  material: 'Leather',
                  shoeType: 'Basketball',
                  gender,
                },
                isAvailable: true,
              }
            })
          )
        ),
        images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800'],
        createdBy: seller._id,
        features: ['Thiết kế huyền thoại', '15 màu colorways', 'Premium leather'],
        isActive: true,
        isFeatured: true,
      },

      // 8. ADIDAS STAN SMITH - 12 colors x 3 genders x 6 sizes (NEW!)
      {
        name: 'Adidas Stan Smith',
        description: 'Giày tennis kinh điển Adidas Stan Smith với 12 màu sắc.',
        brand: 'Adidas',
        category: 'Tennis',
        gender: 'Unisex',
        basePrice: 2600000,
        variants: COLORS.slice(0, 12).flatMap((color) =>
          GENDERS.flatMap((gender) =>
            SIZES.slice(1, 7).map((size) => {
              const basePrice = 2600000 * getColorMultiplier(color)
              const price = calculatePrice(basePrice, gender)
              return {
                variantName: `Size ${size} - ${color} - ${gender}`,
                sku: `ADS-SS-${color.substring(0, 3).toUpperCase()}-${gender[0]}-${size}`,
                price: Math.round(price),
                originalPrice: Math.round(price * 1.2),
                stock: Math.floor(Math.random() * 35) + 12,
                specifications: {
                  size,
                  color,
                  material: 'Leather',
                  shoeType: 'Tennis',
                  gender,
                },
                isAvailable: true,
              }
            })
          )
        ),
        images: ['https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800'],
        createdBy: seller._id,
        features: ['Thiết kế minimalist', '12 màu', 'Premium leather'],
        isActive: true,
        isFeatured: true,
      },
    ]

    let totalVariants = 0
    for (const productData of products) {
      try {
        const exists = await Product.findOne({ name: productData.name })
        if (exists) {
          console.log(`⚠️  "${productData.name}" exists, REPLACING with ultra diverse version...`)
          await Product.findByIdAndDelete(exists._id)
        }

        await Product.create(productData)
        totalVariants += productData.variants.length
        console.log(`✅ Created: ${productData.name} (${productData.variants.length} variants)`)
      } catch (error) {
        console.error(`❌ Error with ${productData.name}:`, error.message)
      }
    }

    console.log('🌈 ULTRA DIVERSE Seeding completed!')
    console.log(`📊 Total: ${products.length} products with ${totalVariants} variants`)
    console.log(`🎨 Colors: 10-15 per product | 🚻 Genders: 3 | 👟 Sizes: 6-8`)
  }
}
