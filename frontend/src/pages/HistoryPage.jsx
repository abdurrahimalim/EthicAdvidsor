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
  { icon: '🕒', label: 'History', path: '/history' },
]

export default function HistoryPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [activeNav, setActiveNav] = useState('History')

  useEffect(() => {
    api.get('/reports/history')
      .then(res => setReports(res.data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const getStatusColor = (status) => {
    if (status === 'processed') return '#00d4aa'
    return '#f59e0b'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#00d4aa'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2' }}>
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
              style={{
                color: activeNav === item.label ? '#00d4aa' : '#94a3b8',
                background: activeNav === item.label ? 'rgba(0,212,170,0.08)' : 'transparent'
              }}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-16 md:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-base md:text-lg">History Laporan</h1>
            <p className="text-slate-500 text-xs mt-0.5">{reports.length} laporan tersimpan</p>
          </div>
          <Link to="/upload"
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-black"
            style={{ background: '#00d4aa' }}>
            📤 Upload Baru
          </Link>
        </header>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-4">🕒</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada laporan</h3>
              <p className="text-slate-400 text-sm mb-6">Upload laporan pertama sayang untuk melihat history</p>
              <Link to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black"
                style={{ background: '#00d4aa' }}>
                📤 Upload Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <div key={report.id}
                  className="rounded-2xl border border-white/[0.06] overflow-hidden transition-all hover:border-white/10"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* ESG Score Badge */}
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                        style={{
                          background: `${getScoreColor(report.esg_score?.overall_score ?? 0)}15`,
                          borderColor: `${getScoreColor(report.esg_score?.overall_score ?? 0)}30`
                        }}>
                        <span className="font-extrabold text-sm"
                          style={{ color: getScoreColor(report.esg_score?.overall_score ?? 0) }}>
                          {report.esg_score?.overall_score ?? '-'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{report.company_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tahun {report.year} · {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                            style={{
                              color: getStatusColor(report.status),
                              background: `${getStatusColor(report.status)}15`
                            }}>
                            {report.status}
                          </span>
                          <span className="text-xs text-slate-500">
                            Emisi: {report.esg_score?.carbon_emission ?? '-'} ton
                          </span>
                          <span className="text-xs text-slate-500">
                            OJK: {report.esg_score?.ojk_score ?? '-'}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <button
                        onClick={() => setSelected(selected?.id === report.id ? null : report)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-slate-300 transition-all">
                        {selected?.id === report.id ? 'Tutup' : 'Detail'}
                      </button>
                    </div>
                  </div>

                  {/* Detail Panel */}
                  {selected?.id === report.id && (
                    <div className="border-t border-white/[0.06] p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: 'Environmental', value: report.esg_score?.environmental_score, color: '#22c55e' },
                          { label: 'Social', value: report.esg_score?.social_score, color: '#0ea5e9' },
                          { label: 'Governance', value: report.esg_score?.governance_score, color: '#a78bfa' },
                          { label: 'Overall ESG', value: report.esg_score?.overall_score, color: '#00d4aa' },
                        ].map(item => (
                          <div key={item.label} className="rounded-xl p-3 text-center border border-white/[0.06]"
                            style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="font-bold text-xl mb-0.5" style={{ color: item.color }}>{item.value ?? '-'}</div>
                            <div className="text-xs text-slate-500">{item.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Regulasi</p>
                          <div className="space-y-2">
                            {report.regulations?.map(reg => (
                              <div key={reg.id} className="flex items-center justify-between">
                                <span className="text-xs text-slate-300">{reg.name}</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                                  style={{
                                    color: reg.status === 'compliant' ? '#00d4aa' : reg.status === 'warning' ? '#f59e0b' : '#ef4444',
                                    background: reg.status === 'compliant' ? 'rgba(0,212,170,0.15)' : reg.status === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'
                                  }}>
                                  {reg.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Keuangan</p>
                          <div className="space-y-1.5">
                            {[
                              { label: 'Profit Margin', value: `${report.esg_score?.profit_margin ?? '-'}%` },
                              { label: 'Return on Assets', value: `${report.esg_score?.return_on_assets ?? '-'}%` },
                              { label: 'Carbon Emission', value: `${report.esg_score?.carbon_emission ?? '-'} ton` },
                            ].map(item => (
                              <div key={item.label} className="flex justify-between">
                                <span className="text-xs text-slate-400">{item.label}</span>
                                <span className="text-xs font-semibold text-white">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to="/result"
                          className="flex-1 py-2 rounded-xl text-center text-xs font-semibold text-black"
                          style={{ background: '#00d4aa' }}>
                          Lihat Hasil Lengkap
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}