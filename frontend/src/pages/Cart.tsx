import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

type CartItem = {
  id_detalle_carrito: number
  id_producto: number
  nombre: string
  cantidad: number
  precio_unitario: number | string
  subtotal: number | string
}

type Cart = {
  id_carrito: number
  id_usuario: number
  estado: string
  items: CartItem[]
  total: number | string
}

type CartResponse = {
  ok: boolean
  data: Cart
}

const formatQ = (n: number | string) => {
  const value = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(value) ? '0.00' : value.toFixed(2)}`
}

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/cart' } })
      return
    }

    setLoading(true)
    api.get<CartResponse>('/cart')
      .then(res => {
        setCart(res.data)
        setError(null)
      })
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          navigate('/login', { replace: true, state: { from: '/cart' } })
          return
        }
        setError(err.message || 'No se pudo cargar el carrito')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu carrito...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="font-semibold mb-2">Error al cargar el carrito</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Tu carrito</h1>
        <p className="text-gray-500 text-lg mb-6">Tu carrito está vacío</p>
        <Link
          to="/catalog"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tu carrito</h1>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3 text-center">Cantidad</th>
              <th className="px-4 py-3 text-right">Precio unitario</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cart.items.map(item => (
              <tr key={item.id_detalle_carrito}>
                <td className="px-4 py-3 font-medium">{item.nombre}</td>
                <td className="px-4 py-3 text-center">{item.cantidad}</td>
                <td className="px-4 py-3 text-right">{formatQ(item.precio_unitario)}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatQ(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total</td>
              <td className="px-4 py-3 text-right text-xl font-bold text-green-700">
                {formatQ(cart.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <Link to="/catalog" className="text-blue-600 hover:underline">
          ← Seguir comprando
        </Link>
        <button
          className="px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors"
          disabled
          title="Próximamente"
        >
          Proceder al pago
        </button>
      </div>
    </div>
  )
}

export default Cart
