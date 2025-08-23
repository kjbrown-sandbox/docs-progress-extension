import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'src/content/content') return 'content.js'
          if (chunkInfo.name === 'src/background') return 'background.js'
          return 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
