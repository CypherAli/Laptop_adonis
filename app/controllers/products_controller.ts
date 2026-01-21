import type { HttpContext } from '@adonisjs/core/http'
import { Product } from '#models/product'

export default class ProductsController {
  /**
   * Get partner's own products
   */
  async myProducts({ request, response }: HttpContext) {
    try {
      const user = (request as any).user

      if (!user) {
        return response.status(401).json({
          message: 'Vui lòng đăng nhập',
        })
      }

      // Build filter based on role
      const filter: any = {}
      
      if (user.role === 'partner') {
        // Partners only see their own products
        filter.partnerId = user.id
      }
      // Admin sees all products (no filter)

      const products = await Product.find(filter).sort({ createdAt: -1 }).lean()

      return response.json({
        products,
        total: products.length,
      })
    } catch (error) {
      console.error('Get my products error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get all products with filters and pagination
   */
  async index({ request, response }: HttpContext) {
    try {
      const {
        page = 1,
        limit = 10,
        minPrice,
        maxPrice,
        brand,
        inStock,
        sortBy,
        search,
        size,
        color,
        material,
      } = request.qs()

      // Build filter object
      const filter: any = {}
      const andConditions: any[] = []

      // Search filter
      if (search) {
        andConditions.push({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        })
      }

      // Price range filter (search across variants)
      if (minPrice || maxPrice) {
        const priceCondition: any = {}
        if (minPrice) priceCondition.$gte = Number(minPrice)
        if (maxPrice) priceCondition.$lte = Number(maxPrice)
        andConditions.push({ 'variants.price': priceCondition })
      }

      // Brand filter
      if (brand) {
        const brands = brand
          .split(',')
          .map((b: string) => b.trim())
          .filter((b: string) => b)
        if (brands.length > 0) {
          filter.brand = { $in: brands }
        }
      }

      // Size filter (search in variants)
      if (size) {
        const sizes = size
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s)
        if (sizes.length > 0) {
          andConditions.push({
            'variants.size': { $in: sizes },
          })
        }
      }

      // Color filter (search in variants)
      if (color) {
        const colors = color
          .split(',')
          .map((c: string) => c.trim())
          .filter((c: string) => c)
        if (colors.length > 0) {
          andConditions.push({
            'variants.color': { $in: colors.map((c: string) => new RegExp(c, 'i')) },
          })
        }
      }

      // Material filter (search in variants)
      if (material) {
        const materials = material
          .split(',')
          .map((m: string) => m.trim())
          .filter((m: string) => m)
        if (materials.length > 0) {
          andConditions.push({
            'variants.material': { $in: materials.map((m: string) => new RegExp(m, 'i')) },
          })
        }
      }

      // Stock filter (check variants stock)
      if (inStock === 'true') {
        andConditions.push({ 'variants.stock': { $gt: 0 }, 'variants.isAvailable': true })
      } else if (inStock === 'false') {
        andConditions.push({ 'variants.stock': 0 })
      }

      // Combine all conditions
      if (andConditions.length > 0) {
        filter.$and = andConditions
      }

      // Build sort object
      const sort: any = {}
      if (sortBy === 'price_asc') {
        sort['variants.price'] = 1
      } else if (sortBy === 'price_desc') {
        sort['variants.price'] = -1
      } else if (sortBy === 'popular') {
        sort.soldCount = -1
      } else {
        sort.createdAt = -1
      }

      // Pagination
      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      // Execute query
      const [products, total] = await Promise.all([
        Product.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
        Product.countDocuments(filter),
      ])

      return response.json({
        products,
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
   * Get single product by ID
   */
  async show({ params, response }: HttpContext) {
    try {
      // Validate ObjectId
      const mongoose = (await import('mongoose')).default
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      const product = await Product.findById(params.id).lean()

      if (!product) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      // Increment view count
      await Product.findByIdAndUpdate(params.id, {
        $inc: { viewCount: 1 },
      })

      return response.json({ product })
    } catch (error) {
      console.error('Product show error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Create new product (Partner/Admin only)
   */
  async store({ request, response }: HttpContext) {
    try {
      const user = (request as any).user

      // Check role: chỉ partner và admin mới tạo được sản phẩm
      if (!['partner', 'admin'].includes(user.role)) {
        return response.status(403).json({
          message: 'Bạn không có quyền tạo sản phẩm. Chỉ Partner và Admin mới được phép.',
        })
      }

      // Check partner approved
      if (user.role === 'partner' && !user.isApproved) {
        return response.status(403).json({
          message: 'Tài khoản Partner của bạn đang chờ phê duyệt.',
        })
      }

      const productData = request.only([
        'name',
        'description',
        'basePrice',
        'variants',
        'category',
        'brand',
        'images',
        'features',
        'warranty',
        'isFeatured',
        'isActive',
      ])

      // Validation
      if (!productData.name || !productData.description || !productData.basePrice) {
        return response.status(400).json({
          message: 'Tên, mô tả và giá cơ bản là bắt buộc',
        })
      }

      if (!productData.variants || productData.variants.length === 0) {
        return response.status(400).json({
          message: 'Sản phẩm phải có ít nhất 1 biến thể',
        })
      }

      // Validate variants
      for (const variant of productData.variants) {
        if (!variant.variantName || !variant.sku || !variant.price) {
          return response.status(400).json({
            message: 'Mỗi biến thể phải có tên, SKU và giá',
          })
        }
      }

      // Create product
      const product = new Product({
        ...productData,
        createdBy: user.id,
      })

      await product.save()

      return response.status(201).json({
        message: 'Tạo sản phẩm thành công',
        product,
      })
    } catch (error) {
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
      // Validate ObjectId
      const mongoose = (await import('mongoose')).default
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

      // Check ownership (partner can only update their own products)
      const user = (request as any).user
      if (user?.role === 'partner' && product.createdBy.toString() !== user.id) {
        return response.status(403).json({
          message: 'Bạn không có quyền cập nhật sản phẩm này',
        })
      }

      // Update product
      const updateData = request.only([
        'name',
        'description',
        'basePrice',
        'variants',
        'category',
        'brand',
        'images',
        'features',
        'warranty',
        'isFeatured',
        'isActive',
      ])

      // Validate variants if provided
      if (updateData.variants) {
        if (updateData.variants.length === 0) {
          return response.status(400).json({
            message: 'Sản phẩm phải có ít nhất 1 biến thể',
          })
        }
        for (const variant of updateData.variants) {
          if (!variant.variantName || !variant.sku || !variant.price) {
            return response.status(400).json({
              message: 'Mỗi biến thể phải có tên, SKU và giá',
            })
          }
        }
      }

      Object.assign(product, updateData)
      await product.save()

      return response.json({
        message: 'Cập nhật sản phẩm thành công',
        product,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete product
   */
  async destroy({ params, response, request }: HttpContext) {
    try {
      // Validate ObjectId
      const mongoose = (await import('mongoose')).default
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

      // Check ownership
      const user = (request as any).user
      if (user?.role === 'partner' && product.createdBy.toString() !== user.id) {
        return response.status(403).json({
          message: 'Bạn không có quyền xóa sản phẩm này',
        })
      }

      await Product.findByIdAndDelete(params.id)

      return response.json({
        message: 'Xóa sản phẩm thành công',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get featured/deal products
   */
  async featured({ request, response }: HttpContext) {
    try {
      const { type = 'featured', limit = 10 } = request.qs()

      const filter: any = { isActive: true }
      if (type === 'featured') {
        filter.isFeatured = true
      }

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('createdBy', 'username shopName')
        .lean()

      return response.json({ products })
    } catch (error) {
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }
}
