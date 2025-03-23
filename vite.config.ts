import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import ssr from 'vike/plugin'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ssr()],
  // Define aliases to ensure imports work correctly
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@pages': resolve(__dirname, './pages')
    }
  },
  // Configure Vite to properly serve the pages directory
  server: {
    fs: {
      allow: ['./src', './pages', '.']
    }
  }
})
