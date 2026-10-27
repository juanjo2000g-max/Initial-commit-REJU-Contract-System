// Genera la versión sin internet: cada app en un único HTML, con la misma
// estructura de carpetas para que los enlaces entre apps funcionen.
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { build } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const raiz = resolve(import.meta.dirname, '..')
const salida = resolve(raiz, 'dist-offline')
rmSync(salida, { recursive: true, force: true })

for (const [app, html] of [['hub', 'index.html'], ['web', 'web/index.html'], ['crm', 'crm/index.html'], ['portal', 'portal/index.html']]) {
  await build({
    root: raiz,
    base: './',
    configFile: false,
    logLevel: 'warn',
    plugins: [react(), viteSingleFile()],
    publicDir: app === 'hub' ? 'public' : false,
    build: {
      outDir: salida,
      emptyOutDir: false,
      assetsInlineLimit: 100_000_000,
      chunkSizeWarningLimit: 5000,
      rollupOptions: { input: resolve(raiz, html) },
    },
  })
  console.log(`✓ ${app}`)
}
