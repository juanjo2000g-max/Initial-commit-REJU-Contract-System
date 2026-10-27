import { ArrowLeft, ClipboardList, FilePlus2, Mail, MessageCircle, Phone, Send, Store, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChipSegmento, ETAPAS, Modal, Vacio, useAviso } from '../../components/ui'
import type { Actividad, Etapa, Segmento } from '../../data/types'
import { useResponsable, useStore } from '../../lib/store'
import { fmtCOP, fmtFecha, haceCuanto, uid, waLink } from '../../lib/util'

const ICONO: Record<Actividad['tipo'], string> = {
  nota: '📝', llamada: '📞', whatsapp: '💬', visita: '🚗', email: '✉️', sistema: '⚙️', cotizacion: '📄', automatizacion: '⚡',
}

export default function LeadDetalle() {
  const { id } = useParams()
  const { s, ahora, cambiar } = useStore()
  const responsable = useResponsable()
  const aviso = useAviso()
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<Actividad['tipo']>('nota')
  const [visita, setVisita] = useState(false)
  const l = s.leads.find((x) => x.id === id)
  if (!l) return <Vacio texto="Este lead no existe (¿reiniciaste la demo?)." />

  const cots = s.cotizaciones.filter((q) => q.leadId === l.id)
  const dist = l.asignadoTipo === 'distribuidor' ? s.distribuidores.find((d) => d.id === l.asignadoId) : undefined
  const nombre1 = l.nombre.split(' ')[0]

  const plantillas = [
    { t: 'Saludo', m: `Hola ${nombre1}, te saluda el equipo SICHAR. Recibimos tu solicitud sobre "${l.interes}". ¿Nos compartes medidas o fotos del espacio?` },
    { t: 'Kit de muestras', m: `Hola ${nombre1}, queremos enviarte un kit de muestras SICHAR sin costo. ¿A qué dirección lo llevamos?` },
    { t: 'Seguimiento', m: `Hola ${nombre1}, ¿pudiste revisar la cotización? Si quieres ajustamos referencias o cantidades.` },
  ]

  const registrar = (t: Actividad['tipo'], txt: string) =>
    cambiar((c) => {
      const x = c.s.leads.find((y) => y.id === l.id)!
      x.actividades.push({ id: uid('a'), fecha: c.ahora, tipo: t, texto: txt, autor: 'Gerencia' })
      x.actualizado = c.ahora
      if (t !== 'nota') x.primeraRespuesta ??= c.ahora
      if (x.etapa === 'nuevo' && t !== 'nota') x.etapa = 'contactado'
      x.etiquetas = x.etiquetas.filter((e) => e !== 'Sin respuesta 24h')
    })

  return (
    <div className="grid gap-5 animate-entrar">
      <Link to="/pipeline" className="flex w-fit items-center gap-1 text-sm text-white/50 hover:text-white"><ArrowLeft size={16} /> Pipeline</Link>
      <div className="tarjeta flex flex-wrap items-start justify-between gap-4 p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ChipSegmento segmento={l.segmento} />
            <span className="chip bg-white/5 text-white/60">{l.ciudad}</span>
            <span className="chip bg-white/5 text-white/60 capitalize">Fuente: {l.fuente}</span>
            {l.etiquetas.map((e) => <span key={e} className="chip bg-naranja/15 text-naranja-200">{e}</span>)}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{l.empresa ?? l.nombre}</h1>
          {l.empresa && <p className="text-white/55">{l.nombre}</p>}
          <p className="mt-2 max-w-2xl text-sm text-white/65">{l.interes}</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/45">Valor estimado</div>
          <div className="font-display text-3xl font-bold">{fmtCOP(l.valor)}</div>
          {l.m2 && <div className="text-sm text-white/50">{l.m2.toLocaleString('es-CO')} m²</div>}
        </div>
        <div className="flex w-full flex-wrap gap-1 border-t border-white/5 pt-4">
          {ETAPAS.map((e) => (
            <button
              key={e.id}
              onClick={() => cambiar((c) => { const x = c.s.leads.find((y) => y.id === l.id)!; x.etapa = e.id as Etapa; x.actualizado = c.ahora; x.actividades.push({ id: uid('a'), fecha: c.ahora, tipo: 'sistema', texto: `Etapa → ${e.nombre}`, autor: 'Gerencia' }) })}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${l.etapa === e.id ? 'bg-white text-tinta' : 'bg-white/[.04] text-white/55 hover:bg-white/[.08]'}`}
            >
              {e.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          <div className="tarjeta p-5">
            <div className="flex flex-wrap gap-2">
              {(['nota', 'llamada', 'whatsapp', 'visita', 'email'] as const).map((t) => (
                <button key={t} onClick={() => setTipo(t)} className={`chip !px-3 !py-1 capitalize ring-1 ${tipo === t ? 'bg-white text-tinta ring-white' : 'ring-white/10'}`}>{ICONO[t]} {t}</button>
              ))}
            </div>
            <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!texto.trim()) return; registrar(tipo, texto); setTexto('') }}>
              <input className="campo" placeholder="¿Qué pasó? Ej. Llamé, pidió muestras del Calacatta…" value={texto} onChange={(e) => setTexto(e.target.value)} />
              <button className="btn-oscuro"><Send size={16} /></button>
            </form>
            <ol className="relative mt-6 grid gap-4 border-l-2 border-white/5 pl-6">
              {[...l.actividades].reverse().map((a) => (
                <li key={a.id} className="relative">
                  <span className={`absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full text-sm ring-4 ring-white ${a.tipo === 'automatizacion' ? 'bg-naranja/15' : 'bg-white/[.04]'}`}>{ICONO[a.tipo]}</span>
                  <div className={`text-sm ${a.tipo === 'automatizacion' ? 'font-medium text-naranja-200' : ''}`}>{a.texto}</div>
                  <div className="text-xs text-white/40">{a.autor} · {fmtFecha(a.fecha, true)} · {haceCuanto(a.fecha, ahora)}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid content-start gap-5">
          <div className="tarjeta p-5">
            <h2 className="font-semibold">Contacto</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <a className="flex items-center gap-2 hover:text-naranja" href={`tel:${l.telefono}`} onClick={() => registrar('llamada', 'Llamada saliente')}><Phone size={15} /> {l.telefono}</a>
              {l.email && <a className="flex items-center gap-2 hover:text-naranja" href={`mailto:${l.email}`}><Mail size={15} /> {l.email}</a>}
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/45">WhatsApp en un clic</div>
            <div className="mt-2 grid gap-1.5">
              {plantillas.map((p) => (
                <a key={p.t} href={waLink(l.telefono, p.m)} target="_blank" rel="noreferrer" onClick={() => registrar('whatsapp', `WhatsApp enviado: ${p.t}`)} className="flex items-center gap-2 rounded-xl bg-[#25D366]/10 px-3 py-2 text-sm font-medium text-[#128C4B] hover:bg-[#25D366]/20">
                  <MessageCircle size={15} /> {p.t}
                </a>
              ))}
            </div>
          </div>

          <div className="tarjeta p-5">
            <h2 className="font-semibold">Responsable</h2>
            <div className="mt-2 flex items-center gap-2 text-sm">
              {l.asignadoTipo === 'distribuidor' && <Store size={16} className="text-naranja" />}
              <span className="font-medium">{responsable(l)}</span>
              <span className="text-white/40">({l.asignadoTipo})</span>
            </div>
            {dist && (
              <div className="mt-3 rounded-xl bg-naranja/10 p-3 text-xs text-naranja-200">
                <Zap size={12} className="mb-1 inline" /> Referido entregado a un aliado. SICHAR acompaña pero no vende directo (política de canal).
                <a href={waLink(dist.telefono, `Hola ${dist.contacto.split(' ')[0]}, ¿cómo vas con el referido ${l.nombre}? ¿Necesitas muestras o apoyo técnico de SICHAR?`)} target="_blank" rel="noreferrer" className="mt-2 block font-semibold underline">Escribirle a {dist.nombre}</a>
              </div>
            )}
            <select
              className="campo mt-3"
              value={`${l.asignadoTipo}:${l.asignadoId ?? ''}`}
              onChange={(e) => {
                const [t, idr] = e.target.value.split(':')
                cambiar((c) => { const x = c.s.leads.find((y) => y.id === l.id)!; x.asignadoTipo = t as typeof x.asignadoTipo; x.asignadoId = idr; x.actividades.push({ id: uid('a'), fecha: c.ahora, tipo: 'sistema', texto: 'Responsable reasignado', autor: 'Gerencia' }) })
                aviso({ titulo: 'Responsable actualizado', tipo: 'info' })
              }}
            >
              <optgroup label="Equipo SICHAR">
                {s.vendedores.map((v) => <option key={v.id} value={`${v.id === 'a1' ? 'asesor' : 'vendedor'}:${v.id}`}>{v.nombre} · {v.sede}</option>)}
              </optgroup>
              <optgroup label="Distribuidores aliados">
                {s.distribuidores.filter((d) => d.aliado).map((d) => <option key={d.id} value={`distribuidor:${d.id}`}>{d.nombre} · {d.ciudad}</option>)}
              </optgroup>
            </select>
          </div>

          <div className="tarjeta p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Cotizaciones</h2>
              <Link to={`/cotizaciones/nueva?lead=${l.id}`} className="btn-primario !px-3 !py-1.5 !text-xs"><FilePlus2 size={14} /> Nueva</Link>
            </div>
            <div className="mt-3 grid gap-2">
              {cots.map((q) => (
                <Link key={q.id} to={`/cotizaciones/${q.id}`} className="flex items-center justify-between rounded-xl bg-white/[.04] px-3 py-2 text-sm hover:bg-white/5">
                  <span className="font-medium">{q.numero}</span>
                  <span className="text-xs capitalize text-white/50">{q.estado}</span>
                  <span className="font-semibold">{fmtCOP(q.items.reduce((a, it) => a + it.cantidad * it.precio * (1 - it.descuento), 0))}</span>
                </Link>
              ))}
              {cots.length === 0 && <p className="text-sm text-white/45">Sin cotizaciones aún.</p>}
            </div>
          </div>

          <button className="btn-claro" onClick={() => setVisita(true)}><ClipboardList size={16} /> Registrar visita (formulario único)</button>
        </div>
      </div>
      <FormularioVisita abierto={visita} cerrar={() => setVisita(false)} leadId={l.id} segmento={l.segmento} />
    </div>
  )
}

export function FormularioVisita({ abierto, cerrar, leadId, segmento }: { abierto: boolean; cerrar: () => void; leadId?: string; segmento: Segmento }) {
  const { s, cambiar } = useStore()
  const aviso = useAviso()
  const [f, setF] = useState({ vendedorId: 'v1', quienDecide: '', queNecesita: '', queLoFrena: '', dondeSeInforma: '', proximoPaso: '' })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const campos: [keyof typeof f, string, string][] = [
    ['quienDecide', '¿Quién decide la compra?', 'Ej. arquitecta del proyecto'],
    ['queNecesita', '¿Qué necesita?', 'Ej. entrega por etapas'],
    ['queLoFrena', '¿Qué lo frena?', 'Ej. tiempos de cotización'],
    ['dondeSeInforma', '¿Dónde se informa?', 'Ej. Instagram, ferias'],
    ['proximoPaso', 'Próximo paso', 'Ej. llevar kit de muestras'],
  ]
  return (
    <Modal abierto={abierto} cerrar={cerrar} titulo="Formulario de visita">
      <p className="mb-4 text-sm text-white/55">Las mismas 5 preguntas en cada visita alimentan los buyer personas (hallazgo 3).</p>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          cambiar((c) => {
            c.s.visitas.unshift({ id: uid('vi'), fecha: c.ahora, leadId, segmento, ...f })
            const l = c.s.leads.find((x) => x.id === leadId)
            if (l) {
              l.actividades.push({ id: uid('a'), fecha: c.ahora, tipo: 'visita', texto: `Visita registrada. Decide: ${f.quienDecide}. Necesita: ${f.queNecesita}. Próximo paso: ${f.proximoPaso}.`, autor: s.vendedores.find((v) => v.id === f.vendedorId)!.nombre })
              l.primeraRespuesta ??= c.ahora
              if (l.etapa === 'nuevo') l.etapa = 'contactado'
            }
          })
          aviso({ titulo: 'Visita registrada', tipo: 'exito' })
          cerrar()
        }}
      >
        <label><span className="etiqueta">Vendedor</span><select className="campo" value={f.vendedorId} onChange={set('vendedorId')}>{s.vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre} · {v.sede}</option>)}</select></label>
        {campos.map(([k, t, ph]) => (
          <label key={k}><span className="etiqueta">{t}</span><input required className="campo" value={f[k]} onChange={set(k)} placeholder={ph} /></label>
        ))}
        <button className="btn-primario">Guardar visita</button>
      </form>
    </Modal>
  )
}
