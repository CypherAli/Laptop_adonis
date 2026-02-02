import { Head } from '@inertiajs/react'
import AdminLayout from '../../app/layouts/AdminLayout'
import { formatDate } from '../../app/utils/dateFormat'

interface DashboardProps {
  stats: {
    totalUsers: number
    totalClients: number
    totalPartners: number
    totalAdmins: number
    totalProducts: number
    totalOrders: number
    pendingOrders: number
    deliveredOrders: number
    pendingPartners: number
    totalRevenue: number
    activeProducts: number
    outOfStockProducts: number
    lowStockProducts: number
    totalReviews: number
    pendingReviews: number
  }
  orderStats: Array<{
    _id: string
    count: number
    total: number
  }>
  recentOrders: Array<{
    id: string
    customerName: string
    total: number
    status: string
    createdAt: Date
  }>
}

export default function Dashboard({ stats, orderStats, recentOrders }: DashboardProps) {
  return (
    <AdminLayout>
      <Head title="Admin Dashboard" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Overview of your shoe shop statistics and recent activities
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Clients: {stats.totalClients} | Partners: {stats.totalPartners}
                  </p>
                </div>
                <div className="text-blue-500">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Active: {stats.activeProducts} | Out of stock: {stats.outOfStockProducts}
                  </p>
                </div>
                <div className="text-green-500">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pending: {stats.pendingOrders} | Delivered: {stats.deliveredOrders}
                  </p>
                </div>
                <div className="text-purple-500">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">From paid orders</p>
                </div>
                <div className="text-yellow-500">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-sm font-medium opacity-90">Pending Partners</h3>
              <p className="text-4xl font-bold mt-2">{stats.pendingPartners}</p>
              <p className="text-xs opacity-80 mt-1">Awaiting approval</p>
            </div>

            <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-sm font-medium opacity-90">Low Stock Products</h3>
              <p className="text-4xl font-bold mt-2">{stats.lowStockProducts}</p>
              <p className="text-xs opacity-80 mt-1">≤10 items remaining</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-sm font-medium opacity-90">Pending Reviews</h3>
              <p className="text-4xl font-bold mt-2">{stats.pendingReviews}</p>
              <p className="text-xs opacity-80 mt-1">
                Total: {stats.totalReviews} reviews
              </p>
            </div>
          </div>

          {/* Order Status Breakdown */}
          {orderStats && orderStats.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-8 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Orders by Status
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {orderStats.map((stat) => (
                  <div key={stat._id} className="border rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase">{stat._id}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      ${stat.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <a
                href="/admin/orders"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                View all →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
