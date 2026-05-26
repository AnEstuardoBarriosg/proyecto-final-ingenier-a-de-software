import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login } from '../services/auth'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from || '/cart'

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(correo, password)
      // Redirigir según el rol del usuario
      if (user.rol === 'vendedor') {
        navigate('/seller/products', { replace: true })
      } else if (user.rol === 'admin' || user.rol === 'administrador') {
        navigate('/admin/orders', { replace: true })
      } else {
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white border rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
            Correo
          </label>
          <input
            id="correo"
            type="email"
            required
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 rounded font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-3 text-sm text-center">
        <Link to="/forgot-password" className="text-gray-500 hover:text-gray-700 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>

      <p className="mt-2 text-sm text-gray-600 text-center">
        ¿No tienes cuenta? <Link to="/register" className="text-blue-600 hover:underline">Regístrate</Link>
      </p>
    </div>
  )
}

export default Login
