import { useState, useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  if (!isVisible) return null

  const types = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      icon: <FaCheckCircle className="text-2xl" />,
      borderColor: 'border-green-400'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: <FaExclamationCircle className="text-2xl" />,
      borderColor: 'border-red-400'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: <FaInfoCircle className="text-2xl" />,
      borderColor: 'border-blue-400'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      icon: <FaExclamationCircle className="text-2xl" />,
      borderColor: 'border-yellow-400'
    }
  }

  const config = types[type] || types.success

  return (
    <div
      className={`fixed top-20 right-6 z-[9999] transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
      style={{ animation: !isExiting ? 'slideIn 0.3s ease-out' : 'none' }}
    >
      <div
        className={`${config.bg} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md border-l-4 ${config.borderColor}`}
      >
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  )
}

// Toast Container to manage multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-6 z-[9999] space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Custom hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const toast = {
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
  }

  return { toast, toasts, removeToast }
}

export default Toast
