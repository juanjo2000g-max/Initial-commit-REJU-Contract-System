// Datos de demostración. Los productos, distribuidores, clientes y cifras son
// ilustrativos: se reemplazan por los datos reales de SICHAR al implementar.
import { DIA, HORA, SEDES, rng, uid } from '../lib/util'
import type {
  Asesoria,
  Cotizacion,
  Distribuidor,
  Estado,
  Etapa,
  Fuente,
  Lead,
  Pedido,
  Producto,
  ProyectoRegistrado,
  Publicacion,
  Queja,
  Regla,
  Sede,
  Segmento,
  Tarea,
  Vendedor,
  Visita,
} from './types'

export const VERSION = 4

type P = Omit<Producto, 'id' | 'stock' | 'ventasMes'> & { stockBase: number; ventasMes: number }

const PRODUCTOS: P[] = [
  { ref: 'PB-60130-CAL', nombre: 'Porcelanato Brillante Calacatta', linea: 'ceramica', formato: '60x130', acabado: 'Brillante', unidad: 'm²', origen: 'India', costoUSD: 11.6, alternativos: [{ pais: 'China', costoUSD: 10.9, validado: true }, { pais: 'España', costoUSD: 16.8, validado: false }], precioDistribuidor: 94_900, pvpSugerido: 129_900, lineaDirecta: false, insignia: true, stockBase: 2400, textura: 'marmol', color: '#f4f1ec', color2: '#a39a8f', descripcion: 'El producto insignia. Gran formato con veta Calacatta y brillo espejo.', ventasMes: 3100 },
  { ref: 'PB-60130-NER', nombre: 'Porcelanato Brillante Nero Marquina', linea: 'ceramica', formato: '60x130', acabado: 'Brillante', unidad: 'm²', origen: 'India', costoUSD: 12.1, alternativos: [{ pais: 'China', costoUSD: 11.4, validado: true }], precioDistribuidor: 99_900, pvpSugerido: 136_900, lineaDirecta: false, insignia: true, stockBase: 1300, textura: 'marmol', color: '#1d1d1f', color2: '#d9d9d9', descripcion: 'Negro profundo con veta blanca, para baños y salas de alto impacto.', ventasMes: 1200 },
  { ref: 'PB-60130-STA', nombre: 'Porcelanato Brillante Statuario Gold', linea: 'ceramica', formato: '60x130', acabado: 'Brillante', unidad: 'm²', origen: 'India', costoUSD: 12.4, alternativos: [], precioDistribuidor: 102_900, pvpSugerido: 139_900, lineaDirecta: false, insignia: true, stockBase: 900, textura: 'marmol', color: '#f7f3ea', color2: '#c9a45c', descripcion: 'Blanco cálido con veta dorada. El favorito de los arquitectos.', ventasMes: 860 },
  { ref: 'PM-6060-CEM', nombre: 'Porcelanato Mate Cemento Gris', linea: 'ceramica', formato: '60x60', acabado: 'Mate', unidad: 'm²', origen: 'China', costoUSD: 6.2, alternativos: [{ pais: 'India', costoUSD: 6.6, validado: true }, { pais: 'Brasil', costoUSD: 7.4, validado: true }], precioDistribuidor: 52_900, pvpSugerido: 72_900, lineaDirecta: false, stockBase: 5200, textura: 'cemento', color: '#9a9a96', color2: '#7c7c78', descripcion: 'Look industrial, alto tráfico. Ideal para proyectos comerciales.', ventasMes: 4200 },
  { ref: 'PM-20120-ROB', nombre: 'Porcelanato Madera Roble Nórdico', linea: 'ceramica', formato: '20x120', acabado: 'Mate', unidad: 'm²', origen: 'India', costoUSD: 8.9, alternativos: [{ pais: 'Brasil', costoUSD: 9.3, validado: true }], precioDistribuidor: 69_900, pvpSugerido: 95_900, lineaDirecta: false, stockBase: 2800, textura: 'madera', color: '#c9a77c', color2: '#a07e55', descripcion: 'La calidez de la madera con la resistencia del porcelanato.', ventasMes: 1900 },
  { ref: 'PM-20120-NOG', nombre: 'Porcelanato Madera Nogal', linea: 'ceramica', formato: '20x120', acabado: 'Mate', unidad: 'm²', origen: 'India', costoUSD: 9.1, alternativos: [], precioDistribuidor: 71_900, pvpSugerido: 97_900, lineaDirecta: false, stockBase: 1600, textura: 'madera', color: '#7a5236', color2: '#5a3a24', descripcion: 'Tono nogal profundo para espacios sobrios y elegantes.', ventasMes: 950 },
  { ref: 'CP-3060-BLA', nombre: 'Cerámica Pared Blanco Brillo', linea: 'ceramica', formato: '30x60', acabado: 'Brillante', unidad: 'm²', origen: 'Perú', costoUSD: 3.9, alternativos: [{ pais: 'China', costoUSD: 3.6, validado: true }], precioDistribuidor: 31_900, pvpSugerido: 43_900, lineaDirecta: false, stockBase: 7800, textura: 'liso', color: '#fbfbf9', color2: '#e8e8e4', descripcion: 'El básico que nunca falla: muros de baño y cocina.', ventasMes: 6100 },
  { ref: 'PE-6060-TER', nombre: 'Porcelanato Terrazo Veneciano', linea: 'ceramica', formato: '60x60', acabado: 'Satinado', unidad: 'm²', origen: 'España', costoUSD: 14.2, alternativos: [], precioDistribuidor: 112_900, pvpSugerido: 154_900, lineaDirecta: true, stockBase: 600, textura: 'terrazo', color: '#ece6dc', color2: '#b5523b', descripcion: 'Colección de proyecto: terrazo con chips de color. Línea Directa.', ventasMes: 320 },
  { ref: 'PP-6060-PIZ', nombre: 'Porcelanato Piedra Pizarra', linea: 'ceramica', formato: '60x60', acabado: 'Rústico', unidad: 'm²', origen: 'Brasil', costoUSD: 8.1, alternativos: [{ pais: 'China', costoUSD: 7.5, validado: false }], precioDistribuidor: 64_900, pvpSugerido: 88_900, lineaDirecta: false, stockBase: 1900, textura: 'piedra', color: '#5d6166', color2: '#3f4246', descripcion: 'Antideslizante para terrazas, fachadas y zonas húmedas.', ventasMes: 1100 },
  { ref: 'MO-3030-HEX', nombre: 'Mosaico Hexagonal Verde Salvia', linea: 'decorativo', formato: '30x30', acabado: 'Brillante', unidad: 'm²', origen: 'España', costoUSD: 18.5, alternativos: [], precioDistribuidor: 139_900, pvpSugerido: 189_900, lineaDirecta: true, stockBase: 380, textura: 'mosaico', color: '#8fa58f', color2: '#6f876f', descripcion: 'Acento artesanal para duchas y cocinas. Línea Directa.', ventasMes: 140 },
  { ref: 'DE-PAN-3D', nombre: 'Panel Decorativo 3D Ondas', linea: 'decorativo', formato: '50x50', acabado: 'Mate', unidad: 'und', origen: 'China', costoUSD: 4.8, alternativos: [], precioDistribuidor: 38_900, pvpSugerido: 54_900, lineaDirecta: false, stockBase: 2200, textura: 'liso', color: '#efeae2', color2: '#d4ccbf', descripcion: 'Relieve en ondas para muros de acento en salas y recepciones.', ventasMes: 700 },
  { ref: 'DE-LIS-MET', nombre: 'Listelo Metálico Champagne', linea: 'decorativo', formato: '2x60', acabado: 'Metálico', unidad: 'und', origen: 'China', costoUSD: 2.1, alternativos: [], precioDistribuidor: 18_900, pvpSugerido: 26_900, lineaDirecta: false, stockBase: 4100, textura: 'metal', color: '#c8b48a', color2: '#9c8659', descripcion: 'Remate perfecto entre formatos. Acabado champagne.', ventasMes: 1500 },
  { ref: 'BA-GRI-LAV-N', nombre: 'Grifería Lavamanos Monocontrol Negro Mate', linea: 'bano', formato: 'Alta', acabado: 'Negro mate', unidad: 'und', origen: 'China', costoUSD: 28, alternativos: [{ pais: 'India', costoUSD: 31, validado: true }], precioDistribuidor: 219_900, pvpSugerido: 299_900, lineaDirecta: false, stockBase: 640, textura: 'metal', color: '#222222', color2: '#444444', descripcion: 'Diseño minimalista, cartucho cerámico de 35 mm.', ventasMes: 410 },
  { ref: 'BA-GRI-LAV-D', nombre: 'Grifería Lavamanos Monocontrol Oro Cepillado', linea: 'bano', formato: 'Alta', acabado: 'Oro cepillado', unidad: 'und', origen: 'China', costoUSD: 34, alternativos: [], precioDistribuidor: 269_900, pvpSugerido: 369_900, lineaDirecta: true, stockBase: 210, textura: 'metal', color: '#c9a45c', color2: '#9e7c3c', descripcion: 'Colección de proyecto para baños de diseño. Línea Directa.', ventasMes: 90 },
  { ref: 'BA-DUC-30-C', nombre: 'Ducha Lluvia Cuadrada 30 cm Cromo', linea: 'bano', formato: '30x30', acabado: 'Cromo', unidad: 'und', origen: 'China', costoUSD: 22, alternativos: [{ pais: 'India', costoUSD: 23.5, validado: true }], precioDistribuidor: 159_900, pvpSugerido: 219_900, lineaDirecta: false, stockBase: 520, textura: 'metal', color: '#c9ccd1', color2: '#8d9198', descripcion: 'Efecto lluvia, antisarro, incluye brazo de 40 cm.', ventasMes: 380 },
  { ref: 'BA-ACC-KIT-N', nombre: 'Kit Accesorios de Baño 5 piezas Negro', linea: 'bano', formato: 'Kit', acabado: 'Negro mate', unidad: 'und', origen: 'India', costoUSD: 19, alternativos: [{ pais: 'China', costoUSD: 17.2, validado: true }], precioDistribuidor: 139_900, pvpSugerido: 189_900, lineaDirecta: false, stockBase: 800, textura: 'metal', color: '#2a2a2a', color2: '#505050', descripcion: 'Toallero, portarrollo, jabonera, gancho y portacepillos.', ventasMes: 520 },
  { ref: 'BA-LAV-SOB-B', nombre: 'Lavamanos de Sobreponer Ovalado Blanco', linea: 'bano', formato: '50x35', acabado: 'Brillante', unidad: 'und', origen: 'China', costoUSD: 31, alternativos: [], precioDistribuidor: 229_900, pvpSugerido: 314_900, lineaDirecta: false, stockBase: 350, textura: 'liso', color: '#ffffff', color2: '#e7e7e7', descripcion: 'Porcelana sanitaria de alta densidad.', ventasMes: 260 },
  { ref: 'RE-PEG-25', nombre: 'Pegante Porcelanato Gran Formato 25 kg', linea: 'remodelacion', formato: '25 kg', acabado: '—', unidad: 'und', origen: 'Perú', costoUSD: 7.2, alternativos: [], precioDistribuidor: 48_900, pvpSugerido: 64_900, lineaDirecta: false, stockBase: 6000, textura: 'cemento', color: '#bdbab3', color2: '#a29f97', descripcion: 'Adhesivo flexible tipo C2TE para formatos hasta 120x260.', ventasMes: 3800 },
  { ref: 'RE-NIV-KIT', nombre: 'Sistema de Nivelación (200 clips + 100 cuñas)', linea: 'remodelacion', formato: 'Kit', acabado: '—', unidad: 'und', origen: 'China', costoUSD: 5.5, alternativos: [], precioDistribuidor: 42_900, pvpSugerido: 58_900, lineaDirecta: false, stockBase: 1500, textura: 'liso', color: '#e9632b', color2: '#c44f1f', descripcion: 'Indispensable para instalar gran formato sin cejas.', ventasMes: 900 },
  { ref: 'RE-BOQ-EPX', nombre: 'Boquilla Epóxica Gris Perla 2 kg', linea: 'remodelacion', formato: '2 kg', acabado: '—', unidad: 'und', origen: 'España', costoUSD: 9.8, alternativos: [{ pais: 'Brasil', costoUSD: 8.9, validado: true }], precioDistribuidor: 74_900, pvpSugerido: 99_900, lineaDirecta: false, stockBase: 900, textura: 'cemento', color: '#cfcfcb', color2: '#b8b8b3', descripcion: 'Impermeable y antimanchas para duchas y cocinas.', ventasMes: 600 },
]

const NOMBRES_DIST: [string, Sede, string][] = [
  ['Acabados del Valle', 'Cali', 'Ciudad Jardín'],
  ['Ferretería La 14 Sur', 'Cali', 'Valle del Lili'],
  ['Depósito El Ingenio', 'Cali', 'El Ingenio'],
  ['Cerámicas Yumbo', 'Cali', 'Yumbo'],
  ['Pisos y Paredes Antioquia', 'Medellín', 'El Poblado'],
  ['Ferremateriales Envigado', 'Medellín', 'Envigado'],
  ['Acabados Laureles', 'Medellín', 'Laureles'],
  ['Casa del Enchape Bogotá', 'Bogotá', 'Chapinero'],
  ['Depósito Suba Norte', 'Bogotá', 'Suba'],
  ['Ferretería Calle 80', 'Bogotá', 'Engativá'],
  ['Acabados Caribe', 'Barranquilla', 'Alto Prado'],
  ['Ferretería La Costa', 'Barranquilla', 'Soledad'],
  ['Cerámicas Santander', 'Bucaramanga', 'Cabecera'],
  ['Depósito Floridablanca', 'Bucaramanga', 'Floridablanca'],
]

const COORDS: Record<Sede, [number, number]> = {
  Cali: [3.4516, -76.532],
  Medellín: [6.2442, -75.5812],
  Bogotá: [4.711, -74.0721],
  Barranquilla: [10.9685, -74.7813],
  Bucaramanga: [7.1193, -73.1227],
}

const VENDEDORES: Vendedor[] = [
  { id: 'v1', nombre: 'Laura Mejía', sede: 'Cali', rol: 'Coordinadora de sede', avatar: '#F47920' },
  { id: 'v2', nombre: 'Andrés Cardona', sede: 'Cali', rol: 'Asesor comercial', avatar: '#2E5E8C' },
  { id: 'v3', nombre: 'Camilo Restrepo', sede: 'Medellín', rol: 'Coordinador de sede', avatar: '#2E8B57' },
  { id: 'v4', nombre: 'Natalia Rojas', sede: 'Bogotá', rol: 'Coordinadora de sede', avatar: '#8E44AD' },
  { id: 'v5', nombre: 'Jorge Barrios', sede: 'Barranquilla', rol: 'Coordinador de sede', avatar: '#C0392B' },
  { id: 'v6', nombre: 'Paola Duarte', sede: 'Bucaramanga', rol: 'Coordinadora de sede', avatar: '#D68910' },
  { id: 'a1', nombre: 'Valentina Ospina', sede: 'Cali', rol: 'Asesora de diseño · Mesa de Asesoría', avatar: '#16A085' },
]

const PERSONAS = ['Carolina Gómez', 'Felipe Arango', 'Juliana Vélez', 'Santiago Mora', 'Daniela Ríos', 'Mauricio Lozano', 'Ana María Torres', 'Ricardo Peña', 'Manuela Henao', 'Sebastián Castro', 'Luisa Fernanda Díaz', 'Hernán Quintero', 'Sofía Cárdenas', 'Esteban Salazar', 'Mónica Zuluaga', 'David Ocampo', 'Isabel Montoya', 'Germán Pardo', 'Tatiana Muñoz', 'Óscar Villegas', 'Lina Marcela Ruiz', 'Diego Hurtado', 'Paula Andrea León', 'Camila Franco', 'Jaime Escobar', 'Natalia Giraldo', 'Andrés Pineda', 'Verónica Aguirre']
const CONSTRUCTORAS = ['Constructora Bambú', 'Grupo Inmobiliario Altos', 'Urbanizadora Pacífico', 'Edificar SAS', 'Proyectos Montaña', 'Vértice Construcciones']
const ESTUDIOS = ['Estudio Lineal Arquitectos', 'Taller Ocre', 'Atelier Norte', 'Forma & Espacio', 'Casa Blanca Interiorismo']
const INTERESES = ['Remodelación de baño principal', 'Piso de apartamento 85 m²', 'Cocina abierta y zona social', 'Proyecto de vivienda VIS 120 unidades', 'Lobby y zonas comunes', 'Baños de oficina corporativa', 'Fachada y terraza', 'Hotel boutique 18 habitaciones', 'Casa campestre', 'Local comercial']

export function crearSeed(ahora = Date.now()): Estado {
  const r = rng(20261027)
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]
  const entre = (a: number, b: number) => Math.round(a + r() * (b - a))

  const productos: Producto[] = PRODUCTOS.map((p, i) => {
    const { stockBase, ...rest } = p
    const stock = Object.fromEntries(
      SEDES.map((s, j) => [s, Math.round(stockBase * (j === 0 ? 0.32 : [0, 0.22, 0.24, 0.12, 0.1][j]) * (0.7 + r() * 0.6))]),
    ) as Record<Sede, number>
    // dos referencias top con stock crítico en una sede, para la automatización
    if (i === 1) stock['Medellín'] = 40
    if (i === 4) stock['Bogotá'] = 35
    return { ...rest, id: `p${i + 1}`, stock }
  })

  const distribuidores: Distribuidor[] = NOMBRES_DIST.map(([nombre, ciudad, barrio], i) => {
    const base = entre(18, 140) * 1_000_000
    const tend = i === 6 ? -0.01 : i === 11 ? 0 : 0.03 + r() * 0.05
    const ventas6m = Array.from({ length: 6 }, (_, k) => Math.round(base * (1 + tend * k) * (0.9 + r() * 0.2)))
    const nivel = base > 90_000_000 ? 'Oro' : base > 45_000_000 ? 'Plata' : 'Bronce'
    const [lat, lng] = COORDS[ciudad]
    return {
      id: `d${i + 1}`,
      nombre,
      ciudad,
      barrio,
      contacto: pick(PERSONAS),
      telefono: `31${entre(0, 9)}${entre(1000000, 9999999)}`,
      nivel,
      aliado: i !== 3 && i !== 9,
      ventas6m,
      ultimoPedido: ahora - (i === 6 ? 38 : i === 11 ? 26 : entre(1, 14)) * DIA,
      quejas: i === 6 ? 2 : i === 11 ? 1 : 0,
      referidosRecibidos: entre(3, 22),
      referidosConvertidos: 0,
      lat: lat + (r() - 0.5) * 0.08,
      lng: lng + (r() - 0.5) * 0.08,
    }
  })
  distribuidores.forEach((d) => (d.referidosConvertidos = Math.round(d.referidosRecibidos * (0.25 + r() * 0.3))))

  const etapas: Etapa[] = ['nuevo', 'nuevo', 'contactado', 'contactado', 'cotizado', 'cotizado', 'negociacion', 'ganado', 'ganado', 'perdido']
  const fuentes: Fuente[] = ['web', 'whatsapp', 'visita', 'referido', 'redes', 'feria']
  const leads: Lead[] = PERSONAS.map((nombre, i) => {
    const segmento: Segmento = i % 7 === 0 ? 'constructora' : i % 4 === 0 ? 'arquitecto' : i % 9 === 0 ? 'distribuidor' : 'hogar'
    const ciudad = SEDES[i % 5]
    const etapa = etapas[i % etapas.length]
    const creado = etapa === 'nuevo' ? ahora - entre(3, 40) * HORA : ahora - entre(1, 40) * DIA - entre(0, 20) * HORA
    const m2 = segmento === 'constructora' ? entre(900, 6000) : segmento === 'arquitecto' ? entre(60, 400) : entre(12, 110)
    const valor = Math.round((m2 * entre(60_000, 110_000)) / 100_000) * 100_000
    const vend = VENDEDORES.find((v) => v.sede === ciudad)!
    const dist = distribuidores.filter((d) => d.ciudad === ciudad && d.aliado)
    const asignado: Pick<Lead, 'asignadoTipo' | 'asignadoId'> =
      segmento === 'hogar'
        ? { asignadoTipo: 'distribuidor', asignadoId: pick(dist).id }
        : segmento === 'arquitecto'
          ? { asignadoTipo: 'asesor', asignadoId: 'a1' }
          : { asignadoTipo: 'vendedor', asignadoId: vend.id }
    const empresa = segmento === 'constructora' ? pick(CONSTRUCTORAS) : segmento === 'arquitecto' ? pick(ESTUDIOS) : segmento === 'distribuidor' ? `Ferretería ${nombre.split(' ')[1]}` : undefined
    const lead: Lead = {
      id: `l${i + 1}`,
      nombre,
      empresa,
      telefono: `30${entre(0, 9)}${entre(1000000, 9999999)}`,
      email: `${nombre.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}@correo.com`,
      segmento,
      ciudad,
      fuente: segmento === 'hogar' ? pick(['web', 'whatsapp', 'redes'] as Fuente[]) : pick(fuentes),
      etapa,
      valor,
      interes: segmento === 'constructora' ? pick(INTERESES.slice(3, 8)) : pick(INTERESES),
      ...asignado,
      m2,
      creado,
      actualizado: creado + entre(1, 72) * HORA,
      primeraRespuesta: etapa === 'nuevo' ? undefined : creado + entre(1, 30) * HORA,
      actividades: [
        { id: uid('a'), fecha: creado, tipo: 'sistema', texto: 'Lead creado', autor: 'Sistema' },
      ],
      etiquetas: m2 > 1500 ? ['Gran proyecto'] : [],
    }
    if (etapa !== 'nuevo')
      lead.actividades.push({ id: uid('a'), fecha: lead.primeraRespuesta!, tipo: 'whatsapp', texto: 'Primer contacto por WhatsApp. Envía planos y fotos.', autor: vend.nombre })
    return lead
  })

  const cotizaciones: Cotizacion[] = leads
    .filter((l) => ['cotizado', 'negociacion', 'ganado', 'perdido'].includes(l.etapa))
    .map((l, i) => {
      const prods = [productos[i % 6], productos[17], productos[18]]
      const enviada = l.creado + 30 * HORA
      return {
        id: `q${i + 1}`,
        numero: `COT-2026-${String(410 + i).padStart(4, '0')}`,
        leadId: l.id,
        items: prods.map((p, k) => ({
          productoId: p.id,
          cantidad: k === 0 ? (l.m2 ?? 40) : Math.ceil((l.m2 ?? 40) / (k === 1 ? 4 : 30)),
          precio: l.segmento === 'hogar' ? p.pvpSugerido : p.precioDistribuidor,
          descuento: l.segmento === 'constructora' ? 0.06 : 0,
        })),
        canal: l.segmento === 'hogar' ? 'distribuidor' : 'directa',
        estado: l.etapa === 'ganado' ? 'aceptada' : l.etapa === 'perdido' ? 'rechazada' : 'enviada',
        creada: enviada - 2 * HORA,
        enviada,
        validezDias: 15,
        notas: '',
        vendedorId: VENDEDORES.find((v) => v.sede === l.ciudad)!.id,
      }
    })

  const visitas: Visita[] = Array.from({ length: 14 }, (_, i) => {
    const l = leads[(i * 3) % leads.length]
    return {
      id: `vi${i + 1}`,
      fecha: ahora - entre(0, 28) * DIA,
      vendedorId: VENDEDORES[i % 6].id,
      leadId: l.id,
      segmento: l.segmento,
      quienDecide: pick(['Gerente de compras', 'Arquitecta del proyecto', 'Propietario', 'Residente de obra']),
      queNecesita: pick(['Entrega rápida y precio estable', 'Muestras físicas y fichas técnicas', 'Cumplimiento en obra por etapas', 'Variedad de diseño y asesoría']),
      queLoFrena: pick(['Faltantes en referencias top', 'Tiempos de cotización', 'No conoce el portafolio completo', 'Precio vs. competencia']),
      dondeSeInforma: pick(['Instagram y Pinterest', 'Ferias y showrooms', 'Recomendación de colegas', 'Visita del vendedor']),
      proximoPaso: pick(['Enviar cotización', 'Llevar kit de muestras', 'Agendar asesoría de diseño', 'Visita a obra']),
    }
  })

  const proyectos: ProyectoRegistrado[] = [
    { id: 'pr1', distribuidorId: 'd1', constructora: 'Constructora Bambú', obra: 'Torres de Pance — Etapa 2', ciudad: 'Cali', m2: 4200, registrado: ahora - 40 * DIA, vence: ahora + 140 * DIA, estado: 'protegido' },
    { id: 'pr2', distribuidorId: 'd5', constructora: 'Proyectos Montaña', obra: 'Mirador de Las Palmas', ciudad: 'Medellín', m2: 2800, registrado: ahora - 12 * DIA, vence: ahora + 168 * DIA, estado: 'protegido' },
    { id: 'pr3', distribuidorId: 'd8', constructora: 'Edificar SAS', obra: 'Usaquén 127 Oficinas', ciudad: 'Bogotá', m2: 1900, registrado: ahora - 200 * DIA, vence: ahora - 20 * DIA, estado: 'vencido' },
    { id: 'pr4', distribuidorId: 'd11', constructora: 'Urbanizadora Pacífico', obra: 'Brisas del Mar', ciudad: 'Barranquilla', m2: 3600, registrado: ahora - 5 * DIA, vence: ahora + 175 * DIA, estado: 'protegido' },
  ]

  const pedidos: Pedido[] = Array.from({ length: 22 }, (_, i) => {
    const d = distribuidores[i % distribuidores.length]
    const items = [{ productoId: productos[i % 8].id, cantidad: entre(40, 400) }, { productoId: productos[17].id, cantidad: entre(20, 120) }]
    const total = items.reduce((a, it) => a + it.cantidad * productos.find((p) => p.id === it.productoId)!.precioDistribuidor, 0)
    const fecha = i < distribuidores.length ? d.ultimoPedido : ahora - entre(15, 60) * DIA
    return {
      id: `pe${i + 1}`,
      distribuidorId: d.id,
      fecha,
      items,
      total,
      estado: ahora - fecha > 6 * DIA ? 'entregado' : ahora - fecha > 3 * DIA ? 'despachado' : 'alistamiento',
      canal: i % 3 === 0 ? 'portal' : i % 3 === 1 ? 'whatsapp' : 'vendedor',
    }
  })

  const asesorias: Asesoria[] = [
    { id: 'as1', leadId: 'l5', nombre: 'Daniela Ríos', tipo: 'asesoria-30', ciudad: 'Cali', fecha: ahora + 1 * DIA + 3 * HORA, estado: 'agendada', asesorId: 'a1', notas: 'Baño principal, quiere tonos cálidos con negro.', ambiente: { piso: 'p5', pared: 'p1', acento: 'p10', griferia: 'negro' } },
    { id: 'as2', leadId: 'l9', nombre: 'Sebastián Castro', tipo: 'kit-muestras', ciudad: 'Cali', fecha: ahora - 2 * DIA, estado: 'realizada', asesorId: 'a1', notas: 'Kit enviado al estudio: Calacatta, Statuario y Terrazo.' },
    { id: 'as3', nombre: 'Taller Ocre', tipo: 'moodboard', ciudad: 'Cali', fecha: ahora - 9 * DIA, estado: 'convertida', asesorId: 'a1', notas: 'Hotel boutique. Moodboard aprobado, pasa a cotización.', ambiente: { piso: 'p3', pared: 'p8', acento: 'p12', griferia: 'dorado' } },
    { id: 'as4', leadId: 'l15', nombre: 'Esteban Salazar', tipo: 'cotizacion-48h', ciudad: 'Cali', fecha: ahora - 1 * DIA, estado: 'solicitada', notas: 'Planos de cocina adjuntos por WhatsApp.' },
  ]

  const semana = (d: number) => ahora + d * DIA
  const publicaciones: Publicacion[] = [
    { id: 'pu1', fecha: semana(-6), plataforma: 'Instagram', pilar: 'Proyectos reales', titulo: 'Antes y después: baño en Ciudad Jardín', copy: 'De baño de los 90 a spa en casa ✨ Porcelanato Calacatta 60x130 + grifería negro mate. Instalado por nuestro aliado Acabados del Valle.', cta: 'Cotiza tu proyecto', estado: 'publicada', alcance: 8400, interacciones: 612 },
    { id: 'pu2', fecha: semana(-4), plataforma: 'Pinterest', pilar: 'Guía de acabados', titulo: 'Tablero: baños negro + mármol', copy: '12 combinaciones de mármol blanco con grifería negra para baños pequeños.', cta: 'Descarga el catálogo', estado: 'publicada', alcance: 5100, interacciones: 380 },
    { id: 'pu3', fecha: semana(-2), plataforma: 'LinkedIn', pilar: 'Confianza y aliados', titulo: 'Llegaron 6 contenedores a Cali', copy: 'Inventario listo para obra: 18.000 m² de porcelanato gran formato. Cumplimiento por etapas para constructoras.', cta: 'Hablar con un asesor', estado: 'publicada', alcance: 2900, interacciones: 154 },
    { id: 'pu4', fecha: semana(0), plataforma: 'Instagram', pilar: 'Producto insignia', titulo: 'Reel: 60x130 en 4 espacios', copy: 'Un solo porcelanato, cuatro ambientes. ¿Cuál es tu favorito? 1, 2, 3 o 4 👇', cta: 'Dónde comprar', estado: 'programada' },
    { id: 'pu5', fecha: semana(2), plataforma: 'Instagram', pilar: 'Guía de acabados', titulo: 'Cómo elegir boquilla para gran formato', copy: '3 errores que arruinan un piso de gran formato (y cómo evitarlos).', cta: 'Descarga el catálogo', estado: 'en diseño' },
    { id: 'pu6', fecha: semana(4), plataforma: 'Instagram', pilar: 'Proyectos reales', titulo: 'Hotel boutique con Taller Ocre', copy: 'Terrazo veneciano + oro cepillado: así quedó el lobby.', cta: 'Cotiza tu proyecto', estado: 'idea' },
    { id: 'pu7', fecha: semana(5), plataforma: 'WhatsApp', pilar: 'Confianza y aliados', titulo: 'Catálogo de temporada a distribuidores', copy: 'Nuevas referencias y lista de precios por escalones.', cta: 'Conoce a nuestros aliados', estado: 'idea' },
  ]

  const quejas: Queja[] = [
    { id: 'qj1', distribuidorId: 'd7', fecha: ahora - 20 * DIA, tipo: 'cliente tomado', critica: true, resuelta: false, texto: 'Un vendedor de SICHAR le cotizó directo a una obra que ellos atendían.' },
    { id: 'qj2', distribuidorId: 'd7', fecha: ahora - 9 * DIA, tipo: 'despacho', critica: false, resuelta: false, texto: 'Pedido llegó incompleto (faltó pegante).' },
    { id: 'qj3', distribuidorId: 'd12', fecha: ahora - 14 * DIA, tipo: 'precio', critica: false, resuelta: true, texto: 'Pregunta por el alza de precios en referencias de India.' },
  ]

  const tareas: Tarea[] = [
    { id: 't1', titulo: 'Llamar a Acabados Laureles', detalle: '38 días sin pedido y queja crítica abierta. Visita de recuperación.', vence: ahora + DIA, responsable: 'v3', hecha: false, origen: 'Semáforo de canal', prioridad: 'alta' },
    { id: 't2', titulo: 'Validar muestras de China para Calacatta', detalle: 'Proveedor alterno cotizó USD 10,90/m². Revisar calidad y brillo.', vence: ahora + 5 * DIA, responsable: 'Compras', hecha: false, origen: 'Plan de costos', prioridad: 'media' },
  ]

  const reglas: Regla[] = [
    { id: 'r1', nombre: 'Referido automático al distribuidor aliado', disparador: 'Llega una solicitud de un cliente final desde la web o redes', acciones: ['Asigna al distribuidor aliado de la ciudad (por nivel y carga)', 'Envía WhatsApp al distribuidor con los datos', 'Confirma al cliente quién lo atenderá', 'Suma el referido al portal del distribuidor'], hallazgo: 1, activa: true, ejecuciones: 0 },
    { id: 'r2', nombre: 'Protección de proyectos registrados', disparador: 'Entra una constructora o proyecto grande', acciones: ['Busca si un distribuidor ya registró la obra', 'Si está registrada: se asigna al distribuidor, no se vende directo', 'Si no: se asigna al coordinador de sede'], hallazgo: 1, activa: true, ejecuciones: 0 },
    { id: 'r3', nombre: 'Arquitectos a la Mesa de Asesoría', disparador: 'Entra un arquitecto, diseñador o estudio', acciones: ['Asigna a la asesora de diseño', 'Ofrece kit de muestras', 'Agenda asesoría de 30 minutos'], hallazgo: 5, activa: true, ejecuciones: 0 },
    { id: 'r4', nombre: 'Cotización en menos de 48 horas', disparador: 'Un lead lleva más de 24 h sin respuesta o una cotización 48 h sin seguimiento', acciones: ['Crea tarea de seguimiento al responsable', 'Notifica al coordinador de sede'], hallazgo: 4, activa: true, ejecuciones: 0 },
    { id: 'r5', nombre: 'Semáforo de canal', disparador: 'Un distribuidor clave pasa 21 días sin pedido, cae en ventas o registra una queja crítica', acciones: ['Marca el distribuidor en amarillo o rojo', 'Crea visita de recuperación', 'Alerta a la gerencia'], hallazgo: 1, activa: true, ejecuciones: 0 },
    { id: 'r6', nombre: 'Alerta de inventario en referencias top', disparador: 'Una referencia top baja de 15 días de inventario en una sede', acciones: ['Alerta a Compras', 'Sugiere traslado entre sedes'], hallazgo: 2, activa: true, ejecuciones: 0 },
    { id: 'r7', nombre: 'Guardia de política de precios', disparador: 'Una cotización directa queda por debajo del PVP sugerido', acciones: ['Bloquea el envío', 'Pide aprobación de gerencia'], hallazgo: 1, activa: true, ejecuciones: 0 },
    { id: 'r8', nombre: 'Cotización aceptada → pedido y encuesta', disparador: 'El cliente acepta una cotización', acciones: ['Mueve el lead a Ganado', 'Crea el pedido', 'Programa encuesta de satisfacción a 15 días'], hallazgo: 4, activa: true, ejecuciones: 0 },
  ]

  return {
    version: VERSION,
    desfaseDias: 0,
    productos,
    leads,
    distribuidores,
    vendedores: VENDEDORES,
    cotizaciones,
    visitas,
    proyectos,
    pedidos,
    asesorias,
    publicaciones,
    quejas,
    tareas,
    eventos: [],
    reglas,
    notificaciones: [],
    config: {
      trm: 4_150,
      arancel: 0.1,
      nacionalizacion: 0.04,
      almacenamiento: 0.02,
      flete: { India: 0.22, China: 0.18, Brasil: 0.12, España: 0.16, Perú: 0.07 },
      margenObjetivo: 0.33,
      webhookUrl: '',
      umbralProyectoM2: 500,
      whatsappSichar: '3001234567',
    },
  }
}
