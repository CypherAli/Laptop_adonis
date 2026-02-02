import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '../../app/layouts/AdminLayout'
import { formatDate } from '../../app/utils/dateFormat'

interface User {
  id: string
  username: string
  email: string
  shopName?: string
  role: string
  adminLevel?: string
  isApproved: boolean
  createdAt: Date
}

const adminLevelInfo: Record<string, { label: string; description: string; color: string }> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access, can manage all admins and settings',
    color: 'bg-red-100 text-red-800',
  },
  admin: {
    label: 'Admin',
    description: 'Manage products, orders, users, but cannot manage other admins',
    color: 'bg-purple-100 text-purple-800',
  },
  support_admin: {
    label: 'Support Admin',
    description: 'View and support orders, limited product management',
    color: 'bg-indigo-100 text-indigo-800',
  },
}

interface UsersProps {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    role?: string
    search?: string
    isApproved?: string
  }
  auth?: {
    user: {
      id: string
      role: string
      adminLevel?: string
    }
  }
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  partner: 'bg-blue-100 text-blue-800',
  client: 'bg-green-100 text-green-800',
}

export default function Users({ users, pagination, filters, auth }: UsersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [roleFilter, setRoleFilter] = useState(filters.role || '')
  const [approvalFilter, setApprovalFilter] = useState(filters.isApproved || '')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ role: '', adminLevel: '' })

  const currentUser = auth?.user
  const isSuperAdmin = currentUser?.role === 'admin' && currentUser?.adminLevel === 'super_admin'

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditForm({
      role: user.role,
      adminLevel: user.adminLevel || '',
    })
  }

  const handleSaveEdit = () => {
    if (!editingUser) return

    router.put(
      `/admin/users/${editingUser.id}`,
      {
        role: editForm.role,
        adminLevel: editForm.role === 'admin' ? editForm.adminLevel : undefined,
      },
      {
        onSuccess: () => {
          setEditingUser(null)
        },
      }
    )
  }

  const handleDelete = (user: User) => {
    setDeletingUser(user)
  }

  const confirmDelete = () => {
    if (!deletingUser) return

    router.delete(`/admin/users/${deletingUser.id}`, {
      onSuccess: () => {
        setDeletingUser(null)
      },
    })
  }

  return (
    <AdminLayout>
      <Head title="Users Management" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="mt-2 text-sm text-gray-600">Manage users, partners, and admins</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Username, email, shop..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="partner">Partner</option>
                  <option value="client">Client</option>
                </select>
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
                  <option value="">All</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() =>
                    router.visit(
                      `/admin/users?search=${searchInput}&role=${roleFilter}&isApproved=${approvalFilter}`
                    )
                  }
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Partners</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter((u) => u.role === 'partner').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Clients</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.role === 'client').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600">
                {users.filter((u) => !u.isApproved).length}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Shop Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                    {isSuperAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.shopName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {user.role}
                          </span>
                          {user.role === 'admin' && user.adminLevel && (
                            <div className="mt-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  adminLevelInfo[user.adminLevel]?.color || 'bg-gray-100 text-gray-800'
                                }`}
                                title={adminLevelInfo[user.adminLevel]?.description}
                              >
                                {adminLevelInfo[user.adminLevel]?.label || user.adminLevel}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {adminLevelInfo[user.adminLevel]?.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.isApproved ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                              disabled={user.id === currentUser?.id}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                              disabled={user.id === currentUser?.id}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {users.length} of {pagination.total} users
                </div>
                <div className="flex gap-2">
                  {pagination.page > 1 && (
                    <Link
                      href={`/admin/users?page=${pagination.page - 1}&role=${roleFilter}&search=${searchInput}&isApproved=${approvalFilter}`}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  {pagination.page < pagination.totalPages && (
                    <Link
                      href={`/admin/users?page=${pagination.page + 1}&role=${roleFilter}&search=${searchInput}&isApproved=${approvalFilter}`}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Edit User: {editingUser.username}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="client">Client</option>
                      <option value="partner">Partner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {editForm.role === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Level
                      </label>
                      <select
                        value={editForm.adminLevel}
                        onChange={(e) => setEditForm({ ...editForm, adminLevel: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="support_admin">Support Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {adminLevelInfo[editForm.adminLevel]?.description}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deletingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h3>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete user <strong>{deletingUser.username}</strong> (
                  {deletingUser.email})? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeletingUser(null)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
