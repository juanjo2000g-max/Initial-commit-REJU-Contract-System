// Texturas procedurales en SVG para representar cada producto sin fotos.
// Cuando SICHAR entregue fotografías reales, basta con cambiar <Muestra> por <img>.
import { useId } from 'react'
import type { Producto } from '../data/types'
import { rng } from '../lib/util'

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

type Prod = Pick<Producto, 'id' | 'textura' | 'color' | 'color2' | 'formato'>

/** Elementos <pattern>/<filter> para usar dentro de un <svg><defs>. */
export function DefsTextura({ p, id, escala = 1 }: { p: Prod; id: string; escala?: number }) {
  const r = rng(hash(p.id))
  const T = 100 * escala
  const juntas = ['ceramica', 'liso', 'cemento', 'piedra', 'terrazo', 'marmol'].includes(p.textura)
  const junta = juntas ? <rect x={0} y={0} width={T} height={T} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth={0.6} /> : null

  switch (p.textura) {
    case 'marmol': {
      const venas = Array.from({ length: 5 }, (_, i) => {
        const y0 = r() * T
        const y1 = r() * T
        return (
          <path
            key={i}
            d={`M -10 ${y0} C ${T * 0.3} ${y0 + (r() - 0.5) * 60}, ${T * 0.6} ${y1 + (r() - 0.5) * 60}, ${T + 10} ${y1}`}
            stroke={p.color2}
            strokeWidth={0.4 + r() * (i === 0 ? 2.4 : 1.2)}
            strokeOpacity={0.35 + r() * 0.45}
            fill="none"
            filter={`url(#${id}-blur)`}
          />
        )
      })
      return (
        <>
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation={0.35} />
          </filter>
          <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
            <rect width={T} height={T} fill={p.color} />
            {venas}
            <rect width={T} height={T} fill={`url(#${id}-brillo)`} />
            {junta}
          </pattern>
          <linearGradient id={`${id}-brillo`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.35} />
            <stop offset=".45" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </>
      )
    }
    case 'madera': {
      const H = T / 5
      return (
        <pattern id={id} width={T * 2} height={T} patternUnits="userSpaceOnUse">
          {Array.from({ length: 5 }, (_, i) => {
            const off = (i % 2) * T * 0.7
            const tono = r() * 0.18 - 0.09
            return (
              <g key={i}>
                <rect x={0} y={i * H} width={T * 2} height={H} fill={p.color} />
                <rect x={0} y={i * H} width={T * 2} height={H} fill={tono > 0 ? '#fff' : '#000'} fillOpacity={Math.abs(tono)} />
                {Array.from({ length: 4 }, (_, k) => (
                  <path key={k} d={`M 0 ${i * H + 2 + k * (H / 4)} Q ${T} ${i * H + 2 + k * (H / 4) + (r() - 0.5) * 3} ${T * 2} ${i * H + 2 + k * (H / 4)}`} stroke={p.color2} strokeOpacity={0.35} strokeWidth={0.5} fill="none" />
                ))}
                <line x1={off} y1={i * H} x2={off} y2={(i + 1) * H} stroke="rgba(0,0,0,.25)" strokeWidth={0.6} />
                <line x1={0} y1={i * H} x2={T * 2} y2={i * H} stroke="rgba(0,0,0,.2)" strokeWidth={0.5} />
              </g>
            )
          })}
        </pattern>
      )
    }
    case 'cemento':
    case 'piedra': {
      const f = p.textura === 'piedra' ? 0.06 : 0.9
      return (
        <>
          <filter id={`${id}-ruido`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={f} numOctaves={p.textura === 'piedra' ? 4 : 2} seed={hash(p.id) % 100} />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .35 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
            <rect width={T} height={T} fill={p.color} />
            <rect width={T} height={T} fill={p.color2} filter={`url(#${id}-ruido)`} />
            {junta}
          </pattern>
        </>
      )
    }
    case 'terrazo': {
      const chips = Array.from({ length: 38 }, (_, i) => {
        const cx = r() * T
        const cy = r() * T
        const rad = 1 + r() * 3.2
        const c = [p.color2, '#7d8b8a', '#d8c3a5', '#3b3b3b', '#c98d6b'][i % 5]
        const pts = Array.from({ length: 5 }, (_, k) => {
          const a = (k / 5) * Math.PI * 2 + r()
          const rr = rad * (0.6 + r() * 0.6)
          return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`
        }).join(' ')
        return <polygon key={i} points={pts} fill={c} fillOpacity={0.85} />
      })
      return (
        <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
          <rect width={T} height={T} fill={p.color} />
          {chips}
          {junta}
        </pattern>
      )
    }
    case 'mosaico': {
      const s = T / 6
      const h = s * Math.sqrt(3)
      const hex = (x: number, y: number, k: number) => (
        <polygon
          key={k}
          points={Array.from({ length: 6 }, (_, i) => `${x + s * Math.cos((Math.PI / 3) * i)},${y + s * Math.sin((Math.PI / 3) * i)}`).join(' ')}
          fill={r() > 0.5 ? p.color : p.color2}
          stroke="#f4f1ea"
          strokeWidth={1.2}
        />
      )
      return (
        <pattern id={id} width={s * 3} height={h} patternUnits="userSpaceOnUse">
          <rect width={s * 3} height={h} fill="#f4f1ea" />
          {[hex(0, 0, 0), hex(0, h, 1), hex(s * 1.5, h / 2, 2), hex(s * 3, 0, 3), hex(s * 3, h, 4)]}
        </pattern>
      )
    }
    case 'metal':
      return (
        <>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={p.color2} />
            <stop offset=".45" stopColor={p.color} />
            <stop offset=".55" stopColor="#fff" stopOpacity={0.5} />
            <stop offset=".65" stopColor={p.color} />
            <stop offset="1" stopColor={p.color2} />
          </linearGradient>
          <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
            <rect width={T} height={T} fill={`url(#${id}-g)`} />
            {Array.from({ length: 30 }, (_, i) => (
              <line key={i} x1={0} y1={i * (T / 30)} x2={T} y2={i * (T / 30) + 2} stroke="#fff" strokeOpacity={0.06} />
            ))}
          </pattern>
        </>
      )
    default:
      return (
        <>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.5} />
            <stop offset=".5" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
            <rect width={T} height={T} fill={p.color} />
            <rect width={T} height={T} fill={`url(#${id}-g)`} />
            {junta}
          </pattern>
        </>
      )
  }
}

/** Muestra cuadrada de un producto. */
export function Muestra({ p, className = '', escala = 1.6 }: { p: Prod; className?: string; escala?: number }) {
  const id = `tx-${p.id}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <DefsTextura p={p} id={id} escala={escala} />
      </defs>
      <rect width="160" height="160" fill={`url(#${id})`} />
    </svg>
  )
}
