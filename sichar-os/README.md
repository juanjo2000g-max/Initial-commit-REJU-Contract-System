# SICHAR Digital

Transformación digital de SICHAR, desarrollada por **Pragmos** a partir del informe de
Consultoría Estratégica (Proyecto EA, octubre de 2026). Son cuatro aplicaciones
independientes que comparten datos y se publican en el mismo dominio:

| App | Ruta | Para quién | Qué hace |
|---|---|---|---|
| **Centro de mando** | `/` | Presentación | Abre cada pieza desde un solo punto, con vistas previas en vivo y modo presentación. |
| **Sitio web** | `/web/` | Clientes, arquitectos, constructoras | Inicio cinematográfico con baño 3D en vivo, colecciones y ficha de producto, simulador 3D (WebGL) de baño, cocina y sala, test de estilo, mapa de aliados, globo con las rutas de importación y cotización conectada al CRM. |
| **SICHAR OS** | `/crm/` | Equipo SICHAR y gerencia | Tablero gerencial, pipeline, cotizador con política de canal, costos de importación, semáforo de aliados, Mesa de Asesoría, contenido y 8 automatizaciones. |
| **Portal Aliado** | `/portal/` | Distribuidores | Referidos de la web, pedidos 24/7 y registro de obras protegidas. |

## Uso

```bash
npm install
npm run dev            # http://localhost:5173/  (y /web/, /crm/, /portal/)
npm run build          # sitio estático en dist/ (Vercel, Netlify, GitHub Pages)
npm run build:offline  # dist-offline/: cada app en un solo HTML, funciona sin internet
```

Los datos de ejemplo viven en el navegador (`localStorage`) y los comparten las cuatro apps:
un lead que entra por el sitio web aparece en el CRM y en el portal del distribuidor.
Se reinician desde el centro de mando o en **SICHAR OS → Ajustes**.

## Estructura

- `src/web/`: sitio web. `3d/Escena3D.tsx` es el simulador WebGL (three.js); las texturas se
  generan desde `src/components/Textura.tsx`, así que no depende de fotos.
- `src/crm/`: SICHAR OS. `src/portal/`: portal de aliados. `src/hub/`: centro de mando y presentación.
- `src/data/seed.ts`: datos de demostración, a reemplazar por los reales.
- `src/lib/automatizaciones.ts`: motor de reglas; cada ejecución se envía al webhook de Ajustes.
- `src/lib/apps.ts`: enlaces entre apps (servidor o archivo local).

## Hacia producción

1. Backend y base de datos (por ejemplo Supabase) con usuarios por rol.
2. WhatsApp Business API conectada al webhook.
3. Catálogo real con fotografías, fichas técnicas y stock por sede.
4. Dominio propio y analítica.
