import { Building2, Clock, Compass, FlaskConical, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAviso } from '../../components/ui'
import type { Sede } from '../../data/types'
import { useStore } from '../../lib/store'
import { Flujo } from '../Flujo'
import { DIA, SEDES, fmtFecha } from '../../lib/util'

export default function Automatizaciones() {
  const { s, cambiar, crearLead, avanzarDias } = useStore()
  const aviso = useAviso()
  // Refresca cada 2 s para que los pulsos de las reglas recientes se apaguen solos.
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 2000)
    return () => clearInterval(t)
  }, [])
  const ciudad = (): Sede => SEDES[Math.floor(Math.random() * SEDES.length)]

  const pruebas = [
    { icono: Home, t: 'Cliente final desde la web', f: () => crearLead({ nombre: 'Mariana Ochoa', telefono: '3015550101', segmento: 'hogar', ciudad: ciudad(), fuente: 'web', valor: 3_200_000, interes: 'Remodelar baño con Calacatta 60x130', m2: 14 }) },
    { icono: Building2, t: 'Constructora con obra registrada', f: () => crearLead({ nombre: 'Ing. Pablo Ríos', empresa: 'Constructora Bambú', telefono: '3015550102', segmento: 'constructora', ciudad: 'Cali', fuente: 'web', valor: 380_000_000, interes: 'Torres de Pance etapa 3, porcelanato 60x60', m2: 3900 }) },
    { icono: Building2, t: 'Constructora nueva', f: () => crearLead({ nombre: 'Arq. Elena Mora', empresa: 'Vértice Construcciones', telefono: '3015550103', segmento: 'constructora', ciudad: 'Bogotá', fuente: 'feria', valor: 210_000_000, interes: 'Edificio Calle 93, zonas comunes', m2: 2100 }) },
    { icono: Compass, t: 'Arquitecto / estudio', f: () => crearLead({ nombre: 'Tomás Gil', empresa: 'Estudio Lineal Arquitectos', telefono: '3015550104', segmento: 'arquitecto', ciudad: 'Cali', fuente: 'redes', valor: 45_000_000, interes: 'Hotel boutique, busca terrazo y grifería dorada', m2: 300 }) },
  ]

  return (
    <div className="grid gap-5 animate-entrar">
      <div>
        <h1 className="titulo-app">Automatizaciones</h1>
        <p className="text-sm text-white/50">Reglas que trabajan solas, 24/7. Cada una nace de un hallazgo del informe de consultoría.</p>
      </div>

      <div className="tarjeta p-5">
        <div className="flex items-center gap-2 font-semibold"><FlaskConical size={18} className="text-naranja" /> Probar en vivo</div>
        <p className="text-sm text-white/50">Crea un caso de prueba y mira qué hacen las reglas.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {pruebas.map((p) => (
            <button key={p.t} className="flex items-center gap-3 rounded-xl bg-white/[.04] p-3 text-left text-sm font-medium transition hover:bg-naranja/10 hover:ring-1 hover:ring-naranja/40" onClick={() => { const r = p.f(); aviso({ titulo: `Asignado a ${r.responsable ?? '—'}`, texto: r.mensajeCliente, tipo: 'exito' }) }}>
              <p.icono size={18} className="shrink-0 text-naranja" /> {p.t}
            </button>
          ))}
          <button className="flex items-center gap-3 rounded-xl bg-naranja p-3 text-left text-sm font-medium text-white hover:bg-naranja-600" onClick={() => { const e = avanzarDias(7); aviso({ titulo: 'Pasaron 7 días', texto: `${e.length} reglas se dispararon`, tipo: 'exito' }) }}>
            <Clock size={18} className="shrink-0 text-naranja" /> Adelantar 7 días
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {s.reglas.map((r) => (
          <div key={r.id} className={`tarjeta p-5 transition ${r.activa ? '' : 'opacity-55'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2"><span className="chip bg-naranja/15 text-naranja-200">Hallazgo {r.hallazgo}</span><span className="text-xs text-white/40">{r.ejecuciones} ejecuciones</span></div>
                <h3 className="mt-2 font-semibold">{r.nombre}</h3>
              </div>
              <button onClick={() => cambiar((c) => { const x = c.s.reglas.find((y) => y.id === r.id)!; x.activa = !x.activa })} className={`relative h-6 w-11 shrink-0 rounded-full transition ${r.activa ? 'bg-naranja' : 'bg-black/15'}`} aria-label="Activar">
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${r.activa ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <Flujo r={r} activa={r.activa} reciente={s.eventos.some((e) => e.reglaId === r.id && Date.now() + s.desfaseDias * DIA - e.fecha < 9000)} />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="tarjeta p-5">
          <h2 className="font-semibold">Registro de ejecuciones</h2>
          <div className="mt-3 max-h-[520px] overflow-auto scroll-fino">
            {s.eventos.length === 0 && <p className="py-8 text-center text-sm text-white/45">Sin ejecuciones aún. Usa los botones de prueba.</p>}
            <ol className="grid gap-2">
              {s.eventos.map((e) => (
                <li key={e.id} className="rounded-xl bg-white/[.04] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{e.titulo}</span>
                    <span className="flex items-center gap-2 text-[11px] text-white/45">
                      {e.webhook && <span className={`chip ${e.webhook === 'enviado' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>webhook {e.webhook}</span>}
                      {fmtFecha(e.fecha, true)}
                    </span>
                  </div>
                  <div className="text-xs text-white/55">{e.detalle}</div>
                  <div className="mt-1 flex flex-wrap gap-1">{e.acciones.map((a) => <span key={a} className="chip bg-[#181818] text-white/60 ring-1 ring-white/5">✓ {a}</span>)}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-semibold">Cómo se conecta en producción</h2>
          <ol className="mt-3 grid gap-3 text-sm text-white/65">
            <li><b className="text-white">1. Webhook:</b> cada ejecución se envía como JSON a la URL que configures en <Link className="font-semibold text-naranja" to="/ajustes">Ajustes</Link> (n8n, Make, Zapier o un backend propio).</li>
            <li><b className="text-white">2. WhatsApp Business API:</b> el flujo en n8n toma el evento y envía la plantilla aprobada por Meta al distribuidor y al cliente.</li>
            <li><b className="text-white">3. Correo y Google Calendar:</b> las asesorías y tareas se agendan automáticamente.</li>
            <li><b className="text-white">4. ERP / facturación:</b> los pedidos aceptados se exportan al sistema contable (Siigo, World Office, etc.).</li>
          </ol>
          <pre className="mt-4 overflow-auto rounded-xl bg-black p-3 text-[11px] leading-relaxed text-emerald-300 scroll-fino">{JSON.stringify({ fuente: 'sichar-os', eventos: [s.eventos[0] ?? { reglaId: 'r1', titulo: 'Referido → Acabados del Valle', acciones: ['…'] }] }, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
