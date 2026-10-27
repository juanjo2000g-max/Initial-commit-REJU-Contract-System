import { ArrowRight, CheckCircle2, Circle, Gauge, HandCoins, Timer, TrendingUp, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ETAPAS, Kpi, PuntoLuz, SEGMENTOS } from '../../components/ui'
import { semaforoCanal } from '../../lib/semaforo'
import { useStore } from '../../lib/store'
import { DIA, HORA, SEDES, fmtCOP, fmtFecha, fmtM, fmtPct, haceCuanto, sum } from '../../lib/util'
import { urlApp } from '../../lib/apps'
import { Actividad, MapaSedes, NumeroVivo } from '../Vivo'

const fmtMVivo = (n: number) => fmtM(n)
const fmtEntero = (n: number) => Math.round(n).toLocaleString('es-CO')

const COLORES_SEDE = ['#F47920', '#E8E2D8', '#2E5E8C', '#2E8B57', '#D68910']
const MESES = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct']

export default function Tablero() {
  const { s, ahora, cambiar } = useStore()
  const abiertos = s.leads.filter((l) => !['ganado', 'perdido'].includes(l.etapa))
  const ganados = s.leads.filter((l) => l.etapa === 'ganado')
  const conResp = s.leads.filter((l) => l.primeraRespuesta)
  const tResp = conResp.length ? sum(conResp, (l) => l.primeraRespuesta! - l.creado) / conResp.length / HORA : 0
  const canal = semaforoCanal(s, ahora)
  const top = [...s.distribuidores].sort((a, b) => sum(b.ventas6m, (x) => x) - sum(a.ventas6m, (x) => x)).slice(0, 20)
  const retenidos = top.filter((d) => ahora - d.ultimoPedido < 45 * DIA).length
  const referidos = s.leads.filter((l) => l.asignadoTipo === 'distribuidor')
  const refGanados = referidos.filter((l) => l.etapa === 'ganado')
  const quejasCriticas = s.quejas.filter((q) => q.critica && !q.resuelta).length
  const visitasMes = s.visitas.filter((v) => ahora - v.fecha < 30 * DIA).length
  const hoy = s.leads.filter((l) => ahora - l.creado < DIA)
  const hoyAliados = hoy.filter((l) => l.asignadoTipo === 'distribuidor').length
  const hora = new Date(ahora).getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const ventasSede = MESES.map((m, i) => ({
    mes: m,
    ...Object.fromEntries(SEDES.map((sd) => [sd, Math.round(sum(s.distribuidores.filter((d) => d.ciudad === sd), (d) => d.ventas6m[i]) / 1e6)])),
  }))
  const embudo = ETAPAS.filter((e) => e.id !== 'perdido').map((e) => ({ etapa: e.nombre, n: s.leads.filter((l) => l.etapa === e.id).length, valor: sum(s.leads.filter((l) => l.etapa === e.id), (l) => l.valor) }))
  const porFuente = Object.entries(s.leads.reduce<Record<string, number>>((a, l) => ((a[l.fuente] = (a[l.fuente] ?? 0) + 1), a), {})).map(([k, v]) => ({ nombre: k, v }))
  const tareas = s.tareas.filter((t) => !t.hecha).sort((a, b) => a.vence - b.vence).slice(0, 7)

  const metas = [
    { t: 'Retención top 20 distribuidores', actual: retenidos / top.length, meta: 0.95, txt: `${retenidos}/${top.length}` },
    { t: 'Leads respondidos en < 48 h', actual: conResp.filter((l) => l.primeraRespuesta! - l.creado < 48 * HORA).length / Math.max(1, s.leads.length), meta: 1, txt: '' },
    { t: 'Referencias críticas con 2+ proveedores', actual: s.productos.filter((p) => p.alternativos.some((a) => a.validado)).length / s.productos.length, meta: 1, txt: '' },
    { t: 'Quejas críticas de canal (meta: 0)', actual: quejasCriticas === 0 ? 1 : 0, meta: 1, txt: `${quejasCriticas} abiertas` },
  ]

  return (
    <div className="grid gap-6 animate-entrar">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="relative min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1611] via-[#121212] to-[#0e0e0e] p-6 ring-1 ring-white/[.07] md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-naranja/20 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/45">{fmtFecha(ahora)} · Vista de gerencia</p>
              <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight md:text-5xl">{saludo}, gerencia.</h1>
              <p className="mt-2 max-w-xl text-white/55">
                {hoy.length > 0 ? <>Hoy entraron <b className="text-white">{hoy.length} clientes</b>; {hoyAliados} se enviaron a distribuidores aliados.</> : <>Así va la operación de las cinco sedes.</>}
              </p>
            </div>
            <div className="flex gap-2">
              <a href={urlApp('hub', '/presentacion')} className="btn-claro">Modo presentación</a>
              <Link to="/pipeline" className="btn-primario">Pipeline <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['Pipeline abierto', sum(abiertos, (l) => l.valor), fmtMVivo, `${abiertos.length} oportunidades`],
              ['Ventas ganadas', sum(ganados, (l) => l.valor), fmtMVivo, `${ganados.length} cierres`],
              ['Clientes hoy', hoy.length, fmtEntero, 'web, WhatsApp, redes y visitas'],
              ['Referidos a aliados', referidos.length, fmtEntero, `${refGanados.length} ya compraron`],
            ].map(([t, v, f, d]) => (
              <div key={t as string} className="rounded-2xl bg-white/[.04] p-4 ring-1 ring-white/[.06]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{t as string}</div>
                <NumeroVivo valor={v as number} formato={f as (n: number) => string} className="mt-2 block whitespace-nowrap font-display text-2xl font-bold tracking-tight 2xl:text-3xl" />
                <div className="mt-1 text-xs text-white/40">{d as string}</div>
              </div>
            ))}
          </div>
          <div className="relative mt-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-naranja" /> Actividad en tiempo real</div>
            <Actividad s={s} ahora={ahora} />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-[#101010] p-6 ring-1 ring-white/[.07]">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Ventas del canal por sede</h2>
            <span className="text-xs text-white/40">mes en curso</span>
          </div>
          <div className="mx-auto mt-2 aspect-[42/48] max-h-[560px]">
            <MapaSedes s={s} ahora={ahora} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <Kpi titulo="Pipeline abierto" valor={fmtM(sum(abiertos, (l) => l.valor))} detalle={`${abiertos.length} oportunidades`} icono={<TrendingUp size={16} />} />
        <Kpi titulo="Ventas ganadas" valor={fmtM(sum(ganados, (l) => l.valor))} detalle={`${ganados.length} cierres`} tono="bueno" icono={<HandCoins size={16} />} />
        <Kpi titulo="1.ª respuesta" valor={`${tResp.toFixed(1).replace('.', ',')} h`} detalle={tResp < 24 ? 'Meta < 24 h ✓' : 'Meta < 24 h'} tono={tResp < 24 ? 'bueno' : 'malo'} icono={<Timer size={16} />} />
        <Kpi titulo="Retención top 20" valor={fmtPct(retenidos / top.length)} detalle="Meta ≥ 95 %" tono={retenidos / top.length >= 0.95 ? 'bueno' : 'malo'} icono={<Users size={16} />} />
        <Kpi titulo="Referidos a aliados" valor={referidos.length} detalle={`${refGanados.length} convertidos en venta`} tono="marca" icono={<Zap size={16} />} />
        <Kpi titulo="Visitas registradas" valor={visitasMes} detalle="últimos 30 días" icono={<Gauge size={16} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="tarjeta p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Ventas del canal por sede (millones COP)</h2>
            <span className="text-xs text-white/40">Últimos 6 meses</span>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={ventasSede}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', background: '#1b1b1b', color: '#fff' }} formatter={(v) => `$ ${v} M`} />
                {SEDES.map((sd, i) => (
                  <Area key={sd} type="monotone" dataKey={sd} stackId="1" stroke={COLORES_SEDE[i]} fill={COLORES_SEDE[i]} fillOpacity={0.75} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            {SEDES.map((sd, i) => (
              <span key={sd} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORES_SEDE[i] }} />{sd}</span>
            ))}
          </div>
        </div>

        <div className={`tarjeta p-5 ${canal.luz === 'rojo' ? 'ring-red-500/30' : ''}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Semáforo de canal</h2>
            <Link to="/canal" className="text-xs font-semibold text-naranja">Ver detalle</Link>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex flex-col gap-1.5 rounded-2xl bg-black p-2.5 ring-1 ring-white/10">
              {(['rojo', 'amarillo', 'verde'] as const).map((l) => (
                <span key={l} className={`h-6 w-6 rounded-full ${canal.luz === l ? (l === 'rojo' ? 'bg-red-500 shadow-[0_0_16px_4px_rgba(239,68,68,.6)]' : l === 'amarillo' ? 'bg-amber-400 shadow-[0_0_16px_4px_rgba(251,191,36,.6)]' : 'bg-emerald-400 shadow-[0_0_16px_4px_rgba(52,211,153,.6)]') : 'bg-white/10'}`} />
              ))}
            </div>
            <p className="text-sm text-white/65">{canal.decision}</p>
          </div>
          <div className="mt-4 grid gap-2">
            {[...canal.rojos, ...canal.amarillos].slice(0, 4).map((x) => (
              <div key={x.d.id} className="flex items-center gap-2 rounded-xl bg-white/[.04] px-3 py-2 text-sm">
                <PuntoLuz luz={x.luz} />
                <span className="font-medium">{x.d.nombre}</span>
                <span className="ml-auto truncate text-xs text-white/45">{x.motivos[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="tarjeta p-5">
          <h2 className="font-semibold">Embudo comercial</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={embudo} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="etapa" tickLine={false} axisLine={false} fontSize={12} width={85} />
                <Tooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', background: '#1b1b1b', color: '#fff' }} formatter={(v, _n, p) => [`${v} leads · ${fmtCOP(p.payload.valor)}`, '']} />
                <Bar dataKey="n" radius={[0, 8, 8, 0]}>
                  {embudo.map((_, i) => <Cell key={i} fill={i === embudo.length - 1 ? '#2E8B57' : `rgba(244,121,32,${1 - i * 0.15})`} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-semibold">¿De dónde llegan los clientes?</h2>
          <div className="mt-2 flex items-center">
            <div className="h-56 w-1/2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={porFuente} dataKey="v" nameKey="nombre" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {porFuente.map((_, i) => <Cell key={i} fill={['#F47920', '#E8E2D8', '#2E5E8C', '#2E8B57', '#D68910', '#8E44AD'][i % 6]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid flex-1 gap-1.5 text-sm">
              {porFuente.map((f, i) => (
                <li key={f.nombre} className="flex items-center gap-2 capitalize"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: ['#F47920', '#E8E2D8', '#2E5E8C', '#2E8B57', '#D68910', '#8E44AD'][i % 6] }} />{f.nombre}<span className="ml-auto font-semibold">{f.v}</span></li>
              ))}
            </ul>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(SEGMENTOS) as (keyof typeof SEGMENTOS)[]).map((k) => (
              <span key={k} className={`chip ${SEGMENTOS[k].color}`}>{SEGMENTOS[k].nombre}: {s.leads.filter((l) => l.segmento === k).length}</span>
            ))}
          </div>
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-semibold">Metas a 12 meses</h2>
          <p className="text-xs text-white/45">Del informe de consultoría · a validar con la línea base</p>
          <div className="mt-4 grid gap-4">
            {metas.map((m) => (
              <div key={m.t}>
                <div className="flex justify-between text-sm"><span>{m.t}</span><span className="font-semibold">{m.txt || fmtPct(m.actual)}</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${m.actual >= m.meta ? 'bg-emerald-500' : 'bg-naranja'}`} style={{ width: `${Math.min(100, (m.actual / m.meta) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="tarjeta p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tareas pendientes</h2>
            <span className="text-xs text-white/40">Creadas por el equipo y las automatizaciones</span>
          </div>
          <ul className="mt-3 divide-y divide-white/5">
            {tareas.map((t) => {
              const vencida = t.vence < ahora
              const resp = s.vendedores.find((v) => v.id === t.responsable)?.nombre ?? s.distribuidores.find((d) => d.id === t.responsable)?.nombre ?? t.responsable
              return (
                <li key={t.id} className="flex items-start gap-3 py-3">
                  <button onClick={() => cambiar((c) => { const x = c.s.tareas.find((y) => y.id === t.id); if (x) x.hecha = true })} className="mt-0.5 text-white/30 hover:text-emerald-400" aria-label="Completar">
                    <Circle size={18} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{t.titulo}</div>
                    <div className="truncate text-xs text-white/50">{t.detalle}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className={`chip ${t.prioridad === 'alta' ? 'bg-red-500/15 text-red-300' : t.prioridad === 'media' ? 'bg-amber-500/15 text-amber-300' : 'bg-zinc-500/15 text-zinc-400'}`}>{t.prioridad}</span>
                      <span className="text-white/45">{resp} · {vencida ? <b className="text-red-400">vencida</b> : `vence ${fmtFecha(t.vence, true)}`}</span>
                      <span className="text-white/35">· {t.origen}</span>
                    </div>
                  </div>
                  {t.leadId && <Link to={`/pipeline/${t.leadId}`} className="text-xs font-semibold text-naranja">Abrir</Link>}
                </li>
              )
            })}
            {tareas.length === 0 && <li className="flex items-center gap-2 py-6 text-sm text-white/45"><CheckCircle2 size={18} className="text-emerald-400" /> Todo al día.</li>}
          </ul>
        </div>
        <div className="tarjeta p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Automatizaciones en vivo</h2>
            <Link to="/automatizaciones" className="text-xs font-semibold text-naranja">Ver todas</Link>
          </div>
          <ul className="mt-3 grid gap-2">
            {s.eventos.slice(0, 7).map((e) => (
              <li key={e.id} className="flex gap-3 rounded-xl bg-white/[.04] p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-naranja text-white"><Zap size={15} /></span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{e.titulo}</div>
                  <div className="truncate text-xs text-white/50">{e.detalle}</div>
                </div>
                <span className="ml-auto shrink-0 text-[11px] text-white/40">{haceCuanto(e.fecha, ahora)}</span>
              </li>
            ))}
            {s.eventos.length === 0 && <li className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/45">Aún no hay ejecuciones. Envía una solicitud desde la Vitrina o adelanta el tiempo con “+7 días”.</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
