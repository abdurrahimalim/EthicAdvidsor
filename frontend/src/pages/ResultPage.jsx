import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '📤', label: 'Upload Report', path: '/upload' },
  { icon: '🌿', label: 'ESG Report', path: '/esg-report' },
  { icon: '⚖️', label: 'OJK Status', path: '/ojk-status' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '📄', label: 'SDG Reports', path: '/result' },
]

export default function ResultPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('SDG Reports')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/report')
      .then(res => setReport(res.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [])

  const esg = report?.esg_score
  const regs = report?.regulations || []

  const getStatusColor = (status) => {
    if (status === 'compliant') return '#00d4aa'
    if (status === 'warning') return '#f59e0b'
    return '#ef4444'
  }

  const getStatusIcon = (status) => {
    if (status === 'compliant') return '✅'
    if (status === 'warning') return '⚠️'
    return '❌'
  }

  const handlePrint = () => window.print()

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
          <div>
            <h1 className="font-extrabold text-base md:text-lg">Hasil Analisis</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {report ? `${report.company_name} · Tahun ${report.year}` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/upload" className="text-xs px-3 py-2 rounded-xl text-slate-400 border border-white/10 hover:border-white/20 transition-all">
              ← Upload Ulang
            </Link>
            <button onClick={handlePrint}
              className="text-xs px-3 py-2 rounded-xl font-semibold text-black transition-all hover:opacity-90"
              style={{ background: '#00d4aa' }}>
              📄 Export PDF
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : !report ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-4">📊</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada laporan</h3>
              <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black mt-4"
                style={{ background: '#00d4aa' }}>
                📤 Upload Report Sekarang
              </Link>
            </div>
          ) : (
            <>
              {/* Overall ESG Score */}
              <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="font-semibold text-sm mb-4">Overall ESG Score</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div>
                    <div className="font-extrabold text-5xl mb-1" style={{ color: '#f59e0b' }}>{esg?.overall_score}</div>
                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                      {esg?.overall_score >= 80 ? 'BAIK' : esg?.overall_score >= 60 ? 'CUKUP' : 'PERLU PERBAIKAN'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                    {[
                      { label: 'Environmental', value: esg?.environmental_score, color: '#22c55e' },
                      { label: 'Social', value: esg?.social_score, color: '#0ea5e9' },
                      { label: 'Governance', value: esg?.governance_score, color: '#a78bfa' },
                      { label: 'OJK Score', value: `${esg?.ojk_score}%`, color: '#00d4aa' },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl p-3 text-center border border-white/[0.06]"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="font-bold text-xl" style={{ color: item.color }}>{item.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Regulasi + SDG */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">⚖️ Status Kepatuhan Regulasi</h3>
                  <div className="space-y-3">
                    {regs.map(reg => (
                      <div key={reg.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-2">
                          <span>{getStatusIcon(reg.status)}</span>
                          <div>
                            <p className="text-sm font-medium">{reg.name}</p>
                            <div className="h-1 rounded-full mt-1 bg-white/5 w-24">
                              <div className="h-full rounded-full" style={{ width: `${reg.score}%`, background: getStatusColor(reg.status) }} />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize flex-shrink-0"
                          style={{ color: getStatusColor(reg.status), background: `${getStatusColor(reg.status)}15`, border: `1px solid ${getStatusColor(reg.status)}30` }}>
                          {reg.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">🌍 SDG 12 & 16 Alignment</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'SDG 12 — Konsumsi & Produksi Berkelanjutan', pct: Math.min(100, (esg?.environmental_score ?? 0) + 10), color: '#22c55e' },
                      { label: 'SDG 16 — Tata Kelola yang Baik', pct: esg?.governance_score ?? 0, color: '#0ea5e9' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs text-slate-300">{item.label}</span>
                          <span className="text-xs font-bold" style={{ color: item.color }}>{item.pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Profit Margin', value: `${esg?.profit_margin ?? 0}%` },
                      { label: 'Return on Assets', value: `${esg?.return_on_assets ?? 0}%` },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-xs text-slate-500">{item.label}</p>
                        <p className="font-bold text-lg" style={{ color: '#00d4aa' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/dashboard" className="flex-1 py-3 rounded-xl text-center text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 transition-all">
                  🏠 Kembali ke Dashboard
                </Link>
                <Link to="/upload" className="flex-1 py-3 rounded-xl text-center text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 transition-all">
                  📤 Upload Laporan Baru
                </Link>
                <button onClick={handlePrint}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
                  style={{ background: '#00d4aa' }}>
                  📄 Download Laporan PDF
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}