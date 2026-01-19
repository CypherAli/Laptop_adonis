/**
 * Seed Shoe Products Script
 * Run: node ace seed:shoe_products
 */

import { Product } from '../app/models/product.js'
import { User } from '../app/models/user.js'

const shoeProducts = [
  {
    name: 'Nike Air Jordan 1 Retro High',
    description: 'Giày bóng rổ huyền thoại Nike Air Jordan 1 với thiết kế iconic. Phù hợp cho cả sân đấu và street style.',
    brand: 'Nike',
    category: 'Sports',
    basePrice: 4200000,
    variants: [
      {
        variantName: 'Size 40 - Chicago',
        sku: 'NIKE-AJ1-CHI-40',
        price: 4200000,
        originalPrice: 5000000,
        stock: 8,
        specifications: {
          size: '40',
          color: 'Red/White/Black',
          material: 'Leather',
          shoeType: 'Sports',
        },
        isAvailable: true,
      },
      {
        variantName: 'Size 42 - Bred',
        sku: 'NIKE-AJ1-BRD-42',
        price: 4500000,
        originalPrice: 5000000,
        stock: 5,
        specifications: {
          size: '42',
          color: 'Black/Red',
          material: 'Leather',
          shoeType: 'Sports',
        },
        isAvailable: true,
      },
    ],
    images: [
      'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes-Pz6fZ9.png',
    ],
    features: [
      'Thiết kế iconic',
      'Upper da cao cấp',
      'Đệm Air-Sole',
      'Cổ cao hỗ trợ mắt cá',
    ],
    warranty: {
      duration: '12 tháng',
      details: 'Bảo hành chính hãng Nike',
    },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'New Balance 574 Classic',
    description: 'Giày sneaker New Balance 574 với thiết kế cổ điển và độ thoải mái vượt trội. Perfect cho everyday wear.',
    brand: 'New Balance',
    category: 'Casual',
    basePrice: 2400000,
    variants: [
      {
        variantName: 'Size 39 - Grey',
        sku: 'NB-574-GR-39',
        price: 2400000,
        originalPrice: 2900000,
        stock: 18,
        specifications: {
          size: '39',
          color: 'Grey',
          material: 'Suede/Mesh',
          shoeType: 'Casual',
        },
        isAvailable: true,
      },
      {
        variantName: 'Size 41 - Navy',
        sku: 'NB-574-NV-41',
        price: 2400000,
        originalPrice: 2900000,
        stock: 15,
        specifications: {
          size: '41',
          color: 'Navy',
          material: 'Suede/Mesh',
          shoeType: 'Casual',
        },
        isAvailable: true,
      },
    ],
    images: [
      'https://nb.scene7.com/is/image/NB/ml574evb_nb_02_i',
    ],
    features: [
      'Đệm ENCAP midsole',
      'Upper suede/mesh',
      'Đế ngoài cao su',
      'Phong cách retro',
    ],
    warranty: {
      duration: '6 tháng',
      details: 'Bảo hành lỗi sản xuất',
    },
    isActive: true,
    isFeatured: false,
  },
]

console.log('🚀 Starting to seed shoe products...')

// Find seller
const seller = await User.findOne({ role: { $in: ['admin', 'partner'] } })

if (!seller) {
  console.log('❌ No admin/partner found. Run user seeder first!')
  process.exit(1)
}

// Create products
for (const product of shoeProducts) {
  const existing = await Product.findOne({ name: product.name })
  if (existing) {
    console.log(`⚠️  "${product.name}" already exists`)
    continue
  }

  await Product.create({
    ...product,
    createdBy: seller._id,
  })
  console.log(`✅ Created: ${product.name}`)
}

console.log('🎉 Shoe products seeded successfully!')
process.exit(0)
