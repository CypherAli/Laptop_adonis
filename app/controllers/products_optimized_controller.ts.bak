import type { HttpContext } from '@adonisjs/core/http'
import mongoose from 'mongoose'
import { Product } from '#models/product_optimized'
import { ProductVariant } from '#models/product_variant'
import { Category } from '#models/category'
import { Brand } from '#models/brand'

export default class ProductsOptimizedController {
  /**
   * Get all products with OPTIMIZED filters and pagination
   * Variants are in separate collection for fast queries
   */
  async index({ request, response }: HttpContext) {
    try {
      const {
        page = 1,
        limit = 10,
        minPrice,
        maxPrice,
        brandId,
        categoryId,
        inStock,
        sortBy,
        search,
        attributes, // Format: "attributeId1:value1,attributeId2:value2"
      } = request.qs()

      // Build product filter
      const productFilter: any = { isActive: true }

      // Search filter
      if (search) {
        productFilter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      }

      // Brand filter
      if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
        productFilter.brandId = new mongoose.Types.ObjectId(brandId)
      }

      // Category filter
      if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
        productFilter.categoryId = new mongoose.Types.ObjectId(categoryId)
      }

      // Build variant filter for price and stock
      const variantFilter: any = { isAvailable: true }

      // Price range filter (query variants separately)
      if (minPrice || maxPrice) {
        const priceCondition: any = {}
        if (minPrice) priceCondition.$gte = Number(minPrice)
        if (maxPrice) priceCondition.$lte = Number(maxPrice)
        variantFilter.price = priceCondition
      }

      // Stock filter
      if (inStock === 'true') {
        variantFilter.stock = { $gt: 0 }
      } else if (inStock === 'false') {
        variantFilter.stock = 0
      }

      // Attribute filters (e.g., size, color)
      if (attributes) {
        const attrPairs = attributes.split(',').map((pair: string) => {
          const [attrId, value] = pair.split(':')
          return {
            'attributes.attributeId': new mongoose.Types.ObjectId(attrId),
            'attributes.value': value,
          }
        })
        variantFilter.$and = attrPairs
      }

      // Step 1: Find matching variants first (FAST - indexed query)
      const matchingVariants = await ProductVariant.find(variantFilter).select('productId').lean()

      // Get unique product IDs from matching variants
      const productIds = [...new Set(matchingVariants.map((v) => v.productId.toString()))]

      // Step 2: Filter products by IDs
      if (productIds.length > 0) {
        productFilter._id = { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) }
      } else {
        // No matching variants, return empty
        return response.json({
          products: [],
          currentPage: Number(page),
          totalPages: 0,
          totalProducts: 0,
        })
      }

      // Build sort
      const sort: any = {}
      if (sortBy === 'price_asc' || sortBy === 'price_desc') {
        // For price sorting, we'll need to join with variants
        sort.basePrice = sortBy === 'price_asc' ? 1 : -1
      } else if (sortBy === 'popular') {
        sort.soldCount = -1
      } else {
        sort.createdAt = -1
      }

      // Pagination
      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      // Execute query with populate
      const [products, total] = await Promise.all([
        Product.find(productFilter)
          .populate('brandId', 'name slug logo')
          .populate('categoryId', 'name slug')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments(productFilter),
      ])

      // Fetch variants for each product (parallel)
      const productsWithVariants = await Promise.all(
        products.map(async (product) => {
          const variants = await ProductVariant.find({
            productId: product._id,
            ...variantFilter,
          })
            .sort({ isDefault: -1, price: 1 })
            .lean()

          return {
            ...product,
            variants,
            minPrice: variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0,
            maxPrice: variants.length > 0 ? Math.max(...variants.map((v) => v.price)) : 0,
            inStock: variants.some((v) => v.stock > 0),
          }
        })
      )

      return response.json({
        products: productsWithVariants,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
      })
    } catch (error) {
      console.error('Get products error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get featured products
   */
  async featured({ response }: HttpContext) {
    try {
      const products = await Product.find({ isFeatured: true, isActive: true })
        .populate('brandId', 'name slug logo')
        .populate('categoryId', 'name slug')
        .sort({ soldCount: -1 })
        .limit(10)
        .lean()

      // Get variants for each product
      const productsWithVariants = await Promise.all(
        products.map(async (product) => {
          const variants = await ProductVariant.find({
            productId: product._id,
            isAvailable: true,
          })
            .sort({ isDefault: -1, price: 1 })
            .limit(5)
            .lean()

          return {
            ...product,
            variants,
          }
        })
      )

      return response.json({ products: productsWithVariants })
    } catch (error) {
      console.error('Get featured products error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get single product by ID with all variants
   */
  async show({ params, response }: HttpContext) {
    try {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      const product = await Product.findById(params.id)
        .populate('brandId', 'name slug logo website')
        .populate('categoryId', 'name slug')
        .lean()

      if (!product) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      // Get all variants
      const variants = await ProductVariant.find({
        productId: params.id,
      })
        .sort({ isDefault: -1, price: 1 })
        .lean()

      // Increment view count
      await Product.findByIdAndUpdate(params.id, {
        $inc: { viewCount: 1 },
      })

      return response.json({
        product: {
          ...product,
          variants,
        },
      })
    } catch (error) {
      console.error('Product show error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Create new product with variants (Partner/Admin only)
   */
  async store({ request, response }: HttpContext) {
    try {
      const user = (request as any).user

      if (!user || !['partner', 'admin'].includes(user.role)) {
        return response.status(403).json({
          message: 'Không có quyền tạo sản phẩm',
        })
      }

      if (user.role === 'partner' && !user.isApproved) {
        return response.status(403).json({
          message: 'Tài khoản Partner đang chờ phê duyệt',
        })
      }

      const productData: any = request.only([
        'name',
        'description',
        'brandId',
        'categoryId',
        'basePrice',
        'images',
        'features',
        'warranty',
        'specifications',
        'seoTitle',
        'seoDescription',
        'seoKeywords',
      ])

      const variantsData = request.input('variants', [])

      // Validate required fields
      if (!productData.name || !productData.brandId || !productData.categoryId) {
        return response.status(400).json({
          message: 'Thiếu thông tin bắt buộc',
        })
      }

      // Validate brand
      if (!mongoose.Types.ObjectId.isValid(productData.brandId)) {
        return response.status(400).json({
          message: 'ID thương hiệu không hợp lệ',
        })
      }

      const brand = await Brand.findById(productData.brandId)
      if (!brand) {
        return response.status(404).json({
          message: 'Không tìm thấy thương hiệu',
        })
      }

      // Validate category
      if (!mongoose.Types.ObjectId.isValid(productData.categoryId)) {
        return response.status(400).json({
          message: 'ID danh mục không hợp lệ',
        })
      }

      const category = await Category.findById(productData.categoryId)
      if (!category) {
        return response.status(404).json({
          message: 'Không tìm thấy danh mục',
        })
      }

      // Create product
      productData.createdBy = user.id
      const product = await Product.create(productData)

      // Create variants
      if (variantsData && variantsData.length > 0) {
        const variantsToCreate = variantsData.map((v: any, index: number) => ({
          productId: product._id,
          sku: v.sku || `${product._id}-${index + 1}`,
          name: v.name,
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock || 0,
          attributes: v.attributes || [],
          images: v.images || [],
          isAvailable: v.isAvailable !== false,
          isDefault: index === 0,
        }))

        await ProductVariant.insertMany(variantsToCreate)
      }

      // Get product with variants
      const createdProduct = await Product.findById(product._id)
        .populate('brandId', 'name slug')
        .populate('categoryId', 'name slug')
        .lean()

      const variants = await ProductVariant.find({ productId: product._id }).lean()

      return response.status(201).json({
        message: 'Tạo sản phẩm thành công',
        product: {
          ...createdProduct,
          variants,
        },
      })
    } catch (error) {
      console.error('Create product error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Update product
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      const product = await Product.findById(params.id)

      if (!product) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      // Check permission
      if (user.role === 'partner' && product.createdBy.toString() !== user.id) {
        return response.status(403).json({
          message: 'Không có quyền sửa sản phẩm này',
        })
      }

      const updateData = request.only([
        'name',
        'description',
        'brandId',
        'categoryId',
        'basePrice',
        'images',
        'features',
        'warranty',
        'specifications',
        'isActive',
        'seoTitle',
        'seoDescription',
        'seoKeywords',
      ])

      Object.assign(product, updateData)
      await product.save()

      const updatedProduct = await Product.findById(params.id)
        .populate('brandId', 'name slug')
        .populate('categoryId', 'name slug')
        .lean()

      return response.json({
        message: 'Cập nhật sản phẩm thành công',
        product: updatedProduct,
      })
    } catch (error) {
      console.error('Update product error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete product
   */
  async destroy({ params, request, response }: HttpContext) {
    try {
      const user = (request as any).user

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      const product = await Product.findById(params.id)

      if (!product) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      // Check permission
      if (user.role === 'partner' && product.createdBy.toString() !== user.id) {
        return response.status(403).json({
          message: 'Không có quyền xóa sản phẩm này',
        })
      }

      // Delete all variants
      await ProductVariant.deleteMany({ productId: params.id })

      // Delete product
      await Product.findByIdAndDelete(params.id)

      return response.json({
        message: 'Xóa sản phẩm thành công',
      })
    } catch (error) {
      console.error('Delete product error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }
}
