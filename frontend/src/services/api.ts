import { getToken, clearSession } from './auth'
import { API_BASE_URL } from '../config'
const timeoutMs = 10000

async function request<T = any>(path: string, options: RequestInit = {}) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  const token = getToken()
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...(options.headers || {})
      },
      signal: controller.signal
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null
    console.log(`✓ ${options.method ?? 'GET'} ${path}`, response.status)

    if (response.status === 401) {
      clearSession()
    }

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`)
      ;(error as any).status = response.status
      ;(error as any).data = data
      throw error
    }

    return data as T
  } catch (error) {
    console.error(`✗ ${options.method ?? 'GET'} ${path}`, (error as Error).message)
    throw error
  } finally {
    clearTimeout(timer)
  }
}

const api = {
  get: <T = any>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = any>(path: string, body?: any) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(path: string, body?: any) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = any>(path: string, body?: any) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' })
}

export default api
