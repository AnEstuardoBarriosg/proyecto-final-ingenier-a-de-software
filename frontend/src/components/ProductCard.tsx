import React from 'react'
import { Link } from 'react-router-dom'

type Product = {
  id_producto: number
  nombre: string
  precio: number | string
  stock: number
  url_imagen?: string
  descripcion?: string
  categoria?: string
  total_resenas?: number
  promedio_calificacion?: number | string
}

const Stars: React.FC<{ value: number | string }> = ({ value }) => {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return (
    <span className="text-sm">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(n) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const precio = typeof product.precio === 'string' ? parseFloat(product.precio) : product.precio
  const isOutOfStock = product.stock === 0 || product.stock < 1
  const promedio = typeof product.promedio_calificacion === 'string'
    ? parseFloat(product.promedio_calificacion)
    : (product.promedio_calificacion ?? 0)
  const totalResenas = product.total_resenas ?? 0

  return (
    <article className="border rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <Link to={`/products/${product.id_producto}`} className="block">
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
          {product.url_imagen ? (
            <img
              src={product.url_imagen}
              alt={product.nombre}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-300 text-5xl">🖼</span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {product.categoria && (
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.categoria}</p>
        )}
        <Link to={`/products/${product.id_producto}`} className="hover:text-green-700">
          <h3 className="font-semibold text-base line-clamp-2 leading-snug">{product.nombre}</h3>
        </Link>

        {/* Stars */}
        {totalResenas > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Stars value={promedio} />
            <span className="text-xs text-gray-400">({totalResenas})</span>
          </div>
        )}

        {product.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{product.descripcion}</p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="text-xl font-bold text-green-700">
            Q{isNaN(precio) ? '0.00' : precio.toFixed(2)}
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
          }`}>
            {isOutOfStock ? 'Agotado' : `${product.stock} disp.`}
          </span>
        </div>

        <Link
          to={`/products/${product.id_producto}`}
          className="block w-full mt-3 py-2 rounded font-semibold text-center transition-colors bg-blue-600 text-white hover:bg-blue-700 text-sm"
        >
          Ver detalle →
        </Link>
      </div>
    </article>
  )
}

export default ProductCard
