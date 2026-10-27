import { ClipboardList, Download, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChipEtapa, ChipSegmento, SEGMENTOS } from '../../components/ui'
import type { Segmento, Visita } from '../../data/types'
import { useResponsable, useStore } from '../../lib/store'
import { fmtCOP, fmtFecha } from '../../lib/util'
import { FormularioVisita } from './LeadDetalle'

const PERSONAS: { seg: Segmento; nombre: string; frase: string }[] = [
  { seg: 'distribuidor', nombre: 'Don Hernán, el ferretero', frase: '“Necesito rotación rápida, buen margen y que no me quiten los clientes.”' },
  { seg: 'constructora', nombre: 'Ing. Natalia, compras de obra', frase: '“Cumplimiento por etapas y precio estable durante todo el proyecto.”' },
  { seg: 'arquitecto', nombre: 'Arq. Tomás, el diseñador', frase: '“Muestras físicas, fichas técnicas y algo que mis clientes no hayan visto.”' },
  { seg: 'hogar', nombre: 'Carolina, la que remodela', frase: '“Quiero verlo antes de comprarlo y que alguien cerca me lo instale.”' },
]

function top(vs: Visita[], k: keyof Visita) {
  const c = vs.reduce<Record<string, number>>((a, v) => ((a[String(v[k])] = (a[String(v[k])] ?? 0) + 1), a), {})
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t)
}

export default function Clientes() {
  const { s } = useStore()
  const responsable = useResponsable()
  const [q, setQ] = useState('')
  const [visita, setVisita] = useState(false)
  const lista = s.leads.filter((l) => !q || `${l.nombre} ${l.empresa ?? ''} ${l.ciudad}`.toLowerCase().includes(q.toLowerCase()))

  const exportar = () => {
    const filas = [['Nombre', 'Empresa', 'Segmento', 'Ciudad', 'Teléfono', 'Etapa', 'Valor'], ...s.leads.map((l) => [l.nombre, l.empresa ?? '', l.segmento, l.ciudad, l.telefono, l.etapa, l.valor])]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + filas.map((f) => f.join(';')).join('\n')], { type: 'text/csv' }))
    a.download = 'clientes-sichar.csv'
    a.click()
  }

  return (
    <div className="grid gap-5 animate-entrar">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="titulo-app">Clientes, visitas y buyer personas</h1>
          <p className="text-sm text-white/50">El conocimiento deja de vivir en la memoria de los vendedores (hallazgo 3).</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-claro" onClick={exportar}><Download size={16} /> Exportar</button>
          <button className="btn-primario" onClick={() => setVisita(true)}><ClipboardList size={16} /> Registrar visita</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PERSONAS.map((p) => {
          const vs = s.visitas.filter((v) => v.segmento === p.seg)
          const leads = s.leads.filter((l) => l.segmento === p.seg)
          return (
            <div key={p.seg} className="tarjeta overflow-hidden">
              <div className="bg-gradient-to-br from-naranja/20 to-transparent p-4 text-white">
                <ChipSegmento segmento={p.seg} />
                <div className="mt-2 font-display text-lg font-bold">{p.nombre}</div>
                <p className="mt-1 text-xs text-white/60">{p.frase}</p>
              </div>
              <dl className="grid gap-2 p-4 text-sm">
                <div><dt className="etiqueta !mb-0">Quién decide</dt><dd>{top(vs, 'quienDecide').join(' · ') || '—'}</dd></div>
                <div><dt className="etiqueta !mb-0">Qué necesita</dt><dd>{top(vs, 'queNecesita').join(' · ') || '—'}</dd></div>
                <div><dt className="etiqueta !mb-0">Qué lo frena</dt><dd>{top(vs, 'queLoFrena').join(' · ') || '—'}</dd></div>
                <div><dt className="etiqueta !mb-0">Dónde se informa</dt><dd>{top(vs, 'dondeSeInforma').join(' · ') || '—'}</dd></div>
                <div className="mt-1 border-t border-white/5 pt-2 text-xs text-white/45">{vs.length} visitas · {leads.length} clientes · fuente: formulario único</div>
              </dl>
            </div>
          )
        })}
      </div>

      <div className="tarjeta overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4">
          <h2 className="font-semibold">Base de datos de clientes ({s.leads.length})</h2>
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
            <input className="campo !py-2 !pl-9" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="max-h-[520px] overflow-auto scroll-fino">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#181818] text-left text-xs uppercase tracking-wide text-white/45">
              <tr><th className="px-5 py-3">Cliente</th><th className="px-3 py-3">Segmento</th><th className="px-3 py-3">Ciudad</th><th className="px-3 py-3">Responsable</th><th className="px-3 py-3">Etapa</th><th className="px-5 py-3 text-right">Valor</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((l) => (
                <tr key={l.id} className="hover:bg-white/[.02]">
                  <td className="px-5 py-2.5"><Link className="font-medium hover:text-naranja" to={`/pipeline/${l.id}`}>{l.empresa ?? l.nombre}</Link><div className="text-xs text-white/45">{l.nombre} · {l.telefono}</div></td>
                  <td className="px-3 py-2.5"><ChipSegmento segmento={l.segmento} /></td>
                  <td className="px-3 py-2.5">{l.ciudad}</td>
                  <td className="px-3 py-2.5 text-xs">{responsable(l)}</td>
                  <td className="px-3 py-2.5"><ChipEtapa etapa={l.etapa} /></td>
                  <td className="px-5 py-2.5 text-right font-semibold">{fmtCOP(l.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="tarjeta p-5">
        <h2 className="font-semibold">Últimas visitas registradas</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {s.visitas.slice(0, 8).map((v) => {
            const l = s.leads.find((x) => x.id === v.leadId)
            return (
              <div key={v.id} className="rounded-xl bg-white/[.04] p-3 text-sm">
                <div className="flex items-center justify-between"><span className="font-semibold">{l?.empresa ?? l?.nombre ?? 'Prospecto'}</span><span className="text-xs text-white/45">{fmtFecha(v.fecha)} · {s.vendedores.find((x) => x.id === v.vendedorId)?.nombre}</span></div>
                <div className="mt-1 text-xs text-white/60"><b>Necesita:</b> {v.queNecesita} · <b>Frena:</b> {v.queLoFrena} · <b>Siguiente:</b> {v.proximoPaso}</div>
                <span className={`chip mt-1 ${SEGMENTOS[v.segmento].color}`}>{SEGMENTOS[v.segmento].nombre}</span>
              </div>
            )
          })}
        </div>
      </div>
      <FormularioVisita abierto={visita} cerrar={() => setVisita(false)} segmento="constructora" />
    </div>
  )
}
