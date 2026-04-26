import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '📤', label: 'Upload Report', path: '/upload' },
  { icon: '🌿', label: 'ESG Report', path: '/esg-report' },
  { icon: '⚖️', label: 'OJK Status', path: '/ojk-status' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '📄', label: 'SDG Reports', path: '/result' },
]

const TYPE_CONFIG = {
  critical: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    dot: '#ef4444',
    label: 'Kritis',
  },
  warning: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    dot: '#f59e0b',
    label: 'Peringatan',
  },
  info: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
    color: '#00d4aa',
    bg: 'rgba(0,212,170,0.08)',
    border: 'rgba(0,212,170,0.2)',
    dot: '#00d4aa',
    label: 'Info',
  },
}

export default function Notifications() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [activeNav] = useState('Notifications')

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data.data || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const counts = {
    critical: notifications.filter(n => n.type === 'critical').length,
    warning: notifications.filter(n => n.type === 'warning').length,
    info: notifications.filter(n => n.type === 'info').length,
    unread: notifications.filter(n => !n.is_read).length,
  }

  const FILTERS = [
    { label: 'Semua', value: 'Semua' },
    { label: `Belum Dibaca (${counts.unread})`, value: 'Belum Dibaca' },
    { label: 'Kritis', value: 'Kritis', type: 'critical' },
    { label: 'Peringatan', value: 'Peringatan', type: 'warning' },
    { label: 'Info', value: 'Info', type: 'info' },
  ]

  const filtered = notifications.filter(n => {
    if (activeFilter === 'Semua') return true
    if (activeFilter === 'Belum Dibaca') return !n.is_read
    if (activeFilter === 'Kritis') return n.type === 'critical'
    if (activeFilter === 'Peringatan') return n.type === 'warning'
    if (activeFilter === 'Info') return n.type === 'info'
    return true
  })

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar — identik dengan Dashboard */}
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4aa', boxShadow: '0 0 10px #00d4aa' }} />
          <span className="font-extrabold text-lg hidden md:block">EthicAdvidsor</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                color: activeNav === item.label ? '#00d4aa' : '#94a3b8',
                background: activeNav === item.label ? 'rgba(0,212,170,0.08)' : 'transparent',
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <span className="flex-shrink-0">🚪</span>
            <span className="text-sm font-medium hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-16 md:ml-64 min-h-screen">

        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-extrabold text-lg">Notifications</h1>
              {counts.unread > 0 && (
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}
                >
                  {counts.unread} baru
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Ethics &amp; ESG alerts</p>
          </div>
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-all"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            Tandai semua dibaca
          </button>
        </header>

        <div className="p-6 space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {(['critical', 'warning', 'info']).map(type => {
              const cfg = TYPE_CONFIG[type]
              return (
                <div
                  key={type}
                  className="rounded-2xl p-5 border flex flex-col items-center gap-2 relative overflow-hidden"
                  style={{ background: cfg.bg, borderColor: cfg.border }}
                >
                  <div
                    className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20"
                    style={{ background: cfg.color, transform: 'translate(30%,-30%)' }}
                  />
                  <span style={{ color: cfg.color }}>{cfg.icon}</span>
                  <span className="font-extrabold text-3xl" style={{ color: cfg.color }}>{counts[type]}</span>
                  <span className="text-xs text-slate-400 font-medium tracking-wide">{cfg.label}</span>
                </div>
              )
            })}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => {
              const isActive = activeFilter === f.value
              const cfg = f.type ? TYPE_CONFIG[f.type] : null
              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                  style={{
                    background: isActive ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.03)',
                    borderColor: isActive ? 'rgba(0,212,170,0.35)' : 'rgba(255,255,255,0.07)',
                    color: isActive ? '#00d4aa' : '#94a3b8',
                  }}
                >
                  {cfg && <span style={{ color: cfg.color }}>{cfg.icon}</span>}
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <p className="text-slate-400 text-sm">Memuat notifikasi...</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div
                className="rounded-2xl p-10 border border-white/[0.06] text-center"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-3xl mb-3">🔔</p>
                <p className="text-slate-400 text-sm">Tidak ada notifikasi.</p>
              </div>
            )}

            {!loading && filtered.map(notif => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markRead(notif.id)}
                  className="relative flex items-start gap-4 px-5 py-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{
                    background: notif.is_read ? 'rgba(255,255,255,0.02)' : cfg.bg,
                    borderColor: notif.is_read ? 'rgba(255,255,255,0.06)' : cfg.border,
                  }}
                >
                  {/* Unread dot */}
                  {!notif.is_read && (
                    <span
                      className="absolute top-4 right-5 w-2 h-2 rounded-full"
                      style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className="mt-0.5 w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                  >
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {notif.category || notif.type?.toUpperCase()}
                      </span>
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                      )}
                    </div>
                    <p
                      className="font-semibold text-sm mb-0.5"
                      style={{ color: notif.is_read ? '#94a3b8' : '#e8edf2' }}
                    >
                      {notif.title}
                    </p>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {notif.message || notif.description}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="text-slate-600 text-xs whitespace-nowrap mt-0.5 flex-shrink-0">
                    {notif.time || notif.created_at_human}
                  </span>
                </div>
              )
            })}
          </div>

        </div>
      </main>
    </div>
  )
}