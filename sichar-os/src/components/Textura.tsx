// Texturas procedurales en SVG para representar cada producto sin fotos.
// Cuando SICHAR entregue fotografías reales, basta con cambiar <Muestra> por <img>.
import { renderToStaticMarkup } from 'react-dom/server'
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
      // Vetas principales + secundarias deformadas con ruido, y nubes suaves de fondo.
      const vena = (i: number, grosor: number, opacidad: number) => {
        const y0 = r() * T
        const y1 = y0 + (r() - 0.5) * T * 0.9
        const c1 = y0 + (r() - 0.5) * T * 0.8
        const c2 = y1 + (r() - 0.5) * T * 0.8
        return <path key={i} d={`M ${-T * 0.1} ${y0} C ${T * 0.35} ${c1}, ${T * 0.65} ${c2}, ${T * 1.1} ${y1}`} stroke={p.color2} strokeWidth={grosor} strokeOpacity={opacidad} fill="none" strokeLinecap="round" />
      }
      const principales = Array.from({ length: 3 }, (_, i) => vena(i, (0.6 + r() * 1.6) * escala, 0.55 + r() * 0.35))
      const finas = Array.from({ length: 9 }, (_, i) => vena(10 + i, (0.15 + r() * 0.35) * escala, 0.25 + r() * 0.35))
      const semilla = hash(p.id) % 997
      return (
        <>
          <filter id={`${id}-veta`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency={0.035 / escala} numOctaves={4} seed={semilla} result="ruido" />
            <feDisplacementMap in="SourceGraphic" in2="ruido" scale={9 * escala} xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation={0.18 * escala} />
          </filter>
          <filter id={`${id}-nube`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency={0.012 / escala} numOctaves={5} seed={semilla + 7} />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <pattern id={id} width={T} height={T} patternUnits="userSpaceOnUse">
            <rect width={T} height={T} fill={p.color} />
            <rect width={T} height={T} fill={p.color2} filter={`url(#${id}-nube)`} />
            <g filter={`url(#${id}-veta)`}>
              {finas}
              {principales}
            </g>
            <rect width={T} height={T} fill={`url(#${id}-brillo)`} />
            {junta}
          </pattern>
          <linearGradient id={`${id}-brillo`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.25} />
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

/** SVG de la textura, rasterizado una sola vez por (producto, escala) y reutilizado como imagen. */
const cacheMuestras = new Map<string, string>()
function urlMuestra(p: Prod, escala: number) {
  const clave = `${p.id}|${p.color}|${p.color2}|${p.textura}|${escala}`
  let url = cacheMuestras.get(clave)
  if (!url) {
    const id = `m${p.id}`
    const svg = renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="480" height="480" preserveAspectRatio="xMidYMid slice">
        <defs>
          <DefsTextura p={p} id={id} escala={escala} />
        </defs>
        <rect width="160" height="160" fill={`url(#${id})`} />
      </svg>,
    )
    url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    cacheMuestras.set(clave, url)
  }
  return url
}

/** Muestra cuadrada de un producto (se recorta como `object-cover` en cualquier proporción). */
export function Muestra({ p, className = '', escala = 1.6 }: { p: Prod; className?: string; escala?: number }) {
  return <img src={urlMuestra(p, escala)} alt="" aria-hidden draggable={false} decoding="async" className={`object-cover ${className}`} />
}
