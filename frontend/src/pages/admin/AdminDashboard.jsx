import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, reports: 0, notifications: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/users').catch(() => ({ data: [] })),
      api.get('/admin/reports').catch(() => ({ data: [] })),
    ]).then(([users, reports]) => {
      setStats({
        users: users.data?.length || 0,
        reports: reports.data?.length || 0,
      })
    }).finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2' }}>
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
          <span className="font-extrabold text-lg hidden md:block">Admin Panel</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {[
            { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
            { icon: '👥', label: 'Kelola User', path: '/admin/users' },
            { icon: '📋', label: 'Kelola Laporan', path: '/admin/reports' },
          ].map(item => (
            <Link key={item.label} to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-white/5">
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-red-400 transition-all">
            <span>🚪</span>
            <span className="text-sm font-medium hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-16 md:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-base md:text-lg">Admin Dashboard</h1>
            <p className="text-slate-500 text-xs mt-0.5">Manajemen sistem EthicAdvidsor</p>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Total User', value: stats.users, color: '#00d4aa', icon: '👥', desc: 'Pengguna terdaftar' },
              { label: 'Total Laporan', value: stats.reports, color: '#0ea5e9', icon: '📋', desc: 'Laporan diproses' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-xl"
                  style={{ background: item.color, transform: 'translate(30%,-30%)' }} />
                <div className="flex justify-between items-start mb-3">
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="font-extrabold text-4xl mb-1" style={{ color: item.color }}>
                  {loading ? '...' : item.value}
                </div>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '👥', label: 'Kelola User', desc: 'Lihat dan hapus user', path: '/admin/users', color: '#00d4aa' },
                { icon: '📋', label: 'Kelola Laporan', desc: 'Lihat semua laporan', path: '/admin/reports', color: '#0ea5e9' },
              ].map(action => (
                <Link key={action.label} to={action.path}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] hover:border-white/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs text-slate-400">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}