import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated, getUser } from '../services/auth'

type SellerOrder = {
  id_pedido: number
  estado: string
  total?: number | string
  fecha_pedido: string
  cliente?: string
  direccion_entrega?: string
}

const formatQ = (n?: number | string) => {
  if (n === undefined || n === null) return '—'
  const value = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(value) ? '0.00' : value.toFixed(2)}`
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  } catch { return iso }
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-700' },
  pagado:     { label: 'Pagado',      cls: 'bg-blue-100 text-blue-700' },
  enviado:    { label: 'Enviado',     cls: 'bg-purple-100 text-purple-700' },
  entregado:  { label: 'Entregado',   cls: 'bg-green-100 text-green-700' },
  cancelado:  { label: 'Cancelado',   cls: 'bg-red-100 text-red-700' },
}

const SellerOrders: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!isAuthenticated() || user?.rol !== 'vendedor') {
      navigate('/', { replace: true })
      return
    }
    api.get<{ ok: boolean; data: SellerOrder[] }>('/seller/orders')
      .then(res => {
        setOrders(res.data ?? [])
        setError(null)
      })
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          navigate('/login', { replace: true })
          return
        }
        setError(err.message || 'No se pudieron cargar los pedidos')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded text-red-700">
      <p className="font-semibold mb-1">Error al cargar pedidos</p>
      <p className="text-sm">{error}</p>
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Pedidos recibidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-xl">
          <div className="text-6xl mb-4">🧾</div>
          <p className="text-gray-500 text-lg">Aún no has recibido pedidos</p>
          <p className="text-sm text-gray-400 mt-2">Cuando un cliente compre tus productos, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = STATUS_LABELS[order.estado?.toLowerCase()] ?? { label: order.estado, cls: 'bg-gray-100 text-gray-600' }
            return (
              <Link
                key={order.id_pedido}
                to={`/seller/orders/${order.id_pedido}`}
                className="block bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-lg">Pedido <span className="font-mono">#{order.id_pedido}</span></p>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.fecha_pedido)}</p>
                    {order.cliente && (
                      <p className="text-sm text-gray-600 mt-1">👤 {order.cliente}</p>
                    )}
                    {order.direccion_entrega && (
                      <p className="text-sm text-gray-600 truncate max-w-xs">📍 {order.direccion_entrega}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    {order.total !== undefined && (
                      <span className="text-lg font-bold text-green-700">{formatQ(order.total)}</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-blue-600 mt-3">Ver detalle →</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SellerOrders
