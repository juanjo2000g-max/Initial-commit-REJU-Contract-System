import type { Config, Pais, Producto, Sede } from '../data/types'

export const DIA = 86_400_000
export const HORA = 3_600_000

export const SEDES: Sede[] = ['Cali', 'Medellín', 'Bogotá', 'Barranquilla', 'Bucaramanga']
export const PAISES: Pais[] = ['India', 'China', 'Brasil', 'España', 'Perú']

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

export const fmtCOP = (n: number) => cop.format(Math.round(n))
export const fmtNum = (n: number) => num.format(n)
export const fmtPct = (n: number, d = 0) => `${(n * 100).toFixed(d).replace('.', ',')} %`

/** Millones abreviados: $ 12,4 M */
export const fmtM = (n: number) => `$ ${num.format(n / 1_000_000)} M`

export function fmtFecha(t: number, conHora = false) {
  return new Date(t).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    ...(conHora ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function haceCuanto(t: number, ahora: number) {
  const d = ahora - t
  if (d < 60_000) return 'hace un momento'
  if (d < HORA) return `hace ${Math.floor(d / 60_000)} min`
  if (d < DIA) return `hace ${Math.floor(d / HORA)} h`
  const dias = Math.floor(d / DIA)
  return dias === 1 ? 'ayer' : `hace ${dias} días`
}

export const uid = (p = '') => p + Math.random().toString(36).slice(2, 9)

/** Generador pseudoaleatorio con semilla (datos de ejemplo reproducibles). */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

export function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function waLink(telefono: string, mensaje: string) {
  const t = telefono.replace(/\D/g, '')
  const n = t.startsWith('57') ? t : `57${t}`
  return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`
}

// --- Costo puesto en bodega (hallazgo 2) -------------------------------------

export interface DesgloseCosto {
  origen: number
  flete: number
  arancel: number
  nacionalizacion: number
  almacenamiento: number
  total: number
  margen: number
  precioParaObjetivo: number
}

export function costoBodega(costoUSD: number, pais: Pais, precioVenta: number, c: Config): DesgloseCosto {
  const origen = costoUSD * c.trm
  const flete = origen * c.flete[pais]
  const cif = origen + flete
  const arancel = cif * c.arancel
  const nacionalizacion = cif * c.nacionalizacion
  const almacenamiento = cif * c.almacenamiento
  const total = cif + arancel + nacionalizacion + almacenamiento
  return {
    origen,
    flete,
    arancel,
    nacionalizacion,
    almacenamiento,
    total,
    margen: (precioVenta - total) / precioVenta,
    precioParaObjetivo: total / (1 - c.margenObjetivo),
  }
}

export const costoProducto = (p: Producto, c: Config) => costoBodega(p.costoUSD, p.origen, p.precioDistribuidor, c)

export function mejorAlternativa(p: Producto, c: Config) {
  const opciones = p.alternativos
    .filter((a) => a.validado)
    .map((a) => ({ ...a, costo: costoBodega(a.costoUSD, a.pais, p.precioDistribuidor, c) }))
    .sort((a, b) => a.costo.total - b.costo.total)
  return opciones[0]
}

export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

export function sum<T>(xs: T[], f: (x: T) => number) {
  return xs.reduce((a, x) => a + f(x), 0)
}
