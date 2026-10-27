import { Check, Compass, Download, Building2, Store } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Muestra } from '../../components/Textura'
import type { Sede, Segmento } from '../../data/types'
import { urlApp } from '../../lib/apps'
import { useStore } from '../../lib/store'
import { SEDES } from '../../lib/util'
import { BotonMagnetico, Etiqueta, Revelar } from '../comunes'

export default function Profesionales() {
  const loc = useLocation()
  useEffect(() => {
    if (loc.hash) setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 400)
  }, [loc.hash])
  return (
    <div className="pt-36">
      <section className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Etiqueta>Profesionales</Etiqueta>
        <h1 className="mt-6 max-w-6xl font-display text-[13vw] font-extrabold leading-[.85] tracking-tighter md:text-[7.5vw]">Para los que construyen, diseñan y venden.</h1>
        <div className="mt-12 flex flex-wrap gap-3">
          {[['#arquitectos', 'Arquitectos y diseñadores'], ['#constructoras', 'Constructoras'], ['#distribuidores', 'Distribuidores']].map(([h, t]) => (
            <button key={h} onClick={() => document.getElementById(h.slice(1))?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full px-5 py-3 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white hover:text-tinta">{t}</button>
          ))}
        </div>
      </section>
      <Arquitectos />
      <Constructoras />
      <Distribuidores />
    </div>
  )
}

function Arquitectos() {
  const { s } = useStore()
  const [elegidos, setElegidos] = useState<string[]>(['p1', 'p3', 'p8'])
  const opciones = s.productos.filter((p) => p.unidad === 'm²' && p.linea !== 'remodelacion')
  const descargarCatalogo = () => {
    const filas = [['Referencia', 'Producto', 'Línea', 'Formato', 'Acabado', 'Origen', 'Unidad', 'Precio sugerido'], ...s.productos.map((p) => [p.ref, p.nombre, p.linea, p.formato, p.acabado, p.origen, p.unidad, p.pvpSugerido])]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + filas.map((f) => f.join(';')).join('\n')], { type: 'text/csv' }))
    a.download = 'catalogo-tecnico-sichar.csv'
    a.click()
  }
  return (
    <section id="arquitectos" className="mx-auto max-w-[1500px] scroll-mt-28 px-5 py-32 md:px-10">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <Compass size={44} className="text-naranja" />
          <h2 className="mt-6 font-display text-5xl font-extrabold leading-[.95] tracking-tighter md:text-7xl">Mesa de Asesoría SICHAR</h2>
          <p className="mt-6 max-w-lg text-lg text-white/60">Una asesora de diseño trabaja contigo: muestras físicas, fichas técnicas y tableros de inspiración para presentarle a tu cliente. La compra se hace a través del distribuidor aliado que prefieras.</p>
          <ul className="mt-10 grid gap-4">
            {['Kit de muestras sin costo, en tu estudio en 48 horas', 'Asesoría de 30 minutos, presencial o virtual', 'Tableros de inspiración en 3D para tus clientes', 'Colecciones de proyecto exclusivas (Línea Directa)'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-lg"><span className="grid h-7 w-7 place-items-center rounded-full bg-naranja/15 text-naranja"><Check size={15} /></span>{t}</li>
            ))}
          </ul>
          <button onClick={descargarCatalogo} className="mt-10 flex items-center gap-2 font-semibold text-naranja hover:text-white"><Download size={18} /> Descargar catálogo técnico</button>
        </div>
        <Revelar>
          <div className="rounded-[32px] bg-white/[.04] p-6 ring-1 ring-white/10 md:p-8">
            <h3 className="font-display text-3xl font-bold">Arma tu kit de muestras</h3>
            <p className="mt-2 text-sm text-white/50">Elige hasta 5 referencias.</p>
            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {opciones.map((p) => {
                const on = elegidos.includes(p.id)
                return (
                  <button key={p.id} title={p.nombre} onClick={() => setElegidos(on ? elegidos.filter((x) => x !== p.id) : elegidos.length < 5 ? [...elegidos, p.id] : elegidos)} className={`relative aspect-square overflow-hidden rounded-xl ring-2 transition ${on ? 'ring-naranja' : 'ring-transparent opacity-60 hover:opacity-100'}`}>
                    <Muestra p={p} className="h-full w-full" escala={1} />
                    {on && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-naranja"><Check size={12} /></span>}
                  </button>
                )
              })}
            </div>
            <Formulario segmento="arquitecto" boton="Pedir mi kit de muestras" interes={`Kit de muestras: ${elegidos.map((id) => s.productos.find((p) => p.id === id)!.nombre).join(', ')}`} campoEmpresa="Estudio" />
          </div>
        </Revelar>
      </div>
    </section>
  )
}

function Constructoras() {
  const pasos = [
    ['Envía tus planos', 'Por WhatsApp o correo. Con m² y etapas de la obra.'],
    ['Cotización en 48 h', 'Formal, por etapas y con precio estable para todo el proyecto.'],
    ['Muestras y aprobación', 'Llevamos muestras a obra y a la sala de ventas.'],
    ['Despachos por etapas', 'Desde la sede más cercana, cuando la obra lo necesita.'],
    ['Posventa', 'Acompañamos a los propietarios en remodelaciones futuras.'],
  ]
  return (
    <section id="constructoras" className="scroll-mt-28 bg-[#f4f1ec] py-32 text-tinta">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Building2 size={44} className="text-naranja" />
        <h2 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[.95] tracking-tighter md:text-7xl">Inventario para obra. Cumplimiento por etapas.</h2>
        <div className="mt-20 grid gap-6 md:grid-cols-5">
          {pasos.map(([t, d], k) => (
            <Revelar key={t} retraso={k * 0.08}>
              <div className="relative border-t-2 border-tinta pt-6">
                <motion.span className="absolute -top-[2px] left-0 h-[2px] bg-naranja" initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 + k * 0.2 }} />
                <div className="font-display text-5xl font-extrabold text-naranja">0{k + 1}</div>
                <div className="mt-3 text-xl font-bold">{t}</div>
                <p className="mt-2 text-black/60">{d}</p>
              </div>
            </Revelar>
          ))}
        </div>
        <div className="mt-20 grid gap-10 rounded-[32px] bg-tinta p-6 text-white md:p-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h3 className="font-display text-4xl font-bold">Cotiza tu obra</h3>
            <p className="mt-3 text-white/60">Si un distribuidor aliado ya atiende tu proyecto, te conectamos con él: así protegemos a nuestro canal.</p>
          </div>
          <Formulario segmento="constructora" boton="Solicitar cotización de obra" campoEmpresa="Constructora" pideM2 />
        </div>
      </div>
    </section>
  )
}

function Distribuidores() {
  const niveles = [
    ['Bronce', 'Referidos de la web en tu zona', 'Portal de pedidos 24/7', 'Capacitación técnica'],
    ['Plata', 'Todo lo de Bronce', '3 % de beneficio en pedidos', 'Muestrario con imagen SICHAR'],
    ['Oro', 'Todo lo de Plata', '5 % de beneficio en pedidos', 'Prioridad en referidos y proyectos protegidos'],
  ]
  return (
    <section id="distribuidores" className="mx-auto max-w-[1500px] scroll-mt-28 px-5 py-32 md:px-10">
      <Store size={44} className="text-naranja" />
      <h2 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[.95] tracking-tighter md:text-7xl">Programa Distribuidor Aliado</h2>
      <p className="mt-6 max-w-2xl text-lg text-white/60">Nuestra web no te compite: te manda clientes. Cada persona que cotiza en la web de SICHAR desde tu zona llega a tu WhatsApp como referido.</p>
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        {niveles.map(([n, ...b], k) => (
          <Revelar key={n} retraso={k * 0.1}>
            <div className={`h-full rounded-[28px] p-8 ring-1 ${k === 2 ? 'bg-naranja text-tinta ring-naranja' : 'bg-white/[.04] ring-white/10'}`}>
              <div className="text-sm font-semibold uppercase tracking-[.2em] opacity-70">Aliado</div>
              <div className="mt-1 font-display text-5xl font-extrabold">{n}</div>
              <ul className="mt-8 grid gap-3">
                {b.map((x) => <li key={x} className="flex items-start gap-3"><Check size={18} className="mt-0.5 shrink-0" /> {x}</li>)}
              </ul>
            </div>
          </Revelar>
        ))}
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h3 className="font-display text-3xl font-bold">¿Ya eres aliado?</h3>
          <p className="mt-2 text-white/60">Haz pedidos, revisa tus referidos y registra tus obras.</p>
          <div className="mt-6"><BotonMagnetico href={urlApp('portal')} variante="blanco">Entrar al portal</BotonMagnetico></div>
        </div>
        <div className="rounded-[28px] bg-white/[.04] p-6 ring-1 ring-white/10 md:p-8">
          <h3 className="font-display text-2xl font-bold">Quiero ser aliado</h3>
          <Formulario segmento="distribuidor" boton="Enviar solicitud" campoEmpresa="Ferretería o depósito" interes="Quiero ser distribuidor aliado" />
        </div>
      </div>
    </section>
  )
}

function Formulario({ segmento, boton, campoEmpresa, interes = '', pideM2 = false }: { segmento: Segmento; boton: string; campoEmpresa: string; interes?: string; pideM2?: boolean }) {
  const { crearLead } = useStore()
  const [f, setF] = useState({ nombre: '', empresa: '', telefono: '', ciudad: 'Cali' as Sede, m2: '', detalle: '' })
  const [ok, setOk] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const campo = 'w-full rounded-2xl bg-white/5 px-4 py-3.5 text-white outline-none ring-1 ring-white/10 transition placeholder:text-white/35 focus:ring-naranja'
  if (ok)
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl bg-emerald-500/10 p-5 text-emerald-200 ring-1 ring-emerald-500/30">
        <div className="font-semibold text-white">¡Recibido!</div>
        <p className="mt-1">{ok}</p>
      </motion.div>
    )
  return (
    <form
      className="mt-6 grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        const m2 = Number(f.m2) || undefined
        const r = crearLead({ nombre: f.nombre, empresa: f.empresa || undefined, telefono: f.telefono, segmento, ciudad: f.ciudad, fuente: 'web', m2, valor: Math.round((m2 ?? 60) * 90_000), interes: [interes, f.detalle].filter(Boolean).join(' · ') || 'Solicitud desde la web' })
        setOk(r.mensajeCliente)
      }}
    >
      <input required className={campo} placeholder="Tu nombre" value={f.nombre} onChange={set('nombre')} />
      <input required className={campo} placeholder="WhatsApp" inputMode="tel" value={f.telefono} onChange={set('telefono')} />
      <input className={campo} placeholder={campoEmpresa} value={f.empresa} onChange={set('empresa')} />
      <select className={campo} value={f.ciudad} onChange={set('ciudad')}>{SEDES.map((c) => <option key={c} className="text-tinta">{c}</option>)}</select>
      {pideM2 && <input className={campo} placeholder="m² aproximados" inputMode="numeric" value={f.m2} onChange={set('m2')} />}
      <input className={`${campo} ${pideM2 ? '' : 'sm:col-span-2'}`} placeholder={segmento === 'constructora' ? 'Nombre de la obra y etapas' : 'Cuéntanos más (opcional)'} value={f.detalle} onChange={set('detalle')} />
      <button className="rounded-full bg-naranja py-4 font-semibold text-white transition hover:bg-naranja-600 sm:col-span-2">{boton}</button>
    </form>
  )
}
