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

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('Dashboard')

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const esg = data?.report?.esg_score
  const report = data?.report
  const notifications = data?.notifications || []
  const regulations = data?.report?.regulations || []

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
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
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-lg">Compliance Dashboard</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {report ? `${report.company_name} · ${report.year}` : 'Belum ada laporan'}
            </p>
          </div>
          <Link to="/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
            style={{ background: '#00d4aa', boxShadow: '0 0 20px rgba(0,212,170,0.25)' }}>
            <span>📤</span>
            <span className="hidden sm:block">Upload Report</span>
          </Link>
        </header>

        <div className="p-6 space-y-6">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : !report ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-4">📊</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada laporan</h3>
              <p className="text-slate-400 text-sm mb-6">Upload laporan ESG pertama sayang untuk melihat dashboard</p>
              <Link to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black"
                style={{ background: '#00d4aa' }}>
                📤 Upload Report Sekarang
              </Link>
            </div>
          ) : (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'ESG Score', value: esg?.overall_score ?? '-', sub: `Environmental: ${esg?.environmental_score ?? '-'}`, color: '#00d4aa', icon: '🌿' },
                  { label: 'OJK Compliance', value: `${esg?.ojk_score ?? '-'}%`, sub: 'Status kepatuhan OJK', color: '#22c55e', icon: '⚖️' },
                  { label: 'Carbon Emission', value: `${esg?.carbon_emission ?? '-'}t`, sub: 'Emisi karbon CO₂', color: '#f59e0b', icon: '🌍' },
                ].map(kpi => (
                  <div key={kpi.label} className="rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
                      style={{ background: kpi.color, transform: 'translate(30%,-30%)' }} />
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-slate-400 text-sm">{kpi.label}</span>
                      <span className="text-xl">{kpi.icon}</span>
                    </div>
                    <div className="font-extrabold text-3xl mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
                    <div className="text-xs font-medium text-slate-400">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Regulation + Notifications */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">Regulation Status</h3>
                  <div className="space-y-3">
                    {regulations.map(reg => {
                      const color = reg.status === 'compliant' ? '#00d4aa' : reg.status === 'warning' ? '#f59e0b' : '#ef4444'
                      return (
                        <div key={reg.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                          <span className="text-sm text-slate-300">{reg.name}</span>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize"
                            style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
                            {reg.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Ethics & ESG Notifications</h3>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                      {notifications.filter(n => !n.is_read).length} alerts
                    </span>
                  </div>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 text-sm">Tidak ada notifikasi</p>
                    ) : notifications.map(notif => (
                      <div key={notif.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.04]"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <span className="text-lg flex-shrink-0 mt-0.5">
                          {notif.type === 'warning' ? '⚠️' : notif.type === 'ok' ? '✅' : '❌'}
                        </span>
                        <p className="text-sm text-slate-300 leading-snug">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compliance Progress */}
              <div className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="font-semibold text-sm mb-4">Compliance Overview</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Environmental Score', pct: esg?.environmental_score ?? 0, color: '#22c55e' },
                    { name: 'Social Score', pct: esg?.social_score ?? 0, color: '#0ea5e9' },
                    { name: 'Governance Score', pct: esg?.governance_score ?? 0, color: '#a78bfa' },
                    { name: 'Overall ESG Score', pct: esg?.overall_score ?? 0, color: '#00d4aa' },
                  ].map(item => (
                    <div key={item.name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-slate-300">{item.name}</span>
                        <span className="text-sm font-bold" style={{ color: item.color }}>{item.pct}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${item.pct}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: '📤', label: 'Upload Report', path: '/upload', color: '#00d4aa' },
                    { icon: '📊', label: 'View Results', path: '/result', color: '#0ea5e9' },
                    { icon: '🌿', label: 'ESG Report', path: '/esg-report', color: '#22c55e' },
                    { icon: '⚖️', label: 'OJK Status', path: '/ojk-status', color: '#f59e0b' },
                  ].map(action => (
                    <Link key={action.label} to={action.path}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.06] hover:border-white/20 transition-all hover:-translate-y-0.5 text-center"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <span className="text-2xl">{action.icon}</span>
                      <span className="text-xs font-medium text-slate-400">{action.label}</span>
                    </Link>
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