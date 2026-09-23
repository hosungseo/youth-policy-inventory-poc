import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  // cache-bust data files on every build
  define: { __BUILD_ID__: JSON.stringify(Date.now().toString(36)) },
})
