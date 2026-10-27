// Modo presentación para la entrega final: diapositivas que llevan a cada
// módulo en vivo. Flechas del teclado o clic para avanzar.
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { urlApp, type App } from '../lib/apps'
import { Muestra } from '../components/Textura'
import { Logo } from '../components/ui'
import { useStore } from '../lib/store'

const HALLAZGOS = [
  { n: 1, t: 'Riesgo de conflicto de canal', u: 'Crítica', solucion: 'Vitrina con «Dónde comprar», referidos automáticos, proyectos protegidos, guardia de precios y semáforo de canal.', ir: ['crm', '/canal'] as [App, string] },
  { n: 2, t: 'Alzas en costos de importación', u: 'Crítica', solucion: 'Costo puesto en bodega por referencia, simulador de alzas y TRM, proveedores alternos y lista de precios por escalones.', ir: ['crm', '/costos'] as [App, string] },
  { n: 3, t: 'Buyer persona no definido', u: 'Alta', solucion: 'Formulario único de visita, base de datos viva y buyer personas que se construyen con cada visita.', ir: ['crm', '/clientes'] as [App, string] },
  { n: 4, t: 'Baja madurez digital', u: 'Alta', solucion: 'CRM con pipeline, cotizador con PDF y WhatsApp, portal de pedidos y 8 automatizaciones.', ir: ['crm', '/pipeline'] as [App, string] },
  { n: 5, t: 'Falta de atención especializada', u: 'Media-alta', solucion: 'Mesa de Asesoría con simulador 3D de ambientes, tableros de inspiración y kits de muestras.', ir: ['web', '/espacios'] as [App, string] },
  { n: 6, t: 'Baja presencia en redes', u: 'Media', solucion: 'Calendario de contenido por pilares, generador de publicaciones y medición de leads desde redes.', ir: ['crm', '/contenido'] as [App, string] },
]

export default function Presentacion() {
  const { s } = useStore()
  const nav = useNavigate()
  const [i, setI] = useState(0)
  const P = (id: string) => s.productos.find((p) => p.id === id)!

  const slides: ReactNode[] = [
    <div key="0" className="grid h-full items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[.3em] text-naranja">Proyecto EA · Entrega final</div>
        <h1 className="mt-6 font-display text-6xl font-extrabold leading-[.95] tracking-tight md:text-8xl">De voz a voz a <span className="text-naranja">SICHAR OS</span>.</h1>
        <p className="mt-6 max-w-xl text-xl text-white/60">Un semestre de diagnóstico convertido en una plataforma que SICHAR puede usar desde el lunes.</p>
        <p className="mt-10 text-sm text-white/40">Isabella Ruiz · Juan José Giraldo · Martin Osorio · David Arias · Mariana Restrepo · Karen Carvajal</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['p1', 'p2', 'p8', 'p5'].map((id, k) => <Muestra key={id} p={P(id)} className={`aspect-square w-full rounded-2xl shadow-2xl ${k % 2 ? 'translate-y-8' : ''}`} escala={2.4} />)}
      </div>
    </div>,
    <div key="1" className="h-full">
      <div className="text-sm font-semibold uppercase tracking-[.3em] text-naranja">Lo que encontramos</div>
      <h2 className="mt-4 font-display text-5xl font-extrabold tracking-tight md:text-6xl">Seis hallazgos, en orden de prioridad.</h2>
      <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {HALLAZGOS.map((h) => (
          <div key={h.n} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between"><span className="font-display text-5xl font-extrabold text-naranja">{h.n}</span><span className={`chip ${h.u === 'Crítica' ? 'bg-red-600 text-white' : h.u === 'Alta' ? 'bg-amber-500 text-white' : 'bg-white/15 text-white'}`}>{h.u}</span></div>
            <div className="mt-3 text-lg font-semibold">{h.t}</div>
          </div>
        ))}
      </div>
    </div>,
    ...HALLAZGOS.map((h) => (
      <div key={`h${h.n}`} className="grid h-full content-center gap-8">
        <div className="text-sm font-semibold uppercase tracking-[.3em] text-naranja">Hallazgo {h.n} · urgencia {h.u}</div>
        <h2 className="font-display text-5xl font-extrabold tracking-tight md:text-7xl">{h.t}</h2>
        <div className="max-w-3xl rounded-3xl bg-white p-8 text-tinta">
          <div className="text-xs font-semibold uppercase tracking-wider text-naranja">Lo que construimos</div>
          <p className="mt-2 text-2xl font-medium leading-snug">{h.solucion}</p>
          <button onClick={() => (location.href = urlApp(...h.ir))} className="btn-primario mt-6 !px-6 !py-3 !text-base">Verlo funcionando <ExternalLink size={18} /></button>
        </div>
      </div>
    )),
    <div key="demo" className="h-full">
      <div className="text-sm font-semibold uppercase tracking-[.3em] text-naranja">Demo en vivo · 5 minutos</div>
      <h2 className="mt-4 font-display text-5xl font-extrabold tracking-tight">Un cliente, de principio a fin.</h2>
      <ol className="mt-10 grid gap-3 md:grid-cols-2">
        {[
          ['Diseña un baño en 3D en el sitio web', urlApp('web', '/espacios'), 'El cliente combina piso, pared, grifería y luz, y lo cotiza.'],
          ['Envía la solicitud', urlApp('web', '/contacto'), 'En 1 segundo se asigna al distribuidor aliado de su ciudad.'],
          ['El aliado lo recibe en su portal', urlApp('portal'), 'Contacta por WhatsApp y marca la venta.'],
          ['Cotización con política de canal', urlApp('crm', '/cotizaciones/nueva'), 'El sistema bloquea precios por debajo del PVP sugerido.'],
          ['Adelanta 7 días', urlApp('crm', '/automatizaciones'), 'Las reglas detectan leads sin respuesta, inventario bajo y aliados en riesgo.'],
          ['La gerencia lo ve todo', urlApp('crm'), 'Tablero con semáforo, metas e indicadores del informe.'],
        ].map(([t, to, d], k) => (
          <li key={t}>
            <a href={to} className="flex gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition hover:bg-white/10">
              <span className="font-display text-4xl font-extrabold text-naranja">{k + 1}</span>
              <div><div className="text-lg font-semibold">{t}</div><div className="text-sm text-white/55">{d}</div></div>
            </a>
          </li>
        ))}
      </ol>
    </div>,
    <div key="ruta" className="h-full">
      <div className="text-sm font-semibold uppercase tracking-[.3em] text-naranja">Cómo se implementa</div>
      <h2 className="mt-4 font-display text-5xl font-extrabold tracking-tight">Por etapas. Cada una se paga con la anterior.</h2>
      <div className="mt-10 grid gap-3 md:grid-cols-4">
        {[
          ['Mes 1', 'Ordenar la casa', 'Cargar productos, precios y clientes reales. CRM y cotizador en uso en Cali.'],
          ['Meses 2–3', 'Canal primero', 'Política de canal firmada, portal de aliados y referidos automáticos.'],
          ['Meses 4–6', 'Abrir la puerta', 'Vitrina pública, WhatsApp Business API y Mesa de Asesoría en Cali.'],
          ['Meses 7–12', 'Escalar', 'Las 5 sedes, integración con facturación e inventario, tablero mensual.'],
        ].map(([m, t, d]) => (
          <div key={m} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-naranja">{m}</div>
            <div className="mt-2 font-display text-2xl font-bold">{t}</div>
            <p className="mt-2 text-sm text-white/60">{d}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-white/50">Desarrollo e implementación: <b className="text-white">Pragmos</b>. Propuesta económica por separado.</p>
    </div>,
    <div key="fin" className="grid h-full content-center justify-items-center text-center">
      <Logo claro className="scale-150" />
      <h2 className="mt-10 max-w-4xl font-display text-5xl font-extrabold tracking-tight md:text-7xl">“Somos su proveedor, <span className="text-naranja">no su competidor</span>.”</h2>
      <p className="mt-6 max-w-2xl text-xl text-white/60">Ahora, con la tecnología para cumplirlo en cada venta.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a href={urlApp('web')} className="btn-primario !px-6 !py-3 !text-base">Abrir el sitio web</a>
        <a href={urlApp('crm')} className="btn !px-6 !py-3 !text-base text-white ring-1 ring-white/25 hover:bg-white/10">Abrir SICHAR OS</a>
      </div>
    </div>,
  ]

  const ir = useCallback((d: number) => setI((x) => Math.max(0, Math.min(slides.length - 1, x + d))), [slides.length])
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
      if (e.key === 'Escape') nav('/')
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [ir, nav])

  return (
    <div className="relative min-h-screen overflow-hidden bg-tinta text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(244,121,32,.28),transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 md:px-12">
        <div className="flex items-center justify-between">
          <Logo claro />
          <Link to="/" className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Salir"><X /></Link>
        </div>
        <div key={i} className="flex-1 animate-entrar py-10">{slides[i]}</div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">{slides.map((_, k) => <button key={k} onClick={() => setI(k)} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-8 bg-naranja' : 'w-3 bg-white/20'}`} aria-label={`Diapositiva ${k + 1}`} />)}</div>
          <div className="flex gap-2">
            <button className="rounded-xl p-3 ring-1 ring-white/20 hover:bg-white/10 disabled:opacity-30" disabled={i === 0} onClick={() => ir(-1)}><ArrowLeft /></button>
            <button className="rounded-xl bg-naranja p-3 hover:bg-naranja-600 disabled:opacity-30" disabled={i === slides.length - 1} onClick={() => ir(1)}><ArrowRight /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
