/**
 * Seed Products Command
 * Usage: node ace seed:products
 */

import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Product } from '#models/product'
import { User } from '#models/user'
import mongoose from 'mongoose'
import env from '#start/env'

export default class SeedProducts extends BaseCommand {
  static commandName = 'seed:products'
  static description = 'Seed shoe products into database'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      this.logger.info('🌱 Starting product seeding...')

      // Connect to MongoDB
      await mongoose.connect(env.get('MONGODB_URI'))
      this.logger.info('✓ MongoDB connected')

      // Find or create admin user as product creator
      let adminUser = await User.findOne({ email: 'admin@shoe.com' })
      if (!adminUser) {
        this.logger.warning('⚠ Admin user not found, creating one...')
        adminUser = await User.create({
          username: 'admin',
          email: 'admin@shoe.com',
          password: 'admin123',
          role: 'admin',
          isApproved: true,
          isActive: true,
          verification: {
            email: {
              isVerified: true,
            },
          },
        })
      }

      // Clear existing products
      const deletedCount = await Product.deleteMany({})
      this.logger.info(`🗑 Cleared ${deletedCount.deletedCount} existing products`)

      const shoeProducts = [
        {
          name: 'Nike Air Jordan 1 Retro High',
          description:
            'Giày bóng rổ huyền thoại Nike Air Jordan 1 với thiết kế iconic. Phù hợp cho cả sân đấu và street style.',
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
                gender: 'Unisex',
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
                gender: 'Unisex',
              },
              isAvailable: true,
            },
          ],
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
          features: ['Thiết kế iconic', 'Đệm Air cushion', 'Da cao cấp', 'Grip tuyệt vời'],
          warranty: {
            duration: '6 tháng',
            details: 'Bảo hành lỗi nhà sản xuất',
          },
          rating: {
            average: 4.8,
            count: 156,
          },
          createdBy: adminUser._id,
          isActive: true,
          isFeatured: true,
          soldCount: 89,
          viewCount: 1250,
        },
        {
          name: 'Adidas Ultraboost 22',
          description:
            'Giày chạy bộ Adidas Ultraboost 22 với công nghệ đệm Boost tiên tiến, mang lại cảm giác êm ái tối đa.',
          brand: 'Adidas',
          category: 'Running',
          basePrice: 3800000,
          variants: [
            {
              variantName: 'Size 41 - Core Black',
              sku: 'ADIDAS-UB22-BLK-41',
              price: 3800000,
              originalPrice: 4500000,
              stock: 12,
              specifications: {
                size: '41',
                color: 'Black',
                material: 'Primeknit',
                shoeType: 'Running',
                gender: 'Nam',
              },
              isAvailable: true,
            },
            {
              variantName: 'Size 39 - Cloud White',
              sku: 'ADIDAS-UB22-WHT-39',
              price: 3800000,
              originalPrice: 4500000,
              stock: 10,
              specifications: {
                size: '39',
                color: 'White',
                material: 'Primeknit',
                shoeType: 'Running',
                gender: 'Nữ',
              },
              isAvailable: true,
            },
          ],
          images: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800'],
          features: ['Boost cushioning', 'Primeknit upper', 'Continental rubber outsole'],
          warranty: {
            duration: '6 tháng',
            details: 'Bảo hành lỗi sản xuất',
          },
          rating: {
            average: 4.7,
            count: 234,
          },
          createdBy: adminUser._id,
          isActive: true,
          isFeatured: true,
          soldCount: 145,
          viewCount: 2100,
        },
        {
          name: 'Converse Chuck Taylor All Star',
          description:
            'Giày sneaker kinh điển Converse Chuck Taylor với thiết kế đơn giản, phù hợp mọi phong cách.',
          brand: 'Converse',
          category: 'Casual',
          basePrice: 1200000,
          variants: [
            {
              variantName: 'Size 40 - Black',
              sku: 'CONVERSE-CTAS-BLK-40',
              price: 1200000,
              stock: 20,
              specifications: {
                size: '40',
                color: 'Black',
                material: 'Canvas',
                shoeType: 'Casual',
                gender: 'Unisex',
              },
              isAvailable: true,
            },
            {
              variantName: 'Size 38 - White',
              sku: 'CONVERSE-CTAS-WHT-38',
              price: 1200000,
              stock: 15,
              specifications: {
                size: '38',
                color: 'White',
                material: 'Canvas',
                shoeType: 'Casual',
                gender: 'Unisex',
              },
              isAvailable: true,
            },
          ],
          images: [
            'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw0d2e3e3e/images/a_107/M9160_A_107X1.jpg',
          ],
          features: ['Classic design', 'Canvas upper', 'Rubber sole', 'OrthoLite insole'],
          warranty: {
            duration: '3 tháng',
            details: 'Bảo hành lỗi sản xuất',
          },
          rating: {
            average: 4.5,
            count: 789,
          },
          createdBy: adminUser._id,
          isActive: true,
          isFeatured: false,
          soldCount: 456,
          viewCount: 3500,
        },
        {
          name: 'Puma RS-X Reinvention',
          description:
            'Giày sneaker Puma RS-X với thiết kế chunky đầy cá tính, phù hợp với xu hướng thời trang hiện đại.',
          brand: 'Puma',
          category: 'Lifestyle',
          basePrice: 2500000,
          variants: [
            {
              variantName: 'Size 42 - Multi',
              sku: 'PUMA-RSX-MULTI-42',
              price: 2500000,
              originalPrice: 3000000,
              stock: 8,
              specifications: {
                size: '42',
                color: 'Multicolor',
                material: 'Mesh/Leather',
                shoeType: 'Lifestyle',
                gender: 'Unisex',
              },
              isAvailable: true,
            },
          ],
          images: [
            'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/371008/01/sv01/fnd/PNA/fmt/png/RS-X-Reinvention-Sneakers',
          ],
          features: ['Chunky silhouette', 'RS cushioning', 'Mixed materials'],
          warranty: {
            duration: '6 tháng',
            details: 'Bảo hành lỗi nhà sản xuất',
          },
          rating: {
            average: 4.3,
            count: 67,
          },
          createdBy: adminUser._id,
          isActive: true,
          isFeatured: false,
          soldCount: 34,
          viewCount: 890,
        },
        {
          name: 'Vans Old Skool',
          description: 'Giày sneaker Vans Old Skool với sọc Jazz iconic và thiết kế skate classic.',
          brand: 'Vans',
          category: 'Skate',
          basePrice: 1800000,
          variants: [
            {
              variantName: 'Size 41 - Black/White',
              sku: 'VANS-OS-BKWH-41',
              price: 1800000,
              stock: 15,
              specifications: {
                size: '41',
                color: 'Black/White',
                material: 'Canvas/Suede',
                shoeType: 'Skate',
                gender: 'Unisex',
              },
              isAvailable: true,
            },
          ],
          images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800'],
          features: ['Jazz Stripe', 'Waffle outsole', 'Padded collar', 'Classic skate shoe'],
          warranty: {
            duration: '3 tháng',
            details: 'Bảo hành lỗi sản xuất',
          },
          rating: {
            average: 4.6,
            count: 543,
          },
          createdBy: adminUser._id,
          isActive: true,
          isFeatured: true,
          soldCount: 289,
          viewCount: 4200,
        },
        {
          name: 'New Balance 574 Core',
          description: 'Giày sneaker New Balance 574 với thiết kế retro và độ êm ái vượt trội.',
          brand: 'New Balance',
          category: 'Lifestyle',
          basePrice: 2200000,
          variants: [
            {
              variantName: 'Size 40 - Grey',
              sku: 'NB-574-GRY-40',
              price: 2200000,
              stock: 12,
              specifications: {
                size: '40',
                color: 'Grey',
                material: 'Suede/Mesh',
                shoeType: 'Lifestyle',
                gender: 'Unisex',
              },
              isAvailable: true,
            },
            {
              variantName: 'Size 39 - Navy',
              sku: 'NB-574-NVY-39',
              price: 2200000,
              stock: 10,
              specifications: {
                size: '39',
                color: 'Navy',
                material: 'Suede/Mesh',
                shoeType: 'Lifestyle',
                gender: 'Nữ',
              },
              isAvailable: true,
            },
          ],
          images: ['https://nb.scene7.com/is/image/NB/ml574evg_nb_02_i?$dw_detail_main_lg$'],
          features: ['ENCAP midsole', 'Suede/mesh upper', 'EVA foam cushioning'],
          warranty: {
            duration: '6 tháng',
            details: 'Bảo hành lỗi nhà sản xuất',
          },
          rating: {
            average: 4.4,
            count: 321,
          },
          createdBy: adminUser._id,
          isActive: true,
          isFeatured: false,
          soldCount: 156,
          viewCount: 1800,
        },
      ]

      // Insert products
      const insertedProducts = await Product.insertMany(shoeProducts)
      this.logger.success(`✓ Seeded ${insertedProducts.length} products successfully`)

      // Display summary
      this.logger.info('📊 Summary:')
      for (const product of insertedProducts) {
        this.logger.info(
          `  • ${product.name} (${product.brand}) - ${product.variants.length} variants`
        )
      }

      await mongoose.disconnect()
      this.logger.success('✨ Seeding completed!')
    } catch (error) {
      this.logger.error('❌ Seeding failed:', error)
      await mongoose.disconnect()
      throw error
    }
  }
}
