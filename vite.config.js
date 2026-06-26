import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Raise the warning limit slightly — you have legit large chunks (videos etc)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Content-hashed filenames → safe to cache forever (matches vercel.json /assets rule)
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',

        // Split vendor JS into separate cached chunks.
        // React/router never changes between deploys → browser keeps it cached
        // even when you push new app code.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
        },
      },
    },
  },
})