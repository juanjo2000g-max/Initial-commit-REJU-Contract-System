import type { Distribuidor, Estado, Producto, Sede } from '../data/types'
import { DIA, sum } from './util'

export type Luz = 'verde' | 'amarillo' | 'rojo'

export interface SaludDistribuidor {
  luz: Luz
  diasSinPedido: number
  tendencia: number
  quejasCriticas: number
  motivos: string[]
}

export function saludDistribuidor(d: Distribuidor, s: Estado, ahora: number): SaludDistribuidor {
  const diasSinPedido = Math.floor((ahora - d.ultimoPedido) / DIA)
  const ult = sum(d.ventas6m.slice(3), (x) => x)
  const ant = sum(d.ventas6m.slice(0, 3), (x) => x)
  const tendencia = ant ? (ult - ant) / ant : 0
  const quejasCriticas = s.quejas.filter((q) => q.distribuidorId === d.id && q.critica && !q.resuelta).length
  const quejasAbiertas = s.quejas.filter((q) => q.distribuidorId === d.id && !q.resuelta).length
  const motivos: string[] = []
  let luz: Luz = 'verde'
  if (diasSinPedido >= 35 || tendencia <= -0.15 || quejasCriticas > 0) {
    luz = 'rojo'
    if (diasSinPedido >= 35) motivos.push(`${diasSinPedido} días sin pedido`)
    if (tendencia <= -0.15) motivos.push(`ventas ${Math.round(tendencia * 100)} % vs. trimestre anterior`)
    if (quejasCriticas) motivos.push(`${quejasCriticas} queja crítica abierta`)
  } else if (diasSinPedido >= 21 || tendencia <= -0.05 || quejasAbiertas > 0) {
    luz = 'amarillo'
    if (diasSinPedido >= 21) motivos.push(`${diasSinPedido} días sin pedido`)
    if (tendencia <= -0.05) motivos.push(`ventas ${Math.round(tendencia * 100)} %`)
    if (quejasAbiertas) motivos.push(`${quejasAbiertas} queja abierta`)
  }
  return { luz, diasSinPedido, tendencia, quejasCriticas, motivos }
}

/** Semáforo de la pieza 4: decide si se puede abrir la Línea Directa. */
export function semaforoCanal(s: Estado, ahora: number) {
  const clave = s.distribuidores.filter((d) => d.nivel !== 'Bronce')
  const salud = clave.map((d) => ({ d, ...saludDistribuidor(d, s, ahora) }))
  const rojos = salud.filter((x) => x.luz === 'rojo')
  const amarillos = salud.filter((x) => x.luz === 'amarillo')
  const luz: Luz = rojos.length >= 2 ? 'rojo' : rojos.length || amarillos.length ? 'amarillo' : 'verde'
  const decision =
    luz === 'verde'
      ? 'Se puede abrir la Línea Directa limitada (colecciones exclusivas y proyectos que el canal no atiende).'
      : luz === 'amarillo'
        ? 'Mantener la Vitrina, ajustar beneficios del programa y reevaluar en 90 días.'
        : 'Congelar cualquier venta directa y reforzar el programa de aliados.'
  return { luz, decision, rojos, amarillos, salud }
}

export function diasInventario(p: Producto, sede: Sede) {
  const ventaDiaSede = (p.ventasMes / 30) * (sede === 'Cali' ? 0.32 : sede === 'Bogotá' ? 0.24 : sede === 'Medellín' ? 0.22 : 0.11)
  return ventaDiaSede ? p.stock[sede] / ventaDiaSede : 999
}
