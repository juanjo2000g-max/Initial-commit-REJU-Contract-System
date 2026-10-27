// "Mi proyecto": productos que el visitante va guardando para cotizar.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

interface MiProyecto {
  ids: string[]
  alternar: (id: string) => void
  agregar: (ids: string[]) => void
  quitar: (id: string) => void
  vaciar: () => void
  abierto: boolean
  setAbierto: (v: boolean) => void
}

const Ctx = createContext<MiProyecto | null>(null)
const CLAVE = 'sichar-web:mi-proyecto'

export function MiProyectoProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) ?? '[]') as string[]
    } catch {
      return []
    }
  })
  const [abierto, setAbierto] = useState(false)
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(ids))
    } catch {
      /* sin almacenamiento */
    }
  }, [ids])
  const alternar = useCallback((id: string) => setIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id])), [])
  const agregar = useCallback((n: string[]) => setIds((xs) => Array.from(new Set([...xs, ...n]))), [])
  const quitar = useCallback((id: string) => setIds((xs) => xs.filter((x) => x !== id)), [])
  const vaciar = useCallback(() => setIds([]), [])
  return <Ctx.Provider value={{ ids, alternar, agregar, quitar, vaciar, abierto, setAbierto }}>{children}</Ctx.Provider>
}

export function useMiProyecto() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useMiProyecto fuera del proveedor')
  return v
}
