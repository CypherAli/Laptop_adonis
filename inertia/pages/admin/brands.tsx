import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '../../app/layouts/AdminLayout'
import { formatDate } from '../../app/utils/dateFormat'

interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  isActive: boolean
  productCount: number
  createdAt: Date
}

interface BrandsProps {
  brands: Brand[]
  currentPath: string
}

export default function Brands({ brands }: BrandsProps) {
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    isActive: true,
  })

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      isActive: brand.isActive,
    })
    setIsCreating(false)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingBrand(null)
    setFormData({
      name: '',
      description: '',
      logo: '',
      website: '',
      isActive: true,
    })
  }

  const handleSave = () => {
    if (editingBrand) {
      router.put(`/admin/brands/${editingBrand.id}`, formData, {
        onSuccess: () => {
          setEditingBrand(null)
        },
      })
    } else if (isCreating) {
      router.post('/admin/brands', formData, {
        onSuccess: () => {
          setIsCreating(false)
          setFormData({ name: '', description: '', logo: '', website: '', isActive: true })
        },
      })
    }
  }

  const handleDelete = (brand: Brand) => {
    if (confirm(`Delete brand "${brand.name}"? This cannot be undone.`)) {
      router.delete(`/admin/brands/${brand.id}`)
    }
  }

  const handleCancel = () => {
    setEditingBrand(null)
    setIsCreating(false)
    setFormData({ name: '', description: '', logo: '', website: '', isActive: true })
  }

  return (
    <AdminLayout>
      <Head title="Brands Management" />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
              <p className="text-gray-600 mt-1">Manage product brands</p>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Brand
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Brands</p>
              <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {brands.filter((b) => b.isActive).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-indigo-600">
                {brands.reduce((sum, b) => sum + b.productCount, 0)}
              </p>
            </div>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-16 h-16 object-contain rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                  )}
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      brand.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{brand.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {brand.description || 'No description'}
                </p>

                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline block mb-3"
                  >
                    {brand.website}
                  </a>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{brand.productCount}</span> products
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  Added: {formatDate(brand.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {brands.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brands yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating a new brand.</p>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Brand
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingBrand) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isCreating ? 'Create Brand' : 'Edit Brand'}
              </h2>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Nike"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Brand description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
                {formData.logo && (
                  <img
                    src={formData.logo}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-contain border rounded p-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://brand-website.com"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label className="ml-2 text-sm text-gray-700">Active</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isCreating ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
