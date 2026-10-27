export type Sede = 'Cali' | 'Medellín' | 'Bogotá' | 'Barranquilla' | 'Bucaramanga'
export type Pais = 'India' | 'China' | 'Brasil' | 'España' | 'Perú'
export type Linea = 'ceramica' | 'bano' | 'decorativo' | 'remodelacion'
export type Textura = 'marmol' | 'madera' | 'cemento' | 'terrazo' | 'liso' | 'piedra' | 'metal' | 'mosaico'

export interface Producto {
  id: string
  ref: string
  nombre: string
  linea: Linea
  formato: string
  acabado: string
  unidad: 'm²' | 'und'
  origen: Pais
  costoUSD: number
  /** Cotizaciones de proveedores alternativos (costo en origen, USD). */
  alternativos: { pais: Pais; costoUSD: number; validado: boolean }[]
  precioDistribuidor: number
  pvpSugerido: number
  /** Solo se vende directo si es de la Línea Directa (política de canal). */
  lineaDirecta: boolean
  insignia?: boolean
  stock: Record<Sede, number>
  textura: Textura
  color: string
  color2: string
  descripcion: string
  ventasMes: number
}

export type Segmento = 'hogar' | 'arquitecto' | 'constructora' | 'distribuidor'
export type Fuente = 'web' | 'whatsapp' | 'visita' | 'referido' | 'redes' | 'feria'
export type Etapa = 'nuevo' | 'contactado' | 'cotizado' | 'negociacion' | 'ganado' | 'perdido'

export interface Actividad {
  id: string
  fecha: number
  tipo: 'nota' | 'llamada' | 'whatsapp' | 'visita' | 'email' | 'sistema' | 'cotizacion' | 'automatizacion'
  texto: string
  autor: string
}

export interface Lead {
  id: string
  nombre: string
  empresa?: string
  telefono: string
  email?: string
  segmento: Segmento
  ciudad: Sede
  fuente: Fuente
  etapa: Etapa
  valor: number
  interes: string
  /** Vendedor de SICHAR o distribuidor aliado responsable. */
  asignadoTipo: 'vendedor' | 'distribuidor' | 'asesor' | 'sin asignar'
  asignadoId?: string
  m2?: number
  creado: number
  actualizado: number
  primeraRespuesta?: number
  actividades: Actividad[]
  etiquetas: string[]
}

export interface Distribuidor {
  id: string
  nombre: string
  ciudad: Sede
  barrio: string
  contacto: string
  telefono: string
  nivel: 'Oro' | 'Plata' | 'Bronce'
  aliado: boolean
  ventas6m: number[]
  ultimoPedido: number
  quejas: number
  referidosRecibidos: number
  referidosConvertidos: number
  lat: number
  lng: number
}

export interface Vendedor {
  id: string
  nombre: string
  sede: Sede
  rol: string
  avatar: string
}

export interface ItemCotizacion {
  productoId: string
  cantidad: number
  precio: number
  descuento: number
}

export interface Cotizacion {
  id: string
  numero: string
  leadId: string
  items: ItemCotizacion[]
  canal: 'distribuidor' | 'directa'
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada'
  creada: number
  enviada?: number
  validezDias: number
  notas: string
  vendedorId: string
}

export interface Visita {
  id: string
  fecha: number
  vendedorId: string
  leadId?: string
  distribuidorId?: string
  segmento: Segmento
  quienDecide: string
  queNecesita: string
  queLoFrena: string
  dondeSeInforma: string
  proximoPaso: string
}

export interface ProyectoRegistrado {
  id: string
  distribuidorId: string
  constructora: string
  obra: string
  ciudad: Sede
  m2: number
  registrado: number
  vence: number
  estado: 'protegido' | 'vencido' | 'cerrado'
}

export interface Pedido {
  id: string
  distribuidorId: string
  fecha: number
  items: { productoId: string; cantidad: number }[]
  total: number
  estado: 'recibido' | 'alistamiento' | 'despachado' | 'entregado'
  canal: 'portal' | 'vendedor' | 'whatsapp'
}

export interface Asesoria {
  id: string
  leadId?: string
  nombre: string
  tipo: 'kit-muestras' | 'cotizacion-48h' | 'asesoria-30' | 'moodboard'
  ciudad: Sede
  fecha: number
  estado: 'solicitada' | 'agendada' | 'realizada' | 'convertida'
  asesorId?: string
  notas: string
  ambiente?: Ambiente
}

export interface Ambiente {
  piso: string
  pared: string
  acento: string
  griferia: 'cromo' | 'negro' | 'dorado'
}

export interface Publicacion {
  id: string
  fecha: number
  plataforma: 'Instagram' | 'Pinterest' | 'LinkedIn' | 'WhatsApp'
  pilar: 'Proyectos reales' | 'Guía de acabados' | 'Producto insignia' | 'Confianza y aliados'
  titulo: string
  copy: string
  cta: string
  estado: 'idea' | 'en diseño' | 'programada' | 'publicada'
  alcance?: number
  interacciones?: number
}

export interface Queja {
  id: string
  distribuidorId: string
  fecha: number
  tipo: 'precio' | 'cliente tomado' | 'despacho' | 'calidad'
  critica: boolean
  resuelta: boolean
  texto: string
}

export interface Tarea {
  id: string
  titulo: string
  detalle: string
  vence: number
  responsable: string
  hecha: boolean
  origen: string
  leadId?: string
  prioridad: 'alta' | 'media' | 'baja'
}

export interface EventoAutomatizacion {
  id: string
  fecha: number
  reglaId: string
  titulo: string
  detalle: string
  acciones: string[]
  webhook?: 'enviado' | 'error' | 'omitido'
}

export interface Regla {
  id: string
  nombre: string
  disparador: string
  acciones: string[]
  hallazgo: number
  activa: boolean
  ejecuciones: number
}

export interface Config {
  trm: number
  arancel: number
  nacionalizacion: number
  almacenamiento: number
  flete: Record<Pais, number>
  margenObjetivo: number
  webhookUrl: string
  umbralProyectoM2: number
  whatsappSichar: string
}

export interface Notificacion {
  id: string
  fecha: number
  texto: string
  tipo: 'info' | 'exito' | 'alerta'
  leida: boolean
  enlace?: string
}

export interface Estado {
  version: number
  /** Días simulados que han pasado (para mostrar automatizaciones por tiempo). */
  desfaseDias: number
  productos: Producto[]
  leads: Lead[]
  distribuidores: Distribuidor[]
  vendedores: Vendedor[]
  cotizaciones: Cotizacion[]
  visitas: Visita[]
  proyectos: ProyectoRegistrado[]
  pedidos: Pedido[]
  asesorias: Asesoria[]
  publicaciones: Publicacion[]
  quejas: Queja[]
  tareas: Tarea[]
  eventos: EventoAutomatizacion[]
  reglas: Regla[]
  config: Config
  notificaciones: Notificacion[]
}
