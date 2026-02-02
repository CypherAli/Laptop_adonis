import type { HttpContext } from '@adonisjs/core/http'
import { Category } from '#models/category'
import { Product } from '#models/product'
import mongoose from 'mongoose'

export default class CategoriesController {
  /**
   * Get all categories (Inertia for Admin)
   */
  async index({ request, response, inertia }: HttpContext) {
    // Check if this is an Inertia request
    if (request.header('X-Inertia')) {
      const categories = await Category.find().sort({ name: 1 }).lean()

      const categoriesWithCount = await Promise.all(
        categories.map(async (cat: any) => {
          const productCount = await Product.countDocuments({ category: cat.name })
          return {
            id: cat._id.toString(),
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            isActive: cat.isActive,
            productCount,
            createdAt: cat.createdAt,
          }
        })
      )

      return inertia.render('admin/categories', {
        categories: categoriesWithCount,
        currentPath: '/admin/categories',
      })
    }

    // API response for web-shop
    try {
      const { page = 1, limit = 50, isActive, parentId, search } = request.qs()

      const filter: any = {}

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true'
      }

      if (parentId !== undefined) {
        if (parentId === 'null' || parentId === '') {
          filter.parentId = null
        } else if (mongoose.Types.ObjectId.isValid(parentId)) {
          filter.parentId = new mongoose.Types.ObjectId(parentId)
        }
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

      const [categories, total] = await Promise.all([
        Category.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(limitNum).lean(),
        Category.countDocuments(filter),
      ])

      return response.json({
        categories,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCategories: total,
      })
    } catch (error) {
      console.error('Get categories error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get category tree (for UI dropdowns)
   */
  async tree({ response }: HttpContext) {
    try {
      const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean()

      const buildTree = (parentId: any = null, level = 0): any[] => {
        return categories
          .filter((cat) => {
            if (parentId === null) return cat.parentId === null || cat.parentId === undefined
            return cat.parentId?.toString() === parentId.toString()
          })
          .map((cat) => ({
            ...cat,
            level,
            children: buildTree(cat._id, level + 1),
          }))
      }

      const tree = buildTree()

      return response.json({ tree })
    } catch (error) {
      console.error('Get category tree error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get single category
   */
  async show({ params, response }: HttpContext) {
    try {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID danh mục không hợp lệ',
        })
      }

      const category = await Category.findById(params.id).lean()

      if (!category) {
        return response.status(404).json({
          message: 'Không tìm thấy danh mục',
        })
      }

      // Get children if any
      const children = await Category.find({ parentId: params.id }).sort({ order: 1 }).lean()

      return response.json({
        category: {
          ...category,
          children,
        },
      })
    } catch (error) {
      console.error('Get category error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Create new category (Admin only)
   */
  async store({ request, response, session }: HttpContext) {
    try {
      // Check if this is an Inertia request
      const isInertia = request.header('X-Inertia')

      const data: any = request.only([
        'name',
        'description',
        'parentId',
        'image',
        'isActive',
        'order',
        'metaTitle',
        'metaDescription',
      ])

      // Validate parent category if provided
      if (data.parentId) {
        if (!mongoose.Types.ObjectId.isValid(data.parentId)) {
          if (isInertia) {
            session.flash('error', 'ID danh mục cha không hợp lệ')
            return response.redirect().back()
          }
          return response.status(400).json({
            message: 'ID danh mục cha không hợp lệ',
          })
        }

        const parentCategory = await Category.findById(data.parentId)
        if (!parentCategory) {
          if (isInertia) {
            session.flash('error', 'Không tìm thấy danh mục cha')
            return response.redirect().back()
          }
          return response.status(404).json({
            message: 'Không tìm thấy danh mục cha',
          })
        }

        data.level = parentCategory.level + 1
      } else {
        data.level = 0
      }

      // Generate slug if not provided
      if (!data.slug && data.name) {
        data.slug = data.name.toLowerCase().replace(/\s+/g, '-')
      }

      const category = await Category.create(data)

      if (isInertia) {
        session.flash('success', 'Category created successfully')
        return response.redirect().back()
      }

      return response.status(201).json({
        message: 'Tạo danh mục thành công',
        category,
      })
    } catch (error) {
      console.error('Create category error:', error)

      const isInertia = request.header('X-Inertia')
      if (isInertia) {
        session.flash('error', 'Failed to create category')
        return response.redirect().back()
      }

      if (error.code === 11000) {
        return response.status(400).json({
          message: 'Tên danh mục đã tồn tại',
        })
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Update category (Admin only)
   */
  async update({ params, request, response, session }: HttpContext) {
    try {
      const isInertia = request.header('X-Inertia')

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        if (isInertia) {
          session.flash('error', 'ID danh mục không hợp lệ')
          return response.redirect().back()
        }
        return response.status(400).json({
          message: 'ID danh mục không hợp lệ',
        })
      }

      const category = await Category.findById(params.id)

      if (!category) {
        if (isInertia) {
          session.flash('error', 'Không tìm thấy danh mục')
          return response.redirect().back()
        }
        return response.status(404).json({
          message: 'Không tìm thấy danh mục',
        })
      }

      const data: any = request.only([
        'name',
        'description',
        'parentId',
        'image',
        'isActive',
        'order',
        'metaTitle',
        'metaDescription',
      ])

      // Validate parent category change
      if (data.parentId !== undefined) {
        if (data.parentId === null || data.parentId === '') {
          data.parentId = null
          data.level = 0
        } else {
          if (!mongoose.Types.ObjectId.isValid(data.parentId)) {
            return response.status(400).json({
              message: 'ID danh mục cha không hợp lệ',
            })
          }

          // Cannot set itself as parent
          if (data.parentId === params.id) {
            return response.status(400).json({
              message: 'Không thể đặt danh mục làm cha của chính nó',
            })
          }

          const parentCategory = await Category.findById(data.parentId)
          if (!parentCategory) {
            return response.status(404).json({
              message: 'Không tìm thấy danh mục cha',
            })
          }

          data.level = parentCategory.level + 1
        }
      }

      // Update slug if name changed
      if (data.name && data.name !== category.name) {
        data.slug = data.name.toLowerCase().replace(/\s+/g, '-')
      }

      Object.assign(category, data)
      await category.save()

      if (isInertia) {
        session.flash('success', 'Category updated successfully')
        return response.redirect().back()
      }

      return response.json({
        message: 'Cập nhật danh mục thành công',
        category,
      })
    } catch (error) {
      console.error('Update category error:', error)

      const isInertia = request.header('X-Inertia')
      if (isInertia) {
        session.flash('error', 'Failed to update category')
        return response.redirect().back()
      }

      if (error.code === 11000) {
        return response.status(400).json({
          message: 'Tên danh mục đã tồn tại',
        })
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete category (Admin only)
   */
  async destroy({ params, request, response, session }: HttpContext) {
    try {
      const isInertia = request.header('X-Inertia')

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        if (isInertia) {
          session.flash('error', 'ID danh mục không hợp lệ')
          return response.redirect().back()
        }
        return response.status(400).json({
          message: 'ID danh mục không hợp lệ',
        })
      }

      const category = await Category.findById(params.id)

      if (!category) {
        if (isInertia) {
          session.flash('error', 'Không tìm thấy danh mục')
          return response.redirect().back()
        }
        return response.status(404).json({
          message: 'Không tìm thấy danh mục',
        })
      }

      // Check if category has children
      const childrenCount = await Category.countDocuments({ parentId: params.id })

      if (childrenCount > 0) {
        if (isInertia) {
          session.flash('error', `Cannot delete category with ${childrenCount} subcategories`)
          return response.redirect().back()
        }
        return response.status(400).json({
          message: 'Không thể xóa danh mục có danh mục con',
        })
      }

      // Check if category has products
      const productCount = await Product.countDocuments({ category: category.name })
      if (productCount > 0) {
        if (isInertia) {
          session.flash('error', `Cannot delete category with ${productCount} products`)
          return response.redirect().back()
        }
        return response.status(400).json({
          message: 'Không thể xóa danh mục có sản phẩm',
        })
      }

      await Category.findByIdAndDelete(params.id)

      if (isInertia) {
        session.flash('success', 'Category deleted successfully')
        return response.redirect().back()
      }

      return response.json({
        message: 'Xóa danh mục thành công',
      })
    } catch (error) {
      console.error('Delete category error:', error)

      const isInertia = request.header('X-Inertia')
      if (isInertia) {
        session.flash('error', 'Failed to delete category')
        return response.redirect().back()
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Toggle category active status (Admin only)
   */
  async toggleActive({ params, response }: HttpContext) {
    try {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID danh mục không hợp lệ',
        })
      }

      const category = await Category.findById(params.id)

      if (!category) {
        return response.status(404).json({
          message: 'Không tìm thấy danh mục',
        })
      }

      category.isActive = !category.isActive
      await category.save()

      return response.json({
        message: category.isActive ? 'Đã kích hoạt danh mục' : 'Đã vô hiệu hóa danh mục',
        category,
      })
    } catch (error) {
      console.error('Toggle category active error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }
}
