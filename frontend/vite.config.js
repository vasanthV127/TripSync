import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy disabled - using VITE_API_URL from .env instead
    // proxy: {
    //   '/api': {
    //     target: 'https://tripsync-uh0i.onrender.com',
    //     changeOrigin: true,
    //   }
    // }
  }
})
