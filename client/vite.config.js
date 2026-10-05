import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          ui:      ['lucide-react', 'clsx', 'react-hot-toast'],
          editor:  ['react-quill'],
          dnd:     ['@hello-pangea/dnd'],
          motion:  ['framer-motion'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
