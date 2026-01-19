import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { Product } from '#models/product'
import { User } from '#models/user'
import mongoose from 'mongoose'

export default class extends BaseSeeder {
  async run() {
    console.log('🚀 Starting Shoe Products Seeder...')

    // Find admin or partner user to be the seller
    const seller = await User.findOne({ role: { $in: ['admin', 'partner'] } })

    if (!seller) {
      console.log('❌ No admin or partner user found. Please run user seeder first.')
      return
    }

    console.log(`✅ Found seller: ${seller.email}`)

    // Sample shoe products
    const shoeProducts = [
      {
        name: 'Nike Air Max 270',
        description: 'Giày thể thao Nike Air Max 270 với công nghệ đệm khí Max Air mang lại sự thoải mái tối đa. Thiết kế hiện đại, phù hợp cho cả chạy bộ và dạo phố.',
        brand: 'Nike',
        category: 'Running',
        basePrice: 3500000,
        variants: [
          {
            variantName: 'Size 40 - Black/White',
            sku: 'NIKE-AM270-BW-40',
            price: 3500000,
            originalPrice: 4200000,
            stock: 15,
            specifications: {
              size: '40',
              color: 'Black/White',
              material: 'Mesh/Synthetic',
              shoeType: 'Running',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 41 - Black/White',
            sku: 'NIKE-AM270-BW-41',
            price: 3500000,
            originalPrice: 4200000,
            stock: 20,
            specifications: {
              size: '41',
              color: 'Black/White',
              material: 'Mesh/Synthetic',
              shoeType: 'Running',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 42 - Red/Black',
            sku: 'NIKE-AM270-RB-42',
            price: 3600000,
            originalPrice: 4200000,
            stock: 10,
            specifications: {
              size: '42',
              color: 'Red/Black',
              material: 'Mesh/Synthetic',
              shoeType: 'Running',
            },
            isAvailable: true,
          },
        ],
        images: [
          'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png',
        ],
        createdBy: seller._id,
        features: [
          'Đệm khí Max Air 270',
          'Upper mesh thoáng khí',
          'Đế ngoài cao su bền bỉ',
          'Thiết kế năng động',
        ],
        warranty: {
          duration: '12 tháng',
          details: 'Bảo hành lỗi nhà sản xuất',
        },
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Adidas Ultraboost 22',
        description: 'Giày chạy bộ cao cấp Adidas Ultraboost 22 với công nghệ đệm Boost mang lại năng lượng phản hồi tuyệt vời. Thích hợp cho runner chuyên nghiệp.',
        brand: 'Adidas',
        category: 'Running',
        basePrice: 4500000,
        variants: [
          {
            variantName: 'Size 39 - Core Black',
            sku: 'ADS-UB22-CB-39',
            price: 4500000,
            originalPrice: 5200000,
            stock: 12,
            specifications: {
              size: '39',
              color: 'Core Black',
              material: 'Primeknit',
              shoeType: 'Running',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 40 - Solar Yellow',
            sku: 'ADS-UB22-SY-40',
            price: 4600000,
            originalPrice: 5200000,
            stock: 8,
            specifications: {
              size: '40',
              color: 'Solar Yellow',
              material: 'Primeknit',
              shoeType: 'Running',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 42 - Core Black',
            sku: 'ADS-UB22-CB-42',
            price: 4500000,
            originalPrice: 5200000,
            stock: 15,
            specifications: {
              size: '42',
              color: 'Core Black',
              material: 'Primeknit',
              shoeType: 'Running',
            },
            isAvailable: true,
          },
        ],
        images: [
          'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_Light_Shoes_Black_GY9350_01_standard.jpg',
        ],
        createdBy: seller._id,
        features: [
          'Công nghệ đệm Boost',
          'Upper Primeknit ôm chân',
          'Torsion System ổn định',
          'Continental™ Rubber đế ngoài',
        ],
        warranty: {
          duration: '12 tháng',
          details: 'Bảo hành chính hãng',
        },
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Converse Chuck Taylor All Star',
        description: 'Giày sneaker kinh điển Converse Chuck Taylor với thiết kế vượt thời gian. Phù hợp với mọi phong cách thời trang.',
        brand: 'Converse',
        category: 'Casual',
        basePrice: 1200000,
        variants: [
          {
            variantName: 'Size 38 - Black',
            sku: 'CVS-CT-BK-38',
            price: 1200000,
            originalPrice: 1500000,
            stock: 25,
            specifications: {
              size: '38',
              color: 'Black',
              material: 'Canvas',
              shoeType: 'Casual',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 39 - White',
            sku: 'CVS-CT-WH-39',
            price: 1200000,
            originalPrice: 1500000,
            stock: 30,
            specifications: {
              size: '39',
              color: 'White',
              material: 'Canvas',
              shoeType: 'Casual',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 41 - Red',
            sku: 'CVS-CT-RD-41',
            price: 1250000,
            originalPrice: 1500000,
            stock: 18,
            specifications: {
              size: '41',
              color: 'Red',
              material: 'Canvas',
              shoeType: 'Casual',
            },
            isAvailable: true,
          },
        ],
        images: [
          'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw6f1c0e4d/images/a_107/M9160_A_107X1.jpg',
        ],
        createdBy: seller._id,
        features: [
          'Thiết kế cổ điển',
          'Upper canvas bền đẹp',
          'Đế cao su chống trượt',
          'Dễ phối đồ',
        ],
        warranty: {
          duration: '6 tháng',
          details: 'Bảo hành lỗi sản xuất',
        },
        isActive: true,
        isFeatured: false,
      },
      {
        name: 'Puma Suede Classic XXI',
        description: 'Giày sneaker Puma Suede với chất liệu da lộn cao cấp, mang phong cách retro đầy cuốn hút.',
        brand: 'Puma',
        category: 'Sneakers',
        basePrice: 2200000,
        variants: [
          {
            variantName: 'Size 40 - Black',
            sku: 'PUMA-SC-BK-40',
            price: 2200000,
            originalPrice: 2800000,
            stock: 14,
            specifications: {
              size: '40',
              color: 'Black',
              material: 'Suede',
              shoeType: 'Sneakers',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 41 - Navy',
            sku: 'PUMA-SC-NV-41',
            price: 2200000,
            originalPrice: 2800000,
            stock: 12,
            specifications: {
              size: '41',
              color: 'Navy',
              material: 'Suede',
              shoeType: 'Sneakers',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 42 - Brown',
            sku: 'PUMA-SC-BR-42',
            price: 2300000,
            originalPrice: 2800000,
            stock: 10,
            specifications: {
              size: '42',
              color: 'Brown',
              material: 'Suede',
              shoeType: 'Sneakers',
            },
            isAvailable: true,
          },
        ],
        images: [
          'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers',
        ],
        createdBy: seller._id,
        features: [
          'Upper da lộn cao cấp',
          'Logo Puma iconic',
          'Đế giữa EVA êm ái',
          'Phong cách retro',
        ],
        warranty: {
          duration: '6 tháng',
          details: 'Bảo hành chính hãng',
        },
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Vans Old Skool',
        description: 'Giày sneaker Vans Old Skool với sọc trademark đặc trưng, biểu tượng của văn hóa skate.',
        brand: 'Vans',
        category: 'Sneakers',
        basePrice: 1800000,
        variants: [
          {
            variantName: 'Size 39 - Black/White',
            sku: 'VANS-OS-BW-39',
            price: 1800000,
            originalPrice: 2200000,
            stock: 20,
            specifications: {
              size: '39',
              color: 'Black/White',
              material: 'Canvas/Suede',
              shoeType: 'Sneakers',
            },
            isAvailable: true,
          },
          {
            variantName: 'Size 41 - Navy',
            sku: 'VANS-OS-NV-41',
            price: 1850000,
            originalPrice: 2200000,
            stock: 16,
            specifications: {
              size: '41',
              color: 'Navy',
              material: 'Canvas/Suede',
              shoeType: 'Sneakers',
            },
            isAvailable: true,
          },
        ],
        images: [
          'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800',
        ],
        createdBy: seller._id,
        features: [
          'Sọc Sidestripe™ cổ điển',
          'Đệm đệm đế giữa',
          'Đế Waffle grip tuyệt vời',
          'Phong cách skate iconic',
        ],
        warranty: {
          duration: '6 tháng',
          details: 'Bảo hành lỗi nhà sản xuất',
        },
        isActive: true,
        isFeatured: false,
      },
    ]

    console.log('📦 Creating shoe products...')

    for (const productData of shoeProducts) {
      try {
        const existing = await Product.findOne({ name: productData.name })
        if (existing) {
          console.log(`⚠️  Product "${productData.name}" already exists, skipping...`)
          continue
        }

        await Product.create(productData)
        console.log(`✅ Created: ${productData.name}`)
      } catch (error) {
        console.error(`❌ Error creating ${productData.name}:`, error.message)
      }
    }

    console.log('🎉 Shoe Products Seeder completed!')
  }
}
