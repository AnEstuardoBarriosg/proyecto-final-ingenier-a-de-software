import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AdminLayout from '../components/AdminLayout'

type Product = {
  id_producto: number
  nombre: string
  descripcion?: string
  precio: number | string
  stock: number
  estado: string
  categoria?: string
  vendedor?: string
}

const ESTADOS: Record<string, { label: string; cls: string }> = {
  activo:   { label: 'Activo',   cls: 'bg-green-100 text-green-700' },
  agotado:  { label: 'Agotado',  cls: 'bg-yellow-100 text-yellow-700' },
  inactivo: { label: 'Inactivo', cls: 'bg-gray-100 text-gray-500' },
}

const ESTADOS_OPCIONES = ['activo', 'inactivo', 'agotado']

const formatQ = (n: number | string) => {
  const v = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(v) ? '0.00' : v.toFixed(2)}`
}

const AdminProducts: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ ok: boolean; data: Product[] }>('/admin/products')
      .then(res => { setProducts(res.data ?? []); setError(null) })
      .catch(err => {
        if (err.status === 401 || err.status === 403) { navigate('/login', { replace: true }); return }
        setError(err.message || 'Error al cargar productos')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id: number, estado: string) => {
    setUpdatingId(id)
    try {
      await api.patch(`/admin/products/${id}/status`, { estado })
      setProducts(prev => prev.map(p => p.id_producto === id ? { ...p, estado } : p))
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.vendedor?.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filterEstado === 'todos' || p.estado === filterEstado
    return matchSearch && matchEstado
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} productos en total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS_OPCIONES.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
          </select>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto o vendedor..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-52"
          />
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No hay productos{search ? ' que coincidan' : ''}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Categoría</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Cambiar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(p => {
                  const st = ESTADOS[p.estado] ?? { label: p.estado, cls: 'bg-gray-100 text-gray-600' }
                  const busy = updatingId === p.id_producto
                  return (
                    <tr key={p.id_producto} className={`hover:bg-gray-50 ${busy ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.nombre}</p>
                        {p.vendedor && <p className="text-xs text-gray-400">🏪 {p.vendedor}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500">{p.categoria ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{formatQ(p.precio)}</td>
                      <td className="px-4 py-3 text-center">{p.stock}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={p.estado}
                          onChange={e => handleStatusChange(p.id_producto, e.target.value)}
                          disabled={busy}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
                        >
                          {ESTADOS_OPCIONES.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminProducts
