import { useState } from 'react'
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

export default function UploadPage() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('Upload Report')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    company_name: '', year: '2024',
    carbon_emission: '', social_score: '', governance_score: '',
    revenue: '', net_profit: '', total_assets: '',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/reports', {
        ...form,
        year: parseInt(form.year),
        carbon_emission: parseFloat(form.carbon_emission),
        social_score: parseFloat(form.social_score),
        governance_score: parseFloat(form.governance_score),
        revenue: parseFloat(form.revenue),
        net_profit: parseFloat(form.net_profit),
        total_assets: parseFloat(form.total_assets),
      })
      navigate('/result')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses laporan')
    } finally {
      setLoading(false)
    }
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
              style={{ color: activeNav === item.label ? '#00d4aa' : '#94a3b8', background: activeNav === item.label ? 'rgba(0,212,170,0.08)' : 'transparent' }}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-white transition-all">
            <span>🔙</span>
            <span className="text-sm font-medium hidden md:block">Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-16 md:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-base md:text-lg">Upload Report</h1>
            <p className="text-slate-500 text-xs mt-0.5">Input data ESG & keuangan perusahaan</p>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.1)' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Informasi Perusahaan */}
            <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="font-semibold text-sm mb-4">🏢 Informasi Perusahaan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Nama Perusahaan</label>
                  <input name="company_name" value={form.company_name} onChange={handleChange} required
                    placeholder="PT. Contoh FinTech Indonesia"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Tahun Laporan</label>
                  <select name="year" value={form.year} onChange={handleChange}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
                    style={{ background: '#0f1419' }}>
                    {[2024, 2023, 2022, 2021].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Data ESG */}
            <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="font-semibold text-sm mb-1">🌿 Data ESG</h3>
              <p className="text-xs text-slate-500 mb-4">Environmental, Social & Governance indicators</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: 'carbon_emission', label: 'Emisi Karbon (ton CO₂)', placeholder: 'contoh: 450', hint: 'Threshold: < 600 ton' },
                  { name: 'social_score', label: 'Social Score (0-100)', placeholder: 'contoh: 75', hint: 'Threshold: > 60 poin' },
                  { name: 'governance_score', label: 'Governance Score (0-100)', placeholder: 'contoh: 80', hint: 'Threshold: > 65 poin' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">{field.label}</label>
                    <input type="number" name={field.name} value={form[field.name]} onChange={handleChange} required
                      placeholder={field.placeholder}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <p className="text-xs text-slate-500 mt-1">{field.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Keuangan */}
            <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="font-semibold text-sm mb-1">💰 Data Keuangan</h3>
              <p className="text-xs text-slate-500 mb-4">Dalam jutaan rupiah (Rp juta)</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: 'revenue', label: 'Total Pendapatan', placeholder: 'contoh: 50000' },
                  { name: 'net_profit', label: 'Laba Bersih', placeholder: 'contoh: 8000' },
                  { name: 'total_assets', label: 'Total Aset', placeholder: 'contoh: 150000' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">{field.label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Rp</span>
                      <input type="number" name={field.name} value={form[field.name]} onChange={handleChange} required
                        placeholder={field.placeholder}
                        className="w-full rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full font-bold py-4 rounded-xl text-black transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#00d4aa', boxShadow: '0 0 24px rgba(0,212,170,0.2)' }}>
              {loading ? 'Memproses...' : '🚀 Proses Laporan'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}