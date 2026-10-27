import { CheckCircle2, MessageCircle, Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { Modal, PuntoLuz, useAviso } from '../../components/ui'
import type { Queja, Sede } from '../../data/types'
import { saludDistribuidor, semaforoCanal } from '../../lib/semaforo'
import { useStore } from '../../lib/store'
import { DIA, SEDES, fmtFecha, fmtM, fmtPct, sum, uid, waLink } from '../../lib/util'

export default function Canal() {
  const { s, ahora, cambiar } = useStore()
  const aviso = useAviso()
  const canal = semaforoCanal(s, ahora)
  const [registro, setRegistro] = useState(false)
  const [queja, setQueja] = useState(false)
  const lista = [...s.distribuidores].sort((a, b) => sum(b.ventas6m, (x) => x) - sum(a.ventas6m, (x) => x))

  return (
    <div className="grid gap-5 animate-entrar">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="titulo-app">Canal y Distribuidor Aliado</h1>
          <p className="text-sm text-white/50">La confianza del canal es el activo principal (hallazgo 1). Aquí se vigila con datos.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-claro" onClick={() => setQueja(true)}><Plus size={16} /> Registrar queja</button>
          <button className="btn-primario" onClick={() => setRegistro(true)}><ShieldCheck size={16} /> Registrar proyecto</button>
        </div>
      </div>

      <div className={`grid gap-6 rounded-3xl p-6 text-white md:grid-cols-[auto_1fr_auto] md:items-center ${canal.luz === 'verde' ? 'bg-emerald-700' : canal.luz === 'amarillo' ? 'bg-amber-600' : 'bg-red-700'}`}>
        <div className="flex gap-2 rounded-2xl bg-black/30 p-3">
          {(['rojo', 'amarillo', 'verde'] as const).map((l) => <span key={l} className={`h-9 w-9 rounded-full ${canal.luz === l ? 'bg-white shadow-[0_0_24px_6px_rgba(255,255,255,.6)]' : 'bg-white/15'}`} />)}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Semáforo para abrir la Línea Directa · {canal.luz.toUpperCase()}</div>
          <div className="mt-1 font-display text-2xl font-bold">{canal.decision}</div>
        </div>
        <div className="text-sm text-white/80">{canal.salud.filter((x) => x.luz === 'verde').length} verdes · {canal.amarillos.length} amarillos · {canal.rojos.length} rojos<br /><span className="text-white/60">(distribuidores Oro y Plata)</span></div>
      </div>

      <div className="tarjeta overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-white/45">
            <tr className="border-b border-white/5"><th className="px-5 py-3">Distribuidor</th><th className="px-3 py-3">Nivel</th><th className="px-3 py-3">Ventas 6 meses</th><th className="px-3 py-3 text-right">Tendencia</th><th className="px-3 py-3 text-right">Sin pedido</th><th className="px-3 py-3 text-right">Referidos</th><th className="px-3 py-3">Estado</th><th className="px-5 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lista.map((d) => {
              const h = saludDistribuidor(d, s, ahora)
              return (
                <tr key={d.id} className="hover:bg-white/[.02]">
                  <td className="px-5 py-3">
                    <div className="font-semibold">{d.nombre}{!d.aliado && <span className="chip ml-2 bg-zinc-500/15 text-zinc-400">no aliado</span>}</div>
                    <div className="text-xs text-white/45">{d.barrio}, {d.ciudad} · {d.contacto}</div>
                  </td>
                  <td className="px-3 py-3"><span className={`chip ${d.nivel === 'Oro' ? 'bg-amber-500/25 text-amber-300' : d.nivel === 'Plata' ? 'bg-zinc-500/25 text-zinc-300' : 'bg-orange-500/15 text-orange-300'}`}>{d.nivel}</span></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-24">
                        <ResponsiveContainer><LineChart data={d.ventas6m.map((v) => ({ v }))}><Line dataKey="v" dot={false} stroke={h.tendencia < 0 ? '#dc2626' : '#16a34a'} strokeWidth={2} /></LineChart></ResponsiveContainer>
                      </div>
                      <span className="text-xs font-semibold">{fmtM(sum(d.ventas6m, (x) => x))}</span>
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-right font-semibold ${h.tendencia < 0 ? 'text-red-400' : 'text-emerald-300'}`}>{h.tendencia > 0 ? '+' : ''}{fmtPct(h.tendencia)}</td>
                  <td className={`px-3 py-3 text-right ${h.diasSinPedido > 21 ? 'font-semibold text-red-400' : ''}`}>{h.diasSinPedido} d</td>
                  <td className="px-3 py-3 text-right">{d.referidosConvertidos}/{d.referidosRecibidos}</td>
                  <td className="px-3 py-3"><div className="flex items-center gap-2"><PuntoLuz luz={h.luz} /><span className="text-xs text-white/55">{h.motivos[0] ?? 'Al día'}</span></div></td>
                  <td className="px-5 py-3"><a href={waLink(d.telefono, `Hola ${d.contacto.split(' ')[0]}, te saluda SICHAR. ¿Cómo te podemos apoyar este mes?`)} target="_blank" rel="noreferrer" className="text-[#128C4B]"><MessageCircle size={18} /></a></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-semibold">Proyectos protegidos</h2>
          <p className="text-xs text-white/45">Si un distribuidor registra una obra, SICHAR no la cotiza directo durante 180 días.</p>
          <div className="mt-3 grid gap-2">
            {s.proyectos.map((p) => {
              const d = s.distribuidores.find((x) => x.id === p.distribuidorId)!
              const vencido = p.vence < ahora
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white/[.04] p-3">
                  <ShieldCheck size={20} className={vencido ? 'text-white/30' : 'text-emerald-400'} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{p.obra}</div>
                    <div className="text-xs text-white/50">{p.constructora} · {p.m2.toLocaleString('es-CO')} m² · {d.nombre}</div>
                  </div>
                  <span className={`chip ${vencido ? 'bg-zinc-500/25 text-zinc-400' : 'bg-emerald-500/15 text-emerald-300'}`}>{vencido ? 'Vencido' : `Hasta ${fmtFecha(p.vence)}`}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-semibold">Quejas del canal</h2>
          <p className="text-xs text-white/45">Meta: 0 quejas críticas; resolver las menores en menos de 15 días.</p>
          <div className="mt-3 grid gap-2">
            {s.quejas.map((q) => {
              const d = s.distribuidores.find((x) => x.id === q.distribuidorId)!
              return (
                <div key={q.id} className={`flex items-start gap-3 rounded-xl p-3 ${q.resuelta ? 'bg-white/[.04] opacity-60' : q.critica ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">{d.nombre}<span className={`chip ${q.critica ? 'bg-red-600 text-white' : 'bg-amber-500/25 text-amber-300'}`}>{q.critica ? 'Crítica' : q.tipo}</span></div>
                    <div className="text-sm text-white/60">{q.texto}</div>
                    <div className="text-xs text-white/40">{fmtFecha(q.fecha)} · hace {Math.floor((ahora - q.fecha) / DIA)} días</div>
                  </div>
                  {!q.resuelta && (
                    <button className="btn-claro !px-2.5 !py-1.5 !text-xs" onClick={() => { cambiar((c) => { const x = c.s.quejas.find((y) => y.id === q.id); if (x) x.resuelta = true }); aviso({ titulo: 'Queja resuelta', texto: 'El semáforo se recalculó.', tipo: 'exito' }) }}>
                      <CheckCircle2 size={14} /> Resolver
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="tarjeta p-6">
        <h2 className="font-display text-xl font-bold">Política de canal (una página)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            ['Quién vende qué', 'Línea Distribuidor: portafolio actual, solo vía ferreterías y distribuidores. Línea Directa: colecciones de proyecto exclusivas.'],
            ['Precios', 'SICHAR publica un PVP sugerido y nunca vende directo por debajo de él. La plataforma lo bloquea automáticamente.'],
            ['Consumidor final', 'La web inspira y capta; el botón principal es «Dónde comprar». Cada contacto se entrega al aliado como referido.'],
            ['Zonas y proyectos', 'Obra registrada por un distribuidor = obra protegida. SICHAR no la ofrece directo.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-white/[.04] p-4">
              <div className="font-semibold text-naranja-200">{t}</div>
              <p className="mt-1 text-sm text-white/60">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <RegistroProyecto abierto={registro} cerrar={() => setRegistro(false)} />
      <NuevaQueja abierto={queja} cerrar={() => setQueja(false)} />
    </div>
  )
}

export function RegistroProyecto({ abierto, cerrar, distribuidorId }: { abierto: boolean; cerrar: () => void; distribuidorId?: string }) {
  const { s, cambiar } = useStore()
  const aviso = useAviso()
  const [f, setF] = useState({ distribuidorId: distribuidorId ?? 'd1', constructora: '', obra: '', ciudad: 'Cali' as Sede, m2: '' })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  return (
    <Modal abierto={abierto} cerrar={cerrar} titulo="Registrar proyecto">
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          cambiar((c) => c.s.proyectos.unshift({ id: uid('pr'), distribuidorId: f.distribuidorId, constructora: f.constructora, obra: f.obra, ciudad: f.ciudad, m2: Number(f.m2) || 0, registrado: c.ahora, vence: c.ahora + 180 * DIA, estado: 'protegido' }))
          aviso({ titulo: 'Proyecto protegido por 180 días', texto: 'Si la constructora escribe a SICHAR, se enviará al distribuidor.', tipo: 'exito' })
          cerrar()
        }}
      >
        {!distribuidorId && (
          <label><span className="etiqueta">Distribuidor</span><select className="campo" value={f.distribuidorId} onChange={set('distribuidorId')}>{s.distribuidores.filter((d) => d.aliado).map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></label>
        )}
        <label><span className="etiqueta">Constructora</span><input required className="campo" value={f.constructora} onChange={set('constructora')} placeholder="Ej. Vértice Construcciones" /></label>
        <label><span className="etiqueta">Obra</span><input required className="campo" value={f.obra} onChange={set('obra')} placeholder="Ej. Reserva del Lili" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label><span className="etiqueta">Ciudad</span><select className="campo" value={f.ciudad} onChange={set('ciudad')}>{SEDES.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label><span className="etiqueta">m²</span><input className="campo" value={f.m2} onChange={set('m2')} inputMode="numeric" /></label>
        </div>
        <button className="btn-primario">Registrar y proteger</button>
      </form>
    </Modal>
  )
}

function NuevaQueja({ abierto, cerrar }: { abierto: boolean; cerrar: () => void }) {
  const { s, cambiar } = useStore()
  const [f, setF] = useState({ distribuidorId: 'd1', tipo: 'precio' as Queja['tipo'], critica: false, texto: '' })
  return (
    <Modal abierto={abierto} cerrar={cerrar} titulo="Registrar queja del canal">
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); cambiar((c) => c.s.quejas.unshift({ id: uid('qj'), fecha: c.ahora, resuelta: false, ...f })); cerrar() }}>
        <label><span className="etiqueta">Distribuidor</span><select className="campo" value={f.distribuidorId} onChange={(e) => setF({ ...f, distribuidorId: e.target.value })}>{s.distribuidores.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></label>
        <label><span className="etiqueta">Tipo</span><select className="campo" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as Queja['tipo'] })}>{['precio', 'cliente tomado', 'despacho', 'calidad'].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.critica} onChange={(e) => setF({ ...f, critica: e.target.checked })} className="accent-[#F47920]" /> Es crítica (conflicto de canal)</label>
        <label><span className="etiqueta">Detalle</span><textarea required className="campo" value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} /></label>
        <button className="btn-primario">Guardar</button>
      </form>
    </Modal>
  )
}
