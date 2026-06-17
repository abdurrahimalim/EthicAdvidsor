import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'

const FINTECH_TYPES = [
  'P2P Lending', 'Payment Gateway', 'E-Wallet', 'Digital Bank',
  'Crowdfunding', 'InsurTech', 'Lending Platform', 'InvestTech', 'Lainnya'
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [editingAccount, setEditingAccount] = useState(false)
  const [editingCompany, setEditingCompany] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [accountForm, setAccountForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  })

  const [companyForm, setCompanyForm] = useState({
    company_name: user?.company_name ?? '',
    company_type: user?.company_type ?? '',
    location: user?.location ?? '',
  })

  const handleUpdateAccount = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.put('/profile', { ...accountForm, ...companyForm })
      setSuccess('Profil berhasil diperbarui!')
      setEditingAccount(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memperbarui profil')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCompany = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.put('/profile', { ...accountForm, ...companyForm })
      setSuccess('Data perusahaan berhasil diperbarui!')
      setEditingCompany(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memperbarui data perusahaan')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      await api.delete('/account')
      navigate('/login')
    } catch {
      setError('Gagal menghapus akun')
      setDeleteModal(false)
    } finally {
      setLoading(false)
    }
  }

  const isFintech = user?.user_type === 'perusahaan_fintech'

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2' }}>
      <Sidebar />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '240px' }}>

        {/* SECTION 1: HEADER */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.9)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-base md:text-lg">Profile</h1>
            <p className="text-slate-500 text-xs mt-0.5">Kelola informasi akun dan perusahaan Anda.</p>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">

          {success && (
            <div className="p-3 rounded-xl text-sm text-green-400 border border-green-500/30"
              style={{ background: 'rgba(34,197,94,0.1)' }}>✅ {success}</div>
          )}
          {error && (
            <div className="p-3 rounded-xl text-sm text-red-400 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.1)' }}>❌ {error}</div>
          )}

          {/* Desktop: 2 kolom / Mobile: 1 kolom */}
          <div className={`grid gap-5 ${isFintech ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-xl'}`}>

            {/* SECTION 2: INFORMASI AKUN */}
            <div className="rounded-2xl p-5 border border-white/[0.06]"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-sm">👤 Informasi Akun</h3>
                {!editingAccount && (
                  <button onClick={() => setEditingAccount(true)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-slate-300 transition-all">
                    Edit Profil
                  </button>
                )}
              </div>

              {!editingAccount ? (
                <div className="space-y-3">
                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold flex-shrink-0"
                      style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa', border: '2px solid rgba(0,212,170,0.3)' }}>
                      {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <p className="font-extrabold text-lg text-white">{user?.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(0,212,170,0.15)', color: '#00d4aa' }}>
                        {isFintech ? '🏢 Perusahaan FinTech' : user?.role === 'admin' ? '🛡️ Admin' : '🔍 Auditor'}
                      </span>
                    </div>
                  </div>
                  {[
                    { label: 'Username', value: user?.name },
                    { label: 'Email', value: user?.email },
                    { label: 'Role', value: isFintech ? 'Perusahaan FinTech' : user?.role === 'admin' ? 'Admin' : 'Auditor' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm text-white font-medium">{item.value ?? '-'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateAccount} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
                    <input value={accountForm.name} onChange={e => setAccountForm(p => ({ ...p, name: e.target.value }))} required
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-teal-500/50"
                      style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                    <input type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} required
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-teal-500/50"
                      style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
                      style={{ background: '#00d4aa' }}>
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button type="button" onClick={() => setEditingAccount(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10">
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* SECTION 3: INFORMASI PERUSAHAAN — hanya untuk fintech */}
            {isFintech && (
              <div className="rounded-2xl p-5 border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-sm">🏢 Informasi Perusahaan</h3>
                  {!editingCompany && (
                    <button onClick={() => setEditingCompany(true)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-slate-300 transition-all">
                      Edit Data Perusahaan
                    </button>
                  )}
                </div>

                {!editingCompany ? (
                  <div className="space-y-3">
                    {[
                      { label: 'Nama Perusahaan', value: user?.company_name ?? '-' },
                      { label: 'Jenis FinTech', value: user?.company_type ?? '-' },
                      { label: 'Lokasi', value: user?.location ?? '-' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</span>
                        <span className="text-sm text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleUpdateCompany} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Nama Perusahaan</label>
                      <input value={companyForm.company_name} onChange={e => setCompanyForm(p => ({ ...p, company_name: e.target.value }))}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-teal-500/50"
                        style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Jenis FinTech</label>
                      <select value={companyForm.company_type} onChange={e => setCompanyForm(p => ({ ...p, company_type: e.target.value }))}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-teal-500/50"
                        style={{ background: '#0f1419' }}>
                        <option value="">Pilih jenis</option>
                        {FINTECH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Lokasi</label>
                      <input value={companyForm.location} onChange={e => setCompanyForm(p => ({ ...p, location: e.target.value }))}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-teal-500/50"
                        style={{ background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
                        style={{ background: '#00d4aa' }}>
                        {loading ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button type="button" onClick={() => setEditingCompany(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10">
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* SECTION 4: AKSI AKUN */}
          <div className="rounded-2xl p-5 border border-white/[0.06]"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="font-semibold text-sm mb-4">🚪 Aksi Akun</h3>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 hover:text-white transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout dari Akun
            </button>
          </div>

          {/* SECTION 5: DANGER ZONE */}
          <div className="rounded-2xl p-5 border border-red-500/20"
            style={{ background: 'rgba(239,68,68,0.05)' }}>
            <h3 className="font-semibold text-sm text-red-400 mb-2">⚠️ Danger Zone</h3>
            <p className="text-xs text-slate-400 mb-4">
              Menghapus akun akan menghapus seluruh data akun termasuk semua laporan dan tidak dapat dibatalkan.
            </p>
            <button onClick={() => setDeleteModal(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all">
              🗑️ Hapus Akun
            </button>
          </div>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm border border-red-500/20"
            style={{ background: '#0f1419' }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-extrabold text-lg text-white mb-2">Hapus Akun?</h3>
              <p className="text-sm text-slate-400">
                Apakah Anda yakin ingin menghapus akun ini? Seluruh data akun dan laporan akan terhapus permanen dan tidak dapat dikembalikan.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 transition-all">
                Batal
              </button>
              <button onClick={handleDeleteAccount} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#ef4444' }}>
                {loading ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}