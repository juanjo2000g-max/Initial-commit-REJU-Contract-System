import { AlertTriangle, Download, Globe2, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Muestra } from '../../components/Textura'
import { Kpi, useAviso } from '../../components/ui'
import type { Pais, Producto } from '../../data/types'
import { useStore } from '../../lib/store'
import { PAISES, costoBodega, fmtCOP, fmtPct, sum } from '../../lib/util'

const COL_PAIS: Record<Pais, string> = { India: '#F47920', China: '#C0392B', Brasil: '#2E8B57', España: '#D68910', Perú: '#2E5E8C' }

export default function Costos() {
  const { s, cambiar } = useStore()
  const aviso = useAviso()
  const [alza, setAlza] = useState(0.3)
  const [traslado, setTraslado] = useState(0.6)
  const [sel, setSel] = useState('p1')
  const c = s.config

  const filas = useMemo(
    () =>
      s.productos.map((p) => {
        // El costo cargado ya incluye el +30 % de India; "antes" lo descuenta.
        const base = p.origen === 'India' ? p.costoUSD / 1.3 : p.costoUSD
        const antes = costoBodega(base, p.origen, p.precioDistribuidor, c)
        const usd = p.origen === 'India' ? base * (1 + alza) : p.costoUSD
        const ahora = costoBodega(usd, p.origen, p.precioDistribuidor, c)
        const alts = p.alternativos.map((a) => ({ ...a, costo: costoBodega(a.costoUSD, a.pais, p.precioDistribuidor, c) })).sort((a, b) => a.costo.total - b.costo.total)
        const mejor = alts.find((a) => a.validado && a.costo.total < ahora.total)
        const subida = ahora.total - antes.total
        const nuevoPrecio = Math.ceil((p.precioDistribuidor + subida * traslado) / 100) * 100
        const dependencia = p.origen === 'India' && !p.alternativos.some((a) => a.validado)
        return { p, antes, ahora, mejor, nuevoPrecio, dependencia, margenNuevo: (nuevoPrecio - ahora.total) / nuevoPrecio }
      }),
    [s.productos, c, alza, traslado],
  )

  const compras = PAISES.map((pais) => ({ pais, v: sum(filas.filter((f) => f.p.origen === pais), (f) => f.ahora.total * f.p.ventasMes) }))
  const totalCompras = sum(compras, (x) => x.v)
  const ventas = sum(filas, (f) => f.p.precioDistribuidor * f.p.ventasMes)
  const margenAntes = 1 - sum(filas, (f) => f.antes.total * f.p.ventasMes) / ventas
  const margenAhora = 1 - sum(filas, (f) => f.ahora.total * f.p.ventasMes) / ventas
  const ventasNuevas = sum(filas, (f) => f.nuevoPrecio * f.p.ventasMes)
  const margenConPlan = 1 - sum(filas, (f) => (f.mejor ? f.mejor.costo.total : f.ahora.total) * f.p.ventasMes) / ventasNuevas
  const sinAlternativa = filas.filter((f) => f.dependencia)
  const f = filas.find((x) => x.p.id === sel)!
  const desglose = [
    { n: 'Origen', v: f.ahora.origen },
    { n: 'Flete y seguro', v: f.ahora.flete },
    { n: 'Arancel', v: f.ahora.arancel },
    { n: 'Nacionalización', v: f.ahora.nacionalizacion },
    { n: 'Bodega', v: f.ahora.almacenamiento },
  ]

  const descargar = () => {
    const filasCsv = [['Referencia', 'Producto', 'Origen', 'Costo bodega', 'Precio actual', 'Precio nuevo', 'Margen nuevo'], ...filas.map((x) => [x.p.ref, x.p.nombre, x.p.origen, Math.round(x.ahora.total), x.p.precioDistribuidor, x.nuevoPrecio, (x.margenNuevo * 100).toFixed(1)])]
    const blob = new Blob(['﻿' + filasCsv.map((r) => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'lista-precios-escalones-sichar.csv'
    a.click()
  }

  const aplicar = () => {
    cambiar((cx) => {
      for (const x of filas) {
        const p = cx.s.productos.find((y) => y.id === x.p.id)!
        p.precioDistribuidor = x.nuevoPrecio
        p.pvpSugerido = Math.ceil((x.nuevoPrecio * 1.37) / 100) * 100
      }
    })
    aviso({ titulo: 'Nueva lista de precios aplicada', texto: 'El cotizador y la Vitrina ya usan los precios nuevos.', tipo: 'exito' })
  }

  return (
    <div className="grid gap-5 animate-entrar">
      <div>
        <h1 className="titulo-app">Costos de importación y márgenes</h1>
        <p className="text-sm text-black/50">Costo total puesto en bodega por referencia (hallazgo 2). Mueve los controles y mira el efecto en el margen.</p>
      </div>

      <div className="tarjeta grid gap-5 p-5 md:grid-cols-4">
        <Control etiqueta="Alza en India" valor={fmtPct(alza)} min={0} max={0.6} paso={0.05} v={alza} set={setAlza} />
        <Control etiqueta="TRM" valor={`$ ${c.trm.toLocaleString('es-CO')}`} min={3500} max={5000} paso={50} v={c.trm} set={(v) => cambiar((x) => { x.s.config.trm = v })} />
        <Control etiqueta="Arancel" valor={fmtPct(c.arancel)} min={0} max={0.25} paso={0.01} v={c.arancel} set={(v) => cambiar((x) => { x.s.config.arancel = v })} />
        <Control etiqueta="Parte del alza que se traslada al precio" valor={fmtPct(traslado)} min={0} max={1} paso={0.1} v={traslado} set={setTraslado} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi titulo="Margen antes del alza" valor={fmtPct(margenAntes, 1)} />
        <Kpi titulo="Margen hoy" valor={fmtPct(margenAhora, 1)} detalle={`${((margenAhora - margenAntes) * 100).toFixed(1).replace('.', ',')} puntos`} tono="malo" />
        <Kpi titulo="Margen con el plan" valor={fmtPct(margenConPlan, 1)} detalle="Proveedor alterno + precios por escalones" tono={margenConPlan >= margenAntes - 0.01 ? 'bueno' : 'marca'} />
        <Kpi titulo="Dependencia de India" valor={fmtPct((compras.find((x) => x.pais === 'India')?.v ?? 0) / totalCompras)} detalle={`${sinAlternativa.length} referencias sin plan B`} tono={sinAlternativa.length ? 'malo' : 'bueno'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="tarjeta p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Globe2 size={16} className="text-naranja" /> Compras por país de origen</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={compras} dataKey="v" nameKey="pais" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {compras.map((x) => <Cell key={x.pais} fill={COL_PAIS[x.pais]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtPct(Number(v) / totalCompras)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {compras.map((x) => <li key={x.pais} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: COL_PAIS[x.pais] }} />{x.pais}<b className="ml-auto">{fmtPct(x.v / totalCompras)}</b></li>)}
          </ul>
        </div>
        <div className="tarjeta p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">¿De qué está hecho el costo?</h2>
            <select className="campo !w-auto !py-1.5" value={sel} onChange={(e) => setSel(e.target.value)}>{s.productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={desglose}>
                  <XAxis dataKey="n" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => fmtCOP(Number(v))} />
                  <Bar dataKey="v" radius={[8, 8, 0, 0]}>{desglose.map((_, i) => <Cell key={i} fill={i === 0 ? '#F47920' : '#1E1E1E'} fillOpacity={1 - i * 0.12} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <dl className="grid content-center gap-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-black/55">Costo en bodega</dt><dd className="font-semibold">{fmtCOP(f.ahora.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-black/55">Precio distribuidor</dt><dd>{fmtCOP(f.p.precioDistribuidor)}</dd></div>
              <div className="flex justify-between"><dt className="text-black/55">Margen</dt><dd className={f.ahora.margen < c.margenObjetivo ? 'font-semibold text-red-600' : 'font-semibold text-emerald-600'}>{fmtPct(f.ahora.margen, 1)}</dd></div>
              <div className="flex justify-between"><dt className="text-black/55">Precio para {fmtPct(c.margenObjetivo)}</dt><dd>{fmtCOP(f.ahora.precioParaObjetivo)}</dd></div>
              {f.mejor && <div className="mt-2 rounded-xl bg-emerald-50 p-2 text-xs text-emerald-800">Con {f.mejor.pais}: costo {fmtCOP(f.mejor.costo.total)} → margen {fmtPct(f.mejor.costo.margen, 1)}</div>}
            </dl>
          </div>
        </div>
      </div>

      <div className="tarjeta overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 p-5">
          <div>
            <h2 className="font-semibold">Hoja de costos por referencia y lista de precios por escalones</h2>
            <p className="text-xs text-black/45">En rojo: referencias con India como único origen.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-claro" onClick={descargar}><Download size={16} /> Descargar CSV</button>
            <button className="btn-oscuro" onClick={aplicar}><Save size={16} /> Aplicar lista nueva</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-hueso text-left text-xs uppercase tracking-wide text-black/45">
              <tr><th className="px-5 py-3">Referencia</th><th className="px-3 py-3">Origen</th><th className="px-3 py-3 text-right">Costo bodega</th><th className="px-3 py-3 text-right">Margen hoy</th><th className="px-3 py-3">Mejor alternativa</th><th className="px-3 py-3 text-right">Precio nuevo</th><th className="px-5 py-3 text-right">Margen nuevo</th></tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filas.map((x) => (
                <tr key={x.p.id} className={x.dependencia ? 'bg-red-50/60' : ''}>
                  <td className="px-5 py-2.5"><Ref p={x.p} alerta={x.dependencia} /></td>
                  <td className="px-3 py-2.5"><span className="chip text-white" style={{ background: COL_PAIS[x.p.origen] }}>{x.p.origen}</span></td>
                  <td className="px-3 py-2.5 text-right">{fmtCOP(x.ahora.total)}</td>
                  <td className={`px-3 py-2.5 text-right font-semibold ${x.ahora.margen < c.margenObjetivo ? 'text-red-600' : 'text-emerald-700'}`}>{fmtPct(x.ahora.margen, 1)}</td>
                  <td className="px-3 py-2.5 text-xs">{x.mejor ? <span className="text-emerald-700">{x.mejor.pais}: ahorra {fmtCOP(x.ahora.total - x.mejor.costo.total)}</span> : x.p.alternativos.some((a) => !a.validado) ? <span className="text-amber-700">Muestra en validación</span> : <span className="text-black/35">—</span>}</td>
                  <td className="px-3 py-2.5 text-right">{fmtCOP(x.nuevoPrecio)}{x.nuevoPrecio > x.p.precioDistribuidor && <span className="ml-1 text-xs text-black/40">(+{fmtPct(x.nuevoPrecio / x.p.precioDistribuidor - 1, 1)})</span>}</td>
                  <td className="px-5 py-2.5 text-right font-semibold">{fmtPct(x.margenNuevo, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Ref({ p, alerta }: { p: Producto; alerta: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Muestra p={p} className="h-8 w-8 shrink-0 rounded-md" escala={0.6} />
      <div>
        <div className="flex items-center gap-1 font-medium">{alerta && <AlertTriangle size={13} className="text-red-600" />}{p.nombre}</div>
        <div className="text-xs text-black/45">{p.ref} · {p.ventasMes.toLocaleString('es-CO')} {p.unidad}/mes</div>
      </div>
    </div>
  )
}

function Control({ etiqueta, valor, min, max, paso, v, set }: { etiqueta: string; valor: string; min: number; max: number; paso: number; v: number; set: (v: number) => void }) {
  return (
    <label>
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-black/50"><span>{etiqueta}</span><span className="text-tinta">{valor}</span></div>
      <input type="range" min={min} max={max} step={paso} value={v} onChange={(e) => set(Number(e.target.value))} className="mt-3 w-full accent-[#F47920]" />
    </label>
  )
}
