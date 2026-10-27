import { ArrowDown, ArrowUpRight, Building2, Compass, MapPin, Store } from 'lucide-react'
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Muestra } from '../../components/Textura'
import type { Linea } from '../../data/types'
import { useStore } from '../../lib/store'
import { SEDES } from '../../lib/util'
import { BotonMagnetico, Cinta, Contador, Etiqueta, Revelar, TextoScroll, TituloRevelado } from '../comunes'
import { Losa } from '../Losa'

const Escena3D = lazy(() => import('../3d/Escena3D'))

const LINEAS: { id: Linea; nombre: string; frase: string; muestra: string }[] = [
  { id: 'ceramica', nombre: 'Porcelanatos y cerámicas', frase: 'Gran formato, brillo espejo, maderas y piedras.', muestra: 'p1' },
  { id: 'bano', nombre: 'Baño', frase: 'Grifería, duchas, lavamanos y accesorios.', muestra: 'p14' },
  { id: 'decorativo', nombre: 'Decorativos', frase: 'Mosaicos, paneles 3D y listelos.', muestra: 'p10' },
  { id: 'remodelacion', nombre: 'Remodelación', frase: 'Pegantes, boquillas y nivelación.', muestra: 'p18' },
]

export default function Inicio() {
  return (
    <>
      <Hero />
      <div className="border-y border-white/10 bg-[#0d0d0d] py-6 font-display text-3xl font-bold text-white/90 md:text-5xl">
        <Cinta items={['Calacatta 60x130', 'Nero Marquina', 'Statuario Gold', 'Terrazo Veneciano', 'Roble Nórdico', 'Oro cepillado', 'Mosaico Salvia']} />
      </div>
      <Manifiesto />
      <Insignia />
      <Lineas />
      <Espacios />
      <Profesionales />
      <DondeComprar />
    </>
  )
}

function Hero() {
  const { s } = useStore()
  const insignias = s.productos.filter((p) => p.insignia)
  const [i, setI] = useState(0)
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const escala = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const opacidad = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  // El 3D solo se dibuja mientras el inicio está en pantalla.
  const visible = useInView(ref)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % insignias.length), 7000)
    return () => clearInterval(t)
  }, [insignias.length])
  const piso = insignias[i]
  const P = (id: string) => s.productos.find((p) => p.id === id)!

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale: escala }}>
        <Suspense fallback={<div className="h-full w-full bg-[#1b140f]" />}>
          <Escena3D ambiente="bano" piso={piso} pared={P('p7')} acento={i === 1 ? P('p1') : P('p2')} griferia={i === 2 ? 'dorado' : 'negro'} luz="calida" modo="cine" activo={visible} className="!h-full !w-full" />
        </Suspense>
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
      <motion.div style={{ opacity: opacidad }} className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-5 pb-16 md:px-10 md:pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Etiqueta claro>20 años de acabados importados</Etiqueta>
        </motion.div>
        <h1 className="mt-6 font-display text-[15vw] font-extrabold leading-[.86] tracking-tighter sm:text-[12vw] lg:text-[8.5vw]">
          {['El brillo', 'que tu espacio', 'merece.'].map((l, k) => (
            <span key={l} className="block overflow-hidden">
              <motion.span className={`block ${k === 2 ? 'text-naranja' : ''}`} initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.3 + k * 0.12, ease: [0.16, 1, 0.3, 1] }}>
                {l}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.div className="mt-8 flex flex-wrap items-end justify-between gap-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
          <div>
            <p className="max-w-md text-lg text-white/70">Porcelanatos de gran formato, grifería y decorativos traídos directo de 5 países. Diséñalo en 3D y cómpralo en la ferretería de tu barrio.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BotonMagnetico to="/espacios">Diseña tu espacio en 3D</BotonMagnetico>
              <BotonMagnetico to="/colecciones" variante="contorno">Ver colecciones</BotonMagnetico>
            </div>
          </div>
          <div className="w-72 rounded-2xl bg-black/40 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-[.2em] text-white/50">En el piso ahora</div>
            <motion.div key={piso.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 flex items-center gap-3">
              <Muestra p={piso} className="h-10 w-10 shrink-0 rounded-md" escala={0.9} />
              <div>
                <div className="font-semibold leading-tight">{piso.nombre.replace('Porcelanato ', '')}</div>
                <div className="text-xs text-white/50">{piso.formato} · {piso.acabado}</div>
              </div>
            </motion.div>
            <div className="mt-3 h-0.5 overflow-hidden rounded bg-white/10">
              <motion.div key={i} className="h-full bg-naranja" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 7, ease: 'linear' }} />
            </div>
            <Link to={`/colecciones/${piso.id}`} className="pointer-events-auto mt-3 flex items-center gap-1 text-xs font-semibold text-naranja-200 hover:text-white">Ver producto <ArrowUpRight size={13} /></Link>
          </div>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/40 md:block"><ArrowDown size={20} /></div>
    </section>
  )
}

function Manifiesto() {
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-32 md:px-10 md:py-48">
      <Etiqueta>Quiénes somos</Etiqueta>
      <TextoScroll
        className="mt-10 font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl"
        texto="Durante más de veinte años hemos traído a Colombia lo mejor de India, China, Brasil, España y Perú. Sin intermediarios. Para que cada ferretería, cada obra y cada hogar tenga acabados que cambian espacios."
      />
      <div className="mt-24 grid grid-cols-2 gap-y-12 border-t border-white/10 pt-12 md:grid-cols-4">
        {[
          [20, '+', 'años importando'],
          [5, '', 'países de origen'],
          [5, '', 'sedes en Colombia'],
          [18000, ' m²', 'listos para obra'],
        ].map(([n, suf, t]) => (
          <div key={t as string}>
            <Contador valor={n as number} sufijo={suf as string} className="font-display text-5xl font-extrabold tracking-tighter text-naranja lg:text-7xl" />
            <div className="mt-2 text-sm text-white/55">{t as string}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Sección fijada que se desplaza en horizontal mostrando las losas insignia. */
function Insignia() {
  const { s } = useStore()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-62%'])
  const destacados = ['p1', 'p2', 'p3', 'p8', 'p5'].map((id) => s.productos.find((p) => p.id === id)!)
  return (
    <section ref={ref} className="relative h-[320vh] bg-[#f4f1ec] text-tinta">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex items-center gap-[6vw] pl-5 md:pl-10">
          <div className="w-[80vw] shrink-0 md:w-[38vw]">
            <Etiqueta>Producto insignia</Etiqueta>
            <h2 className="mt-6 font-display text-6xl font-extrabold leading-[.9] tracking-tighter md:text-8xl">60x130.<br /><span className="text-naranja">Brillo espejo.</span></h2>
            <p className="mt-6 max-w-sm text-lg text-black/60">Menos juntas, más amplitud. El gran formato que convierte cualquier piso en una superficie continua. Mueve el mouse sobre cada pieza.</p>
          </div>
          {destacados.map((p, k) => (
            <div key={p.id} className={`w-[64vw] shrink-0 md:w-[22vw] ${k % 2 ? 'mt-24' : '-mt-16'}`}>
              <Losa p={p} escala={2.8} proporcion={p.formato === '60x130' ? '60/130' : '1/1'} />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[.2em] text-black/40">{p.formato} · {p.acabado}</div>
                  <div className="mt-1 font-display text-2xl font-bold leading-tight">{p.nombre.replace('Porcelanato ', '')}</div>
                </div>
                <Link to={`/colecciones/${p.id}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tinta text-white transition hover:bg-naranja"><ArrowUpRight size={18} /></Link>
              </div>
            </div>
          ))}
          <div className="w-[30vw] shrink-0" />
        </motion.div>
      </div>
    </section>
  )
}

function Lineas() {
  const { s } = useStore()
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-32 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <TituloRevelado texto="Todo para el acabado perfecto." resaltar={['perfecto']} className="max-w-3xl font-display text-5xl font-extrabold leading-[.95] tracking-tighter md:text-7xl" />
        <BotonMagnetico to="/colecciones" variante="contorno">Ver todo el catálogo</BotonMagnetico>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-2">
        {LINEAS.map((l, k) => {
          const p = s.productos.find((x) => x.id === l.muestra)!
          const n = s.productos.filter((x) => x.linea === l.id).length
          return (
            <Revelar key={l.id} retraso={k * 0.08}>
              <Link to={`/colecciones?linea=${l.id}`} className="group relative block h-[52vh] min-h-80 overflow-hidden rounded-[28px]">
                <Muestra p={p} className="absolute inset-0 h-full w-full transition duration-[1.4s] ease-out group-hover:scale-110" escala={l.id === 'ceramica' ? 3.2 : 2} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-8">
                  <div>
                    <div className="text-sm text-white/60">{n} referencias</div>
                    <h3 className="mt-1 font-display text-4xl font-bold tracking-tight md:text-5xl">{l.nombre}</h3>
                    <p className="mt-2 max-w-sm text-white/65">{l.frase}</p>
                  </div>
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-tinta transition duration-500 group-hover:rotate-45 group-hover:bg-naranja group-hover:text-white"><ArrowUpRight /></span>
                </div>
              </Link>
            </Revelar>
          )
        })}
      </div>
    </section>
  )
}

function Espacios() {
  const { s } = useStore()
  const P = (id: string) => s.productos.find((p) => p.id === id)!
  const presets = [
    { a: 'bano', t: 'Baño spa', p: ['p5', 'p1', 'p10'] },
    { a: 'cocina', t: 'Cocina abierta', p: ['p4', 'p7', 'p10'] },
    { a: 'sala', t: 'Sala de gran formato', p: ['p2', 'p11', 'p3'] },
  ]
  return (
    <section className="relative overflow-hidden bg-naranja py-32 text-tinta">
      <div className="mx-auto grid max-w-[1500px] items-center gap-16 px-5 md:px-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Etiqueta claro={false}><span className="text-tinta">Espacios 3D</span></Etiqueta>
          <h2 className="mt-6 font-display text-6xl font-extrabold leading-[.9] tracking-tighter md:text-8xl">Pruébalo antes de comprarlo.</h2>
          <p className="mt-6 max-w-md text-lg text-black/70">Un baño, una cocina o una sala en 3D real. Cambia el piso, las paredes, la grifería y la luz. Gira la cámara. Mira cómo refleja el brillo. Y cotízalo con un clic.</p>
          <div className="mt-10"><BotonMagnetico to="/espacios" variante="oscuro">Abrir el simulador</BotonMagnetico></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {presets.map((x, k) => (
            <Revelar key={x.t} retraso={k * 0.1} className={k === 1 ? 'sm:mt-16' : ''}>
              <Link to={`/espacios?ambiente=${x.a}&piso=${x.p[0]}&pared=${x.p[1]}&acento=${x.p[2]}`} className="group block overflow-hidden rounded-3xl bg-tinta p-2 text-white">
                <div className="grid aspect-[3/4] grid-rows-[2fr_1fr] gap-1 overflow-hidden rounded-2xl">
                  <div className="grid grid-cols-2 gap-1">
                    <Muestra p={P(x.p[1])} className="h-full w-full" escala={1.6} />
                    <Muestra p={P(x.p[2])} className="h-full w-full" escala={1} />
                  </div>
                  <Muestra p={P(x.p[0])} className="h-full w-full transition duration-700 group-hover:scale-110" escala={2} />
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="font-semibold">{x.t}</span>
                  <ArrowUpRight size={18} className="transition group-hover:rotate-45" />
                </div>
              </Link>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  )
}

function Profesionales() {
  const items = [
    { icono: Compass, t: 'Arquitectos y diseñadores', d: 'Mesa de Asesoría, kit de muestras sin costo, fichas técnicas y colecciones exclusivas de proyecto.', to: '/profesionales#arquitectos' },
    { icono: Building2, t: 'Constructoras', d: 'Inventario para obra, despachos por etapas y cotización formal en menos de 48 horas.', to: '/profesionales#constructoras' },
    { icono: Store, t: 'Distribuidores', d: 'Programa Distribuidor Aliado: referidos de la web, portal de pedidos 24/7 y proyectos protegidos.', to: '/profesionales#distribuidores' },
  ]
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-32 md:px-10">
      <Etiqueta>Profesionales</Etiqueta>
      <TituloRevelado texto="Trabajamos con quienes construyen el país." resaltar={['construyen']} className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[.95] tracking-tighter md:text-7xl" />
      <div className="mt-16 divide-y divide-white/10 border-y border-white/10">
        {items.map((it) => (
          <Link key={it.t} to={it.to} className="group grid items-center gap-6 py-10 transition-colors hover:bg-white/[.03] md:grid-cols-[auto_1fr_1fr_auto] md:px-4">
            <it.icono size={36} className="text-naranja" />
            <h3 className="font-display text-3xl font-bold tracking-tight md:text-5xl">{it.t}</h3>
            <p className="max-w-md text-white/60">{it.d}</p>
            <span className="grid h-14 w-14 place-items-center rounded-full ring-1 ring-white/20 transition duration-500 group-hover:rotate-45 group-hover:bg-naranja group-hover:ring-naranja"><ArrowUpRight /></span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function DondeComprar() {
  const { s } = useStore()
  return (
    <section className="relative overflow-hidden border-t border-white/10 py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Etiqueta>Dónde comprar</Etiqueta>
            <h2 className="mt-6 font-display text-6xl font-extrabold leading-[.9] tracking-tighter md:text-8xl">Somos su proveedor, <span className="text-naranja">no su competidor.</span></h2>
          </div>
          <div className="self-end">
            <p className="text-lg text-white/65">SICHAR no le vende directo al consumidor final. Te inspiramos, te asesoramos y te conectamos con el distribuidor aliado de tu barrio: él te atiende, te entrega y te acompaña.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {SEDES.map((c) => (
                <Link key={c} to={`/donde-comprar?ciudad=${c}`} className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white hover:text-tinta">
                  <MapPin size={15} /> {c}
                  <span className="text-white/40">{s.distribuidores.filter((d) => d.aliado && d.ciudad === c).length}</span>
                </Link>
              ))}
            </div>
            <div className="mt-10"><BotonMagnetico to="/donde-comprar">Ver el mapa de aliados</BotonMagnetico></div>
          </div>
        </div>
      </div>
    </section>
  )
}
