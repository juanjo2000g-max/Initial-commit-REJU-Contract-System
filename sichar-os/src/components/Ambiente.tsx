// Simulador de ambientes: un baño en 3D con CSS (perspectiva real) donde cada
// superficie usa la textura del producto elegido.
import { useEffect, useId, useRef, useState } from 'react'
import type { Ambiente as Amb, Producto } from '../data/types'
import { DefsTextura } from './Textura'

const W = 560
const H = 340
const D = 440

function Superficie({ p, w, h, escala }: { p: Producto; w: number; h: number; escala: number }) {
  const id = `sf-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0">
      <defs>
        <DefsTextura p={p} id={id} escala={escala} />
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
    </svg>
  )
}

const GRIFERIA = {
  cromo: 'linear-gradient(135deg,#8d9198,#f5f6f7 45%,#a9adb3 60%,#e6e7e9)',
  negro: 'linear-gradient(135deg,#111,#3a3a3a 50%,#151515)',
  dorado: 'linear-gradient(135deg,#9e7c3c,#f1d999 45%,#b8924a 65%,#e2c27a)',
}

/** Escala del formato (cm) a píxeles de la escena: 1 px ≈ 0,55 cm. */
function escalaFormato(p: Producto) {
  const m = p.formato.match(/(\d+)x(\d+)/)
  if (!m) return 0.8
  return Math.max(Number(m[1]), Number(m[2])) / 100 / 0.8
}

export function Ambiente({ piso, pared, acento, griferia, rotacion = -14 }: { piso: Producto; pared: Producto; acento: Producto; griferia: Amb['griferia']; rotacion?: number }) {
  const caja = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(1)
  useEffect(() => {
    const el = caja.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setK(Math.min(1.25, e.contentRect.width / 640)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const g = GRIFERIA[griferia]
  const cara = 'absolute left-0 top-0 overflow-hidden [backface-visibility:hidden]'

  return (
    <div ref={caja} className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#2a2622] to-[#121110]" style={{ height: 420 * k }}>
      <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%,-50%) scale(${k})`, perspective: 900, perspectiveOrigin: '50% 38%' }}>
        <div className="relative transition-transform duration-700" style={{ width: 0, height: 0, transformStyle: 'preserve-3d', transform: `translateZ(-120px) rotateY(${rotacion}deg)` }}>
          {/* Piso */}
          <div className={cara} style={{ width: W, height: D, transform: `translate(-50%,-50%) translateY(${H / 2}px) rotateX(90deg)` }}>
            <Superficie p={piso} w={W} h={D} escala={escalaFormato(piso)} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/30" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay" />
          </div>
          {/* Pared del fondo */}
          <div className={cara} style={{ width: W, height: H, transform: `translate(-50%,-50%) translateZ(${-D / 2}px)` }}>
            <Superficie p={pared} w={W} h={H} escala={escalaFormato(pared)} />
            {/* franja de acento detrás del lavamanos */}
            <div className="absolute overflow-hidden" style={{ left: 150, top: 0, width: 260, height: H }}>
              <Superficie p={acento} w={260} h={H} escala={escalaFormato(acento) * 0.6} />
            </div>
            {/* espejo */}
            <div className="absolute rounded-[90px] border-[3px] shadow-2xl" style={{ left: 205, top: 40, width: 150, height: 150, borderColor: griferia === 'dorado' ? '#c9a45c' : griferia === 'negro' ? '#1a1a1a' : '#b9bcc1', background: 'linear-gradient(160deg,#dfe6ea,#9fb0ba 55%,#cfd8dd)' }}>
              <div className="absolute inset-0 rounded-[90px] bg-gradient-to-br from-white/60 via-transparent to-transparent" />
            </div>
            {/* lámparas */}
            {[180, 372].map((x) => (
              <div key={x} className="absolute" style={{ left: x, top: 70 }}>
                <div className="h-14 w-2 rounded-full" style={{ background: g }} />
                <div className="absolute -left-3 top-12 h-10 w-8 rounded-b-2xl bg-[#fff6e2] shadow-[0_0_40px_14px_rgba(255,214,150,.45)]" />
              </div>
            ))}
            {/* mueble + lavamanos */}
            <div className="absolute rounded-md shadow-2xl" style={{ left: 175, top: 232, width: 210, height: 108, background: 'linear-gradient(180deg,#6b4b33,#4a321f)' }}>
              <div className="absolute inset-x-3 top-3 bottom-3 grid grid-cols-2 gap-2">
                <div className="rounded border border-black/30 bg-white/5" />
                <div className="rounded border border-black/30 bg-white/5" />
              </div>
            </div>
            <div className="absolute rounded-[50%] bg-white shadow-xl" style={{ left: 225, top: 214, width: 110, height: 30, boxShadow: 'inset 0 -6px 10px rgba(0,0,0,.12), 0 8px 18px rgba(0,0,0,.35)' }} />
            <div className="absolute rounded-t-full" style={{ left: 274, top: 176, width: 10, height: 42, background: g }} />
            <div className="absolute rounded-full" style={{ left: 262, top: 176, width: 30, height: 9, background: g }} />
            <div className="absolute rounded-full" style={{ left: 286, top: 186, width: 16, height: 5, background: g }} />
          </div>
          {/* Pared izquierda: ducha */}
          <div className={cara} style={{ width: D, height: H, transform: `translate(-50%,-50%) translateX(${-W / 2}px) rotateY(90deg)` }}>
            <Superficie p={acento} w={D} h={H} escala={escalaFormato(acento) * 0.8} />
            <div className="absolute inset-0 bg-gradient-to-l from-black/35 to-black/5" />
            <div className="absolute rounded-full" style={{ left: 250, top: 40, width: 8, height: 120, background: g }} />
            <div className="absolute rounded-sm" style={{ left: 225, top: 30, width: 70, height: 12, background: g }} />
            <div className="absolute rounded-full" style={{ left: 236, top: 162, width: 36, height: 10, background: g }} />
          </div>
          {/* Pared derecha */}
          <div className={cara} style={{ width: D, height: H, transform: `translate(-50%,-50%) translateX(${W / 2}px) rotateY(-90deg)` }}>
            <Superficie p={pared} w={D} h={H} escala={escalaFormato(pared)} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/0" />
            <div className="absolute" style={{ left: 120, top: 120, width: 120, height: 10, background: g }} />
            <div className="absolute rounded-sm bg-white/90" style={{ left: 135, top: 128, width: 90, height: 70 }} />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,220,170,.18),transparent_60%)]" />
    </div>
  )
}
