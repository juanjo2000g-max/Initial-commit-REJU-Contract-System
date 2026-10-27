import { Bath, Camera, ChefHat, Heart, Link2, Moon, Sofa, Sparkles, Sun, Sunset } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Muestra } from '../../components/Textura'
import { useAviso } from '../../components/ui'
import type { Producto } from '../../data/types'
import { useStore } from '../../lib/store'
import type { Griferia, Luz, TipoAmbiente } from '../3d/Escena3D'
import { useMiProyecto } from '../ctx'

const Escena3D = lazy(() => import('../3d/Escena3D'))

const AMBIENTES: { id: TipoAmbiente; nombre: string; icono: typeof Bath; base: [string, string, string] }[] = [
  { id: 'bano', nombre: 'Baño', icono: Bath, base: ['p1', 'p7', 'p2'] },
  { id: 'cocina', nombre: 'Cocina', icono: ChefHat, base: ['p4', 'p7', 'p10'] },
  { id: 'sala', nombre: 'Sala', icono: Sofa, base: ['p3', 'p11', 'p6'] },
]
const GRIFERIAS: { id: Griferia; nombre: string; fondo: string }[] = [
  { id: 'negro', nombre: 'Negro mate', fondo: '#151515' },
  { id: 'cromo', nombre: 'Cromo', fondo: 'linear-gradient(135deg,#8d9198,#f5f6f7 50%,#a9adb3)' },
  { id: 'dorado', nombre: 'Oro cepillado', fondo: 'linear-gradient(135deg,#9e7c3c,#f1d999 50%,#b8924a)' },
]
const LUCES: { id: Luz; nombre: string; icono: typeof Sun }[] = [
  { id: 'dia', nombre: 'Día', icono: Sun },
  { id: 'calida', nombre: 'Atardecer', icono: Sunset },
  { id: 'noche', nombre: 'Noche', icono: Moon },
]
type Pestaña = 'piso' | 'pared' | 'acento' | 'griferia' | 'luz'

export default function Espacios() {
  const { s } = useStore()
  const aviso = useAviso()
  const nav = useNavigate()
  const { agregar } = useMiProyecto()
  const [params, setParams] = useSearchParams()
  const ambiente = (params.get('ambiente') as TipoAmbiente) || 'bano'
  const base = AMBIENTES.find((a) => a.id === ambiente)!.base
  const P = (id: string | null, def: string) => s.productos.find((p) => p.id === id) ?? s.productos.find((p) => p.id === def)!
  const piso = P(params.get('piso'), base[0])
  const pared = P(params.get('pared'), base[1])
  const acento = P(params.get('acento'), base[2])
  const griferia = (params.get('griferia') as Griferia) || 'negro'
  const luz = (params.get('luz') as Luz) || 'calida'
  const [pestaña, setPestaña] = useState<Pestaña>('piso')

  const fijar = (k: string, v: string) => {
    const n = new URLSearchParams(params)
    n.set(k, v)
    setParams(n, { replace: true })
  }
  const cambiarAmbiente = (a: TipoAmbiente) => {
    const b = AMBIENTES.find((x) => x.id === a)!.base
    setParams({ ambiente: a, piso: b[0], pared: b[1], acento: b[2], griferia, luz }, { replace: true })
  }

  const superficies = s.productos.filter((p) => p.unidad === 'm²' && p.linea !== 'remodelacion')
  const opciones: Record<'piso' | 'pared' | 'acento', Producto[]> = {
    piso: superficies.filter((p) => p.linea === 'ceramica' && p.id !== 'p7'),
    pared: superficies.filter((p) => p.linea === 'ceramica'),
    acento: superficies,
  }
  const actual = { piso, pared, acento }

  const capturar = () => {
    const c = document.querySelector('#lienzo-3d canvas') as HTMLCanvasElement | null
    if (!c) return
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `mi-${ambiente}-sichar.png`
    a.click()
    aviso({ titulo: 'Imagen descargada', texto: 'Compártela con tu familia o tu arquitecto.', tipo: 'exito' })
  }
  const compartir = async () => {
    try {
      await navigator.clipboard.writeText(location.href)
      aviso({ titulo: 'Enlace copiado', texto: 'Quien lo abra verá exactamente este diseño.', tipo: 'exito' })
    } catch {
      aviso({ titulo: 'Copia este enlace', texto: location.href, tipo: 'info' })
    }
  }
  const cotizar = () => {
    agregar([piso.id, pared.id, acento.id])
    const nombre = AMBIENTES.find((a) => a.id === ambiente)!.nombre.toLowerCase()
    nav(`/contacto?interes=${encodeURIComponent(`Diseño de ${nombre} en 3D: piso ${piso.nombre}, pared ${pared.nombre}, acento ${acento.nombre}, grifería ${GRIFERIAS.find((g) => g.id === griferia)!.nombre.toLowerCase()}`)}`)
  }

  return (
    <section className="relative h-[100svh] min-h-[680px] overflow-hidden bg-black pt-0">
      <div id="lienzo-3d" className="absolute inset-0">
        <Suspense fallback={<div className="grid h-full place-items-center text-white/40">Construyendo tu espacio…</div>}>
          <Escena3D ambiente={ambiente} piso={piso} pared={pared} acento={acento} griferia={griferia} luz={luz} className="!h-full !w-full" />
        </Suspense>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />

      {/* Selector de ambiente */}
      <div className="absolute left-1/2 top-24 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-black/50 p-1.5 ring-1 ring-white/10 backdrop-blur-xl">
        {AMBIENTES.map((a) => (
          <button key={a.id} onClick={() => cambiarAmbiente(a.id)} className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${ambiente === a.id ? 'text-tinta' : 'text-white/70 hover:text-white'}`}>
            {ambiente === a.id && <motion.span layoutId="amb" className="absolute inset-0 rounded-full bg-white" />}
            <a.icono size={16} className="relative" /> <span className="relative">{a.nombre}</span>
          </button>
        ))}
      </div>

      {/* Ficha del diseño */}
      <div className="absolute bottom-6 left-5 z-10 hidden w-80 rounded-3xl bg-black/55 p-5 ring-1 ring-white/10 backdrop-blur-xl md:left-10 lg:block">
        <div className="text-[11px] font-semibold uppercase tracking-[.2em] text-white/45">Tu diseño</div>
        <div className="mt-3 grid gap-2.5">
          {(['piso', 'pared', 'acento'] as const).map((k) => (
            <button key={k} onClick={() => setPestaña(k)} className="flex items-center gap-3 text-left">
              <Muestra p={actual[k]} className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-white/20" escala={0.8} />
              <div className="min-w-0">
                <div className="text-[11px] capitalize text-white/45">{k === 'pared' ? 'Paredes' : k}</div>
                <div className="truncate text-sm font-semibold">{actual[k].nombre}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs text-white/40">Arrastra para girar · rueda para acercar</div>
      </div>

      {/* Panel de opciones */}
      <div className="absolute inset-x-3 bottom-3 z-10 rounded-3xl bg-black/60 p-4 ring-1 ring-white/10 backdrop-blur-xl md:inset-x-auto md:bottom-6 md:right-10 md:top-24 md:w-[400px] md:p-5">
        <div className="flex h-full flex-col">
          <div className="flex gap-1 overflow-x-auto rounded-full bg-white/5 p-1 text-sm">
            {(['piso', 'pared', 'acento', 'griferia', 'luz'] as Pestaña[]).map((t) => (
              <button key={t} onClick={() => setPestaña(t)} className={`relative flex-1 whitespace-nowrap rounded-full px-3 py-2 font-semibold capitalize transition ${pestaña === t ? 'text-tinta' : 'text-white/60 hover:text-white'}`}>
                {pestaña === t && <motion.span layoutId="pest" className="absolute inset-0 rounded-full bg-white" />}
                <span className="relative">{t === 'pared' ? 'Paredes' : t === 'griferia' ? 'Grifería' : t}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1" data-lenis-prevent>
            <AnimatePresence mode="wait">
              <motion.div key={pestaña} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {(pestaña === 'piso' || pestaña === 'pared' || pestaña === 'acento') && (
                  <div className="grid grid-cols-4 gap-2 md:grid-cols-3">
                    {opciones[pestaña].map((p) => (
                      <button key={p.id} onClick={() => fijar(pestaña, p.id)} className="group text-left">
                        <div className={`relative aspect-square overflow-hidden rounded-xl ring-2 transition ${actual[pestaña].id === p.id ? 'ring-naranja' : 'ring-transparent group-hover:ring-white/40'}`}>
                          <Muestra p={p} className="h-full w-full" escala={1.1} />
                          {p.insignia && <span className="absolute left-1 top-1 rounded-full bg-naranja px-1.5 text-[9px] font-bold">60x130</span>}
                        </div>
                        <div className="mt-1 hidden truncate text-[11px] text-white/60 md:block">{p.nombre.replace('Porcelanato ', '')}</div>
                      </button>
                    ))}
                  </div>
                )}
                {pestaña === 'griferia' && (
                  <div className="grid gap-2">
                    {GRIFERIAS.map((g) => (
                      <button key={g.id} onClick={() => fijar('griferia', g.id)} className={`flex items-center gap-4 rounded-2xl p-3 text-left ring-1 transition ${griferia === g.id ? 'bg-white/10 ring-naranja' : 'ring-white/10 hover:ring-white/30'}`}>
                        <span className="h-12 w-12 rounded-full ring-1 ring-white/20" style={{ background: g.fondo }} />
                        <span className="font-semibold">{g.nombre}</span>
                      </button>
                    ))}
                  </div>
                )}
                {pestaña === 'luz' && (
                  <div className="grid gap-2">
                    {LUCES.map((l) => (
                      <button key={l.id} onClick={() => fijar('luz', l.id)} className={`flex items-center gap-4 rounded-2xl p-4 text-left ring-1 transition ${luz === l.id ? 'bg-white/10 ring-naranja' : 'ring-white/10 hover:ring-white/30'}`}>
                        <l.icono className="text-naranja" />
                        <span className="font-semibold">{l.nombre}</span>
                      </button>
                    ))}
                    <p className="mt-2 text-xs text-white/45">Mira cómo cambia el brillo del porcelanato con cada luz.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-xs font-semibold">
            <button onClick={capturar} className="flex flex-col items-center gap-1 rounded-xl py-2 text-white/70 hover:bg-white/5 hover:text-white"><Camera size={17} /> Foto</button>
            <button onClick={compartir} className="flex flex-col items-center gap-1 rounded-xl py-2 text-white/70 hover:bg-white/5 hover:text-white"><Link2 size={17} /> Compartir</button>
            <button onClick={() => { agregar([piso.id, pared.id, acento.id]); aviso({ titulo: 'Guardado en Mi proyecto', tipo: 'exito' }) }} className="flex flex-col items-center gap-1 rounded-xl py-2 text-white/70 hover:bg-white/5 hover:text-white"><Heart size={17} /> Guardar</button>
          </div>
          <button onClick={cotizar} className="mt-3 flex items-center justify-center gap-2 rounded-full bg-naranja py-3.5 font-semibold transition hover:bg-naranja-600"><Sparkles size={17} /> Cotizar este diseño</button>
        </div>
      </div>
    </section>
  )
}
