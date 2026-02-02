import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'
import react from '@vitejs/plugin-react'
import inertia from '@adonisjs/inertia/client'

export default defineConfig({
  plugins: [
    react(),

    // Inertia plugin with SSR
    inertia({
      ssr: {
        enabled: true,
        entrypoint: 'inertia/app/ssr.tsx',
      },
    }),

    // AdonisJS Vite plugin
    adonisjs({
      entrypoints: ['inertia/app/app.tsx'],
      reload: ['resources/views/**/*.edge', 'inertia/**/*.tsx'],
    }),
  ],
})
