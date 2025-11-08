import React from 'react'
import { useNavigate } from 'react-router-dom'
import { colors } from '../theme/colors'

export default function DriverDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Driver Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-full transition hover:opacity-90"
            style={{ 
              backgroundColor: colors.color2,
              color: colors.color1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-medium mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Welcome, Driver!
          </h2>
          <p className="text-gray-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Driver dashboard features coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
