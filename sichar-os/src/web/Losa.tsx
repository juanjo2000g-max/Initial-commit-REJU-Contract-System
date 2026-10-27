// Pieza de porcelanato que se inclina con el mouse y refleja la luz.
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import { Muestra } from '../components/Textura'
import type { Producto } from '../data/types'

export function Losa({ p, className = '', escala = 2.6, proporcion = '60/130', inclinar = 10 }: { p: Producto; className?: string; escala?: number; proporcion?: string; inclinar?: number }) {
  const mx = useMotionValue(50)
  const my = useMotionValue(50)
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const brillo = /brill/i.test(p.acabado)
  const luz = useMotionTemplate`radial-gradient(circle at ${mx}% ${my}%, rgba(255,255,255,${brillo ? 0.55 : 0.18}), transparent 45%)`
  return (
    <motion.div
      className={`relative overflow-hidden rounded-[10px] shadow-[0_50px_90px_-30px_rgba(0,0,0,.9)] [transform-style:preserve-3d] ${className}`}
      style={{ rotateX: rx, rotateY: ry, aspectRatio: proporcion, transformPerspective: 1000 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        mx.set(x * 100)
        my.set(y * 100)
        ry.set((x - 0.5) * inclinar * 2)
        rx.set(-(y - 0.5) * inclinar * 2)
      }}
      onMouseLeave={() => {
        rx.set(0)
        ry.set(0)
        mx.set(50)
        my.set(50)
      }}
    >
      <Muestra p={p} className="h-full w-full" escala={escala} />
      <motion.div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: luz }} />
      {brillo && <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />}
    </motion.div>
  )
}
