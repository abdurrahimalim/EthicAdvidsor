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

export default function OJKStatusPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('OJK Status')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/report')
      .then(res => setReport(res.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [])

  const regs = report?.regulations || []
  const compliant = regs.filter(r => r.status === 'compliant').length
  const warning = regs.filter(r => r.status === 'warning').length
  const nonCompliant = regs.filter(r => r.status === 'non-compliant').length

  const getColor = (status) => {
    if (status === 'compliant') return '#00d4aa'
    if (status === 'warning') return '#f59e0b'
    return '#ef4444'
  }

  const getIcon = (status) => {
    if (status === 'compliant') return '✅'
    if (status === 'warning') return '⚠️'
    return '❌'
  }

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
            <h1 className="font-extrabold text-base md:text-lg">OJK Compliance Status</h1>
            <p className="text-slate-500 text-xs mt-0.5">Status kepatuhan regulasi OJK & Bank Indonesia</p>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20"><p className="text-slate-400">Loading...</p></div>
          ) : !report ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-4">⚖️</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada data regulasi</h3>
              <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black mt-4"
                style={{ background: '#00d4aa' }}>Upload Report Sekarang</Link>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {[
                  { label: 'Compliant', count: compliant, color: '#00d4aa', icon: '✅' },
                  { label: 'Warning', count: warning, color: '#f59e0b', icon: '⚠️' },
                  { label: 'Non-Compliant', count: nonCompliant, color: '#ef4444', icon: '❌' },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3 md:p-5 border border-white/[0.06] text-center"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-xl md:text-2xl mb-1">{item.icon}</div>
                    <div className="font-extrabold text-2xl md:text-3xl" style={{ color: item.color }}>{item.count}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Overall Progress */}
              <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm">Overall Compliance Rate</h3>
                  <span className="font-bold text-lg" style={{ color: '#00d4aa' }}>
                    {regs.length > 0 ? Math.round((compliant / regs.length) * 100) : 0}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${regs.length > 0 ? (compliant / regs.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #00d4aa, #0ea5e9)' }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">{compliant} dari {regs.length} regulasi terpenuhi</p>
              </div>

              {/* Regulation List */}
              <div className="space-y-3">
                {regs.map((reg, i) => (
                  <div key={reg.id} className="rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer transition-all hover:border-white/10"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                    onClick={() => setExpanded(expanded === i ? null : i)}>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">{getIcon(reg.status)}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{reg.name}</p>
                          <p className="text-xs text-slate-500">Score: {reg.score}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full capitalize hidden sm:block"
                          style={{ color: getColor(reg.status), background: `${getColor(reg.status)}15`, border: `1px solid ${getColor(reg.status)}30` }}>
                          {reg.status}
                        </span>
                        <span className="text-slate-500 text-sm">{expanded === i ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expanded === i && (
                      <div className="px-4 pb-4 border-t border-white/[0.06]">
                        <div className="pt-3">
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                            <div className="h-full rounded-full" style={{ width: `${reg.score}%`, background: getColor(reg.status) }} />
                          </div>
                          <p className="text-xs text-slate-400">
                            {reg.status === 'compliant' ? '✅ Regulasi ini telah terpenuhi dengan baik.' :
                              reg.status === 'warning' ? '⚠️ Perlu perhatian dan tindakan perbaikan segera.' :
                                '❌ Regulasi ini belum terpenuhi. Segera lakukan tindakan korektif.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}