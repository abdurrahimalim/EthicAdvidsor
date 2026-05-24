import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',      path: '/admin/dashboard' },
  { icon: '👥', label: 'Kelola User',    path: '/admin/users' },
  { icon: '📋', label: 'Kelola Laporan', path: '/admin/reports' },
]

// ─── Add User Modal ───────────────────────────────────────────────────────────
function AddUserModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.post('/admin/users', form)
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menambahkan user.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="rounded-2xl border border-white/[0.08] w-full max-w-md mx-4"
        style={{ background: '#0f1419' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2"><span>👤</span><h2 className="font-extrabold text-base">Tambah User</h2></div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="text-xs px-3 py-2 rounded-xl border"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}
          {[
            { label: 'Nama Perusahaan', name: 'name',     type: 'text',     placeholder: 'PT. Nama Perusahaan' },
            { label: 'Email',           name: 'email',    type: 'email',    placeholder: 'email@perusahaan.com' },
            { label: 'Password',        name: 'password', type: 'password', placeholder: 'Min. 6 karakter' },
          ].map(f => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">{f.label}</label>
              <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.08] text-slate-300 placeholder-slate-600 outline-none focus:border-white/20 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.08] text-slate-300 outline-none focus:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.03)' }}>Batal</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{ color: '#00d4aa', background: 'rgba(0,212,170,0.1)', borderColor: 'rgba(0,212,170,0.3)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail User Modal ────────────────────────────────────────────────────────
function DetailUserModal({ user, onClose, onEdit }) {
  if (!user) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="rounded-2xl border border-white/[0.08] w-full max-w-md mx-4"
        style={{ background: '#0f1419' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2"><span>👤</span><h2 className="font-extrabold text-base">Detail User</h2></div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa' }}>
              {user.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          {[
            { label: 'ID',             value: user.id },
            { label: 'Role',           value: user.role },
            { label: 'Total Laporan',  value: `${user.reports_count} laporan` },
            { label: 'Bergabung',      value: new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-white/[0.04] text-sm">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-200 font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.03)' }}>Tutup</button>
          <button onClick={onEdit}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (user) setForm({ name: user.name ?? '', email: user.email ?? '', password: '', role: user.role ?? 'user' })
  }, [user])

  if (!user) return null

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      const payload = { name: form.name, email: form.email, role: form.role }
      if (form.password) payload.password = form.password
      const res = await api.put(`/admin/users/${user.id}`, payload)
      onUpdated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menyimpan perubahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="rounded-2xl border border-white/[0.08] w-full max-w-md mx-4"
        style={{ background: '#0f1419' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2"><span>✏️</span><h2 className="font-extrabold text-base">Edit User</h2></div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="text-xs px-3 py-2 rounded-xl border"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}
          {[
            { label: 'Nama Perusahaan', name: 'name',     type: 'text',     placeholder: 'PT. Nama Perusahaan' },
            { label: 'Email',           name: 'email',    type: 'email',    placeholder: 'email@perusahaan.com' },
            { label: 'Password Baru',   name: 'password', type: 'password', placeholder: 'Kosongkan jika tidak diubah' },
          ].map(f => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">{f.label}</label>
              <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.08] text-slate-300 placeholder-slate-600 outline-none focus:border-white/20 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl text-sm border border-white/[0.08] text-slate-300 outline-none focus:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.03)' }}>Batal</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteUserModal({ user, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/admin/users/${user.id}`)
      onDeleted(user.id)
      onClose()
    } catch {
      alert('Gagal menghapus user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 border border-white/[0.08] w-full max-w-sm mx-4"
        style={{ background: '#0f1419' }} onClick={e => e.stopPropagation()}>
        <p className="text-3xl mb-3 text-center">🗑️</p>
        <h3 className="font-extrabold text-base text-center mb-2">Hapus User?</h3>
        <p className="text-slate-400 text-sm text-center mb-1">{user.name}</p>
        <p className="text-slate-600 text-xs text-center mb-6">Semua laporan miliknya juga akan terhapus.</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/[0.08] text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.03)' }}>Batal</button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [addOpen,     setAddOpen]     = useState(false)
  const [detailUser,  setDetailUser]  = useState(null)
  const [editUser,    setEditUser]    = useState(null)
  const [deleteUser,  setDeleteUser]  = useState(null)

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
          <span className="font-extrabold text-lg hidden md:block">Admin Panel</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                color:      item.path === '/admin/users' ? '#f59e0b' : '#94a3b8',
                background: item.path === '/admin/users' ? 'rgba(245,158,11,0.08)' : 'transparent',
              }}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <Link to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all mb-1">
            <span className="flex-shrink-0">🖥️</span>
            <span className="text-sm font-medium hidden md:block">User View</span>
          </Link>
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
            <h1 className="font-extrabold text-lg">Kelola User</h1>
            <p className="text-slate-500 text-xs mt-0.5">{users.length} pengguna terdaftar</p>
          </div>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{ color: '#00d4aa', background: 'rgba(0,212,170,0.08)', borderColor: 'rgba(0,212,170,0.25)' }}>
            <span>➕</span>
            <span className="hidden sm:block">Tambah User</span>
          </button>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400 text-sm">Memuat data user...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-3">👥</p>
              <p className="text-slate-400 text-sm">Belum ada user terdaftar.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['ID', 'Nama', 'Email', 'Role', 'Laporan', 'Aksi'].map(col => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.015] transition-all">
                      <td className="px-4 py-4 text-sm text-slate-500 font-mono">{user.id}</td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-200">{user.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-400">{user.email}</td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            color:      user.role === 'admin' ? '#f59e0b' : '#00d4aa',
                            background: user.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'rgba(0,212,170,0.12)',
                          }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">{user.reports_count} laporan</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDetailUser(user)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-all whitespace-nowrap"
                            style={{ background: 'rgba(255,255,255,0.03)' }}>
                            Detail
                          </button>
                          <button onClick={() => setEditUser(user)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap"
                            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}>
                            Edit
                          </button>
                          {user.role !== 'admin' && (
                            <button onClick={() => setDeleteUser(user)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap"
                              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {addOpen    && <AddUserModal    onClose={() => setAddOpen(false)}   onCreated={u => setUsers(p => [u, ...p])} />}
      <DetailUserModal user={detailUser} onClose={() => setDetailUser(null)} onEdit={() => { setEditUser(detailUser); setDetailUser(null) }} />
      <EditUserModal   user={editUser}   onClose={() => setEditUser(null)}
        onUpdated={u => setUsers(p => p.map(x => x.id === u.id ? u : x))} />
      <DeleteUserModal user={deleteUser} onClose={() => setDeleteUser(null)}
        onDeleted={id => setUsers(p => p.filter(x => x.id !== id))} />
    </div>
  )
}