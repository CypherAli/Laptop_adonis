import { Head, router } from '@inertiajs/react'
import AdminLayout from '../../app/layouts/AdminLayout'
import { formatDateTime } from '../../app/utils/dateFormat'
import { useState } from 'react'

interface SettingsProps {
  settings: {
    siteName: string
    siteDescription: string
    siteLogo?: string
    contactEmail: string
    contactPhone: string
    address?: string
    maintenanceMode: boolean
    maintenanceMessage?: string
    emailNotifications: boolean
    updatedBy: {
      username: string
      email: string
    } | null
    updatedAt: Date
  }
}

export default function Settings({ settings }: SettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    siteName: settings.siteName || '',
    siteDescription: settings.siteDescription || '',
    siteLogo: settings.siteLogo || '',
    contactEmail: settings.contactEmail || '',
    contactPhone: settings.contactPhone || '',
    address: settings.address || '',
    maintenanceMode: settings.maintenanceMode || false,
    maintenanceMessage: settings.maintenanceMessage || '',
    emailNotifications: settings.emailNotifications || false,
  })

  const handleSave = () => {
    router.put('/admin/settings', formData, {
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }

  const handleCancel = () => {
    setFormData({
      siteName: settings.siteName || '',
      siteDescription: settings.siteDescription || '',
      siteLogo: settings.siteLogo || '',
      contactEmail: settings.contactEmail || '',
      contactPhone: settings.contactPhone || '',
      address: settings.address || '',
      maintenanceMode: settings.maintenanceMode || false,
      maintenanceMessage: settings.maintenanceMessage || '',
      emailNotifications: settings.emailNotifications || false,
    })
    setIsEditing(false)
  }
  return (
    <AdminLayout>
      <Head title="System Settings" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="mt-2 text-sm text-gray-600">
                Configure your shoe shop system settings
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Edit Settings
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Last Updated Info */}
          {settings.updatedBy && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Last updated by{' '}
                <span className="font-medium">{settings.updatedBy.username}</span> (
                {settings.updatedBy.email}) on{' '}
                {formatDateTime(settings.updatedAt)}
              </p>
            </div>
          )}

          {/* Site Information */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Site Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900">{settings.siteName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.siteDescription}
                    onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-900">{settings.siteDescription}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Logo URL
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.siteLogo}
                    onChange={(e) => setFormData({ ...formData, siteLogo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://example.com/logo.png"
                  />
                ) : settings.siteLogo ? (
                  <img
                    src={settings.siteLogo}
                    alt="Site Logo"
                    className="h-20 object-contain"
                  />
                ) : (
                  <p className="text-gray-500 text-sm">No logo set</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900">{settings.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="text-gray-900">{settings.contactPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                ) : settings.address ? (
                  <p className="text-gray-900">{settings.address}</p>
                ) : (
                  <p className="text-gray-500 text-sm">No address set</p>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Mode
                  </label>
                  <p className="text-sm text-gray-500">
                    When enabled, the site will be inaccessible to regular users
                  </p>
                </div>
                <div>
                  {isEditing ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.maintenanceMode}
                        onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  ) : settings.maintenanceMode ? (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Enabled
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Disabled
                    </span>
                  )}
                </div>
              </div>

              {(isEditing ? formData.maintenanceMode : settings.maintenanceMode) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Message
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.maintenanceMessage}
                      onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      placeholder="We're currently performing maintenance..."
                    />
                  ) : (
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded border border-yellow-200">
                      {settings.maintenanceMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Send email notifications for important events
                  </p>
                </div>
                <div>
                  {isEditing ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  ) : settings.emailNotifications ? (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Enabled
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      Disabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
