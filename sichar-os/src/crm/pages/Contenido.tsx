import { Briefcase, Camera, Copy, Heart, MessageCircle, Pin, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Kpi, Modal, useAviso } from '../../components/ui'
import type { Publicacion } from '../../data/types'
import { useStore } from '../../lib/store'
import { DIA, fmtFecha, sum, uid } from '../../lib/util'

const PILARES: Publicacion['pilar'][] = ['Proyectos reales', 'Guía de acabados', 'Producto insignia', 'Confianza y aliados']
const COLOR_PILAR: Record<Publicacion['pilar'], string> = { 'Proyectos reales': 'bg-naranja text-white', 'Guía de acabados': 'bg-teal-600 text-white', 'Producto insignia': 'bg-white text-tinta', 'Confianza y aliados': 'bg-blue-600 text-white' }
const ICONO = { Instagram: Camera, Pinterest: Pin, LinkedIn: Briefcase, WhatsApp: MessageCircle }
const ESTADOS: Publicacion['estado'][] = ['idea', 'en diseño', 'programada', 'publicada']

// Plantillas de copy por pilar (generador sin IA externa; se puede conectar a un modelo después).
const PLANTILLAS: Record<Publicacion['pilar'], { titulo: string; copy: string; cta: string }[]> = {
  'Proyectos reales': [
    { titulo: 'Antes y después: {lugar}', copy: 'Así quedó este {espacio} con {producto}. Instalado por nuestro aliado {aliado}. ¿Cuál es tu parte favorita? 👇', cta: 'Cotiza tu proyecto' },
    { titulo: 'Obra entregada: {lugar}', copy: '{m2} m² de {producto} entregados a tiempo, por etapas. Gracias a {aliado} por confiar en SICHAR.', cta: 'Hablar con un asesor' },
  ],
  'Guía de acabados': [
    { titulo: '3 claves para combinar {producto}', copy: '1. Contrasta con grifería negro mate. 2. Usa boquilla del mismo tono. 3. Gran formato = menos juntas, más amplitud. Guarda este post 📌', cta: 'Descarga el catálogo' },
  ],
  'Producto insignia': [
    { titulo: '{producto} en 4 espacios', copy: 'Un solo porcelanato, cuatro ambientes: baño, cocina, sala y fachada. ¿1, 2, 3 o 4?', cta: 'Dónde comprar' },
  ],
  'Confianza y aliados': [
    { titulo: 'Conoce a {aliado}', copy: 'Aliado SICHAR en {lugar}. Asesoría, inventario y entrega en tu barrio. Así se ve trabajar con quien te conoce.', cta: 'Conoce a nuestros aliados' },
  ],
}

export default function Contenido() {
  const { s, ahora, cambiar } = useStore()
  const aviso = useAviso()
  const [gen, setGen] = useState(false)
  const inicio = ahora - ((new Date(ahora).getDay() + 6) % 7) * DIA - 7 * DIA
  const dias = Array.from({ length: 21 }, (_, i) => inicio + i * DIA)
  const pub = s.publicaciones.filter((p) => p.estado === 'publicada')

  return (
    <div className="grid gap-5 animate-entrar">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="titulo-app">Contenido y redes</h1>
          <p className="text-sm text-white/50">Plan de 90 días · 3 publicaciones por semana · 4 pilares (hallazgo 6).</p>
        </div>
        <button className="btn-primario" onClick={() => setGen(true)}><Sparkles size={16} /> Generar publicación</button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi titulo="Publicadas" valor={pub.length} detalle="Meta: 3 por semana" />
        <Kpi titulo="Alcance" valor={sum(pub, (p) => p.alcance ?? 0).toLocaleString('es-CO')} detalle="personas" />
        <Kpi titulo="Interacciones" valor={sum(pub, (p) => p.interacciones ?? 0).toLocaleString('es-CO')} icono={<Heart size={16} />} />
        <Kpi titulo="Leads desde redes" valor={s.leads.filter((l) => l.fuente === 'redes').length} tono="marca" detalle="Medidos en el CRM" />
      </div>

      <div className="tarjeta overflow-x-auto p-4">
        <div className="grid min-w-[760px] grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => <div key={d} className="px-2 text-xs font-semibold uppercase text-white/40">{d}</div>)}
          {dias.map((d) => {
            const hoy = Math.floor(d / DIA) === Math.floor(ahora / DIA)
            const items = s.publicaciones.filter((p) => Math.floor(p.fecha / DIA) === Math.floor(d / DIA))
            return (
              <div key={d} className={`min-h-28 rounded-xl p-2 ${hoy ? 'bg-naranja/10 ring-2 ring-naranja/40' : 'bg-white/[.04]'}`}>
                <div className="text-xs font-semibold text-white/45">{new Date(d).getDate()}</div>
                {items.map((p) => {
                  const I = ICONO[p.plataforma]
                  return (
                    <div key={p.id} className={`mt-1 rounded-lg p-1.5 text-[11px] leading-tight ${COLOR_PILAR[p.pilar]} ${p.estado === 'idea' ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-1 font-semibold"><I size={11} /> {p.estado}</div>
                      <div className="line-clamp-2">{p.titulo}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {ESTADOS.map((e) => (
          <div key={e} className="rounded-2xl bg-white/[.035] p-2">
            <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white/50">{e}</div>
            <div className="grid gap-2">
              {s.publicaciones.filter((p) => p.estado === e).map((p) => {
                const I = ICONO[p.plataforma]
                return (
                  <div key={p.id} className="rounded-xl bg-[#181818] p-3 shadow-sm ring-1 ring-white/5">
                    <div className="flex items-center justify-between"><span className={`chip ${COLOR_PILAR[p.pilar]}`}>{p.pilar}</span><I size={15} className="text-white/40" /></div>
                    <div className="mt-2 text-sm font-semibold">{p.titulo}</div>
                    <p className="mt-1 text-xs text-white/55">{p.copy}</p>
                    <div className="mt-2 text-[11px] text-white/40">{fmtFecha(p.fecha)} · CTA: {p.cta}</div>
                    {p.alcance && <div className="mt-1 text-[11px] font-semibold text-emerald-300">{p.alcance.toLocaleString('es-CO')} alcance · {p.interacciones} interacciones</div>}
                    <div className="mt-2 flex gap-1">
                      <button className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] hover:bg-white/10" onClick={() => { void navigator.clipboard?.writeText(`${p.copy}\n\n👉 ${p.cta}`); aviso({ titulo: 'Copy copiado', tipo: 'info' }) }}><Copy size={11} className="inline" /> Copiar</button>
                      {e !== 'publicada' && <button className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] hover:bg-white/10" onClick={() => cambiar((c) => { const x = c.s.publicaciones.find((y) => y.id === p.id)!; x.estado = ESTADOS[ESTADOS.indexOf(e) + 1]; if (x.estado === 'publicada') { x.alcance = 3000 + Math.round(Math.random() * 6000); x.interacciones = Math.round(x.alcance * 0.07) } })}>Avanzar →</button>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <Generador abierto={gen} cerrar={() => setGen(false)} />
    </div>
  )
}

function Generador({ abierto, cerrar }: { abierto: boolean; cerrar: () => void }) {
  const { s, ahora, cambiar } = useStore()
  const [pilar, setPilar] = useState<Publicacion['pilar']>('Proyectos reales')
  const [plataforma, setPlataforma] = useState<Publicacion['plataforma']>('Instagram')
  const [producto, setProducto] = useState('p1')
  const [aliado, setAliado] = useState('d1')
  const [i, setI] = useState(0)
  const d = s.distribuidores.find((x) => x.id === aliado)!
  const p = s.productos.find((x) => x.id === producto)!
  const pl = PLANTILLAS[pilar][i % PLANTILLAS[pilar].length]
  const llenar = (t: string) => t.replace(/{producto}/g, p.nombre).replace(/{aliado}/g, d.nombre).replace(/{lugar}/g, `${d.barrio}, ${d.ciudad}`).replace(/{espacio}/g, 'baño').replace(/{m2}/g, '1.200')
  return (
    <Modal abierto={abierto} cerrar={cerrar} titulo="Generar publicación" ancho="max-w-xl">
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label><span className="etiqueta">Pilar</span><select className="campo" value={pilar} onChange={(e) => { setPilar(e.target.value as Publicacion['pilar']); setI(0) }}>{PILARES.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label><span className="etiqueta">Plataforma</span><select className="campo" value={plataforma} onChange={(e) => setPlataforma(e.target.value as Publicacion['plataforma'])}>{['Instagram', 'Pinterest', 'LinkedIn', 'WhatsApp'].map((x) => <option key={x}>{x}</option>)}</select></label>
          <label><span className="etiqueta">Producto</span><select className="campo" value={producto} onChange={(e) => setProducto(e.target.value)}>{s.productos.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label>
          <label><span className="etiqueta">Aliado a mencionar</span><select className="campo" value={aliado} onChange={(e) => setAliado(e.target.value)}>{s.distribuidores.filter((x) => x.aliado).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label>
        </div>
        <div className="rounded-2xl bg-white/[.04] p-4">
          <div className="font-semibold">{llenar(pl.titulo)}</div>
          <p className="mt-1 text-sm text-white/65">{llenar(pl.copy)}</p>
          <div className="mt-2 text-xs font-semibold text-naranja-200">👉 {pl.cta}</div>
        </div>
        <div className="flex justify-between gap-2">
          <button className="btn-claro" onClick={() => setI(i + 1)}><Sparkles size={15} /> Otra versión</button>
          <button className="btn-primario" onClick={() => { cambiar((c) => c.s.publicaciones.push({ id: uid('pu'), fecha: ahora + 3 * DIA, plataforma, pilar, titulo: llenar(pl.titulo), copy: llenar(pl.copy), cta: pl.cta, estado: 'idea' })); cerrar() }}><Plus size={15} /> Agregar al calendario</button>
        </div>
      </div>
    </Modal>
  )
}
