/**
 * URL base del backend.
 * En desarrollo local: define VITE_API_URL en frontend/.env
 * En staging/producción: define VITE_API_URL en las variables de entorno del servidor de despliegue
 *
 * Ejemplo:
 *   VITE_API_URL=https://api.raicesmarket.com
 *   VITE_API_URL=http://staging.raicesmarket.com:3000
 */
if (!import.meta.env.VITE_API_URL) {
  console.warn(
    '[config] VITE_API_URL no está definida — usando http://localhost:3000 como fallback. ' +
    'Define esta variable en frontend/.env para evitar este mensaje.'
  )
}

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
