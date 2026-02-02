import { Link, usePage, router } from '@inertiajs/react'
import { ReactNode, useState } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: ReactNode
  count?: number
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { props } = usePage<{ currentPath?: string }>()
  const currentPath = props.currentPath || '/admin/dashboard'
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.post('/auth/logout')
    }
  }

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
  ]

  const managementNav: NavItem[] = [
    {
      name: 'Users',
      href: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
    {
      name: 'Brands',
      href: '/admin/brands',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      name: 'Attributes',
      href: '/admin/attributes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      name: 'Reviews',
      href: '/admin/reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      ),
    },
  ]

  const systemNav: NavItem[] = [
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white shadow-lg transition-all duration-300 relative`}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-center border-b bg-gradient-to-r from-indigo-600 to-purple-600 relative">
          {!isCollapsed && (
            <>
              <h1 className="text-xl font-bold text-white">ShoeStore</h1>
              <span className="ml-2 text-xs text-indigo-200">ADMIN</span>
            </>
          )}
          {isCollapsed && <span className="text-2xl text-white">👟</span>}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-20 -right-3 z-10 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm transition"
        >
          <svg
            className="w-3 h-3 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            )}
          </svg>
        </button>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <div className="mb-4">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Overview
              </p>
            )}
            <Link
              href={navigation[0].href}
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-3'
              } px-3 py-2 rounded-lg transition ${
                currentPath === navigation[0].href
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={isCollapsed ? navigation[0].name : ''}
            >
              {navigation[0].icon}
              {!isCollapsed && <span className="font-medium">{navigation[0].name}</span>}
            </Link>
          </div>

          <div className="mb-4">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Management
              </p>
            )}
            {managementNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : 'gap-3'
                } px-3 py-2 rounded-lg transition ${
                  currentPath === item.href
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                {item.icon}
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
            
            {/* Add Product Button */}
            <Link
              href="/admin/products/create"
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'gap-3'
              } px-3 py-2 rounded-lg transition text-indigo-600 border border-indigo-200 hover:bg-indigo-50 mt-2`}
              title={isCollapsed ? 'Add Product' : ''}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {!isCollapsed && <span className="font-medium">Add Product</span>}
            </Link>
          </div>

          <div>
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                System
              </p>
            )}
            {systemNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center' : 'gap-3'
                } px-3 py-2 rounded-lg transition ${
                  currentPath === item.href
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                {item.icon}
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div
          className={`absolute bottom-0 ${
            isCollapsed ? 'w-20' : 'w-64'
          } p-4 border-t bg-gray-50 transition-all duration-300`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">admin@shoe.com</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
