import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  build: {
    sourcemap: false, // Save memory during build (Critical for Free Tier)
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://backend:5000', // Docker service name
        changeOrigin: true,
        secure: false
      }
    }
  }
})
