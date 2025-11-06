import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          TripSync
        </h1>
        <p className="text-gray-600 mb-6">
          College Bus Management System
        </p>
        
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
            Student Login
          </button>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
            Driver Login
          </button>
          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
            Admin Login
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>FastAPI Backend + React Frontend</p>
          <p className="mt-2">🚌 Track • 💬 Chat • 📍 Navigate</p>
        </div>
      </div>
    </div>
  )
}

export default App
