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
  Radio,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Comandos } from '../Comandos'
import { useEnVivo } from '../EnVivo'
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

  const nav = useNavigate()
  const [buscar, setBuscar] = useState(false)
  const [enVivo, setEnVivo] = useState(() => {
    try {
      return sessionStorage.getItem('crm:en-vivo') === '1'
    } catch {
      return false
    }
  })
  useEnVivo(enVivo)
  const alternarEnVivo = () => {
    const nuevo = !enVivo
    setEnVivo(nuevo)
    try {
      sessionStorage.setItem('crm:en-vivo', nuevo ? '1' : '0')
    } catch {
      /* sin almacenamiento */
    }
    aviso({ titulo: nuevo ? 'Modo en vivo activado' : 'Modo en vivo detenido', texto: nuevo ? 'Cada pocos segundos entrará actividad real simulada.' : undefined, tipo: 'info' })
  }
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setBuscar((x) => !x)
      }
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [])

  const simular = (dias: number) => {
    const evs = avanzarDias(dias)
    aviso({ titulo: `Pasaron ${dias} día${dias > 1 ? 's' : ''}`, texto: evs.length ? `${evs.length} automatización(es) se dispararon.` : 'Ninguna regla se disparó.', tipo: evs.length ? 'exito' : 'info' })
  }

  const acciones = useMemo(
    () => [
      { titulo: 'Nuevo lead', detalle: 'Registrar un cliente a mano', hacer: () => nav('/pipeline?nuevo=1') },
      { titulo: 'Nueva cotización', detalle: 'Abrir el cotizador', hacer: () => nav('/cotizaciones/nueva') },
      { titulo: 'Adelantar 7 días', detalle: 'Ver qué automatizaciones se disparan', hacer: () => simular(7) },
      { titulo: enVivo ? 'Detener modo en vivo' : 'Activar modo en vivo', detalle: 'Actividad simulada para la presentación', hacer: alternarEnVivo },
      { titulo: 'Abrir el sitio web', detalle: 'En otra pestaña', hacer: () => window.open(urlApp('web'), '_blank') },
      { titulo: 'Abrir el portal de aliados', detalle: 'En otra pestaña', hacer: () => window.open(urlApp('portal'), '_blank') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enVivo],
  )

  const lateral = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4 scroll-fino">
      <Link to="/" className="flex items-baseline gap-2 px-3 pt-2"><Logo /><span className="text-[11px] font-semibold uppercase tracking-[.2em] text-naranja">OS</span></Link>
      <Link to="/canal" onClick={() => setMenu(false)} className="mx-1 flex items-center gap-3 rounded-2xl bg-hueso px-3 py-3 text-xs transition hover:bg-black/[.05]">
        <span className="flex flex-col gap-1 rounded-full bg-tinta p-1">
          {(['rojo', 'amarillo', 'verde'] as const).map((l) => <span key={l} className={`h-1.5 w-1.5 rounded-full ${canal.luz === l ? (l === 'rojo' ? 'bg-red-500' : l === 'amarillo' ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-white/15'}`} />)}
        </span>
        <span>
          <span className="block font-semibold text-tinta">Canal en {canal.luz}</span>
          <span className="block text-tinta/50">{canal.rojos.length} en rojo · {canal.amarillos.length} en amarillo</span>
        </span>
      </Link>
      {GRUPOS.map((g) => (
        <div key={g.titulo}>
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.22em] text-tinta/35">{g.titulo}</div>
          <div className="grid gap-0.5">
            {g.items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.fin} onClick={() => setMenu(false)} className={({ isActive }) => `relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition ${isActive ? 'bg-hueso font-semibold text-tinta before:absolute before:-left-1 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-naranja' : 'text-tinta/60 hover:bg-hueso/70 hover:text-tinta'}`}>
                <it.icono size={17} strokeWidth={1.75} />
                {it.texto}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-auto grid gap-2 border-t border-black/[.08] pt-4">
        <a href={urlApp('web')} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-tinta/65 hover:bg-black/[.04] hover:text-tinta"><Globe size={18} /> Sitio web SICHAR</a>
        <a href={urlApp('portal')} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-tinta/65 hover:bg-black/[.04] hover:text-tinta"><Store size={18} /> Portal de aliados</a>
        <a href={urlApp('hub')} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-tinta/65 hover:bg-black/[.04] hover:text-tinta"><LayoutGrid size={18} /> Centro de mando</a>
        <div className="px-3 pt-2 text-[11px] text-tinta/35">SICHAR OS · desarrollado por Pragmos</div>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-hueso">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-black/[.06] bg-white lg:block">{lateral}</aside>
      {menu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/25" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white">
            <button className="absolute right-3 top-3 text-tinta/65" onClick={() => setMenu(false)}><X /></button>
            {lateral}
          </aside>
        </div>
      )}
      <div className="min-w-0 overflow-x-clip lg:pl-64">
        <header className="no-imprimir sticky top-0 z-20 flex items-center gap-3 border-b border-black/[.08] bg-hueso/80 px-4 py-3 backdrop-blur md:px-8">
          <button className="btn-fantasma !p-2 lg:hidden" onClick={() => setMenu(true)}><Menu size={20} /></button>
          <div className="hidden items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs ring-1 ring-black/[.08] sm:flex" title="Simulador de tiempo para la demostración: adelanta los días y mira qué automatizaciones se disparan">
            <Clock size={14} className="text-naranja" />
            <span className="font-semibold">{fmtFecha(ahora)}</span>
            {s.desfaseDias > 0 && <span className="text-tinta/50">(+{s.desfaseDias} d simulados)</span>}
            <span className="mx-1 h-4 w-px bg-black/[.06]" />
            <button className="rounded-md px-1.5 py-0.5 font-semibold hover:bg-naranja/10 hover:text-naranja-700" onClick={() => simular(1)}>+1 día</button>
            <button className="rounded-md px-1.5 py-0.5 font-semibold hover:bg-naranja/10 hover:text-naranja-700" onClick={() => simular(7)}>+7 días</button>
          </div>
          <button onClick={() => setBuscar(true)} className="hidden min-w-64 items-center gap-2 rounded-xl bg-black/[.03] px-3 py-2 text-sm text-tinta/45 ring-1 ring-black/[.08] transition hover:text-tinta/70 md:flex">
            <Search size={15} /> Buscar o ejecutar…
            <kbd className="ml-auto rounded-md bg-black/[.04] px-1.5 text-[11px]">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={alternarEnVivo} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition ${enVivo ? 'bg-red-500/15 text-red-700 ring-red-500/40' : 'text-tinta/65 ring-black/[.08] hover:text-tinta'}`}>
              {enVivo ? <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" /></span> : <Radio size={14} />}
              {enVivo ? 'EN VIVO' : 'Modo en vivo'}
            </button>
            <Link to="/" className="hidden text-xs font-medium text-tinta/55 xl:block">{tareasAbiertas} tareas abiertas</Link>
            <div className="relative">
              <button className="btn-claro relative !p-2" onClick={() => setNotis(!notis)} aria-label="Notificaciones">
                <Bell size={18} />
                {sinLeer > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-naranja px-1 text-[10px] font-bold text-white">{sinLeer}</span>}
              </button>
              {notis && (
                <div className="absolute right-0 top-12 w-[min(360px,90vw)] tarjeta animate-entrar overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-black/[.08] px-4 py-3">
                    <span className="font-semibold">Notificaciones</span>
                    <button className="text-xs font-semibold text-naranja" onClick={() => cambiar((c) => c.s.notificaciones.forEach((n) => (n.leida = true)))}>Marcar leídas</button>
                  </div>
                  <div className="max-h-96 overflow-auto scroll-fino">
                    {s.notificaciones.length === 0 && <div className="p-6 text-center text-sm text-tinta/50">Sin notificaciones todavía.</div>}
                    {s.notificaciones.map((n) => (
                      <Link key={n.id} to={n.enlace ?? loc.pathname} onClick={() => setNotis(false)} className={`flex gap-3 border-b border-black/[.08] px-4 py-3 text-sm hover:bg-black/[.03] ${n.leida ? 'opacity-60' : ''}`}>
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.tipo === 'alerta' ? 'bg-red-500' : n.tipo === 'exito' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                        <div>
                          <div>{n.texto}</div>
                          <div className="text-xs text-tinta/45">{haceCuanto(n.fecha, ahora)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white py-1 pl-1 pr-3 ring-1 ring-black/[.08]">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-naranja text-xs font-bold text-white">GG</span>
              <div className="hidden text-xs leading-tight sm:block">
                <div className="font-semibold">Gerencia general</div>
                <div className="text-tinta/50">Cali</div>
              </div>
            </div>
          </div>
        </header>
        <Comandos abierto={buscar} cerrar={() => setBuscar(false)} acciones={acciones} />
        <main className="mx-auto max-w-[1400px] p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
