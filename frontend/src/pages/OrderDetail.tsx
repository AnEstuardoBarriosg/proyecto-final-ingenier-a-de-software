import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

type OrderItem = {
  id_detalle_pedido?: number
  nombre: string
  cantidad: number
  precio_unitario: number | string
  subtotal: number | string
}

type Order = {
  id_pedido: number
  estado: string
  total: number | string
  direccion_linea: string
  ciudad: string
  referencia?: string
  codigo_postal?: string
  fecha_pedido: string
  detalles: OrderItem[]
}

const formatQ = (n: number | string) => {
  const value = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(value) ? '0.00' : value.toFixed(2)}`
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-GT', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return iso
  }
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pendiente_pago:               { label: 'Pendiente de pago',    cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  pendiente_confirmacion_pago:  { label: 'Confirmando pago',     cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  pagado:                       { label: 'Pagado',               cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  pago_rechazado:               { label: 'Pago rechazado',       cls: 'bg-red-100 text-red-700 border-red-200' },
  en_proceso:                   { label: 'En proceso',           cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  enviado:                      { label: 'Enviado',              cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  entregado:                    { label: 'Entregado',            cls: 'bg-green-100 text-green-700 border-green-200' },
  cancelado:                    { label: 'Cancelado',            cls: 'bg-gray-100 text-gray-600 border-gray-200' },
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: `/orders/${id}` } })
      return
    }
    api.get<{ ok: boolean; data: Order }>(`/orders/${id}`)
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

  const handlePay = async () => {
    if (!order) return
    setPaying(true)
    setPayError(null)
    try {
      await api.post('/payments/simulate', {
        id_pedido: order.id_pedido,
        resultado: 'approved',
        metodo_pago: 'simulado',
      })
      setPaySuccess(true)
      setOrder(prev => prev ? { ...prev, estado: 'pagado' } : prev)
    } catch (err) {
      setPayError((err as Error).message || 'No se pudo procesar el pago')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="font-semibold mb-1">No se pudo cargar el pedido</p>
        <p className="text-sm">{error}</p>
        <Link to="/orders" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
          ← Volver a mis pedidos
        </Link>
      </div>
    )
  }

  const statusInfo = STATUS_LABELS[order.estado?.toLowerCase()] ?? {
    label: order.estado, cls: 'bg-gray-100 text-gray-700 border-gray-200'
  }
  const isPendiente = order.estado?.toLowerCase() === 'pendiente_pago'
  const items = order.detalles ?? []

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="text-blue-600 hover:underline text-sm">
          ← Mis pedidos
        </Link>
      </div>

      {/* Cabecera del pedido */}
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Pedido <span className="font-mono">#{order.id_pedido}</span></h1>
            <p className="text-sm text-gray-500 mt-1">{formatDate(order.fecha_pedido)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 font-medium mb-1">Dirección de entrega</p>
            <p className="text-gray-800">📍 {order.direccion_linea}</p>
            <p className="text-gray-500">{order.ciudad}{order.codigo_postal ? `, ${order.codigo_postal}` : ''}</p>
            {order.referencia && <p className="text-gray-400 text-xs mt-0.5">{order.referencia}</p>}
          </div>
        </div>
      </div>

      {/* Productos del pedido */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="bg-gray-50 px-5 py-3 border-b">
          <h2 className="font-semibold text-gray-700">Productos</h2>
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
              {items.map((item: OrderItem, i: number) => (
                <tr key={item.id_detalle_pedido ?? i}>
                  <td className="px-5 py-3 font-medium">{item.nombre}</td>
                  <td className="px-5 py-3 text-center">{item.cantidad}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{formatQ(item.precio_unitario)}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatQ(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={3} className="px-5 py-3 text-right font-bold">Total</td>
                <td className="px-5 py-3 text-right text-lg font-bold text-green-700">{formatQ(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="px-5 py-4 text-gray-500 text-sm">No hay detalles de productos disponibles.</p>
        )}
      </div>

      {/* Botón de pago */}
      {isPendiente && !paySuccess && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
          <p className="font-semibold text-yellow-800 mb-1">Este pedido está pendiente de pago</p>
          <p className="text-sm text-yellow-700 mb-4">Simula el pago para confirmar tu pedido.</p>
          {payError && (
            <p className="text-sm text-red-600 mb-3">{payError}</p>
          )}
          <button
            onClick={handlePay}
            disabled={paying}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {paying ? 'Procesando...' : '💳 Simular pago'}
          </button>
        </div>
      )}

      {paySuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-bold text-green-700">¡Pago realizado con éxito!</p>
          <p className="text-sm text-green-600 mt-1">Tu pedido ha sido confirmado.</p>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
