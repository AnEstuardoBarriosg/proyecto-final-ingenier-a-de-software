import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import AdminLayout from '../components/AdminLayout'

type OrderItem = { nombre: string; cantidad: number; precio_unitario: number | string; subtotal: number | string }
type Payment = { metodo_pago: string; monto: number | string; estado_pago: string; fecha_pago: string; referencia_externa?: string }
type Order = {
  id_pedido: number; nombre_completo: string; correo: string; total: number | string
  estado: string; fecha_pedido: string; direccion_linea?: string; ciudad?: string
  referencia?: string; codigo_postal?: string; detalles: OrderItem[]; pago: Payment | null
}

const ESTADOS_VALIDOS = [
  { value: 'pendiente_pago',              label: 'Pendiente de pago' },
  { value: 'pendiente_confirmacion_pago', label: 'Confirmando pago' },
  { value: 'pagado',                      label: 'Pagado' },
  { value: 'pago_rechazado',             label: 'Pago rechazado' },
  { value: 'en_proceso',                 label: 'En proceso' },
  { value: 'enviado',                    label: 'Enviado' },
  { value: 'entregado',                  label: 'Entregado' },
  { value: 'cancelado',                  label: 'Cancelado' },
]

const formatQ = (n?: number | string) => {
  if (n == null) return '—'
  const v = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(v) ? '0.00' : v.toFixed(2)}`
}

const formatDate = (iso: string) => {
  try { return new Date(iso).toLocaleString('es-GT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    api.get<{ ok: boolean; data: Order }>(`/admin/orders/${id}`)
      .then(res => { setOrder(res.data); setNewStatus(res.data.estado) })
      .catch(err => {
        if (err.status === 401 || err.status === 403) { navigate('/login', { replace: true }); return }
        setError(err.message || 'No se pudo cargar el pedido')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.estado) return
    setUpdating(true)
    setUpdateMsg(null)
    try {
      await api.patch(`/admin/orders/${id}/status`, { estado: newStatus })
      setOrder(prev => prev ? { ...prev, estado: newStatus } : prev)
      setUpdateMsg({ ok: true, text: `Estado actualizado a "${newStatus}"` })
    } catch (err) {
      setUpdateMsg({ ok: false, text: (err as Error).message })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div></AdminLayout>
  if (error || !order) return (
    <AdminLayout>
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="font-semibold">{error ?? 'Pedido no encontrado'}</p>
        <Link to="/admin/orders" className="text-blue-600 hover:underline text-sm mt-2 inline-block">← Volver</Link>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="mb-4">
        <Link to="/admin/orders" className="text-indigo-600 hover:underline text-sm">← Todos los pedidos</Link>
      </div>

      <h1 className="text-2xl font-bold mb-5">Pedido <span className="font-mono">#{order.id_pedido}</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-5">

          {/* Datos del pedido */}
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Información del pedido</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">Cliente</dt>   <dd className="font-medium">{order.nombre_completo}</dd>
              <dt className="text-gray-500">Correo</dt>    <dd>{order.correo}</dd>
              <dt className="text-gray-500">Fecha</dt>     <dd>{formatDate(order.fecha_pedido)}</dd>
              <dt className="text-gray-500">Total</dt>     <dd className="font-bold text-green-700">{formatQ(order.total)}</dd>
              {order.direccion_linea && <><dt className="text-gray-500">Dirección</dt><dd>{order.direccion_linea}{order.ciudad ? `, ${order.ciudad}` : ''}</dd></>}
              {order.referencia && <><dt className="text-gray-500">Referencia</dt><dd>{order.referencia}</dd></>}
            </dl>
          </div>

          {/* Items */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b"><h2 className="font-semibold text-gray-700">Productos</h2></div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="px-5 py-2">Producto</th><th className="px-5 py-2 text-center">Cant.</th>
                <th className="px-5 py-2 text-right">P. Unit.</th><th className="px-5 py-2 text-right">Subtotal</th>
              </tr></thead>
              <tbody className="divide-y">
                {(order.detalles ?? []).map((item, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 font-medium">{item.nombre}</td>
                    <td className="px-5 py-3 text-center">{item.cantidad}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{formatQ(item.precio_unitario)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{formatQ(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pago */}
          {order.pago && (
            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold text-gray-700 mb-3">Pago</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Método</dt>    <dd>{order.pago.metodo_pago}</dd>
                <dt className="text-gray-500">Monto</dt>     <dd className="font-bold text-green-700">{formatQ(order.pago.monto)}</dd>
                <dt className="text-gray-500">Estado</dt>    <dd>{order.pago.estado_pago}</dd>
                <dt className="text-gray-500">Fecha</dt>     <dd>{formatDate(order.pago.fecha_pago)}</dd>
                {order.pago.referencia_externa && <><dt className="text-gray-500">Referencia</dt><dd className="font-mono text-xs">{order.pago.referencia_externa}</dd></>}
              </dl>
            </div>
          )}
        </div>

        {/* Panel de acciones */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Cambiar estado</h2>
            <select
              value={newStatus} onChange={e => setNewStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
            >
              {ESTADOS_VALIDOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            {updateMsg && (
              <p className={`text-xs mb-2 ${updateMsg.ok ? 'text-green-600' : 'text-red-600'}`}>{updateMsg.text}</p>
            )}

            <button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === order.estado}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {updating ? 'Actualizando...' : 'Guardar cambio'}
            </button>
            {newStatus === order.estado && <p className="text-xs text-gray-400 text-center mt-1">Este ya es el estado actual</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminOrderDetail
