import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split heavy PDF tools into their own chunk
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-utils';
            }
            // Put other libraries in vendor chunk
            return 'vendor';
          }
        }
      }
    }
  }
})
