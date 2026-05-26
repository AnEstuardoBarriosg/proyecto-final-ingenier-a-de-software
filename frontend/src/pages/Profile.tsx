import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated, getUser } from '../services/auth'

type Profile = {
  id_usuario: number
  nombre_completo: string
  correo: string
  telefono?: string
  rol: string
  fecha_registro?: string
  estado?: string
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  } catch {
    return iso
  }
}

const ROL_LABELS: Record<string, string> = {
  cliente:   'Cliente',
  vendedor:  'Vendedor',
  admin:     'Administrador',
}

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/profile' } })
      return
    }
    api.get<{ ok: boolean; data?: Profile; user?: Profile }>('/user/profile')
      .then(res => {
        // El JWT solo guarda id_usuario/correo/rol, sin nombre_completo.
        // Fusionamos con los datos del localStorage que sí lo tienen.
        const fromApi = res.data ?? res.user ?? {}
        const local = getUser()
        setProfile({ ...(local as Profile), ...fromApi } as Profile)
        setError(null)
      })
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          navigate('/login', { replace: true })
          return
        }
        // Fallback: usar datos del localStorage si el endpoint falla
        const local = getUser()
        if (local) {
          setProfile(local as Profile)
          setError(null)
        } else {
          setError(err.message || 'No se pudo cargar el perfil')
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-lg mx-auto p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="font-semibold mb-1">No se pudo cargar el perfil</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  const initials = (profile.nombre_completo ?? profile.correo ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const rolLabel = ROL_LABELS[profile.rol?.toLowerCase()] ?? profile.rol

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mi perfil</h1>

      {/* Avatar y datos principales */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.nombre_completo}</h2>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {rolLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Información detallada */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Información de cuenta</h3>
        <dl className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <dt className="text-sm text-gray-500">Correo electrónico</dt>
            <dd className="text-sm font-medium text-gray-800">{profile.correo}</dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <dt className="text-sm text-gray-500">Teléfono</dt>
            <dd className="text-sm font-medium text-gray-800">{profile.telefono || '—'}</dd>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <dt className="text-sm text-gray-500">Rol</dt>
            <dd className="text-sm font-medium text-gray-800">{rolLabel}</dd>
          </div>
          {profile.fecha_registro && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <dt className="text-sm text-gray-500">Miembro desde</dt>
              <dd className="text-sm font-medium text-gray-800">{formatDate(profile.fecha_registro)}</dd>
            </div>
          )}
          {profile.estado && (
            <div className="flex justify-between items-center py-2">
              <dt className="text-sm text-gray-500">Estado de cuenta</dt>
              <dd>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  profile.estado === 'activo'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {profile.estado}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Accesos rápidos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/orders"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-sm">Mis pedidos</p>
              <p className="text-xs text-gray-500">Ver historial de compras</p>
            </div>
          </Link>
          <Link
            to="/notifications"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-medium text-sm">Notificaciones</p>
              <p className="text-xs text-gray-500">Ver mis alertas</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Profile
