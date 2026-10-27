import Lenis from 'lenis'
import { Camera, Heart, Menu, MessageCircle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom'
import logo from '../assets/logo-sichar.png'
import { Muestra } from '../components/Textura'
import { urlApp } from '../lib/apps'
import { useStore } from '../lib/store'
import { SEDES, waLink } from '../lib/util'
import { useMiProyecto } from './ctx'

const MENU = [
  { to: '/colecciones', texto: 'Colecciones' },
  { to: '/espacios', texto: 'Espacios 3D' },
  { to: '/inspiracion', texto: 'Inspiración' },
  { to: '/profesionales', texto: 'Profesionales' },
  { to: '/donde-comprar', texto: 'Dónde comprar' },
  { to: '/nosotros', texto: 'Nosotros' },
]

export default function Sitio() {
  const loc = useLocation()
  const outlet = useOutlet()
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    const l = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenis.current = l
    let raf = 0
    const loop = (t: number) => {
      l.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      l.destroy()
    }
  }, [])

  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
  }, [loc.pathname])

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Nav />
      <AnimatePresence mode="wait">
        <motion.main key={loc.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Cortina clave={loc.pathname} />
      <Pie />
      <CajonProyecto />
      {loc.pathname !== '/espacios' && <WhatsFlotante />}
    </div>
  )
}

/** Barrido naranja entre páginas. */
function Cortina({ clave }: { clave: string }) {
  const primera = useRef(true)
  const [k, setK] = useState(0)
  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    setK((x) => x + 1)
  }, [clave])
  if (!k) return null
  return (
    <motion.div key={k} className="pointer-events-none fixed inset-0 z-[70] origin-bottom bg-naranja" initial={{ scaleY: 1 }} animate={{ scaleY: 0 }} transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }} style={{ originY: 0 }} />
  )
}

function Nav() {
  const [scroll, setScroll] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const { ids, setAbierto: abrirProyecto } = useMiProyecto()
  const loc = useLocation()
  useEffect(() => {
    const f = () => setScroll(window.scrollY > 40)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  useEffect(() => setAbierto(false), [loc.pathname])

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scroll ? 'bg-[#0d0d0d]/75 py-3 backdrop-blur-xl' : 'py-6'}`}>
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 md:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-auto" />
            <span className="font-display text-2xl font-extrabold tracking-tight">SICHAR</span>
          </Link>
          <nav className="hidden items-center gap-1 xl:flex">
            {MENU.map((m) => (
              <NavLink key={m.to} to={m.to} className={({ isActive }) => `relative rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                {({ isActive }) => (
                  <>
                    {m.texto}
                    {isActive && <motion.span layoutId="nav-activo" className="absolute inset-x-4 -bottom-0.5 h-px bg-naranja" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => abrirProyecto(true)} className="relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-white/15 transition hover:ring-white/40">
              <Heart size={16} className={ids.length ? 'fill-naranja text-naranja' : ''} />
              <span className="hidden sm:inline">Mi proyecto</span>
              {ids.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-naranja px-1 text-[11px]">{ids.length}</span>}
            </button>
            <Link to="/contacto" className="hidden rounded-full bg-naranja px-5 py-2.5 text-sm font-semibold transition hover:bg-naranja-600 md:block">Cotizar</Link>
            <button className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-white/15 xl:hidden" onClick={() => setAbierto(true)} aria-label="Menú">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {abierto && (
          <motion.div className="fixed inset-0 z-[60] flex flex-col bg-naranja p-6 text-tinta" initial={{ clipPath: 'circle(0% at 95% 4%)' }} animate={{ clipPath: 'circle(150% at 95% 4%)' }} exit={{ clipPath: 'circle(0% at 95% 4%)' }} transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}>
            <div className="flex justify-between">
              <span className="font-display text-2xl font-extrabold">SICHAR</span>
              <button onClick={() => setAbierto(false)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-black/20" aria-label="Cerrar"><X /></button>
            </div>
            <nav className="mt-10 grid gap-1">
              {[{ to: '/', texto: 'Inicio' }, ...MENU, { to: '/contacto', texto: 'Cotizar' }].map((m, i) => (
                <motion.div key={m.to} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <Link to={m.to} className="font-display text-5xl font-extrabold tracking-tight hover:text-white">{m.texto}</Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto text-sm font-medium">Somos su proveedor, no su competidor.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function CajonProyecto() {
  const { s } = useStore()
  const { ids, quitar, abierto, setAbierto } = useMiProyecto()
  const productos = ids.map((id) => s.productos.find((p) => p.id === id)).filter((p) => !!p)
  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div className="fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAbierto(false)} />
          <motion.aside className="fixed inset-y-0 right-0 z-[66] flex w-full max-w-md flex-col bg-[#141414] p-6 ring-1 ring-white/10" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold">Mi proyecto</h3>
              <button onClick={() => setAbierto(false)} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/15" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <p className="mt-1 text-sm text-white/50">Guarda productos mientras navegas y cotízalos todos juntos.</p>
            <div className="mt-6 grid flex-1 content-start gap-3 overflow-auto">
              {productos.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">Toca el ♥ en cualquier producto para guardarlo aquí.</div>}
              {productos.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-white/5 p-3">
                  <Muestra p={p} className="h-16 w-16 shrink-0 rounded-xl" escala={1} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/colecciones/${p.id}`} onClick={() => setAbierto(false)} className="block truncate font-semibold hover:text-naranja">{p.nombre}</Link>
                    <div className="text-xs text-white/50">{p.formato} · {p.acabado}</div>
                  </div>
                  <button onClick={() => quitar(p.id)} className="text-xs text-white/40 hover:text-white">Quitar</button>
                </div>
              ))}
            </div>
            <Link to="/contacto" onClick={() => setAbierto(false)} className={`mt-6 rounded-full bg-naranja py-4 text-center font-semibold transition hover:bg-naranja-600 ${productos.length ? '' : 'pointer-events-none opacity-40'}`}>
              Cotizar {productos.length} producto{productos.length === 1 ? '' : 's'}
            </Link>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function WhatsFlotante() {
  const { s } = useStore()
  return (
    <a href={waLink(s.config.whatsappSichar, 'Hola SICHAR, vi su página web y quiero información.')} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_40px_-5px_rgba(37,211,102,.6)] transition hover:scale-110">
      <MessageCircle size={26} />
    </a>
  )
}

function Pie() {
  return (
    <footer className="relative overflow-hidden bg-naranja text-tinta">
      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-24 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.28em]">¿Empezamos?</p>
            <Link to="/contacto" className="group mt-4 block font-display text-[13vw] font-extrabold leading-[.85] tracking-tighter lg:text-[9vw]">
              Hablemos de tu <span className="relative inline-block italic">proyecto<span className="absolute -bottom-2 left-0 h-2 w-0 bg-tinta transition-all duration-500 group-hover:w-full" /></span>.
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 self-end text-sm">
            <div className="grid content-start gap-2">
              <span className="mb-1 text-xs font-semibold uppercase tracking-[.2em] opacity-60">Explora</span>
              {MENU.map((m) => <Link key={m.to} to={m.to} className="font-medium hover:underline">{m.texto}</Link>)}
            </div>
            <div className="grid content-start gap-2">
              <span className="mb-1 text-xs font-semibold uppercase tracking-[.2em] opacity-60">Sedes</span>
              {SEDES.map((c) => <span key={c} className="font-medium">{c}</span>)}
              <span className="mb-1 mt-4 text-xs font-semibold uppercase tracking-[.2em] opacity-60">Aliados</span>
              <a href={urlApp('portal')} className="font-medium hover:underline">Portal distribuidores</a>
              <a href={urlApp('crm')} className="font-medium hover:underline">Acceso equipo</a>
            </div>
          </div>
        </div>
        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-6 text-xs font-medium">
          <span>© 2026 SICHAR · Importación y distribución de acabados · Cali, Colombia</span>
          <span className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={18} /></a>
            Sitio por Pragmos · Prototipo con datos de demostración
          </span>
        </div>
      </div>
      <img src={logo} alt="" className="pointer-events-none absolute -right-20 -top-10 h-[420px] w-auto opacity-[.08] mix-blend-multiply" />
    </footer>
  )
}
