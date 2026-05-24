import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',     path: '/dashboard' },
  { icon: '📤', label: 'Upload Report', path: '/upload' },
  { icon: '🌿', label: 'ESG Report',    path: '/esg-report' },
  { icon: '⚖️', label: 'OJK Status',    path: '/ojk-status' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '📄', label: 'SDG Reports',   path: '/result' },
  { icon: '🕓', label: 'History',       path: '/history' },
]

const TYPE_CONFIG = {
  upload:   { icon: '📤', label: 'Upload',    color: '#00d4aa', bg: 'rgba(0,212,170,0.10)'  },
  analysis: { icon: '📊', label: 'Analisis',  color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
  warning:  { icon: '⚠️', label: 'Peringatan',color: '#f59e0b', bg: 'rgba(245,158,11,0.10)'  },
}

const STATUS_CONFIG = {
  success: { label: 'Berhasil', color: '#00d4aa', bg: 'rgba(0,212,170,0.12)',  border: 'rgba(0,212,170,0.25)'  },
  pending: { label: 'Diproses', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  failed:  { label: 'Gagal',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)     return `${diff}d lalu`
  if (diff < 3600)   return `${Math.floor(diff / 60)}m lalu`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}j lalu`
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function groupByDate(items) {
  const groups = {}
  items.forEach(item => {
    const key = new Date(item.created_at).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return groups
}

const PER_PAGE = 8

export default function HistoryPage() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [history,    setHistory]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStat, setFilterStat] = useState('all')
  const [expanded,   setExpanded]   = useState(null)
  const [page,       setPage]       = useState(1)

  useEffect(() => {
    api.get('/history')
      .then(res => setHistory(res.data?.data ?? res.data ?? []))
      .catch(() => setError('Gagal memuat riwayat. Coba refresh halaman.'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => { await logout(); navigate('/login') }

  const filtered = history.filter(h => {
    const matchType   = filterType === 'all' || h.type === filterType
    const matchStatus = filterStat === 'all' || h.status === filterStat
    const matchSearch = !search ||
      h.title?.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchStatus && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const grouped    = groupByDate(paginated)

  const stats = {
    total:   history.length,
    success: history.filter(h => h.status === 'success').length,
    pending: history.filter(h => h.status === 'pending').length,
    failed:  history.filter(h => h.status === 'failed').length,
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4aa', boxShadow: '0 0 10px #00d4aa' }} />
          <span className="font-extrabold text-lg hidden md:block">EthicAdvidsor</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(item => {
            const active = item.label === 'History'
            return (
              <Link key={item.label} to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  color:      active ? '#00d4aa' : '#94a3b8',
                  background: active ? 'rgba(0,212,170,0.08)' : 'transparent',
                }}>
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium hidden md:block">{item.label}</span>
              </Link>
            )
          })}
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
          style={{ background: 'rgba(8,12,16,0.85)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-lg">History</h1>
            <p className="text-slate-500 text-xs mt-0.5">Riwayat seluruh aktivitas laporan</p>
          </div>
          <Link to="/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
            style={{ background: '#00d4aa', boxShadow: '0 0 20px rgba(0,212,170,0.25)' }}>
            <span>📤</span>
            <span className="hidden sm:block">Upload Report</span>
          </Link>
        </header>

        <div className="p-6 space-y-5">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Aktivitas', value: stats.total,   color: '#00d4aa', icon: '🕓' },
              { label: 'Berhasil',        value: stats.success, color: '#22c55e', icon: '✅' },
              { label: 'Diproses',        value: stats.pending, color: '#f59e0b', icon: '⏳' },
              { label: 'Gagal',           value: stats.failed,  color: '#ef4444', icon: '❌' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 border border-white/[0.06] relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="absolute top-0 right-0 w-14 h-14 rounded-full opacity-10 blur-2xl"
                  style={{ background: s.color, transform: 'translate(30%,-30%)' }} />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs">{s.label}</span>
                  <span className="text-base">{s.icon}</span>
                </div>
                <div className="font-extrabold text-2xl" style={{ color: s.color }}>
                  {loading ? '—' : s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="rounded-2xl p-4 border border-white/[0.06] flex flex-col sm:flex-row gap-3"
            style={{ background: 'rgba(255,255,255,0.02)' }}>

            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Cari aktivitas..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none border border-white/[0.06] focus:border-[#00d4aa]/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>

            {/* Type filter */}
            <div className="flex gap-1.5 flex-wrap">
              {['all', ...Object.keys(TYPE_CONFIG)].map(t => {
                const active = filterType === t
                const cfg    = TYPE_CONFIG[t]
                return (
                  <button key={t} onClick={() => { setFilterType(t); setPage(1) }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: active ? (cfg?.bg ?? 'rgba(0,212,170,0.12)') : 'rgba(255,255,255,0.04)',
                      color:      active ? (cfg?.color ?? '#00d4aa') : '#64748b',
                      border:     `1px solid ${active ? (cfg?.color ?? '#00d4aa') + '40' : 'transparent'}`,
                    }}>
                    {t === 'all' ? '🗂 Semua' : `${cfg.icon} ${cfg.label}`}
                  </button>
                )
              })}
            </div>

            {/* Status filter */}
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'success', 'pending', 'failed'].map(s => {
                const active = filterStat === s
                const cfg    = STATUS_CONFIG[s]
                return (
                  <button key={s} onClick={() => { setFilterStat(s); setPage(1) }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: active ? (cfg?.bg ?? 'rgba(0,212,170,0.12)') : 'rgba(255,255,255,0.04)',
                      color:      active ? (cfg?.color ?? '#00d4aa') : '#64748b',
                      border:     `1px solid ${active ? (cfg?.color ?? '#00d4aa') + '40' : 'transparent'}`,
                    }}>
                    {s === 'all' ? 'Semua Status' : cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#00d4aa]/30 border-t-[#00d4aa] animate-spin" />
                <p className="text-slate-400 text-sm">Memuat riwayat...</p>
              </div>
            </div>

          ) : error ? (
            <div className="rounded-2xl p-10 border border-red-500/20 text-center"
              style={{ background: 'rgba(239,68,68,0.05)' }}>
              <p className="text-4xl mb-3">⚠️</p>
              <h3 className="font-semibold text-base mb-1 text-red-400">{error}</h3>
              <button onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-black"
                style={{ background: '#00d4aa' }}>
                Coba Lagi
              </button>
            </div>

          ) : filtered.length === 0 ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-3">🕓</p>
              <h3 className="font-semibold text-base mb-1">
                {history.length === 0 ? 'Belum ada aktivitas' : 'Tidak ada hasil'}
              </h3>
              <p className="text-slate-400 text-sm">
                {history.length === 0
                  ? 'Upload laporan pertama kamu untuk mulai mencatat riwayat'
                  : 'Coba ubah filter atau kata kunci pencarian'}
              </p>
              {history.length === 0 && (
                <Link to="/upload"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-black"
                  style={{ background: '#00d4aa' }}>
                  📤 Upload Report Sekarang
                </Link>
              )}
            </div>

          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  {/* Date group header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.05]" />
                    <span className="text-xs text-slate-600">{items.length} aktivitas</span>
                  </div>

                  <div className="space-y-2">
                    {items.map(item => {
                      const typeCfg   = TYPE_CONFIG[item.type]    ?? TYPE_CONFIG.analysis
                      const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending
                      const isOpen    = expanded === item.id

                      return (
                        <div key={item.id}
                          onClick={() => setExpanded(isOpen ? null : item.id)}
                          className="rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-200 hover:border-white/[0.12] cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.02)' }}>

                          {/* Row */}
                          <div className="flex items-center gap-4 p-4">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                              style={{ background: typeCfg.bg }}>
                              {typeCfg.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-200 truncate">{item.title}</p>
                              {item.description && (
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full hidden sm:block"
                                style={{ color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                                {statusCfg.label}
                              </span>
                              <span className="text-xs text-slate-500 hidden md:block whitespace-nowrap">
                                {timeAgo(item.created_at)}
                              </span>
                              <span className="text-slate-600 text-xs transition-transform duration-200"
                                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                                ▼
                              </span>
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {isOpen && (
                            <div className="px-4 pb-4 border-t border-white/[0.05]">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  <p className="text-xs text-slate-500 mb-1">Tipe Aktivitas</p>
                                  <div className="flex items-center gap-2">
                                    <span>{typeCfg.icon}</span>
                                    <span className="text-sm font-semibold" style={{ color: typeCfg.color }}>{typeCfg.label}</span>
                                  </div>
                                </div>
                                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  <p className="text-xs text-slate-500 mb-1">Status</p>
                                  <span className="text-sm font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                                </div>
                                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  <p className="text-xs text-slate-500 mb-1">Waktu</p>
                                  <span className="text-xs text-slate-300">{formatDate(item.created_at)}</span>
                                </div>
                              </div>
                              {item.description && (
                                <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  <p className="text-xs text-slate-500 mb-1">Detail</p>
                                  <p className="text-sm text-slate-300">{item.description}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                Menampilkan {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} aktivitas
              </p>
              <div className="flex gap-1.5">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.06] text-slate-400 disabled:opacity-30 hover:border-white/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: n === page ? '#00d4aa' : 'rgba(255,255,255,0.03)',
                      color:      n === page ? '#080c10' : '#64748b',
                      border:     `1px solid ${n === page ? '#00d4aa' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    {n}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.06] text-slate-400 disabled:opacity-30 hover:border-white/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  Next →
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}