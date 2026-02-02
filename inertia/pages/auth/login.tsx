import { Head, useForm, usePage } from '@inertiajs/react'
import { FormEvent, useState } from 'react'

interface Props extends Record<string, any> {
  error?: string
}

export default function Login() {
  const { error } = usePage<Props>().props
  const [isSignUp, setIsSignUp] = useState(false)
  const { data, setData, post, processing, errors, reset } = useForm({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSignUp) {
      post('/auth/register')
    } else {
      post('/auth/login')
    }
  }

  function toggleMode() {
    setIsSignUp(!isSignUp)
    reset()
  }

  return (
    <>
      <Head title="Admin Login" />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isSignUp ? 'Admin Sign Up' : 'Admin Login'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSignUp ? 'Create a new admin account' : 'Sign in to access admin dashboard'}
            </p>
          </div>

          {/* Error message from session */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-px">
              {isSignUp && (
                <div>
                  <label htmlFor="username" className="sr-only">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Username"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
              )}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${!isSignUp ? 'rounded-t-md' : ''}`}
                  placeholder="Email address"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${!isSignUp ? 'rounded-b-md' : ''}`}
                  placeholder="Password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={data.confirmPassword}
                    onChange={(e) => setData('confirmPassword', e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={processing}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {processing ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign up' : 'Sign in')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
