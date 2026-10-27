// Piezas de interfaz reutilizables del sitio web.
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, animate } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

/** Aparece suavemente al entrar en pantalla. */
export function Revelar({ children, retraso = 0, className = '', y = 40 }: { children: ReactNode; retraso?: number; className?: string; y?: number }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, delay: retraso, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

/** Título que se revela palabra por palabra. */
export function TituloRevelado({ texto, className = '', resaltar = [] as string[] }: { texto: string; className?: string; resaltar?: string[] }) {
  const palabras = texto.split(' ')
  return (
    <h2 className={className}>
      {palabras.map((p, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={`inline-block ${resaltar.includes(p.replace(/[.,]/g, '')) ? 'text-naranja' : ''}`}
            initial={{ y: '110%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            {p}&nbsp;
          </motion.span>
        </span>
      ))}
    </h2>
  )
}

/** Párrafo cuyas palabras se iluminan con el scroll. */
export function TextoScroll({ texto, className = '' }: { texto: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.35'] })
  const palabras = texto.split(' ')
  return (
    <p ref={ref} className={className}>
      {palabras.map((p, i) => (
        <Palabra key={i} progreso={scrollYProgress} rango={[i / palabras.length, (i + 1) / palabras.length]}>
          {p}
        </Palabra>
      ))}
    </p>
  )
}

function Palabra({ children, progreso, rango }: { children: string; progreso: ReturnType<typeof useScroll>['scrollYProgress']; rango: [number, number] }) {
  const opacidad = useTransform(progreso, rango, [0.14, 1])
  return (
    <motion.span style={{ opacity: opacidad }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  )
}

/** Número que cuenta hasta su valor al aparecer. */
export function Contador({ valor, sufijo = '', className = '' }: { valor: number; sufijo?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visto = useInView(ref, { once: true })
  const mv = useMotionValue(0)
  useEffect(() => {
    if (!visto) return
    const c = animate(mv, valor, { duration: 2, ease: [0.16, 1, 0.3, 1] })
    const u = mv.on('change', (v) => ref.current && (ref.current.textContent = `${Math.round(v).toLocaleString('es-CO')}${sufijo}`))
    return () => {
      c.stop()
      u()
    }
  }, [visto, valor, sufijo, mv])
  return <span ref={ref} className={className}>0{sufijo}</span>
}

/** Botón que sigue ligeramente al cursor. */
export function BotonMagnetico({ children, to, href, onClick, variante = 'naranja', className = '' }: { children: ReactNode; to?: string; href?: string; onClick?: () => void; variante?: 'naranja' | 'blanco' | 'contorno' | 'oscuro'; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15 })
  const sy = useSpring(y, { stiffness: 200, damping: 15 })
  const estilos = {
    naranja: 'bg-naranja text-white hover:bg-naranja-600 shadow-[0_18px_40px_-14px_rgba(244,121,32,.8)]',
    blanco: 'bg-white text-tinta hover:bg-hueso',
    contorno: 'text-white ring-1 ring-white/30 hover:ring-white/80 hover:bg-white/5 backdrop-blur',
    oscuro: 'bg-tinta text-white hover:bg-black',
  }[variante]
  const clase = `group inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold transition-colors ${estilos} ${className}`
  const contenido = (
    <>
      {children}
      <span className={`grid h-6 w-6 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${variante === "blanco" ? "bg-black/10" : "bg-white/20"}`}>
        <ArrowUpRight size={15} />
      </span>
    </>
  )
  const mover = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.25)
    y.set((e.clientY - r.top - r.height / 2) * 0.35)
  }
  const salir = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.span style={{ x: sx, y: sy }} className="inline-block" onMouseMove={mover} onMouseLeave={salir}>
      {to ? (
        <Link to={to} className={clase} onClick={onClick}>{contenido}</Link>
      ) : href ? (
        <a href={href} className={clase} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" onClick={onClick}>{contenido}</a>
      ) : (
        <button className={clase} onClick={onClick}>{contenido}</button>
      )}
    </motion.span>
  )
}

export function Etiqueta({ children, claro = false }: { children: ReactNode; claro?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[.28em] ${claro ? 'text-naranja-200' : 'text-naranja'}`}>
      <span className="h-px w-8 bg-current" />
      {children}
    </div>
  )
}

/** Cinta infinita de texto. */
export function Cinta({ items, className = '', invertir = false }: { items: string[]; className?: string; invertir?: boolean }) {
  const lista = [...items, ...items]
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className={`flex w-max gap-10 ${invertir ? '[animation-direction:reverse]' : ''} animate-cinta`}>
        {lista.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t}
            <span className="text-naranja">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Imagen/elemento con parallax vertical suave. */
export function Parallax({ children, fuerza = 80, className = '' }: { children: ReactNode; fuerza?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [fuerza, -fuerza])
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  )
}
