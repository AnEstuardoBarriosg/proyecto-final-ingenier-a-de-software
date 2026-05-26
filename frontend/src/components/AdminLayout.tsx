import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUser } from '../services/auth'

const NAV = [
  { to: '/admin/orders',   icon: '🧾', label: 'Pedidos' },
  { to: '/admin/sellers',  icon: '🏪', label: 'Vendedores' },
  { to: '/admin/users',    icon: '👥', label: 'Usuarios' },
  { to: '/admin/products', icon: '📦', label: 'Productos' },
]

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()

  const isAdmin = user?.rol === 'admin' || user?.rol === 'administrador'
  if (!user || !isAdmin) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div className="flex gap-6 min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-48 flex-shrink-0">
        <div className="bg-white border rounded-xl shadow-sm p-3 sticky top-24">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Panel Admin</p>
          <nav className="space-y-1">
            {NAV.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(item.to)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

export default AdminLayout
