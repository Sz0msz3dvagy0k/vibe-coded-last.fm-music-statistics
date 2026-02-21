import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'chart-vendor': ['recharts'],
          },
        },
      },
      // Increase chunk size warning limit since we're splitting
      chunkSizeWarningLimit: 600,
    },
  }
})
