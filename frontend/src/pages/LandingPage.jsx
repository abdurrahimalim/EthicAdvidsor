import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080c10', color: '#e8edf2' }}>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-5 border-b border-white/[0.06]"
        style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="flex items-center gap-2 font-extrabold text-lg">
          <div className="w-2 h-2 rounded-full" style={{ background: '#00d4aa', boxShadow: '0 0 12px #00d4aa' }} />
          EthicAdvidsor
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it Works</a>
          <a href="#compliance" className="hover:text-white transition-colors">Compliance</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2">
            Sign In
          </Link>
          <Link to="/register"
            className="text-sm font-semibold px-4 py-2 rounded-xl text-black transition-all hover:opacity-90"
            style={{ background: '#00d4aa' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 md:px-8 py-16 md:py-24 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,170,0.1) 0%, transparent 60%)' }} />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 border"
            style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', borderColor: 'rgba(0,212,170,0.3)' }}>
            OJK · ESG · SDG COMPLIANCE PLATFORM
          </div>
          <h1 className="font-extrabold text-3xl sm:text-5xl md:text-6xl leading-tight mb-6">
            Audit FinTech Reports.{' '}
            <span style={{ color: '#00d4aa' }}>Smarter.</span>{' '}
            <span style={{ color: '#0ea5e9' }}>Faster.</span>{' '}
            More Transparent.
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Upload laporan keuangan dan keberlanjutan. EthicAdvidsor menganalisis kepatuhan terhadap regulasi OJK dan standar ESG secara otomatis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-black transition-all hover:opacity-90"
              style={{ background: '#00d4aa', boxShadow: '0 0 30px rgba(0,212,170,0.3)' }}>
              Start Audit →
            </Link>
            <a href="#how"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-300 border border-white/10 hover:border-white/20 transition-all">
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
            {[
              { value: '6', label: 'CORE FEATURES' },
              { value: 'OJK', label: 'REGULATION READY' },
              { value: 'ESG', label: 'SCORE ENGINE' },
              { value: 'SDG', label: '12 & 16 REPORTS' },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-xl border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="font-extrabold text-xl md:text-2xl mb-1" style={{ color: '#00d4aa' }}>{stat.value}</div>
                <div className="text-xs text-slate-500 tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 md:px-8 py-16 max-w-6xl mx-auto">
        <h2 className="font-extrabold text-2xl md:text-3xl text-center mb-3">Fitur Utama</h2>
        <p className="text-slate-400 text-center mb-12 text-sm md:text-base">Semua yang sayang butuhkan untuk compliance FinTech</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            { icon: '📊', title: 'Dashboard Transparansi', desc: 'Pantau ESG Score, status OJK, dan carbon emission secara real-time dalam satu dashboard.' },
            { icon: '🌿', title: 'ESG Score Engine', desc: 'Kalkulasi otomatis Environmental, Social, dan Governance score dari data yang diinput.' },
            { icon: '⚖️', title: 'OJK Compliance', desc: 'Cek kepatuhan terhadap POJK No.77/2016, BI Regulation, SLIK, dan ESG Disclosure.' },
            { icon: '🔔', title: 'Notifikasi Otomatis', desc: 'Peringatan otomatis ketika ada pelanggaran threshold ESG atau deadline regulasi.' },
            { icon: '📄', title: 'Laporan SDG', desc: 'Generate laporan kontribusi SDG 12 dan SDG 16 secara otomatis.' },
            { icon: '💾', title: 'Export PDF', desc: 'Download hasil analisis lengkap dalam format PDF untuk keperluan audit.' },
          ].map(feature => (
            <div key={feature.title} className="p-5 md:p-6 rounded-2xl border border-white/[0.06] hover:border-white/10 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="px-4 md:px-8 py-16 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-extrabold text-2xl md:text-3xl text-center mb-3">Cara Penggunaan</h2>
          <p className="text-slate-400 text-center mb-12 text-sm md:text-base">Mulai audit dalam 3 langkah mudah</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: '01', title: 'Register & Login', desc: 'Daftarkan perusahaan FinTech sayang dan masuk ke dashboard.', icon: '👤' },
              { step: '02', title: 'Input Data ESG', desc: 'Masukkan data emisi karbon, social score, governance, dan keuangan perusahaan.', icon: '📤' },
              { step: '03', title: 'Lihat Hasil', desc: 'Sistem otomatis kalkulasi ESG score dan status kepatuhan regulasi.', icon: '📊' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                  style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}>
                  {item.icon}
                </div>
                <div className="text-xs font-bold mb-2" style={{ color: '#00d4aa' }}>STEP {item.step}</div>
                <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*Compliance*/}
      

      {/* CTA */}
      <section className="px-4 md:px-8 py-16 text-center border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-extrabold text-2xl md:text-3xl mb-4">Siap Mulai Audit?</h2>
          <p className="text-slate-400 mb-8 text-sm md:text-base">Bergabung dengan perusahaan FinTech yang sudah menggunakan EthicAdvidsor</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black transition-all hover:opacity-90"
            style={{ background: '#00d4aa', boxShadow: '0 0 30px rgba(0,212,170,0.3)' }}>
            Mulai Gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 border-t border-white/[0.06] text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 font-bold text-white mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00d4aa' }} />
          EthicAdvidsor
        </div>
        <p>© 2026 EthicAdvidsor · Platform Compliance FinTech ESG · OJK · SDG</p>
      </footer>
    </div>
  )
}