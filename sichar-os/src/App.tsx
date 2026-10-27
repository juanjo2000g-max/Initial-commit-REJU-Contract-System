import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AvisosProvider } from './components/ui'
import Landing from './pages/Landing'

const AppLayout = lazy(() => import('./pages/app/Layout'))
const Tablero = lazy(() => import('./pages/app/Tablero'))
const Crm = lazy(() => import('./pages/app/Crm'))
const LeadDetalle = lazy(() => import('./pages/app/LeadDetalle'))
const Cotizaciones = lazy(() => import('./pages/app/Cotizaciones'))
const Cotizador = lazy(() => import('./pages/app/Cotizador'))
const Costos = lazy(() => import('./pages/app/Costos'))
const Canal = lazy(() => import('./pages/app/Canal'))
const Asesoria = lazy(() => import('./pages/app/Asesoria'))
const Contenido = lazy(() => import('./pages/app/Contenido'))
const Automatizaciones = lazy(() => import('./pages/app/Automatizaciones'))
const Clientes = lazy(() => import('./pages/app/Clientes'))
const Ajustes = lazy(() => import('./pages/app/Ajustes'))
const Portal = lazy(() => import('./pages/portal/Portal'))
const Presentacion = lazy(() => import('./pages/Presentacion'))

function Cargando() {
  return <div className="grid h-screen place-items-center text-sm text-black/40">Cargando…</div>
}

export default function App() {
  return (
    <AvisosProvider>
      <Suspense fallback={<Cargando />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/presentacion" element={<Presentacion />} />
          <Route path="/portal/*" element={<Portal />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Tablero />} />
            <Route path="crm" element={<Crm />} />
            <Route path="crm/:id" element={<LeadDetalle />} />
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
  )
}
