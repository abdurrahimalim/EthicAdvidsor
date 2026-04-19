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

export default function ESGReportPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('ESG Report')
  const [activeTab, setActiveTab] = useState('environmental')

  useEffect(() => {
    api.get('/report')
      .then(res => setReport(res.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [])

  const esg = report?.esg_score

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
            <h1 className="font-extrabold text-base md:text-lg">ESG Report</h1>
            <p className="text-slate-500 text-xs mt-0.5">Environmental · Social · Governance</p>
          </div>
          <Link to="/upload" className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-black"
            style={{ background: '#00d4aa' }}>
            📤 <span className="hidden sm:inline">Upload Baru</span>
          </Link>
        </header>

        <div className="p-4 md:p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20"><p className="text-slate-400">Loading...</p></div>
          ) : !report ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-4">🌿</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada data ESG</h3>
              <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black mt-4"
                style={{ background: '#00d4aa' }}>Upload Report Sekarang</Link>
            </div>
          ) : (
            <>
              {/* Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Environmental Score', value: esg?.environmental_score, sub: `Emisi: ${esg?.carbon_emission} ton CO₂`, color: '#22c55e', icon: '🌱' },
                  { label: 'Social Score', value: esg?.social_score, sub: 'Program sosial aktif', color: '#0ea5e9', icon: '👥' },
                  { label: 'Governance Score', value: esg?.governance_score, sub: 'Tata kelola perusahaan', color: '#a78bfa', icon: '🏛️' },
                ].map(card => (
                  <div key={card.label} className="rounded-2xl p-4 md:p-5 border border-white/[0.06] relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-xl"
                      style={{ background: card.color, transform: 'translate(30%,-30%)' }} />
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-slate-400 text-xs md:text-sm">{card.label}</span>
                      <span className="text-xl">{card.icon}</span>
                    </div>
                    <div className="font-extrabold text-3xl mb-1" style={{ color: card.color }}>{card.value}</div>
                    <p className="text-xs text-slate-500">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex border-b border-white/[0.06] overflow-x-auto">
                  {[
                    { id: 'environmental', label: '🌱 Environmental' },
                    { id: 'social', label: '👥 Social' },
                    { id: 'governance', label: '🏛️ Governance' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className="flex-1 py-3 text-xs md:text-sm font-medium transition-all whitespace-nowrap px-2"
                      style={{
                        color: activeTab === tab.id ? '#00d4aa' : '#64748b',
                        borderBottom: activeTab === tab.id ? '2px solid #00d4aa' : '2px solid transparent',
                        background: activeTab === tab.id ? 'rgba(0,212,170,0.05)' : 'transparent'
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="p-4 md:p-5">
                  {activeTab === 'environmental' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Emisi Karbon</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <p className="text-xs text-slate-500">Total Emisi</p>
                          <p className="font-bold text-lg text-green-400">{esg?.carbon_emission} ton</p>
                          <p className="text-xs text-green-400">{esg?.carbon_emission <= 600 ? '✅ Di bawah threshold 600 ton' : '❌ Melebihi threshold 600 ton'}</p>
                        </div>
                        <div className="p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <p className="text-xs text-slate-500">Environmental Score</p>
                          <p className="font-bold text-lg text-green-400">{esg?.environmental_score}</p>
                          <p className="text-xs text-green-400">dari skala 100</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'social' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Social Score</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <p className="text-xs text-slate-500">Social Score</p>
                          <p className="font-bold text-lg text-blue-400">{esg?.social_score}</p>
                          <p className="text-xs text-blue-400">{esg?.social_score >= 60 ? '✅ Di atas threshold 60' : '⚠️ Di bawah threshold 60'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'governance' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Governance Score</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <p className="text-xs text-slate-500">Governance Score</p>
                          <p className="font-bold text-lg text-purple-400">{esg?.governance_score}</p>
                          <p className="text-xs text-purple-400">{esg?.governance_score >= 65 ? '✅ Di atas threshold 65' : '⚠️ Di bawah threshold 65'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}