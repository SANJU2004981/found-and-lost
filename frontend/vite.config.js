import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // react-leaflet uses ESM with special context patterns that conflict
    // with Vite's CommonJS transform. Excluding it lets Vite use it as-is.
    exclude: ['react-leaflet'],
  },
})
