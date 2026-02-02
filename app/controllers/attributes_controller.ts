import type { HttpContext } from '@adonisjs/core/http'
import { Attribute } from '#models/attribute'
import mongoose from 'mongoose'

export default class AttributesController {
  /**
   * Get all attributes with pagination or render Inertia page
   */
  async index({ request, response, inertia }: HttpContext) {
    try {
      // Check if request is from Inertia
      if (request.header('X-Inertia')) {
        const attributes = await Attribute.find({})
          .sort({ order: 1, name: 1 })
          .lean()

        const serializedAttributes = attributes.map((attr) => ({
          ...attr,
          _id: attr._id.toString(),
          categoryIds: attr.categoryIds?.map((id: any) => id.toString()) || [],
          createdAt: attr.createdAt?.toISOString(),
          updatedAt: attr.updatedAt?.toISOString(),
        }))

        return inertia.render('admin/attributes', {
          attributes: serializedAttributes,
          currentPath: '/admin/attributes',
        })
      }

      // API response with pagination
      const {
        page = 1,
        limit = 50,
        isActive,
        isFilterable,
        isVariant,
        categoryId,
        search,
      } = request.qs()

      const filter: any = {}

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true'
      }

      if (isFilterable !== undefined) {
        filter.isFilterable = isFilterable === 'true'
      }

      if (isVariant !== undefined) {
        filter.isVariant = isVariant === 'true'
      }

      if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
        filter.categoryIds = new mongoose.Types.ObjectId(categoryId)
      }

      if (search) {
        filter.$or = [{ name: { $regex: search, $options: 'i' } }]
      }

      const pageNum = Number(page)
      const limitNum = Number(limit)
      const skip = (pageNum - 1) * limitNum

      const [attributes, total] = await Promise.all([
        Attribute.find(filter)
          .populate('categoryIds', 'name')
          .sort({ order: 1, name: 1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Attribute.countDocuments(filter),
      ])

      return response.json({
        attributes,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalAttributes: total,
      })
    } catch (error) {
      console.error('Get attributes error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get filterable attributes for product listing
   */
  async filterable({ response }: HttpContext) {
    try {
      const attributes = await Attribute.find({
        isActive: true,
        isFilterable: true,
      })
        .sort({ order: 1, name: 1 })
        .lean()

      return response.json({ attributes })
    } catch (error) {
      console.error('Get filterable attributes error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get variant attributes for product creation
   */
  async variants({ response }: HttpContext) {
    try {
      const attributes = await Attribute.find({
        isActive: true,
        isVariant: true,
      })
        .sort({ order: 1, name: 1 })
        .lean()

      return response.json({ attributes })
    } catch (error) {
      console.error('Get variant attributes error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Get single attribute
   */
  async show({ params, response }: HttpContext) {
    try {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID thuộc tính không hợp lệ',
        })
      }

      const attribute = await Attribute.findById(params.id).populate('categoryIds', 'name').lean()

      if (!attribute) {
        return response.status(404).json({
          message: 'Không tìm thấy thuộc tính',
        })
      }

      return response.json({ attribute })
    } catch (error) {
      console.error('Get attribute error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Create new attribute (Admin only)
   */
  async store({ request, response, session }: HttpContext) {
    try {
      const isInertia = request.header('X-Inertia')
      
      const data = request.only([
        'name',
        'type',
        'values',
        'categoryIds',
        'isRequired',
        'isFilterable',
        'isVariant',
        'order',
        'unit',
        'isActive',
      ])

      // Validate category IDs if provided
      if (data.categoryIds && data.categoryIds.length > 0) {
        const validIds = data.categoryIds.filter((id: string) =>
          mongoose.Types.ObjectId.isValid(id)
        )
        if (validIds.length !== data.categoryIds.length) {
          if (isInertia) {
            session.flash('error', 'Một hoặc nhiều ID danh mục không hợp lệ')
            return response.redirect('/admin/attributes')
          }
          return response.status(400).json({
            message: 'Một hoặc nhiều ID danh mục không hợp lệ',
          })
        }
        data.categoryIds = validIds.map((id: string) => new mongoose.Types.ObjectId(id))
      }

      const attribute = await Attribute.create(data)

      if (isInertia) {
        session.flash('success', 'Tạo thuộc tính thành công')
        return response.redirect('/admin/attributes')
      }

      return response.status(201).json({
        message: 'Tạo thuộc tính thành công',
        attribute,
      })
    } catch (error) {
      console.error('Create attribute error:', error)
      const isInertia = request.header('X-Inertia')

      if (error.code === 11000) {
        if (isInertia) {
          session.flash('error', 'Tên thuộc tính đã tồn tại')
          return response.redirect('/admin/attributes')
        }
        return response.status(400).json({
          message: 'Tên thuộc tính đã tồn tại',
        })
      }

      if (isInertia) {
        session.flash('error', 'Lỗi server')
        return response.redirect('/admin/attributes')
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Update attribute (Admin only)
   */
  async update({ params, request, response, session }: HttpContext) {
    try {
      const isInertia = request.header('X-Inertia')
      
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        if (isInertia) {
          session.flash('error', 'ID thuộc tính không hợp lệ')
          return response.redirect('/admin/attributes')
        }
        return response.status(400).json({
          message: 'ID thuộc tính không hợp lệ',
        })
      }
      const attribute = await Attribute.findById(params.id)

      if (!attribute) {
        if (isInertia) {
          session.flash('error', 'Không tìm thấy thuộc tính')
          return response.redirect('/admin/attributes')
        }
        return response.status(404).json({
          message: 'Không tìm thấy thuộc tính',
        })
      }

      const data = request.only([
        'name',
        'type',
        'values',
        'categoryIds',
        'isRequired',
        'isFilterable',
        'isVariant',
        'order',
        'unit',
        'isActive',
      ])

      // Validate category IDs if provided
      if (data.categoryIds !== undefined) {
        if (data.categoryIds.length > 0) {
          const validIds = data.categoryIds.filter((id: string) =>
            mongoose.Types.ObjectId.isValid(id)
          )
          if (validIds.length !== data.categoryIds.length) {
            if (isInertia) {
              session.flash('error', 'Một hoặc nhiều ID danh mục không hợp lệ')
              return response.redirect('/admin/attributes')
            }
            return response.status(400).json({
              message: 'Một hoặc nhiều ID danh mục không hợp lệ',
            })
          }
          data.categoryIds = validIds.map((id: string) => new mongoose.Types.ObjectId(id))
        }
      }

      Object.assign(attribute, data)
      await attribute.save()

      if (isInertia) {
        session.flash('success', 'Cập nhật thuộc tính thành công')
        return response.redirect('/admin/attributes')
      }

      return response.json({
        message: 'Cập nhật thuộc tính thành công',
        attribute,
      })
    } catch (error) {
      console.error('Update attribute error:', error)
      const isInertia = request.header('X-Inertia')

      if (error.code === 11000) {
        if (isInertia) {
          session.flash('error', 'Tên thuộc tính đã tồn tại')
          return response.redirect('/admin/attributes')
        }
        return response.status(400).json({
          message: 'Tên thuộc tính đã tồn tại',
        })
      }

      if (isInertia) {
        session.flash('error', 'Lỗi server')
        return response.redirect('/admin/attributes')
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Delete attribute (Admin only)
   */
  async destroy({ params, request, response, session }: HttpContext) {
    try {
      const isInertia = request.header('X-Inertia')
      
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        if (isInertia) {
          session.flash('error', 'ID thuộc tính không hợp lệ')
          return response.redirect('/admin/attributes')
        }
        return response.status(400).json({
          message: 'ID thuộc tính không hợp lệ',
        })
      }

      const attribute = await Attribute.findById(params.id)

      if (!attribute) {
        if (isInertia) {
          session.flash('error', 'Không tìm thấy thuộc tính')
          return response.redirect('/admin/attributes')
        }
        return response.status(404).json({
          message: 'Không tìm thấy thuộc tính',
        })
      }

      // Check if attribute is being used in products
      // const productsCount = await Product.countDocuments({
      //   'specifications.attributeId': params.id
      // })
      // if (productsCount > 0) {
      //   if (isInertia) {
      //     session.flash('error', 'Không thể xóa thuộc tính đang được sử dụng trong sản phẩm')
      //     return response.redirect('/admin/attributes')
      //   }
      //   return response.status(400).json({
      //     message: 'Không thể xóa thuộc tính đang được sử dụng trong sản phẩm',
      //   })
      // }

      await Attribute.findByIdAndDelete(params.id)

      if (isInertia) {
        session.flash('success', 'Xóa thuộc tính thành công')
        return response.redirect('/admin/attributes')
      }

      return response.json({
        message: 'Xóa thuộc tính thành công',
      })
    } catch (error) {
      console.error('Delete attribute error:', error)
      const isInertia = request.header('X-Inertia')
      
      if (isInertia) {
        session.flash('error', 'Lỗi server')
        return response.redirect('/admin/attributes')
      }

      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Toggle attribute active status (Admin only)
   */
  async toggleActive({ params, response }: HttpContext) {
    try {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID thuộc tính không hợp lệ',
        })
      }

      const attribute = await Attribute.findById(params.id)

      if (!attribute) {
        return response.status(404).json({
          message: 'Không tìm thấy thuộc tính',
        })
      }

      attribute.isActive = !attribute.isActive
      await attribute.save()

      return response.json({
        message: attribute.isActive ? 'Đã kích hoạt thuộc tính' : 'Đã vô hiệu hóa thuộc tính',
        attribute,
      })
    } catch (error) {
      console.error('Toggle attribute active error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Add value to attribute (Admin only)
   */
  async addValue({ params, request, response }: HttpContext) {
    try {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID thuộc tính không hợp lệ',
        })
      }

      const { value } = request.only(['value'])

      if (!value) {
        return response.status(400).json({
          message: 'Giá trị không được để trống',
        })
      }

      const attribute = await Attribute.findById(params.id)

      if (!attribute) {
        return response.status(404).json({
          message: 'Không tìm thấy thuộc tính',
        })
      }

      if (attribute.values.includes(value)) {
        return response.status(400).json({
          message: 'Giá trị đã tồn tại',
        })
      }

      attribute.values.push(value)
      await attribute.save()

      return response.json({
        message: 'Thêm giá trị thành công',
        attribute,
      })
    } catch (error) {
      console.error('Add attribute value error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }

  /**
   * Remove value from attribute (Admin only)
   */
  async removeValue({ params, request, response }: HttpContext) {
    try {
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return response.status(400).json({
          message: 'ID thuộc tính không hợp lệ',
        })
      }

      const { value } = request.only(['value'])

      if (!value) {
        return response.status(400).json({
          message: 'Giá trị không được để trống',
        })
      }

      const attribute = await Attribute.findById(params.id)

      if (!attribute) {
        return response.status(404).json({
          message: 'Không tìm thấy thuộc tính',
        })
      }

      attribute.values = attribute.values.filter((v: string) => v !== value)
      await attribute.save()

      return response.json({
        message: 'Xóa giá trị thành công',
        attribute,
      })
    } catch (error) {
      console.error('Remove attribute value error:', error)
      return response.status(500).json({
        message: 'Lỗi server',
        error: error.message,
      })
    }
  }
}
