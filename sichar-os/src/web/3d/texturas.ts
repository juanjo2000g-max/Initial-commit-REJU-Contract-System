// Convierte las texturas SVG de cada producto en texturas de three.js.
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'
import { DefsTextura } from '../../components/Textura'
import type { Producto } from '../../data/types'

const cache = new Map<string, THREE.Texture>()
/** Copias (con distinto `repeat`) que deben refrescarse cuando cargue la imagen. */
const copias = new Map<THREE.Texture, THREE.Texture[]>()
const listas = new Set<THREE.Texture>()

/** Lado de la textura en cm reales, según el formato del producto (60x130 → 130). */
export function ladoCm(p: Producto) {
  const m = p.formato.match(/(\d+)x(\d+)/)
  return m ? Math.max(Number(m[1]), Number(m[2])) : 60
}

export function texturaProducto(p: Producto, tamaño = 1024): THREE.Texture {
  const clave = `${p.id}-${tamaño}`
  const ya = cache.get(clave)
  if (ya) return ya
  const id = `t${p.id}`
  // Un "tile" de patrón = 100 unidades; dibujamos 2x2 tiles por textura.
  const svg = renderToStaticMarkup(
    createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', width: tamaño, height: tamaño, viewBox: '0 0 200 200' },
      createElement('defs', null, createElement(DefsTextura, { p, id, escala: 1 })),
      createElement('rect', { width: 200, height: 200, fill: `url(#${id})` }),
    ),
  )
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = tamaño
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = p.color
  ctx.fillRect(0, 0, tamaño, tamaño)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0, tamaño, tamaño)
    tex.needsUpdate = true
    listas.add(tex)
    for (const c of copias.get(tex) ?? []) c.needsUpdate = true
  }
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  cache.set(clave, tex)
  return tex
}

/** Textura repetida para cubrir una superficie de ancho x alto metros. */
export function texturaSuperficie(p: Producto, anchoM: number, altoM: number) {
  const base = texturaProducto(p)
  const t = base.clone()
  const piezaM = ladoCm(p) / 100
  // La textura cubre 2 piezas por lado.
  t.repeat.set(anchoM / (piezaM * 2), altoM / (piezaM * 2))
  t.needsUpdate = true
  if (!listas.has(base)) copias.set(base, [...(copias.get(base) ?? []), t])
  return t
}

export function esBrillante(p: Producto) {
  return /brill/i.test(p.acabado)
}
