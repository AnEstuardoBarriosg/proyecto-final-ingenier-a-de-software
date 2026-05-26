import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AdminLayout from '../components/AdminLayout'

type User = {
  id_usuario: number
  nombre_completo: string
  correo: string
  telefono?: string
  estado: string
  rol: string
}

const ROL_BADGE: Record<string, string> = {
  cliente:        'bg-blue-100 text-blue-700',
  vendedor:       'bg-green-100 text-green-700',
  admin:          'bg-purple-100 text-purple-700',
  administrador:  'bg-purple-100 text-purple-700',
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('todos')

  const load = useCallback(() => {
    setLoading(true)
    api.get<{ ok: boolean; data: User[] }>('/admin/users')
      .then(res => { setUsers(res.data ?? []); setError(null) })
      .catch(err => {
        if (err.status === 401 || err.status === 403) { navigate('/login', { replace: true }); return }
        setError(err.message || 'Error al cargar usuarios')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => { load() }, [load])

  const handleToggleStatus = async (u: User) => {
    const nuevoEstado = u.estado === 'activo' ? 'inactivo' : 'activo'
    setUpdatingId(u.id_usuario)
    try {
      await api.patch(`/admin/users/${u.id_usuario}/status`, { estado: nuevoEstado })
      setUsers(prev => prev.map(x => x.id_usuario === u.id_usuario ? { ...x, estado: nuevoEstado } : x))
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
      u.correo?.toLowerCase().includes(search.toLowerCase())
    const matchRol = filterRol === 'todos' || u.rol === filterRol
    return matchSearch && matchRol
  })

  const roles = ['todos', ...Array.from(new Set(users.map(u => u.rol)))]

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterRol} onChange={e => setFilterRol(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {roles.map(r => <option key={r} value={r}>{r === 'todos' ? 'Todos los roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-52"
          />
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No hay usuarios que coincidan</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-center">Rol</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(u => {
                  const busy = updatingId === u.id_usuario
                  const rolCls = ROL_BADGE[u.rol] ?? 'bg-gray-100 text-gray-600'
                  return (
                    <tr key={u.id_usuario} className={`hover:bg-gray-50 ${busy ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{u.nombre_completo}</p>
                        <p className="text-xs text-gray-400">{u.correo}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rolCls}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={busy || u.rol === 'admin' || u.rol === 'administrador'}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            u.estado === 'activo'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                          }`}
                          title={u.rol === 'admin' || u.rol === 'administrador' ? 'No se puede modificar a administradores' : ''}
                        >
                          {busy ? '...' : u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
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

export default AdminUsers
