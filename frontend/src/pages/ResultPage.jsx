import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '📤', label: 'Upload Report', path: '/upload' },
  { icon: '🌿', label: 'ESG Report', path: '/esg-report' },
  { icon: '⚖️', label: 'OJK Status', path: '/ojk-status' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '📄', label: 'SDG Reports', path: '/result' },
  { icon: '🕒', label: 'History', path: '/history' },
]

export default function ResultPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('SDG Reports')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/report')
      .then(res => setReport(res.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [])

  const esg = report?.esg_score
  const regs = report?.regulations || []

  const getStatusColor = (status) => {
    if (status === 'compliant') return '#00d4aa'
    if (status === 'warning') return '#f59e0b'
    return '#ef4444'
  }

  const getStatusIcon = (status) => {
    if (status === 'compliant') return '✅'
    if (status === 'warning') return '⚠️'
    return '❌'
  }

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2' }}>
      <aside className="fixed top-0 left-0 h-full z-40 w-16 md:w-64 flex flex-col bg-white/[0.03] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00d4aa', boxShadow: '0 0 10px #00d4aa' }} />
          <span className="font-extrabold text-lg hidden md:block">EthicAdvidsor</span>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.path} onClick={() => setActiveNav(item.label)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{ color: activeNav === item.label ? '#00d4aa' : '#94a3b8', background: activeNav === item.label ? 'rgba(0,212,170,0.08)' : 'transparent' }}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm font-medium hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-16 md:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.8)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-base md:text-lg">Hasil Analisis</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {report ? `${report.company_name} · Tahun ${report.year}` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/upload" className="text-xs px-3 py-2 rounded-xl text-slate-400 border border-white/10 hover:border-white/20 transition-all">
              ← Upload Ulang
            </Link>
            <button onClick={handlePrint}
              className="text-xs px-3 py-2 rounded-xl font-semibold text-black transition-all hover:opacity-90"
              style={{ background: '#00d4aa' }}>
              📄 Export PDF
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : !report ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-4xl mb-4">📊</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada laporan</h3>
              <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black mt-4"
                style={{ background: '#00d4aa' }}>
                📤 Upload Report Sekarang
              </Link>
            </div>
          ) : (
            <>
              {/* Overall ESG Score */}
              <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="font-semibold text-sm mb-4">Overall ESG Score</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div>
                    <div className="font-extrabold text-5xl mb-1" style={{ color: '#f59e0b' }}>{esg?.overall_score}</div>
                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                      {esg?.overall_score >= 80 ? 'BAIK' : esg?.overall_score >= 60 ? 'CUKUP' : 'PERLU PERBAIKAN'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                    {[
                      { label: 'Environmental', value: esg?.environmental_score, color: '#22c55e' },
                      { label: 'Social', value: esg?.social_score, color: '#0ea5e9' },
                      { label: 'Governance', value: esg?.governance_score, color: '#a78bfa' },
                      { label: 'OJK Score', value: `${esg?.ojk_score}%`, color: '#00d4aa' },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl p-3 text-center border border-white/[0.06]"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="font-bold text-xl" style={{ color: item.color }}>{item.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Regulasi + SDG */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">⚖️ Status Kepatuhan Regulasi</h3>
                  <div className="space-y-3">
                    {regs.map(reg => (
                      <div key={reg.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-2">
                          <span>{getStatusIcon(reg.status)}</span>
                          <div>
                            <p className="text-sm font-medium">{reg.name}</p>
                            <div className="h-1 rounded-full mt-1 bg-white/5 w-24">
                              <div className="h-full rounded-full" style={{ width: `${reg.score}%`, background: getStatusColor(reg.status) }} />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize flex-shrink-0"
                          style={{ color: getStatusColor(reg.status), background: `${getStatusColor(reg.status)}15`, border: `1px solid ${getStatusColor(reg.status)}30` }}>
                          {reg.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              {/* ===== SECTION DIAGRAM ===== */}
              {esg && (
                <div className="space-y-4">
                  <h2 className="font-extrabold text-base md:text-lg">📊 Visualisasi Data</h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* 1. Radar Chart - ESG Components */}
                    <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <h3 className="font-semibold text-sm mb-4">🕸️ ESG Radar Chart</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={[
                          { subject: 'Environmental', value: esg.environmental_score, fullMark: 100 },
                          { subject: 'Social', value: esg.social_score, fullMark: 100 },
                          { subject: 'Governance', value: esg.governance_score, fullMark: 100 },
                          { subject: 'OJK Score', value: esg.ojk_score, fullMark: 100 },
                        ]}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <Radar name="Score" dataKey="value" stroke="#00d4aa" fill="#00d4aa" fillOpacity={0.2} />
                          <Tooltip
                            contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            labelStyle={{ color: '#e8edf2' }}
                          />
                          <Tooltip
                            cursor={false}
                            contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 2. Donut Chart - Compliance Distribution */}
                    <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <h3 className="font-semibold text-sm mb-4">🍩 Compliance Distribution</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Compliant', value: regs.filter(r => r.status === 'compliant').length },
                              { name: 'Warning', value: regs.filter(r => r.status === 'warning').length },
                              { name: 'Non-Compliant', value: regs.filter(r => r.status === 'non-compliant').length },
                            ].filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius="45%"
                            outerRadius="65%"
                            paddingAngle={4}
                            dataKey="value"
                          >
                            <Cell fill="#00d4aa" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip
                            cursor={false}
                            contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            labelStyle={{ color: '#e8edf2' }}
                            formatter={(value, name) => [`${value} regulasi`, name]}
                          />
                          <Legend
                            wrapperStyle={{ color: '#94a3b8', fontSize: 11 }}
                            formatter={(value, entry) => (
                              <span style={{ color: entry.color }}>{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Center stats */}
                      <div className="flex justify-center gap-6 mt-2">
                        {[
                          { label: 'Compliant', count: regs.filter(r => r.status === 'compliant').length, color: '#00d4aa' },
                          { label: 'Warning', count: regs.filter(r => r.status === 'warning').length, color: '#f59e0b' },
                          { label: 'Non-Compliant', count: regs.filter(r => r.status === 'non-compliant').length, color: '#ef4444' },
                        ].map(item => (
                          <div key={item.label} className="text-center">
                            <div className="font-bold text-lg" style={{ color: item.color }}>{item.count}</div>
                            <div className="text-xs text-slate-500">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Bar Chart - ESG vs Threshold */}
                    <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <h3 className="font-semibold text-sm mb-4">📊 ESG Score vs Threshold</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[
                          { name: 'Environmental', score: esg.environmental_score, threshold: 50 },
                          { name: 'Social', score: esg.social_score, threshold: 60 },
                          { name: 'Governance', score: esg.governance_score, threshold: 65 },
                          { name: 'Overall', score: esg.overall_score, threshold: 70 },
                        ]} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            labelStyle={{ color: '#e8edf2' }}
                          />
                          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                          <Bar dataKey="score" name="Score Aktual" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="threshold" name="Threshold Min." fill="rgba(245,158,11,0.4)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 4. Bar Chart - Financial Overview */}
                    <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <h3 className="font-semibold text-sm mb-4">💰 Financial Performance</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[
                          { name: 'Profit Margin', value: esg.profit_margin, target: 15 },
                          { name: 'ROA', value: esg.return_on_assets, target: 5 },
                          { name: 'OJK Score', value: esg.ojk_score, target: 80 },
                        ]} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            labelStyle={{ color: '#e8edf2' }}
                          />
                          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                          <Bar dataKey="value" name="Nilai Aktual" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="target" name="Target" fill="rgba(167,139,250,0.4)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                  </div>
                </div>
              )}

              {/* ===== SARAN & REKOMENDASI ===== */}
              {esg && (
                <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-5">💡 Saran & Rekomendasi</h3>

                  <div className="space-y-3">

                    {/* Environmental */}
                    {esg.carbon_emission > 600 ? (
                      <div className="flex gap-3 p-4 rounded-xl border border-red-500/20"
                        style={{ background: 'rgba(239,68,68,0.05)' }}>
                        <span className="text-xl flex-shrink-0">🔴</span>
                        <div>
                          <p className="font-semibold text-sm text-red-400 mb-1">Emisi Karbon Melebihi Batas</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Emisi karbon perusahaan sebesar <strong className="text-white">{esg.carbon_emission} ton</strong> melebihi threshold maksimum 600 ton.
                            Rekomendasikan untuk menerapkan program efisiensi energi, beralih ke sumber energi terbarukan,
                            dan melakukan audit emisi secara berkala untuk mengurangi jejak karbon perusahaan.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 p-4 rounded-xl border border-green-500/20"
                        style={{ background: 'rgba(34,197,94,0.05)' }}>
                        <span className="text-xl flex-shrink-0">🟢</span>
                        <div>
                          <p className="font-semibold text-sm text-green-400 mb-1">Emisi Karbon Terkendali</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Emisi karbon sebesar <strong className="text-white">{esg.carbon_emission} ton</strong> masih di bawah threshold 600 ton.
                            Pertahankan dan tingkatkan program keberlanjutan lingkungan untuk memperkuat Environmental Score.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Social */}
                    {esg.social_score < 60 ? (
                      <div className="flex gap-3 p-4 rounded-xl border border-red-500/20"
                        style={{ background: 'rgba(239,68,68,0.05)' }}>
                        <span className="text-xl flex-shrink-0">🔴</span>
                        <div>
                          <p className="font-semibold text-sm text-red-400 mb-1">Social Score Di Bawah Standar</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Social Score <strong className="text-white">{esg.social_score}</strong> berada di bawah threshold minimum 60 poin.
                            Rekomendasikan untuk meningkatkan program CSR, pelatihan karyawan, keterlibatan komunitas,
                            dan program kesejahteraan tenaga kerja guna meningkatkan aspek sosial perusahaan.
                          </p>
                        </div>
                      </div>
                    ) : esg.social_score < 75 ? (
                      <div className="flex gap-3 p-4 rounded-xl border border-yellow-500/20"
                        style={{ background: 'rgba(245,158,11,0.05)' }}>
                        <span className="text-xl flex-shrink-0">🟡</span>
                        <div>
                          <p className="font-semibold text-sm text-yellow-400 mb-1">Social Score Perlu Ditingkatkan</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Social Score <strong className="text-white">{esg.social_score}</strong> sudah memenuhi threshold namun masih dapat ditingkatkan.
                            Perluas program sosial, tingkatkan transparansi pelaporan sosial, dan perkuat hubungan dengan stakeholder.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 p-4 rounded-xl border border-green-500/20"
                        style={{ background: 'rgba(34,197,94,0.05)' }}>
                        <span className="text-xl flex-shrink-0">🟢</span>
                        <div>
                          <p className="font-semibold text-sm text-green-400 mb-1">Social Score Sangat Baik</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Social Score <strong className="text-white">{esg.social_score}</strong> menunjukkan performa sosial yang sangat baik.
                            Pertahankan program sosial yang ada dan dokumentasikan sebagai best practice perusahaan.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Governance */}
                    {esg.governance_score < 65 ? (
                      <div className="flex gap-3 p-4 rounded-xl border border-red-500/20"
                        style={{ background: 'rgba(239,68,68,0.05)' }}>
                        <span className="text-xl flex-shrink-0">🔴</span>
                        <div>
                          <p className="font-semibold text-sm text-red-400 mb-1">Governance Score Di Bawah Standar</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Governance Score <strong className="text-white">{esg.governance_score}</strong> berada di bawah threshold minimum 65 poin.
                            Rekomendasikan untuk memperkuat struktur tata kelola, meningkatkan transparansi laporan keuangan,
                            dan memastikan kepatuhan terhadap regulasi OJK secara konsisten.
                          </p>
                        </div>
                      </div>
                    ) : esg.governance_score < 80 ? (
                      <div className="flex gap-3 p-4 rounded-xl border border-yellow-500/20"
                        style={{ background: 'rgba(245,158,11,0.05)' }}>
                        <span className="text-xl flex-shrink-0">🟡</span>
                        <div>
                          <p className="font-semibold text-sm text-yellow-400 mb-1">Governance Cukup, Perlu Peningkatan</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Governance Score <strong className="text-white">{esg.governance_score}</strong> memenuhi threshold namun masih ada ruang perbaikan.
                            Tingkatkan mekanisme pengawasan internal, perkuat kebijakan anti-korupsi, dan tingkatkan kualitas laporan tahunan.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 p-4 rounded-xl border border-green-500/20"
                        style={{ background: 'rgba(34,197,94,0.05)' }}>
                        <span className="text-xl flex-shrink-0">🟢</span>
                        <div>
                          <p className="font-semibold text-sm text-green-400 mb-1">Governance Score Sangat Baik</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Governance Score <strong className="text-white">{esg.governance_score}</strong> mencerminkan tata kelola perusahaan yang sangat baik.
                            Pertahankan standar governance dan jadikan sebagai keunggulan kompetitif perusahaan.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Overall ESG */}
                    <div className="flex gap-3 p-4 rounded-xl border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <span className="text-xl flex-shrink-0">📋</span>
                      <div>
                        <p className="font-semibold text-sm text-white mb-1">Ringkasan Rekomendasi</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Overall ESG Score perusahaan adalah <strong style={{ color: esg.overall_score >= 80 ? '#00d4aa' : esg.overall_score >= 60 ? '#f59e0b' : '#ef4444' }}>{esg.overall_score}</strong> —
                          {esg.overall_score >= 80
                            ? ' Performa ESG sangat baik. Perusahaan telah memenuhi standar keberlanjutan internasional. Fokus pada inovasi dan kepemimpinan ESG di industri.'
                            : esg.overall_score >= 60
                            ? ' Performa ESG cukup baik namun masih ada ruang untuk perbaikan. Prioritaskan aspek dengan score terendah dan buat roadmap peningkatan ESG jangka panjang.'
                            : ' Performa ESG perlu perhatian serius. Segera buat action plan perbaikan ESG dan konsultasikan dengan konsultan keberlanjutan untuk langkah konkret.'
                          }
                        </p>
                      </div>
                    </div>

                    {/* OJK Compliance */}
                    {regs.some(r => r.status !== 'compliant') && (
                      <div className="flex gap-3 p-4 rounded-xl border border-orange-500/20"
                        style={{ background: 'rgba(245,158,11,0.05)' }}>
                        <span className="text-xl flex-shrink-0">⚖️</span>
                        <div>
                          <p className="font-semibold text-sm text-orange-400 mb-1">Tindakan Kepatuhan OJK Diperlukan</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Terdapat {regs.filter(r => r.status !== 'compliant').length} regulasi yang belum terpenuhi:
                            <strong className="text-white"> {regs.filter(r => r.status !== 'compliant').map(r => r.name).join(', ')}</strong>.
                            Segera lakukan pemenuhan kewajiban regulasi untuk menghindari sanksi dari OJK dan Bank Indonesia.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="font-semibold text-sm mb-4">🌍 SDG 12 & 16 Alignment</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'SDG 12 — Konsumsi & Produksi Berkelanjutan', pct: Math.min(100, (esg?.environmental_score ?? 0) + 10), color: '#22c55e' },
                      { label: 'SDG 16 — Tata Kelola yang Baik', pct: esg?.governance_score ?? 0, color: '#0ea5e9' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs text-slate-300">{item.label}</span>
                          <span className="text-xs font-bold" style={{ color: item.color }}>{item.pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Profit Margin', value: `${esg?.profit_margin ?? 0}%` },
                      { label: 'Return on Assets', value: `${esg?.return_on_assets ?? 0}%` },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-xs text-slate-500">{item.label}</p>
                        <p className="font-bold text-lg" style={{ color: '#00d4aa' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/dashboard" className="flex-1 py-3 rounded-xl text-center text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 transition-all">
                  🏠 Kembali ke Dashboard
                </Link>
                <Link to="/upload" className="flex-1 py-3 rounded-xl text-center text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 transition-all">
                  📤 Upload Laporan Baru
                </Link>
                <button onClick={handlePrint}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
                  style={{ background: '#00d4aa' }}>
                  📄 Download Laporan PDF
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}