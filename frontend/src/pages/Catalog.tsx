import React, { useEffect, useState, useCallback } from 'react'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

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

type Category = {
  id_categoria: number
  nombre: string
  descripcion?: string
}

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [search, setSearch] = useState('')
  const [inputSearch, setInputSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Cargar categorías una sola vez
  useEffect(() => {
    api.get<{ ok: boolean; data: Category[] }>('/categories')
      .then(res => setCategories(res.data ?? []))
      .catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)           params.set('search', search)
    if (selectedCategory) params.set('category', selectedCategory)
    if (minPrice)         params.set('minPrice', minPrice)
    if (maxPrice)         params.set('maxPrice', maxPrice)

    const qs = params.toString()
    api.get<{ ok: boolean; data: Product[] }>(`/products${qs ? `?${qs}` : ''}`)
      .then(res => { setProducts(res.data ?? []); setError(null) })
      .catch(err => setError(err.message || 'No se pudo cargar el catálogo'))
      .finally(() => setLoading(false))
  }, [search, selectedCategory, minPrice, maxPrice])

  useEffect(() => { load() }, [load])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(inputSearch.trim())
  }

  const clearFilters = () => {
    setInputSearch(''); setSearch(''); setSelectedCategory(''); setMinPrice(''); setMaxPrice('')
  }

  const hasFilters = search || selectedCategory || minPrice || maxPrice

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Catálogo</h1>
        <p className="text-gray-500 text-sm">Artesanías guatemaltecas hechas a mano</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white border rounded-xl p-4 mb-6 space-y-3">
        {/* Búsqueda */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={inputSearch}
            onChange={e => setInputSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
            🔍 Buscar
          </button>
        </form>

        {/* Filtros de precio */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 font-medium">Precio:</span>
          <input
            type="number" min="0" value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            placeholder="Mín Q"
            className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-gray-400 text-sm">—</span>
          <input
            type="number" min="0" value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            placeholder="Máx Q"
            className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {hasFilters && (
            <button onClick={clearFilters}
              className="ml-auto text-xs text-gray-500 hover:text-red-600 underline">
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Categorías */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                !selectedCategory
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
              }`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat.id_categoria}
                onClick={() => setSelectedCategory(cat.nombre === selectedCategory ? '' : cat.nombre)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  selectedCategory === cat.nombre
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Estado de carga / error */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">{error}</div>
      )}

      {/* Resultados */}
      {!loading && !error && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {products.length === 0
              ? hasFilters ? 'No hay productos que coincidan con los filtros.' : 'No hay productos disponibles.'
              : `${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`
            }
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => <ProductCard key={p.id_producto} product={p} />)}
          </div>
        </>
      )}
    </div>
  )
}

export default Catalog
