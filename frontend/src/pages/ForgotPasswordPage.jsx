import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#080c10' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,212,170,0.07) 0%, transparent 60%)' }} />
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10 font-extrabold text-xl text-white">
          <div className="w-2 h-2 rounded-full" style={{ background: '#00d4aa', boxShadow: '0 0 12px #00d4aa' }} />
          EthicAdvidsor
        </Link>
        <div className="rounded-2xl p-8 md:p-10 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {!sent ? (
            <>
              <h1 className="font-extrabold text-2xl mb-1 text-white">Forgot Password</h1>
              <p className="text-slate-400 text-sm mb-8">Masukkan email untuk reset password</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="company@fintech.co.id"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <button type="submit"
                  className="w-full font-bold py-3.5 rounded-xl mt-2 text-black transition-all hover:opacity-90"
                  style={{ background: '#00d4aa' }}>
                  Kirim Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-extrabold text-xl mb-2 text-white">Email Terkirim!</h2>
              <p className="text-slate-400 text-sm mb-6">Cek inbox email <span style={{ color: '#00d4aa' }}>{email}</span> untuk instruksi reset password.</p>
              <Link to="/login" className="inline-block font-bold py-3 px-8 rounded-xl text-black transition-all hover:opacity-90"
                style={{ background: '#00d4aa' }}>
                Kembali ke Login
              </Link>
            </div>
          )}
        </div>
        <p className="text-center mt-6 text-slate-500 text-sm">
          <Link to="/login" style={{ color: '#00d4aa' }}>← Kembali ke Login</Link>
        </p>
      </div>
    </div>
  )
}