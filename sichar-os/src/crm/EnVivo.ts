// Modo en vivo: simula la operación real durante la presentación. Cada pocos
// segundos entra un cliente, avanza un negocio o un aliado hace un pedido, y las
// automatizaciones reaccionan como lo harían en producción.
import { useEffect, useRef } from 'react'
import { useAviso } from '../components/ui'
import type { Etapa, Fuente, Sede, Segmento } from '../data/types'
import { useStore } from '../lib/store'
import { SEDES, fmtCOP, uid } from '../lib/util'

const NOMBRES = ['Valeria Cortés', 'Julián Bedoya', 'Mariana Lozada', 'Tomás Arias', 'Gabriela Patiño', 'Nicolás Serna', 'Laura Villa', 'Samuel Ortiz', 'Antonia Rendón', 'Emilio Castaño', 'Sara Benavides', 'Martín Quiceno', 'Isabela Henao', 'Andrés Sierra', 'Lucía Galvis', 'Jerónimo Marín']
const HOGAR = ['Remodelar el baño principal', 'Piso para apartamento nuevo', 'Cocina con mesón y enchape', 'Terraza y zona de BBQ', 'Baño social con grifería negra']
const OBRAS = ['Torre residencial de 18 pisos', 'Conjunto VIS 240 unidades', 'Clínica, zonas húmedas', 'Hotel boutique 30 habitaciones', 'Centro comercial, baños públicos']
const ESTUDIOS = ['Estudio Raíz', 'Taller Bambú Arquitectura', 'Nativa Diseño Interior', 'Plano Cero Arquitectos']
const CONSTR = ['Constructora Andina', 'Grupo Habitar', 'Obras del Pacífico', 'Edificar SAS']
const SIGUIENTE: Partial<Record<Etapa, Etapa>> = { nuevo: 'contactado', contactado: 'cotizado', cotizado: 'negociacion', negociacion: 'ganado' }

const azar = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]

export function useEnVivo(activo: boolean) {
  const { crearLead, cambiar, estadoCotizacion } = useStore()
  const aviso = useAviso()
  const ref = useRef({ crearLead, cambiar, estadoCotizacion, aviso })
  ref.current = { crearLead, cambiar, estadoCotizacion, aviso }

  useEffect(() => {
    if (!activo) return
    let t: ReturnType<typeof setTimeout>
    const paso = () => {
      const { crearLead, cambiar, estadoCotizacion, aviso } = ref.current
      const r = Math.random()
      if (r < 0.55) {
        const segmento: Segmento = Math.random() < 0.6 ? 'hogar' : Math.random() < 0.5 ? 'arquitecto' : 'constructora'
        const fuente: Fuente = azar(segmento === 'hogar' ? (['web', 'whatsapp', 'redes'] as const) : (['web', 'feria', 'referido'] as const))
        const ciudad: Sede = azar(SEDES)
        const m2 = segmento === 'constructora' ? 800 + Math.round(Math.random() * 4000) : segmento === 'arquitecto' ? 60 + Math.round(Math.random() * 300) : 10 + Math.round(Math.random() * 70)
        const res = crearLead({
          nombre: azar(NOMBRES),
          empresa: segmento === 'arquitecto' ? azar(ESTUDIOS) : segmento === 'constructora' ? azar(CONSTR) : undefined,
          telefono: `30${Math.floor(1e8 + Math.random() * 9e8)}`,
          segmento,
          ciudad,
          fuente,
          m2,
          valor: Math.round((m2 * (70_000 + Math.random() * 40_000)) / 100_000) * 100_000,
          interes: segmento === 'hogar' ? azar(HOGAR) : segmento === 'constructora' ? azar(OBRAS) : 'Proyecto de interiorismo, busca muestras',
        })
        aviso({ titulo: `Nuevo cliente desde ${fuente === 'whatsapp' ? 'WhatsApp' : fuente === 'redes' ? 'Instagram' : fuente}`, texto: `${res.lead.empresa ?? res.lead.nombre} · ${ciudad} → ${res.responsable ?? 'asignado'}`, tipo: 'exito' })
      } else if (r < 0.75) {
        cambiar((c) => {
          const abiertos = c.s.leads.filter((l) => SIGUIENTE[l.etapa])
          const l = azar(abiertos)
          if (!l) return
          const nueva = SIGUIENTE[l.etapa]!
          l.etapa = nueva
          l.actualizado = c.ahora
          l.primeraRespuesta ??= c.ahora
          l.actividades.push({ id: uid('a'), fecha: c.ahora, tipo: 'sistema', texto: `Avanzó a ${nueva}`, autor: 'Equipo comercial' })
          c.s.notificaciones.unshift({ id: uid('n'), fecha: c.ahora, texto: `${l.empresa ?? l.nombre} avanzó a ${nueva}`, tipo: nueva === 'ganado' ? 'exito' : 'info', leida: false, enlace: `/pipeline/${l.id}` })
        })
      } else if (r < 0.9) {
        let texto = ''
        cambiar((c) => {
          const d = azar(c.s.distribuidores.filter((x) => x.aliado))
          const p = azar(c.s.productos.filter((x) => !x.lineaDirecta))
          const cantidad = (p.unidad === 'm²' ? 40 : 10) * (1 + Math.floor(Math.random() * 6))
          const total = cantidad * p.precioDistribuidor
          c.s.pedidos.unshift({ id: uid('pe'), distribuidorId: d.id, fecha: c.ahora, items: [{ productoId: p.id, cantidad }], total, estado: 'recibido', canal: 'portal' })
          d.ultimoPedido = c.ahora
          d.ventas6m[5] += total
          p.stock[d.ciudad] = Math.max(0, p.stock[d.ciudad] - cantidad)
          texto = `${d.nombre} pidió ${cantidad} ${p.unidad} de ${p.nombre.replace('Porcelanato ', '')} · ${fmtCOP(total)}`
          c.s.notificaciones.unshift({ id: uid('n'), fecha: c.ahora, texto: `Pedido por portal: ${texto}`, tipo: 'exito', leida: false, enlace: '/canal' })
        })
        if (texto) aviso({ titulo: 'Pedido desde el portal de aliados', texto, tipo: 'info' })
      } else {
        // aceptar una cotización enviada → dispara la regla 8
        let id = ''
        cambiar((c) => {
          id = azar(c.s.cotizaciones.filter((q) => q.estado === 'enviada'))?.id ?? ''
        })
        if (id) {
          estadoCotizacion(id, 'aceptada')
          aviso({ titulo: '¡Venta ganada!', texto: 'Cotización aceptada: pedido y encuesta creados automáticamente.', tipo: 'exito' })
        }
      }
      t = setTimeout(paso, 5000 + Math.random() * 4000)
    }
    t = setTimeout(paso, 1500)
    return () => clearTimeout(t)
  }, [activo])
}
