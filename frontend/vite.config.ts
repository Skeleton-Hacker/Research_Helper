import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',  // This is crucial for Electron to find the assets
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
