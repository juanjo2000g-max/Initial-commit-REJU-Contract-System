import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Muestra } from '../../components/Textura'
import { useStore } from '../../lib/store'
import { BotonMagnetico, Etiqueta, Revelar, TituloRevelado } from '../comunes'
import { useMiProyecto } from '../ctx'

interface Estilo {
  id: string
  nombre: string
  frase: string
  ambiente: 'bano' | 'cocina' | 'sala'
  piso: string
  pared: string
  acento: string
  griferia: 'negro' | 'cromo' | 'dorado'
  luz: 'dia' | 'calida' | 'noche'
}

const ESTILOS: Estilo[] = [
  { id: 'spa', nombre: 'Spa Calacatta', frase: 'Mármol blanco, madera cálida y negro mate. Un hotel cinco estrellas en casa.', ambiente: 'bano', piso: 'p1', pared: 'p7', acento: 'p2', griferia: 'negro', luz: 'calida' },
  { id: 'gold', nombre: 'Lujo Statuario', frase: 'Veta dorada y oro cepillado. Para los que no le temen al brillo.', ambiente: 'bano', piso: 'p3', pared: 'p1', acento: 'p3', griferia: 'dorado', luz: 'noche' },
  { id: 'nordico', nombre: 'Nórdico cálido', frase: 'Roble claro, blanco y verde salvia. Luz, calma y textura.', ambiente: 'cocina', piso: 'p5', pared: 'p7', acento: 'p10', griferia: 'cromo', luz: 'dia' },
  { id: 'industrial', nombre: 'Industrial urbano', frase: 'Cemento gris, negro y madera oscura. Carácter de loft.', ambiente: 'cocina', piso: 'p4', pared: 'p9', acento: 'p6', griferia: 'negro', luz: 'calida' },
  { id: 'nero', nombre: 'Contraste Nero', frase: 'Piso negro espejo que duplica cada luz. Dramático.', ambiente: 'sala', piso: 'p2', pared: 'p11', acento: 'p1', griferia: 'dorado', luz: 'noche' },
  { id: 'terrazo', nombre: 'Terrazo boutique', frase: 'Chips de color y paneles en relieve. Alegre y de autor.', ambiente: 'sala', piso: 'p8', pared: 'p11', acento: 'p10', griferia: 'dorado', luz: 'dia' },
]

const PREGUNTAS = [
  { p: '¿Qué espacio quieres transformar?', o: [['Baño', ['spa', 'gold']], ['Cocina', ['nordico', 'industrial']], ['Sala', ['nero', 'terrazo']]] },
  { p: '¿Qué te hace sentir en casa?', o: [['Luz y calma', ['spa', 'nordico', 'terrazo']], ['Carácter y contraste', ['industrial', 'nero', 'gold']]] },
  { p: '¿Brillo o textura?', o: [['Brillo espejo', ['spa', 'gold', 'nero']], ['Textura natural', ['nordico', 'industrial', 'terrazo']]] },
] as const

const url = (e: Estilo) => `/espacios?ambiente=${e.ambiente}&piso=${e.piso}&pared=${e.pared}&acento=${e.acento}&griferia=${e.griferia}&luz=${e.luz}`

export default function Inspiracion() {
  const { s } = useStore()
  const { agregar } = useMiProyecto()
  const P = (id: string) => s.productos.find((p) => p.id === id)!
  return (
    <div className="pt-36">
      <section className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Etiqueta>Inspiración</Etiqueta>
        <h1 className="mt-6 font-display text-[15vw] font-extrabold leading-[.85] tracking-tighter md:text-[9vw]">Encuentra tu estilo.</h1>
      </section>

      <Quiz />

      <section className="mx-auto max-w-[1500px] px-5 py-24 md:px-10">
        <TituloRevelado texto="Seis ambientes listos para hacer tuyos." className="max-w-4xl font-display text-5xl font-extrabold leading-[.95] tracking-tighter md:text-6xl" resaltar={['tuyos.']} />
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {ESTILOS.map((e, k) => (
            <Revelar key={e.id} retraso={(k % 2) * 0.1} className={k % 2 ? 'md:mt-24' : ''}>
              <article id={e.id} className="group">
                <Link to={url(e)} className="relative block overflow-hidden rounded-[28px]">
                  <div className="grid aspect-[4/3] grid-cols-[2fr_1fr] gap-1 transition duration-[1.4s] ease-out group-hover:scale-105">
                    <Muestra p={P(e.piso)} className="h-full w-full" escala={2.6} />
                    <div className="grid grid-rows-2 gap-1">
                      <Muestra p={P(e.pared)} className="h-full w-full" escala={1.6} />
                      <Muestra p={P(e.acento)} className="h-full w-full" escala={1.2} />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[.2em] text-naranja-200">{e.ambiente === 'bano' ? 'Baño' : e.ambiente === 'cocina' ? 'Cocina' : 'Sala'}</div>
                      <h3 className="mt-1 font-display text-4xl font-bold">{e.nombre}</h3>
                    </div>
                    <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-tinta transition group-hover:bg-naranja group-hover:text-white">Abrir en 3D <ArrowUpRight size={16} /></span>
                  </div>
                </Link>
                <p className="mt-5 max-w-md text-white/60">{e.frase}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {[e.piso, e.pared, e.acento].filter((x, i, a) => a.indexOf(x) === i).map((id) => (
                    <Link key={id} to={`/colecciones/${id}`} className="flex items-center gap-2 rounded-full bg-white/5 py-1 pl-1 pr-3 text-xs hover:bg-white/10">
                      <Muestra p={P(id)} className="h-6 w-6 rounded-full" escala={0.6} /> {P(id).nombre.replace('Porcelanato ', '')}
                    </Link>
                  ))}
                  <button onClick={() => agregar([e.piso, e.pared, e.acento])} className="rounded-full px-3 py-1.5 text-xs font-semibold text-naranja hover:text-white">+ Guardar todo</button>
                </div>
              </article>
            </Revelar>
          ))}
        </div>
      </section>
    </div>
  )
}

function Quiz() {
  const { s } = useStore()
  const P = (id: string) => s.productos.find((p) => p.id === id)!
  const [paso, setPaso] = useState(0)
  const [votos, setVotos] = useState<Record<string, number>>({})
  const terminado = paso >= PREGUNTAS.length
  const ganador = terminado ? ESTILOS.slice().sort((a, b) => (votos[b.id] ?? 0) - (votos[a.id] ?? 0))[0] : null
  const responder = (ids: readonly string[]) => {
    setVotos((v) => {
      const n = { ...v }
      ids.forEach((id) => (n[id] = (n[id] ?? 0) + (paso === 0 ? 3 : 1)))
      return n
    })
    setPaso(paso + 1)
  }
  return (
    <section className="mx-auto mt-16 max-w-[1500px] px-5 md:px-10">
      <div className="relative overflow-hidden rounded-[32px] bg-naranja p-8 text-tinta md:p-14">
        <AnimatePresence mode="wait">
          {!terminado ? (
            <motion.div key={paso} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }}>
              <div className="text-sm font-semibold">Test de estilo · {paso + 1} de {PREGUNTAS.length}</div>
              <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-6xl">{PREGUNTAS[paso].p}</h2>
              <div className="mt-10 flex flex-wrap gap-3">
                {PREGUNTAS[paso].o.map(([t, ids]) => (
                  <button key={t} onClick={() => responder(ids)} className="rounded-full bg-tinta px-7 py-4 text-lg font-semibold text-white transition hover:scale-105 hover:bg-black">{t}</button>
                ))}
              </div>
            </motion.div>
          ) : (
            ganador && (
              <motion.div key="fin" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="grid items-center gap-10 md:grid-cols-[1fr_1fr]">
                <div>
                  <div className="text-sm font-semibold">Tu estilo es</div>
                  <h2 className="mt-2 font-display text-6xl font-extrabold tracking-tighter md:text-8xl">{ganador.nombre}</h2>
                  <p className="mt-4 max-w-md text-lg text-black/70">{ganador.frase}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <BotonMagnetico to={url(ganador)} variante="oscuro">Verlo en 3D</BotonMagnetico>
                    <button onClick={() => { setPaso(0); setVotos({}) }} className="flex items-center gap-2 rounded-full px-5 py-3 font-semibold ring-1 ring-black/30"><RotateCcw size={16} /> Repetir</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[ganador.piso, ganador.pared, ganador.acento].map((id, i) => (
                    <motion.div key={id + i} initial={{ opacity: 0, y: 30, rotate: -4 + i * 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }}>
                      <Muestra p={P(id)} className="aspect-[3/5] w-full rounded-2xl shadow-2xl" escala={1.8} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
