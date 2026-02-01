import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'

/**
 * Main Inertia entry point cho Backoffice (Admin)
 */
createInertiaApp({
  // Resolve component từ page name
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true })
    return pages[`./pages/${name}.jsx`]
  },
  
  // Setup app với component được resolve
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
  
  // Progress bar (optional)
  progress: {
    color: '#3B82F6',
    showSpinner: true,
  },
})
