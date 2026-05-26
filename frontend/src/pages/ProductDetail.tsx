import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated, getUser } from '../services/auth'

/* ── Tipos ── */
type Product = {
  id_producto: number; nombre: string; descripcion: string
  precio: number | string; stock: number; estado: string
  categoria: string; nombre_tienda: string; descripcion_vendedor?: string
  imagenes: { url_imagen: string; es_principal: boolean }[]
  resumen_resenas: { total_resenas: number; promedio_calificacion: number | string }
}
type Review = {
  id_resena: number; nombre_completo: string; calificacion: number
  comentario?: string; fecha_resena: string
}
type ReviewsData = {
  producto: { id_producto: number; nombre: string }
  resumen: { total_resenas: number; promedio_calificacion: number | string }
  resenas: Review[]
}

const formatQ = (n: number | string) => {
  const v = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(v) ? '0.00' : v.toFixed(2)}`
}
const formatDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' }) }
  catch { return iso }
}

/* ── Estrellas ── */
const Stars: React.FC<{ value: number | string; size?: 'sm' | 'md' }> = ({ value, size = 'md' }) => {
  const n = typeof value === 'string' ? parseFloat(value) : value
  const cls = size === 'sm' ? 'text-base' : 'text-xl'
  return (
    <span className={cls}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(n) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

/* ── Selector de estrellas interactivo ── */
const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className={`text-2xl transition-colors ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'}`}
        >★</button>
      ))}
    </div>
  )
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<ReviewsData | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Formulario de reseña
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const user = getUser()
  const isCliente = user?.rol === 'cliente'

  const loadReviews = useCallback(() => {
    setLoadingReviews(true)
    api.get<{ ok: boolean; data: ReviewsData }>(`/reviews/product/${id}`)
      .then(res => setReviews(res.data))
      .catch(() => {})
      .finally(() => setLoadingReviews(false))
  }, [id])

  useEffect(() => {
    api.get<{ ok: boolean; data: Product }>(`/products/${id}`)
      .then(res => {
        if (!res.data) { navigate('/catalog', { replace: true }); return }
        setProduct(res.data)
      })
      .catch(() => { setError('No se pudo cargar el producto'); })
      .finally(() => setLoadingProduct(false))
    loadReviews()
  }, [id, navigate, loadReviews])

  const handleAddToCart = async () => {
    if (!isAuthenticated()) { navigate('/login', { state: { from: `/products/${id}` } }); return }
    try {
      await api.post('/cart/items', { id_producto: Number(id), cantidad: 1 })
      navigate('/cart')
    } catch (err) { alert((err as Error).message) }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewError(null)
    setSubmitting(true)
    try {
      await api.post('/reviews', { id_producto: Number(id), calificacion: rating, comentario: comment || undefined })
      setReviewSuccess(true)
      setComment('')
      setRating(5)
      loadReviews()
    } catch (err) {
      setReviewError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingProduct) return (
    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
  )
  if (error || !product) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error ?? 'Producto no encontrado'}</p>
      <Link to="/catalog" className="text-blue-600 hover:underline">← Volver al catálogo</Link>
    </div>
  )

  const mainImage = product.imagenes?.find(i => i.es_principal)?.url_imagen || product.imagenes?.[0]?.url_imagen
  const precio = typeof product.precio === 'string' ? parseFloat(product.precio) : product.precio
  const promedio = reviews?.resumen?.promedio_calificacion ?? product.resumen_resenas?.promedio_calificacion ?? 0
  const totalResenas = reviews?.resumen?.total_resenas ?? product.resumen_resenas?.total_resenas ?? 0
  const outOfStock = product.stock === 0 || product.estado !== 'activo'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link to="/catalog" className="text-blue-600 hover:underline text-sm">← Catálogo</Link>
      </div>

      {/* Producto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Imagen */}
        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
          {mainImage
            ? <img src={mainImage} alt={product.nombre} className="w-full h-full object-cover" />
            : <span className="text-gray-400 text-6xl">🖼</span>
          }
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-500 mb-1">{product.categoria}</span>
          <h1 className="text-3xl font-bold mb-2">{product.nombre}</h1>

          {/* Rating */}
          {Number(promedio) > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Stars value={promedio} />
              <span className="text-sm text-gray-600">{Number(promedio).toFixed(1)} ({totalResenas} reseña{totalResenas !== 1 ? 's' : ''})</span>
            </div>
          )}

          <p className="text-gray-600 mb-4 leading-relaxed">{product.descripcion}</p>

          <div className="text-3xl font-bold text-green-700 mb-2">
            {isNaN(precio) ? '—' : formatQ(precio)}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            {outOfStock ? '❌ Sin stock' : `✅ ${product.stock} disponibles`}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock || !isCliente && isAuthenticated()}
            className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
              outOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : !isCliente && isAuthenticated() ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {outOfStock ? 'Sin stock' : !isCliente && isAuthenticated() ? 'Solo clientes pueden comprar' : '🛒 Añadir al carrito'}
          </button>

          {/* Vendedor */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Vendido por</p>
            <p className="font-semibold">🏪 {product.nombre_tienda}</p>
            {product.descripcion_vendedor && <p className="text-sm text-gray-500 mt-1">{product.descripcion_vendedor}</p>}
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Reseñas</h2>

        {/* Resumen */}
        {!loadingReviews && totalResenas > 0 && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-500">{Number(promedio).toFixed(1)}</p>
              <Stars value={promedio} />
              <p className="text-xs text-gray-500 mt-1">{totalResenas} reseña{totalResenas !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Formulario — solo clientes autenticados */}
        {isAuthenticated() && isCliente && !reviewSuccess && (
          <div className="bg-white border rounded-xl p-5 mb-6">
            <h3 className="font-semibold mb-3">Escribir reseña</h3>
            <p className="text-xs text-gray-400 mb-3">Solo puedes reseñar productos que ya compraste.</p>
            {reviewError && <p className="text-sm text-red-600 mb-3">{reviewError}</p>}
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calificación</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentario <span className="text-gray-400">(opcional)</span></label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                  placeholder="Cuéntanos tu experiencia con este producto..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
                />
              </div>
              <button type="submit" disabled={submitting}
                className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                {submitting ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </form>
          </div>
        )}

        {reviewSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6 text-green-700 text-sm font-medium">
            ✅ ¡Gracias por tu reseña!
          </div>
        )}

        {!isAuthenticated() && (
          <div className="p-4 bg-gray-50 border rounded-xl mb-6 text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Inicia sesión</Link> para dejar una reseña.
          </div>
        )}

        {/* Lista de reseñas */}
        {loadingReviews ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div></div>
        ) : reviews?.resenas?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aún no hay reseñas para este producto.</p>
        ) : (
          <div className="space-y-4">
            {reviews?.resenas?.map(r => (
              <div key={r.id_resena} className="bg-white border rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{r.nombre_completo}</p>
                    <p className="text-xs text-gray-400">{formatDate(r.fecha_resena)}</p>
                  </div>
                  <Stars value={r.calificacion} size="sm" />
                </div>
                {r.comentario && <p className="text-sm text-gray-700 mt-2">{r.comentario}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
