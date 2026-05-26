import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

type Order = {
  id_pedido: number
  estado: string
  total: number | string
  direccion_entrega: string
  fecha_pedido: string
  items_count?: number
}

const formatQ = (n: number | string) => {
  const value = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(value) ? '0.00' : value.toFixed(2)}`
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  } catch {
    return iso
  }
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pendiente_pago:              { label: 'Pendiente de pago',   cls: 'bg-yellow-100 text-yellow-700' },
  pendiente_confirmacion_pago: { label: 'Confirmando pago',    cls: 'bg-orange-100 text-orange-700' },
  pagado:                      { label: 'Pagado',              cls: 'bg-blue-100 text-blue-700' },
  pago_rechazado:              { label: 'Pago rechazado',      cls: 'bg-red-100 text-red-700' },
  en_proceso:                  { label: 'En proceso',          cls: 'bg-indigo-100 text-indigo-700' },
  enviado:                     { label: 'Enviado',             cls: 'bg-purple-100 text-purple-700' },
  entregado:                   { label: 'Entregado',           cls: 'bg-green-100 text-green-700' },
  cancelado:                   { label: 'Cancelado',           cls: 'bg-gray-100 text-gray-600' },
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_LABELS[status?.toLowerCase()] ?? { label: status, cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}

const Orders: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/orders' } })
      return
    }
    api.get<{ ok: boolean; data: Order[] }>('/orders/my-orders')
      .then(res => {
        setOrders(res.data ?? [])
        setError(null)
      })
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          navigate('/login', { replace: true, state: { from: '/orders' } })
          return
        }
        setError(err.message || 'No se pudieron cargar tus pedidos')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="font-semibold mb-1">Error al cargar tus pedidos</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mis pedidos</h1>
        <Link
          to="/catalog"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          + Nuevo pedido
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg mb-6">Aún no tienes pedidos</p>
          <Link
            to="/catalog"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id_pedido}
              to={`/orders/${order.id_pedido}`}
              className="block bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-bold text-lg">Pedido <span className="font-mono">#{order.id_pedido}</span></p>
                  <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.fecha_pedido)}</p>
                  {order.direccion_entrega && (
                    <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">📍 {order.direccion_entrega}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={order.estado} />
                  <span className="text-xl font-bold text-green-700">{formatQ(order.total)}</span>
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-3 hover:underline">Ver detalle →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
