# Entrega final · Proyecto EA · SICHAR

| Archivo | Qué es |
|---|---|
| `demo/index.html` | **Centro de mando.** Doble clic para abrir en Chrome; desde ahí se abre cada pieza. Funciona sin internet (con internet, el mapa muestra calles). |
| `demo/web/index.html` | Sitio web de SICHAR. |
| `demo/crm/index.html` | SICHAR OS: CRM, cotizador, costos, canal y automatizaciones. |
| `demo/portal/index.html` | Portal del distribuidor aliado. |
| `GUION_DEMO.md` | Guion de la presentación a los dueños. |
| `propuesta/Propuesta_Pragmos_SICHAR_OS.pdf` | Propuesta comercial de Pragmos (precios por definir). |
| `CORREO_GERENCIA.md` | Invitación a la entrega y correo para enviar la propuesta. |

Descarga la carpeta `demo/` completa: las cuatro apps se enlazan entre sí y comparten los datos.

Para regenerarla: `cd sichar-os && npm install && npm run build:offline` y copia `dist-offline/` como `demo/`.
