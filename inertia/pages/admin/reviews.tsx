import { Head, Link } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '../../app/layouts/AdminLayout'
import { formatDate } from '../../app/utils/dateFormat'

interface Review {
  id: string
  rating: number
  comment: string
  isApproved: boolean
  user: {
    id: string
    username: string
    email: string
  } | null
  product: {
    id: string
    name: string
    brand: string
  } | null
  createdAt: Date
}

interface ReviewsProps {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    isApproved?: string
    search?: string
  }
}

export default function Reviews({ reviews, pagination, filters }: ReviewsProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [approvalFilter, setApprovalFilter] = useState(filters.isApproved || '')

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <AdminLayout>
      <Head title="Reviews Management" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and moderate customer reviews
            </p>
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
                  placeholder="Search in comments..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Status
                </label>
                <select
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Reviews</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>
              </div>

              <div className="flex items-end">
                <Link
                  href={`/admin/reviews?search=${searchInput}&isApproved=${approvalFilter}`}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
                >
                  Apply Filters
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {reviews.filter((r) => r.isApproved).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reviews.filter((r) => !r.isApproved).length}
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium text-gray-900">
                        {review.rating}/5
                      </span>
                      {review.isApproved ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {review.user && (
                        <div>
                          <span className="font-medium text-gray-900">
                            {review.user.username}
                          </span>{' '}
                          ({review.user.email})
                        </div>
                      )}
                      {review.product && (
                        <div>
                          Product:{' '}
                          <span className="font-medium text-gray-900">
                            {review.product.brand} {review.product.name}
                          </span>
                        </div>
                      )}
                      <div>{formatDate(review.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
              <div className="text-sm text-gray-500">
                Showing {reviews.length} of {pagination.total} reviews
              </div>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <Link
                    href={`/admin/reviews?page=${pagination.page - 1}&isApproved=${approvalFilter}&search=${searchInput}`}
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
                    href={`/admin/reviews?page=${pagination.page + 1}&isApproved=${approvalFilter}&search=${searchInput}`}
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
    </AdminLayout>
  )
}
