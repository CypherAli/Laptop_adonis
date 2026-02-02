import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import AdminLayout from '../../app/layouts/AdminLayout'
import { formatDate } from '../../app/utils/dateFormat'

interface Attribute {
  id: string
  name: string
  values: string[]
  isActive: boolean
  createdAt: Date
}

interface AttributesProps {
  attributes: Attribute[]
  currentPath: string
}

export default function Attributes({ attributes }: AttributesProps) {
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    values: [] as string[],
    isActive: true,
  })
  const [valueInput, setValueInput] = useState('')

  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute)
    setFormData({
      name: attribute.name,
      values: [...attribute.values],
      isActive: attribute.isActive,
    })
    setIsCreating(false)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingAttribute(null)
    setFormData({ name: '', values: [], isActive: true })
  }

  const handleAddValue = () => {
    if (valueInput.trim()) {
      setFormData({ ...formData, values: [...formData.values, valueInput.trim()] })
      setValueInput('')
    }
  }

  const handleRemoveValue = (index: number) => {
    setFormData({ ...formData, values: formData.values.filter((_, i) => i !== index) })
  }

  const handleSave = () => {
    // Validate form
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên attribute')
      return
    }

    if (formData.values.length === 0) {
      alert('Vui lòng thêm ít nhất 1 giá trị')
      return
    }

    if (editingAttribute) {
      console.log('📤 Updating attribute:', editingAttribute.id, formData)
      router.put(`/admin/attributes/${editingAttribute.id}`, formData)
    } else if (isCreating) {
      console.log('📤 Creating attribute:', formData)
      router.post('/admin/attributes', formData)
    }
  }

  const handleDelete = (attribute: Attribute) => {
    if (confirm(`Delete attribute "${attribute.name}"? This cannot be undone.`)) {
      router.delete(`/admin/attributes/${attribute.id}`)
    }
  }

  const handleCancel = () => {
    setEditingAttribute(null)
    setIsCreating(false)
    setFormData({ name: '', values: [], isActive: true })
    setValueInput('')
  }

  return (
    <AdminLayout>
      <Head title="Attributes Management" />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attributes</h1>
              <p className="text-gray-600 mt-1">Manage product attributes (Size, Color, etc.)</p>
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
              Add Attribute
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Attributes</p>
              <p className="text-2xl font-bold text-gray-900">{attributes.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {attributes.filter((a) => a.isActive).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Values</p>
              <p className="text-2xl font-bold text-indigo-600">
                {attributes.reduce((sum, a) => sum + a.values.length, 0)}
              </p>
            </div>
          </div>

          {/* Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attributes.map((attribute) => (
              <div
                key={attribute.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{attribute.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      attribute.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {attribute.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Values ({attribute.values.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {attribute.values.slice(0, 8).map((value) => (
                      <span
                        key={value}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {value}
                      </span>
                    ))}
                    {attribute.values.length > 8 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                        +{attribute.values.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-gray-400">
                    Added: {formatDate(attribute.createdAt)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(attribute)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(attribute)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {attributes.length === 0 && (
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attributes yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating a new attribute.</p>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Attribute
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingAttribute) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isCreating ? 'Create Attribute' : 'Edit Attribute'}
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
                  Attribute Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Size, Color, Material"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attribute Values
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddValue()}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Small, Medium, Large"
                  />
                  <button
                    onClick={handleAddValue}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.values.map((value, idx) => (
                    <span
                      key={`${value}-${idx}`}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {value}
                      <button
                        onClick={() => handleRemoveValue(idx)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {formData.values.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No values added yet</p>
                )}
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
                disabled={!formData.name || formData.values.length === 0}
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
