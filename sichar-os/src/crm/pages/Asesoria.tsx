import { CalendarClock, Package, Palette, Timer } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Ambiente } from '../../components/Ambiente'
import { Muestra } from '../../components/Textura'
import { Kpi } from '../../components/ui'
import type { Ambiente as Amb, Asesoria as As } from '../../data/types'
import { useStore } from '../../lib/store'
import { fmtFecha, uid } from '../../lib/util'

const TIPOS: Record<As['tipo'], { nombre: string; icono: typeof Package }> = {
  'kit-muestras': { nombre: 'Kit de muestras', icono: Package },
  'cotizacion-48h': { nombre: 'Cotización de proyecto 48 h', icono: Timer },
  'asesoria-30': { nombre: 'Asesoría de 30 minutos', icono: CalendarClock },
  moodboard: { nombre: 'Tablero de inspiración', icono: Palette },
}
const COLUMNAS: As['estado'][] = ['solicitada', 'agendada', 'realizada', 'convertida']

export default function Asesoria() {
  const { s, cambiar } = useStore()
  const [amb, setAmb] = useState<Amb>({ piso: 'p3', pared: 'p8', acento: 'p12', griferia: 'dorado' })
  const P = (id: string) => s.productos.find((p) => p.id === id)!
  const mover = (id: string, estado: As['estado']) => cambiar((c) => { const a = c.s.asesorias.find((x) => x.id === id); if (a) a.estado = estado })
  const conv = s.asesorias.filter((a) => a.estado === 'convertida').length

  return (
    <div className="grid gap-5 animate-entrar">
      <div>
        <h1 className="titulo-app">Mesa de Asesoría SICHAR</h1>
        <p className="text-sm text-white/50">Piloto en Cali: competir con acompañamiento, no solo con producto (hallazgo 5). La asesoría no vende por fuera del canal.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi titulo="Proyectos asesorados" valor={s.asesorias.length} detalle="Meta piloto: 10–15 en 90 días" />
        <Kpi titulo="Convertidos" valor={conv} tono="bueno" detalle={`${Math.round((conv / Math.max(1, s.asesorias.length)) * 100)} % de conversión`} />
        <Kpi titulo="Kits enviados" valor={s.asesorias.filter((a) => a.tipo === 'kit-muestras').length} />
        <Kpi titulo="Satisfacción" valor="4,7 / 5" detalle="Encuesta posterior (ejemplo)" tono="marca" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNAS.map((col) => (
          <div key={col} className="rounded-2xl bg-white/[.035] p-2">
            <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white/50">{col} · {s.asesorias.filter((a) => a.estado === col).length}</div>
            <div className="grid gap-2">
              {s.asesorias.filter((a) => a.estado === col).map((a) => {
                const T = TIPOS[a.tipo]
                return (
                  <div key={a.id} className="rounded-xl bg-[#181818] p-3 shadow-sm ring-1 ring-white/5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-naranja-200"><T.icono size={14} /> {T.nombre}</div>
                    <div className="mt-1 font-semibold">{a.nombre}</div>
                    <div className="text-xs text-white/50">{a.notas}</div>
                    <div className="mt-1 text-[11px] text-white/40">{a.ciudad} · {fmtFecha(a.fecha, true)}</div>
                    {a.ambiente && (
                      <div className="mt-2 flex gap-1">
                        {[a.ambiente.piso, a.ambiente.pared, a.ambiente.acento].map((pid) => <Muestra key={pid} p={P(pid)} className="h-7 w-7 rounded" escala={0.5} />)}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {COLUMNAS.filter((x) => x !== col).map((x) => (
                        <button key={x} onClick={() => mover(a.id, x)} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium capitalize hover:bg-white/10">→ {x}</button>
                      ))}
                      {a.leadId && <Link to={`/pipeline/${a.leadId}`} className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-naranja">CRM</Link>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="tarjeta grid gap-6 p-5 lg:grid-cols-[1.4fr_1fr]">
        <Ambiente piso={P(amb.piso)} pared={P(amb.pared)} acento={P(amb.acento)} griferia={amb.griferia} />
        <div>
          <h2 className="font-display text-xl font-bold">Generador de tableros de inspiración</h2>
          <p className="mt-1 text-sm text-white/55">La asesora arma la propuesta con el cliente en vivo y la guarda como asesoría.</p>
          {(['piso', 'pared', 'acento'] as const).map((k) => (
            <label key={k} className="mt-4 block">
              <span className="etiqueta">{k}</span>
              <select className="campo" value={amb[k]} onChange={(e) => setAmb({ ...amb, [k]: e.target.value })}>{s.productos.filter((p) => p.unidad === 'm²' && p.linea !== 'remodelacion').map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
            </label>
          ))}
          <label className="mt-4 block">
            <span className="etiqueta">Grifería</span>
            <select className="campo" value={amb.griferia} onChange={(e) => setAmb({ ...amb, griferia: e.target.value as Amb['griferia'] })}><option value="negro">Negro mate</option><option value="cromo">Cromo</option><option value="dorado">Oro cepillado</option></select>
          </label>
          <button className="btn-primario mt-5 w-full" onClick={() => cambiar((c) => c.s.asesorias.unshift({ id: uid('as'), nombre: 'Nuevo tablero', tipo: 'moodboard', ciudad: 'Cali', fecha: c.ahora, estado: 'realizada', asesorId: 'a1', notas: `${P(amb.piso).nombre} + ${P(amb.pared).nombre}`, ambiente: amb }))}>
            Guardar tablero
          </button>
        </div>
      </div>
    </div>
  )
}
