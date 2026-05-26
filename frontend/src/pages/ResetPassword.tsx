import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [correo, setCorreo] = useState(searchParams.get('correo') || '')
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (nuevaPassword !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/password/reset-password', {
        correo,
        token,
        nueva_password: nuevaPassword
      })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (err) {
      setError((err as Error).message || 'No se pudo restablecer la contraseña')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white border rounded-xl shadow-md p-6 text-center">
          <span className="text-5xl">✅</span>
          <h1 className="text-xl font-bold mt-3 mb-2">¡Contraseña actualizada!</h1>
          <p className="text-gray-500 text-sm mb-4">
            Tu contraseña ha sido restablecida correctamente. Serás redirigido al inicio de sesión en unos segundos.
          </p>
          <Link to="/login" className="text-blue-600 hover:underline text-sm">
            Ir al inicio de sesión ahora →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white border rounded-xl shadow-md p-6">
        <div className="text-center mb-5">
          <span className="text-4xl">🔒</span>
          <h1 className="text-2xl font-bold mt-2">Nueva contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresa el token recibido y tu nueva contraseña.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email" required value={correo}
              onChange={e => setCorreo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token de recuperación</label>
            <input
              type="text" required value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Pega el token aquí"
              className="w-full border rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input
              type="password" required value={nuevaPassword}
              onChange={e => setNuevaPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              type="password" required value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              placeholder="Repite la contraseña"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                confirmar && confirmar !== nuevaPassword
                  ? 'border-red-400 focus:ring-red-400'
                  : 'focus:ring-green-500'
              }`}
              autoComplete="new-password"
            />
            {confirmar && confirmar !== nuevaPassword && (
              <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">← Volver</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
