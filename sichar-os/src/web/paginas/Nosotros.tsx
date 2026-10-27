import { Handshake, Lightbulb, PackageCheck, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { SEDES } from '../../lib/util'
import { BotonMagnetico, Contador, Etiqueta, Revelar, TextoScroll } from '../comunes'
import { Globo, ORIGENES } from '../Globo'

export default function Nosotros() {
  const [activo, setActivo] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => setActivo((x) => (x + 1) % ORIGENES.length), 5000)
    return () => clearInterval(t)
  }, [auto])

  return (
    <div className="pt-36">
      <section className="mx-auto max-w-[1500px] px-5 md:px-10">
        <Etiqueta>Nosotros</Etiqueta>
        <h1 className="mt-6 max-w-6xl font-display text-[14vw] font-extrabold leading-[.85] tracking-tighter md:text-[8vw]">Del mundo a tu obra. <span className="text-naranja">Sin intermediarios.</span></h1>
      </section>

      <section className="mx-auto mt-16 grid max-w-[1500px] items-center gap-12 px-5 md:px-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative mx-auto aspect-square w-full min-w-0 max-w-[720px]">
          <div className="absolute inset-[8%] rounded-full bg-naranja/10 blur-3xl" />
          <Globo activo={activo} className="relative mx-auto" />
        </div>
        <div>
          <p className="text-lg text-white/60">Compramos directo a fábricas en cinco países y lo traemos a nuestras bodegas en Colombia. Así controlamos la calidad, el inventario y el precio.</p>
          <div className="mt-10 grid gap-2">
            {ORIGENES.map((o, i) => (
              <button key={o.pais} onClick={() => { setActivo(i); setAuto(false) }} className={`relative overflow-hidden rounded-2xl p-5 text-left transition ${activo === i ? 'bg-white/[.07]' : 'hover:bg-white/[.03]'}`}>
                {activo === i && auto && <motion.span key={`b${i}`} className="absolute bottom-0 left-0 h-0.5 bg-naranja" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'linear' }} />}
                <div className="flex items-baseline justify-between">
                  <span className={`font-display text-3xl font-bold ${activo === i ? 'text-naranja' : 'text-white/80'}`}>{o.pais}</span>
                  <span className="text-xs text-white/40">→ Cali</span>
                </div>
                <AnimatePresence>
                  {activo === i && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-white/55">
                      <span className="block pt-2">{o.lineas}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-40 md:px-10">
        <Etiqueta>Nuestro propósito</Etiqueta>
        <TextoScroll className="mt-10 font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl" texto="Somos su proveedor, no su competidor. Durante más de veinte años las ferreterías y distribuidores de Colombia han crecido con nosotros, y así queremos seguir: inspirando al cliente final y llevándolo a la puerta de nuestros aliados." />
      </section>

      <section className="bg-[#f4f1ec] py-32 text-tinta">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <h2 className="font-display text-5xl font-extrabold tracking-tighter md:text-7xl">Lo que nos mueve</h2>
          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              [Handshake, 'Confianza del canal', 'Precios sugeridos iguales en todo el país y proyectos protegidos para nuestros distribuidores.'],
              [ShieldCheck, 'Calidad importada', 'Relación directa con fábricas en India, China, Brasil, España y Perú.'],
              [PackageCheck, 'Inventario real', 'Cinco sedes con bodega propia para responder a tiempo a cada obra.'],
              [Lightbulb, 'Asesoría', 'Diseño, muestras y acompañamiento técnico para arquitectos y constructoras.'],
            ].map(([I, t, d], k) => {
              const Icono = I as typeof Handshake
              return (
                <Revelar key={t as string} retraso={k * 0.08}>
                  <div className="h-full rounded-[28px] bg-white p-8">
                    <Icono size={34} className="text-naranja" />
                    <h3 className="mt-8 font-display text-2xl font-bold">{t as string}</h3>
                    <p className="mt-3 text-black/60">{d as string}</p>
                  </div>
                </Revelar>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-32 md:px-10">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <Etiqueta>Presencia nacional</Etiqueta>
            <h2 className="mt-6 font-display text-5xl font-extrabold leading-[.95] tracking-tighter md:text-7xl">Cinco sedes. Un solo equipo.</h2>
            <div className="mt-10 grid grid-cols-2 gap-8">
              <div><Contador valor={20} sufijo="+" className="font-display text-7xl font-extrabold text-naranja" /><div className="text-white/50">años</div></div>
              <div><Contador valor={5} className="font-display text-7xl font-extrabold text-naranja" /><div className="text-white/50">países de origen</div></div>
            </div>
            <div className="mt-10"><BotonMagnetico to="/donde-comprar">Encuentra un aliado</BotonMagnetico></div>
          </div>
          <div className="grid gap-2 self-end">
            {SEDES.map((c, k) => (
              <Revelar key={c} retraso={k * 0.06}>
                <div className="group flex items-center justify-between border-b border-white/10 py-6">
                  <span className="font-display text-4xl font-bold tracking-tight transition group-hover:translate-x-3 group-hover:text-naranja md:text-5xl">{c}</span>
                  <span className="text-sm text-white/40">{k === 0 ? 'Sede principal' : 'Sede y bodega'}</span>
                </div>
              </Revelar>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
