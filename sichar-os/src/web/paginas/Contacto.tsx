import { Building2, Check, Compass, Home, MessageCircle, Store } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Muestra } from '../../components/Textura'
import type { EventoAutomatizacion, Sede, Segmento } from '../../data/types'
import { useStore } from '../../lib/store'
import { SEDES, waLink } from '../../lib/util'
import { Etiqueta } from '../comunes'
import { useMiProyecto } from '../ctx'

const SEGMENTOS: { id: Segmento; nombre: string; icono: typeof Home }[] = [
  { id: 'hogar', nombre: 'Para mi hogar', icono: Home },
  { id: 'arquitecto', nombre: 'Soy arquitecto/a', icono: Compass },
  { id: 'constructora', nombre: 'Constructora', icono: Building2 },
  { id: 'distribuidor', nombre: 'Distribuidor', icono: Store },
]

export default function Contacto() {
  const { s, crearLead, ultimosEventos } = useStore()
  const { ids, quitar, vaciar } = useMiProyecto()
  const [params] = useSearchParams()
  const [segmento, setSegmento] = useState<Segmento>('hogar')
  const [f, setF] = useState({ nombre: '', telefono: '', email: '', empresa: '', ciudad: 'Cali' as Sede, m2: '', mensaje: params.get('interes') ?? '' })
  const [res, setRes] = useState<{ mensaje: string; eventos: EventoAutomatizacion[] } | null>(null)
  const productos = ids.map((id) => s.productos.find((p) => p.id === id)).filter((p) => !!p)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const campo = 'w-full border-b border-white/15 bg-transparent py-4 text-xl outline-none transition placeholder:text-white/30 focus:border-naranja'

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    const m2 = Number(f.m2) || undefined
    const interes = [f.mensaje, productos.length ? `Productos: ${productos.map((p) => p.nombre).join(', ')}` : ''].filter(Boolean).join(' · ')
    const r = crearLead({ nombre: f.nombre, telefono: f.telefono, email: f.email || undefined, empresa: f.empresa || undefined, segmento, ciudad: f.ciudad, fuente: 'web', m2, valor: Math.round((m2 ?? 20) * 95_000), interes: interes || 'Solicitud desde la web' })
    setRes({ mensaje: r.mensajeCliente, eventos: [] })
    vaciar()
  }

  return (
    <div className="pt-36">
      <section className="mx-auto grid max-w-[1500px] gap-16 px-5 pb-32 md:px-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Etiqueta>Cotiza sin compromiso</Etiqueta>
          <h1 className="mt-6 font-display text-[14vw] font-extrabold leading-[.85] tracking-tighter md:text-[7vw]">Cuéntanos tu proyecto.</h1>
          <p className="mt-8 max-w-md text-lg text-white/60">Te respondemos en menos de 2 horas hábiles. Si es para tu hogar, te conectamos con el distribuidor aliado más cercano.</p>
          <a href={waLink(s.config.whatsappSichar, 'Hola SICHAR, quiero cotizar un proyecto.')} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-4 font-semibold text-white"><MessageCircle size={20} /> Prefiero WhatsApp</a>
          {productos.length > 0 && !res && (
            <div className="mt-12">
              <div className="text-xs font-semibold uppercase tracking-[.2em] text-white/40">Mi proyecto · {productos.length}</div>
              <div className="mt-4 grid gap-2">
                {productos.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-white/5 p-2 pr-4">
                    <Muestra p={p} className="h-14 w-14 rounded-xl" escala={1} />
                    <span className="flex-1 text-sm font-medium">{p.nombre}</span>
                    <button type="button" onClick={() => quitar(p.id)} className="text-xs text-white/40 hover:text-white">Quitar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {res ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[32px] bg-naranja p-8 text-tinta md:p-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="grid h-20 w-20 place-items-center rounded-full bg-tinta text-white"><Check size={40} /></motion.div>
              <h2 className="mt-8 font-display text-5xl font-extrabold tracking-tight">¡Listo, {f.nombre.split(' ')[0]}!</h2>
              <p className="mt-4 text-xl">{res.mensaje}</p>
              {ultimosEventos.length > 0 && (
                <div className="mt-8 rounded-2xl bg-black/10 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[.2em]">Lo que acaba de pasar</div>
                  <ul className="mt-3 grid gap-2">
                    {ultimosEventos.flatMap((ev) => ev.acciones).map((a, i) => (
                      <motion.li key={a} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }} className="flex items-start gap-2"><Check size={16} className="mt-1 shrink-0" /> {a}</motion.li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/espacios" className="rounded-full bg-tinta px-6 py-3.5 font-semibold text-white">Seguir diseñando</Link>
                <button onClick={() => setRes(null)} className="rounded-full px-6 py-3.5 font-semibold ring-1 ring-black/30">Enviar otra</button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="f" onSubmit={enviar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid content-start gap-2">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {SEGMENTOS.map((sg) => (
                  <button type="button" key={sg.id} onClick={() => setSegmento(sg.id)} className={`flex flex-col items-start gap-3 rounded-2xl p-4 text-left text-sm font-semibold transition ${segmento === sg.id ? 'bg-white text-tinta' : 'bg-white/[.04] text-white/70 ring-1 ring-white/10 hover:bg-white/[.08]'}`}>
                    <sg.icono size={22} className={segmento === sg.id ? 'text-naranja' : ''} /> {sg.nombre}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
                <input required className={campo} placeholder="Nombre" value={f.nombre} onChange={set('nombre')} />
                <input required className={campo} placeholder="WhatsApp" inputMode="tel" value={f.telefono} onChange={set('telefono')} />
                <input className={campo} placeholder="Correo (opcional)" type="email" value={f.email} onChange={set('email')} />
                {segmento !== 'hogar' ? <input className={campo} placeholder={segmento === 'arquitecto' ? 'Estudio' : 'Empresa'} value={f.empresa} onChange={set('empresa')} /> : <input className={campo} placeholder="m² aproximados" inputMode="numeric" value={f.m2} onChange={set('m2')} />}
                <select className={`${campo} sm:col-span-2`} value={f.ciudad} onChange={set('ciudad')}>{SEDES.map((c) => <option key={c} className="text-tinta">{c}</option>)}</select>
                <textarea className={`${campo} min-h-32 resize-none sm:col-span-2`} placeholder="¿Qué tienes en mente?" value={f.mensaje} onChange={set('mensaje')} />
              </div>
              <button className="group mt-8 flex items-center justify-between rounded-full bg-naranja px-8 py-5 text-lg font-semibold transition hover:bg-naranja-600">
                Enviar solicitud <span className="transition group-hover:translate-x-2">→</span>
              </button>
              <p className="mt-3 text-xs text-white/35">Al enviar aceptas que SICHAR y su distribuidor aliado te contacten. Tratamiento de datos según la Ley 1581 de 2012.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
