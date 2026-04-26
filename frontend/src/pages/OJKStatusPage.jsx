import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
 
function statusStyle(status) {
  if (status === 'compliant')
    return { color: '#00d4aa', bg: 'rgba(0,212,170,0.08)', border: 'rgba(0,212,170,0.25)', icon: '✅', label: 'Compliant' }
  if (status === 'warning')
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: '⚠️', label: 'Warning' }
  return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '❌', label: 'Non-Compliant' }
}
 
function RegulationRow({ reg }) {
  const [open, setOpen] = useState(false)
  const s = statusStyle(reg.status)
 
  return (
    <div
      className="rounded-2xl border transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: open ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <span className="text-lg flex-shrink-0">{s.icon}</span>
 
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200">{reg.code}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{reg.description}</p>
        </div>
 
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Score</p>
            <p className="text-base font-extrabold" style={{ color: s.color }}>{reg.score}%</p>
          </div>
 
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
          >
            {s.label}
          </span>
 
          <span
            className="text-slate-500 text-sm transition-transform duration-200"
            style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▾
          </span>
        </div>
      </button>
 
      {open && (
        <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Progress Kepatuhan</span>
            <span className="text-xs font-bold" style={{ color: s.color }}>{reg.score}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${reg.score}%`, background: s.color }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            {reg.status === 'non-compliant'
              ? '⚠ Perlu tindakan segera untuk memenuhi persyaratan regulasi ini.'
              : reg.status === 'warning'
              ? '⚡ Sebagian persyaratan terpenuhi, perlu peningkatan lebih lanjut.'
              : '✓ Semua persyaratan regulasi telah terpenuhi dengan baik.'}
          </p>
          {reg.notes && (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed border-t border-white/[0.05] pt-2">
              {reg.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
 
export default function OJKStatus() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
 
  const [regulations, setRegulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
 
  useEffect(() => {
    api.get('/ojk-status')
      .then(res => {
        const data = res.data
        setRegulations(data.regulations || data.data || data)
        setLastUpdated(data.last_updated || null)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])
 
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
 
  const compliant = regulations.filter(r => r.status === 'compliant').length
  const total = regulations.length
  const overallRate = total > 0
    ? Math.round(regulations.reduce((s, r) => s + (r.score ?? 0), 0) / total)
    : 0
 
  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#00d4aa', boxShadow: '0 0 10px #00d4aa' }}
          />
          <span className="font-extrabold text-lg hidden md:block">EthicAdvidsor</span>
        </div>
 
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  color: isActive ? '#00d4aa' : '#94a3b8',
                  background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium hidden md:block">{item.label}</span>
              </Link>
            )
          })}
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
            <h1 className="font-extrabold text-lg">OJK Compliance Status</h1>
            <p className="text-slate-500 text-xs mt-0.5">Status kepatuhan regulasi OJK &amp; Bank Indonesia</p>
          </div>
          <span
            className="text-xs px-3 py-1.5 rounded-xl border"
            style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            {lastUpdated ? `Last updated: ${lastUpdated}` : 'Live data'}
          </span>
        </header>
 
        <div className="p-6 space-y-6 max-w-5xl">
 
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400 text-sm">Memuat data regulasi...</p>
            </div>
          ) : regulations.length === 0 ? (
            <div
              className="rounded-2xl p-10 border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <p className="text-4xl mb-4">⚖️</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada data regulasi</h3>
              <p className="text-slate-400 text-sm">Data OJK akan muncul setelah laporan diupload dan diproses.</p>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Regulasi',  value: total,             sub: 'Aktif dipantau', color: '#94a3b8', icon: '📋' },
                  { label: 'Compliant',       value: compliant,         sub: 'Terpenuhi',      color: '#00d4aa', icon: '✅' },
                  { label: 'Perlu Perhatian', value: total - compliant, sub: 'Butuh tindakan', color: '#f59e0b', icon: '⚠️' },
                ].map(kpi => (
                  <div
                    key={kpi.label}
                    className="rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div
                      className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
                      style={{ background: kpi.color, transform: 'translate(30%,-30%)' }}
                    />
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-slate-400 text-sm">{kpi.label}</span>
                      <span className="text-xl">{kpi.icon}</span>
                    </div>
                    <div className="font-extrabold text-3xl mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
                    <div className="text-xs font-medium text-slate-400">{kpi.sub}</div>
                  </div>
                ))}
              </div>
 
              {/* Overall Compliance Rate */}
              <div
                className="rounded-2xl p-5 border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Overall Compliance Rate</h3>
                  <span className="font-extrabold text-2xl" style={{ color: '#00d4aa' }}>{overallRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${overallRate}%`,
                      background: 'linear-gradient(90deg, #00d4aa, #0ea5e9)',
                      boxShadow: '0 0 12px rgba(0,212,170,0.4)',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{compliant} dari {total} regulasi terpenuhi</p>
              </div>
 
              {/* Regulation Detail List */}
              <div>
                <h3 className="font-semibold text-sm mb-4">Detail Kepatuhan Regulasi</h3>
                <div className="space-y-3">
                  {regulations.map(reg => (
                    <RegulationRow key={reg.id} reg={reg} />
                  ))}
                </div>
              </div>
            </>
          )}
 
        </div>
      </main>
    </div>
  )
}