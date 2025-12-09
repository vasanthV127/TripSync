import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors } from '../theme/colors'

export default function IntroScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login')
    }, 2500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        background: `linear-gradient(135deg, ${colors.color2} 0%, #1a1a1a 100%)` 
      }}
    >
      <div className="text-center">
        <div className="mb-8">
          <h1 
            className="text-9xl font-bold mb-4 animate-fade-in"
            style={{ 
              color: colors.color1,
              fontFamily: "'Unica One', cursive",
              textShadow: '0 4px 20px rgba(255, 200, 18, 0.3)',
            }}
          >
            TripSync
          </h1>
          <div 
            className="h-1 w-32 mx-auto mb-6"
            style={{ 
              backgroundColor: colors.color1,
              borderRadius: '2px',
            }}
          />
          <p 
            className="text-2xl mb-2"
            style={{ 
              color: 'white',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
              letterSpacing: '1px',
            }}
          >
            Admin Portal
          </p>
          <p 
            className="text-lg mb-8"
            style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
            }}
          >
            College Bus Management System
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-8">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              backgroundColor: colors.color1,
              animationDelay: '0s'
            }}
          />
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              backgroundColor: colors.color1,
              animationDelay: '0.2s'
            }}
          />
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              backgroundColor: colors.color1,
              animationDelay: '0.4s'
            }}
          />
        </div>

        <p 
          className="text-sm italic"
          style={{ 
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: "'Merriweather', serif",
            fontWeight: 300,
          }}
        >
          Powered by VIT
        </p>
      </div>
    </div>
  )
}

