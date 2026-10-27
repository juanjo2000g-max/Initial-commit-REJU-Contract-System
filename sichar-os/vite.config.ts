import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Cuatro aplicaciones en el mismo dominio (comparten datos y código):
//   /         centro de mando para presentar todo desde un solo punto
//   /web/     sitio web público de SICHAR
//   /crm/     CRM, cotizador, costos y automatizaciones (equipo SICHAR)
//   /portal/  portal de distribuidores aliados
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        hub: resolve(import.meta.dirname, 'index.html'),
        web: resolve(import.meta.dirname, 'web/index.html'),
        crm: resolve(import.meta.dirname, 'crm/index.html'),
        portal: resolve(import.meta.dirname, 'portal/index.html'),
      },
    },
  },
})
