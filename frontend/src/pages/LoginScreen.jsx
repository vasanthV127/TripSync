import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors } from '../theme/colors'
import api from '../api'

export default function LoginScreen() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/login', { email, password })
      
      if (response.data.role !== 'admin') {
        setError('Access denied. Admin portal only.')
        setLoading(false)
        return
      }

      // Backend returns 'token', not 'access_token'
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userRole', response.data.role)
      navigate('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: colors.background }}
    >
      {/* Left Side - Branding (Hidden on mobile, full on lg+) */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 lg:p-12"
        style={{ backgroundColor: colors.color2 }}
      >
        <div className="max-w-md w-full text-center lg:text-left">
          <h1 
            className="text-6xl lg:text-7xl font-bold mb-6"
            style={{ 
              color: colors.color1,
              fontFamily: "'Unica One', cursive",
            }}
          >
            TripSync
          </h1>
          <p 
            className="text-xl lg:text-2xl mb-4"
            style={{ 
              color: 'white',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
            }}
          >
            College Bus Management System
          </p>
          <p 
            className="text-base lg:text-lg"
            style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
            }}
          >
            Sync your ride, Save your time
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <h1 
              className="text-4xl sm:text-5xl font-bold mb-2"
              style={{ 
                color: colors.color1,
                fontFamily: "'Unica One', cursive",
              }}
            >
              TripSync
            </h1>
            <p 
              className="text-sm text-gray-600"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Admin Portal
            </p>
          </div>

          {/* Login Card */}
          <div 
            className="bg-white rounded-xl shadow-xl p-6 sm:p-8"
            style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            <h2 
              className="text-2xl sm:text-3xl font-semibold mb-2"
              style={{ 
                color: colors.color2,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Admin Login
            </h2>
            <p 
              className="text-sm mb-6 text-gray-600"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Sign in to access the admin dashboard
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#374151', fontFamily: "'Poppins', sans-serif" }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@tripsync.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: '#1F2937',
                    focusRingColor: colors.color1,
                    ringColor: colors.color1,
                  }}
                />
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#374151', fontFamily: "'Poppins', sans-serif" }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                  style={{ 
                    fontFamily: "'Poppins', sans-serif",
                    color: '#1F2937',
                    focusRingColor: colors.color1,
                    ringColor: colors.color1,
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-md font-semibold text-base transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ 
                  backgroundColor: colors.color2,
                  color: colors.color1,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs" style={{ color: '#9CA3AF', fontFamily: "'Poppins', sans-serif" }}>
                © 2025 TripSync by VIT. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}