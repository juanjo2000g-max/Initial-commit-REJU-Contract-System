import logo from '../assets/logo-sichar.png'
import { X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Etapa, Segmento } from '../data/types'
import type { Luz } from '../lib/semaforo'
import { iniciales } from '../lib/util'

export function Logo({ claro = false, className = '' }: { claro?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={logo} alt="" className="h-7 w-auto" />
      <span className={`font-display text-xl font-extrabold tracking-tight ${claro ? 'text-white' : 'text-white'}`}>SICHAR</span>
    </span>
  )
}

export const ETAPAS: { id: Etapa; nombre: string; color: string }[] = [
  { id: 'nuevo', nombre: 'Nuevo', color: 'bg-sky-500/15 text-sky-300' },
  { id: 'contactado', nombre: 'Contactado', color: 'bg-indigo-500/15 text-indigo-300' },
  { id: 'cotizado', nombre: 'Cotizado', color: 'bg-amber-500/15 text-amber-300' },
  { id: 'negociacion', nombre: 'Negociación', color: 'bg-orange-500/15 text-orange-300' },
  { id: 'ganado', nombre: 'Ganado', color: 'bg-emerald-500/15 text-emerald-300' },
  { id: 'perdido', nombre: 'Perdido', color: 'bg-zinc-500/25 text-zinc-300' },
]

export const SEGMENTOS: Record<Segmento, { nombre: string; color: string }> = {
  hogar: { nombre: 'Hogar', color: 'bg-rose-500/15 text-rose-300' },
  arquitecto: { nombre: 'Arquitecto', color: 'bg-teal-500/15 text-teal-300' },
  constructora: { nombre: 'Constructora', color: 'bg-blue-500/15 text-blue-300' },
  distribuidor: { nombre: 'Distribuidor', color: 'bg-orange-500/15 text-orange-300' },
}

export function ChipEtapa({ etapa }: { etapa: Etapa }) {
  const e = ETAPAS.find((x) => x.id === etapa)!
  return <span className={`chip ${e.color}`}>{e.nombre}</span>
}

export function ChipSegmento({ segmento }: { segmento: Segmento }) {
  const e = SEGMENTOS[segmento]
  return <span className={`chip ${e.color}`}>{e.nombre}</span>
}

export function Avatar({ nombre, color = '#F47920', size = 32 }: { nombre: string; color?: string; size?: number }) {
  return (
    <span className="inline-grid shrink-0 place-items-center rounded-full font-semibold text-white" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}>
      {iniciales(nombre)}
    </span>
  )
}

const LUZ = { verde: 'bg-emerald-500', amarillo: 'bg-amber-400', rojo: 'bg-red-500' }
export function PuntoLuz({ luz, grande = false }: { luz: Luz; grande?: boolean }) {
  return <span className={`inline-block shrink-0 rounded-full ${LUZ[luz]} ${grande ? 'h-4 w-4' : 'h-2.5 w-2.5'} ${luz === 'rojo' ? 'animate-pulse' : ''}`} />
}

export function Modal({ abierto, cerrar, titulo, children, ancho = 'max-w-lg' }: { abierto: boolean; cerrar: () => void; titulo: ReactNode; children: ReactNode; ancho?: string }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [cerrar])
  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={cerrar}>
      <div className={`tarjeta max-h-[92vh] w-full overflow-auto scroll-fino animate-entrar ${ancho}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#181818] px-5 py-4">
          <h3 className="font-display text-lg font-bold">{titulo}</h3>
          <button className="btn-fantasma !p-1.5" onClick={cerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Kpi({ titulo, valor, detalle, icono, tono = 'neutro' }: { titulo: string; valor: ReactNode; detalle?: ReactNode; icono?: ReactNode; tono?: 'neutro' | 'bueno' | 'malo' | 'marca' }) {
  const t = { neutro: 'text-white/50', bueno: 'text-emerald-400', malo: 'text-red-400', marca: 'text-naranja' }[tono]
  return (
    <div className="tarjeta p-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/45">
        {titulo}
        {icono && <span className="text-naranja">{icono}</span>}
      </div>
      <div className="mt-2 font-display text-2xl font-bold tracking-tight">{valor}</div>
      {detalle && <div className={`mt-1 text-xs font-medium ${t}`}>{detalle}</div>}
    </div>
  )
}

export function Vacio({ texto }: { texto: string }) {
  return <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">{texto}</div>
}

// --- Avisos flotantes -------------------------------------------------------

interface Aviso {
  id: number
  titulo: string
  texto?: string
  tipo: 'exito' | 'alerta' | 'info'
}
const AvisoCtx = createContext<(a: Omit<Aviso, 'id'>) => void>(() => {})

export function AvisosProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const mostrar = useCallback((a: Omit<Aviso, 'id'>) => {
    const id = Date.now() + Math.random()
    setAvisos((xs) => [...xs, { ...a, id }])
    setTimeout(() => setAvisos((xs) => xs.filter((x) => x.id !== id)), 5200)
  }, [])
  return (
    <AvisoCtx.Provider value={mostrar}>
      {children}
      <div className="no-imprimir pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
        {avisos.map((a) => (
          <div key={a.id} className={`pointer-events-auto animate-entrar rounded-2xl p-4 text-sm shadow-2xl ring-1 ${a.tipo === 'alerta' ? 'bg-red-500/10 ring-red-500/30' : a.tipo === 'exito' ? 'bg-[#1c1c1c] text-white ring-naranja/40' : 'bg-[#181818] ring-white/10'}`}>
            <div className="font-semibold">{a.titulo}</div>
            {a.texto && <div className="mt-0.5 opacity-75">{a.texto}</div>}
          </div>
        ))}
      </div>
    </AvisoCtx.Provider>
  )
}

export const useAviso = () => useContext(AvisoCtx)
