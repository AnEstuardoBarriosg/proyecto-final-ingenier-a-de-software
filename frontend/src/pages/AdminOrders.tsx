import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import AdminLayout from '../components/AdminLayout'

type Order = {
  id_pedido: number
  nombre_completo: string
  correo: string
  total: number | string
  estado: string
  fecha_pedido: string
}

const formatQ = (n: number | string) => {
  const v = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(v) ? '0.00' : v.toFixed(2)}`
}

const formatDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return iso }
}

const ESTADO_LABELS: Record<string, { label: string; cls: string }> = {
  pendiente_pago:               { label: 'Pend. pago',      cls: 'bg-yellow-100 text-yellow-700' },
  pendiente_confirmacion_pago:  { label: 'Confirmando',     cls: 'bg-orange-100 text-orange-700' },
  pagado:                       { label: 'Pagado',          cls: 'bg-blue-100 text-blue-700' },
  pago_rechazado:               { label: 'Pago rechazado',  cls: 'bg-red-100 text-red-700' },
  en_proceso:                   { label: 'En proceso',      cls: 'bg-purple-100 text-purple-700' },
  enviado:                      { label: 'Enviado',         cls: 'bg-indigo-100 text-indigo-700' },
  entregado:                    { label: 'Entregado',       cls: 'bg-green-100 text-green-700' },
  cancelado:                    { label: 'Cancelado',       cls: 'bg-gray-100 text-gray-600' },
  // estados cortos del cliente
  pendiente:                    { label: 'Pendiente',       cls: 'bg-yellow-100 text-yellow-700' },
}

const StatusBadge: React.FC<{ estado: string }> = ({ estado }) => {
  const s = ESTADO_LABELS[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s.cls}`}>{s.label}</span>
}

const AdminOrders: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ ok: boolean; data: Order[] }>('/admin/orders')
      .then(res => { setOrders(res.data ?? []); setError(null) })
      .catch(err => {
        if (err.status === 401 || err.status === 403) { navigate('/login', { replace: true }); return }
        setError(err.message || 'Error al cargar pedidos')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => { load() }, [load])

  const filtered = orders.filter(o =>
    !search ||
    String(o.id_pedido).includes(search) ||
    o.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    o.correo?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Todos los pedidos</h1>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por #, cliente o correo..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-60"
        />
      </div>

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No hay pedidos{search ? ' que coincidan' : ''}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Fecha</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(o => (
                  <tr key={o.id_pedido} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-500">#{o.id_pedido}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.nombre_completo}</p>
                      <p className="text-xs text-gray-400">{o.correo}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">{formatDate(o.fecha_pedido)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{formatQ(o.total)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge estado={o.estado} /></td>
                    <td className="px-4 py-3 text-center">
                      <Link to={`/admin/orders/${o.id_pedido}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded px-2 py-1 hover:bg-indigo-50">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminOrders
