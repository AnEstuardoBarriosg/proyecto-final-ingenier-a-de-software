import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const ForgotPassword: React.FC = () => {
  const [correo, setCorreo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await api.post<{ ok: boolean; correo: string; reset_token: string; mensaje: string }>(
        '/password/forgot-password',
        { correo }
      )
      setResetToken(res.reset_token)
    } catch (err) {
      setError((err as Error).message || 'No se pudo procesar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  if (resetToken) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white border rounded-xl shadow-md p-6">
          <div className="text-center mb-4">
            <span className="text-4xl">📧</span>
            <h1 className="text-xl font-bold mt-2">Token generado</h1>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <p className="text-sm text-amber-800 font-medium mb-1">⚠️ Modo de demostración</p>
            <p className="text-xs text-amber-700">
              En producción, este token se enviaría por correo electrónico.
              Por ahora se muestra directamente en pantalla.
            </p>
          </div>

          <div className="p-4 bg-gray-50 border rounded-lg mb-4">
            <p className="text-xs text-gray-500 mb-1 font-medium">Tu token de recuperación:</p>
            <p className="font-mono text-sm text-gray-800 break-all select-all">{resetToken}</p>
          </div>

          <p className="text-xs text-gray-500 text-center mb-5">
            El token expira en 15 minutos. Úsalo en la siguiente pantalla.
          </p>

          <Link
            to={`/reset-password?correo=${encodeURIComponent(correo)}&token=${encodeURIComponent(resetToken)}`}
            className="block w-full py-2 text-center bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Restablecer contraseña →
          </Link>

          <p className="mt-3 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">← Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white border rounded-xl shadow-md p-6">
        <div className="text-center mb-5">
          <span className="text-4xl">🔑</span>
          <h1 className="text-2xl font-bold mt-2">Recuperar contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa tu correo y te generaremos un token de recuperación.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              required
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Enviando...' : 'Generar token'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          <Link to="/login" className="text-blue-600 hover:underline">← Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
