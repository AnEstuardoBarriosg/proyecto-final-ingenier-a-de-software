import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AdminLayout from '../components/AdminLayout'

type Seller = {
  id_vendedor: number
  id_usuario: number
  nombre_completo: string
  correo: string
  telefono?: string
  nombre_tienda: string
  descripcion?: string
  estado_aprobacion: string
}

const APROBACION: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: 'Pendiente',  cls: 'bg-yellow-100 text-yellow-700' },
  aprobado:   { label: 'Aprobado',   cls: 'bg-green-100 text-green-700' },
  rechazado:  { label: 'Rechazado',  cls: 'bg-red-100 text-red-700' },
}

const AdminSellers: React.FC = () => {
  const navigate = useNavigate()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ ok: boolean; data: Seller[] }>('/admin/sellers')
      .then(res => { setSellers(res.data ?? []); setError(null) })
      .catch(err => {
        if (err.status === 401 || err.status === 403) { navigate('/login', { replace: true }); return }
        setError(err.message || 'Error al cargar vendedores')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => { load() }, [load])

  const handleApproval = async (id: number, estado_aprobacion: string) => {
    setUpdatingId(id)
    try {
      await api.patch(`/admin/sellers/${id}/status`, { estado_aprobacion })
      setSellers(prev => prev.map(s => s.id_vendedor === id ? { ...s, estado_aprobacion } : s))
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = sellers.filter(s =>
    !search ||
    s.nombre_tienda?.toLowerCase().includes(search.toLowerCase()) ||
    s.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    s.correo?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sellers.filter(s => s.estado_aprobacion === 'pendiente').length} pendientes de aprobación
          </p>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar tienda o vendedor..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-60"
        />
      </div>

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white border rounded-xl">
              <p className="text-gray-500">No hay vendedores{search ? ' que coincidan' : ' registrados'}</p>
            </div>
          )}
          {filtered.map(s => {
            const ap = APROBACION[s.estado_aprobacion] ?? { label: s.estado_aprobacion, cls: 'bg-gray-100 text-gray-600' }
            const busy = updatingId === s.id_vendedor
            return (
              <div key={s.id_vendedor} className={`bg-white border rounded-xl p-5 transition-opacity ${busy ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-lg">{s.nombre_tienda}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ap.cls}`}>{ap.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">👤 {s.nombre_completo} — {s.correo}</p>
                    {s.descripcion && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.descripcion}</p>}
                  </div>

                  {/* Botones de aprobación */}
                  <div className="flex gap-2 flex-shrink-0">
                    {s.estado_aprobacion !== 'aprobado' && (
                      <button
                        onClick={() => handleApproval(s.id_vendedor, 'aprobado')}
                        disabled={busy}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        ✓ Aprobar
                      </button>
                    )}
                    {s.estado_aprobacion !== 'pendiente' && (
                      <button
                        onClick={() => handleApproval(s.id_vendedor, 'pendiente')}
                        disabled={busy}
                        className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                      >
                        ⏳ Pendiente
                      </button>
                    )}
                    {s.estado_aprobacion !== 'rechazado' && (
                      <button
                        onClick={() => handleApproval(s.id_vendedor, 'rechazado')}
                        disabled={busy}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        ✕ Rechazar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminSellers
