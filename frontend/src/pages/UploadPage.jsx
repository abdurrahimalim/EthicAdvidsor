import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',     path: '/dashboard' },
  { icon: '📤', label: 'Upload Report', path: '/upload' },
  { icon: '🌿', label: 'ESG Report',    path: '/esg-report' },
  { icon: '⚖️', label: 'OJK Status',    path: '/ojk-status' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '📄', label: 'SDG Reports',   path: '/result' },
  { icon: '🕓', label: 'History',       path: '/history' },
]

const JENIS_PERUSAHAAN = [
  'Payment Gateway','E-Wallet/Dompet Digital','Peer-to-Peer Lending (P2P)',
  'Digital Banking','Crowdfunding','InsureTech','Remittance','Multi-service Fintech','Lainnya',
]

const STEPS    = ['Input Data', 'Processing', 'Done']
const DAYS     = ['Mo','Tu','We','Th','Fr','Sa','Su']
const MONTHS   = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const MONTHS_S = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

// ─── Date Picker ─────────────────────────────────────────────────────────────
function DatePicker({ value, onChange, placeholder = 'Pilih tanggal' }) {
  const [open, setOpen]     = useState(false)
  const [view, setView]     = useState(() => {
    const d = value ? new Date(value) : new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = value ? new Date(value) : null

  const firstDay = new Date(view.year, view.month, 1)
  let startDow = firstDay.getDay() // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1 // convert to Mon=0

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const prevDays    = new Date(view.year, view.month, 0).getDate()

  const cells = []
  for (let i = 0; i < startDow; i++) cells.push({ day: prevDays - startDow + 1 + i, cur: false })
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, cur: true })
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - startDow + 1, cur: false })

  const selectDay = (day) => {
    if (!day.cur) return
    const d = new Date(view.year, view.month, day.day)
    const iso = d.toISOString().slice(0, 10)
    onChange(iso)
    setOpen(false)
  }

  const prevMonth = () => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  const nextMonth = () => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })

  const formatDisplay = iso => {
    if (!iso) return ''
    const d = new Date(iso)
    const days2 = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
    return `${days2[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  }

  const isSelected = (day) => {
    if (!selected || !day.cur) return false
    return selected.getFullYear() === view.year && selected.getMonth() === view.month && selected.getDate() === day.day
  }

  const isToday = (day) => {
    if (!day.cur) return false
    const t = new Date()
    return t.getFullYear() === view.year && t.getMonth() === view.month && t.getDate() === day.day
  }

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}
        className="w-full rounded-xl px-4 py-3 text-sm border border-white/10 cursor-pointer flex items-center justify-between transition-colors hover:border-teal-500/40"
        style={{ background: 'rgba(255,255,255,0.05)', color: value ? '#e2e8f0' : '#475569' }}>
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <span className="text-slate-500 text-xs">📅</span>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 rounded-2xl border border-white/[0.12] shadow-2xl p-4"
          style={{ background: '#0f1419', minWidth: '280px' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              ‹
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{MONTHS[view.month]}</span>
              <input type="number" value={view.year}
                onChange={e => setView(v => ({ ...v, year: parseInt(e.target.value) || v.year }))}
                className="w-16 text-center text-sm font-bold rounded-lg px-1 py-0.5 border border-white/10 outline-none focus:border-teal-500/50"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#00d4aa' }} />
            </div>
            <button type="button" onClick={nextMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs text-slate-500 font-semibold py-1">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => (
              <button key={i} type="button" onClick={() => selectDay(day)}
                className="h-8 w-full rounded-lg text-xs font-medium transition-all"
                style={{
                  color:      isSelected(day) ? '#080c10' : !day.cur ? '#2a3a4a' : isToday(day) ? '#00d4aa' : '#e2e8f0',
                  background: isSelected(day) ? '#00d4aa' : isToday(day) && !isSelected(day) ? 'rgba(0,212,170,0.1)' : 'transparent',
                  cursor:     day.cur ? 'pointer' : 'default',
                }}>
                {day.day}
              </button>
            ))}
          </div>

          {/* Today shortcut */}
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-center">
            <button type="button"
              onClick={() => { const t = new Date(); onChange(t.toISOString().slice(0,10)); setOpen(false) }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ color: '#00d4aa', background: 'rgba(0,212,170,0.1)' }}>
              Hari ini
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Komponen kecil ───────────────────────────────────────────────────────────
function StepBar({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const done = i < step; const active = i === step
        const color = done || active ? '#00d4aa' : '#334155'
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                style={{ borderColor: color, background: done ? '#00d4aa' : active ? 'rgba(0,212,170,0.15)' : 'transparent', color: done ? '#080c10' : color }}>
                {done ? '✓' : i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block" style={{ color }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-10 h-px mx-1" style={{ background: i < step ? '#00d4aa' : '#1e2a3a' }} />}
          </div>
        )
      })}
    </div>
  )
}

function SectionCard({ children }) {
  return <div className="rounded-2xl p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>{children}</div>
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div className="mb-4">
      <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#00d4aa' }}><span>{icon}</span>{title}</h3>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function FieldLabel({ children }) {
  return <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">{children}</label>
}

const inputClass = "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:border-teal-500/50 transition-colors"
const inputStyle = { background: 'rgba(255,255,255,0.05)' }

function Input({ prefix, ...props }) {
  if (prefix) return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{prefix}</span>
      <input {...props} className={`${inputClass} pl-9`} style={inputStyle} />
    </div>
  )
  return <input {...props} className={inputClass} style={inputStyle} />
}

function Select({ children, ...props }) {
  return <select {...props} className={`${inputClass} cursor-pointer`} style={{ background: '#0f1419' }}>{children}</select>
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <div onClick={onChange} className="w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0"
        style={{ borderColor: checked ? '#00d4aa' : 'rgba(255,255,255,0.2)', background: checked ? '#00d4aa' : 'transparent' }}>
        {checked && <span className="text-xs text-black font-bold">✓</span>}
      </div>
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </label>
  )
}

function EsgSubCard({ color, label, children }) {
  const c = {
    green:  { bg: 'rgba(0,212,170,0.06)',   badge: 'rgba(0,212,170,0.15)',   text: '#00d4aa' },
    purple: { bg: 'rgba(167,139,250,0.06)', badge: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
    yellow: { bg: 'rgba(245,158,11,0.06)',  badge: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
  }[color]
  return (
    <div className="rounded-xl p-4 border border-white/[0.06]" style={{ background: c.bg }}>
      <div className="mb-3"><span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: c.badge, color: c.text }}>{label}</span></div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const navigate   = useNavigate()
  const fileRef    = useRef(null)
  const [step,     setStep]     = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [fileName, setFileName] = useState('')

  const [form, setForm] = useState({
    company_name: '', address: '', year: new Date().getFullYear().toString(),
    start_date: '', end_date: '', employee_count: '', company_type: '',
    total_assets: '', total_liabilities: '', total_equity: '',
    revenue: '', operational_cost: '', net_profit: '', cash: '',
    carbon_emission: '', energy_consumption: '', renewable_energy: '',
    employee_training: '', training_hours: '', customer_complaints: '', women_percentage: '',
    audit_available: false, legal_complete: false, regulator_violation: false, sdg_report: false,
    legal_cases: '', internal_audit: false, anti_fraud: false, anti_corruption: false, timely_report: false,
    social_score: '', governance_score: '',
  })

  const set = (name, value) => setForm(p => ({ ...p, [name]: value }))
  const handleChange = e => set(e.target.name, e.target.value)
  const toggle = name => set(name, !form[name])
  const handleFile = e => { if (e.target.files[0]) setFileName(e.target.files[0].name) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true); setStep(1)
    try {
      await api.post('/reports', {
        company_name:     form.company_name,
        year:             parseInt(form.year),
        carbon_emission:  parseFloat(form.carbon_emission) || 0,
        social_score:     parseFloat(form.social_score) || 0,
        governance_score: parseFloat(form.governance_score) || 0,
        revenue:          parseFloat(form.revenue) || 0,
        net_profit:       parseFloat(form.net_profit) || 0,
        total_assets:     parseFloat(form.total_assets) || 0,
      })
      setStep(2)
      setTimeout(() => navigate('/result'), 1500)
    } catch (err) {
      setStep(0)
      setError(err.response?.data?.message || 'Gagal memproses laporan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2', fontFamily: "'DM Sans', sans-serif" }}>
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4aa', boxShadow: '0 0 10px #00d4aa' }} />
          <span className="font-extrabold text-lg hidden md:block">EthicAdvidsor</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{ color: item.path === '/upload' ? '#00d4aa' : '#94a3b8', background: item.path === '/upload' ? 'rgba(0,212,170,0.08)' : 'transparent' }}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <span>🔙</span><span className="text-sm font-medium hidden md:block">Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-16 md:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-lg">Upload Report</h1>
            <p className="text-slate-500 text-xs mt-0.5">Input data keuangan & ESG perusahaan</p>
          </div>
        </header>

        <div className="p-6 max-w-3xl mx-auto">
          <StepBar step={step} />

          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm text-red-400 border border-red-500/30"
              style={{ background: 'rgba(239,68,68,0.1)' }}>{error}</div>
          )}

          {step === 2 ? (
            <div className="rounded-2xl p-12 border border-white/[0.06] text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-extrabold text-xl mb-2" style={{ color: '#00d4aa' }}>Laporan Berhasil Diproses!</h2>
              <p className="text-slate-400 text-sm">Mengalihkan ke halaman hasil...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Informasi Perusahaan */}
              <SectionCard>
                <SectionTitle icon="🏢" title="Informasi Perusahaan" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Nama Perusahaan</FieldLabel>
                    <Input name="company_name" value={form.company_name} onChange={handleChange}
                      placeholder="Contoh: PT. Fintech Indonesian" required />
                  </div>
                  <div>
                    <FieldLabel>Alamat Perusahaan</FieldLabel>
                    <Input name="address" value={form.address} onChange={handleChange}
                      placeholder="Contoh: Jl. BSD, BSD City, Tangerang" />
                  </div>
                  <div>
                    <FieldLabel>Periode Laporan (Tahun)</FieldLabel>
                    <Input type="number" name="year" value={form.year} onChange={handleChange}
                      placeholder="Contoh: 2024" min="2000" max="2100" required />
                  </div>
                  <div>
                    <FieldLabel>Jumlah Karyawan</FieldLabel>
                    <Input type="number" name="employee_count" value={form.employee_count}
                      onChange={handleChange} placeholder="Contoh: 160, 155, 174" />
                  </div>
                  <div>
                    <FieldLabel>Tanggal Awal</FieldLabel>
                    <DatePicker value={form.start_date} onChange={v => set('start_date', v)} placeholder="Pilih tanggal awal" />
                  </div>
                  <div>
                    <FieldLabel>Tanggal Akhir</FieldLabel>
                    <DatePicker value={form.end_date} onChange={v => set('end_date', v)} placeholder="Pilih tanggal akhir" />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Jenis Perusahaan</FieldLabel>
                    <Select name="company_type" value={form.company_type} onChange={handleChange}>
                      <option value="">Pilih jenis perusahaan</option>
                      {JENIS_PERUSAHAAN.map(j => <option key={j} value={j}>{j}</option>)}
                    </Select>
                  </div>
                </div>
              </SectionCard>

              {/* Data Keuangan */}
              <SectionCard>
                <SectionTitle icon="💰" title="Data Keuangan" sub="Dalam jutaan rupiah (Rp juta)" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: 'total_assets',      label: 'Total Aset',        req: true  },
                    { name: 'total_liabilities', label: 'Total Liabilitas',   req: false },
                    { name: 'total_equity',       label: 'Total Ekuitas',      req: false },
                    { name: 'revenue',            label: 'Pendapatan',         req: true  },
                    { name: 'operational_cost',   label: 'Beban Operasional',  req: false },
                    { name: 'net_profit',         label: 'Laba Bersih',        req: true  },
                    { name: 'cash',               label: 'Kas & Setara Kas',   req: false },
                  ].map(f => (
                    <div key={f.name}>
                      <FieldLabel>{f.label}</FieldLabel>
                      <Input type="number" name={f.name} value={form[f.name]}
                        onChange={handleChange} placeholder="Contoh: 450" prefix="Rp" required={f.req} />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <FieldLabel>Upload Laporan</FieldLabel>
                    <div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <span className="text-slate-500">📎</span>
                      <span className="text-sm text-slate-400 flex-1 truncate">{fileName || 'Attach a file'}</span>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-black hover:opacity-90 transition-all"
                        style={{ background: '#00d4aa' }}>Upload</button>
                      <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
                    </div>
                    {fileName && <p className="text-xs text-slate-500 mt-1.5">✓ {fileName}</p>}
                  </div>
                </div>
              </SectionCard>

              {/* Data ESG */}
              <SectionCard>
                <SectionTitle icon="🌿" title="Data ESG" sub="Environmental, Social & Governance Indicators" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EsgSubCard color="green" label="Environmental">
                    {[
                      { name: 'carbon_emission',    label: 'Emisi Karbon (ton CO₂)',          req: true,  hint: 'Threshold: < 600 ton' },
                      { name: 'energy_consumption', label: 'Konsumsi Energi (MWh)',            req: false },
                      { name: 'renewable_energy',   label: 'Penggunaan Energi Terbarukan (%)', req: false },
                    ].map(f => (
                      <div key={f.name}>
                        <FieldLabel>{f.label}</FieldLabel>
                        <Input type="number" name={f.name} value={form[f.name]}
                          onChange={handleChange} placeholder="Contoh: 450" required={f.req} />
                        {f.hint && <p className="text-xs text-slate-500 mt-1">{f.hint}</p>}
                      </div>
                    ))}
                  </EsgSubCard>

                  <EsgSubCard color="purple" label="Social">
                    {[
                      { name: 'employee_training',   label: 'Jumlah Pelatihan Karyawan' },
                      { name: 'training_hours',      label: 'Jam Pelatihan Karyawan' },
                      { name: 'customer_complaints', label: 'Jumlah Keluhan Pelanggan' },
                      { name: 'women_percentage',    label: 'Persentase Perempuan (%)' },
                    ].map(f => (
                      <div key={f.name}>
                        <FieldLabel>{f.label}</FieldLabel>
                        <Input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder="Contoh: 450" />
                      </div>
                    ))}
                  </EsgSubCard>

                  <EsgSubCard color="yellow" label="Data Kepatuhan OJK">
                    {[
                      { name: 'audit_available',     label: 'Audit Tersedia' },
                      { name: 'legal_complete',      label: 'Legalitas Lengkap' },
                      { name: 'regulator_violation', label: 'Pelanggaran Regulator' },
                      { name: 'sdg_report',          label: 'SDG Report Tersedia' },
                    ].map(f => <Checkbox key={f.name} label={f.label} checked={form[f.name]} onChange={() => toggle(f.name)} />)}
                  </EsgSubCard>

                  <EsgSubCard color="green" label="Governance">
                    <div>
                      <FieldLabel>Jumlah Kasus Hukum</FieldLabel>
                      <Input type="number" name="legal_cases" value={form.legal_cases} onChange={handleChange} placeholder="Contoh: 0" />
                    </div>
                    {[
                      { name: 'internal_audit',   label: 'Audit Internal Tersedia' },
                      { name: 'anti_fraud',        label: 'Anti Fraud Policy Tersedia' },
                      { name: 'anti_corruption',   label: 'Anti Corruption Policy Tersedia' },
                      { name: 'timely_report',     label: 'Laporan Tepat Waktu' },
                    ].map(f => <Checkbox key={f.name} label={f.label} checked={form[f.name]} onChange={() => toggle(f.name)} />)}
                  </EsgSubCard>
                </div>
              </SectionCard>

              <button type="submit" disabled={loading}
                className="w-full font-bold py-4 rounded-xl text-black transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#00d4aa', boxShadow: '0 0 24px rgba(0,212,170,0.2)' }}>
                {loading ? '⏳ Memproses...' : '🚀 Proses Laporan'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}