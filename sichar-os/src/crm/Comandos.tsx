// Buscador universal (Ctrl+K / ⌘K): clientes, pantallas, productos y acciones.
import { ArrowRight, CornerDownLeft, FileText, LayoutGrid, Package, Search, User, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Muestra } from '../components/Textura'
import { urlApp } from '../lib/apps'
import { useStore } from '../lib/store'
import { fmtM } from '../lib/util'

interface Item {
  id: string
  grupo: string
  titulo: string
  detalle?: string
  icono: ReactNode
  hacer: () => void
}

const PANTALLAS: [string, string][] = [
  ['Tablero', '/'],
  ['Pipeline', '/pipeline'],
  ['Clientes y visitas', '/clientes'],
  ['Cotizaciones', '/cotizaciones'],
  ['Nueva cotización', '/cotizaciones/nueva'],
  ['Costos y márgenes', '/costos'],
  ['Canal y aliados', '/canal'],
  ['Mesa de Asesoría', '/asesoria'],
  ['Contenido y redes', '/contenido'],
  ['Automatizaciones', '/automatizaciones'],
  ['Ajustes', '/ajustes'],
]

export function Comandos({ abierto, cerrar, acciones }: { abierto: boolean; cerrar: () => void; acciones: { titulo: string; detalle: string; hacer: () => void }[] }) {
  const { s } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const entrada = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (abierto) {
      setQ('')
      setI(0)
      setTimeout(() => entrada.current?.focus(), 30)
    }
  }, [abierto])

  const items = useMemo<Item[]>(() => {
    const t = q.trim().toLowerCase()
    const coincide = (x: string) => !t || x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(t.normalize('NFD').replace(/[̀-ͯ]/g, ''))
    const ir = (r: string) => () => { nav(r); cerrar() }
    const out: Item[] = []
    acciones.filter((a) => coincide(a.titulo)).forEach((a, k) => out.push({ id: `a${k}`, grupo: 'Acciones', titulo: a.titulo, detalle: a.detalle, icono: <Zap size={16} />, hacer: () => { a.hacer(); cerrar() } }))
    PANTALLAS.filter(([n]) => coincide(n)).forEach(([n, r]) => out.push({ id: `p${r}`, grupo: 'Ir a', titulo: n, icono: <LayoutGrid size={16} />, hacer: ir(r) }))
    if (t)
      s.leads
        .filter((l) => coincide(`${l.nombre} ${l.empresa ?? ''} ${l.ciudad} ${l.interes}`))
        .slice(0, 6)
        .forEach((l) => out.push({ id: l.id, grupo: 'Clientes', titulo: l.empresa ?? l.nombre, detalle: `${l.ciudad} · ${l.etapa} · ${fmtM(l.valor)}`, icono: <User size={16} />, hacer: ir(`/pipeline/${l.id}`) }))
    if (t)
      s.cotizaciones
        .filter((c) => coincide(c.numero))
        .slice(0, 3)
        .forEach((c) => out.push({ id: c.id, grupo: 'Cotizaciones', titulo: c.numero, detalle: c.estado, icono: <FileText size={16} />, hacer: ir(`/cotizaciones/${c.id}`) }))
    if (t)
      s.productos
        .filter((p) => coincide(`${p.nombre} ${p.ref}`))
        .slice(0, 4)
        .forEach((p) => out.push({ id: p.id, grupo: 'Productos', titulo: p.nombre, detalle: `${p.ref} · ver en el sitio web`, icono: <Muestra p={p} className="h-5 w-5 rounded" escala={0.5} />, hacer: () => { window.open(urlApp('web', `/colecciones/${p.id}`), '_blank'); cerrar() } }))
    return out
  }, [q, s.leads, s.cotizaciones, s.productos, acciones, nav, cerrar])

  useEffect(() => setI(0), [q])

  const tecla = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(items.length - 1, x + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)) }
    if (e.key === 'Enter') items[i]?.hacer()
    if (e.key === 'Escape') cerrar()
  }

  let grupoAnterior = ''
  return (
    <AnimatePresence>
      {abierto && (
        <motion.div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={cerrar}>
          <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="w-full max-w-xl overflow-hidden rounded-2xl bg-[#161616] shadow-[0_40px_120px_-20px_rgba(0,0,0,.9)] ring-1 ring-white/10" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/[.07] px-4">
              <Search size={18} className="text-white/40" />
              <input ref={entrada} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={tecla} placeholder="Busca un cliente, una pantalla o escribe una acción…" className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-white/30" />
              <kbd className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/40">Esc</kbd>
            </div>
            <div className="max-h-[52vh] overflow-y-auto p-2 scroll-fino">
              {items.length === 0 && <div className="px-3 py-8 text-center text-sm text-white/40">Sin resultados para «{q}».</div>}
              {items.map((it, k) => {
                const cabecera = it.grupo !== grupoAnterior
                grupoAnterior = it.grupo
                return (
                  <div key={it.id}>
                    {cabecera && <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">{it.grupo}</div>}
                    <button onMouseEnter={() => setI(k)} onClick={it.hacer} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${i === k ? 'bg-white/[.07]' : ''}`}>
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${i === k ? 'bg-naranja text-white' : 'bg-white/5 text-white/60'}`}>{it.icono}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{it.titulo}</span>
                        {it.detalle && <span className="block truncate text-xs text-white/40 first-letter:uppercase">{it.detalle}</span>}
                      </span>
                      {i === k ? <CornerDownLeft size={15} className="text-white/40" /> : <ArrowRight size={14} className="text-white/15" />}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 border-t border-white/[.07] px-4 py-2.5 text-[11px] text-white/35">
              <span>↑↓ navegar</span><span>↵ abrir</span><span className="ml-auto flex items-center gap-1"><Package size={12} /> SICHAR OS</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
