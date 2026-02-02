import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '../../app/layouts/AdminLayout'
import { formatDate } from '../../app/utils/dateFormat'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  stock: number
  images: string[]
  status: string
  variantCount: number
  createdBy: {
    id: string
    username: string
    shopName?: string
    role: string
  } | null
  createdAt: Date
}

interface ProductsProps {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats?: {
    total: number
    inStock: number
    lowStock: number
    outOfStock: number
  }
  filters: {
    status?: string
    search?: string
  }
}

export default function Products({ products, pagination, stats, filters }: ProductsProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [statusFilter, setStatusFilter] = useState(filters.status || '')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({ name: '', brand: '', price: 0 })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditForm({
      name: product.name,
      brand: product.brand,
      price: product.price || 0,
    })
  }

  const handleSaveEdit = () => {
    if (!editingProduct) return
    
    router.put(`/admin/products/${editingProduct.id}`, {
      name: editForm.name,
      brand: editForm.brand,
      basePrice: editForm.price,
    }, {
      onSuccess: () => setEditingProduct(null),
    })
  }

  const handleDelete = (product: Product) => {
    if (confirm(`Delete ${product.name}?`)) {
      router.delete(`/admin/products/${product.id}`)
    }
  }

  const applyFilters = () => {
    router.get(`/admin/products?search=${searchInput}&status=${statusFilter}`)
  }

  return (
    <AdminLayout>
      <Head title="Products Management" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage shoes inventory and product listings
              </p>
            </div>
            <Link
              href="/admin/products/create"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Create Product
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Product name, brand..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Products</option>
                  <option value="active">In Stock</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={applyFilters}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Products', value: stats?.total || 0, color: 'text-gray-900' },
              { label: 'In Stock', value: stats?.inStock || 0, color: 'text-green-600' },
              { label: 'Low Stock', value: stats?.lowStock || 0, color: 'text-yellow-600' },
              { label: 'Out of Stock', value: stats?.outOfStock || 0, color: 'text-red-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        ${product.price?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {product.stock || 0} | {product.variantCount || 0} variants
                      </p>
                    </div>
                    {product.createdBy && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {product.createdBy.role === 'admin' ? 'Admin' : 'Partner'}
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          {product.createdBy.shopName || product.createdBy.username}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                    Added: {formatDate(product.createdAt)}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
              <div className="text-sm text-gray-500">
                Showing {products.length} of {pagination.total} products
              </div>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <Link
                    href={`/admin/products?page=${pagination.page - 1}&status=${statusFilter}&search=${searchInput}`}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                {pagination.page < pagination.totalPages && (
                  <Link
                    href={`/admin/products?page=${pagination.page + 1}&status=${statusFilter}&search=${searchInput}`}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>


            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
