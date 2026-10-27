// Portal del Distribuidor Aliado: pensado primero para el celular del ferretero.
import { ArrowLeft, Check, ChevronRight, Clock, Crown, Gift, Home, LogOut, MessageCircle, Minus, Package, Plus, RotateCcw, ShieldCheck, ShoppingBag, Trophy, Truck, Users, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import logo from '../assets/logo-sichar.png'
import { Muestra } from '../components/Textura'
import { useAviso } from '../components/ui'
import type { Distribuidor, Lead, Pedido } from '../data/types'
import { urlApp } from '../lib/apps'
import { saludDistribuidor } from '../lib/semaforo'
import { useStore } from '../lib/store'
import { DIA, HORA, fmtCOP, fmtFecha, fmtM, haceCuanto, uid, waLink } from '../lib/util'
import { RegistroProyecto } from '../crm/pages/Canal'
import { NumeroVivo } from '../crm/Vivo'

type Pestaña = 'inicio' | 'referidos' | 'pedir' | 'pedidos' | 'obras'
const NIVELES = [
  { nombre: 'Bronce', desde: 0, beneficio: 0 },
  { nombre: 'Plata', desde: 45_000_000, beneficio: 0.03 },
  { nombre: 'Oro', desde: 90_000_000, beneficio: 0.05 },
] as const
const ESTADOS: Pedido['estado'][] = ['recibido', 'alistamiento', 'despachado', 'entregado']

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
  return <AnimatePresence mode="wait">{d ? <Panel key="panel" d={d} salir={() => entrar(null)} /> : <Ingreso key="ingreso" entrar={entrar} />}</AnimatePresence>
}

function Ingreso({ entrar }: { entrar: (id: string) => void }) {
  const { s } = useStore()
  const [sel, setSel] = useState('d1')
  return (
    <motion.div exit={{ opacity: 0 }} className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0b0b0b] p-4">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-naranja/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-naranja/10 blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative w-full max-w-md">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-9" />
          <span className="font-display text-2xl font-extrabold">SICHAR</span>
          <span className="ml-1 rounded-full bg-naranja/15 px-2.5 py-1 text-[11px] font-semibold text-naranja-200">ALIADOS</span>
        </div>
        <h1 className="mt-10 font-display text-5xl font-extrabold leading-[.9] tracking-tighter">Tu negocio,<br /><span className="text-naranja">con SICHAR al lado.</span></h1>
        <p className="mt-4 text-white/55">Clientes que te enviamos desde la web, pedidos a cualquier hora y tus obras protegidas.</p>
        <div className="mt-10 grid gap-3 rounded-3xl bg-white/[.04] p-5 ring-1 ring-white/10 backdrop-blur">
          <label><span className="etiqueta">Tu ferretería (demo)</span>
            <select className="campo !py-3" value={sel} onChange={(e) => setSel(e.target.value)}>{s.distribuidores.filter((x) => x.aliado).map((x) => <option key={x.id} value={x.id}>{x.nombre} · {x.ciudad}</option>)}</select>
          </label>
          <label><span className="etiqueta">Clave</span><input className="campo !py-3" type="password" defaultValue="aliado2026" /></label>
          <button className="btn-primario mt-2 !py-3.5 !text-base" onClick={() => entrar(sel)}>Entrar</button>
        </div>
        <a href={urlApp('web')} className="mt-6 flex items-center justify-center gap-1 text-sm text-white/40 hover:text-white"><ArrowLeft size={14} /> Volver al sitio web</a>
      </motion.div>
    </motion.div>
  )
}

function Panel({ d, salir }: { d: Distribuidor; salir: () => void }) {
  const { s, ahora } = useStore()
  const [tab, setTab] = useState<Pestaña>('inicio')
  const [registro, setRegistro] = useState(false)
  const referidos = s.leads.filter((l) => l.asignadoTipo === 'distribuidor' && l.asignadoId === d.id).sort((a, b) => b.creado - a.creado)
  const pendientes = referidos.filter((l) => l.etapa === 'nuevo')
  const tabs: { id: Pestaña; nombre: string; icono: typeof Home; n?: number }[] = [
    { id: 'inicio', nombre: 'Inicio', icono: Home },
    { id: 'referidos', nombre: 'Referidos', icono: Users, n: pendientes.length },
    { id: 'pedir', nombre: 'Pedir', icono: ShoppingBag },
    { id: 'pedidos', nombre: 'Pedidos', icono: Truck },
    { id: 'obras', nombre: 'Obras', icono: ShieldCheck },
  ]
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tab])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen overflow-x-clip bg-[#0b0b0b] pb-28 md:pb-10">
      <div className="pointer-events-none fixed -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-naranja/15 blur-[120px]" />
      <header className="sticky top-0 z-30 border-b border-white/[.06] bg-[#0b0b0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-8">
          <img src={logo} alt="" className="h-7" />
          <nav className="hidden gap-1 md:flex">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.id ? 'text-tinta' : 'text-white/60 hover:text-white'}`}>
                {tab === t.id && <motion.span layoutId="tab-portal" className="absolute inset-0 rounded-full bg-white" />}
                <t.icono size={16} className="relative" />
                <span className="relative">{t.nombre}</span>
                {!!t.n && <span className="relative grid h-5 min-w-5 place-items-center rounded-full bg-naranja px-1 text-[11px] text-white">{t.n}</span>}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold">{d.nombre}</div>
              <div className="text-xs text-white/45">Aliado {d.nivel} · {d.ciudad}</div>
            </div>
            <button onClick={salir} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/10 hover:bg-white/5" aria-label="Salir"><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pt-6 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {tab === 'inicio' && <Inicio d={d} referidos={referidos} irA={setTab} registrar={() => setRegistro(true)} />}
            {tab === 'referidos' && <Referidos d={d} referidos={referidos} ahora={ahora} />}
            {tab === 'pedir' && <Pedir d={d} irA={setTab} />}
            {tab === 'pedidos' && <Pedidos d={d} />}
            {tab === 'obras' && <Obras d={d} ahora={ahora} registrar={() => setRegistro(true)} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* barra inferior en el celular */}
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl bg-[#161616]/95 p-1.5 ring-1 ring-white/10 backdrop-blur-xl md:hidden">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold ${tab === t.id ? 'text-white' : 'text-white/45'}`}>
            {tab === t.id && <motion.span layoutId="tab-movil" className="absolute inset-0 rounded-xl bg-naranja" />}
            <t.icono size={19} className="relative" />
            <span className="relative">{t.nombre}</span>
            {!!t.n && <span className="absolute right-3 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] text-naranja">{t.n}</span>}
          </button>
        ))}
      </nav>
      <RegistroProyecto abierto={registro} cerrar={() => setRegistro(false)} distribuidorId={d.id} />
    </motion.div>
  )
}

function Inicio({ d, referidos, irA, registrar }: { d: Distribuidor; referidos: Lead[]; irA: (t: Pestaña) => void; registrar: () => void }) {
  const { s, ahora } = useStore()
  const h = saludDistribuidor(d, s, ahora)
  const compras = d.ventas6m[5]
  const idx = NIVELES.findIndex((n) => n.nombre === d.nivel)
  const siguiente = NIVELES[idx + 1]
  const progreso = siguiente ? Math.min(1, compras / siguiente.desde) : 1
  const ranking = useMemo(() => s.distribuidores.filter((x) => x.aliado && x.ciudad === d.ciudad).sort((a, b) => b.ventas6m[5] - a.ventas6m[5]), [s.distribuidores, d.ciudad])
  const puesto = ranking.findIndex((x) => x.id === d.id) + 1
  const pendientes = referidos.filter((l) => l.etapa === 'nuevo')
  const ganados = referidos.filter((l) => l.etapa === 'ganado')

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm text-white/45">{fmtFecha(ahora)}</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Hola, {d.contacto.split(' ')[0]} 👋</h1>
        <p className="mt-2 flex items-center gap-2 text-white/55">
          <span className={`h-2 w-2 rounded-full ${h.luz === 'verde' ? 'bg-emerald-400' : h.luz === 'amarillo' ? 'bg-amber-400' : 'bg-red-500'}`} />
          {h.luz === 'verde' ? 'Tu cuenta está al día.' : `Atención: ${h.motivos[0]}.`}
        </p>
      </div>

      {pendientes.length > 0 && (
        <motion.button initial={{ scale: 0.98 }} animate={{ scale: 1 }} onClick={() => irA('referidos')} className="group relative overflow-hidden rounded-3xl bg-naranja p-5 text-left md:p-6">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-naranja">
              <Users size={26} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4"><span className="absolute h-full w-full animate-ping rounded-full bg-white opacity-75" /><span className="relative h-4 w-4 rounded-full bg-tinta" /></span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-2xl font-bold leading-tight">{pendientes.length === 1 ? 'Tienes un cliente nuevo' : `Tienes ${pendientes.length} clientes nuevos`}</div>
              <div className="truncate text-white/85">{pendientes[0].nombre} · {pendientes[0].interes}</div>
            </div>
            <ChevronRight className="shrink-0 transition group-hover:translate-x-1" />
          </div>
        </motion.button>
      )}

      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1d12] to-[#141414] p-6 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-naranja-200"><Crown size={16} /> Aliado {d.nivel}</div>
            <span className="text-xs text-white/40">compras de este mes</span>
          </div>
          <NumeroVivo valor={compras} formato={fmtCOP} className="mt-3 block font-display text-4xl font-bold tracking-tight md:text-5xl" />
          {siguiente ? (
            <>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-naranja to-amber-300" initial={{ width: 0 }} animate={{ width: `${progreso * 100}%` }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              <p className="mt-3 text-sm text-white/60">Te faltan <b className="text-white">{fmtCOP(siguiente.desde - compras)}</b> para ser <b className="text-white">Aliado {siguiente.nombre}</b> y recibir {siguiente.beneficio * 100} % de beneficio en tus pedidos.</p>
            </>
          ) : (
            <p className="mt-4 text-sm text-white/60">Estás en el nivel más alto: 5 % de beneficio y prioridad en referidos.</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Tarjeta icono={<Trophy size={18} />} titulo={`#${puesto} en ${d.ciudad}`} detalle={`entre ${ranking.length} aliados`} />
          <Tarjeta icono={<Users size={18} />} titulo={String(d.referidosRecibidos)} detalle={`referidos · ${d.referidosConvertidos} vendidos`} />
          <Tarjeta icono={<Gift size={18} />} titulo={`${(NIVELES[idx]?.beneficio ?? 0) * 100} %`} detalle="beneficio en pedidos" />
          <Tarjeta icono={<ShieldCheck size={18} />} titulo={String(s.proyectos.filter((p) => p.distribuidorId === d.id && p.vence > ahora).length)} detalle="obras protegidas" onClick={registrar} accion="Registrar" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Atajo icono={<ShoppingBag />} titulo="Hacer un pedido" detalle="Precio de aliado, stock de tu sede" onClick={() => irA('pedir')} />
        <Atajo icono={<Truck />} titulo="Seguir mis pedidos" detalle="Del alistamiento a tu puerta" onClick={() => irA('pedidos')} />
        <Atajo icono={<ShieldCheck />} titulo="Proteger una obra" detalle="SICHAR no la atiende directo" onClick={registrar} />
      </div>

      {ganados.length > 0 && (
        <div className="rounded-3xl bg-emerald-500/10 p-5 ring-1 ring-emerald-500/25">
          <div className="text-sm font-semibold text-emerald-300">Ventas que vinieron de la web de SICHAR</div>
          <div className="mt-1 font-display text-3xl font-bold">{fmtM(ganados.reduce((a, l) => a + l.valor, 0))}</div>
          <div className="text-sm text-white/50">{ganados.length} clientes referidos ya te compraron</div>
        </div>
      )}
    </div>
  )
}

function Tarjeta({ icono, titulo, detalle, onClick, accion }: { icono: React.ReactNode; titulo: string; detalle: string; onClick?: () => void; accion?: string }) {
  return (
    <button onClick={onClick} className="rounded-3xl bg-white/[.04] p-4 text-left ring-1 ring-white/[.07] transition hover:bg-white/[.06]">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-naranja/15 text-naranja">{icono}</span>
      <div className="mt-3 font-display text-2xl font-bold">{titulo}</div>
      <div className="text-xs text-white/45">{detalle}</div>
      {accion && <div className="mt-2 text-xs font-semibold text-naranja">{accion} →</div>}
    </button>
  )
}

function Atajo({ icono, titulo, detalle, onClick }: { icono: React.ReactNode; titulo: string; detalle: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-4 rounded-3xl bg-white/[.04] p-5 text-left ring-1 ring-white/[.07] transition hover:bg-white/[.07]">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-tinta transition group-hover:bg-naranja group-hover:text-white">{icono}</span>
      <div className="min-w-0 flex-1"><div className="font-semibold">{titulo}</div><div className="truncate text-sm text-white/45">{detalle}</div></div>
      <ChevronRight className="shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-white" size={18} />
    </button>
  )
}

function Referidos({ d, referidos, ahora }: { d: Distribuidor; referidos: Lead[]; ahora: number }) {
  const { cambiar } = useStore()
  const aviso = useAviso()
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
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Referidos</h1>
      <p className="mt-1 text-white/50">Clientes de tu zona que llegaron por la web, Instagram o WhatsApp de SICHAR. Respóndeles en menos de 2 horas para mantener tu prioridad.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {referidos.length === 0 && <p className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45 md:col-span-2">Aún no tienes referidos. Cuando alguien de tu zona cotice en la web de SICHAR, aparecerá aquí.</p>}
        <AnimatePresence initial={false}>
          {referidos.slice(0, 12).map((l) => {
            const restante = l.creado + 2 * HORA - ahora
            const nuevo = l.etapa === 'nuevo'
            return (
              <motion.div key={l.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-3xl p-5 ring-1 ${nuevo ? 'bg-naranja/[.08] ring-naranja/40' : 'bg-white/[.04] ring-white/[.07]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-display text-xl font-bold">{l.empresa ?? l.nombre}</div>
                    <div className="text-sm text-white/45">{l.nombre} · {haceCuanto(l.creado, ahora)}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${l.etapa === 'ganado' ? 'bg-emerald-500/20 text-emerald-300' : l.etapa === 'perdido' ? 'bg-white/10 text-white/50' : nuevo ? 'bg-naranja text-white' : 'bg-sky-500/15 text-sky-300'}`}>{l.etapa}</span>
                </div>
                <p className="mt-3 text-sm text-white/70">{l.interes}</p>
                {nuevo && (
                  <div className={`mt-3 flex items-center gap-2 text-xs font-semibold ${restante > 0 ? 'text-amber-300' : 'text-red-300'}`}>
                    <Clock size={13} /> {restante > 0 ? `Responde en ${Math.floor(restante / HORA)} h ${Math.floor((restante % HORA) / 60000)} min` : 'Tiempo de respuesta vencido'}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={waLink(l.telefono, `Hola ${l.nombre.split(' ')[0]}, te escribo de ${d.nombre}, distribuidor aliado SICHAR. Recibimos tu solicitud, ¿cuándo te podemos visitar?`)} target="_blank" rel="noreferrer" onClick={() => nuevo && actualizar(l.id, 'contactado')} className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white"><MessageCircle size={16} /> WhatsApp</a>
                  {!['ganado', 'perdido'].includes(l.etapa) && (
                    <>
                      <button className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-tinta" onClick={() => { actualizar(l.id, 'ganado'); aviso({ titulo: '¡Venta registrada!', texto: 'SICHAR ya lo ve en su tablero.', tipo: 'exito' }) }}><Check size={15} /> Vendido</button>
                      <button className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white/50 ring-1 ring-white/10" onClick={() => actualizar(l.id, 'perdido')}><X size={15} /> No compró</button>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Pedir({ d, irA }: { d: Distribuidor; irA: (t: Pestaña) => void }) {
  const { s, cambiar } = useStore()
  const aviso = useAviso()
  const [carrito, setCarrito] = useState<Record<string, number>>({})
  const [abierto, setAbierto] = useState(false)
  const beneficio = NIVELES.find((n) => n.nombre === d.nivel)?.beneficio ?? 0
  const items = Object.entries(carrito).filter(([, n]) => n > 0)
  const subtotal = items.reduce((a, [pid, n]) => a + n * s.productos.find((p) => p.id === pid)!.precioDistribuidor, 0)
  const ultimo = s.pedidos.filter((p) => p.distribuidorId === d.id).sort((a, b) => b.fecha - a.fecha)[0]
  const sumar = (pid: string, n: number) => setCarrito((c) => ({ ...c, [pid]: Math.max(0, (c[pid] ?? 0) + n) }))

  const pedir = () => {
    cambiar((c) => {
      const lista = items.map(([productoId, cantidad]) => ({ productoId, cantidad }))
      c.s.pedidos.unshift({ id: uid('pe'), distribuidorId: d.id, fecha: c.ahora, items: lista, total: subtotal * (1 - beneficio), estado: 'recibido', canal: 'portal' })
      const x = c.s.distribuidores.find((y) => y.id === d.id)!
      x.ultimoPedido = c.ahora
      x.ventas6m[5] += subtotal
      for (const it of lista) {
        const p = c.s.productos.find((y) => y.id === it.productoId)!
        p.stock[d.ciudad] = Math.max(0, p.stock[d.ciudad] - it.cantidad)
      }
      c.s.notificaciones.unshift({ id: uid('n'), fecha: c.ahora, texto: `Pedido por portal: ${d.nombre} · ${fmtCOP(subtotal)}`, tipo: 'exito', leida: false, enlace: '/canal' })
    })
    setCarrito({})
    setAbierto(false)
    aviso({ titulo: 'Pedido recibido', texto: `Lo alistamos hoy en la sede ${d.ciudad}.`, tipo: 'exito' })
    irA('pedidos')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Hacer pedido</h1>
          <p className="mt-1 text-white/50">Precios de aliado · stock disponible en la sede {d.ciudad}{beneficio ? ` · ${beneficio * 100} % de beneficio ${d.nivel}` : ''}</p>
        </div>
        {ultimo && (
          <button onClick={() => setCarrito(Object.fromEntries(ultimo.items.map((i) => [i.productoId, i.cantidad])))} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/5"><RotateCcw size={15} /> Repetir último pedido</button>
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {s.productos.filter((p) => !p.lineaDirecta).map((p) => {
          const n = carrito[p.id] ?? 0
          const paso = p.unidad === 'm²' ? 20 : 5
          const stock = p.stock[d.ciudad]
          return (
            <div key={p.id} className={`overflow-hidden rounded-3xl ring-1 transition ${n ? 'bg-naranja/[.08] ring-naranja/50' : 'bg-white/[.04] ring-white/[.07]'}`}>
              <div className="relative aspect-[4/3]">
                <Muestra p={p} className="h-full w-full" escala={p.unidad === 'm²' ? 1.4 : 2} />
                {stock < 100 && <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-tinta">Pocas unidades</span>}
                <AnimatePresence>{n > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-2 top-2 grid h-8 min-w-8 place-items-center rounded-full bg-naranja px-2 text-sm font-bold">{n}</motion.span>}</AnimatePresence>
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-semibold">{p.nombre.replace('Porcelanato ', '')}</div>
                <div className="text-xs text-white/45">{fmtCOP(p.precioDistribuidor)}/{p.unidad} · {stock.toLocaleString('es-CO')} disp.</div>
                <div className="mt-3 flex items-center justify-between rounded-full bg-black/40 p-1">
                  <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" onClick={() => sumar(p.id, -paso)} aria-label="Menos"><Minus size={14} /></button>
                  <span className="text-sm font-semibold">{n} {p.unidad}</span>
                  <button className="grid h-8 w-8 place-items-center rounded-full bg-white text-tinta" onClick={() => sumar(p.id, paso)} aria-label="Más"><Plus size={14} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {items.length > 0 && (
          <motion.div initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-xl md:bottom-6">
            <button onClick={() => setAbierto(true)} className="flex w-full items-center gap-4 rounded-2xl bg-naranja p-4 text-left shadow-[0_20px_60px_-10px_rgba(244,121,32,.7)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20"><Package size={20} /></span>
              <div className="flex-1"><div className="font-semibold">{items.length} referencia{items.length > 1 ? 's' : ''} en el pedido</div><div className="text-sm text-white/80">{fmtCOP(subtotal * (1 - beneficio))}{beneficio ? ` con tu beneficio ${d.nivel}` : ''}</div></div>
              <span className="font-semibold">Revisar →</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {abierto && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAbierto(false)} />
            <motion.div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85vh] max-w-xl overflow-y-auto rounded-t-3xl bg-[#161616] p-6 ring-1 ring-white/10" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 280 }}>
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
              <h2 className="font-display text-2xl font-bold">Tu pedido</h2>
              <ul className="mt-4 grid gap-2">
                {items.map(([pid, n]) => {
                  const p = s.productos.find((x) => x.id === pid)!
                  return (
                    <li key={pid} className="flex items-center gap-3 rounded-2xl bg-white/[.04] p-2 pr-4">
                      <Muestra p={p} className="h-12 w-12 rounded-xl" escala={0.8} />
                      <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{p.nombre}</div><div className="text-xs text-white/45">{n} {p.unidad}</div></div>
                      <span className="text-sm font-semibold">{fmtCOP(n * p.precioDistribuidor)}</span>
                    </li>
                  )
                })}
              </ul>
              <dl className="mt-5 grid gap-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-white/50">Subtotal</dt><dd>{fmtCOP(subtotal)}</dd></div>
                {beneficio > 0 && <div className="flex justify-between text-emerald-300"><dt>Beneficio Aliado {d.nivel}</dt><dd>− {fmtCOP(subtotal * beneficio)}</dd></div>}
                <div className="mt-2 flex justify-between border-t border-white/10 pt-3 font-display text-2xl font-bold"><dt>Total</dt><dd>{fmtCOP(subtotal * (1 - beneficio))}</dd></div>
              </dl>
              <button onClick={pedir} className="btn-primario mt-6 w-full !py-4 !text-base">Confirmar pedido</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function Pedidos({ d }: { d: Distribuidor }) {
  const { s, ahora } = useStore()
  const pedidos = s.pedidos.filter((p) => p.distribuidorId === d.id).sort((a, b) => b.fecha - a.fecha).slice(0, 10)
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Mis pedidos</h1>
      <p className="mt-1 text-white/50">Del alistamiento en la sede {d.ciudad} hasta tu bodega.</p>
      <div className="mt-6 grid gap-3">
        {pedidos.map((p, k) => {
          // El estado avanza con el tiempo desde la fecha del pedido.
          const dias = (ahora - p.fecha) / DIA
          const paso = p.estado === 'entregado' || dias > 6 ? 3 : dias > 3 ? 2 : dias > 0.5 ? 1 : ESTADOS.indexOf(p.estado)
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.04 }} className="rounded-3xl bg-white/[.04] p-5 ring-1 ring-white/[.07]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-display text-xl font-bold">{fmtCOP(p.total)}</div>
                  <div className="text-sm text-white/45">{fmtFecha(p.fecha, true)} · {p.items.length} referencia{p.items.length > 1 ? 's' : ''} · vía {p.canal}</div>
                </div>
                <div className="flex -space-x-2">{p.items.slice(0, 4).map((i) => <Muestra key={i.productoId} p={s.productos.find((x) => x.id === i.productoId)!} className="h-9 w-9 rounded-full ring-2 ring-[#161616]" escala={0.6} />)}</div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-1">
                {ESTADOS.map((e, i) => (
                  <div key={e}>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div className="h-full bg-naranja" initial={{ width: 0 }} animate={{ width: i <= paso ? '100%' : '0%' }} transition={{ duration: 0.6, delay: 0.2 + i * 0.25 }} />
                    </div>
                    <div className={`mt-2 text-[11px] font-semibold capitalize ${i <= paso ? 'text-white' : 'text-white/30'}`}>{e}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
        {pedidos.length === 0 && <p className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">Todavía no tienes pedidos por el portal.</p>}
      </div>
    </div>
  )
}

function Obras({ d, ahora, registrar }: { d: Distribuidor; ahora: number; registrar: () => void }) {
  const { s } = useStore()
  const obras = s.proyectos.filter((p) => p.distribuidorId === d.id)
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Obras protegidas</h1>
          <p className="mt-1 max-w-xl text-white/50">Registra las obras que atiendes. Durante 180 días, si la constructora le escribe a SICHAR, la enviamos contigo.</p>
        </div>
        <button onClick={registrar} className="btn-primario !py-3"><Plus size={16} /> Registrar obra</button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {obras.length === 0 && <p className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45 md:col-span-2">Aún no has registrado obras.</p>}
        {obras.map((p) => {
          const total = p.vence - p.registrado
          const queda = Math.max(0, p.vence - ahora)
          const frac = queda / total
          const R = 26
          const C = 2 * Math.PI * R
          return (
            <div key={p.id} className="flex items-center gap-5 rounded-3xl bg-white/[.04] p-5 ring-1 ring-white/[.07]">
              <svg width="68" height="68" className="shrink-0 -rotate-90">
                <circle cx="34" cy="34" r={R} stroke="rgba(255,255,255,.1)" strokeWidth="6" fill="none" />
                <motion.circle cx="34" cy="34" r={R} stroke={frac > 0 ? '#F47920' : '#555'} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - frac) }} transition={{ duration: 1.2 }} />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-xl font-bold">{p.obra}</div>
                <div className="text-sm text-white/45">{p.constructora} · {p.m2.toLocaleString('es-CO')} m²</div>
                <div className={`mt-1 text-sm font-semibold ${frac > 0 ? 'text-naranja-200' : 'text-white/40'}`}>{frac > 0 ? `Protegida ${Math.ceil(queda / DIA)} días más` : 'Protección vencida'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
