// Las cuatro aplicaciones se publican en el mismo dominio y comparten los
// datos (localStorage): / (centro de mando), /web/, /crm/ y /portal/.
export type App = 'hub' | 'web' | 'crm' | 'portal'

export function urlApp(app: App, ruta = '') {
  const enRaiz = !/\/(web|crm|portal)\/[^/]*$/.test(location.pathname)
  const base = enRaiz ? './' : '../'
  // Abierto como archivo (versión sin internet): no hay index.html implícito.
  const archivo = location.protocol === 'file:' ? 'index.html' : ''
  return `${base}${app === 'hub' ? '' : `${app}/`}${archivo}${ruta ? `#${ruta}` : ''}`
}
