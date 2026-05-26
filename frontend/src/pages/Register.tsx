import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/auth'

type AccountType = 'cliente' | 'vendedor'

const Register: React.FC = () => {
  const navigate = useNavigate()

  // Tipo de cuenta
  const [accountType, setAccountType] = useState<AccountType>('cliente')

  // Campos comunes
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Campos de vendedor
  const [nombreTienda, setNombreTienda] = useState('')
  const [descripcionTienda, setDescripcionTienda] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (accountType === 'vendedor' && !nombreTienda.trim()) {
      setError('El nombre de tu tienda es obligatorio')
      return
    }

    setSubmitting(true)
    try {
      await register({
        nombre_completo: nombreCompleto.trim(),
        correo: correo.trim(),
        password,
        telefono: telefono.trim() || undefined,
        rol: accountType,
        nombre_tienda: accountType === 'vendedor' ? nombreTienda.trim() : undefined,
        descripcion_tienda: accountType === 'vendedor' && descripcionTienda.trim()
          ? descripcionTienda.trim()
          : undefined,
      })
      navigate(accountType === 'vendedor' ? '/seller/products' : '/catalog', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white border rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>
      <p className="text-sm text-gray-500 mb-5">¿Cómo quieres usar Raíces Market?</p>

      {/* Selector de tipo de cuenta */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setAccountType('cliente')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            accountType === 'cliente'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-1">🛍️</div>
          <p className="font-semibold text-sm">Comprador</p>
          <p className="text-xs text-gray-500 mt-0.5">Explora y compra productos artesanales</p>
        </button>

        <button
          type="button"
          onClick={() => setAccountType('vendedor')}
          className={`p-4 rounded-xl border-2 text-left transition-all ${
            accountType === 'vendedor'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-1">🏪</div>
          <p className="font-semibold text-sm">Vendedor</p>
          <p className="text-xs text-gray-500 mt-0.5">Publica y vende tus artesanías</p>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Datos personales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text" required value={nombreCompleto}
            onChange={e => setNombreCompleto(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email" required value={correo}
            onChange={e => setCorreo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
          </label>
          <input
            type="tel" value={telefono}
            onChange={e => setTelefono(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoComplete="tel"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password" required minLength={8} value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar <span className="text-red-500">*</span>
            </label>
            <input
              type="password" required minLength={8} value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Campos extra para vendedor */}
        {accountType === 'vendedor' && (
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-green-800">🏪 Datos de tu tienda</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la tienda <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required={accountType === 'vendedor'} value={nombreTienda}
                onChange={e => setNombreTienda(e.target.value)}
                placeholder="Ej: Artesanías Xela"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <textarea
                value={descripcionTienda}
                onChange={e => setDescripcionTienda(e.target.value)}
                rows={2} placeholder="Cuéntanos qué vendes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none bg-white"
              />
            </div>

            <p className="text-xs text-green-700">
              ℹ️ Tu cuenta quedará activa de inmediato. El equipo de Raíces Market puede revisar tu tienda en cualquier momento.
            </p>
          </div>
        )}

        <button
          type="submit" disabled={submitting}
          className="w-full py-2.5 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? 'Creando cuenta...'
            : accountType === 'vendedor'
              ? 'Crear cuenta de vendedor'
              : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600 text-center">
        ¿Ya tienes cuenta? <Link to="/login" className="text-green-600 hover:underline font-medium">Inicia sesión</Link>
      </p>
    </div>
  )
}

export default Register
