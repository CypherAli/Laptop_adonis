import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    adonisjs({
      /**
       * Entrypoints for Inertia React apps
       */
      entrypoints: [
        'backoffice/src/main.jsx', // Admin Inertia entry
        'web-shop/src/main.jsx',   // User Inertia entry
      ],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['backoffice/src/**/*', 'web-shop/src/**/*'],
    }),
  ],
  resolve: {
    alias: {
      '@backoffice': resolve(__dirname, 'backoffice/src'),
      '@webshop': resolve(__dirname, 'web-shop/src'),
    },
  },
})
