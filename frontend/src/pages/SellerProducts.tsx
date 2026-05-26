import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated, getUser } from '../services/auth'

/* ── Tipos ── */
type Category = { id_categoria: number; nombre: string }

type Product = {
  id_producto: number
  nombre: string
  descripcion: string
  precio: number | string
  stock: number
  estado: string
  categoria: string
  id_categoria?: number
}

type FormData = {
  nombre: string
  descripcion: string
  precio: string
  stock: string
  id_categoria: string
  estado: string
}

const EMPTY_FORM: FormData = {
  nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '', estado: 'activo'
}

const formatQ = (n: number | string) => {
  const v = typeof n === 'string' ? parseFloat(n) : n
  return `Q${isNaN(v) ? '0.00' : v.toFixed(2)}`
}

const STATUS = {
  activo:   { label: 'Activo',   cls: 'bg-green-100 text-green-700' },
  agotado:  { label: 'Agotado',  cls: 'bg-red-100 text-red-700' },
  inactivo: { label: 'Inactivo', cls: 'bg-gray-100 text-gray-600' },
}

/* ── Modal de formulario ── */
const ProductModal: React.FC<{
  mode: 'create' | 'edit'
  initial: FormData
  categories: Category[]
  onSave: (data: FormData) => Promise<void>
  onClose: () => void
}> = ({ mode, initial, categories, onSave, onClose }) => {
  const [form, setForm] = useState<FormData>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{mode === 'create' ? 'Nuevo producto' : 'Editar producto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} required rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Q) <span className="text-red-500">*</span></label>
              <input type="number" min="0.01" step="0.01" value={form.precio}
                onChange={e => set('precio', e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="1" value={form.stock}
                onChange={e => set('stock', e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
            <select value={form.id_categoria} onChange={e => set('id_categoria', e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Selecciona una categoría</option>
              {categories.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="activo">Activo</option>
                <option value="agotado">Agotado</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-60">
              {saving ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal de stock ── */
const StockModal: React.FC<{
  product: Product
  onSave: (stock: number) => Promise<void>
  onClose: () => void
}> = ({ product, onSave, onClose }) => {
  const [stock, setStock] = useState(String(product.stock))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(Number(stock))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Actualizar stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Producto: <span className="font-semibold">{product.nombre}</span></p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo stock</label>
            <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-bold" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Página principal ── */
const SellerProducts: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [stockTarget, setStockTarget] = useState<Product | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<{ ok: boolean; data: Product[] }>('/seller/products')
      setProducts(res.data ?? [])
      setError(null)
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        navigate('/login', { replace: true })
        return
      }
      setError(err.message || 'No se pudieron cargar tus productos')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const user = getUser()
    if (!isAuthenticated() || user?.rol !== 'vendedor') {
      navigate('/', { replace: true })
      return
    }
    loadProducts()
    api.get<{ ok: boolean; data: Category[] }>('/categories')
      .then(res => setCategories(res.data ?? []))
      .catch(() => {})
  }, [navigate, loadProducts])

  const handleCreate = async (form: FormData) => {
    await api.post('/seller/products', {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      id_categoria: parseInt(form.id_categoria),
    })
    setShowCreate(false)
    await loadProducts()
  }

  const handleEdit = async (form: FormData) => {
    if (!editTarget) return
    await api.put(`/seller/products/${editTarget.id_producto}`, {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      id_categoria: parseInt(form.id_categoria),
      estado: form.estado,
    })
    setEditTarget(null)
    await loadProducts()
  }

  const handleStock = async (stock: number) => {
    if (!stockTarget) return
    await api.patch(`/seller/products/${stockTarget.id_producto}/stock`, { stock })
    setStockTarget(null)
    await loadProducts()
  }

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  )

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Mis productos</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} producto{products.length !== 1 ? 's' : ''} publicado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-xl">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg mb-4">Aún no tienes productos publicados</p>
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
            Publicar primer producto
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-600">
              <tr>
                <th className="px-5 py-3 text-left">Producto</th>
                <th className="px-5 py-3 text-left hidden md:table-cell">Categoría</th>
                <th className="px-5 py-3 text-right">Precio</th>
                <th className="px-5 py-3 text-center">Stock</th>
                <th className="px-5 py-3 text-center">Estado</th>
                <th className="px-5 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => {
                const st = STATUS[p.estado as keyof typeof STATUS] ?? { label: p.estado, cls: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={p.id_producto} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-semibold">{p.nombre}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{p.descripcion}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-gray-600">{p.categoria}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-700">{formatQ(p.precio)}</td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setStockTarget(p)}
                        className="font-bold hover:underline text-blue-600"
                        title="Clic para actualizar stock"
                      >
                        {p.stock}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setEditTarget(p)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {showCreate && (
        <ProductModal
          mode="create"
          initial={EMPTY_FORM}
          categories={categories}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editTarget && (
        <ProductModal
          mode="edit"
          initial={{
            nombre: editTarget.nombre,
            descripcion: editTarget.descripcion,
            precio: String(editTarget.precio),
            stock: String(editTarget.stock),
            id_categoria: String(editTarget.id_categoria ?? ''),
            estado: editTarget.estado,
          }}
          categories={categories}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {stockTarget && (
        <StockModal
          product={stockTarget}
          onSave={handleStock}
          onClose={() => setStockTarget(null)}
        />
      )}
    </div>
  )
}

export default SellerProducts
