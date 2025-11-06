import { useState, useEffect } from 'react'
import api from './api'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')

  useEffect(() => {
    // Test API connection
    const checkAPI = async () => {
      try {
        const response = await api.get('/health')
        if (response.data.status === 'ok') {
          setApiStatus('✅ Connected')
        }
      } catch (error) {
        console.error('API Error:', error)
        setApiStatus('❌ Not Connected')
      }
    }
    checkAPI()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          TripSync
        </h1>
        <p className="text-gray-600 mb-2">
          College Bus Management System
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Backend Status: <span className="font-semibold">{apiStatus}</span>
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
          <a 
            href="https://tripsync-uh0i.onrender.com/docs" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 underline mt-2 block"
          >
            API Documentation
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
