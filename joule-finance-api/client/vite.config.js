import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if we're building for Vercel
const isVercel = process.env.VERCEL === '1'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: isVercel ? 'dist' : '../public',
    emptyOutDir: true
  }
}) 