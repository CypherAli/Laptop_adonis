import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Product as OldProduct } from '#models/product'
import { Product as NewProduct } from '#models/product_optimized'
import { ProductVariant } from '#models/product_variant'
import { Category } from '#models/category'
import { Brand } from '#models/brand'
import { Attribute } from '#models/attribute'

export default class MigrateProducts extends BaseCommand {
  static commandName = 'migrate:products'
  static description = 'Migrate products from embedded variants to separate collections'

  static options: CommandOptions = {
    startApp: true,
  }

  /**
   * Execute the migration
   */
  async run() {
    this.logger.info('Starting product migration...')

    try {
      // Step 1: Migrate Categories
      this.logger.info('Step 1: Creating categories from existing products...')
      await this.migrateCategories()

      // Step 2: Migrate Brands
      this.logger.info('Step 2: Creating brands from existing products...')
      await this.migrateBrands()

      // Step 3: Create default attributes
      this.logger.info('Step 3: Creating default attributes...')
      await this.createDefaultAttributes()

      // Step 4: Migrate Products and Variants
      this.logger.info('Step 4: Migrating products and variants...')
      await this.migrateProductsAndVariants()

      this.logger.success('✅ Migration completed successfully!')
    } catch (error) {
      this.logger.error('❌ Migration failed:', error)
      throw error
    }
  }

  /**
   * Migrate categories from string to documents
   */
  private async migrateCategories() {
    const products = await OldProduct.find().distinct('category')
    const categories = [...new Set(products)]

    let created = 0
    for (const categoryName of categories) {
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${categoryName}$`, 'i') },
      })

      if (!existing) {
        await Category.create({
          name: categoryName,
          isActive: true,
          order: created,
        })
        created++
      }
    }

    this.logger.info(`   Created ${created} categories`)
  }

  /**
   * Migrate brands from string to documents
   */
  private async migrateBrands() {
    const products = await OldProduct.find().distinct('brand')
    const brands = [...new Set(products)]

    let created = 0
    for (const brandName of brands) {
      const existing = await Brand.findOne({
        name: { $regex: new RegExp(`^${brandName}$`, 'i') },
      })

      if (!existing) {
        await Brand.create({
          name: brandName,
          isActive: true,
          order: created,
        })
        created++
      }
    }

    this.logger.info(`   Created ${created} brands`)
  }

  /**
   * Create default attributes for shoes
   */
  private async createDefaultAttributes() {
    const defaultAttributes = [
      {
        name: 'Size',
        slug: 'size',
        type: 'select',
        values: [
          '35',
          '36',
          '37',
          '38',
          '39',
          '40',
          '41',
          '42',
          '43',
          '44',
          '45',
          '46',
          '47',
          '48',
        ],
        isVariant: true,
        isFilterable: true,
        order: 1,
      },
      {
        name: 'Color',
        slug: 'color',
        type: 'color',
        values: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Brown', 'Grey', 'Orange'],
        isVariant: true,
        isFilterable: true,
        order: 2,
      },
      {
        name: 'Material',
        slug: 'material',
        type: 'select',
        values: ['Leather', 'Canvas', 'Mesh', 'Synthetic', 'Suede', 'Rubber'],
        isVariant: false,
        isFilterable: true,
        order: 3,
      },
      {
        name: 'Shoe Type',
        slug: 'shoe-type',
        type: 'select',
        values: ['Running', 'Casual', 'Formal', 'Sports', 'Boots', 'Sandals', 'Sneakers'],
        isVariant: false,
        isFilterable: true,
        order: 4,
      },
      {
        name: 'Gender',
        slug: 'gender',
        type: 'select',
        values: ['Nam', 'Nữ', 'Unisex'],
        isVariant: false,
        isFilterable: true,
        order: 5,
      },
    ]

    let created = 0
    for (const attr of defaultAttributes) {
      const existing = await Attribute.findOne({ slug: attr.slug })
      if (!existing) {
        await Attribute.create(attr)
        created++
      }
    }

    this.logger.info(`   Created ${created} attributes`)
  }

  /**
   * Migrate products and their variants
   */
  private async migrateProductsAndVariants() {
    const oldProducts = await OldProduct.find().lean()
    const sizeAttr = await Attribute.findOne({ slug: 'size' })
    const colorAttr = await Attribute.findOne({ slug: 'color' })
    const materialAttr = await Attribute.findOne({ slug: 'material' })
    const typeAttr = await Attribute.findOne({ slug: 'shoe-type' })
    const genderAttr = await Attribute.findOne({ slug: 'gender' })

    let migratedProducts = 0
    let migratedVariants = 0

    for (const oldProduct of oldProducts) {
      try {
        // Find brand and category
        const brand = await Brand.findOne({
          name: { $regex: new RegExp(`^${oldProduct.brand}$`, 'i') },
        })
        const category = await Category.findOne({
          name: { $regex: new RegExp(`^${oldProduct.category}$`, 'i') },
        })

        if (!brand || !category) {
          this.logger.warning(
            `   Skipping product ${oldProduct.name} - brand or category not found`
          )
          continue
        }

        // Create new product
        const specifications: any[] = []

        const newProduct = await NewProduct.create({
          name: oldProduct.name,
          description: oldProduct.description,
          brandId: brand._id,
          categoryId: category._id,
          basePrice: oldProduct.basePrice,
          images: oldProduct.images,
          createdBy: oldProduct.createdBy,
          features: oldProduct.features,
          warranty: oldProduct.warranty,
          rating: oldProduct.rating,
          specifications,
          isActive: oldProduct.isActive,
          isFeatured: oldProduct.isFeatured,
          soldCount: oldProduct.soldCount,
          viewCount: oldProduct.viewCount,
          createdAt: oldProduct.createdAt,
          updatedAt: oldProduct.updatedAt,
        })

        migratedProducts++

        // Migrate variants
        if (oldProduct.variants && oldProduct.variants.length > 0) {
          for (let i = 0; i < oldProduct.variants.length; i++) {
            const oldVariant = oldProduct.variants[i]
            const specs = oldVariant.specifications || {}

            const attributes: any[] = []

            // Map specifications to attributes
            if (specs.size && sizeAttr) {
              attributes.push({
                attributeId: sizeAttr._id,
                attributeName: sizeAttr.name,
                value: specs.size,
              })
            }

            if (specs.color && colorAttr) {
              attributes.push({
                attributeId: colorAttr._id,
                attributeName: colorAttr.name,
                value: specs.color,
              })
            }

            if (specs.material && materialAttr) {
              attributes.push({
                attributeId: materialAttr._id,
                attributeName: materialAttr.name,
                value: specs.material,
              })
            }

            if (specs.shoeType && typeAttr) {
              attributes.push({
                attributeId: typeAttr._id,
                attributeName: typeAttr.name,
                value: specs.shoeType,
              })
            }

            if (specs.gender && genderAttr) {
              attributes.push({
                attributeId: genderAttr._id,
                attributeName: genderAttr.name,
                value: specs.gender,
              })
            }

            await ProductVariant.create({
              productId: newProduct._id,
              sku: oldVariant.sku,
              name: oldVariant.variantName || `${oldProduct.name} - Variant ${i + 1}`,
              price: oldVariant.price,
              originalPrice: oldVariant.originalPrice,
              stock: oldVariant.stock,
              attributes,
              isAvailable: oldVariant.isAvailable,
              isDefault: i === 0,
            })

            migratedVariants++
          }
        }
      } catch (error) {
        this.logger.error(`   Error migrating product ${oldProduct.name}:`, error.message)
      }
    }

    this.logger.info(`   Migrated ${migratedProducts} products and ${migratedVariants} variants`)
  }
}
