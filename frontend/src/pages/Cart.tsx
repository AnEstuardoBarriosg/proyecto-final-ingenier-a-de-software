import React, { useEffect, useState, useCallback } from 'react'
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

const formatQ = (n: number | string) => {
  const value = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(value) ? '0.00' : value.toFixed(2)}`
}

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadCart = useCallback(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/cart' } })
      return
    }
    setLoading(true)
    api.get<{ ok: boolean; data: Cart }>('/cart')
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

  useEffect(() => { loadCart() }, [loadCart])

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) return
    setUpdatingId(itemId)
    try {
      await api.put(`/cart/items/${itemId}`, { cantidad: newQty })
      await loadCart()
    } catch (err) {
      setError((err as Error).message || 'No se pudo actualizar la cantidad')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (itemId: number) => {
    setDeletingId(itemId)
    try {
      await api.delete(`/cart/items/${itemId}`)
      await loadCart()
    } catch (err) {
      setError((err as Error).message || 'No se pudo eliminar el producto')
    } finally {
      setDeletingId(null)
    }
  }

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
        <button
          onClick={loadCart}
          className="mt-3 px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
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
              <th className="px-4 py-3 text-center">Quitar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cart.items.map(item => {
              const isUpdating = updatingId === item.id_detalle_carrito
              const isDeleting = deletingId === item.id_detalle_carrito
              const busy = isUpdating || isDeleting
              return (
                <tr key={item.id_detalle_carrito} className={busy ? 'opacity-50' : ''}>
                  <td className="px-4 py-3 font-medium">{item.nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id_detalle_carrito, item.cantidad - 1)}
                        disabled={busy || item.cantidad <= 1}
                        className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold leading-none flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold">{item.cantidad}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id_detalle_carrito, item.cantidad + 1)}
                        disabled={busy}
                        className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold leading-none flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatQ(item.precio_unitario)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatQ(item.subtotal)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(item.id_detalle_carrito)}
                      disabled={busy}
                      className="text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-semibold">Total</td>
              <td colSpan={1} className="px-4 py-3 text-right">
                <span className="text-xl font-bold text-green-700">{formatQ(cart.total)}</span>
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
          onClick={() => navigate('/checkout')}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
        >
          Proceder al pago →
        </button>
      </div>
    </div>
  )
}

export default Cart
