# SICHAR OS

Plataforma digital para SICHAR, desarrollada por **Pragmos** a partir del informe de
Consultoría Estratégica (Proyecto EA, octubre de 2026). Cada módulo responde a un
hallazgo del informe.

| Módulo | Ruta | Hallazgo |
|---|---|---|
| Vitrina pública (landing, catálogo, simulador 3D, «Dónde comprar», cotización) | `/#/` | 1, 6 |
| Tablero gerencial (KPI del informe, semáforo, metas, tareas) | `/#/app` | todos |
| Canal y Distribuidor Aliado (semáforo, proyectos protegidos, quejas) | `/#/app/canal` | 1 |
| Costos y márgenes (costo puesto en bodega, alzas, TRM, precios por escalones) | `/#/app/costos` | 2 |
| Clientes, visitas y buyer personas | `/#/app/clientes` | 3 |
| CRM (pipeline), cotizador con PDF y WhatsApp | `/#/app/crm`, `/#/app/cotizaciones` | 4 |
| Mesa de Asesoría (tableros de inspiración en 3D) | `/#/app/asesoria` | 5 |
| Contenido y redes (calendario, generador de publicaciones) | `/#/app/contenido` | 6 |
| Automatizaciones (8 reglas, registro, webhook) | `/#/app/automatizaciones` | 1, 2, 4, 5 |
| Portal del distribuidor aliado (referidos, pedidos, proyectos) | `/#/portal` | 1, 4 |
| Modo presentación para la entrega final | `/#/presentacion` | — |

## Uso

```bash
npm install
npm run dev            # desarrollo en http://localhost:5173
npm run build          # sitio estático en dist/ (Vercel, Netlify, GitHub Pages)
npm run build:offline  # un solo HTML en dist-offline/ que abre con doble clic, sin internet
```

Los datos de ejemplo viven en el navegador (`localStorage`). En **Ajustes → Reiniciar demo**
se vuelve al estado inicial. El selector **+1 día / +7 días** de la barra superior adelanta
el tiempo para mostrar las automatizaciones que dependen de plazos.

## Estructura

- `src/data/seed.ts`: datos de demostración (productos, distribuidores, clientes). Se
  reemplazan por los datos reales de SICHAR al implementar.
- `src/lib/automatizaciones.ts`: motor de reglas. Cada ejecución se envía al webhook
  configurado en Ajustes (n8n, Make, Zapier o un backend).
- `src/lib/semaforo.ts`: semáforo de canal (pieza 4 del hallazgo 1).
- `src/components/Ambiente.tsx`: simulador 3D de baño con CSS.

## Hacia producción

1. Backend y base de datos (por ejemplo Supabase) en lugar de `localStorage`, con usuarios
   por rol: gerencia, vendedores, asesora y distribuidores.
2. WhatsApp Business API (plantillas aprobadas por Meta) conectada al webhook.
3. Carga del catálogo real con fotografías, precios y stock por sede.
4. Integración con facturación e inventario.
