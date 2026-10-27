// Piezas "vivas" del tablero: números que se animan al cambiar, mapa de sedes
// que late cuando entra un cliente y la cinta de actividad en tiempo real.
import { geoMercator, geoPath } from 'd3-geo'
import type { FeatureCollection, Geometry } from 'geojson'
import { animate, AnimatePresence, motion, useMotionValue } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import mundo from 'world-atlas/countries-110m.json'
import type { Estado, Sede } from '../data/types'
import { SEDES, haceCuanto, sum } from '../lib/util'

/** Número que se anima cada vez que cambia su valor. */
export function NumeroVivo({ valor, formato, className = '' }: { valor: number; formato: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(0)
  useEffect(() => {
    const c = animate(mv, valor, { duration: 1.2, ease: [0.16, 1, 0.3, 1] })
    const u = mv.on('change', (v) => ref.current && (ref.current.textContent = formato(v)))
    return () => {
      c.stop()
      u()
    }
  }, [valor, mv, formato])
  return <span ref={ref} className={className}>{formato(0)}</span>
}

const COORD: Record<Sede, [number, number]> = {
  Cali: [-76.532, 3.4516],
  Medellín: [-75.5812, 6.2442],
  Bogotá: [-74.0721, 4.711],
  Barranquilla: [-74.7813, 10.9685],
  Bucaramanga: [-73.1227, 7.1193],
}

const PAISES = (() => {
  const t = mundo as unknown as Topology<{ countries: GeometryCollection }>
  return feature(t, t.objects.countries) as FeatureCollection<Geometry, { name: string }>
})()

export function MapaSedes({ s, ahora }: { s: Estado; ahora: number }) {
  const W = 420
  const H = 480
  const { path, proy } = useMemo(() => {
    const col = PAISES.features.find((f) => f.properties.name === 'Colombia')!
    const proy = geoMercator().fitExtent([[30, 20], [W - 30, H - 20]], col)
    return { path: geoPath(proy), proy }
  }, [])
  const ventas = Object.fromEntries(SEDES.map((c) => [c, sum(s.distribuidores.filter((d) => d.ciudad === c), (d) => d.ventas6m[5])])) as Record<Sede, number>
  const max = Math.max(...Object.values(ventas))
  const recientes = s.leads.filter((l) => ahora - l.creado < 20_000)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        <radialGradient id="brillo-sede">
          <stop offset="0" stopColor="#F47920" stopOpacity=".55" />
          <stop offset="1" stopColor="#F47920" stopOpacity="0" />
        </radialGradient>
      </defs>
      {PAISES.features.map((f, i) => (
        <path key={i} d={path(f) ?? ''} fill={f.properties.name === 'Colombia' ? '#1a1612' : '#121212'} stroke={f.properties.name === 'Colombia' ? '#F47920' : '#222'} strokeOpacity={f.properties.name === 'Colombia' ? 0.6 : 1} strokeWidth={f.properties.name === 'Colombia' ? 1.2 : 0.6} />
      ))}
      {/* rutas entre sedes */}
      {SEDES.slice(1).map((c) => {
        const a = proy(COORD.Cali)!
        const b = proy(COORD[c])!
        const mx = (a[0] + b[0]) / 2 - 30
        const my = (a[1] + b[1]) / 2
        return <path key={c} d={`M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`} fill="none" stroke="#F47920" strokeOpacity=".25" strokeDasharray="3 4" />
      })}
      {SEDES.map((c) => {
        const [x, y] = proy(COORD[c])!
        const r = 8 + (ventas[c] / max) * 18
        const nuevos = recientes.filter((l) => l.ciudad === c)
        return (
          <g key={c}>
            <circle cx={x} cy={y} r={r * 2.2} fill="url(#brillo-sede)" />
            <AnimatePresence>
              {nuevos.map((l) => (
                <motion.circle key={l.id} cx={x} cy={y} r={r} fill="none" stroke="#F47920" strokeWidth={2} initial={{ r, opacity: 1 }} animate={{ r: r * 4, opacity: 0 }} transition={{ duration: 2.2, repeat: 2, ease: 'easeOut' }} />
              ))}
            </AnimatePresence>
            <circle cx={x} cy={y} r={r} fill="#F47920" fillOpacity={0.9} />
            <circle cx={x} cy={y} r={3} fill="#fff" />
            <text x={x + r + 6} y={y - 2} fill="#fff" fontSize={13} fontWeight={700} fontFamily="Inter">{c}</text>
            <text x={x + r + 6} y={y + 13} fill="rgba(255,255,255,.45)" fontSize={11} fontFamily="Inter">$ {(ventas[c] / 1e6).toFixed(0)} M este mes</text>
          </g>
        )
      })}
    </svg>
  )
}

/** Cinta de actividad: automatizaciones y avisos más recientes. */
export function Actividad({ s, ahora }: { s: Estado; ahora: number }) {
  const items = [
    ...s.eventos.slice(0, 12).map((e) => ({ id: e.id, fecha: e.fecha, texto: e.titulo, detalle: e.detalle, tipo: 'auto' as const })),
    ...s.notificaciones.slice(0, 12).map((n) => ({ id: n.id, fecha: n.fecha, texto: n.texto, detalle: '', tipo: n.tipo })),
  ]
    .sort((a, b) => b.fecha - a.fecha)
    .filter((x, i, a) => a.findIndex((y) => y.texto === x.texto) === i)
    .slice(0, 7)
  return (
    <ul className="grid gap-2">
      <AnimatePresence initial={false}>
        {items.map((x) => (
          <motion.li key={x.id} layout initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex items-start gap-3 rounded-xl bg-white/[.03] p-3 ring-1 ring-white/[.05]">
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${x.tipo === 'auto' ? 'bg-naranja' : x.tipo === 'alerta' ? 'bg-red-500' : x.tipo === 'exito' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{x.texto}</div>
              {x.detalle && <div className="truncate text-xs text-white/40">{x.detalle}</div>}
            </div>
            <span className="shrink-0 text-[11px] text-white/30">{haceCuanto(x.fecha, ahora)}</span>
          </motion.li>
        ))}
      </AnimatePresence>
      {items.length === 0 && <li className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">Activa el modo en vivo o envía una solicitud desde el sitio web.</li>}
    </ul>
  )
}
