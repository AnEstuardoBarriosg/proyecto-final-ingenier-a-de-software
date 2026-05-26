import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import SellerProducts from './pages/SellerProducts'
import SellerOrders from './pages/SellerOrders'
import SellerOrderDetail from './pages/SellerOrderDetail'
import AdminOrders from './pages/AdminOrders'
import AdminOrderDetail from './pages/AdminOrderDetail'
import AdminSellers from './pages/AdminSellers'
import AdminUsers from './pages/AdminUsers'
import AdminProducts from './pages/AdminProducts'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetail from './pages/ProductDetail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { getUser, logout, AuthUser } from './services/auth'

/* ── Protege rutas que requieren login ── */
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const location = useLocation()
  const user = getUser()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return element
}

/* ── Header ── */
const Header: React.FC<{ user: AuthUser | null; onLogout: () => void }> = ({ user, onLogout }) => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-y-2">
      <Link to="/" className="text-xl font-bold text-green-700">🌿 Raíces Market</Link>

      <nav className="flex items-center gap-x-4 flex-wrap gap-y-1 text-sm">
        <Link to="/catalog" className="text-gray-700 hover:text-green-700 font-medium">
          Catálogo
        </Link>

        {/* Carrito y Mis pedidos: solo para clientes (o sin sesión) */}
        {(!user || user.rol === 'cliente') && (
          <>
            <Link to="/cart" className="text-gray-700 hover:text-green-700 font-medium">
              🛒 Carrito
            </Link>
            {user && (
              <Link to="/orders" className="text-gray-700 hover:text-green-700 font-medium">
                📋 Mis pedidos
              </Link>
            )}
          </>
        )}

        {user ? (
          <>
            {user.rol === 'vendedor' && (
              <>
                <Link to="/seller/products" className="text-gray-700 hover:text-green-700 font-medium">
                  🏪 Mi tienda
                </Link>
                <Link to="/seller/orders" className="text-gray-700 hover:text-green-700 font-medium">
                  📋 Mis ventas
                </Link>
              </>
            )}
            {(user.rol === 'admin' || user.rol === 'administrador') && (
              <Link to="/admin/orders" className="text-gray-700 hover:text-indigo-700 font-medium">
                ⚙️ Admin
              </Link>
            )}
            <Link to="/notifications" className="text-gray-700 hover:text-green-700 font-medium">
              🔔
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-1 text-gray-700 hover:text-green-700 font-medium"
            >
              <span className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                {user.nombre_completo?.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">{user.nombre_completo.split(' ')[0]}</span>
            </Link>
            <button
              onClick={onLogout}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Crear cuenta
            </Link>
          </>
        )}
      </nav>
    </div>
  </header>
)

/* ── Footer ── */
const Footer: React.FC = () => (
  <footer className="bg-gray-50 border-t mt-8">
    <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
      <span>© {new Date().getFullYear()} Raíces Market — Artesanías guatemaltecas</span>
      <div className="flex gap-4">
        <Link to="/catalog" className="hover:text-gray-700">Catálogo</Link>
        <Link to="/orders" className="hover:text-gray-700">Mis pedidos</Link>
        <Link to="/profile" className="hover:text-gray-700">Mi perfil</Link>
      </div>
    </div>
  </footer>
)

/* ── App principal ── */
const App: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<AuthUser | null>(getUser())

  useEffect(() => {
    setUser(getUser())
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/catalog')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Catalog />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas privadas — flujo de cliente */}
          <Route path="/cart"           element={<PrivateRoute element={<Cart />} />} />
          <Route path="/checkout"       element={<PrivateRoute element={<Checkout />} />} />
          <Route path="/orders"         element={<PrivateRoute element={<Orders />} />} />
          <Route path="/orders/:id"     element={<PrivateRoute element={<OrderDetail />} />} />
          <Route path="/profile"        element={<PrivateRoute element={<Profile />} />} />
          <Route path="/notifications"  element={<PrivateRoute element={<Notifications />} />} />

          {/* Rutas privadas — panel vendedor */}
          <Route path="/seller/products"      element={<PrivateRoute element={<SellerProducts />} />} />
          <Route path="/seller/orders"        element={<PrivateRoute element={<SellerOrders />} />} />
          <Route path="/seller/orders/:id"    element={<PrivateRoute element={<SellerOrderDetail />} />} />

          {/* Rutas privadas — panel administrador */}
          <Route path="/admin/orders"         element={<PrivateRoute element={<AdminOrders />} />} />
          <Route path="/admin/orders/:id"     element={<PrivateRoute element={<AdminOrderDetail />} />} />
          <Route path="/admin/sellers"        element={<PrivateRoute element={<AdminSellers />} />} />
          <Route path="/admin/users"          element={<PrivateRoute element={<AdminUsers />} />} />
          <Route path="/admin/products"       element={<PrivateRoute element={<AdminProducts />} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
