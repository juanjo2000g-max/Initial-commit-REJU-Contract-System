import { Plus, Search, Store, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChipSegmento, ETAPAS, Modal, SEGMENTOS, useAviso } from '../../components/ui'
import type { Etapa, Fuente, Lead, Sede, Segmento } from '../../data/types'
import { useResponsable, useStore } from '../../lib/store'
import { SEDES, fmtM, haceCuanto, sum, uid } from '../../lib/util'

export default function Crm() {
  const { s, ahora, cambiar } = useStore()
  const responsable = useResponsable()
  const [q, setQ] = useState('')
  const [seg, setSeg] = useState<Segmento | ''>('')
  const [sede, setSede] = useState<Sede | ''>('')
  const [arrastrando, setArrastrando] = useState<string | null>(null)
  const [sobre, setSobre] = useState<Etapa | null>(null)
  const [nuevo, setNuevo] = useState(false)

  const filtrados = s.leads.filter(
    (l) =>
      (!seg || l.segmento === seg) &&
      (!sede || l.ciudad === sede) &&
      (!q || `${l.nombre} ${l.empresa ?? ''} ${l.interes}`.toLowerCase().includes(q.toLowerCase())),
  )

  const mover = (id: string, etapa: Etapa) =>
    cambiar((c) => {
      const l = c.s.leads.find((x) => x.id === id)
      if (!l || l.etapa === etapa) return
      const antes = ETAPAS.find((e) => e.id === l.etapa)!.nombre
      l.etapa = etapa
      l.actualizado = c.ahora
      if (etapa !== 'nuevo') l.primeraRespuesta ??= c.ahora
      l.actividades.push({ id: uid('a'), fecha: c.ahora, tipo: 'sistema', texto: `Etapa: ${antes} → ${ETAPAS.find((e) => e.id === etapa)!.nombre}`, autor: 'Gerencia' })
    })

  return (
    <div className="grid gap-5 animate-entrar">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="titulo-app">Pipeline comercial</h1>
          <p className="text-sm text-black/50">Arrastra las tarjetas entre etapas. Los referidos de la web llegan solos y se asignan a los aliados.</p>
        </div>
        <button className="btn-primario" onClick={() => setNuevo(true)}><Plus size={16} /> Nuevo lead</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
          <input className="campo !pl-9" placeholder="Buscar nombre, empresa u obra…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="campo !w-auto" value={seg} onChange={(e) => setSeg(e.target.value as Segmento | '')}>
          <option value="">Todos los segmentos</option>
          {(Object.keys(SEGMENTOS) as Segmento[]).map((k) => <option key={k} value={k}>{SEGMENTOS[k].nombre}</option>)}
        </select>
        <select className="campo !w-auto" value={sede} onChange={(e) => setSede(e.target.value as Sede | '')}>
          <option value="">Todas las sedes</option>
          {SEDES.map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-4 scroll-fino md:-mx-8 md:px-8">
        <div className="flex min-w-max gap-4">
          {ETAPAS.map((e) => {
            const col = filtrados.filter((l) => l.etapa === e.id).sort((a, b) => b.actualizado - a.actualizado)
            return (
              <div
                key={e.id}
                onDragOver={(ev) => { ev.preventDefault(); setSobre(e.id) }}
                onDragLeave={() => setSobre(null)}
                onDrop={() => { if (arrastrando) mover(arrastrando, e.id); setArrastrando(null); setSobre(null) }}
                className={`flex w-72 flex-col rounded-2xl p-2 transition ${sobre === e.id ? 'bg-naranja-50 ring-2 ring-naranja/40' : 'bg-black/[.035]'}`}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`chip ${e.color}`}>{e.nombre}</span>
                    <span className="text-xs font-semibold text-black/40">{col.length}</span>
                  </div>
                  <span className="text-xs font-semibold text-black/50">{fmtM(sum(col, (l) => l.valor))}</span>
                </div>
                <div className="grid max-h-[calc(100vh-290px)] gap-2 overflow-y-auto p-0.5 scroll-fino">
                  {col.map((l) => (
                    <Tarjeta key={l.id} l={l} ahora={ahora} resp={responsable(l)} onDrag={() => setArrastrando(l.id)} />
                  ))}
                  {col.length === 0 && <div className="rounded-xl border border-dashed border-black/10 p-4 text-center text-xs text-black/35">Suelta aquí</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <NuevoLead abierto={nuevo} cerrar={() => setNuevo(false)} />
    </div>
  )
}

function Tarjeta({ l, ahora, resp, onDrag }: { l: Lead; ahora: number; resp: string; onDrag: () => void }) {
  const sinResp = l.etiquetas.includes('Sin respuesta 24h') && l.etapa === 'nuevo'
  return (
    <Link
      to={`/pipeline/${l.id}`}
      draggable
      onDragStart={onDrag}
      className={`group block cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 transition hover:shadow-md active:cursor-grabbing ${sinResp ? 'ring-red-300' : 'ring-black/5'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{l.empresa ?? l.nombre}</div>
          {l.empresa && <div className="truncate text-xs text-black/50">{l.nombre}</div>}
        </div>
        <div className="shrink-0 text-sm font-bold">{fmtM(l.valor)}</div>
      </div>
      <div className="mt-1.5 line-clamp-2 text-xs text-black/55">{l.interes}</div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <ChipSegmento segmento={l.segmento} />
        <span className="chip bg-black/5 text-black/60">{l.ciudad}</span>
        {l.etiquetas.map((t) => (
          <span key={t} className={`chip ${t.includes('Sin respuesta') ? 'bg-red-100 text-red-700' : t.includes('Referido') ? 'bg-naranja-100 text-naranja-700' : 'bg-violet-100 text-violet-700'}`}>
            {t.includes('Referido') && <Zap size={10} />} {t}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-2 text-[11px] text-black/45">
        <span className="flex items-center gap-1 truncate">{l.asignadoTipo === 'distribuidor' && <Store size={11} />} {resp}</span>
        <span className="shrink-0">{haceCuanto(l.actualizado, ahora)}</span>
      </div>
    </Link>
  )
}

export function NuevoLead({ abierto, cerrar }: { abierto: boolean; cerrar: () => void }) {
  const { crearLead } = useStore()
  const aviso = useAviso()
  const nav = useNavigate()
  const [f, setF] = useState({ nombre: '', empresa: '', telefono: '', segmento: 'hogar' as Segmento, ciudad: 'Cali' as Sede, fuente: 'visita' as Fuente, m2: '', interes: '' })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  return (
    <Modal abierto={abierto} cerrar={cerrar} titulo="Nuevo lead">
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          const m2 = Number(f.m2) || undefined
          const r = crearLead({ nombre: f.nombre, empresa: f.empresa || undefined, telefono: f.telefono, segmento: f.segmento, ciudad: f.ciudad, fuente: f.fuente, m2, valor: Math.round((m2 ?? 20) * 90_000), interes: f.interes || 'Sin detalle' })
          aviso({ titulo: 'Lead creado', texto: r.responsable ? `Asignado a ${r.responsable}` : undefined, tipo: 'exito' })
          cerrar()
          nav(`/pipeline/${r.lead.id}`)
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <label><span className="etiqueta">Nombre</span><input required className="campo" value={f.nombre} onChange={set('nombre')} /></label>
          <label><span className="etiqueta">Teléfono</span><input required className="campo" value={f.telefono} onChange={set('telefono')} /></label>
          <label><span className="etiqueta">Segmento</span>
            <select className="campo" value={f.segmento} onChange={set('segmento')}>{(Object.keys(SEGMENTOS) as Segmento[]).map((k) => <option key={k} value={k}>{SEGMENTOS[k].nombre}</option>)}</select>
          </label>
          <label><span className="etiqueta">Empresa / estudio</span><input className="campo" value={f.empresa} onChange={set('empresa')} /></label>
          <label><span className="etiqueta">Ciudad</span><select className="campo" value={f.ciudad} onChange={set('ciudad')}>{SEDES.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label><span className="etiqueta">Fuente</span>
            <select className="campo" value={f.fuente} onChange={set('fuente')}>{['visita', 'whatsapp', 'web', 'referido', 'redes', 'feria'].map((x) => <option key={x}>{x}</option>)}</select>
          </label>
          <label><span className="etiqueta">m² aprox.</span><input className="campo" value={f.m2} onChange={set('m2')} inputMode="numeric" /></label>
        </div>
        <label><span className="etiqueta">Interés / obra</span><textarea className="campo" value={f.interes} onChange={set('interes')} /></label>
        <p className="text-xs text-black/45">Al guardar, las automatizaciones asignan el responsable según la política de canal.</p>
        <button className="btn-primario">Crear lead</button>
      </form>
    </Modal>
  )
}
