import React, { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

type Product = {
  id_producto: number
  nombre: string
  precio: number
  stock: number
  url_imagen?: string
}

const sampleProducts: Product[] = [
  { id_producto: 1, nombre: 'Bufanda artesanal', precio: 120.0, stock: 10 },
  { id_producto: 2, nombre: 'Taza de barro', precio: 85.0, stock: 15 },
  { id_producto: 3, nombre: 'Pulsera tejida', precio: 35.0, stock: 0 }
]

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get('/products')
      .then(res => {
        // Backend devuelve { ok: true, data: [...] }
        const productos = res.data?.data || res.data || []
        setProducts(productos.length > 0 ? productos : sampleProducts)
        setError(null)
      })
      .catch(err => {
        console.error('Error al cargar productos:', err.message)
        setError('No se pudo cargar el catálogo — usando datos de ejemplo')
        setProducts(sampleProducts)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Catálogo de Productos</h1>
      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => <ProductCard key={p.id_producto} product={p} />)}
      </div>
    </div>
  )
}

export default Catalog
