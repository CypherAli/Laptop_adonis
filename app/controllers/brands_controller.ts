import type { HttpContext } from '@adonisjs/core/http'
import { Brand } from '#models/brand'
import { Product } from '#models/product'
import mongoose from 'mongoose'

export default class BrandsController {
  /**
   * Get all brands (Inertia for Admin or API)
   */
  async index({ request, response, inertia }: HttpContext) {
    // Check if this is an Inertia request
    if (request.header('X-Inertia')) {
      const brands = await Brand.find().sort({ name: 1 }).lean()

      const brandsWithCount = await Promise.all(
        brands.map(async (brand: any) => {
          const productCount = await Product.countDocuments({ brand: brand.name })
          return {
            id: brand._id.toString(),
            name: brand.name,
            slug: brand.slug,
            description: brand.description,
            logo: brand.logo,
            website: brand.website,
            isActive: brand.isActive,
            productCount,
            createdAt: brand.createdAt,
          }
        })
      )

      return inertia.render('admin/brands', {
        brands: brandsWithCount,
        currentPath: '/admin/brands',
      })
    }

    // API response
    try {
      const { page = 1, limit = 50, isActive, search } = request.qs()

      const filter: any = {}

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true'
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      }

      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      const [brands, total] = await Promise.all([
        Brand.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limitNum).lean(),
        Brand.countDocuments(filter),
      ])

      return response.json({
        brands,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalBrands: total,
      })
    } catch (error) {
      console.error('Get brands error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get all active brands (no pagination, for dropdowns)
   */
  async list({ response }: HttpContext) {
    try {
      const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean()

      return response.json({ brands })
    } catch (error) {
      console.error('Get brands list error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get single brand
   */
  async show({ params, response }: HttpContext) {
    try {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID thương hiệu không hợp lệ',
        })
      }

      const brand = await Brand.findById(params.id).lean()

      if (!brand) {
        return response.status(404).json({
          message: 'Không tìm thấy thương hiệu',
        })
      }

      return response.json({ brand })
    } catch (error) {
      console.error('Get brand error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Create new brand (Admin only)
   */
  async store({ request, response, session }: HttpContext) {
    try {
      const isInertia = request.header('X-Inertia')

      const data = request.only([
        'name',
        'description',
        'logo',
        'website',
        'country',
        'isActive',
        'order',
        'metaTitle',
        'metaDescription',
      ]) as any

      // Generate slug
      if (!data.slug && data.name) {
        data.slug = data.name.toLowerCase().replace(/\s+/g, '-')
      }

      const brand = await Brand.create(data)

      if (isInertia) {
        session.flash('success', 'Brand created successfully')
        return response.redirect().back()
      }

      return response.status(201).json({
        message: 'Tạo thương hiệu thành công',
        brand,
      })
    } catch (error) {
      console.error('Create brand error:', error)

      const isInertia = request.header('X-Inertia')
      if (isInertia) {
        session.flash('error', 'Failed to create brand')
        return response.redirect().back()
      }

      if (error.code === 11000) {
        return response.status(400).json({
          message: 'Tên thương hiệu đã tồn tại',
        })
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Update brand (Admin only)
   */
  async update({ params, request, response, session }: HttpContext) {
    try {
      const isInertia = request.header('X-Inertia')

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        if (isInertia) {
          session.flash('error', 'ID thương hiệu không hợp lệ')
          return response.redirect().back()
        }
        return response.status(400).json({
          message: 'ID thương hiệu không hợp lệ',
        })
      }

      const brand = await Brand.findById(params.id)

      if (!brand) {
        if (isInertia) {
          session.flash('error', 'Không tìm thấy thương hiệu')
          return response.redirect().back()
        }
        return response.status(404).json({
          message: 'Không tìm thấy thương hiệu',
        })
      }

      const data = request.only([
        'name',
        'description',
        'logo',
        'website',
        'country',
        'isActive',
        'order',
        'metaTitle',
        'metaDescription',
      ]) as any

      // Update slug if name changed
      if (data.name && data.name !== brand.name) {
        data.slug = data.name.toLowerCase().replace(/\s+/g, '-')
      }

      Object.assign(brand, data)
      await brand.save()

      if (isInertia) {
        session.flash('success', 'Brand updated successfully')
        return response.redirect().back()
      }

      return response.json({
        message: 'Cập nhật thương hiệu thành công',
        brand,
      })
    } catch (error) {
      console.error('Update brand error:', error)

      const isInertia = request.header('X-Inertia')
      if (isInertia) {
        session.flash('error', 'Failed to update brand')
        return response.redirect().back()
      }
      console.error('Update brand error:', error)

      if (error.code === 11000) {
        return response.status(400).json({
          message: 'Tên thương hiệu đã tồn tại',
        })
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete brand (Admin only)
   */
  async destroy({ params, request, response, session }: HttpContext) {
    try {
      const isInertia = request.header('X-Inertia')

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        if (isInertia) {
          session.flash('error', 'ID thương hiệu không hợp lệ')
          return response.redirect().back()
        }
        return response.status(400).json({
          message: 'ID thương hiệu không hợp lệ',
        })
      }

      const brand = await Brand.findById(params.id)

      if (!brand) {
        if (isInertia) {
          session.flash('error', 'Không tìm thấy thương hiệu')
          return response.redirect().back()
        }
        return response.status(404).json({
          message: 'Không tìm thấy thương hiệu',
        })
      }

      // Check if brand has products
      const productCount = await Product.countDocuments({ brand: brand.name })
      if (productCount > 0) {
        if (isInertia) {
          session.flash('error', `Cannot delete brand with ${productCount} products`)
          return response.redirect().back()
        }
        return response.status(400).json({
          message: `Không thể xóa thương hiệu có ${productCount} sản phẩm`,
        })
      }

      await Brand.findByIdAndDelete(params.id)

      if (isInertia) {
        session.flash('success', 'Brand deleted successfully')
        return response.redirect().back()
      }

      return response.json({
        message: 'Xóa thương hiệu thành công',
      })
    } catch (error) {
      console.error('Delete brand error:', error)

      const isInertia = request.header('X-Inertia')
      if (isInertia) {
        session.flash('error', 'Failed to delete brand')
        return response.redirect().back()
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }
}
