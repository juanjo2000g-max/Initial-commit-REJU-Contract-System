import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Compass,
  Handshake,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Ruler,
  Sparkles,
  Store,
  Truck,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ambiente } from '../components/Ambiente'
import { Muestra } from '../components/Textura'
import { Logo } from '../components/ui'
import type { Ambiente as Amb, EventoAutomatizacion, Linea, Producto, Sede, Segmento } from '../data/types'
import { useStore } from '../lib/store'
import { SEDES, fmtCOP, waLink } from '../lib/util'

const LINEAS: { id: Linea | 'todas'; nombre: string }[] = [
  { id: 'todas', nombre: 'Todo' },
  { id: 'ceramica', nombre: 'Cerámicas y porcelanatos' },
  { id: 'bano', nombre: 'Baño' },
  { id: 'decorativo', nombre: 'Decorativos' },
  { id: 'remodelacion', nombre: 'Remodelación' },
]

const PROYECTOS = [
  { titulo: 'Spa en casa', lugar: 'Ciudad Jardín, Cali', credito: 'Instalado por Acabados del Valle', piso: 'p5', pared: 'p1', acento: 'p13', m2: 18 },
  { titulo: 'Lobby Hotel Ocre', lugar: 'San Antonio, Cali', credito: 'Diseño: Taller Ocre', piso: 'p8', pared: 'p3', acento: 'p14', m2: 240 },
  { titulo: 'Torres de Pance', lugar: 'Pance, Cali', credito: 'Constructora Bambú · 4.200 m²', piso: 'p4', pared: 'p7', acento: 'p9', m2: 4200 },
  { titulo: 'Cocina abierta', lugar: 'El Poblado, Medellín', credito: 'Pisos y Paredes Antioquia', piso: 'p6', pared: 'p2', acento: 'p12', m2: 42 },
]

export default function Landing() {
  const { s } = useStore()
  const P = (id: string) => s.productos.find((p) => p.id === id)!
  const [linea, setLinea] = useState<Linea | 'todas'>('todas')
  const [miProyecto, setMiProyecto] = useState<string[]>([])
  const [amb, setAmb] = useState<Amb>({ piso: 'p5', pared: 'p1', acento: 'p10', griferia: 'negro' })
  const [prefill, setPrefill] = useState<{ segmento?: Segmento; interes?: string }>({})

  // Con HashRouter, los enlaces #seccion cambiarían de ruta: se convierten en scroll suave.
  useEffect(() => {
    const f = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      const href = a?.getAttribute('href')
      if (!href || !href.startsWith('#') || href.startsWith('#/')) return
      e.preventDefault()
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    }
    document.addEventListener('click', f)
    window.scrollTo(0, 0)
    return () => document.removeEventListener('click', f)
  }, [])

  const toggle = (id: string) => setMiProyecto((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  const visibles = s.productos.filter((p) => linea === 'todas' || p.linea === linea)

  const cotizarAmbiente = () => {
    setMiProyecto((xs) => Array.from(new Set([...xs, amb.piso, amb.pared, amb.acento])))
    setPrefill({ segmento: 'hogar', interes: `Baño: piso ${P(amb.piso).nombre}, pared ${P(amb.pared).nombre}, acento ${P(amb.acento).nombre}, grifería ${amb.griferia}` })
    document.getElementById('cotizar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="overflow-x-hidden bg-hueso">
      <Nav cuenta={miProyecto.length} />
      <Hero insignias={s.productos.filter((p) => p.insignia)} />
      <Cinta productos={s.productos} />
      <Promesa />

      {/* Colecciones */}
      <section id="colecciones" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-semibold text-naranja">Colecciones 2026</p>
            <h2 className="mt-2 max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-6xl">Importado directo de 5 países. Sin intermediarios.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {LINEAS.map((l) => (
              <button key={l.id} onClick={() => setLinea(l.id)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${linea === l.id ? 'bg-tinta text-white' : 'bg-white ring-1 ring-black/10 hover:ring-black/30'}`}>
                {l.nombre}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visibles.map((p) => (
            <TarjetaProducto key={p.id} p={p} elegido={miProyecto.includes(p.id)} alternar={() => toggle(p.id)} />
          ))}
        </div>
      </section>

      {/* Simulador */}
      <section id="simulador" className="bg-tinta py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[1.35fr_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Ambiente piso={P(amb.piso)} pared={P(amb.pared)} acento={P(amb.acento)} griferia={amb.griferia} />
            <p className="mt-3 text-center text-xs text-white/40">Simulación ilustrativa. Pide muestras físicas antes de decidir.</p>
          </div>
          <div>
            <p className="font-semibold text-naranja">Simulador de ambientes</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Diseña tu baño en 30 segundos.</h2>
            <p className="mt-4 text-white/60">Combina pisos, paredes, acentos y grifería. Cuando te guste, lo cotizamos y te conectamos con el distribuidor aliado más cercano.</p>
            <Selector titulo="Piso" opciones={s.productos.filter((p) => p.linea === 'ceramica' && p.textura !== 'liso')} valor={amb.piso} elegir={(v) => setAmb({ ...amb, piso: v })} />
            <Selector titulo="Paredes" opciones={s.productos.filter((p) => p.linea === 'ceramica')} valor={amb.pared} elegir={(v) => setAmb({ ...amb, pared: v })} />
            <Selector titulo="Muro de acento" opciones={s.productos.filter((p) => ['ceramica', 'decorativo'].includes(p.linea) && p.unidad === 'm²')} valor={amb.acento} elegir={(v) => setAmb({ ...amb, acento: v })} />
            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Grifería</div>
              <div className="flex gap-2">
                {(['negro', 'cromo', 'dorado'] as const).map((g) => (
                  <button key={g} onClick={() => setAmb({ ...amb, griferia: g })} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold capitalize ring-1 transition ${amb.griferia === g ? 'bg-white text-tinta ring-white' : 'ring-white/20 hover:ring-white/50'}`}>
                    <span className="h-4 w-4 rounded-full" style={{ background: g === 'negro' ? '#111' : g === 'cromo' ? 'linear-gradient(135deg,#8d9198,#f5f6f7)' : 'linear-gradient(135deg,#9e7c3c,#f1d999)' }} />
                    {g === 'dorado' ? 'Oro cepillado' : g}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="btn-primario !px-6 !py-3.5 !text-base" onClick={cotizarAmbiente}>
                Cotizar este baño <ArrowRight size={18} />
              </button>
              <button
                className="btn !px-6 !py-3.5 !text-base text-white ring-1 ring-white/25 hover:bg-white/10"
                onClick={() => {
                  setPrefill({ segmento: 'arquitecto', interes: 'Asesoría de diseño sobre mi ambiente' })
                  document.getElementById('cotizar')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Sparkles size={18} /> Asesoría gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      <ParaQuien elegir={(seg, interes) => { setPrefill({ segmento: seg, interes }); document.getElementById('cotizar')?.scrollIntoView({ behavior: 'smooth' }) }} />

      {/* Proyectos */}
      <section id="proyectos" className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <p className="font-semibold text-naranja">Proyectos reales</p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl font-extrabold tracking-tight md:text-6xl">Hecho con SICHAR. Instalado por nuestros aliados.</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PROYECTOS.map((pr, i) => (
            <article key={pr.titulo} className={`group relative overflow-hidden rounded-3xl bg-tinta ${i % 3 === 0 ? 'md:row-span-1' : ''}`}>
              <div className="grid h-72 grid-cols-3 grid-rows-2 gap-1 transition duration-700 group-hover:scale-105 md:h-96">
                <Muestra p={P(pr.piso)} className="col-span-2 row-span-2 h-full w-full" escala={2.4} />
                <Muestra p={P(pr.pared)} className="h-full w-full" escala={1.4} />
                <Muestra p={P(pr.acento)} className="h-full w-full" escala={1.2} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-naranja-200"><MapPin size={14} /> {pr.lugar}</div>
                <h3 className="mt-1 font-display text-3xl font-bold">{pr.titulo}</h3>
                <p className="mt-1 text-sm text-white/70">{pr.credito} · {pr.m2.toLocaleString('es-CO')} m²</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <DondeComprar />
      <FormularioCotizacion miProyecto={miProyecto} quitar={toggle} prefill={prefill} />
      <Footer />
      <a href={waLink(s.config.whatsappSichar, 'Hola SICHAR, quiero información sobre sus acabados.')} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl animate-pulso" aria-label="WhatsApp">
        <MessageCircle size={26} />
      </a>
    </div>
  )
}

function Nav({ cuenta }: { cuenta: number }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-2xl bg-tinta/80 px-4 py-3 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:mx-8 md:px-6 lg:mx-auto">
        <a href="#top"><Logo claro /></a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 lg:flex">
          <a href="#colecciones" className="hover:text-white">Colecciones</a>
          <a href="#simulador" className="hover:text-white">Simulador</a>
          <a href="#profesionales" className="hover:text-white">Profesionales</a>
          <a href="#proyectos" className="hover:text-white">Proyectos</a>
          <a href="#donde-comprar" className="hover:text-white">Dónde comprar</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/portal" className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-white/60 hover:text-white md:block">Portal aliados</Link>
          <Link to="/app" className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-white/60 hover:text-white md:block">Equipo</Link>
          <a href="#cotizar" className="btn-primario !py-2">
            Cotizar {cuenta > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs text-naranja">{cuenta}</span>}
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero({ insignias }: { insignias: Producto[] }) {
  const [a, b, c] = insignias
  return (
    <section id="top" className="relative isolate overflow-hidden bg-tinta pb-24 pt-36 text-white md:pt-44">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_10%,rgba(244,121,32,.35),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(244,121,32,.15),transparent_50%)]" />
      <div className="absolute inset-0 -z-10 opacity-[.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-[1.15fr_1fr]">
        <div className="animate-entrar">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
            <span className="h-2 w-2 rounded-full bg-naranja" /> Nuevo · Porcelanato brillante 60x130
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[.95] tracking-tight sm:text-6xl md:text-7xl xl:text-8xl">
            Acabados que <span className="bg-gradient-to-r from-naranja to-amber-300 bg-clip-text text-transparent">cambian</span> cualquier espacio.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/65">Más de 20 años importando porcelanatos, grifería y decorativos de India, China, Brasil, España y Perú. Para tu casa, tu obra o tu próximo diseño.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#simulador" className="btn-primario !px-6 !py-3.5 !text-base">Diseña tu baño <ArrowRight size={18} /></a>
            <a href="#donde-comprar" className="btn !px-6 !py-3.5 !text-base text-white ring-1 ring-white/25 hover:bg-white/10"><MapPin size={18} /> Dónde comprar</a>
          </div>
          <dl className="mt-12 grid max-w-xl grid-cols-4 gap-4 border-t border-white/10 pt-6">
            {[['20+', 'años'], ['5', 'países de origen'], ['5', 'sedes'], ['12', 'aliados']].map(([n, t]) => (
              <div key={t}>
                <dt className="font-display text-3xl font-extrabold md:text-4xl">{n}</dt>
                <dd className="text-xs text-white/50">{t}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative mx-auto h-[420px] w-full max-w-md md:h-[520px]">
          <div className="absolute left-0 top-6 w-[58%] animate-flotar overflow-hidden rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,.8)] ring-1 ring-white/10 [transform:rotate(-8deg)]">
            <Muestra p={b} className="aspect-[60/130] w-full" escala={3} />
          </div>
          <div className="absolute right-0 top-0 w-[58%] animate-flotar overflow-hidden rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,.8)] ring-1 ring-white/10 [animation-delay:-2s] [transform:rotate(6deg)]">
            <Muestra p={a} className="aspect-[60/130] w-full" escala={3} />
          </div>
          <div className="absolute bottom-0 left-1/2 w-[46%] -translate-x-1/2 animate-flotar overflow-hidden rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,.8)] ring-1 ring-white/10 [animation-delay:-4s]">
            <Muestra p={c} className="aspect-square w-full" escala={3} />
          </div>
          <div className="absolute -right-2 bottom-24 rounded-2xl bg-white/95 p-3 text-tinta shadow-2xl md:-right-8">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-black/45">Producto insignia</div>
            <div className="font-display font-bold">Calacatta 60x130</div>
            <div className="text-xs text-black/55">Brillo espejo · gran formato</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Cinta({ productos }: { productos: Producto[] }) {
  const items = [...productos, ...productos]
  return (
    <div className="overflow-hidden border-y border-black/10 bg-naranja py-3 text-white">
      <div className="flex w-max animate-cinta gap-8 whitespace-nowrap font-display text-lg font-bold">
        {items.map((p, i) => (
          <span key={i} className="flex items-center gap-8">{p.nombre} <span className="text-white/50">✦</span></span>
        ))}
      </div>
    </div>
  )
}

function Promesa() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 md:px-8">
      <div className="grid gap-8 rounded-[2rem] bg-white p-8 ring-1 ring-black/5 md:grid-cols-[1.2fr_1fr] md:p-14">
        <div>
          <Handshake className="text-naranja" size={36} />
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl">“Somos su proveedor, no su competidor.”</h2>
          <p className="mt-4 text-lg text-black/60">Cuando compras SICHAR, compras en una ferretería o distribuidor de tu barrio. Nosotros te inspiramos y asesoramos; ellos te atienden, te entregan y te acompañan.</p>
        </div>
        <ul className="grid gap-3 self-center">
          {[
            [Store, 'Te conectamos con el aliado más cercano', 'Respuesta por WhatsApp el mismo día'],
            [Truck, 'Inventario en 5 sedes', 'Cali, Medellín, Bogotá, Barranquilla y Bucaramanga'],
            [BadgeCheck, 'Precio sugerido igual en todo el país', 'Sin sorpresas entre canales'],
          ].map(([I, t, d]) => {
            const Icono = I as typeof Store
            return (
              <li key={t as string} className="flex gap-4 rounded-2xl bg-hueso p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-naranja text-white"><Icono size={20} /></span>
                <div>
                  <div className="font-semibold">{t as string}</div>
                  <div className="text-sm text-black/55">{d as string}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function TarjetaProducto({ p, elegido, alternar }: { p: Producto; elegido: boolean; alternar: () => void }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden">
        <Muestra p={p} className="h-full w-full transition duration-500 group-hover:scale-110" escala={p.unidad === 'm²' ? 1.6 : 2.4} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          {p.insignia && <span className="chip bg-naranja text-white">Insignia</span>}
          {p.lineaDirecta && <span className="chip bg-tinta text-white">Colección proyecto</span>}
        </div>
        <button onClick={alternar} className={`absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full shadow-lg transition ${elegido ? 'bg-naranja text-white' : 'bg-white/90 text-tinta hover:bg-white'}`} aria-label="Agregar a mi proyecto">
          {elegido ? <Check size={18} /> : <Heart size={18} />}
        </button>
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-black/45">{p.formato} · {p.acabado} · Origen {p.origen}</div>
        <h3 className="mt-1 font-semibold leading-snug">{p.nombre}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-lg font-bold">{fmtCOP(p.pvpSugerido)}</span>
          <span className="text-xs text-black/45">/{p.unidad} · precio sugerido</span>
        </div>
      </div>
    </article>
  )
}

function Selector({ titulo, opciones, valor, elegir }: { titulo: string; opciones: Producto[]; valor: string; elegir: (id: string) => void }) {
  const actual = opciones.find((o) => o.id === valor)
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide text-white/50">
        {titulo} <span className="normal-case tracking-normal text-white/70">{actual?.nombre}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => (
          <button key={o.id} onClick={() => elegir(o.id)} title={o.nombre} className={`h-12 w-12 overflow-hidden rounded-xl ring-2 transition hover:scale-110 ${valor === o.id ? 'ring-naranja ring-offset-2 ring-offset-tinta' : 'ring-white/10'}`}>
            <Muestra p={o} className="h-full w-full" escala={0.9} />
          </button>
        ))}
      </div>
    </div>
  )
}

function ParaQuien({ elegir }: { elegir: (s: Segmento, interes: string) => void }) {
  const items: { seg: Segmento; icono: typeof Home; titulo: string; texto: string; puntos: string[]; cta: string; interes: string; oscuro?: boolean }[] = [
    { seg: 'hogar', icono: Home, titulo: 'Para tu hogar', texto: 'Remodela con acabados importados y compra en la ferretería de confianza de tu barrio.', puntos: ['Simulador de ambientes', 'Te conectamos con un aliado', 'Precio sugerido transparente'], cta: 'Quiero remodelar', interes: 'Remodelación de mi casa' },
    { seg: 'arquitecto', icono: Compass, titulo: 'Arquitectos y diseñadores', texto: 'La Mesa de Asesoría SICHAR trabaja contigo: muestras, fichas técnicas y colecciones de proyecto.', puntos: ['Kit de muestras sin costo', 'Asesoría de 30 minutos', 'Moodboards para tus clientes'], cta: 'Pedir kit de muestras', interes: 'Kit de muestras para proyecto', oscuro: true },
    { seg: 'constructora', icono: Building2, titulo: 'Constructoras', texto: 'Inventario para obra, entregas por etapas y cotización formal en menos de 48 horas.', puntos: ['Cotización < 48 h', 'Despachos programados', 'Respaldo de 5 sedes'], cta: 'Cotizar mi obra', interes: 'Proyecto de vivienda' },
    { seg: 'distribuidor', icono: Store, titulo: 'Distribuidores', texto: 'Únete al programa Distribuidor Aliado: referidos, muestrarios, capacitación y protección de proyectos.', puntos: ['Referidos de la web', 'Portal de pedidos 24/7', 'Proyectos protegidos'], cta: 'Ser aliado', interes: 'Quiero ser distribuidor aliado' },
  ]
  return (
    <section id="profesionales" className="mx-auto max-w-7xl px-4 pt-24 md:px-8">
      <p className="font-semibold text-naranja">Para quién</p>
      <h2 className="mt-2 max-w-3xl font-display text-4xl font-extrabold tracking-tight md:text-6xl">Una marca, cuatro formas de trabajar con nosotros.</h2>
      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((it) => (
          <div key={it.seg} className={`flex flex-col rounded-3xl p-6 ring-1 ${it.oscuro ? 'bg-naranja text-white ring-naranja' : 'bg-white ring-black/5'}`}>
            <it.icono size={30} className={it.oscuro ? '' : 'text-naranja'} />
            <h3 className="mt-5 font-display text-2xl font-bold">{it.titulo}</h3>
            <p className={`mt-2 text-sm ${it.oscuro ? 'text-white/85' : 'text-black/60'}`}>{it.texto}</p>
            <ul className="mt-5 grid gap-2 text-sm">
              {it.puntos.map((p) => (
                <li key={p} className="flex items-center gap-2"><Check size={16} className={it.oscuro ? '' : 'text-naranja'} /> {p}</li>
              ))}
            </ul>
            <button onClick={() => elegir(it.seg, it.interes)} className={`btn mt-auto !mt-8 w-full !py-3 ${it.oscuro ? 'bg-white text-naranja hover:bg-white/90' : 'bg-tinta text-white hover:bg-tinta-700'}`}>
              {it.cta} <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function DondeComprar() {
  const { s } = useStore()
  const [ciudad, setCiudad] = useState<Sede>('Cali')
  const lista = s.distribuidores.filter((d) => d.aliado && d.ciudad === ciudad)
  return (
    <section id="donde-comprar" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-semibold text-naranja">Dónde comprar</p>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-6xl">Tu aliado SICHAR está cerca.</h2>
            <p className="mt-4 text-black/60">Todos nuestros productos se venden a través de distribuidores y ferreterías aliadas, con el mismo precio sugerido y respaldo de fábrica.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {SEDES.map((c) => (
                <button key={c} onClick={() => setCiudad(c)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${ciudad === c ? 'bg-naranja text-white' : 'bg-hueso hover:bg-naranja-50'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {lista.map((d) => (
              <div key={d.id} className="flex flex-col rounded-2xl bg-hueso p-5 ring-1 ring-black/5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-lg font-bold">{d.nombre}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-sm text-black/55"><MapPin size={14} /> {d.barrio}, {d.ciudad}</div>
                  </div>
                  <span className={`chip ${d.nivel === 'Oro' ? 'bg-amber-200 text-amber-900' : d.nivel === 'Plata' ? 'bg-zinc-200 text-zinc-800' : 'bg-orange-100 text-orange-900'}`}>Aliado {d.nivel}</span>
                </div>
                <a href={waLink(d.telefono, `Hola ${d.nombre}, vi sus productos SICHAR en la web y quiero una cotización.`)} target="_blank" rel="noreferrer" className="btn mt-5 bg-[#25D366] text-white hover:brightness-95">
                  <MessageCircle size={16} /> Escribir por WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FormularioCotizacion({ miProyecto, quitar, prefill }: { miProyecto: string[]; quitar: (id: string) => void; prefill: { segmento?: Segmento; interes?: string } }) {
  const { s, crearLead, ultimosEventos } = useStore()
  const [segmento, setSegmento] = useState<Segmento>('hogar')
  const [form, setForm] = useState({ nombre: '', empresa: '', telefono: '', email: '', ciudad: 'Cali' as Sede, m2: '', interes: '' })
  const [resultado, setResultado] = useState<{ mensaje: string; leadId: string; eventos: EventoAutomatizacion[] } | null>(null)
  const [ultimoPrefill, setUltimoPrefill] = useState(prefill)
  if (prefill !== ultimoPrefill) {
    setUltimoPrefill(prefill)
    if (prefill.segmento) setSegmento(prefill.segmento)
    if (prefill.interes) setForm((f) => ({ ...f, interes: prefill.interes! }))
  }
  const productos = useMemo(() => miProyecto.map((id) => s.productos.find((p) => p.id === id)!).filter(Boolean), [miProyecto, s.productos])
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    const m2 = Number(form.m2) || undefined
    const interes = [form.interes, productos.length ? `Productos: ${productos.map((p) => p.nombre).join(', ')}` : ''].filter(Boolean).join(' · ')
    const r = crearLead({
      nombre: form.nombre,
      empresa: form.empresa || undefined,
      telefono: form.telefono,
      email: form.email || undefined,
      segmento,
      ciudad: form.ciudad,
      fuente: 'web',
      valor: Math.round((m2 ?? 20) * 95_000),
      interes: interes || 'Solicitud desde la web',
      m2,
    })
    setResultado({ mensaje: r.mensajeCliente, leadId: r.lead.id, eventos: [] })
  }

  const eventos = resultado ? ultimosEventos : []
  const segs: { id: Segmento; nombre: string; icono: typeof Home }[] = [
    { id: 'hogar', nombre: 'Mi hogar', icono: Home },
    { id: 'arquitecto', nombre: 'Soy arquitecto/a', icono: Compass },
    { id: 'constructora', nombre: 'Constructora', icono: Building2 },
    { id: 'distribuidor', nombre: 'Distribuidor', icono: Store },
  ]

  return (
    <section id="cotizar" className="relative isolate overflow-hidden bg-tinta py-24 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_0%,rgba(244,121,32,.3),transparent_50%)]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:px-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="font-semibold text-naranja">Cotiza sin compromiso</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-6xl">Cuéntanos tu proyecto.</h2>
          <p className="mt-4 text-white/60">Respondemos en menos de 2 horas hábiles. Si eres cliente final, te conectamos con el distribuidor aliado más cercano.</p>
          <div className="mt-8 grid gap-3 text-sm text-white/70">
            <div className="flex items-center gap-3"><Zap className="text-naranja" size={18} /> Asignación automática al responsable correcto</div>
            <div className="flex items-center gap-3"><Ruler className="text-naranja" size={18} /> Cálculo de materiales incluido</div>
            <div className="flex items-center gap-3"><MessageCircle className="text-naranja" size={18} /> Seguimiento por WhatsApp</div>
          </div>
          {productos.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Mi proyecto ({productos.length})</div>
              <ul className="mt-3 grid gap-2">
                {productos.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <Muestra p={p} className="h-10 w-10 rounded-lg" escala={0.8} />
                    <span className="flex-1 text-sm">{p.nombre}</span>
                    <button className="text-xs text-white/50 hover:text-white" onClick={() => quitar(p.id)}>Quitar</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-6 text-tinta shadow-2xl md:p-8">
          {resultado ? (
            <div className="animate-entrar">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Check size={28} /></div>
              <h3 className="mt-4 font-display text-3xl font-bold">¡Listo, {form.nombre.split(' ')[0]}!</h3>
              <p className="mt-2 text-lg text-black/65">{resultado.mensaje}</p>
              {eventos.length > 0 && (
                <div className="mt-6 rounded-2xl bg-hueso p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-naranja"><Zap size={14} /> Lo que pasó por dentro, en 1 segundo</div>
                  {eventos.map((ev) => (
                    <div key={ev.id} className="mt-3">
                      <div className="text-sm font-semibold">{ev.titulo}</div>
                      <ul className="mt-1 grid gap-1">
                        {ev.acciones.map((a) => (
                          <li key={a} className="flex items-start gap-2 text-sm text-black/60"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" /> {a}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={`/app/crm/${resultado.leadId}`} className="btn-oscuro">Ver el lead en el CRM <ArrowRight size={16} /></Link>
                <button className="btn-claro" onClick={() => { setResultado(null); setForm({ ...form, nombre: '', telefono: '', email: '', empresa: '', interes: '', m2: '' }) }}>Enviar otra</button>
              </div>
            </div>
          ) : (
            <form onSubmit={enviar} className="grid gap-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {segs.map((sg) => (
                  <button type="button" key={sg.id} onClick={() => setSegmento(sg.id)} className={`flex flex-col items-center gap-1 rounded-xl p-3 text-xs font-semibold ring-1 transition ${segmento === sg.id ? 'bg-naranja-50 text-naranja-700 ring-naranja' : 'ring-black/10 hover:ring-black/30'}`}>
                    <sg.icono size={20} /> {sg.nombre}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className="etiqueta">Nombre</span><input required className="campo" value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" /></label>
                <label><span className="etiqueta">WhatsApp</span><input required className="campo" value={form.telefono} onChange={set('telefono')} placeholder="300 123 4567" inputMode="tel" /></label>
                {segmento !== 'hogar' && (
                  <label className="sm:col-span-2"><span className="etiqueta">{segmento === 'arquitecto' ? 'Estudio' : 'Empresa'}</span><input className="campo" value={form.empresa} onChange={set('empresa')} placeholder={segmento === 'constructora' ? 'Ej. Constructora Bambú' : 'Nombre'} /></label>
                )}
                <label><span className="etiqueta">Ciudad</span>
                  <select className="campo" value={form.ciudad} onChange={set('ciudad')}>{SEDES.map((c) => <option key={c}>{c}</option>)}</select>
                </label>
                <label><span className="etiqueta">Metros aproximados</span><input className="campo" value={form.m2} onChange={set('m2')} placeholder="m²" inputMode="numeric" /></label>
              </div>
              <label><span className="etiqueta">¿Qué tienes en mente?</span><textarea className="campo min-h-24" value={form.interes} onChange={set('interes')} placeholder={segmento === 'constructora' ? 'Nombre de la obra, etapas, fechas…' : 'Ej. remodelar el baño principal con tonos cálidos'} /></label>
              <button className="btn-primario !py-3.5 !text-base">Enviar solicitud <ArrowRight size={18} /></button>
              <p className="text-center text-xs text-black/40">Al enviar aceptas que SICHAR y su distribuidor aliado te contacten. Tratamos tus datos según la Ley 1581 de 2012.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0b0b0b] py-14 text-white/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-8 px-4 md:px-8">
        <div>
          <Logo claro />
          <p className="mt-3 max-w-xs text-sm">Importación y distribución de acabados para la construcción. Cali · Medellín · Bogotá · Barranquilla · Bucaramanga.</p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="grid gap-2">
            <span className="font-semibold text-white">Clientes</span>
            <a href="#colecciones" className="hover:text-white">Colecciones</a>
            <a href="#simulador" className="hover:text-white">Simulador</a>
            <a href="#donde-comprar" className="hover:text-white">Dónde comprar</a>
          </div>
          <div className="grid gap-2">
            <span className="font-semibold text-white">Aliados</span>
            <Link to="/portal" className="hover:text-white">Portal distribuidores</Link>
            <Link to="/app" className="hover:text-white">Acceso equipo SICHAR</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl px-4 text-xs text-white/35 md:px-8">© 2026 SICHAR · Plataforma desarrollada por Pragmos · Prototipo con datos de demostración.</div>
    </footer>
  )
}
