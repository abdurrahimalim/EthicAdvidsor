import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '📤', label: 'Upload Report', path: '/upload' },
  { icon: '🌿', label: 'ESG Report', path: '/esg-report' },
  { icon: '⚖️', label: 'OJK Status', path: '/ojk-status' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '📄', label: 'SDG Reports', path: '/result' },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [activeNav, setActiveNav] = useState('Notifications')

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {}
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (e) {}
  }

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getColor = (type) => type === 'ok' ? '#00d4aa' : type === 'warning' ? '#f59e0b' : '#ef4444'
  const getIcon = (type) => type === 'ok' ? '✅' : type === 'warning' ? '⚠️' : '❌'

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2' }}>
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4aa', boxShadow: '0 0 10px #00d4aa' }} />
          <span className="font-extrabold text-lg hidden md:block">EthicAdvidsor</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.path} onClick={() => setActiveNav(item.label)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{ color: activeNav === item.label ? '#00d4aa' : '#94a3b8', background: activeNav === item.label ? 'rgba(0,212,170,0.08)' : 'transparent' }}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-16 md:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-extrabold text-base md:text-lg">Notifications</h1>
              <p className="text-slate-500 text-xs mt-0.5">Ethics & ESG alerts</p>
            </div>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {unreadCount} baru
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
              Tandai semua dibaca
            </button>
          )}
        </header>

        <div className="p-4 md:p-6 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Kritis', count: notifications.filter(n => n.type === 'danger').length, color: '#ef4444', icon: '❌' },
              { label: 'Peringatan', count: notifications.filter(n => n.type === 'warning').length, color: '#f59e0b', icon: '⚠️' },
              { label: 'Info', count: notifications.filter(n => n.type === 'ok').length, color: '#00d4aa', icon: '✅' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl p-3 md:p-4 border border-white/[0.06] text-center"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="font-bold text-xl md:text-2xl" style={{ color: item.color }}>{item.count}</div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'unread', label: `Belum Dibaca (${unreadCount})` },
              { id: 'danger', label: '❌ Kritis' },
              { id: 'warning', label: '⚠️ Peringatan' },
              { id: 'ok', label: '✅ Info' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: filter === tab.id ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.03)',
                  color: filter === tab.id ? '#00d4aa' : '#64748b',
                  border: filter === tab.id ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(255,255,255,0.06)'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-500"><p>Loading...</p></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-4xl mb-3">🎉</div>
                <p>Tidak ada notifikasi</p>
              </div>
            ) : filtered.map(notif => (
              <div key={notif.id}
                className="rounded-2xl p-4 border transition-all cursor-pointer hover:border-white/10"
                style={{
                  background: notif.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                  borderColor: notif.is_read ? 'rgba(255,255,255,0.06)' : `${getColor(notif.type)}30`
                }}
                onClick={() => !notif.is_read && markRead(notif.id)}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase"
                          style={{ color: getColor(notif.type), background: `${getColor(notif.type)}15` }}>
                          {notif.type}
                        </span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getColor(notif.type) }} />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(notif.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}