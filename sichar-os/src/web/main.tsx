import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import '../index.css'
import { AvisosProvider } from '../components/ui'
import { StoreProvider } from '../lib/store'
import { MiProyectoProvider } from './ctx'
import Inicio from './paginas/Inicio'
import Sitio from './Sitio'

const Colecciones = lazy(() => import('./paginas/Colecciones'))
const Producto = lazy(() => import('./paginas/Producto'))
const Espacios = lazy(() => import('./paginas/Espacios'))
const Inspiracion = lazy(() => import('./paginas/Inspiracion'))
const Profesionales = lazy(() => import('./paginas/Profesionales'))
const DondeComprar = lazy(() => import('./paginas/DondeComprar'))
const Nosotros = lazy(() => import('./paginas/Nosotros'))
const Contacto = lazy(() => import('./paginas/Contacto'))

const Carga = () => <div className="grid h-screen place-items-center bg-[#0d0d0d]"><div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-naranja" /></div>

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <StoreProvider>
        <AvisosProvider>
          <MiProyectoProvider>
            <Suspense fallback={<Carga />}>
              <Routes>
                <Route element={<Sitio />}>
                  <Route index element={<Inicio />} />
                  <Route path="colecciones" element={<Colecciones />} />
                  <Route path="colecciones/:id" element={<Producto />} />
                  <Route path="espacios" element={<Espacios />} />
                  <Route path="inspiracion" element={<Inspiracion />} />
                  <Route path="profesionales" element={<Profesionales />} />
                  <Route path="donde-comprar" element={<DondeComprar />} />
                  <Route path="nosotros" element={<Nosotros />} />
                  <Route path="contacto" element={<Contacto />} />
                </Route>
              </Routes>
            </Suspense>
          </MiProyectoProvider>
        </AvisosProvider>
      </StoreProvider>
    </HashRouter>
  </StrictMode>,
)
