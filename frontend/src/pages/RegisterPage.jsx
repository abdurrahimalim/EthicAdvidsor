import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak cocok')
      return
    }
    setLoading(true)
    try {
      await register(formData.name, formData.email, formData.password, formData.password_confirmation)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Register gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
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
          <h1 className="font-extrabold text-2xl mb-1 text-white">Create account</h1>
          <p className="text-slate-400 text-sm mb-8">Register your company for ESG compliance monitoring</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-400 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {[
              { label: 'Company Name', name: 'name', type: 'text', placeholder: 'PT. Fintech Indonesia' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'company@fintech.co.id' },
              { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Confirm Password', name: 'password_confirmation', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.name}>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">
                  {field.label}
                </label>
                <input type={field.type} name={field.name} value={formData[field.name]}
                  onChange={handleChange} required placeholder={field.placeholder}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors border border-white/10 focus:border-teal-500/50"
                  style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full font-bold py-3.5 rounded-xl mt-2 text-black transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#00d4aa', boxShadow: '0 0 24px rgba(0,212,170,0.2)' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <p className="text-center text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#00d4aa' }}>Sign In</Link>
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