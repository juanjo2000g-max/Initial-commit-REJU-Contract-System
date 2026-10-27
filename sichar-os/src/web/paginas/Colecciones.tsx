import { Heart, Search, SlidersHorizontal } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Muestra } from '../../components/Textura'
import type { Linea, Pais, Producto } from '../../data/types'
import { useStore } from '../../lib/store'
import { PAISES, fmtCOP } from '../../lib/util'
import { Etiqueta } from '../comunes'
import { useMiProyecto } from '../ctx'

const LINEAS: { id: Linea | ''; nombre: string }[] = [
  { id: '', nombre: 'Todo' },
  { id: 'ceramica', nombre: 'Porcelanatos y cerámicas' },
  { id: 'bano', nombre: 'Baño' },
  { id: 'decorativo', nombre: 'Decorativos' },
  { id: 'remodelacion', nombre: 'Remodelación' },
]
const ACABADOS = ['Brillante', 'Mate', 'Satinado', 'Rústico', 'Metálico']

export default function Colecciones() {
  const { s } = useStore()
  const [params, setParams] = useSearchParams()
  const linea = (params.get('linea') ?? '') as Linea | ''
  const [q, setQ] = useState('')
  const [acabado, setAcabado] = useState('')
  const [origen, setOrigen] = useState<Pais | ''>('')
  const [orden, setOrden] = useState<'destacados' | 'menor' | 'mayor'>('destacados')
  const [filtros, setFiltros] = useState(false)

  const lista = useMemo(() => {
    const xs = s.productos.filter(
      (p) =>
        (!linea || p.linea === linea) &&
        (!acabado || p.acabado.toLowerCase().includes(acabado.toLowerCase().slice(0, 5))) &&
        (!origen || p.origen === origen) &&
        (!q || `${p.nombre} ${p.ref} ${p.formato}`.toLowerCase().includes(q.toLowerCase())),
    )
    if (orden === 'menor') return [...xs].sort((a, b) => a.pvpSugerido - b.pvpSugerido)
    if (orden === 'mayor') return [...xs].sort((a, b) => b.pvpSugerido - a.pvpSugerido)
    return [...xs].sort((a, b) => Number(!!b.insignia) - Number(!!a.insignia) || b.ventasMes - a.ventasMes)
  }, [s.productos, linea, acabado, origen, q, orden])

  return (
    <div className="pt-36">
      <section className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Etiqueta>Catálogo 2026</Etiqueta>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-display text-[16vw] font-extrabold leading-[.85] tracking-tighter md:text-[9vw]">Colecciones</h1>
          <p className="max-w-sm pb-4 text-white/60">{s.productos.length} referencias importadas directamente de India, China, Brasil, España y Perú. Precio sugerido igual en todo el país.</p>
        </div>
      </section>

      <div className="sticky top-[68px] z-30 mt-10 border-y border-white/10 bg-[#0d0d0d]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-2 px-5 py-3 md:px-10">
          <div className="-mx-1 flex flex-1 gap-1 overflow-x-auto px-1">
            {LINEAS.map((l) => (
              <button key={l.id} onClick={() => setParams(l.id ? { linea: l.id } : {})} className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${linea === l.id ? 'text-tinta' : 'text-white/60 hover:text-white'}`}>
                {linea === l.id && <motion.span layoutId="linea-activa" className="absolute inset-0 rounded-full bg-white" transition={{ type: 'spring', damping: 25, stiffness: 300 }} />}
                <span className="relative">{l.nombre}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar referencia…" className="w-56 rounded-full bg-white/5 py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/35 focus:ring-naranja" />
          </div>
          <button onClick={() => setFiltros(!filtros)} className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ring-1 transition ${filtros || acabado || origen ? 'bg-naranja ring-naranja' : 'ring-white/15 hover:ring-white/40'}`}>
            <SlidersHorizontal size={15} /> Filtros
          </button>
        </div>
        <AnimatePresence>
          {filtros && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="mx-auto flex max-w-[1500px] flex-wrap gap-8 px-5 pb-5 pt-2 text-sm md:px-10">
                <Grupo titulo="Acabado" opciones={ACABADOS} valor={acabado} set={setAcabado} />
                <Grupo titulo="Origen" opciones={PAISES} valor={origen} set={(v) => setOrigen(v as Pais | '')} />
                <Grupo titulo="Ordenar" opciones={['destacados', 'menor', 'mayor']} etiquetas={{ destacados: 'Destacados', menor: 'Menor precio', mayor: 'Mayor precio' }} valor={orden} set={(v) => setOrden((v || 'destacados') as typeof orden)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="mx-auto max-w-[1500px] px-5 py-12 md:px-10">
        <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {lista.map((p, k) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, delay: Math.min(k, 8) * 0.04 }}>
                <Tarjeta p={p} grande={k === 0 && !linea && !q} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {lista.length === 0 && <p className="py-24 text-center text-white/50">No encontramos referencias con esos filtros.</p>}
      </section>
    </div>
  )
}

function Grupo({ titulo, opciones, valor, set, etiquetas }: { titulo: string; opciones: string[]; valor: string; set: (v: string) => void; etiquetas?: Record<string, string> }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-white/40">{titulo}</div>
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((o) => (
          <button key={o} onClick={() => set(valor === o ? '' : o)} className={`rounded-full px-3.5 py-1.5 transition ${valor === o ? 'bg-white text-tinta' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>{etiquetas?.[o] ?? o}</button>
        ))}
      </div>
    </div>
  )
}

export function Tarjeta({ p, grande = false }: { p: Producto; grande?: boolean }) {
  const { ids, alternar } = useMiProyecto()
  const guardado = ids.includes(p.id)
  return (
    <div className="group">
      <Link to={`/colecciones/${p.id}`} className={`relative block overflow-hidden rounded-2xl bg-white/5 ${grande ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
        <Muestra p={p} className="absolute inset-0 h-full w-full transition duration-[1.2s] ease-out group-hover:scale-110" escala={p.unidad === 'm²' ? 1.8 : 2.6} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {p.insignia && <span className="rounded-full bg-naranja px-2.5 py-1 text-[11px] font-semibold">Insignia</span>}
          {p.lineaDirecta && <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">Colección proyecto</span>}
        </div>
        <span className="absolute bottom-3 left-3 translate-y-3 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-tinta opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">Ver detalle</span>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[.18em] text-white/40">{p.formato} · {p.acabado} · {p.origen}</div>
          <Link to={`/colecciones/${p.id}`} className="mt-1 block font-semibold leading-snug hover:text-naranja">{p.nombre}</Link>
          <div className="mt-1.5 text-sm text-white/60">{fmtCOP(p.pvpSugerido)} <span className="text-white/35">/{p.unidad}</span></div>
        </div>
        <button onClick={() => alternar(p.id)} aria-label="Guardar" className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 transition ${guardado ? 'bg-naranja ring-naranja' : 'ring-white/15 hover:ring-white/50'}`}>
          <motion.span key={String(guardado)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
            <Heart size={16} className={guardado ? 'fill-white' : ''} />
          </motion.span>
        </button>
      </div>
    </div>
  )
}
