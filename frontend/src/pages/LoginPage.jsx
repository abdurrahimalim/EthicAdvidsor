import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#080c10' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 40%, rgba(0,212,170,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 70% 60%, rgba(14,165,233,0.06) 0%, transparent 60%)
          `
        }} />
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-10 font-extrabold text-xl text-white">
          <div className="w-2 h-2 rounded-full" style={{ background: '#00d4aa', boxShadow: '0 0 12px #00d4aa' }} />
          EthicAdvidsor
        </Link>
        <div className="rounded-2xl p-10 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h1 className="font-extrabold text-2xl mb-1 text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to your compliance dashboard</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="company@fintech.co.id"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors border border-white/10 focus:border-teal-500/50"
                style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors border border-white/10 focus:border-teal-500/50"
                style={{ background: 'rgba(255,255,255,0.05)' }} />
              <Link to="/forgot-password" className="text-xs mt-1 block" style={{ color: '#00d4aa' }}>
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full font-bold py-3.5 rounded-xl mt-2 text-black transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#00d4aa', boxShadow: '0 0 24px rgba(0,212,170,0.2)' }}>
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
            <p className="text-sm text-slate-400 text-center">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#00d4aa' }}>Register</Link>
            </p>
          </form>
        </div>
        <p className="text-center mt-6 text-slate-500 text-sm">
          <Link to="/" style={{ color: '#00d4aa' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}