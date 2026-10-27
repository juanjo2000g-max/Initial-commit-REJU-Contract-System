import { ArrowLeft, Gift, GraduationCap, LogOut, MessageCircle, Minus, Package, Plus, ShieldCheck, ShoppingCart, Users } from 'lucide-react'
import { useState } from 'react'
import { Muestra } from '../components/Textura'
import { ChipEtapa, Kpi, Logo, PuntoLuz, useAviso } from '../components/ui'
import { saludDistribuidor } from '../lib/semaforo'
import { useStore } from '../lib/store'
import { DIA, fmtCOP, fmtFecha, haceCuanto, uid, waLink } from '../lib/util'
import { RegistroProyecto } from '../crm/pages/Canal'
import { urlApp } from '../lib/apps'

export default function Portal() {
  const { s } = useStore()
  const [id, setId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('portal:dist')
    } catch {
      return null
    }
  })
  const entrar = (v: string | null) => {
    setId(v)
    try {
      if (v) sessionStorage.setItem('portal:dist', v)
      else sessionStorage.removeItem('portal:dist')
    } catch {
      /* sin almacenamiento */
    }
  }
  const d = s.distribuidores.find((x) => x.id === id)
  if (!d) return <Ingreso entrar={entrar} />
  return <Panel id={d.id} salir={() => entrar(null)} />
}

function Ingreso({ entrar }: { entrar: (id: string) => void }) {
  const { s } = useStore()
  const [sel, setSel] = useState('d1')
  return (
    <div className="grid min-h-screen place-items-center bg-tinta p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(244,121,32,.3),transparent_55%)]" />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <Logo />
        <h1 className="mt-6 font-display text-3xl font-bold">Portal Distribuidor Aliado</h1>
        <p className="mt-1 text-sm text-black/55">Pedidos 24/7, referidos de la web, proyectos protegidos y beneficios del programa.</p>
        <label className="mt-6 block"><span className="etiqueta">Distribuidor (demo)</span>
          <select className="campo" value={sel} onChange={(e) => setSel(e.target.value)}>{s.distribuidores.filter((x) => x.aliado).map((x) => <option key={x.id} value={x.id}>{x.nombre} · {x.ciudad}</option>)}</select>
        </label>
        <label className="mt-3 block"><span className="etiqueta">Clave</span><input className="campo" type="password" defaultValue="aliado2026" /></label>
        <button className="btn-primario mt-6 w-full !py-3" onClick={() => entrar(sel)}>Ingresar</button>
        <a href={urlApp('web')} className="mt-4 flex items-center justify-center gap-1 text-sm text-black/45 hover:text-black"><ArrowLeft size={14} /> Volver a la web</a>
      </div>
    </div>
  )
}

function Panel({ id, salir }: { id: string; salir: () => void }) {
  const { s, ahora, cambiar } = useStore()
  const aviso = useAviso()
  const d = s.distribuidores.find((x) => x.id === id)!
  const [carrito, setCarrito] = useState<Record<string, number>>({})
  const [registro, setRegistro] = useState(false)
  const h = saludDistribuidor(d, s, ahora)
  const referidos = s.leads.filter((l) => l.asignadoTipo === 'distribuidor' && l.asignadoId === d.id).sort((a, b) => b.creado - a.creado)
  const pedidos = s.pedidos.filter((p) => p.distribuidorId === d.id).sort((a, b) => b.fecha - a.fecha)
  const proyectos = s.proyectos.filter((p) => p.distribuidorId === d.id)
  const totalCarrito = Object.entries(carrito).reduce((a, [pid, n]) => a + n * s.productos.find((p) => p.id === pid)!.precioDistribuidor, 0)
  const descuentoNivel = d.nivel === 'Oro' ? 0.05 : d.nivel === 'Plata' ? 0.03 : 0

  const pedir = () => {
    cambiar((c) => {
      const items = Object.entries(carrito).filter(([, n]) => n > 0).map(([productoId, cantidad]) => ({ productoId, cantidad }))
      c.s.pedidos.unshift({ id: uid('pe'), distribuidorId: d.id, fecha: c.ahora, items, total: totalCarrito * (1 - descuentoNivel), estado: 'recibido', canal: 'portal' })
      const x = c.s.distribuidores.find((y) => y.id === d.id)!
      x.ultimoPedido = c.ahora
      x.ventas6m[5] += totalCarrito
      for (const it of items) {
        const p = c.s.productos.find((y) => y.id === it.productoId)!
        p.stock[d.ciudad] = Math.max(0, p.stock[d.ciudad] - it.cantidad)
      }
      c.s.notificaciones.unshift({ id: uid('n'), fecha: c.ahora, texto: `Pedido por portal: ${d.nombre} · ${fmtCOP(totalCarrito)}`, tipo: 'exito', leida: false, enlace: '/canal' })
    })
    setCarrito({})
    aviso({ titulo: 'Pedido recibido', texto: 'Lo alistamos hoy en la sede ' + d.ciudad + '.', tipo: 'exito' })
  }

  const actualizar = (leadId: string, etapa: 'contactado' | 'ganado' | 'perdido') =>
    cambiar((c) => {
      const l = c.s.leads.find((x) => x.id === leadId)!
      l.etapa = etapa
      l.actualizado = c.ahora
      l.primeraRespuesta ??= c.ahora
      l.etiquetas = l.etiquetas.filter((e) => e !== 'Sin respuesta 24h')
      l.actividades.push({ id: uid('a'), fecha: c.ahora, tipo: 'sistema', texto: `${d.nombre} actualizó el referido: ${etapa}`, autor: d.nombre })
      if (etapa === 'ganado') c.s.distribuidores.find((y) => y.id === d.id)!.referidosConvertidos++
    })

  return (
    <div className="min-h-screen bg-[#F3F1EC]">
      <header className="sticky top-0 z-20 bg-tinta text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="flex items-center gap-4"><Logo claro /><span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-semibold md:block">Portal Aliado</span></div>
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right leading-tight"><div className="font-semibold">{d.nombre}</div><div className="text-xs text-white/50">Aliado {d.nivel} · {d.ciudad}</div></div>
            <button onClick={salir} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Salir"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="titulo-app">Hola, {d.contacto.split(' ')[0]} 👋</h1>
            <p className="text-sm text-black/55">Tu cuenta está <span className="inline-flex items-center gap-1 font-semibold"><PuntoLuz luz={h.luz} /> {h.luz === 'verde' ? 'al día' : h.motivos[0]}</span></p>
          </div>
          <button className="btn-claro" onClick={() => setRegistro(true)}><ShieldCheck size={16} /> Registrar un proyecto</button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi titulo="Referidos de la web" valor={d.referidosRecibidos} detalle={`${d.referidosConvertidos} convertidos`} tono="marca" icono={<Users size={16} />} />
          <Kpi titulo="Compras del mes" valor={fmtCOP(d.ventas6m[5])} icono={<ShoppingCart size={16} />} />
          <Kpi titulo="Beneficio de nivel" valor={`${descuentoNivel * 100} %`} detalle={`Aliado ${d.nivel}`} icono={<Gift size={16} />} />
          <Kpi titulo="Proyectos protegidos" valor={proyectos.filter((p) => p.vence > ahora).length} icono={<ShieldCheck size={16} />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <section className="tarjeta p-5">
            <h2 className="font-semibold">Referidos que SICHAR te envió</h2>
            <p className="text-xs text-black/45">Clientes finales que llegaron por la web, redes o WhatsApp de SICHAR en tu zona.</p>
            <div className="mt-3 grid gap-2">
              {referidos.length === 0 && <p className="py-6 text-center text-sm text-black/45">Aún no tienes referidos. ¡Pronto llegarán!</p>}
              {referidos.slice(0, 8).map((l) => (
                <div key={l.id} className="rounded-xl bg-hueso p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{l.empresa ?? l.nombre}</div>
                    <div className="flex items-center gap-2"><ChipEtapa etapa={l.etapa} /><span className="text-xs text-black/40">{haceCuanto(l.creado, ahora)}</span></div>
                  </div>
                  <div className="mt-1 text-sm text-black/60">{l.interes}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a href={waLink(l.telefono, `Hola ${l.nombre.split(' ')[0]}, te escribo de ${d.nombre}, distribuidor aliado SICHAR. Recibimos tu solicitud, ¿cuándo te podemos visitar?`)} target="_blank" rel="noreferrer" onClick={() => l.etapa === 'nuevo' && actualizar(l.id, 'contactado')} className="btn !px-3 !py-1.5 !text-xs bg-[#25D366] text-white"><MessageCircle size={14} /> Contactar</a>
                    {!['ganado', 'perdido'].includes(l.etapa) && (
                      <>
                        <button className="btn-claro !px-3 !py-1.5 !text-xs" onClick={() => actualizar(l.id, 'ganado')}>Vendido ✓</button>
                        <button className="btn-fantasma !px-3 !py-1.5 !text-xs" onClick={() => actualizar(l.id, 'perdido')}>No compró</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="tarjeta p-5">
            <h2 className="flex items-center gap-2 font-semibold"><Package size={16} className="text-naranja" /> Hacer pedido</h2>
            <p className="text-xs text-black/45">Precios de distribuidor · stock en sede {d.ciudad}</p>
            <div className="mt-3 grid max-h-96 gap-1 overflow-auto scroll-fino">
              {s.productos.filter((p) => !p.lineaDirecta).map((p) => {
                const n = carrito[p.id] ?? 0
                const paso = p.unidad === 'm²' ? 20 : 5
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-hueso">
                    <Muestra p={p} className="h-10 w-10 shrink-0 rounded-lg" escala={0.7} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.nombre}</div>
                      <div className="text-xs text-black/45">{fmtCOP(p.precioDistribuidor)}/{p.unidad} · {p.stock[d.ciudad].toLocaleString('es-CO')} disp.</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="grid h-7 w-7 place-items-center rounded-lg bg-black/5" onClick={() => setCarrito({ ...carrito, [p.id]: Math.max(0, n - paso) })}><Minus size={13} /></button>
                      <span className="w-10 text-center text-sm font-semibold">{n}</span>
                      <button className="grid h-7 w-7 place-items-center rounded-lg bg-naranja text-white" onClick={() => setCarrito({ ...carrito, [p.id]: n + paso })}><Plus size={13} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 border-t border-black/5 pt-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{fmtCOP(totalCarrito)}</span></div>
              {descuentoNivel > 0 && <div className="flex justify-between text-emerald-700"><span>Beneficio {d.nivel}</span><span>− {fmtCOP(totalCarrito * descuentoNivel)}</span></div>}
              <button className="btn-primario mt-3 w-full" disabled={!totalCarrito} onClick={pedir}>Enviar pedido · {fmtCOP(totalCarrito * (1 - descuentoNivel))}</button>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="tarjeta p-5">
            <h2 className="font-semibold">Mis pedidos</h2>
            <div className="mt-3 grid gap-2">
              {pedidos.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl bg-hueso px-3 py-2 text-sm">
                  <div><div className="font-medium">{fmtFecha(p.fecha)}</div><div className="text-xs text-black/45">{p.items.length} referencias · {p.canal}</div></div>
                  <div className="text-right"><div className="font-semibold">{fmtCOP(p.total)}</div><span className="chip bg-white capitalize text-black/60">{p.estado}</span></div>
                </div>
              ))}
            </div>
          </section>
          <section className="tarjeta p-5">
            <h2 className="font-semibold">Proyectos protegidos</h2>
            <div className="mt-3 grid gap-2">
              {proyectos.length === 0 && <p className="text-sm text-black/45">Registra tus obras y SICHAR no las atenderá directo.</p>}
              {proyectos.map((p) => (
                <div key={p.id} className="rounded-xl bg-hueso px-3 py-2 text-sm">
                  <div className="font-medium">{p.obra}</div>
                  <div className="text-xs text-black/45">{p.constructora} · {p.vence > ahora ? `protegido ${Math.ceil((p.vence - ahora) / DIA)} días más` : 'vencido'}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="tarjeta p-5">
            <h2 className="flex items-center gap-2 font-semibold"><GraduationCap size={16} className="text-naranja" /> Programa Aliado</h2>
            <ul className="mt-3 grid gap-2 text-sm">
              <li className="rounded-xl bg-hueso px-3 py-2"><b>Capacitación técnica:</b> instalación de gran formato · {fmtFecha(ahora + 9 * DIA)} · virtual</li>
              <li className="rounded-xl bg-hueso px-3 py-2"><b>Muestrario nuevo:</b> colección 60x130 disponible para tu punto de venta</li>
              <li className="rounded-xl bg-hueso px-3 py-2"><b>Material POP:</b> exhibidor y catálogo impreso con tu logo</li>
              <li className="rounded-xl bg-hueso px-3 py-2"><b>Apoyo posventa:</b> SICHAR te acompaña en remodelaciones de tus clientes</li>
            </ul>
          </section>
        </div>
      </main>
      <RegistroProyecto abierto={registro} cerrar={() => setRegistro(false)} distribuidorId={d.id} />
    </div>
  )
}
