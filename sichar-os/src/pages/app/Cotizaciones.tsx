import { FilePlus2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Kpi } from '../../components/ui'
import type { Cotizacion } from '../../data/types'
import { useStore } from '../../lib/store'
import { HORA, fmtCOP, fmtFecha, fmtM, fmtPct, sum } from '../../lib/util'

const total = (q: Cotizacion) => q.items.reduce((a, i) => a + i.cantidad * i.precio * (1 - i.descuento), 0) * 1.19
const COLOR = { borrador: 'bg-zinc-100 text-zinc-700', enviada: 'bg-naranja-100 text-naranja-700', aceptada: 'bg-emerald-100 text-emerald-800', rechazada: 'bg-red-100 text-red-700' }

export default function Cotizaciones() {
  const { s } = useStore()
  const [estado, setEstado] = useState<Cotizacion['estado'] | ''>('')
  const lista = s.cotizaciones.filter((q) => !estado || q.estado === estado).sort((a, b) => b.creada - a.creada)
  const cerradas = s.cotizaciones.filter((q) => ['aceptada', 'rechazada'].includes(q.estado))
  const tasa = cerradas.length ? s.cotizaciones.filter((q) => q.estado === 'aceptada').length / cerradas.length : 0
  const tiempos = s.cotizaciones.filter((q) => q.enviada).map((q) => {
    const l = s.leads.find((x) => x.id === q.leadId)
    return l ? (q.enviada! - l.creado) / HORA : 0
  })
  const prom = tiempos.length ? sum(tiempos, (x) => x) / tiempos.length : 0

  return (
    <div className="grid gap-5 animate-entrar">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="titulo-app">Cotizaciones</h1>
          <p className="text-sm text-black/50">Meta del informe: cotizar en menos de 48 h (24 h en referencias top).</p>
        </div>
        <Link to="/app/cotizaciones/nueva" className="btn-primario"><FilePlus2 size={16} /> Nueva cotización</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi titulo="En curso" valor={fmtM(sum(s.cotizaciones.filter((q) => q.estado === 'enviada'), total))} detalle={`${s.cotizaciones.filter((q) => q.estado === 'enviada').length} enviadas`} />
        <Kpi titulo="Aceptadas" valor={fmtM(sum(s.cotizaciones.filter((q) => q.estado === 'aceptada'), total))} tono="bueno" detalle="con IVA" />
        <Kpi titulo="Tasa de cierre" valor={fmtPct(tasa)} detalle={`${cerradas.length} cerradas`} />
        <Kpi titulo="Tiempo a cotizar" valor={`${prom.toFixed(0)} h`} detalle={prom < 48 ? 'Dentro de la meta' : 'Fuera de la meta'} tono={prom < 48 ? 'bueno' : 'malo'} />
      </div>
      <div className="flex flex-wrap gap-2">
        {(['', 'borrador', 'enviada', 'aceptada', 'rechazada'] as const).map((e) => (
          <button key={e} onClick={() => setEstado(e)} className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${estado === e ? 'bg-tinta text-white' : 'bg-white ring-1 ring-black/10'}`}>{e || 'Todas'}</button>
        ))}
      </div>
      <div className="tarjeta overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-black/45">
            <tr className="border-b border-black/5"><th className="px-5 py-3">Número</th><th className="px-3 py-3">Cliente</th><th className="px-3 py-3">Canal</th><th className="px-3 py-3">Fecha</th><th className="px-3 py-3">Estado</th><th className="px-5 py-3 text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {lista.map((q) => {
              const l = s.leads.find((x) => x.id === q.leadId)
              return (
                <tr key={q.id} className="hover:bg-black/[.02]">
                  <td className="px-5 py-3 font-semibold"><Link to={`/app/cotizaciones/${q.id}`} className="hover:text-naranja">{q.numero}</Link></td>
                  <td className="px-3 py-3">{l?.empresa ?? l?.nombre}<div className="text-xs text-black/45">{l?.ciudad}</div></td>
                  <td className="px-3 py-3 capitalize">{q.canal}</td>
                  <td className="px-3 py-3">{fmtFecha(q.creada)}</td>
                  <td className="px-3 py-3"><span className={`chip capitalize ${COLOR[q.estado]}`}>{q.estado}</span></td>
                  <td className="px-5 py-3 text-right font-semibold">{fmtCOP(total(q))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
