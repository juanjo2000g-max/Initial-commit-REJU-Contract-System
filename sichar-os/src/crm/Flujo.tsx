// Diagrama de una regla al estilo n8n: disparador → acciones, con pulsos
// que recorren las conexiones cuando la regla se acaba de ejecutar.
import { Zap } from 'lucide-react'
import { motion } from 'motion/react'
import type { Regla } from '../data/types'

const FILA = 46

export function Flujo({ r, activa, reciente }: { r: Regla; activa: boolean; reciente: boolean }) {
  const H = Math.max(r.acciones.length * FILA, 92)
  const ys = r.acciones.map((_, i) => (H - r.acciones.length * FILA) / 2 + i * FILA + FILA / 2)
  return (
    <div className="mt-4 grid grid-cols-[minmax(0,2fr)_56px_minmax(0,3fr)] items-center text-sm" style={{ minHeight: H }}>
      <motion.div
        animate={reciente ? { boxShadow: ['0 0 0 0 rgba(244,121,32,.0)', '0 0 0 8px rgba(244,121,32,.25)', '0 0 0 0 rgba(244,121,32,0)'] } : {}}
        transition={{ duration: 1.4, repeat: reciente ? Infinity : 0 }}
        className={`relative rounded-xl p-3 ring-1 ${activa ? 'bg-naranja/10 ring-naranja/40' : 'bg-black/[.03] ring-black/[.08]'}`}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-naranja-700"><Zap size={11} /> Cuando</div>
        <div className="mt-1 leading-snug">{r.disparador}</div>
        <span className={`absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-2 ring-white ${activa ? 'bg-naranja' : 'bg-black/[.08]'}`} />
      </motion.div>
      <svg width="56" height={H} className="overflow-visible">
        {ys.map((y, i) => {
          const d = `M0,${H / 2} C28,${H / 2} 28,${y} 56,${y}`
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={activa ? '#F47920' : 'rgba(0,0,0,.18)'} strokeOpacity={activa ? 0.55 : 1} strokeWidth={1.5} strokeDasharray={activa ? undefined : '3 3'} />
              {reciente && (
                <circle r={3.5} fill="#F47920">
                  <animateMotion dur="1.1s" repeatCount="indefinite" begin={`${i * 0.15}s`} path={d} />
                </circle>
              )}
            </g>
          )
        })}
      </svg>
      <ul className="grid gap-1.5">
        {r.acciones.map((a, i) => (
          <motion.li key={a} initial={false} animate={reciente ? { backgroundColor: ['rgba(0,0,0,.025)', 'rgba(244,121,32,.18)', 'rgba(0,0,0,.025)'] } : { backgroundColor: 'rgba(0,0,0,.025)' }} transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }} className="relative flex min-h-[40px] items-center rounded-lg px-3 py-1.5 leading-tight ring-1 ring-black/[.08]">
            <span className={`absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-2 ring-white ${activa ? 'bg-white' : 'bg-black/[.08]'}`} />
            <span className="pl-1">{a}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
