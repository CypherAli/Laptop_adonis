/**
 * Seed Products for Partners
 * Usage: node ace seed:partner-products
 */

import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Product } from '#models/product'
import { User } from '#models/user'
import mongoose from 'mongoose'
import env from '#start/env'

export default class SeedPartnerProducts extends BaseCommand {
  static commandName = 'seed:partner-products'
  static description = 'Seed shoe products for partner accounts'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      this.logger.info('🌱 Starting partner product seeding...')

      // Connect to MongoDB
      await mongoose.connect(env.get('MONGODB_URI'))
      this.logger.info('✓ MongoDB connected')

      // Find all partner accounts
      const partners = await User.find({ role: 'partner', isApproved: true })

      if (partners.length === 0) {
        this.logger.warning('⚠ No approved partner accounts found')
        await mongoose.disconnect()
        return
      }

      this.logger.info(`Found ${partners.length} partners`)

      // Product templates for each brand
      const productTemplates = {
        'Nike': [
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
            images: [
              'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes-Pz6fZ9.png',
            ],
            features: ['Thiết kế iconic', 'Đệm Air cushion', 'Da cao cấp', 'Grip tuyệt vời'],
            warranty: {
              duration: '6 tháng',
              details: 'Bảo hành lỗi nhà sản xuất',
            },
          },
          {
            name: 'Nike Air Max 270',
            description: 'Giày Nike Air Max 270 với đệm khí lớn nhất từ trước đến nay',
            brand: 'Nike',
            category: 'Running',
            basePrice: 3500000,
            variants: [
              {
                variantName: 'Size 41 - Black',
                sku: 'NIKE-AM270-BLK-41',
                price: 3500000,
                originalPrice: 4000000,
                stock: 10,
                specifications: {
                  size: '41',
                  color: 'Black',
                  material: 'Mesh',
                  shoeType: 'Running',
                  gender: 'Unisex',
                },
                isAvailable: true,
              },
            ],
            images: [
              'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/awjogtdnqxniqqk0wpgf/air-max-270-shoes-2V5C4p.png',
            ],
            features: ['Air Max cushioning', 'Breathable mesh', 'Lightweight'],
            warranty: {
              duration: '6 tháng',
              details: 'Bảo hành lỗi nhà sản xuất',
            },
          },
        ],
        'Adidas': [
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
            images: [
              'https://assets.adidas.com/images/w_600,f_auto,q_auto/e44cd5c8e6c8423990afaec0010e3f68_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg',
            ],
            features: ['Boost cushioning', 'Primeknit upper', 'Continental rubber outsole'],
            warranty: {
              duration: '6 tháng',
              details: 'Bảo hành lỗi sản xuất',
            },
          },
        ],
        'Vans': [
          {
            name: 'Vans Old Skool',
            description:
              'Giày sneaker Vans Old Skool với sọc Jazz iconic và thiết kế skate classic.',
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
            images: ['https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$'],
            features: ['Jazz Stripe', 'Waffle outsole', 'Padded collar', 'Classic skate shoe'],
            warranty: {
              duration: '3 tháng',
              details: 'Bảo hành lỗi sản xuất',
            },
          },
        ],
        'Converse': [
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
          },
        ],
        'Puma': [
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
          },
        ],
        'New Balance': [
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
          },
        ],
      }

      let totalProductsCreated = 0

      // Create products for each partner based on their shop name
      for (const partner of partners) {
        const shopName = partner.shopName || ''
        let brandKey = ''

        // Match partner to brand
        if (shopName.includes('Nike')) brandKey = 'Nike'
        else if (shopName.includes('Adidas')) brandKey = 'Adidas'
        else if (shopName.includes('Vans')) brandKey = 'Vans'
        else if (shopName.includes('Converse')) brandKey = 'Converse'
        else if (shopName.includes('Puma')) brandKey = 'Puma'
        else if (shopName.includes('New Balance')) brandKey = 'New Balance'

        if (!brandKey || !productTemplates[brandKey]) {
          this.logger.warning(`  No templates for ${shopName}`)
          continue
        }

        const templates = productTemplates[brandKey]

        for (const template of templates) {
          // Check if product already exists for this partner
          const existing = await Product.findOne({
            name: template.name,
            createdBy: partner._id,
          })

          if (existing) {
            this.logger.warning(
              `  Product ${template.name} already exists for ${shopName}, skipping...`
            )
            continue
          }

          // Create product with random rating
          const product = await Product.create({
            ...template,
            createdBy: partner._id,
            isActive: true,
            isFeatured: Math.random() > 0.5,
            soldCount: Math.floor(Math.random() * 100),
            viewCount: Math.floor(Math.random() * 1000) + 100,
            rating: {
              average: 4 + Math.random(),
              count: Math.floor(Math.random() * 50) + 10,
            },
          })

          totalProductsCreated++
          this.logger.success(`  ✓ Created ${product.name} for ${shopName}`)
        }
      }

      this.logger.info(`\n=== PRODUCT SEEDING SUMMARY ===`)
      this.logger.info(` Total partners: ${partners.length}`)
      this.logger.info(` Total products created: ${totalProductsCreated}`)
      this.logger.success('\n Product seeding completed!')

      await mongoose.disconnect()
    } catch (error) {
      this.logger.error(' Seeding failed:', error)
      await mongoose.disconnect()
      throw error
    }
  }
}
