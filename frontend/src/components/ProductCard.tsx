import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

type Product = {
  id_producto: number
  nombre: string
  precio: number
  stock: number
  url_imagen?: string
  descripcion?: string
  categoria?: string
}

type FeedbackKind = 'success' | 'error' | null

const PlaceholderImage = () => (
  <svg className="w-full h-full" viewBox="0 0 400 300" fill="#e5e7eb">
    <rect width="400" height="300" fill="#f3f4f6"/>
    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#9ca3af" fontSize="24" fontFamily="sans-serif">
      Sin imagen
    </text>
  </svg>
)

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate()
  const precio = typeof product.precio === 'string' ? parseFloat(product.precio) : product.precio
  const isOutOfStock = product.stock === 0 || product.stock < 1

  const [adding, setAdding] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: FeedbackKind; message: string }>({ kind: null, message: '' })

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/catalog' } })
      return
    }

    setAdding(true)
    setFeedback({ kind: null, message: '' })

    try {
      await api.post('/cart/items', {
        id_producto: product.id_producto,
        cantidad: 1
      })
      setFeedback({ kind: 'success', message: '✓ Agregado al carrito' })
      window.setTimeout(() => setFeedback({ kind: null, message: '' }), 2500)
    } catch (err) {
      const status = (err as any).status
      if (status === 401 || status === 403) {
        navigate('/login', { state: { from: '/catalog' } })
        return
      }
      setFeedback({ kind: 'error', message: (err as Error).message || 'No se pudo agregar' })
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="border rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.url_imagen ? (
          <img
            src={product.url_imagen}
            alt={product.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2">{product.nombre}</h3>
        {product.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">{product.descripcion}</p>
        )}
        {product.categoria && (
          <p className="text-xs text-gray-500 mt-2">{product.categoria}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xl font-bold text-green-700">Q{isNaN(precio) ? '0.00' : precio.toFixed(2)}</div>
          <div className={`px-3 py-1 rounded text-sm font-medium ${
            isOutOfStock
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {isOutOfStock ? 'Agotado' : `Stock: ${product.stock}`}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full mt-3 py-2 rounded font-semibold transition-colors ${
            isOutOfStock || adding
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={isOutOfStock || adding}
        >
          {isOutOfStock ? 'No disponible' : adding ? 'Agregando...' : 'Añadir al carrito'}
        </button>

        {feedback.kind && (
          <p className={`mt-2 text-sm text-center ${
            feedback.kind === 'success' ? 'text-green-700' : 'text-red-600'
          }`}>
            {feedback.message}
          </p>
        )}
      </div>
    </article>
  )
}

export default ProductCard
