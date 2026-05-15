import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
 
const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: '👥', label: 'Kelola User', path: '/admin/users' },
  { icon: '📋', label: 'Kelola Laporan', path: '/admin/reports' },
]
 
function statusStyle(status) {
  const s = status?.toLowerCase()
  if (s === 'processed')
    return { color: '#00d4aa', bg: 'rgba(0,212,170,0.1)', border: 'rgba(0,212,170,0.25)', label: 'Processed' }
  if (s === 'pending')
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Pending' }
  if (s === 'failed')
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Failed' }
  return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)', label: status ?? '-' }
}
 
export default function AdminReports() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
 
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [confirming, setConfirming] = useState(false)
 
  useEffect(() => {
    api.get('/admin/reports')
      .then(res => setReports(res.data.data || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])
 
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
 
  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/reports/${id}`)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteId(null)
      setConfirming(false)
    }
  }
 
  const filtered = reports.filter(r => {
    const q = search.toLowerCase()
    return (
      r.company_name?.toLowerCase().includes(q) ||
      r.user?.name?.toLowerCase().includes(q) ||
      String(r.year).includes(q)
    )
  })
 
  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}>
 
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
          <span className="font-extrabold text-lg hidden md:block">Admin Panel</span>
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
                  color: isActive ? '#f59e0b' : '#94a3b8',
                  background: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
                }}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium hidden md:block">{item.label}</span>
              </Link>
            )
          })}
        </nav>
 
        <div className="p-3 border-t border-white/[0.06]">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all mb-1"
          >
            <span className="flex-shrink-0">🖥️</span>
            <span className="text-sm font-medium hidden md:block">User View</span>
          </Link>
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
          className="sticky top-0 z-30 px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}
        >
          {/* Top row: title + badge */}
          <div className="flex items-center gap-3 mb-3">
            <h1 className="font-extrabold text-lg">Kelola Laporan</h1>
            {!loading && (
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}
              >
                {filtered.length} laporan masuk
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mb-3">Manajemen laporan ESG pengguna</p>
 
          {/* Search bar — full width di bawah title */}
          <div className="relative max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Cari perusahaan atau user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-white/[0.08] text-slate-300 placeholder-slate-600 outline-none focus:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          </div>
        </header>
 
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400 text-sm">Memuat data laporan...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-2xl p-10 border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <p className="text-4xl mb-3">📋</p>
              <p className="text-slate-400 text-sm">
                {search ? 'Tidak ada laporan yang cocok.' : 'Belum ada laporan masuk.'}
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-white/[0.06] overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['ID', 'Perusahaan', 'Tahun', 'User', 'ESG Score', 'Status', 'Aksi'].map(col => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map(report => {
                    const s = statusStyle(report.status)
                    const score = report.esg_score?.overall_score ?? report.overall_score ?? '-'
                    const scoreNum = parseFloat(score)
                    const scoreColor = scoreNum >= 70 ? '#00d4aa' : scoreNum >= 50 ? '#f59e0b' : '#ef4444'
 
                    return (
                      <tr key={report.id} className="hover:bg-white/[0.015] transition-all">
                        {/* ID */}
                        <td className="px-4 py-4 text-sm text-slate-500 font-mono">{report.id}</td>
 
                        {/* Perusahaan */}
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-200">{report.company_name}</p>
                          {report.industry && (
                            <p className="text-xs text-slate-500 mt-0.5">{report.industry}</p>
                          )}
                        </td>
 
                        {/* Tahun */}
                        <td className="px-4 py-4 text-sm text-slate-300">{report.year}</td>
 
                        {/* User */}
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-300">{report.user?.name ?? report.user_name ?? '-'}</p>
                          {report.user?.email && (
                            <p className="text-xs text-slate-500 mt-0.5">{report.user.email}</p>
                          )}
                        </td>
 
                        {/* ESG Score */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-extrabold" style={{ color: scoreColor }}>
                            {score}
                          </span>
                        </td>
 
                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                          >
                            {s.label}
                          </span>
                        </td>
 
                        {/* Aksi */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/reports/${report.id}`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
                              style={{ background: 'rgba(255,255,255,0.03)' }}
                            >
                              Detail
                            </Link>
                            <Link
                              to={`/admin/reports/${report.id}/edit`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap"
                              style={{
                                color: '#f59e0b',
                                background: 'rgba(245,158,11,0.08)',
                                borderColor: 'rgba(245,158,11,0.25)',
                              }}
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => { setDeleteId(report.id); setConfirming(true) }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap"
                              style={{
                                color: '#ef4444',
                                background: 'rgba(239,68,68,0.08)',
                                borderColor: 'rgba(239,68,68,0.25)',
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
 
      {/* Delete Confirmation Modal */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="rounded-2xl p-6 border border-white/[0.08] w-full max-w-sm mx-4"
            style={{ background: '#0f1419' }}
          >
            <p className="text-3xl mb-3 text-center">🗑️</p>
            <h3 className="font-extrabold text-base text-center mb-2">Hapus Laporan?</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirming(false); setDeleteId(null) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}