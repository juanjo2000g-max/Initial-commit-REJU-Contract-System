import {
  Bell,
  Calculator,
  Clock,
  FileText,
  Globe,
  LayoutDashboard,
  Megaphone,
  Menu,
  Network,
  Palette,
  Settings,
  Store,
  Users,
  Workflow,
  X,
  Kanban,
  LayoutGrid,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo, useAviso } from '../../components/ui'
import { semaforoCanal } from '../../lib/semaforo'
import { useStore } from '../../lib/store'
import { fmtFecha, haceCuanto } from '../../lib/util'
import { urlApp } from '../../lib/apps'

const GRUPOS = [
  {
    titulo: 'Gerencia',
    items: [
      { to: '/', icono: LayoutDashboard, texto: 'Tablero', fin: true },
      { to: '/canal', icono: Network, texto: 'Canal y aliados' },
      { to: '/costos', icono: Calculator, texto: 'Costos y márgenes' },
    ],
  },
  {
    titulo: 'Comercial',
    items: [
      { to: '/pipeline', icono: Kanban, texto: 'Pipeline CRM' },
      { to: '/clientes', icono: Users, texto: 'Clientes y visitas' },
      { to: '/cotizaciones', icono: FileText, texto: 'Cotizaciones' },
      { to: '/asesoria', icono: Palette, texto: 'Mesa de Asesoría' },
    ],
  },
  {
    titulo: 'Marketing y operación',
    items: [
      { to: '/contenido', icono: Megaphone, texto: 'Contenido y redes' },
      { to: '/automatizaciones', icono: Workflow, texto: 'Automatizaciones' },
      { to: '/ajustes', icono: Settings, texto: 'Ajustes' },
    ],
  },
]

export default function Layout() {
  const { s, ahora, avanzarDias, cambiar } = useStore()
  const aviso = useAviso()
  const [menu, setMenu] = useState(false)
  const [notis, setNotis] = useState(false)
  const loc = useLocation()
  const sinLeer = s.notificaciones.filter((n) => !n.leida).length
  const canal = semaforoCanal(s, ahora)
  const tareasAbiertas = s.tareas.filter((t) => !t.hecha).length

  const simular = (dias: number) => {
    const evs = avanzarDias(dias)
    aviso({ titulo: `Pasaron ${dias} día${dias > 1 ? 's' : ''}`, texto: evs.length ? `${evs.length} automatización(es) se dispararon.` : 'Ninguna regla se disparó.', tipo: evs.length ? 'exito' : 'info' })
  }

  const lateral = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4 scroll-fino">
      <Link to="/" className="px-2 pt-1"><Logo claro /></Link>
      <div className={`mx-1 rounded-xl p-3 text-xs ring-1 ${canal.luz === 'verde' ? 'bg-emerald-500/10 ring-emerald-500/30' : canal.luz === 'amarillo' ? 'bg-amber-400/10 ring-amber-400/30' : 'bg-red-500/10 ring-red-500/30'}`}>
        <div className="flex items-center gap-2 font-semibold text-white">
          <span className={`h-2.5 w-2.5 rounded-full ${canal.luz === 'verde' ? 'bg-emerald-400' : canal.luz === 'amarillo' ? 'bg-amber-400' : 'bg-red-500 animate-pulse'}`} />
          Semáforo de canal: {canal.luz}
        </div>
        <div className="mt-1 text-white/50">{canal.rojos.length} en rojo · {canal.amarillos.length} en amarillo</div>
      </div>
      {GRUPOS.map((g) => (
        <div key={g.titulo}>
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/35">{g.titulo}</div>
          <div className="grid gap-0.5">
            {g.items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.fin} onClick={() => setMenu(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                <it.icono size={18} />
                {it.texto}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-auto grid gap-2 border-t border-white/10 pt-4">
        <a href={urlApp('web')} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"><Globe size={18} /> Sitio web SICHAR</a>
        <a href={urlApp('portal')} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"><Store size={18} /> Portal de aliados</a>
        <a href={urlApp('hub')} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"><LayoutGrid size={18} /> Centro de mando</a>
        <div className="px-3 pt-2 text-[11px] text-white/30">SICHAR OS · desarrollado por Pragmos</div>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#F3F1EC]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-tinta lg:block">{lateral}</aside>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-tinta">
            <button className="absolute right-3 top-3 text-white/60" onClick={() => setMenu(false)}><X /></button>
            {lateral}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="no-imprimir sticky top-0 z-20 flex items-center gap-3 border-b border-black/5 bg-[#F3F1EC]/85 px-4 py-3 backdrop-blur md:px-8">
          <button className="btn-fantasma !p-2 lg:hidden" onClick={() => setMenu(true)}><Menu size={20} /></button>
          <div className="hidden items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs ring-1 ring-black/5 sm:flex" title="Simulador de tiempo para la demostración: adelanta los días y mira qué automatizaciones se disparan">
            <Clock size={14} className="text-naranja" />
            <span className="font-semibold">{fmtFecha(ahora)}</span>
            {s.desfaseDias > 0 && <span className="text-black/45">(+{s.desfaseDias} d simulados)</span>}
            <span className="mx-1 h-4 w-px bg-black/10" />
            <button className="rounded-md px-1.5 py-0.5 font-semibold hover:bg-naranja-50 hover:text-naranja-700" onClick={() => simular(1)}>+1 día</button>
            <button className="rounded-md px-1.5 py-0.5 font-semibold hover:bg-naranja-50 hover:text-naranja-700" onClick={() => simular(7)}>+7 días</button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="hidden text-xs font-medium text-black/50 md:block">{tareasAbiertas} tareas abiertas</Link>
            <div className="relative">
              <button className="btn-claro relative !p-2" onClick={() => setNotis(!notis)} aria-label="Notificaciones">
                <Bell size={18} />
                {sinLeer > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-naranja px-1 text-[10px] font-bold text-white">{sinLeer}</span>}
              </button>
              {notis && (
                <div className="absolute right-0 top-12 w-[min(360px,90vw)] tarjeta animate-entrar overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                    <span className="font-semibold">Notificaciones</span>
                    <button className="text-xs font-semibold text-naranja" onClick={() => cambiar((c) => c.s.notificaciones.forEach((n) => (n.leida = true)))}>Marcar leídas</button>
                  </div>
                  <div className="max-h-96 overflow-auto scroll-fino">
                    {s.notificaciones.length === 0 && <div className="p-6 text-center text-sm text-black/45">Sin notificaciones todavía.</div>}
                    {s.notificaciones.map((n) => (
                      <Link key={n.id} to={n.enlace ?? loc.pathname} onClick={() => setNotis(false)} className={`flex gap-3 border-b border-black/5 px-4 py-3 text-sm hover:bg-black/[.02] ${n.leida ? 'opacity-60' : ''}`}>
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.tipo === 'alerta' ? 'bg-red-500' : n.tipo === 'exito' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                        <div>
                          <div>{n.texto}</div>
                          <div className="text-xs text-black/40">{haceCuanto(n.fecha, ahora)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white py-1 pl-1 pr-3 ring-1 ring-black/5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-tinta text-xs font-bold text-white">GG</span>
              <div className="hidden text-xs leading-tight sm:block">
                <div className="font-semibold">Gerencia general</div>
                <div className="text-black/45">Cali</div>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
