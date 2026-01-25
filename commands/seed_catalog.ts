import { BaseCommand } from '@adonisjs/core/ace'
import mongoose from 'mongoose'

export default class SeedCatalog extends BaseCommand {
  static commandName = 'seed:catalog'
  static description = 'Seed categories, brands, and attributes'

  async run() {
    this.logger.info('Starting catalog seed...')

    try {
      // Connect to MongoDB if not connected
      if (mongoose.connection.readyState !== 1) {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/laptop_shop'
        await mongoose.connect(mongoUri)
        this.logger.info('MongoDB connected')
      }

      // Get collections directly
      const Category = mongoose.connection.collection('categories')
      const Brand = mongoose.connection.collection('brands')
      const Attribute = mongoose.connection.collection('attributes')

      // Clear existing data
      await Category.deleteMany({})
      await Brand.deleteMany({})
      await Attribute.deleteMany({})
      this.logger.success('Cleared existing catalog data')

      // Seed Categories
      const categories = await this.seedCategories(Category)
      this.logger.success(`Created ${categories.length} categories`)

      // Seed Brands
      const brands = await this.seedBrands(Brand)
      this.logger.success(`Created ${brands.length} brands`)

      // Seed Attributes
      const attributes = await this.seedAttributes(Attribute)
      this.logger.success(`Created ${attributes.length} attributes`)

      this.logger.success('Catalog seeding completed!')
      await mongoose.disconnect()
    } catch (error) {
      this.logger.error('Seeding failed:')
      this.logger.error(error.message)
    }
  }

  async seedCategories(Category: any) {
    const categoryData = [
      // Root categories
      { name: 'Giày Thể Thao', description: 'Giày thể thao cho mọi hoạt động', isActive: true, order: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giày Cao Gót', description: 'Giày cao gót thời trang', isActive: true, order: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giày Sandal', description: 'Giày sandal thoáng mát', isActive: true, order: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giày Boot', description: 'Giày boot phong cách', isActive: true, order: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giày Lười', description: 'Giày lười tiện dụng', isActive: true, order: 5, createdAt: new Date(), updatedAt: new Date() },
    ]

    // Auto-generate slugs
    categoryData.forEach(cat => {
      cat['slug'] = cat.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      cat['level'] = 0
    })

    const rootResult = await Category.insertMany(categoryData)
    const rootCategories = rootResult.insertedIds

    // Create subcategories for Giày Thể Thao
    const sportsId = rootCategories[0]
    const subCats1 = [
      { name: 'Giày Chạy Bộ', description: 'Chuyên dụng cho chạy bộ', parentId: sportsId, level: 1, isActive: true, order: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giày Bóng Đá', description: 'Giày bóng đá chuyên nghiệp', parentId: sportsId, level: 1, isActive: true, order: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giày Bóng Rổ', description: 'Giày bóng rổ cao cấp', parentId: sportsId, level: 1, isActive: true, order: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giày Tennis', description: 'Giày tennis chuyên dụng', parentId: sportsId, level: 1, isActive: true, order: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giày Gym', description: 'Giày tập gym đa năng', parentId: sportsId, level: 1, isActive: true, order: 5, createdAt: new Date(), updatedAt: new Date() },
    ]
    subCats1.forEach(cat => {
      cat['slug'] = cat.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    })
    await Category.insertMany(subCats1)

    // Create subcategories for Giày Cao Gót
    const heelsId = rootCategories[1]
    const subCats2 = [
      { name: 'Cao Gót 5cm', description: 'Cao gót 5cm thanh lịch', parentId: heelsId, level: 1, isActive: true, order: 1, slug: 'cao-got-5cm', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cao Gót 7cm', description: 'Cao gót 7cm quyến rũ', parentId: heelsId, level: 1, isActive: true, order: 2, slug: 'cao-got-7cm', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cao Gót 10cm', description: 'Cao gót 10cm sexy', parentId: heelsId, level: 1, isActive: true, order: 3, slug: 'cao-got-10cm', createdAt: new Date(), updatedAt: new Date() },
    ]
    await Category.insertMany(subCats2)

    const allCategories = await Category.find({}).toArray()
    return allCategories
  }

  async seedBrands(Brand: any) {
    const brandData = [
      {
        name: 'Nike',
        slug: 'nike',
        description: 'Thương hiệu thể thao hàng đầu thế giới',
        logo: 'https://logo.clearbit.com/nike.com',
        website: 'https://www.nike.com',
        country: 'USA',
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Thương hiệu thể thao Đức nổi tiếng',
        logo: 'https://logo.clearbit.com/adidas.com',
        website: 'https://www.adidas.com',
        country: 'Germany',
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Puma',
        slug: 'puma',
        description: 'Thương hiệu thể thao và thời trang',
        logo: 'https://logo.clearbit.com/puma.com',
        website: 'https://www.puma.com',
        country: 'Germany',
        isActive: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'New Balance',
        slug: 'new-balance',
        description: 'Giày thể thao chất lượng cao',
        logo: 'https://logo.clearbit.com/newbalance.com',
        website: 'https://www.newbalance.com',
        country: 'USA',
        isActive: true,
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Converse',
        slug: 'converse',
        description: 'Giày sneaker classic',
        logo: 'https://logo.clearbit.com/converse.com',
        website: 'https://www.converse.com',
        country: 'USA',
        isActive: true,
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Vans',
        slug: 'vans',
        description: 'Giày skateboard và street style',
        logo: 'https://logo.clearbit.com/vans.com',
        website: 'https://www.vans.com',
        country: 'USA',
        isActive: true,
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Reebok',
        slug: 'reebok',
        description: 'Thương hiệu thể thao và fitness',
        logo: 'https://logo.clearbit.com/reebok.com',
        website: 'https://www.reebok.com',
        country: 'UK',
        isActive: true,
        order: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bitis',
        slug: 'bitis',
        description: 'Thương hiệu giày Việt Nam',
        logo: 'https://via.placeholder.com/100/FF6B35/FFFFFF?text=BITIS',
        website: 'https://www.bitis.com.vn',
        country: 'Vietnam',
        isActive: true,
        order: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await Brand.insertMany(brandData)
    return await Brand.find({}).toArray()
  }

  async seedAttributes(Attribute: any) {
    const attributeData = [
      {
        name: 'Kích thước',
        slug: 'kich-thuoc',
        type: 'select',
        values: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
        isVariant: true,
        isFilterable: true,
        isRequired: true,
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Màu sắc',
        slug: 'mau-sac',
        type: 'color',
        values: ['Đen', 'Trắng', 'Xám', 'Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Cam', 'Hồng', 'Nâu'],
        isVariant: true,
        isFilterable: true,
        isRequired: true,
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Chất liệu',
        slug: 'chat-lieu',
        type: 'select',
        values: ['Da thật', 'Da tổng hợp', 'Vải canvas', 'Vải mesh', 'Vải dệt kim', 'Nhựa EVA'],
        isVariant: false,
        isFilterable: true,
        isRequired: false,
        isActive: true,
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Chiều cao cổ giày',
        slug: 'chieu-cao-co-giay',
        type: 'select',
        values: ['Thấp cổ', 'Cổ vừa', 'Cao cổ'],
        isVariant: false,
        isFilterable: true,
        isRequired: false,
        isActive: true,
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Giới tính',
        slug: 'gioi-tinh',
        type: 'select',
        values: ['Nam', 'Nữ', 'Unisex'],
        isVariant: false,
        isFilterable: true,
        isRequired: false,
        isActive: true,
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Kiểu dáng',
        slug: 'kieu-dang',
        type: 'multiselect',
        values: ['Thể thao', 'Thời trang', 'Chạy bộ', 'Bóng đá', 'Bóng rổ', 'Tennis', 'Casual', 'Formal'],
        isVariant: false,
        isFilterable: true,
        isRequired: false,
        isActive: true,
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Đế giày',
        slug: 'de-giay',
        type: 'select',
        values: ['Cao su', 'EVA', 'PU', 'Boost', 'Air', 'Gel'],
        isVariant: false,
        isFilterable: false,
        isRequired: false,
        isActive: true,
        order: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Trọng lượng',
        slug: 'trong-luong',
        type: 'number',
        values: [],
        isVariant: false,
        isFilterable: false,
        isRequired: false,
        unit: 'gram',
        isActive: true,
        order: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await Attribute.insertMany(attributeData)
    return await Attribute.find({}).toArray()
  }
}
