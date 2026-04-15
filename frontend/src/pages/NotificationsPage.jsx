import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '📤', label: 'Upload Report', path: '/upload' },
  { icon: '🌿', label: 'ESG Report', path: '/esg-report' },
  { icon: '⚖️', label: 'OJK Status', path: '/ojk-status' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '📄', label: 'SDG Reports', path: '/result' },
]

const DUMMY_NOTIFICATIONS = [
  {
    id: 1, type: 'critical', category: 'ESG', unread: true,
    title: 'Pelanggaran Threshold Emisi Karbon',
    message: 'Emisi karbon bulan November mencapai 620 ton, melebihi batas maksimum 600 ton yang ditetapkan.',
    time: '2 jam lalu',
  },
  {
    id: 2, type: 'warning', category: 'OJK', unread: true,
    title: 'Deadline SLIK Reporting Mendekat',
    message: 'Pelaporan SLIK untuk periode Maret 2025 jatuh tempo dalam 3 hari. Segera lengkapi data peminjam.',
    time: '5 jam lalu',
  },
  {
    id: 3, type: 'ok', category: 'OJK', unread: false,
    title: 'Laporan OJK Q1 Berhasil Dikirim',
    message: 'Laporan keuangan kuartal pertama 2025 telah berhasil dikirimkan ke OJK dan diterima.',
    time: '1 hari lalu',
  },
  {
    id: 4, type: 'warning', category: 'ESG', unread: false,
    title: 'Social Score Mendekati Batas Minimum',
    message: 'Social score bulan ini 62, mendekati batas minimum 60. Tingkatkan program sosial perusahaan.',
    time: '2 hari lalu',
  },
  {
    id: 5, type: 'critical', category: 'OJK', unread: true,
    title: 'POJK No. 18/2025 Belum Terpenuhi',
    message: 'Regulasi POJK No. 18/2025 terkait transparansi laporan ESG belum dipenuhi. Segera tindak lanjuti.',
    time: '3 hari lalu',
  },
  {
    id: 6, type: 'ok', category: 'ESG', unread: false,
    title: 'Governance Score Naik ke 87',
    message: 'Skor tata kelola perusahaan meningkat dari 82 ke 87 pada bulan Oktober, melampaui target tahunan.',
    time: '4 hari lalu',
  },
  {
    id: 7, type: 'warning', category: 'OJK', unread: false,
    title: 'Audit Internal Belum Diselesaikan',
    message: 'Proses audit internal Q3 2025 masih belum selesai. Deadline pengiriman laporan dalam 7 hari.',
    time: '5 hari lalu',
  },
  {
    id: 8, type: 'ok', category: 'ESG', unread: false,
    title: 'Program Energi Terbarukan Terdaftar',
    message: 'Inisiatif panel surya perusahaan telah resmi terdaftar dan diakui dalam laporan ESG nasional 2025.',
    time: '1 minggu lalu',
  },
]

const TYPE_CONFIG = {
  critical: { icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'Kritis' },
  warning:  { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Peringatan' },
  ok:       { icon: '✅', color: '#00d4aa', bg: 'rgba(0,212,170,0.08)',  border: 'rgba(0,212,170,0.2)',  label: 'Info' },
}

const FILTERS = ['Semua', 'Belum Dibaca', 'Kritis', 'Peringatan', 'Info']

export default function Notifications() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('Notifications')
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  const filtered = notifications.filter(n => {
    if (activeFilter === 'Semua') return true
    if (activeFilter === 'Belum Dibaca') return n.unread
    if (activeFilter === 'Kritis') return n.type === 'critical'
    if (activeFilter === 'Peringatan') return n.type === 'warning'
    if (activeFilter === 'Info') return n.type === 'ok'
    return true
  })

  const unreadCount = notifications.filter(n => n.unread).length
  const criticalCount = notifications.filter(n => n.type === 'critical').length
  const warningCount = notifications.filter(n => n.type === 'warning').length
  const infoCount = notifications.filter(n => n.type === 'ok').length

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4aa', boxShadow: '0 0 10px #00d4aa' }} />
          <span className="font-extrabold text-lg hidden md:block">EthicAdvisor</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setActiveNav(item.label)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                color: activeNav === item.label ? '#00d4aa' : '#94a3b8',
                background: activeNav === item.label ? 'rgba(0,212,170,0.08)' : 'transparent',
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full hidden md:block"
                  style={{ background: '#ef4444', color: '#fff', fontSize: '10px' }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <span className="flex-shrink-0">🚪</span>
            <span className="text-sm font-medium hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-16 md:ml-64 min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-extrabold text-lg">Notifications</h1>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                  {unreadCount} baru
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Ethics & ESG alerts</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-sm font-medium px-4 py-2 rounded-xl border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              Tandai semua dibaca
            </button>
          )}
        </header>

        <div className="p-6 space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Kritis', value: criticalCount, color: '#ef4444', icon: '❌', sub: 'Butuh tindakan segera' },
              { label: 'Peringatan', value: warningCount, color: '#f59e0b', icon: '⚠️', sub: 'Perlu diperhatikan' },
              { label: 'Info', value: infoCount, color: '#00d4aa', icon: '✅', sub: 'Informasi & konfirmasi' },
            ].map(stat => (
              <div key={stat.label}
                className="rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
                  style={{ background: stat.color, transform: 'translate(30%,-30%)' }} />
                <div className="flex items-start justify-between mb-3">
                  <span className="text-slate-400 text-sm">{stat.label}</span>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div className="font-extrabold text-3xl mb-1" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs font-medium text-slate-400">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => {
              const isActive = activeFilter === f
              return (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                  style={{
                    background: isActive ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.02)',
                    color: isActive ? '#00d4aa' : '#94a3b8',
                    borderColor: isActive ? 'rgba(0,212,170,0.35)' : 'rgba(255,255,255,0.06)',
                  }}>
                  {f}
                  {f === 'Belum Dibaca' && unreadCount > 0 && (
                    <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Notification List */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-3xl mb-3">🔔</p>
                <p className="text-slate-400 text-sm">Tidak ada notifikasi</p>
              </div>
            ) : (
              filtered.map((notif, idx) => {
                const cfg = TYPE_CONFIG[notif.type]
                return (
                  <div key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className="flex items-start gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 cursor-pointer transition-all hover:bg-white/[0.02]"
                    style={{ borderLeft: notif.unread ? `3px solid ${cfg.color}` : '3px solid transparent' }}>

                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      {cfg.icon}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Category tag */}
                        <span className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: notif.category === 'ESG' ? 'rgba(0,212,170,0.1)' : 'rgba(59,130,246,0.1)',
                            color: notif.category === 'ESG' ? '#00d4aa' : '#60a5fa',
                          }}>
                          {notif.category}
                        </span>
                        {/* Unread dot */}
                        {notif.unread && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: '#ef4444', boxShadow: '0 0 4px #ef4444' }} />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-100 mb-1">{notif.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                    </div>

                    {/* Time */}
                    <div className="text-xs text-slate-500 flex-shrink-0 pt-0.5 font-mono">{notif.time}</div>
                  </div>
                )
              })
            )}
          </div>

        </div>
      </main>
    </div>
  )
}