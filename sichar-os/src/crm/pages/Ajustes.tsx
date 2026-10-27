import { RotateCcw, Send } from 'lucide-react'
import { useState } from 'react'
import { useAviso } from '../../components/ui'
import { enviarWebhook } from '../../lib/automatizaciones'
import { useStore } from '../../lib/store'
import { PAISES, uid } from '../../lib/util'

export default function Ajustes() {
  const { s, cambiar, reiniciar } = useStore()
  const aviso = useAviso()
  const [url, setUrl] = useState(s.config.webhookUrl)
  const c = s.config

  return (
    <div className="grid max-w-4xl gap-5 animate-entrar">
      <h1 className="titulo-app">Ajustes</h1>

      <section className="tarjeta p-5">
        <h2 className="font-semibold">Integraciones</h2>
        <p className="text-sm text-tinta/55">Pega la URL de un webhook (n8n, Make, Zapier) para recibir cada automatización en tiempo real.</p>
        <div className="mt-3 flex gap-2">
          <input className="campo" placeholder="https://tu-n8n.com/webhook/sichar" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button className="btn-oscuro" onClick={() => { cambiar((x) => { x.s.config.webhookUrl = url.trim() }); aviso({ titulo: 'Webhook guardado', tipo: 'exito' }) }}>Guardar</button>
          <button className="btn-claro" disabled={!url} onClick={async () => { const r = await enviarWebhook(url, [{ id: uid('e'), fecha: Date.now(), reglaId: 'prueba', titulo: 'Prueba de conexión', detalle: 'Evento de prueba desde SICHAR OS', acciones: [] }]); aviso({ titulo: r === 'enviado' ? 'Evento enviado' : 'No se pudo enviar', texto: r === 'error' ? 'Revisa la URL o el CORS del servidor.' : undefined, tipo: r === 'enviado' ? 'exito' : 'alerta' }) }}><Send size={16} /> Probar</button>
        </div>
        <label className="mt-4 block max-w-xs">
          <span className="etiqueta">WhatsApp principal de SICHAR</span>
          <input className="campo" value={c.whatsappSichar} onChange={(e) => cambiar((x) => { x.s.config.whatsappSichar = e.target.value })} />
        </label>
      </section>

      <section className="tarjeta p-5">
        <h2 className="font-semibold">Parámetros de costos de importación</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Num etiqueta="TRM (COP por USD)" v={c.trm} set={(v) => cambiar((x) => { x.s.config.trm = v })} />
          <Num etiqueta="Arancel %" v={c.arancel * 100} set={(v) => cambiar((x) => { x.s.config.arancel = v / 100 })} />
          <Num etiqueta="Nacionalización %" v={c.nacionalizacion * 100} set={(v) => cambiar((x) => { x.s.config.nacionalizacion = v / 100 })} />
          <Num etiqueta="Almacenamiento %" v={c.almacenamiento * 100} set={(v) => cambiar((x) => { x.s.config.almacenamiento = v / 100 })} />
          <Num etiqueta="Margen objetivo %" v={c.margenObjetivo * 100} set={(v) => cambiar((x) => { x.s.config.margenObjetivo = v / 100 })} />
          <Num etiqueta="Umbral proyecto (m²)" v={c.umbralProyectoM2} set={(v) => cambiar((x) => { x.s.config.umbralProyectoM2 = v })} />
        </div>
        <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-tinta/50">Flete y seguro por país (% del valor en origen)</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-5">
          {PAISES.map((p) => <Num key={p} etiqueta={p} v={c.flete[p] * 100} set={(v) => cambiar((x) => { x.s.config.flete[p] = v / 100 })} />)}
        </div>
      </section>

      <section className="tarjeta p-5">
        <h2 className="font-semibold">Datos de demostración</h2>
        <p className="text-sm text-tinta/55">Los datos viven en este navegador. Reinicia antes de la presentación para empezar limpio.</p>
        <button className="btn mt-3 bg-red-600 text-white hover:bg-red-700" onClick={() => { if (confirm('¿Reiniciar todos los datos de la demo?')) { reiniciar(); aviso({ titulo: 'Demo reiniciada', tipo: 'info' }) } }}><RotateCcw size={16} /> Reiniciar demo</button>
      </section>
    </div>
  )
}

function Num({ etiqueta, v, set }: { etiqueta: string; v: number; set: (v: number) => void }) {
  return (
    <label>
      <span className="etiqueta">{etiqueta}</span>
      <input type="number" className="campo" value={Math.round(v * 100) / 100} onChange={(e) => set(Number(e.target.value))} />
    </label>
  )
}
