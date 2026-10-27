// Motor de automatizaciones. Cada regla recibe el estado (copia mutable) y
// registra un evento con las acciones ejecutadas. En producción estos mismos
// eventos se envían al webhook configurado (n8n, Make, Zapier o un backend).
import type { Cotizacion, Estado, EventoAutomatizacion, Lead, Notificacion, Tarea } from '../data/types'
import { DIA, HORA, fmtCOP, uid } from './util'
import { diasInventario, saludDistribuidor } from './semaforo'

export interface Contexto {
  s: Estado
  ahora: number
  eventos: EventoAutomatizacion[]
}

function activa(c: Contexto, id: string) {
  return c.s.reglas.find((r) => r.id === id)?.activa ?? false
}

function registrar(c: Contexto, reglaId: string, titulo: string, detalle: string, acciones: string[]) {
  const ev: EventoAutomatizacion = { id: uid('e'), fecha: c.ahora, reglaId, titulo, detalle, acciones }
  c.s.eventos.unshift(ev)
  c.eventos.push(ev)
  const r = c.s.reglas.find((x) => x.id === reglaId)
  if (r) r.ejecuciones++
}

export function notificar(c: Contexto, texto: string, tipo: Notificacion['tipo'] = 'info', enlace?: string) {
  c.s.notificaciones.unshift({ id: uid('n'), fecha: c.ahora, texto, tipo, leida: false, enlace })
}

function tarea(c: Contexto, t: Omit<Tarea, 'id' | 'hecha'>) {
  c.s.tareas.unshift({ ...t, id: uid('t'), hecha: false })
}

function nota(lead: Lead, ahora: number, texto: string) {
  lead.actividades.push({ id: uid('a'), fecha: ahora, tipo: 'automatizacion', texto, autor: 'Automatización' })
}

/** Elige el distribuidor aliado con menos referidos pendientes, priorizando nivel. */
function distribuidorPara(c: Contexto, lead: Lead) {
  const peso = { Oro: 0, Plata: 1, Bronce: 2 }
  const cand = c.s.distribuidores
    .filter((d) => d.aliado && d.ciudad === lead.ciudad)
    .map((d) => ({
      d,
      carga: c.s.leads.filter((l) => l.asignadoId === d.id && ['nuevo', 'contactado'].includes(l.etapa)).length,
      luz: saludDistribuidor(d, c.s, c.ahora).luz,
    }))
    .filter((x) => x.luz !== 'rojo')
    .sort((a, b) => a.carga - b.carga || peso[a.d.nivel] - peso[b.d.nivel])
  return cand[0]?.d
}

export interface ResultadoLead {
  mensajeCliente: string
  responsable?: string
}

/** Reglas 1, 2 y 3: se ejecutan cuando entra un lead nuevo. */
export function alCrearLead(c: Contexto, lead: Lead): ResultadoLead {
  const s = c.s
  if (lead.segmento === 'hogar' && activa(c, 'r1')) {
    const d = distribuidorPara(c, lead)
    if (d) {
      lead.asignadoTipo = 'distribuidor'
      lead.asignadoId = d.id
      d.referidosRecibidos++
      lead.etiquetas.push('Referido Vitrina')
      nota(lead, c.ahora, `Referido asignado a ${d.nombre} (${d.barrio}). WhatsApp enviado al distribuidor.`)
      registrar(c, 'r1', `Referido → ${d.nombre}`, `${lead.nombre} (${lead.ciudad}) · ${lead.interes}`, [
        `Asignado a ${d.nombre}, aliado ${d.nivel} en ${d.barrio}`,
        `WhatsApp al distribuidor: ${d.contacto} · ${d.telefono}`,
        'Confirmación enviada al cliente',
        'Referido visible en el portal del distribuidor',
      ])
      notificar(c, `Nuevo referido para ${d.nombre}: ${lead.nombre}`, 'exito', `/pipeline/${lead.id}`)
      return { mensajeCliente: `${d.nombre} (${d.barrio}, ${d.ciudad}), distribuidor aliado SICHAR, te contactará por WhatsApp.`, responsable: d.nombre }
    }
  }

  if ((lead.segmento === 'constructora' || (lead.m2 ?? 0) >= s.config.umbralProyectoM2) && activa(c, 'r2')) {
    const texto = `${lead.empresa ?? ''} ${lead.interes}`.toLowerCase()
    const reg = s.proyectos.find(
      (p) => p.estado === 'protegido' && (texto.includes(p.constructora.toLowerCase()) || texto.includes(p.obra.toLowerCase().split(' — ')[0])),
    )
    if (reg) {
      const d = s.distribuidores.find((x) => x.id === reg.distribuidorId)!
      lead.asignadoTipo = 'distribuidor'
      lead.asignadoId = d.id
      lead.etiquetas.push('Proyecto protegido')
      nota(lead, c.ahora, `La obra «${reg.obra}» está registrada por ${d.nombre}. Se asigna al distribuidor (política de canal).`)
      registrar(c, 'r2', `Proyecto protegido → ${d.nombre}`, `${lead.empresa ?? lead.nombre}: ${reg.obra}`, [
        `Obra registrada por ${d.nombre} hasta ${new Date(reg.vence).toLocaleDateString('es-CO')}`,
        'SICHAR no cotiza directo a este cliente',
        'Distribuidor notificado con el contacto',
      ])
      notificar(c, `Proyecto protegido: ${reg.obra} va para ${d.nombre}`, 'alerta', `/pipeline/${lead.id}`)
      return { mensajeCliente: `Tu proyecto lo atiende ${d.nombre}, nuestro aliado en ${d.ciudad}. Te contactarán hoy.`, responsable: d.nombre }
    }
    const v = s.vendedores.find((x) => x.sede === lead.ciudad && x.rol.startsWith('Coordinador'))!
    lead.asignadoTipo = 'vendedor'
    lead.asignadoId = v.id
    if ((lead.m2 ?? 0) >= 1500) lead.etiquetas.push('Gran proyecto')
    nota(lead, c.ahora, `Proyecto sin registro previo. Asignado a ${v.nombre}, ${v.rol.toLowerCase()} ${v.sede}.`)
    registrar(c, 'r2', `Proyecto nuevo → ${v.nombre}`, `${lead.empresa ?? lead.nombre} · ${lead.m2 ?? '?'} m²`, [
      'Sin registro de distribuidor: se puede atender directo',
      `Asignado a ${v.nombre} (${v.sede})`,
      'Tarea: llamar en menos de 2 horas',
    ])
    tarea(c, { titulo: `Llamar a ${lead.empresa ?? lead.nombre}`, detalle: `${lead.interes} · ${lead.m2} m²`, vence: c.ahora + 2 * HORA, responsable: v.id, origen: 'Protección de proyectos', leadId: lead.id, prioridad: 'alta' })
    return { mensajeCliente: `${v.nombre}, de nuestra sede ${v.sede}, te llamará en menos de 2 horas.`, responsable: v.nombre }
  }

  if (lead.segmento === 'arquitecto' && activa(c, 'r3')) {
    const a = s.vendedores.find((x) => x.id === 'a1')!
    lead.asignadoTipo = 'asesor'
    lead.asignadoId = a.id
    s.asesorias.unshift({ id: uid('as'), leadId: lead.id, nombre: lead.empresa ?? lead.nombre, tipo: 'asesoria-30', ciudad: lead.ciudad, fecha: c.ahora + DIA, estado: 'solicitada', asesorId: a.id, notas: lead.interes })
    nota(lead, c.ahora, `Asignado a la Mesa de Asesoría (${a.nombre}). Kit de muestras ofrecido.`)
    registrar(c, 'r3', `Arquitecto → Mesa de Asesoría`, `${lead.empresa ?? lead.nombre} · ${lead.interes}`, [
      `Asignado a ${a.nombre}`,
      'Solicitud de asesoría de 30 min creada',
      'Kit de muestras ofrecido por WhatsApp',
    ])
    notificar(c, `Nueva asesoría solicitada: ${lead.empresa ?? lead.nombre}`, 'info', '/asesoria')
    return { mensajeCliente: `${a.nombre}, asesora de diseño SICHAR, te escribirá para agendar tu asesoría y enviarte muestras.`, responsable: a.nombre }
  }

  const v = s.vendedores.find((x) => x.sede === lead.ciudad)!
  lead.asignadoTipo = 'vendedor'
  lead.asignadoId = v.id
  return { mensajeCliente: `${v.nombre}, de nuestra sede ${v.sede}, te contactará muy pronto.`, responsable: v.nombre }
}

/**
 * Regla 7: devuelve los problemas de una cotización directa.
 * - Consumidor final: solo Línea Directa y nunca por debajo del PVP sugerido.
 * - Proyectos (constructoras, arquitectos): se permite, pero sin bajar del
 *   precio de distribuidor menos 10 %, para no subcotizar al canal.
 */
export function revisarPolitica(cot: Cotizacion, s: Estado) {
  if (cot.canal !== 'directa') return []
  const lead = s.leads.find((l) => l.id === cot.leadId)
  const consumidor = !lead || lead.segmento === 'hogar'
  return cot.items.flatMap((it) => {
    const p = s.productos.find((x) => x.id === it.productoId)!
    const precioFinal = it.precio * (1 - it.descuento)
    if (consumidor) {
      if (!p.lineaDirecta) return [`${p.nombre} es Línea Distribuidor: al consumidor final se le vende a través de un aliado.`]
      if (precioFinal < p.pvpSugerido) return [`${p.nombre}: ${fmtCOP(precioFinal)} está por debajo del PVP sugerido (${fmtCOP(p.pvpSugerido)}).`]
      return []
    }
    const piso = p.precioDistribuidor * 0.9
    if (precioFinal < piso) return [`${p.nombre}: ${fmtCOP(precioFinal)} subcotiza al canal (mínimo para proyectos ${fmtCOP(piso)}).`]
    return []
  })
}

export function registrarBloqueoPolitica(c: Contexto, cot: Cotizacion, problemas: string[]) {
  registrar(c, 'r7', `Cotización ${cot.numero} bloqueada`, problemas[0], ['Envío bloqueado', 'Solicitud de aprobación enviada a gerencia'])
  notificar(c, `Política de canal: ${cot.numero} requiere aprobación`, 'alerta', '/cotizaciones')
}

/** Regla 8. */
export function alAceptarCotizacion(c: Contexto, cot: Cotizacion) {
  if (!activa(c, 'r8')) return
  const lead = c.s.leads.find((l) => l.id === cot.leadId)
  if (!lead) return
  lead.etapa = 'ganado'
  lead.actualizado = c.ahora
  const total = cot.items.reduce((a, it) => a + it.cantidad * it.precio * (1 - it.descuento), 0)
  lead.valor = Math.round(total)
  nota(lead, c.ahora, `Cotización ${cot.numero} aceptada. Pedido creado y encuesta programada.`)
  if (lead.asignadoTipo === 'distribuidor' && lead.asignadoId) {
    const d = c.s.distribuidores.find((x) => x.id === lead.asignadoId)
    if (d) {
      d.referidosConvertidos++
      d.ultimoPedido = c.ahora
      c.s.pedidos.unshift({ id: uid('pe'), distribuidorId: d.id, fecha: c.ahora, items: cot.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })), total, estado: 'recibido', canal: 'portal' })
    }
  }
  tarea(c, { titulo: `Encuesta de satisfacción · ${lead.nombre}`, detalle: 'Enviar encuesta corta por WhatsApp (1 a 5).', vence: c.ahora + 15 * DIA, responsable: cot.vendedorId, origen: 'Cotización aceptada', leadId: lead.id, prioridad: 'baja' })
  registrar(c, 'r8', `${cot.numero} aceptada`, `${lead.nombre} · ${fmtCOP(total)}`, ['Lead movido a Ganado', 'Pedido creado', 'Encuesta programada a 15 días'])
  notificar(c, `¡Venta ganada! ${lead.nombre} · ${fmtCOP(total)}`, 'exito', `/pipeline/${lead.id}`)
}

/** Reglas por tiempo (4, 5 y 6). Se ejecutan al abrir la app y al simular días. */
export function revisionPeriodica(c: Contexto) {
  const s = c.s
  if (activa(c, 'r4')) {
    for (const l of s.leads) {
      if (l.etapa === 'nuevo' && !l.primeraRespuesta && c.ahora - l.creado > 24 * HORA && !l.etiquetas.includes('Sin respuesta 24h')) {
        l.etiquetas.push('Sin respuesta 24h')
        const resp = s.vendedores.find((v) => v.id === l.asignadoId) ?? s.distribuidores.find((d) => d.id === l.asignadoId)
        tarea(c, { titulo: `Responder a ${l.nombre}`, detalle: `Lleva ${Math.floor((c.ahora - l.creado) / HORA)} h sin respuesta.`, vence: c.ahora + 2 * HORA, responsable: l.asignadoId ?? 'v1', origen: 'Cotización < 48 h', leadId: l.id, prioridad: 'alta' })
        nota(l, c.ahora, 'Más de 24 h sin respuesta: tarea creada y coordinador notificado.')
        registrar(c, 'r4', `Lead sin respuesta: ${l.nombre}`, `Responsable: ${resp?.nombre ?? 'sin asignar'}`, ['Tarea de seguimiento creada', 'Coordinador de sede notificado'])
      }
    }
    for (const q of s.cotizaciones) {
      if (q.estado === 'enviada' && q.enviada && c.ahora - q.enviada > 48 * HORA) {
        const l = s.leads.find((x) => x.id === q.leadId)
        const ya = s.tareas.some((t) => t.origen === 'Seguimiento de cotización' && t.titulo.includes(q.numero))
        if (l && !ya) {
          tarea(c, { titulo: `Seguimiento ${q.numero}`, detalle: `${l.nombre}: cotización enviada hace ${Math.floor((c.ahora - q.enviada) / DIA)} días.`, vence: c.ahora + DIA, responsable: q.vendedorId, origen: 'Seguimiento de cotización', leadId: l.id, prioridad: 'media' })
          registrar(c, 'r4', `Seguimiento ${q.numero}`, `${l.nombre} no ha respondido`, ['Tarea de seguimiento creada'])
        }
      }
    }
  }
  if (activa(c, 'r5')) {
    for (const d of s.distribuidores.filter((x) => x.nivel !== 'Bronce')) {
      const h = saludDistribuidor(d, s, c.ahora)
      const clave = `Semáforo ${d.nombre}`
      const ya = s.tareas.some((t) => t.titulo.includes(d.nombre) && !t.hecha)
      if (h.luz === 'rojo' && !ya) {
        const v = s.vendedores.find((x) => x.sede === d.ciudad)!
        tarea(c, { titulo: `Visita de recuperación: ${d.nombre}`, detalle: h.motivos.join(' · '), vence: c.ahora + 2 * DIA, responsable: v.id, origen: 'Semáforo de canal', prioridad: 'alta' })
        registrar(c, 'r5', `${clave} en rojo`, h.motivos.join(' · '), ['Visita de recuperación creada', `Asignada a ${v.nombre}`, 'Alerta a gerencia'])
        notificar(c, `Distribuidor en rojo: ${d.nombre} (${h.motivos[0]})`, 'alerta', '/canal')
      }
    }
  }
  if (activa(c, 'r6')) {
    for (const p of s.productos.filter((x) => x.ventasMes >= 800)) {
      for (const sede of Object.keys(p.stock) as (keyof typeof p.stock)[]) {
        const dias = diasInventario(p, sede)
        const ya = s.tareas.some((t) => t.titulo === `Reponer ${p.ref} en ${sede}` && !t.hecha)
        if (dias < 15 && !ya) {
          const otra = (Object.keys(p.stock) as (keyof typeof p.stock)[]).filter((x) => x !== sede).sort((a, b) => p.stock[b] - p.stock[a])[0]
          tarea(c, { titulo: `Reponer ${p.ref} en ${sede}`, detalle: `${Math.round(dias)} días de inventario. Sugerido: traslado desde ${otra} (${p.stock[otra]} ${p.unidad}).`, vence: c.ahora + 3 * DIA, responsable: 'Compras', origen: 'Inventario', prioridad: 'media' })
          registrar(c, 'r6', `Inventario bajo: ${p.nombre}`, `${sede}: ${Math.round(dias)} días`, ['Alerta a Compras', `Traslado sugerido desde ${otra}`])
        }
      }
    }
  }
}

/** Envía los eventos al webhook configurado (si existe). */
export async function enviarWebhook(url: string, eventos: EventoAutomatizacion[]) {
  if (!url || !eventos.length) return 'omitido' as const
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fuente: 'sichar-os', eventos }),
    })
    return 'enviado' as const
  } catch {
    return 'error' as const
  }
}
