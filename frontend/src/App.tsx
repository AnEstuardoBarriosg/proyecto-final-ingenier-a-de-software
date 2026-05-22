import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import { getUser, logout, AuthUser } from './services/auth'

const Header: React.FC<{ user: AuthUser | null; onLogout: () => void }> = ({ user, onLogout }) => (
  <header className="bg-white shadow-sm">
    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold">Raíces Market</Link>
      <nav className="flex items-center space-x-4">
        <Link to="/catalog" className="text-gray-700 hover:text-gray-900">Catálogo</Link>
        <Link to="/cart" className="text-gray-700 hover:text-gray-900">Carrito</Link>
        {user ? (
          <>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Hola, {user.nombre_completo.split(' ')[0]}
            </span>
            <button
              onClick={onLogout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-600 hover:underline">Iniciar sesión</Link>
            <Link to="/register" className="text-gray-700 hover:text-gray-900">Crear cuenta</Link>
          </>
        )}
      </nav>
    </div>
  </header>
)

const Footer: React.FC = () => (
  <footer className="bg-gray-50 mt-8">
    <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600">© Raíces Market</div>
  </footer>
)

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
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
