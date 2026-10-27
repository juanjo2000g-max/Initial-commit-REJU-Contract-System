import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Crosshair, MapPin, MessageCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { GeoJSON, MapContainer, Marker, Pane, TileLayer, useMap } from 'react-leaflet'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import mundo from 'world-atlas/countries-110m.json'
import { useSearchParams } from 'react-router-dom'
import type { Distribuidor, Sede } from '../../data/types'
import { useStore } from '../../lib/store'
import { SEDES, waLink } from '../../lib/util'
import { Etiqueta } from '../comunes'

const CENTRO: Record<Sede, [number, number]> = {
  Cali: [3.4516, -76.532],
  Medellín: [6.2442, -75.5812],
  Bogotá: [4.711, -74.0721],
  Barranquilla: [10.9685, -74.7813],
  Bucaramanga: [7.1193, -73.1227],
}

// Mapa base propio: se ve aunque no haya internet para cargar los mosaicos.
const PAISES = (() => {
  const t = mundo as unknown as Topology<{ countries: GeometryCollection }>
  return feature(t, t.objects.countries) as FeatureCollection<Geometry, { name: string }>
})()

const icono = (activo: boolean, nivel: string) =>
  L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    html: `<div style="position:relative;width:44px;height:44px;display:grid;place-items:center">
      ${activo ? '<span style="position:absolute;inset:0;border-radius:9999px;background:rgba(244,121,32,.35);animation:pulso 1.6s ease-out infinite"></span>' : ''}
      <svg width="34" height="40" viewBox="0 0 34 40"><path d="M17 0C7.6 0 0 7.4 0 16.6 0 29 17 40 17 40s17-11 17-23.4C34 7.4 26.4 0 17 0z" fill="${activo ? '#F47920' : '#ffffff'}"/><circle cx="17" cy="16" r="6" fill="${activo ? '#fff' : nivel === 'Oro' ? '#D4AD62' : '#1E1E1E'}"/></svg>
    </div>`,
  })

function Volar({ a, zoom }: { a: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(a, zoom, { duration: 1.4 })
  }, [a, zoom, map])
  return null
}

function distancia(a: [number, number], b: [number, number]) {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export default function DondeComprar() {
  const { s } = useStore()
  const [params] = useSearchParams()
  const [ciudad, setCiudad] = useState<Sede | 'Todas'>((params.get('ciudad') as Sede) || 'Todas')
  const [sel, setSel] = useState<string | null>(null)
  const [yo, setYo] = useState<[number, number] | null>(null)
  const aliados = s.distribuidores.filter((d) => d.aliado)
  const lista = useMemo(() => {
    const xs = aliados.filter((d) => ciudad === 'Todas' || d.ciudad === ciudad)
    return yo ? [...xs].sort((a, b) => distancia(yo, [a.lat, a.lng]) - distancia(yo, [b.lat, b.lng])) : xs
  }, [aliados, ciudad, yo])
  const elegido = aliados.find((d) => d.id === sel)
  const destino: [number, number] = elegido ? [elegido.lat, elegido.lng] : ciudad === 'Todas' ? [6.3, -74.8] : CENTRO[ciudad]
  const zoom = elegido ? 14 : ciudad === 'Todas' ? 6 : 11

  const ubicar = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        const c: [number, number] = [p.coords.latitude, p.coords.longitude]
        setYo(c)
        const cerca = [...aliados].sort((a, b) => distancia(c, [a.lat, a.lng]) - distancia(c, [b.lat, b.lng]))[0]
        setCiudad(cerca.ciudad)
        setSel(cerca.id)
      },
      () => setCiudad('Cali'),
    )

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Etiqueta>Dónde comprar</Etiqueta>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-display text-[14vw] font-extrabold leading-[.85] tracking-tighter md:text-[7.5vw]">Tu aliado está cerca.</h1>
          <button onClick={ubicar} className="flex items-center gap-2 rounded-full bg-naranja px-6 py-4 font-semibold transition hover:bg-naranja-600"><Crosshair size={18} /> Usar mi ubicación</button>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {(['Todas', ...SEDES] as const).map((c) => (
            <button key={c} onClick={() => { setCiudad(c); setSel(null) }} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${ciudad === c ? 'bg-white text-tinta' : 'ring-1 ring-white/15 hover:ring-white/40'}`}>{c}</button>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-[1500px] gap-4 px-5 pb-32 md:px-10 lg:grid-cols-[400px_1fr]">
        <div className="order-2 grid max-h-[640px] content-start gap-2 overflow-y-auto pr-1 lg:order-1" data-lenis-prevent>
          {lista.map((d, k) => (
            <motion.div key={d.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.04 }}>
              <Tarjeta d={d} activo={sel === d.id} km={yo ? distancia(yo, [d.lat, d.lng]) : undefined} onClick={() => setSel(d.id)} />
            </motion.div>
          ))}
        </div>
        <div className="relative order-1 h-[520px] overflow-hidden rounded-[28px] ring-1 ring-white/10 lg:order-2 lg:h-[640px]">
          <MapContainer center={[6.3, -74.8]} zoom={6} scrollWheelZoom={false} className="h-full w-full" style={{ background: '#0b0b0c' }} zoomControl={false} attributionControl>
            <Pane name="base" style={{ zIndex: 150 }}>
              <GeoJSON data={PAISES} style={(f) => ({ color: f?.properties?.name === 'Colombia' ? '#F47920' : '#2b2b2b', weight: f?.properties?.name === 'Colombia' ? 1.5 : 0.8, fillColor: f?.properties?.name === 'Colombia' ? '#1f1a16' : '#151515', fillOpacity: 1 })} />
            </Pane>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
            <Volar a={destino} zoom={zoom} />
            {aliados.map((d) => (
              <Marker key={d.id} position={[d.lat, d.lng]} icon={icono(sel === d.id, d.nivel)} eventHandlers={{ click: () => { setSel(d.id); setCiudad(d.ciudad) } }} />
            ))}
            {yo && <Marker position={yo} icon={L.divIcon({ className: '', iconSize: [18, 18], html: '<div style="width:18px;height:18px;border-radius:9999px;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,.3)"></div>' })} />}
          </MapContainer>
          {elegido && (
            <motion.div key={elegido.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 z-[500] rounded-3xl bg-[#141414]/90 p-5 ring-1 ring-white/10 backdrop-blur-xl md:right-auto md:w-96">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-2xl font-bold">{elegido.nombre}</div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-white/55"><MapPin size={14} /> {elegido.barrio}, {elegido.ciudad}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${elegido.nivel === 'Oro' ? 'bg-[#D4AD62] text-tinta' : 'bg-white/10'}`}>Aliado {elegido.nivel}</span>
              </div>
              <a href={waLink(elegido.telefono, `Hola ${elegido.nombre}, vi sus productos SICHAR en la web y quiero una cotización.`)} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-semibold text-white"><MessageCircle size={18} /> Escribir por WhatsApp</a>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

function Tarjeta({ d, activo, km, onClick }: { d: Distribuidor; activo: boolean; km?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full rounded-2xl p-4 text-left transition ${activo ? 'bg-naranja text-tinta' : 'bg-white/[.04] ring-1 ring-white/10 hover:bg-white/[.08]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{d.nombre}</div>
          <div className={`mt-0.5 text-sm ${activo ? 'text-black/60' : 'text-white/50'}`}>{d.barrio}, {d.ciudad}</div>
        </div>
        <div className="text-right text-xs font-semibold">
          <div>{d.nivel}</div>
          {km !== undefined && <div className={activo ? 'text-black/60' : 'text-white/45'}>{km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`}</div>}
        </div>
      </div>
    </button>
  )
}
