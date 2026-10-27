// Centro de mando: un solo punto desde el que se abre cada pieza para presentarla.
import { ArrowUpRight, Globe, LayoutDashboard, Presentation, RotateCcw, Store } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo-sichar.png'
import { Muestra } from '../components/Textura'
import { urlApp } from '../lib/apps'
import { useStore } from '../lib/store'

export default function Hub() {
  const { s, reiniciar } = useStore()
  const P = (id: string) => s.productos.find((p) => p.id === id)!
  const [reiniciado, setReiniciado] = useState(false)

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0b0b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_80%_-10%,rgba(244,121,32,.28),transparent_55%)]" />
      <div className="relative mx-auto max-w-[1500px] px-5 py-8 md:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-8" />
            <span className="font-display text-xl font-extrabold">SICHAR</span>
            <span className="text-white/30">×</span>
            <span className="font-display text-xl font-bold text-white/70">Pragmos</span>
          </div>
          <Link to="/presentacion" className="flex items-center gap-2 rounded-full bg-naranja px-5 py-2.5 text-sm font-semibold hover:bg-naranja-600"><Presentation size={16} /> Modo presentación</Link>
        </header>

        <section className="pb-16 pt-20 md:pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold uppercase tracking-[.3em] text-naranja">Proyecto EA · Centro de mando</motion.div>
          <h1 className="mt-6 font-display text-[16vw] font-extrabold leading-[.82] tracking-tighter md:text-[10vw]">
            {['SICHAR', 'Digital.'].map((l, k) => (
              <span key={l} className="block overflow-hidden">
                <motion.span className={`block ${k ? 'text-naranja' : ''}`} initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1 + k * 0.12, ease: [0.16, 1, 0.3, 1] }}>{l}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 max-w-xl text-lg text-white/60">
            Veinte años sin una página web. Hoy, cuatro piezas que trabajan juntas: lo que ve el cliente, lo que usa el equipo, lo que recibe el distribuidor y lo que decide la gerencia.
          </motion.p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Pieza
            n="01"
            icono={<Globe />}
            titulo="Sitio web"
            texto="Colecciones, simulador 3D en tiempo real, mapa de aliados, test de estilo y cotización conectada al CRM."
            href={urlApp('web')}
            grande
            vista={
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-gradient-to-br from-[#1b140f] to-[#0b0b0b]">
                {['p2', 'p1', 'p3'].map((id, k) => (
                  <motion.div key={id} className="w-[22%] overflow-hidden rounded-lg shadow-2xl" style={{ aspectRatio: '60/130', rotate: (k - 1) * 7, y: k === 1 ? -20 : 10 }} whileHover={{ y: -30 }}>
                    <Muestra p={P(id)} className="h-full w-full" escala={2.6} />
                  </motion.div>
                ))}
              </div>
            }
          />
          <Pieza n="02" icono={<LayoutDashboard />} titulo="SICHAR OS · CRM y gerencia" texto="Pipeline, cotizador con política de canal, costos de importación, semáforo de aliados y 8 automatizaciones." href={urlApp('crm')} vista={<Vista src={urlApp('crm')} />} />
          <Pieza n="03" icono={<Store />} titulo="Portal Distribuidor Aliado" texto="Los aliados reciben referidos de la web, hacen pedidos 24/7 y registran sus obras." href={urlApp('portal')} vista={<Vista src={urlApp('portal')} />} />
          <Pieza n="04" icono={<Presentation />} titulo="Presentación" texto="Diapositivas de la entrega final que abren cada pieza en vivo." to="/presentacion" naranja grande vista={<div className="absolute inset-0 grid place-items-center bg-naranja"><div className="font-display text-5xl font-extrabold leading-[.9] tracking-tighter text-tinta md:text-7xl">De voz a voz<br />a digital.</div></div>} />
        </section>

        <section className="mt-24 grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-display text-3xl font-bold">Recorrido sugerido</h2>
            <p className="mt-2 text-white/50">Un cliente, de principio a fin, en 5 minutos.</p>
            <button onClick={() => { reiniciar(); try { localStorage.removeItem('sichar-web:mi-proyecto'); sessionStorage.clear() } catch { /* nada */ } setReiniciado(true) }} className="mt-6 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ring-1 ring-white/20 hover:ring-white/50">
              <RotateCcw size={16} /> {reiniciado ? 'Datos reiniciados ✓' : 'Reiniciar datos de la demo'}
            </button>
          </div>
          <ol className="grid gap-2 sm:grid-cols-2">
            {[
              ['Diseña un baño en 3D', urlApp('web', '/espacios')],
              ['Cotízalo: llega solo al aliado', urlApp('web', '/contacto')],
              ['El aliado lo ve en su portal', urlApp('portal')],
              ['Cotización con política de canal', urlApp('crm', '/cotizaciones/nueva')],
              ['Adelanta 7 días y mira las alertas', urlApp('crm', '/automatizaciones')],
              ['La gerencia lo ve todo', urlApp('crm')],
            ].map(([t, h], k) => (
              <li key={t}>
                <a href={h} className="group flex items-center gap-4 rounded-2xl bg-white/[.04] p-4 ring-1 ring-white/10 transition hover:bg-white/[.08]">
                  <span className="font-display text-3xl font-extrabold text-naranja">{k + 1}</span>
                  <span className="flex-1 font-medium">{t}</span>
                  <ArrowUpRight size={18} className="text-white/40 transition group-hover:rotate-45 group-hover:text-white" />
                </a>
              </li>
            ))}
          </ol>
        </section>
        <footer className="mt-24 flex flex-wrap justify-between gap-4 border-t border-white/10 py-8 text-xs text-white/35">
          <span>Proyecto EA · Consultoría estratégica SICHAR · 2026</span>
          <span>Desarrollado por Pragmos · Prototipo con datos de demostración</span>
        </footer>
      </div>
    </div>
  )
}

function Pieza({ n, icono, titulo, texto, href, to, vista, grande = false, naranja = false }: { n: string; icono: ReactNode; titulo: string; texto: string; href?: string; to?: string; vista: ReactNode; grande?: boolean; naranja?: boolean }) {
  const contenido = (
    <>
      <div className="relative h-72 overflow-hidden md:h-96">{vista}</div>
      <div className="flex items-start justify-between gap-6 p-6 md:p-8">
        <div>
          <div className="flex items-center gap-3 text-white/40">
            <span className="font-mono text-sm">{n}</span>
            <span className="text-naranja [&>svg]:h-5 [&>svg]:w-5">{icono}</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">{titulo}</h2>
          <p className="mt-2 max-w-md text-white/55">{texto}</p>
        </div>
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full transition duration-500 group-hover:rotate-45 ${naranja ? 'bg-naranja' : 'bg-white text-tinta group-hover:bg-naranja group-hover:text-white'}`}><ArrowUpRight /></span>
      </div>
    </>
  )
  const clase = `group block overflow-hidden rounded-[28px] bg-white/[.04] ring-1 ring-white/10 transition hover:ring-white/30 ${grande ? 'lg:col-span-2' : ''}`
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={grande ? 'lg:col-span-2' : ''}>
      {to ? <Link to={to} className={clase}>{contenido}</Link> : <a href={href} className={clase}>{contenido}</a>}
    </motion.div>
  )
}

/** Vista previa en vivo de otra aplicación (iframe reducido, sin interacción). */
function Vista({ src }: { src: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F3F1EC]">
      <iframe src={src} title="Vista previa" loading="lazy" tabIndex={-1} className="pointer-events-none absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[.4] border-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition group-hover:opacity-0" />
    </div>
  )
}
