import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import '../index.css'
import { AvisosProvider } from '../components/ui'
import { StoreProvider } from '../lib/store'
import Layout from './pages/Layout'

const Tablero = lazy(() => import('./pages/Tablero'))
const Crm = lazy(() => import('./pages/Crm'))
const LeadDetalle = lazy(() => import('./pages/LeadDetalle'))
const Cotizaciones = lazy(() => import('./pages/Cotizaciones'))
const Cotizador = lazy(() => import('./pages/Cotizador'))
const Costos = lazy(() => import('./pages/Costos'))
const Canal = lazy(() => import('./pages/Canal'))
const Asesoria = lazy(() => import('./pages/Asesoria'))
const Contenido = lazy(() => import('./pages/Contenido'))
const Automatizaciones = lazy(() => import('./pages/Automatizaciones'))
const Clientes = lazy(() => import('./pages/Clientes'))
const Ajustes = lazy(() => import('./pages/Ajustes'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <StoreProvider>
        <AvisosProvider>
          <Suspense fallback={<div className="grid h-screen place-items-center text-sm text-black/40">Cargando…</div>}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Tablero />} />
                <Route path="pipeline" element={<Crm />} />
                <Route path="pipeline/:id" element={<LeadDetalle />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="cotizaciones" element={<Cotizaciones />} />
                <Route path="cotizaciones/nueva" element={<Cotizador />} />
                <Route path="cotizaciones/:id" element={<Cotizador />} />
                <Route path="costos" element={<Costos />} />
                <Route path="canal" element={<Canal />} />
                <Route path="asesoria" element={<Asesoria />} />
                <Route path="contenido" element={<Contenido />} />
                <Route path="automatizaciones" element={<Automatizaciones />} />
                <Route path="ajustes" element={<Ajustes />} />
              </Route>
            </Routes>
          </Suspense>
        </AvisosProvider>
      </StoreProvider>
    </HashRouter>
  </StrictMode>,
)
