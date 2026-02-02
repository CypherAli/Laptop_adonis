import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '../../../app/layouts/AdminLayout'

interface Brand {
  _id: string
  name: string
}

interface Category {
  _id: string
  name: string
}

interface CreateProductProps {
  brands: Brand[]
  categories: Category[]
  currentPath: string
}

interface Variant {
  size: string
  color: string
  material: string
  stock: number
  price: number
}

export default function CreateProduct({ brands, categories }: CreateProductProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    basePrice: 0,
    images: [] as string[],
  })
  
  const [variants, setVariants] = useState<Variant[]>([
    { size: '', color: '', material: '', stock: 0, price: 0 }
  ])

  const [imageInput, setImageInput] = useState('')

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', material: '', stock: 0, price: form.basePrice }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const addImage = () => {
    if (imageInput.trim()) {
      setForm({ ...form, images: [...form.images, imageInput.trim()] })
      setImageInput('')
    }
  }

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!form.name || !form.brand || !form.category || form.basePrice <= 0) {
      alert('Vui lòng điền đầy đủ thông tin sản phẩm')
      return
    }

    // Validate variants
    const hasEmptyVariants = variants.some(v => !v.size || !v.color || v.stock < 0 || v.price <= 0)
    if (hasEmptyVariants) {
      alert('Vui lòng điền đầy đủ thông tin cho tất cả variants')
      return
    }

    const payload = {
      name: form.name,
      description: form.description,
      brand: form.brand,
      category: form.category,
      basePrice: form.basePrice,
      images: form.images,
      variants: variants,
    }

    console.log('📤 Submitting product:', payload)
    
    router.post('/admin/products', payload as any)
  }

  return (
    <AdminLayout>
      <Head title="Create Product" />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
            <button
              onClick={() => router.visit('/admin/products')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Products
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nike Air Max 90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price *
                </label>
                <input
                  type="number"
                  required
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="99.99"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  required
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Product description..."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Image
                </button>
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Product Variants *
                </label>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Add Variant
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((variant, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Variant {idx + 1}</span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <input
                        type="text"
                        required
                        value={variant.size}
                        onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                        placeholder="Size (e.g., 42)"
                        className="px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        required
                        value={variant.color}
                        onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                        placeholder="Color"
                        className="px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={variant.material}
                        onChange={(e) => updateVariant(idx, 'material', e.target.value)}
                        placeholder="Material"
                        className="px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        required
                        value={variant.stock}
                        onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="Stock"
                        className="px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        required
                        value={variant.price}
                        onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="Price"
                        step="0.01"
                        className="px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.visit('/admin/products')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
