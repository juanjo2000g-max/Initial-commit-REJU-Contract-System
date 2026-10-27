import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import '../index.css'
import { StoreProvider } from '../lib/store'
import Hub from './Hub'
import Presentacion from './Presentacion'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/presentacion" element={<Presentacion />} />
        </Routes>
      </StoreProvider>
    </HashRouter>
  </StrictMode>,
)
