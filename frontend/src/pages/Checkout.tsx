import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

/* ── Tipos ── */
type CartItem = {
  id_detalle_carrito: number
  nombre: string
  cantidad: number
  precio_unitario: number | string
  subtotal: number | string
}
type Cart = {
  id_carrito: number
  items: CartItem[]
  total: number | string
}
type Address = {
  id_direccion: number
  direccion_linea: string
  ciudad: string
  referencia?: string
  codigo_postal?: string
  es_principal: boolean
}
type Step = 'summary' | 'creating' | 'paying' | 'done' | 'error'

const formatQ = (n: number | string) => {
  const v = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(v) ? '0.00' : v.toFixed(2)}`
}

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loadingCart, setLoadingCart] = useState(true)
  const [step, setStep] = useState<Step>('summary')
  const [errorMsg, setErrorMsg] = useState('')
  const [orderId, setOrderId] = useState<number | null>(null)

  /* ── Direcciones ── */
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  /* ── Formulario nueva dirección ── */
  const [newLinea, setNewLinea] = useState('')
  const [newCiudad, setNewCiudad] = useState('')
  const [newReferencia, setNewReferencia] = useState('')
  const [newCodigo, setNewCodigo] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/checkout' } })
      return
    }
    // Cargar carrito y direcciones en paralelo
    Promise.all([
      api.get<{ ok: boolean; data: Cart }>('/cart'),
      api.get<{ ok: boolean; data: Address[] }>('/addresses'),
    ]).then(([cartRes, addrRes]) => {
      const c = cartRes.data
      if (!c || c.items.length === 0) { navigate('/cart', { replace: true }); return }
      setCart(c)
      const addrs = addrRes.data ?? []
      setAddresses(addrs)
      // Pre-seleccionar la dirección principal si existe
      const principal = addrs.find(a => a.es_principal)
      if (principal) setSelectedAddressId(principal.id_direccion)
      else if (addrs.length > 0) setSelectedAddressId(addrs[0].id_direccion)
      else setShowNewForm(true) // Sin direcciones: mostrar formulario directamente
    }).catch(() => navigate('/cart', { replace: true }))
      .finally(() => setLoadingCart(false))
  }, [navigate])

  /* Guarda una nueva dirección y la selecciona */
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddressError(null)
    setSavingAddress(true)
    try {
      const res = await api.post<{ ok: boolean; data: Address }>('/addresses', {
        direccion_linea: newLinea.trim(),
        ciudad: newCiudad.trim(),
        referencia: newReferencia.trim() || undefined,
        codigo_postal: newCodigo.trim() || undefined,
        es_principal: addresses.length === 0,
      })
      const saved = res.data
      setAddresses(prev => [saved, ...prev])
      setSelectedAddressId(saved.id_direccion)
      setShowNewForm(false)
      // Limpiar formulario
      setNewLinea(''); setNewCiudad(''); setNewReferencia(''); setNewCodigo('')
    } catch (err) {
      setAddressError((err as Error).message)
    } finally {
      setSavingAddress(false)
    }
  }

  /* Crea el pedido */
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAddressId) return
    setStep('creating')
    setErrorMsg('')
    try {
      const res = await api.post<{ ok: boolean; data: { id_pedido: number } }>('/orders', {
        id_direccion: selectedAddressId,
      })
      setOrderId(res.data?.id_pedido)
      setStep('paying')
    } catch (err) {
      setErrorMsg((err as Error).message || 'No se pudo crear el pedido')
      setStep('error')
    }
  }

  /* Simula el pago */
  const handleSimulatePayment = async () => {
    if (!orderId) return
    setStep('paying')
    setErrorMsg('')
    try {
      await api.post('/payments/simulate', {
        id_pedido: orderId,
        resultado: 'approved',
        metodo_pago: 'simulado',
      })
      setStep('done')
    } catch (err) {
      setErrorMsg((err as Error).message || 'No se pudo procesar el pago')
      setStep('error')
    }
  }

  /* ── Pantallas de estado ── */
  if (loadingCart) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  if (step === 'creating') return (
    <div className="flex flex-col items-center py-16 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Creando tu pedido...</p>
    </div>
  )

  if (step === 'paying' && orderId) return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="text-5xl mb-4">📦</div>
      <h2 className="text-2xl font-bold mb-2">¡Pedido creado!</h2>
      <p className="text-gray-600 mb-2">Pedido <span className="font-mono font-bold">#{orderId}</span></p>
      <p className="text-gray-500 mb-8 text-sm">Haz clic para simular el pago y confirmar tu pedido.</p>
      <button onClick={handleSimulatePayment}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-lg shadow-md">
        💳 Simular pago
      </button>
      <p className="mt-4 text-xs text-gray-400">Entorno de demostración — no se realizará ningún cobro real.</p>
    </div>
  )

  if (step === 'done') return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-3xl font-bold mb-2 text-green-700">¡Pago exitoso!</h2>
      <p className="text-gray-600 mb-8">Tu pedido <span className="font-mono font-bold">#{orderId}</span> ha sido confirmado.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Ver mis pedidos
        </Link>
        <Link to="/catalog" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          Seguir comprando
        </Link>
      </div>
    </div>
  )

  if (step === 'error') return (
    <div className="max-w-lg mx-auto py-12">
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <div className="text-4xl mb-3">❌</div>
        <h2 className="text-xl font-bold text-red-700 mb-2">Algo salió mal</h2>
        <p className="text-red-600 text-sm mb-4">{errorMsg}</p>
        <div className="flex gap-3 justify-center">
          {orderId ? (
            <button onClick={handleSimulatePayment}
              className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700">
              Reintentar pago
            </button>
          ) : (
            <button onClick={() => setStep('summary')}
              className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700">
              Volver
            </button>
          )}
          <Link to="/cart" className="px-4 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-50">
            Ir al carrito
          </Link>
        </div>
      </div>
    </div>
  )

  /* ── Pantalla principal: resumen + dirección ── */
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Confirmar pedido</h1>

      {/* Resumen de items */}
      {cart && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-700">Resumen de tu compra</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2 text-center">Cant.</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cart.items.map(item => (
                <tr key={item.id_detalle_carrito}>
                  <td className="px-4 py-2">{item.nombre}</td>
                  <td className="px-4 py-2 text-center">{item.cantidad}</td>
                  <td className="px-4 py-2 text-right font-semibold">{formatQ(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right font-bold">Total a pagar</td>
                <td className="px-4 py-3 text-right text-lg font-bold text-green-700">{formatQ(cart.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Selección de dirección */}
      <form onSubmit={handleCreateOrder} className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700 text-lg">Dirección de entrega</h2>

        {/* Direcciones guardadas */}
        {addresses.length > 0 && (
          <div className="space-y-2">
            {addresses.map(addr => (
              <label key={addr.id_direccion}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAddressId === addr.id_direccion
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <input
                  type="radio"
                  name="address"
                  value={addr.id_direccion}
                  checked={selectedAddressId === addr.id_direccion}
                  onChange={() => { setSelectedAddressId(addr.id_direccion); setShowNewForm(false) }}
                  className="mt-0.5"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{addr.direccion_linea}</p>
                  <p className="text-gray-500">{addr.ciudad}{addr.codigo_postal ? `, ${addr.codigo_postal}` : ''}</p>
                  {addr.referencia && <p className="text-gray-400 text-xs mt-0.5">{addr.referencia}</p>}
                  {addr.es_principal && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">Principal</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Botón para agregar nueva */}
        {!showNewForm && (
          <button type="button" onClick={() => { setShowNewForm(true); setSelectedAddressId(null) }}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            + Usar otra dirección
          </button>
        )}

        {/* Formulario nueva dirección */}
        {showNewForm && (
          <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Nueva dirección</p>
            {addressError && <p className="text-sm text-red-600">{addressError}</p>}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dirección <span className="text-red-500">*</span></label>
              <input value={newLinea} onChange={e => setNewLinea(e.target.value)} required
                placeholder="Ej: 14 calle 1-25, Zona 10"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ciudad <span className="text-red-500">*</span></label>
                <input value={newCiudad} onChange={e => setNewCiudad(e.target.value)} required
                  placeholder="Ciudad de Guatemala"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Código postal</label>
                <input value={newCodigo} onChange={e => setNewCodigo(e.target.value)}
                  placeholder="01010"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Referencia <span className="text-gray-400">(opcional)</span></label>
              <input value={newReferencia} onChange={e => setNewReferencia(e.target.value)}
                placeholder="Ej: Casa con portón azul"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleSaveAddress} disabled={savingAddress || !newLinea.trim() || !newCiudad.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {savingAddress ? 'Guardando...' : 'Guardar dirección'}
              </button>
              {addresses.length > 0 && (
                <button type="button" onClick={() => { setShowNewForm(false); setSelectedAddressId(addresses[0].id_direccion) }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <Link to="/cart" className="text-blue-600 hover:underline text-sm">← Volver al carrito</Link>
          <button
            type="submit"
            disabled={!selectedAddressId || showNewForm}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            Crear pedido →
          </button>
        </div>
      </form>
    </div>
  )
}

export default Checkout
