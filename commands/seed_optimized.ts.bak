import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Category } from '#models/category'
import { Brand } from '#models/brand'
import { Attribute } from '#models/attribute'
import { Product } from '#models/product_optimized'
import { ProductVariant } from '#models/product_variant'
import { User } from '#models/user'

export default class SeedOptimizedData extends BaseCommand {
  static commandName = 'seed:optimized'
  static description = 'Seed sample data for optimized product structure'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('🌱 Seeding optimized data...')

    try {
      // Step 1: Clear existing data
      this.logger.info('Clearing existing data...')
      await Promise.all([
        Category.deleteMany({}),
        Brand.deleteMany({}),
        Attribute.deleteMany({}),
        Product.deleteMany({}),
        ProductVariant.deleteMany({}),
      ])

      // Step 2: Create categories
      this.logger.info('Creating categories...')
      const categories = await this.createCategories()

      // Step 3: Create brands
      this.logger.info('Creating brands...')
      const brands = await this.createBrands()

      // Step 4: Create attributes
      this.logger.info('Creating attributes...')
      const attributes = await this.createAttributes()

      // Step 5: Create products and variants
      this.logger.info('Creating products with variants...')
      await this.createProducts(categories, brands, attributes)

      this.logger.success('✅ Seeding completed successfully!')
    } catch (error) {
      this.logger.error('❌ Seeding failed:', error)
      throw error
    }
  }

  private async createCategories() {
    const categoriesData = [
      { name: 'Giày thể thao', description: 'Các loại giày thể thao', order: 1 },
      { name: 'Giày chạy bộ', description: 'Giày chuyên dụng cho chạy bộ', order: 2 },
      { name: 'Giày bóng đá', description: 'Giày chơi bóng đá', order: 3 },
      { name: 'Giày casual', description: 'Giày đi thường ngày', order: 4 },
      { name: 'Giày công sở', description: 'Giày đi làm, sự kiện', order: 5 },
      { name: 'Dép & Sandal', description: 'Dép và sandal các loại', order: 6 },
    ]

    const categories: any = {}
    for (const data of categoriesData) {
      const category = await Category.create(data)
      categories[data.name] = category
    }

    return categories
  }

  private async createBrands() {
    const brandsData = [
      {
        name: 'Nike',
        description: 'Just Do It',
        website: 'https://nike.com',
        country: 'USA',
        order: 1,
      },
      {
        name: 'Adidas',
        description: 'Impossible is Nothing',
        website: 'https://adidas.com',
        country: 'Germany',
        order: 2,
      },
      {
        name: 'Puma',
        description: 'Forever Faster',
        website: 'https://puma.com',
        country: 'Germany',
        order: 3,
      },
      {
        name: 'New Balance',
        description: 'Made in USA',
        website: 'https://newbalance.com',
        country: 'USA',
        order: 4,
      },
      {
        name: 'Vans',
        description: 'Off The Wall',
        website: 'https://vans.com',
        country: 'USA',
        order: 5,
      },
    ]

    const brands: any = {}
    for (const data of brandsData) {
      const brand = await Brand.create(data)
      brands[data.name] = brand
    }

    return brands
  }

  private async createAttributes() {
    const attributesData = [
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
        name: 'Màu sắc',
        slug: 'color',
        type: 'color',
        values: [
          'Đen',
          'Trắng',
          'Đỏ',
          'Xanh dương',
          'Xanh lá',
          'Vàng',
          'Nâu',
          'Xám',
          'Cam',
          'Hồng',
        ],
        isVariant: true,
        isFilterable: true,
        order: 2,
      },
      {
        name: 'Chất liệu',
        slug: 'material',
        type: 'select',
        values: ['Da thật', 'Da PU', 'Vải canvas', 'Vải mesh', 'Cao su', 'Synthetic'],
        isVariant: false,
        isFilterable: true,
        order: 3,
      },
      {
        name: 'Loại giày',
        slug: 'shoe-type',
        type: 'select',
        values: ['Chạy bộ', 'Đi bộ', 'Bóng đá', 'Bóng rổ', 'Tennis', 'Casual', 'Công sở', 'Dép'],
        isVariant: false,
        isFilterable: true,
        order: 4,
      },
      {
        name: 'Giới tính',
        slug: 'gender',
        type: 'select',
        values: ['Nam', 'Nữ', 'Unisex'],
        isVariant: false,
        isFilterable: true,
        order: 5,
      },
    ]

    const attributes: any = {}
    for (const data of attributesData) {
      const attribute = await Attribute.create(data)
      attributes[data.slug] = attribute
    }

    return attributes
  }

  private async createProducts(categories: any, brands: any, attributes: any) {
    // Get admin user
    const admin = await User.findOne({ role: 'admin' })
    if (!admin) {
      throw new Error('Admin user not found. Please create admin user first.')
    }

    const productsData = [
      {
        name: 'Nike Air Max 2024',
        description: 'Giày chạy bộ cao cấp với công nghệ Air Max mới nhất, êm ái và thoải mái',
        brand: 'Nike',
        category: 'Giày chạy bộ',
        basePrice: 2500000,
        images: [
          'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-air-max-90-by-you-shoes.png',
        ],
        features: ['Công nghệ Air Max', 'Đế cao su chống trượt', 'Thoáng khí', 'Trọng lượng nhẹ'],
        specifications: {
          material: 'Vải mesh',
          type: 'Chạy bộ',
          gender: 'Unisex',
        },
        variants: [
          { size: '40', color: 'Đen', price: 2500000, stock: 10 },
          { size: '41', color: 'Đen', price: 2500000, stock: 8 },
          { size: '42', color: 'Đen', price: 2500000, stock: 15 },
          { size: '40', color: 'Trắng', price: 2600000, stock: 5 },
          { size: '41', color: 'Trắng', price: 2600000, stock: 7 },
        ],
      },
      {
        name: 'Adidas Ultra Boost 23',
        description: 'Giày chạy bộ với công nghệ Boost độc quyền từ Adidas',
        brand: 'Adidas',
        category: 'Giày chạy bộ',
        basePrice: 3200000,
        images: [
          'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_Light_Shoes_Black_GY9350_01_standard.jpg',
        ],
        features: ['Boost technology', 'Primeknit upper', 'Continental rubber outsole'],
        specifications: {
          material: 'Primeknit',
          type: 'Chạy bộ',
          gender: 'Unisex',
        },
        variants: [
          { size: '39', color: 'Xanh dương', price: 3200000, stock: 6 },
          { size: '40', color: 'Xanh dương', price: 3200000, stock: 12 },
          { size: '41', color: 'Xanh dương', price: 3200000, stock: 9 },
          { size: '42', color: 'Đen', price: 3300000, stock: 8 },
        ],
      },
      {
        name: 'Vans Old Skool',
        description: 'Giày sneaker cổ điển, phong cách đường phố',
        brand: 'Vans',
        category: 'Giày casual',
        basePrice: 1500000,
        images: ['https://images.vans.com/is/image/Vans/VN000D3HY28-HERO?$583x583$'],
        features: ['Canvas upper', 'Waffle sole', 'Classic design', 'Durable'],
        specifications: {
          material: 'Vải canvas',
          type: 'Casual',
          gender: 'Unisex',
        },
        variants: [
          { size: '38', color: 'Đen', price: 1500000, stock: 20 },
          { size: '39', color: 'Đen', price: 1500000, stock: 18 },
          { size: '40', color: 'Đen', price: 1500000, stock: 25 },
          { size: '41', color: 'Đen', price: 1500000, stock: 15 },
          { size: '39', color: 'Trắng', price: 1500000, stock: 12 },
          { size: '40', color: 'Trắng', price: 1500000, stock: 14 },
        ],
      },
      {
        name: 'Puma Suede Classic',
        description: 'Giày sneaker da lộn cổ điển từ Puma',
        brand: 'Puma',
        category: 'Giày casual',
        basePrice: 1800000,
        images: [
          'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/374915/25/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers',
        ],
        features: ['Suede upper', 'Rubber sole', 'Iconic design', 'Comfortable fit'],
        specifications: {
          material: 'Da lộn',
          type: 'Casual',
          gender: 'Unisex',
        },
        variants: [
          { size: '39', color: 'Đỏ', price: 1800000, stock: 10 },
          { size: '40', color: 'Đỏ', price: 1800000, stock: 8 },
          { size: '41', color: 'Xanh dương', price: 1800000, stock: 7 },
          { size: '42', color: 'Xanh dương', price: 1800000, stock: 9 },
        ],
      },
      {
        name: 'New Balance 574',
        description: 'Giày thể thao retro, thoải mái cho mọi hoạt động',
        brand: 'New Balance',
        category: 'Giày thể thao',
        basePrice: 2200000,
        images: [
          'https://nb.scene7.com/is/image/NB/ml574evg_nb_02_i?$dw_detail_main_lg$&bgc=f0f0f0&layer=1&bgcolor=f0f0f0&blendMode=mult&scale=10&wid=1600&hei=1600',
        ],
        features: ['ENCAP midsole', 'Suede/mesh upper', 'Retro style', 'All-day comfort'],
        specifications: {
          material: 'Da lộn/Mesh',
          type: 'Thể thao',
          gender: 'Unisex',
        },
        variants: [
          { size: '40', color: 'Xám', price: 2200000, stock: 12 },
          { size: '41', color: 'Xám', price: 2200000, stock: 10 },
          { size: '42', color: 'Xám', price: 2200000, stock: 15 },
          { size: '40', color: 'Xanh lá', price: 2300000, stock: 8 },
        ],
      },
    ]

    for (const productData of productsData) {
      const brand = brands[productData.brand]
      const category = categories[productData.category]

      // Create specifications
      const specifications = [
        {
          attributeId: attributes['material']._id,
          attributeName: 'Chất liệu',
          value: productData.specifications.material,
        },
        {
          attributeId: attributes['shoe-type']._id,
          attributeName: 'Loại giày',
          value: productData.specifications.type,
        },
        {
          attributeId: attributes['gender']._id,
          attributeName: 'Giới tính',
          value: productData.specifications.gender,
        },
      ]

      // Create product
      const product = await Product.create({
        name: productData.name,
        description: productData.description,
        brandId: brand._id,
        categoryId: category._id,
        basePrice: productData.basePrice,
        images: productData.images,
        features: productData.features,
        specifications,
        createdBy: admin._id,
        isActive: true,
        isFeatured: Math.random() > 0.5,
        rating: {
          average: 4 + Math.random(),
          count: Math.floor(Math.random() * 50) + 10,
        },
      })

      // Create variants
      for (let i = 0; i < productData.variants.length; i++) {
        const variantData = productData.variants[i]

        await ProductVariant.create({
          productId: product._id,
          sku: `${brand.name.toUpperCase()}-${product._id.toString().slice(-6)}-${variantData.size}-${variantData.color}`,
          name: `${productData.name} - Size ${variantData.size} - ${variantData.color}`,
          price: variantData.price,
          originalPrice: variantData.price + 200000,
          stock: variantData.stock,
          attributes: [
            {
              attributeId: attributes['size']._id,
              attributeName: 'Size',
              value: variantData.size,
            },
            {
              attributeId: attributes['color']._id,
              attributeName: 'Màu sắc',
              value: variantData.color,
            },
          ],
          isAvailable: variantData.stock > 0,
          isDefault: i === 0,
        })
      }
    }

    this.logger.info(`   Created ${productsData.length} products with variants`)
  }
}
