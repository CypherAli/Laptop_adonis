import type { HttpContext } from '@adonisjs/core/http'
import mongoose from 'mongoose'
import { Product } from '#models/product'
import { Review } from '#models/review'
import { Cart } from '#models/cart'
import '#models/user' // Import to register User model for populate
import { ValidationHelper } from '#utils/validation'

export default class ProductsController {
  /**
   * Helper: Calculate total stock from product variants
   */
  private calculateTotalStock(product: any): number {
    return product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
  }

  /**
   * Helper: Get product status based on stock
   */
  private getStockStatus(totalStock: number): string {
    if (totalStock === 0) return 'Out of Stock'
    if (totalStock <= 10) return 'Low Stock'
    return 'In Stock'
  }

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
        filter.createdBy = user.id
      }
      // Admin sees all products (no filter)

      const products = await Product.find(filter)
        .populate('createdBy', 'username shopName email role')
        .sort({ createdAt: -1 })
        .lean()

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

      // Search filter - SECURITY: Use escaped regex to prevent ReDoS
      if (search) {
        const safeSearchRegex = ValidationHelper.createSafeSearchRegex(search)
        andConditions.push({
          $or: [
            { name: { $regex: safeSearchRegex } },
            { description: { $regex: safeSearchRegex } },
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

      // Color filter (search in variants) - SECURITY: Use escaped regex
      if (color) {
        const colors = color
          .split(',')
          .map((c: string) => c.trim())
          .filter((c: string) => c)
        if (colors.length > 0) {
          andConditions.push({
            'variants.color': {
              $in: colors.map((c: string) => ValidationHelper.createSafeSearchRegex(c)),
            },
          })
        }
      }

      // Material filter (search in variants) - SECURITY: Use escaped regex
      if (material) {
        const materials = material
          .split(',')
          .map((m: string) => m.trim())
          .filter((m: string) => m)
        if (materials.length > 0) {
          andConditions.push({
            'variants.material': {
              $in: materials.map((m: string) => ValidationHelper.createSafeSearchRegex(m)),
            },
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
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      const product = await Product.findById(params.id)
        .populate('createdBy', 'username shopName email')
        .lean()

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
   * LƯU VÀO MONGODB
   */
  async store({ request, response }: HttpContext) {
    try {
      const user = (request as any).user

      // Check authentication
      if (!user) {
        return response.status(401).json({
          message: 'Vui lòng đăng nhập',
        })
      }

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

      if (!productData.category) {
        return response.status(400).json({
          message: 'Danh mục sản phẩm là bắt buộc',
        })
      }

      if (!productData.brand) {
        return response.status(400).json({
          message: 'Thương hiệu sản phẩm là bắt buộc',
        })
      }

      if (!productData.variants || productData.variants.length === 0) {
        return response.status(400).json({
          message: 'Sản phẩm phải có ít nhất 1 biến thể',
        })
      }

      // Validate variants
      for (const variant of productData.variants) {
        if (!variant.variantName || !variant.sku || variant.price === undefined) {
          return response.status(400).json({
            message: 'Mỗi biến thể phải có tên, SKU và giá',
          })
        }
        if (variant.price < 0) {
          return response.status(400).json({
            message: 'Giá sản phẩm không được âm',
          })
        }
        if (variant.stock !== undefined && variant.stock < 0) {
          return response.status(400).json({
            message: 'Số lượng tồn kho không được âm',
          })
        }
      }

      // LƯU VÀO MONGODB
      const product = new Product({
        ...productData,
        createdBy: user.id,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        isFeatured: productData.isFeatured !== undefined ? productData.isFeatured : false,
        soldCount: 0,
        viewCount: 0,
      })

      // Lưu vào database
      await product.save()

      console.log(`✅ Sản phẩm mới đã lưu vào MongoDB: ${product._id}`)

      return response.status(201).json({
        message: 'Tạo sản phẩm thành công và đã lưu vào database',
        product,
      })
    } catch (error) {
      console.error('❌ Lỗi khi tạo sản phẩm:', error)
      return response.status(500).json({
        message: 'Lỗi server khi tạo sản phẩm',
        error: error.message,
      })
    }
  }

  /**
   * Update product
   * CẬP NHẬT VÀO MONGODB
   */
  async update({ params, request, response }: HttpContext) {
    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      const user = (request as any).user

      // Check authentication
      if (!user) {
        return response.status(401).json({
          message: 'Vui lòng đăng nhập',
        })
      }

      // Check role
      if (!['partner', 'admin'].includes(user.role)) {
        return response.status(403).json({
          message: 'Bạn không có quyền cập nhật sản phẩm',
        })
      }

      const product = await Product.findById(params.id)

      if (!product) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      // Check ownership (partner can only update their own products, admin can update all)
      if (user.role === 'partner' && product.createdBy.toString() !== user.id) {
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
          if (!variant.variantName || !variant.sku || variant.price === undefined) {
            return response.status(400).json({
              message: 'Mỗi biến thể phải có tên, SKU và giá',
            })
          }
          if (variant.price < 0) {
            return response.status(400).json({
              message: 'Giá sản phẩm không được âm',
            })
          }
          if (variant.stock !== undefined && variant.stock < 0) {
            return response.status(400).json({
              message: 'Số lượng tồn kho không được âm',
            })
          }
        }
      }

      // CẬP NHẬT VÀO MONGODB
      Object.assign(product, updateData)
      await product.save()

      console.log(`✅ Sản phẩm đã cập nhật trong MongoDB: ${product._id}`)

      return response.json({
        message: 'Cập nhật sản phẩm thành công trong database',
        product,
      })
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật sản phẩm:', error)
      return response.status(500).json({
        message: 'Lỗi server khi cập nhật sản phẩm',
        error: error.message,
      })
    }
  }

  /**
   * Delete product (HARD DELETE - XÓA CỨNG)
   * Xóa vĩnh viễn sản phẩm và tất cả dữ liệu liên quan
   */
  async destroy({ params, response, request }: HttpContext) {
    try {
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID sản phẩm không hợp lệ',
        })
      }

      const user = (request as any).user

      // Check authentication
      if (!user) {
        return response.status(401).json({
          message: 'Vui lòng đăng nhập',
        })
      }

      // Check role
      if (!['partner', 'admin'].includes(user.role)) {
        return response.status(403).json({
          message: 'Bạn không có quyền xóa sản phẩm',
        })
      }

      const product = await Product.findById(params.id)

      if (!product) {
        return response.status(404).json({
          message: 'Không tìm thấy sản phẩm',
        })
      }

      // Check ownership (partner can only delete their own products, admin can delete all)
      if (user.role === 'partner' && product.createdBy.toString() !== user.id) {
        return response.status(403).json({
          message: 'Bạn không có quyền xóa sản phẩm này',
        })
      }

      // XÓA CỨNG (HARD DELETE) - Xóa vĩnh viễn khỏi database
      // 1. Xóa product từ database
      await Product.findByIdAndDelete(params.id)

      // 2. Xóa tất cả reviews của sản phẩm này (cleanup cascade)
      await Review.deleteMany({ product: params.id })

      // 3. Xóa sản phẩm khỏi tất cả giỏ hàng của users (tránh lỗi khi khách checkout)
      await Cart.updateMany(
        { 'items.product': params.id },
        { $pull: { items: { product: params.id } } }
      )

      // 4. Note: Không xóa orders đã tạo (lịch sử mua hàng giữ lại cho kế toán)
      // Orders có snapshot data (name, price...) nên vẫn xem được dù product bị xóa

      console.log(`✅ Đã xóa sản phẩm và cleanup data liên quan: ${params.id}`)

      return response.json({
        message: 'Xóa sản phẩm thành công (xóa vĩnh viễn)',
        deletedProduct: {
          id: params.id,
          name: product.name,
        },
      })
    } catch (error) {
      console.error('Delete product error:', error)
      return response.status(500).json({
        message: 'Lỗi server khi xóa sản phẩm',
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

  /**
   * Show products page (Inertia - Admin only)
   */
  async showProducts({ inertia, request }: HttpContext) {
    const { page = 1, limit = 20, search, status } = request.qs()

    const filter: any = {}
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      filter.$or = [{ name: searchRegex }, { brand: searchRegex }, { description: searchRegex }]
    }

    // Note: Stock filtering done after fetch due to variant complexity
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    // Fetch all products once for both display and stats
    const allProducts = await Product.find(filter)
      .populate('createdBy', 'username shopName email role')
      .sort({ createdAt: -1 })
      .lean()

    // Apply stock-based filtering
    let filteredProducts = allProducts
    if (status) {
      filteredProducts = allProducts.filter((product: any) => {
        const totalStock = this.calculateTotalStock(product)
        if (status === 'active') return totalStock > 10
        if (status === 'outOfStock') return totalStock === 0
        if (status === 'lowStock') return totalStock > 0 && totalStock <= 10
        return true
      })
    }

    // Pagination
    const total = filteredProducts.length
    const products = filteredProducts.slice(skip, skip + limitNum)

    // Calculate stats from all products
    const statsData = allProducts.reduce(
      (acc, product: any) => {
        const totalStock = this.calculateTotalStock(product)
        acc.total++
        if (totalStock > 10) acc.inStock++
        else if (totalStock > 0) acc.lowStock++
        else acc.outOfStock++
        return acc
      },
      { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 }
    )

    return inertia.render('admin/products', {
      products: products.map((product: any) => {
        const totalStock = this.calculateTotalStock(product)
        return {
          id: product._id.toString(),
          name: product.name,
          brand: product.brand,
          price: product.basePrice,
          stock: totalStock,
          images: product.images,
          variantCount: product.variants?.length || 0,
          status: this.getStockStatus(totalStock),
          createdBy: product.createdBy
            ? {
                id: product.createdBy._id?.toString(),
                username: product.createdBy.username,
                shopName: product.createdBy.shopName,
                role: product.createdBy.role,
              }
            : null,
          createdAt: product.createdAt,
        }
      }),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      stats: {
        total: statsData.total,
        inStock: statsData.inStock,
        lowStock: statsData.lowStock,
        outOfStock: statsData.outOfStock,
      },
      filters: { search, status },
      currentPath: '/admin/products',
    })
  }

  /**
   * Show create product page (Inertia - Admin only)
   */
  async createProduct({ inertia }: HttpContext) {
    // Import Brand and Category models
    const { Brand } = await import('#models/brand')
    const { Category } = await import('#models/category')

    const [brands, categories] = await Promise.all([
      Brand.find({ isActive: true }).sort({ name: 1 }).lean(),
      Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    ])

    return inertia.render('admin/products/create', {
      brands: brands.map((b: any) => ({
        _id: b._id.toString(),
        name: b.name,
      })),
      categories: categories.map((c: any) => ({
        _id: c._id.toString(),
        name: c.name,
      })),
      currentPath: '/admin/products/create',
    })
  }

  /**
   * Store new product (Admin Inertia route)
   */
  async storeProduct({ request, response, session }: HttpContext) {
    try {
      const user = (request as any).user

      if (!user) {
        session.flash('error', 'Unauthorized')
        return response.redirect('/auth/login')
      }

      const data = request.only([
        'name',
        'description',
        'brand',
        'category',
        'basePrice',
        'images',
        'variants',
      ])

      // Validate required fields
      if (!data.name || !data.brand || !data.category || !data.basePrice) {
        session.flash('error', 'Vui lòng điền đầy đủ thông tin bắt buộc')
        return response.redirect().back()
      }

      if (!data.variants || data.variants.length === 0) {
        session.flash('error', 'Sản phẩm phải có ít nhất 1 variant')
        return response.redirect().back()
      }

      // Format variants according to Product schema
      const formattedVariants = data.variants.map((v: any, index: number) => ({
        variantName: `${v.size || ''} - ${v.color || ''}`.trim(),
        sku: `${data.brand}-${Date.now()}-${index}`,
        price: Number(v.price) || Number(data.basePrice),
        originalPrice: Number(v.price) || Number(data.basePrice),
        stock: Number(v.stock) || 0,
        specifications: {
          size: v.size || '',
          color: v.color || '',
          material: v.material || '',
        },
        isAvailable: true,
      }))

      // Generate slug manually
      const slug =
        data.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now().toString().slice(-6)

      // Create product with proper schema
      const product = await Product.create({
        name: data.name,
        description: data.description || 'No description',
        brand: data.brand,
        category: data.category,
        basePrice: Number(data.basePrice),
        images: data.images || [],
        variants: formattedVariants,
        createdBy: new mongoose.Types.ObjectId(user.id),
        slug: slug,
        isActive: true,
        isFeatured: false,
        soldCount: 0,
        viewCount: 0,
      })

      console.log(' Product created:', {
        id: product._id,
        name: product.name,
        variants: product.variants.length,
        createdBy: product.createdBy,
        userId: user.id,
      })

      // Inertia POST should redirect
      session.flash('success', 'Tạo sản phẩm thành công')
      return response.redirect('/admin/products')
    } catch (error) {
      console.error(' Store product error:', error)
      console.error('Error stack:', error.stack)

      session.flash('error', `Lỗi khi tạo sản phẩm: ${error.message}`)
      return response.redirect().back()
    }
  }

  /**
   * Update product (Admin Inertia route)
   */
  async updateProduct({ request, response, session }: HttpContext) {
    try {
      const productId = request.param('id')
      const { name, brand, basePrice } = request.body()

      const product = await Product.findById(productId)
      if (!product) {
        session.flash('error', 'Product not found')
        return response.redirect().back()
      }

      // Track if basePrice changed
      const basePriceChanged = product.basePrice !== Number(basePrice)

      product.name = name
      product.brand = brand
      product.basePrice = Number(basePrice)

      // IMPORTANT: Sync basePrice to all variant prices
      // This ensures web-shop displays updated prices
      if (basePriceChanged && product.variants && product.variants.length > 0) {
        product.variants = product.variants.map((variant: any) => ({
          ...variant,
          price: Number(basePrice),
          // Keep originalPrice if exists
          originalPrice: variant.originalPrice || variant.price,
        }))
      }

      await product.save()

      session.flash('success', 'Product and all variants updated successfully')
      return response.redirect().back()
    } catch (error) {
      console.error('Update product error:', error)
      session.flash('error', 'Failed to update product')
      return response.redirect().back()
    }
  }

  /**
   * Delete product (Admin Inertia route)
   */
  async deleteProduct({ request, response, session }: HttpContext) {
    try {
      const productId = request.param('id')

      const product = await Product.findById(productId)
      if (!product) {
        session.flash('error', 'Product not found')
        return response.redirect().back()
      }

      await product.deleteOne()

      session.flash('success', 'Product deleted successfully')
      return response.redirect().back()
    } catch (error) {
      console.error('Delete product error:', error)
      session.flash('error', 'Failed to delete product')
      return response.redirect().back()
    }
  }
}
