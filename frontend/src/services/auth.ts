import { API_BASE_URL } from '../config'

const TOKEN_KEY = 'rm_token'
const USER_KEY = 'rm_user'

export type AuthUser = {
  id_usuario: number
  nombre_completo: string
  correo: string
  rol: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function login(correo: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password })
  })

  const body = await response.json().catch(() => null)

  if (!response.ok || !body?.ok) {
    throw new Error(body?.message || 'No se pudo iniciar sesión')
  }

  const { token, user } = body.data as { token: string; user: AuthUser }
  saveSession(token, user)
  return user
}

export type RegisterPayload = {
  nombre_completo: string
  correo: string
  password: string
  telefono?: string
  rol?: 'cliente' | 'vendedor'
  nombre_tienda?: string
  descripcion_tienda?: string
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const body = await response.json().catch(() => null)

  if (!response.ok || !body?.ok) {
    throw new Error(body?.message || 'No se pudo completar el registro')
  }

  return login(payload.correo, payload.password)
}

export function logout(): void {
  clearSession()
}
