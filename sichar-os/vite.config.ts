import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` genera el sitio para publicar (Vercel, Netlify, GitHub Pages).
// `npm run build:offline` genera un único HTML que abre con doble clic, sin internet.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'offline' ? [viteSingleFile()] : [])],
  build: mode === 'offline' ? { outDir: 'dist-offline', assetsInlineLimit: 100_000_000 } : {},
}))
