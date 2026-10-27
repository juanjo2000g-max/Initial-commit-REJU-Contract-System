// Globo terráqueo con las rutas de importación de SICHAR (5 países → Colombia).
import { geoDistance, geoInterpolate, geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo'
import { useEffect, useMemo, useRef, useState } from 'react'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry } from 'geojson'
import type { Topology, GeometryCollection } from 'topojson-specification'
import mundo from 'world-atlas/countries-110m.json'

export const ORIGENES: { pais: string; coord: [number, number]; lineas: string }[] = [
  { pais: 'India', coord: [78.96, 22.6], lineas: 'Porcelanato gran formato, maderas, accesorios' },
  { pais: 'China', coord: [114.1, 30.6], lineas: 'Grifería, sanitarios, decorativos' },
  { pais: 'España', coord: [-0.1, 39.9], lineas: 'Colecciones de diseño, mosaicos, boquillas' },
  { pais: 'Brasil', coord: [-48.5, -23.5], lineas: 'Piedras, porcelanato técnico' },
  { pais: 'Perú', coord: [-77.0, -12.0], lineas: 'Cerámica de pared, pegantes' },
]
const CALI: [number, number] = [-76.53, 3.45]

export function Globo({ activo, className = '' }: { activo: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [tam, setTam] = useState(320)
  const paises = useMemo(() => {
    const t = mundo as unknown as Topology<{ countries: GeometryCollection }>
    return feature(t, t.objects.countries) as FeatureCollection<Geometry, { name: string }>
  }, [])
  const rot = useRef<[number, number]>([60, -15])

  useEffect(() => {
    const el = ref.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver(([e]) => setTam(Math.min(e.contentRect.width, 720)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = tam * dpr
    canvas.height = tam * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const proy = geoOrthographic().scale(tam / 2.15).translate([tam / 2, tam / 2]).clipAngle(90)
    const path = geoPath(proy, ctx)
    const grat = geoGraticule10()
    const origen = ORIGENES[activo]
    // Objetivo: centro entre el país de origen y Colombia
    const medio = geoInterpolate(origen.coord, CALI)(0.5)
    const objetivo: [number, number] = [-medio[0], -medio[1] * 0.6]
    let raf = 0
    const t0 = performance.now()
    const dibujar = (t: number) => {
      // acercar suavemente la rotación al objetivo
      rot.current = [rot.current[0] + (objetivo[0] - rot.current[0]) * 0.05, rot.current[1] + (objetivo[1] - rot.current[1]) * 0.05]
      proy.rotate(rot.current)
      ctx.clearRect(0, 0, tam, tam)
      // océano
      const g = ctx.createRadialGradient(tam * 0.4, tam * 0.35, tam * 0.05, tam / 2, tam / 2, tam / 2)
      g.addColorStop(0, '#2a2a2a')
      g.addColorStop(1, '#0f0f0f')
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.fillStyle = g
      ctx.fill()
      ctx.beginPath()
      path(grat)
      ctx.strokeStyle = 'rgba(255,255,255,.05)'
      ctx.lineWidth = 0.6
      ctx.stroke()
      // países
      for (const f of paises.features) {
        const nombre = f.properties?.name
        const resaltado = nombre === 'Colombia' || ORIGENES.some((o, i) => i === activo && o.pais === (nombre === 'Spain' ? 'España' : nombre === 'Brazil' ? 'Brasil' : nombre === 'Peru' ? 'Perú' : nombre))
        ctx.beginPath()
        path(f)
        ctx.fillStyle = resaltado ? '#F47920' : 'rgba(255,255,255,.13)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,.35)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
      // rutas
      const avance = Math.min(1, (t - t0) / 1600)
      ORIGENES.forEach((o, i) => {
        const interp = geoInterpolate(o.coord, CALI)
        const n = 64
        const hasta = i === activo ? avance : 1
        ctx.beginPath()
        let empezado = false
        for (let k = 0; k <= n * hasta; k++) {
          const p = interp(k / n)
          const visible = geoDistance(p, [-rot.current[0], -rot.current[1]]) < Math.PI / 2
          const xy = proy(p)
          if (!xy || !visible) {
            empezado = false
            continue
          }
          // elevar el arco: desplazar hacia afuera del centro
          const h = Math.sin((k / n) * Math.PI) * 0.12
          const x = tam / 2 + (xy[0] - tam / 2) * (1 + h)
          const y = tam / 2 + (xy[1] - tam / 2) * (1 + h)
          if (!empezado) {
            ctx.moveTo(x, y)
            empezado = true
          } else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = i === activo ? '#F47920' : 'rgba(244,121,32,.28)'
        ctx.lineWidth = i === activo ? 2.4 : 1.1
        ctx.setLineDash(i === activo ? [] : [3, 4])
        ctx.stroke()
        ctx.setLineDash([])
        // punto del país
        const xy = proy(o.coord)
        if (xy && geoDistance(o.coord, [-rot.current[0], -rot.current[1]]) < Math.PI / 2) {
          ctx.beginPath()
          ctx.arc(xy[0], xy[1], i === activo ? 5 : 3, 0, Math.PI * 2)
          ctx.fillStyle = '#fff'
          ctx.fill()
        }
        // barco en movimiento sobre la ruta activa
        if (i === activo) {
          const f = ((t - t0) / 4000) % 1
          const p = interp(f)
          const b = proy(p)
          if (b && geoDistance(p, [-rot.current[0], -rot.current[1]]) < Math.PI / 2) {
            const h = Math.sin(f * Math.PI) * 0.12
            ctx.beginPath()
            ctx.arc(tam / 2 + (b[0] - tam / 2) * (1 + h), tam / 2 + (b[1] - tam / 2) * (1 + h), 4, 0, Math.PI * 2)
            ctx.fillStyle = '#fff'
            ctx.shadowColor = '#F47920'
            ctx.shadowBlur = 16
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      })
      // Cali
      const c = proy(CALI)
      if (c) {
        const pulso = 6 + Math.sin(t / 300) * 3
        ctx.beginPath()
        ctx.arc(c[0], c[1], pulso + 6, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(244,121,32,.25)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(c[0], c[1], 5, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
      }
      // brillo atmosférico
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.strokeStyle = 'rgba(244,121,32,.35)'
      ctx.lineWidth = 1.2
      ctx.stroke()
      raf = requestAnimationFrame(dibujar)
    }
    raf = requestAnimationFrame(dibujar)
    return () => cancelAnimationFrame(raf)
  }, [tam, paises, activo])

  return <canvas ref={ref} className={className} style={{ width: tam, height: tam, maxWidth: "100%" }} />
}
