import { ArrowLeft, Box, Heart, MapPin, Package, Ruler } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Muestra } from '../../components/Textura'
import type { Producto as P } from '../../data/types'
import { useStore } from '../../lib/store'
import { SEDES, fmtCOP } from '../../lib/util'
import { BotonMagnetico, Revelar } from '../comunes'
import { useMiProyecto } from '../ctx'
import { Losa } from '../Losa'
import { Tarjeta } from './Colecciones'

/** m² por caja según el formato (valores típicos; se ajustan con la ficha real). */
function m2Caja(p: P) {
  const t: Record<string, number> = { '60x130': 1.56, '60x60': 1.44, '20x120': 1.44, '30x60': 1.62, '30x30': 0.9, '50x50': 1 }
  return t[p.formato] ?? 1
}

const USOS: Record<string, string> = {
  ceramica: 'Pisos y muros interiores · alto tráfico residencial y comercial',
  bano: 'Baños residenciales y comerciales',
  decorativo: 'Muros de acento, duchas, cocinas',
  remodelacion: 'Instalación de cerámica y porcelanato',
}

export default function Producto() {
  const { id } = useParams()
  const { s } = useStore()
  const { ids, alternar } = useMiProyecto()
  const [vista, setVista] = useState<'pieza' | 'instalado' | 'detalle'>('pieza')
  const [m2, setM2] = useState(20)
  const p = s.productos.find((x) => x.id === id)
  if (!p) return <div className="grid h-screen place-items-center">Producto no encontrado.</div>
  const guardado = ids.includes(p.id)
  const porM2 = p.unidad === 'm²'
  const conDesperdicio = m2 * 1.1
  const cajas = Math.ceil(conDesperdicio / m2Caja(p))
  const relacionados = s.productos.filter((x) => x.id !== p.id && (x.linea !== p.linea || x.textura === p.textura)).sort((a, b) => b.ventasMes - a.ventasMes).slice(0, 4)
  const gran = p.formato === '60x130'

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Link to="/colecciones" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft size={16} /> Colecciones</Link>
      </div>
      <section className="mx-auto mt-8 grid max-w-[1500px] gap-12 px-5 md:px-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="grid place-items-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1d1d1d] to-[#0f0f0f] p-8 ring-1 ring-white/10 md:p-14" style={{ minHeight: 560 }}>
            <motion.div key={vista} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className={vista === 'pieza' ? (gran ? 'w-[42%]' : 'w-[72%]') : 'w-full'}>
              {vista === 'pieza' && <Losa p={p} escala={gran ? 2.8 : 1.6} proporcion={gran ? '60/130' : '1/1'} inclinar={14} />}
              {vista === 'instalado' && (
                <div className="aspect-[4/3] overflow-hidden rounded-2xl [perspective:900px]">
                  <div className="h-[160%] w-full origin-top [transform:rotateX(58deg)_translateY(-8%)]">
                    <Muestra p={p} className="h-full w-full" escala={0.7} />
                  </div>
                </div>
              )}
              {vista === 'detalle' && <Muestra p={p} className="aspect-[4/3] w-full rounded-2xl" escala={6} />}
            </motion.div>
          </div>
          <div className="mt-3 flex gap-2">
            {(['pieza', 'instalado', 'detalle'] as const).map((v) => (
              <button key={v} onClick={() => setVista(v)} className={`flex-1 rounded-full py-2.5 text-sm font-medium capitalize transition ${vista === v ? 'bg-white text-tinta' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>{v === 'pieza' ? 'La pieza' : v === 'instalado' ? 'Instalado' : 'Detalle'}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {p.insignia && <span className="rounded-full bg-naranja px-3 py-1 text-xs font-semibold">Producto insignia</span>}
            {p.lineaDirecta && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Colección de proyecto</span>}
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">Importado de {p.origen}</span>
          </div>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[.95] tracking-tighter md:text-7xl">{p.nombre}</h1>
          <p className="mt-5 max-w-lg text-lg text-white/65">{p.descripcion}</p>
          <div className="mt-8 flex items-end gap-3">
            <span className="font-display text-5xl font-bold">{fmtCOP(p.pvpSugerido)}</span>
            <span className="pb-2 text-white/50">/{p.unidad} · precio sugerido al público</span>
          </div>
          <p className="mt-2 text-sm text-white/45">Mismo precio en todos los distribuidores aliados del país.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <BotonMagnetico to={`/espacios?piso=${p.id}`}>Verlo en mi espacio 3D</BotonMagnetico>
            <button onClick={() => alternar(p.id)} className={`flex items-center gap-2 rounded-full px-6 py-4 text-[15px] font-semibold ring-1 transition ${guardado ? 'bg-white text-tinta ring-white' : 'ring-white/25 hover:ring-white/60'}`}>
              <Heart size={17} className={guardado ? 'fill-naranja text-naranja' : ''} /> {guardado ? 'En mi proyecto' : 'Guardar'}
            </button>
          </div>

          {porM2 && (
            <Revelar className="mt-12 rounded-3xl bg-white/[.04] p-6 ring-1 ring-white/10">
              <div className="flex items-center gap-2 font-semibold"><Ruler size={18} className="text-naranja" /> ¿Cuánto necesito?</div>
              <div className="mt-5 flex items-center gap-4">
                <input type="range" min={2} max={200} value={m2} onChange={(e) => setM2(Number(e.target.value))} className="flex-1 accent-[#F47920]" />
                <div className="w-28 rounded-xl bg-white/5 px-3 py-2 text-right font-display text-2xl font-bold">{m2} m²</div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <Dato icono={<Box size={16} />} valor={`${conDesperdicio.toFixed(1).replace('.', ',')} m²`} texto="con 10 % de desperdicio" />
                <Dato icono={<Package size={16} />} valor={String(cajas)} texto={`cajas de ${m2Caja(p).toString().replace('.', ',')} m²`} />
                <Dato icono={<span className="text-xs">$</span>} valor={fmtCOP(cajas * m2Caja(p) * p.pvpSugerido)} texto="valor estimado" />
              </div>
              {gran && <p className="mt-4 text-xs text-white/45">Para gran formato recomendamos pegante C2TE y sistema de nivelación. Los encuentras en Remodelación.</p>}
            </Revelar>
          )}

          <Revelar className="mt-8">
            <dl className="divide-y divide-white/10 border-y border-white/10 text-sm">
              {[
                ['Referencia', p.ref],
                ['Formato', `${p.formato}${porM2 ? ' cm' : ''}`],
                ['Acabado', p.acabado],
                ['Origen', p.origen],
                ['Unidad de venta', p.unidad],
                ['Uso recomendado', USOS[p.linea]],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3.5"><dt className="text-white/50">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
          </Revelar>

          <Revelar className="mt-8">
            <div className="flex items-center gap-2 font-semibold"><MapPin size={17} className="text-naranja" /> Disponibilidad por sede</div>
            <div className="mt-4 grid gap-2.5">
              {SEDES.map((c) => {
                const n = p.stock[c]
                const max = Math.max(...SEDES.map((x) => p.stock[x]))
                return (
                  <div key={c} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
                    <span className="text-white/60">{c}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-naranja" initial={{ width: 0 }} whileInView={{ width: `${(n / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1 }} /></div>
                    <span className={`text-xs font-semibold ${n < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>{n < 100 ? 'Pocas unidades' : 'Disponible'}</span>
                  </div>
                )
              })}
            </div>
            <Link to="/donde-comprar" className="mt-6 inline-flex items-center gap-2 font-semibold text-naranja hover:text-white">Encontrar un distribuidor aliado cerca →</Link>
          </Revelar>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-32 md:px-10">
        <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">Combínalo con</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {relacionados.map((r) => <Tarjeta key={r.id} p={r} />)}
        </div>
      </section>
    </div>
  )
}

function Dato({ icono, valor, texto }: { icono: React.ReactNode; valor: string; texto: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-naranja/15 text-naranja">{icono}</div>
      <div className="mt-2 font-display text-xl font-bold">{valor}</div>
      <div className="text-[11px] text-white/45">{texto}</div>
    </div>
  )
}
