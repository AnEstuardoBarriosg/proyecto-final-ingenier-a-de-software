import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated, getUser } from '../services/auth'

type OrderItem = {
  nombre: string
  cantidad: number
  precio_unitario: number | string
  subtotal: number | string
}

type SellerOrderDetail = {
  id_pedido: number
  estado: string
  fecha_pedido: string
  direccion_entrega: string
  notas?: string
  cliente?: string
  total?: number | string
  items: OrderItem[]
}

const formatQ = (n?: number | string) => {
  if (n === undefined || n === null) return '—'
  const value = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(value) ? '0.00' : value.toFixed(2)}`
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return iso }
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  pagado:     { label: 'Pagado',      cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  enviado:    { label: 'Enviado',     cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  entregado:  { label: 'Entregado',   cls: 'bg-green-100 text-green-700 border-green-200' },
  cancelado:  { label: 'Cancelado',   cls: 'bg-red-100 text-red-700 border-red-200' },
}

const SellerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<SellerOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!isAuthenticated() || user?.rol !== 'vendedor') {
      navigate('/', { replace: true })
      return
    }
    api.get<{ ok: boolean; data: SellerOrderDetail }>(`/seller/orders/${id}`)
      .then(res => {
        setOrder(res.data)
        setError(null)
      })
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          navigate('/login', { replace: true })
          return
        }
        setError(err.message || 'No se pudo cargar el pedido')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  )

  if (error || !order) return (
    <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded text-red-700">
      <p className="font-semibold mb-1">No se pudo cargar el pedido</p>
      <p className="text-sm">{error}</p>
      <Link to="/seller/orders" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
        ← Volver a mis pedidos
      </Link>
    </div>
  )

  const st = STATUS_LABELS[order.estado?.toLowerCase()] ?? { label: order.estado, cls: 'bg-gray-100 text-gray-600 border-gray-200' }
  const items = order.items ?? []

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/seller/orders" className="text-blue-600 hover:underline text-sm">
          ← Mis pedidos
        </Link>
      </div>

      {/* Cabecera */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Pedido <span className="font-mono">#{order.id_pedido}</span></h1>
            <p className="text-sm text-gray-500 mt-1">{formatDate(order.fecha_pedido)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${st.cls}`}>
            {st.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {order.cliente && (
            <div>
              <p className="text-gray-500 font-medium mb-1">Cliente</p>
              <p className="text-gray-800">👤 {order.cliente}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500 font-medium mb-1">Dirección de entrega</p>
            <p className="text-gray-800">📍 {order.direccion_entrega}</p>
          </div>
          {order.notas && (
            <div className="sm:col-span-2">
              <p className="text-gray-500 font-medium mb-1">Notas</p>
              <p className="text-gray-800">{order.notas}</p>
            </div>
          )}
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-gray-50 px-5 py-3 border-b">
          <h2 className="font-semibold text-gray-700">Tus productos en este pedido</h2>
        </div>

        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-5 py-2">Producto</th>
                <th className="px-5 py-2 text-center">Cant.</th>
                <th className="px-5 py-2 text-right">P. unitario</th>
                <th className="px-5 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-5 py-3 font-medium">{item.nombre}</td>
                  <td className="px-5 py-3 text-center">{item.cantidad}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{formatQ(item.precio_unitario)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatQ(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            {order.total !== undefined && (
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-right font-bold">Total del pedido</td>
                  <td className="px-5 py-3 text-right text-lg font-bold text-green-700">{formatQ(order.total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        ) : (
          <p className="px-5 py-4 text-gray-500 text-sm">No hay productos disponibles.</p>
        )}
      </div>
    </div>
  )
}

export default SellerOrderDetail
