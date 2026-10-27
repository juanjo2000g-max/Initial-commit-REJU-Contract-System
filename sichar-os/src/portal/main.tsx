import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { AvisosProvider } from '../components/ui'
import { StoreProvider } from '../lib/store'
import Portal from './Portal'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <AvisosProvider>
        <Portal />
      </AvisosProvider>
    </StoreProvider>
  </StrictMode>,
)
