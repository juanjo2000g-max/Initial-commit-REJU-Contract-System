import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { VERSION, crearSeed } from '../data/seed'
import type { Cotizacion, Estado, EventoAutomatizacion, Lead } from '../data/types'
import {
  type Contexto,
  type ResultadoLead,
  alAceptarCotizacion,
  alCrearLead,
  enviarWebhook,
  registrarBloqueoPolitica,
  revisarPolitica,
  revisionPeriodica,
} from './automatizaciones'
import { DIA, uid } from './util'

const CLAVE = 'sichar-os:estado'

function cargar(): Estado {
  try {
    const raw = localStorage.getItem(CLAVE)
    if (raw) {
      const s = JSON.parse(raw) as Estado
      if (s.version === VERSION) return s
    }
  } catch {
    /* almacenamiento no disponible: se usa la semilla */
  }
  return crearSeed()
}

type Mutador = (c: Contexto) => void

interface Store {
  s: Estado
  ahora: number
  /** Aplica un cambio y corre las reglas; los eventos generados se envían al webhook. */
  cambiar: (fn: Mutador) => EventoAutomatizacion[]
  crearLead: (datos: Omit<Lead, 'id' | 'creado' | 'actualizado' | 'actividades' | 'etiquetas' | 'etapa' | 'asignadoTipo'>) => { lead: Lead } & ResultadoLead
  guardarCotizacion: (c: Cotizacion, aprobadaGerencia?: boolean) => { ok: boolean; problemas: string[] }
  estadoCotizacion: (id: string, estado: Cotizacion['estado']) => void
  avanzarDias: (dias: number) => EventoAutomatizacion[]
  reiniciar: () => void
  ultimosEventos: EventoAutomatizacion[]
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Estado>(cargar)
  const [ultimosEventos, setUltimos] = useState<EventoAutomatizacion[]>([])
  const ref = useRef(s)
  ref.current = s
  const ahora = Date.now() + s.desfaseDias * DIA

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(s))
    } catch {
      /* sin persistencia */
    }
  }, [s])

  const cambiar = useCallback((fn: Mutador) => {
    const copia = structuredClone(ref.current)
    const c: Contexto = { s: copia, ahora: Date.now() + copia.desfaseDias * DIA, eventos: [] }
    fn(c)
    copia.eventos = copia.eventos.slice(0, 300)
    copia.notificaciones = copia.notificaciones.slice(0, 60)
    ref.current = copia
    setS(copia)
    if (c.eventos.length) {
      setUltimos(c.eventos)
      void enviarWebhook(copia.config.webhookUrl, c.eventos).then((r) => {
        if (r === 'omitido') return
        setS((prev) => ({
          ...prev,
          eventos: prev.eventos.map((e) => (c.eventos.some((x) => x.id === e.id) ? { ...e, webhook: r } : e)),
        }))
      })
    }
    return c.eventos
  }, [])

  // Revisión periódica al abrir la app.
  useEffect(() => {
    cambiar((c) => revisionPeriodica(c))
  }, [cambiar])

  const crearLead: Store['crearLead'] = useCallback(
    (datos) => {
      let out!: { lead: Lead } & ResultadoLead
      cambiar((c) => {
        const lead: Lead = {
          ...datos,
          id: uid('l'),
          etapa: 'nuevo',
          asignadoTipo: 'sin asignar',
          creado: c.ahora,
          actualizado: c.ahora,
          actividades: [{ id: uid('a'), fecha: c.ahora, tipo: 'sistema', texto: `Lead creado desde ${datos.fuente}`, autor: 'Sistema' }],
          etiquetas: [],
        }
        c.s.leads.unshift(lead)
        const r = alCrearLead(c, lead)
        out = { lead, ...r }
      })
      return out
    },
    [cambiar],
  )

  const guardarCotizacion: Store['guardarCotizacion'] = useCallback(
    (cot, aprobada = false) => {
      const problemas = revisarPolitica(cot, ref.current)
      const bloquear = problemas.length > 0 && !aprobada && cot.estado === 'enviada' && ref.current.reglas.find((r) => r.id === 'r7')?.activa
      cambiar((c) => {
        const final: Cotizacion = bloquear ? { ...cot, estado: 'borrador' } : cot
        const i = c.s.cotizaciones.findIndex((x) => x.id === cot.id)
        if (i >= 0) c.s.cotizaciones[i] = final
        else c.s.cotizaciones.unshift(final)
        const lead = c.s.leads.find((l) => l.id === cot.leadId)
        if (bloquear) {
          registrarBloqueoPolitica(c, final, problemas)
          return
        }
        if (lead && final.estado === 'enviada') {
          if (['nuevo', 'contactado'].includes(lead.etapa)) lead.etapa = 'cotizado'
          lead.primeraRespuesta ??= c.ahora
          lead.valor = Math.round(final.items.reduce((a, it) => a + it.cantidad * it.precio * (1 - it.descuento), 0))
          lead.actualizado = c.ahora
          lead.actividades.push({ id: uid('a'), fecha: c.ahora, tipo: 'cotizacion', texto: `Cotización ${final.numero} enviada${aprobada && problemas.length ? ' (aprobada por gerencia)' : ''}`, autor: 'Equipo comercial' })
        }
      })
      return { ok: !bloquear, problemas }
    },
    [cambiar],
  )

  const estadoCotizacion: Store['estadoCotizacion'] = useCallback(
    (id, estado) => {
      cambiar((c) => {
        const q = c.s.cotizaciones.find((x) => x.id === id)
        if (!q) return
        q.estado = estado
        if (estado === 'aceptada') alAceptarCotizacion(c, q)
        if (estado === 'rechazada') {
          const l = c.s.leads.find((x) => x.id === q.leadId)
          if (l) l.etapa = 'perdido'
        }
      })
    },
    [cambiar],
  )

  const avanzarDias = useCallback(
    (dias: number) =>
      cambiar((c) => {
        c.s.desfaseDias += dias
        c.ahora += dias * DIA
        revisionPeriodica(c)
      }),
    [cambiar],
  )

  const reiniciar = useCallback(() => {
    const nuevo = crearSeed()
    ref.current = nuevo
    setS(nuevo)
    setUltimos([])
  }, [])

  const valor = useMemo(
    () => ({ s, ahora, cambiar, crearLead, guardarCotizacion, estadoCotizacion, avanzarDias, reiniciar, ultimosEventos }),
    [s, ahora, cambiar, crearLead, guardarCotizacion, estadoCotizacion, avanzarDias, reiniciar, ultimosEventos],
  )
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore fuera de StoreProvider')
  return v
}

/** Nombre del responsable de un lead (vendedor, asesor o distribuidor). */
export function useResponsable() {
  const { s } = useStore()
  return (l: Lead) =>
    l.asignadoTipo === 'distribuidor'
      ? s.distribuidores.find((d) => d.id === l.asignadoId)?.nombre ?? '—'
      : s.vendedores.find((v) => v.id === l.asignadoId)?.nombre ?? 'Sin asignar'
}
