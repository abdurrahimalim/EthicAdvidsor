import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus user "${name}"? Semua laporan miliknya juga akan terhapus.`)) return
    setDeleting(id)
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (e) {
      alert('Gagal menghapus user')
    } finally {
      setDeleting(null)
    }
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                color: item.path === '/admin/users' ? '#f59e0b' : '#94a3b8',
                background: item.path === '/admin/users' ? 'rgba(245,158,11,0.08)' : 'transparent'
              }}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white transition-all">
            <span>🔙</span>
            <span className="text-sm font-medium hidden md:block">User View</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-16 md:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-base md:text-lg">Kelola User</h1>
            <p className="text-slate-500 text-xs mt-0.5">{users.length} pengguna terdaftar</p>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-4">👥</p>
              <h3 className="font-semibold text-lg">Belum ada user</h3>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['ID', 'Nama', 'Email', 'Role', 'Laporan', 'Aksi'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-slate-400 text-xs">{user.id}</td>
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-slate-400">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded-full font-semibold"
                            style={{
                              color: user.role === 'admin' ? '#f59e0b' : '#00d4aa',
                              background: user.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(0,212,170,0.15)'
                            }}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{user.reports_count} laporan</td>
                        <td className="py-3 px-4">
                          {user.role !== 'admin' && (
                            <button onClick={() => handleDelete(user.id, user.name)}
                              disabled={deleting === user.id}
                              className="text-xs px-3 py-1.5 rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all disabled:opacity-50">
                              {deleting === user.id ? 'Menghapus...' : 'Hapus'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {users.map(user => (
                  <div key={user.id} className="rounded-2xl p-4 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{
                          color: user.role === 'admin' ? '#f59e0b' : '#00d4aa',
                          background: user.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(0,212,170,0.15)'
                        }}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">{user.reports_count} laporan</p>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDelete(user.id, user.name)}
                          disabled={deleting === user.id}
                          className="text-xs px-3 py-1.5 rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all disabled:opacity-50">
                          {deleting === user.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      )}
                    </div>
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