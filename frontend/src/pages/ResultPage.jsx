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
 
function scoreLabel(score) {
  if (score >= 85) return { text: 'BAIK', color: '#00d4aa', bg: 'rgba(0,212,170,0.12)', border: 'rgba(0,212,170,0.3)' }
  if (score >= 70) return { text: 'CUKUP', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' }
  return { text: 'PERLU PERBAIKAN', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
}
 
export default function Result() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
 
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    api.get('/result')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])
 
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
 
  const handleExportPDF = async () => {
    try {
      const res = await api.get('/result/export-pdf', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-esg-${data?.report?.year ?? 'export'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }
 
  const esg = data?.esg_score
  const report = data?.report
  const regulations = data?.regulations || []
  const sdgs = data?.sdg_alignment || []
  const notifications = data?.notifications || []
  const financial = data?.financial_summary
 
  const badge = esg ? scoreLabel(esg.overall_score) : null
 
  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4aa', boxShadow: '0 0 10px #00d4aa' }} />
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
      <main className="flex-1 ml-16 md:ml-64 min-h-screen flex flex-col">
 
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div>
            <h1 className="font-extrabold text-lg">Hasil Analisis</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {report ? `${report.industry ?? 'FinTech'} · Tahun ${report.year}` : 'Memuat data...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/upload"
              className="text-sm text-slate-400 hover:text-white transition-all flex items-center gap-1"
            >
              ← Upload Ulang
            </Link>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
              style={{ background: '#00d4aa', boxShadow: '0 0 20px rgba(0,212,170,0.25)' }}
            >
              📄 Export PDF
            </button>
          </div>
        </header>
 
        <div className="p-6 space-y-6 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400 text-sm">Memuat hasil analisis...</p>
            </div>
          ) : !report ? (
            <div
              className="rounded-2xl p-10 border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <p className="text-4xl mb-4">📄</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada hasil analisis</h3>
              <p className="text-slate-400 text-sm mb-6">Upload laporan terlebih dahulu untuk melihat hasil analisis ESG.</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black"
                style={{ background: '#00d4aa' }}
              >
                📤 Upload Report Sekarang
              </Link>
            </div>
          ) : (
            <>
              {/* Overall ESG Score */}
              <div
                className="rounded-2xl p-6 border border-white/[0.06] relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ background: 'radial-gradient(ellipse at top right, #00d4aa, transparent 60%)' }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
                  {/* Left: big score */}
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Overall ESG Score</p>
                    <div className="flex items-end gap-3">
                      <span className="font-extrabold text-6xl" style={{ color: '#f59e0b' }}>
                        {esg?.overall_score ?? '-'}
                      </span>
                    </div>
                    {badge && (
                      <span
                        className="inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full border"
                        style={{ color: badge.color, background: badge.bg, borderColor: badge.border }}
                      >
                        {badge.text}
                      </span>
                    )}
                  </div>
 
                  {/* Right: sub scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Environmental', value: esg?.environmental_score, color: '#00d4aa' },
                      { label: 'Social', value: esg?.social_score, color: '#0ea5e9' },
                      { label: 'Governance', value: esg?.governance_score, color: '#a78bfa' },
                      { label: 'OJK Score', value: esg?.ojk_score, color: '#f59e0b' },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="rounded-xl px-4 py-3 text-center border border-white/[0.06]"
                        style={{ background: 'rgba(255,255,255,0.02)' }}
                      >
                        <p className="font-extrabold text-2xl" style={{ color: item.color }}>
                          {item.value ?? '-'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
 
              {/* Middle Row: Regulation Status + SDG Alignment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
                {/* Regulation Status */}
                <div
                  className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <h3 className="font-semibold text-sm mb-4">⚖️ Status Kepatuhan Regulasi</h3>
                  <div className="space-y-4">
                    {regulations.map(reg => {
                      const s = statusStyle(reg.status)
                      return (
                        <div key={reg.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-slate-300">{reg.code || reg.name}</span>
                            <span
                              className="text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1"
                              style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                            >
                              {s.icon} {s.label}
                            </span>
                          </div>
                          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${reg.score ?? 100}%`, background: s.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
 
                {/* SDG Alignment + Financial Summary */}
                <div className="flex flex-col gap-4">
                  <div
                    className="rounded-2xl p-5 border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <h3 className="font-semibold text-sm mb-4">🌍 SDG Alignment</h3>
                    <div className="space-y-4">
                      {sdgs.map((sdg, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-300">{sdg.name}</span>
                            <span className="text-sm font-bold" style={{ color: sdg.score >= 75 ? '#0ea5e9' : '#f59e0b' }}>
                              {sdg.score}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${sdg.score}%`,
                                background: sdg.score >= 75 ? '#0ea5e9' : '#f59e0b',
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                            {sdg.score >= 75
                              ? <><span style={{ color: '#00d4aa' }}>✅</span> Alignment baik</>
                              : <><span style={{ color: '#f59e0b' }}>⚠️</span> Perlu peningkatan</>
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
 
                  {/* Financial Summary */}
                  {financial && (
                    <div
                      className="rounded-2xl p-5 border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-3">Ringkasan Keuangan</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Profit Margin</p>
                          <p className="font-extrabold text-xl" style={{ color: '#00d4aa' }}>
                            {financial.profit_margin}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Return on Assets</p>
                          <p className="font-extrabold text-xl" style={{ color: '#0ea5e9' }}>
                            {financial.return_on_assets}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
 
              {/* Notifications & Recommendations */}
              {notifications.length > 0 && (
                <div
                  className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <h3 className="font-semibold text-sm mb-4">⚠️ Notifikasi &amp; Rekomendasi ESG</h3>
                  <div className="space-y-3">
                    {notifications.map((notif, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.04]"
                        style={{ background: 'rgba(245,158,11,0.04)' }}
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          {notif.type === 'critical' ? '❌' : notif.type === 'info' ? '✅' : '⚠️'}
                        </span>
                        <p className="text-sm text-slate-300 leading-snug">
                          {notif.message || notif.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
 
        {/* Bottom Action Bar */}
        {!loading && report && (
          <div
            className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-white/[0.06]"
            style={{ background: 'rgba(8,12,16,0.9)', backdropFilter: 'blur(12px)' }}
          >
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              📊 Kembali ke Dashboard
            </Link>
            <Link
              to="/upload"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              📤 Upload Laporan Baru
            </Link>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
              style={{ background: '#00d4aa', boxShadow: '0 0 20px rgba(0,212,170,0.25)' }}
            >
              📄 Download Laporan PDF
            </button>
          </div>
        )}
      </main>
    </div>
  )
}