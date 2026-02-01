import { Head } from '@inertiajs/react'

interface DashboardProps {
  stats: {
    totalUsers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
  }
  recentOrders: Array<{
    id: string
    customerName: string
    total: number
    status: string
  }>
}

export default function Dashboard({ stats, recentOrders }: DashboardProps) {
  return (
    <>
      <Head title="Admin Dashboard" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin Dashboard
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalUsers}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalProducts}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalOrders}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
