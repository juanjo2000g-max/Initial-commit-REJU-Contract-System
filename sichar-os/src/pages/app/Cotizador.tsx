import { AlertTriangle, ArrowLeft, Calculator, Check, MessageCircle, Printer, Search, ShieldCheck, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Muestra } from '../../components/Textura'
import { Logo, Modal, useAviso } from '../../components/ui'
import type { Cotizacion, ItemCotizacion } from '../../data/types'
import { revisarPolitica } from '../../lib/automatizaciones'
import { useStore } from '../../lib/store'
import { DIA, costoProducto, fmtCOP, fmtFecha, fmtPct, uid, waLink } from '../../lib/util'

const IVA = 0.19

export default function Cotizador() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { s, ahora, guardarCotizacion, estadoCotizacion } = useStore()
  const aviso = useAviso()
  const nav = useNavigate()
  const existente = s.cotizaciones.find((q) => q.id === id)
  const leadInicial = existente?.leadId ?? params.get('lead') ?? s.leads[0].id
  const [cot, setCot] = useState<Cotizacion>(
    () =>
      existente ?? {
        id: uid('q'),
        numero: `COT-2026-${String(410 + s.cotizaciones.length + 1).padStart(4, '0')}`,
        leadId: leadInicial,
        items: [],
        canal: s.leads.find((l) => l.id === leadInicial)?.segmento === 'hogar' ? 'distribuidor' : 'directa',
        estado: 'borrador',
        creada: ahora,
        validezDias: 15,
        notas: 'Precios en pesos colombianos. Despacho desde la sede más cercana. Instalación no incluida.',
        vendedorId: 'v1',
      },
  )
  const [buscar, setBuscar] = useState('')
  const [m2, setM2] = useState('')
  const [bloqueo, setBloqueo] = useState<string[] | null>(null)
  const lead = s.leads.find((l) => l.id === cot.leadId)!
  const editable = cot.estado === 'borrador'
  const problemas = revisarPolitica(cot, s)

  const P = (pid: string) => s.productos.find((p) => p.id === pid)!
  const precioBase = (pid: string) => (cot.canal === 'directa' && lead.segmento === 'hogar' ? P(pid).pvpSugerido : P(pid).precioDistribuidor)
  const agregar = (pid: string, cantidad = 1) =>
    setCot((c) => {
      const ya = c.items.find((i) => i.productoId === pid)
      if (ya) return { ...c, items: c.items.map((i) => (i.productoId === pid ? { ...i, cantidad: i.cantidad + cantidad } : i)) }
      return { ...c, items: [...c.items, { productoId: pid, cantidad, precio: precioBase(pid), descuento: lead.segmento === 'constructora' ? 0.05 : 0 }] }
    })
  const editar = (pid: string, cambio: Partial<ItemCotizacion>) => setCot((c) => ({ ...c, items: c.items.map((i) => (i.productoId === pid ? { ...i, ...cambio } : i)) }))

  const calcularMateriales = () => {
    const area = Number(m2)
    if (!area) return
    const piso = cot.items.find((i) => P(i.productoId).unidad === 'm²')?.productoId ?? 'p1'
    const items: [string, number][] = [
      [piso, Math.ceil(area * 1.1)],
      ['p18', Math.ceil(area / 4)],
      ['p20', Math.ceil(area / 12)],
      ['p19', Math.ceil(area / 10)],
    ]
    setCot((c) => {
      const resto = c.items.filter((i) => !items.some(([pid]) => pid === i.productoId))
      return { ...c, items: [...resto, ...items.map(([pid, cantidad]) => ({ productoId: pid, cantidad, precio: precioBase(pid), descuento: lead.segmento === 'constructora' ? 0.05 : 0 }))] }
    })
    aviso({ titulo: 'Materiales calculados', texto: `${area} m² + 10 % de desperdicio, pegante, boquilla y niveladores.`, tipo: 'info' })
  }

  const t = useMemo(() => {
    const bruto = cot.items.reduce((a, i) => a + i.cantidad * i.precio, 0)
    const desc = cot.items.reduce((a, i) => a + i.cantidad * i.precio * i.descuento, 0)
    const sub = bruto - desc
    const costo = cot.items.reduce((a, i) => a + i.cantidad * costoProducto(P(i.productoId), s.config).total, 0)
    return { bruto, desc, sub, iva: sub * IVA, total: sub * (1 + IVA), margen: sub ? (sub - costo) / sub : 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cot.items, s.config])

  const guardar = (estado: Cotizacion['estado'], aprobada = false) => {
    const final = { ...cot, estado, enviada: estado === 'enviada' ? ahora : cot.enviada }
    const r = guardarCotizacion(final, aprobada)
    if (!r.ok) {
      setBloqueo(r.problemas)
      return
    }
    setCot(final)
    aviso({ titulo: estado === 'enviada' ? `${cot.numero} enviada` : 'Borrador guardado', tipo: 'exito' })
    if (!existente) nav(`/app/cotizaciones/${cot.id}`, { replace: true })
  }

  const resumenWa = `Hola ${lead.nombre.split(' ')[0]}, te comparto la cotización ${cot.numero} de SICHAR:\n${cot.items.map((i) => `• ${P(i.productoId).nombre}: ${i.cantidad} ${P(i.productoId).unidad}`).join('\n')}\nTotal con IVA: ${fmtCOP(t.total)}\nVálida por ${cot.validezDias} días. ¿Te la explico?`
  const resultados = buscar ? s.productos.filter((p) => `${p.nombre} ${p.ref}`.toLowerCase().includes(buscar.toLowerCase())) : s.productos.slice(0, 8)

  return (
    <div className="grid gap-5 animate-entrar">
      <div className="no-imprimir flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/cotizaciones" className="flex items-center gap-1 text-sm text-black/50 hover:text-black"><ArrowLeft size={16} /> Cotizaciones</Link>
        <div className="flex flex-wrap gap-2">
          <button className="btn-claro" onClick={() => window.print()}><Printer size={16} /> PDF</button>
          <a className="btn bg-[#25D366] text-white hover:brightness-95" href={waLink(lead.telefono, resumenWa)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
          {editable && <button className="btn-claro" onClick={() => guardar('borrador')}>Guardar borrador</button>}
          {editable && <button className="btn-primario" disabled={!cot.items.length} onClick={() => guardar('enviada')}>Enviar al cliente</button>}
          {cot.estado === 'enviada' && (
            <>
              <button className="btn-claro" onClick={() => { estadoCotizacion(cot.id, 'rechazada'); setCot({ ...cot, estado: 'rechazada' }) }}><X size={16} /> Rechazada</button>
              <button className="btn bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => { estadoCotizacion(cot.id, 'aceptada'); setCot({ ...cot, estado: 'aceptada' }); aviso({ titulo: '¡Venta ganada!', texto: 'Se creó el pedido y la encuesta de satisfacción.', tipo: 'exito' }) }}><Check size={16} /> Aceptada</button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        {/* Documento */}
        <div className="tarjeta overflow-hidden print:shadow-none print:ring-0">
          <div className="flex flex-wrap items-start justify-between gap-4 bg-tinta p-6 text-white">
            <div>
              <Logo claro />
              <p className="mt-2 text-xs text-white/50">SICHAR S.A.S. · Cali, Colombia · Importación y distribución de acabados</p>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold">{cot.numero}</div>
              <div className="text-xs text-white/60">Emitida {fmtFecha(cot.creada)} · válida hasta {fmtFecha(cot.creada + cot.validezDias * DIA)}</div>
              <span className={`chip mt-2 capitalize ${cot.estado === 'aceptada' ? 'bg-emerald-500 text-white' : cot.estado === 'enviada' ? 'bg-naranja text-white' : cot.estado === 'rechazada' ? 'bg-zinc-500 text-white' : 'bg-white/15 text-white'}`}>{cot.estado}</span>
            </div>
          </div>
          <div className="grid gap-4 border-b border-black/5 p-6 sm:grid-cols-2">
            <div>
              <div className="etiqueta">Cliente</div>
              {editable ? (
                <select className="campo no-imprimir" value={cot.leadId} onChange={(e) => setCot({ ...cot, leadId: e.target.value })}>
                  {s.leads.map((l) => <option key={l.id} value={l.id}>{l.empresa ?? l.nombre} · {l.ciudad}</option>)}
                </select>
              ) : null}
              <div className="mt-1 font-semibold">{lead.empresa ?? lead.nombre}</div>
              <div className="text-sm text-black/55">{lead.nombre} · {lead.telefono} · {lead.ciudad}</div>
            </div>
            <div>
              <div className="etiqueta">Canal de venta</div>
              <div className="no-imprimir flex gap-1">
                {(['distribuidor', 'directa'] as const).map((c) => (
                  <button key={c} disabled={!editable} onClick={() => setCot({ ...cot, canal: c })} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${cot.canal === c ? 'bg-tinta text-white' : 'bg-black/5'}`}>{c === 'distribuidor' ? 'Vía distribuidor aliado' : 'Venta directa'}</button>
                ))}
              </div>
              <div className="mt-1 hidden text-sm print:block">{cot.canal === 'distribuidor' ? 'Atención vía distribuidor aliado' : 'Venta directa SICHAR'}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-hueso text-left text-xs uppercase tracking-wide text-black/45">
                <tr><th className="px-6 py-3">Producto</th><th className="px-2 py-3 text-right">Cant.</th><th className="px-2 py-3 text-right">Precio</th><th className="px-2 py-3 text-right">Desc.</th><th className="px-6 py-3 text-right">Subtotal</th><th className="no-imprimir w-8" /></tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {cot.items.map((i) => {
                  const p = P(i.productoId)
                  return (
                    <tr key={i.productoId}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Muestra p={p} className="h-10 w-10 shrink-0 rounded-lg" escala={0.8} />
                          <div>
                            <div className="font-medium">{p.nombre}</div>
                            <div className="text-xs text-black/45">{p.ref} · {p.formato}{p.lineaDirecta && ' · Colección proyecto'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right">{editable ? <input type="number" min={1} className="campo !w-20 !px-2 !py-1 text-right" value={i.cantidad} onChange={(e) => editar(p.id, { cantidad: Math.max(1, Number(e.target.value)) })} /> : i.cantidad} <span className="text-xs text-black/40">{p.unidad}</span></td>
                      <td className="px-2 py-3 text-right">{editable ? <input type="number" className="campo !w-28 !px-2 !py-1 text-right" value={i.precio} onChange={(e) => editar(p.id, { precio: Number(e.target.value) })} /> : fmtCOP(i.precio)}</td>
                      <td className="px-2 py-3 text-right">{editable ? <input type="number" min={0} max={30} className="campo !w-16 !px-2 !py-1 text-right" value={Math.round(i.descuento * 100)} onChange={(e) => editar(p.id, { descuento: Number(e.target.value) / 100 })} /> : fmtPct(i.descuento)}</td>
                      <td className="px-6 py-3 text-right font-semibold">{fmtCOP(i.cantidad * i.precio * (1 - i.descuento))}</td>
                      <td className="no-imprimir pr-3">{editable && <button className="text-black/30 hover:text-red-600" onClick={() => setCot({ ...cot, items: cot.items.filter((x) => x.productoId !== p.id) })}><Trash2 size={15} /></button>}</td>
                    </tr>
                  )
                })}
                {cot.items.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-black/45">Agrega productos desde el panel de la derecha o usa la calculadora de materiales.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap justify-between gap-6 border-t border-black/5 p-6">
            <textarea className="campo min-h-20 max-w-md print:border-0 print:p-0" disabled={!editable} value={cot.notas} onChange={(e) => setCot({ ...cot, notas: e.target.value })} />
            <dl className="ml-auto grid min-w-64 gap-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-black/55">Subtotal</dt><dd>{fmtCOP(t.bruto)}</dd></div>
              {t.desc > 0 && <div className="flex justify-between text-emerald-700"><dt>Descuentos</dt><dd>− {fmtCOP(t.desc)}</dd></div>}
              <div className="flex justify-between"><dt className="text-black/55">IVA 19 %</dt><dd>{fmtCOP(t.iva)}</dd></div>
              <div className="mt-1 flex justify-between border-t border-black/10 pt-2 font-display text-xl font-bold"><dt>Total</dt><dd>{fmtCOP(t.total)}</dd></div>
            </dl>
          </div>
        </div>

        {/* Panel */}
        <div className="no-imprimir grid content-start gap-4">
          {problemas.length > 0 ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm ring-1 ring-red-200">
              <div className="flex items-center gap-2 font-semibold text-red-700"><AlertTriangle size={16} /> Política de canal</div>
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-red-800/80">{problemas.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200"><ShieldCheck size={16} /> Cumple la política de canal</div>
          )}
          <div className="tarjeta p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-black/45">Margen bruto (interno) <span className={t.margen >= s.config.margenObjetivo ? 'text-emerald-600' : 'text-red-600'}>{fmtPct(t.margen, 1)}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5"><div className={`h-full ${t.margen >= s.config.margenObjetivo ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.max(0, Math.min(100, t.margen * 200))}%` }} /></div>
            <p className="mt-2 text-xs text-black/45">Calculado con el costo puesto en bodega. Objetivo: {fmtPct(s.config.margenObjetivo)}.</p>
          </div>
          {editable && (
            <>
              <div className="tarjeta p-4">
                <div className="flex items-center gap-2 font-semibold"><Calculator size={16} className="text-naranja" /> Calculadora de materiales</div>
                <div className="mt-3 flex gap-2">
                  <input className="campo" placeholder="m² del espacio" value={m2} onChange={(e) => setM2(e.target.value)} inputMode="numeric" />
                  <button className="btn-oscuro" onClick={calcularMateriales}>Calcular</button>
                </div>
                <p className="mt-2 text-xs text-black/45">Agrega porcelanato (+10 %), pegante, boquilla y niveladores.</p>
              </div>
              <div className="tarjeta p-4">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" />
                  <input className="campo !pl-9" placeholder="Buscar producto o referencia" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                </div>
                <div className="mt-3 grid max-h-96 gap-1 overflow-auto scroll-fino">
                  {resultados.map((p) => (
                    <button key={p.id} onClick={() => agregar(p.id, p.unidad === 'm²' ? 10 : 1)} className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-hueso">
                      <Muestra p={p} className="h-9 w-9 shrink-0 rounded-lg" escala={0.7} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p.nombre}</div>
                        <div className="text-xs text-black/45">{fmtCOP(precioBase(p.id))}/{p.unidad} · stock Cali {p.stock.Cali}</div>
                      </div>
                      <span className="text-lg text-naranja">+</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal abierto={!!bloqueo} cerrar={() => setBloqueo(null)} titulo="Envío bloqueado por la política de canal">
        <p className="text-sm text-black/60">La automatización «Guardia de política de precios» detuvo el envío:</p>
        <ul className="mt-3 grid list-disc gap-1 pl-5 text-sm text-red-700">{bloqueo?.map((p) => <li key={p}>{p}</li>)}</ul>
        <p className="mt-4 text-sm text-black/60">Puedes cambiar el canal a «Vía distribuidor aliado», ajustar precios o aprobarla como gerencia (queda registrado).</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button className="btn-claro" onClick={() => { setCot({ ...cot, canal: 'distribuidor' }); setBloqueo(null) }}>Pasar a distribuidor</button>
          <button className="btn-oscuro" onClick={() => { setBloqueo(null); guardar('enviada', true) }}>Aprobar como gerencia</button>
        </div>
      </Modal>
    </div>
  )
}
