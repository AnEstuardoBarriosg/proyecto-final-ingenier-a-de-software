import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { isAuthenticated } from '../services/auth'

type Notification = {
  id_notificacion: number
  titulo?: string
  mensaje: string
  leida: boolean
  fecha_creacion: string
  tipo?: string
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return iso
  }
}

const Notifications: React.FC = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { from: '/notifications' } })
      return
    }
    api.get<{ ok: boolean; data: Notification[] }>('/notifications')
      .then(res => {
        setNotifications(res.data ?? [])
        setError(null)
      })
      .catch(err => {
        if (err.status === 401 || err.status === 403) {
          navigate('/login', { replace: true })
          return
        }
        setError(err.message || 'No se pudieron cargar las notificaciones')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const handleMarkRead = async (id: number) => {
    setMarkingId(id)
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id_notificacion === id ? { ...n, leida: true } : n)
      )
    } catch {
      // Silenciar error — la UI ya muestra el cambio optimistamente
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.leida)
    for (const n of unread) {
      try {
        await api.patch(`/notifications/${n.id_notificacion}/read`)
      } catch { /* continuar con las demás */ }
    }
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <p className="font-semibold mb-1">Error al cargar notificaciones</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.leida).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} sin leer
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id_notificacion}
              className={`bg-white border rounded-lg p-4 transition-colors ${
                notif.leida
                  ? 'border-gray-200 opacity-75'
                  : 'border-blue-200 bg-blue-50/30 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {notif.leida ? '📭' : '📬'}
                  </span>
                  <div className="flex-1 min-w-0">
                    {notif.titulo && (
                      <p className="font-semibold text-gray-800 mb-0.5">{notif.titulo}</p>
                    )}
                    <p className="text-sm text-gray-700">{notif.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatDate(notif.fecha_creacion)}</p>
                  </div>
                </div>

                {!notif.leida && (
                  <button
                    onClick={() => handleMarkRead(notif.id_notificacion)}
                    disabled={markingId === notif.id_notificacion}
                    className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    title="Marcar como leída"
                  >
                    {markingId === notif.id_notificacion ? '...' : 'Leída ✓'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
