import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

const tooltipStyle = {
  contentStyle: { background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' },
  labelStyle: { color: '#e8edf2' },
  cursor: { fill: 'rgba(255,255,255,0.05)' }
}

const TABS = ['Ringkasan', 'Financial', 'ESG', 'Compliance', 'SDG']

export default function ResultPage() {
  const [report, setReport] = useState(null)
  const [ratios, setRatios] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Ringkasan')
  const [searchParams] = useSearchParams()
  const reportId = searchParams.get('id')

  useEffect(() => {
    const endpoint = reportId ? `/reports/${reportId}/detail` : '/report'
    api.get(endpoint)
      .then(res => {
        if (reportId) {
          setReport(res.data.report)
          setRatios(res.data.ratios)
        } else {
          setReport(res.data)
          const r = res.data
          const roa = r.total_assets > 0 ? ((r.net_profit / r.total_assets) * 100).toFixed(2) : 0
          const roe = r.total_equity > 0 ? ((r.net_profit / r.total_equity) * 100).toFixed(2) : 0
          const der = r.total_equity > 0 ? (r.total_liabilities / r.total_equity).toFixed(2) : 0
          const liq = r.total_liabilities > 0 ? (r.cash_and_equivalents / r.total_liabilities).toFixed(2) : 0
          const pm = r.revenue > 0 ? ((r.net_profit / r.revenue) * 100).toFixed(2) : 0
          setRatios({ roa, roe, der, liquidityRatio: liq, profitMargin: pm })
        }
      })
      .catch(() => { setReport(null); setRatios(null) })
      .finally(() => setLoading(false))
  }, [reportId])

  const esg = report?.esg_score
  const regs = report?.regulations ?? []

  const getColor = (status) => {
    if (status === 'compliant') return '#00d4aa'
    if (status === 'warning') return '#f59e0b'
    return '#ef4444'
  }

  const getInterpretation = (key, value) => {
    const interpretations = {
      roa: value >= 5 ? '✅ ROA menunjukkan profitabilitas aset yang baik.' : value >= 2 ? '⚠️ ROA cukup, namun masih bisa ditingkatkan.' : '❌ ROA rendah, efisiensi penggunaan aset perlu diperbaiki.',
      roe: value >= 10 ? '✅ ROE menunjukkan return yang baik bagi pemegang saham.' : value >= 5 ? '⚠️ ROE cukup baik, pertahankan.' : '❌ ROE rendah, profitabilitas ekuitas perlu ditingkatkan.',
      der: value <= 1 ? '✅ DER rendah, struktur modal sangat sehat.' : value <= 2 ? '⚠️ DER masih acceptable, pantau terus.' : '❌ DER tinggi menunjukkan risiko utang meningkat.',
      liquidityRatio: value >= 1.5 ? '✅ Likuiditas sangat baik, perusahaan mampu memenuhi kewajiban.' : value >= 1 ? '⚠️ Likuiditas cukup, namun perlu diwaspadai.' : '❌ Likuiditas rendah, risiko gagal bayar kewajiban jangka pendek.',
    }
    return interpretations[key] ?? '-'
  }

  const getESGInsight = () => {
    if (!esg) return []
    const insights = []
    if (esg.overall_score >= 75) insights.push('✅ Perusahaan memiliki skor ESG yang sangat baik dan memenuhi standar keberlanjutan.')
    else if (esg.overall_score >= 55) insights.push('⚠️ Skor ESG cukup baik namun masih ada ruang untuk perbaikan di beberapa aspek.')
    else insights.push('❌ Skor ESG rendah, perlu action plan perbaikan segera di semua aspek ESG.')
    if ((report?.carbon_emission ?? 0) > 600) insights.push('❌ Emisi karbon melebihi threshold 600 ton, perlu program efisiensi energi.')
    else insights.push('✅ Emisi karbon terkendali di bawah threshold 600 ton.')
    if (report?.has_internal_audit && report?.has_fraud_policy) insights.push('✅ Governance cukup baik karena audit internal dan fraud policy tersedia.')
    else insights.push('⚠️ Governance perlu diperkuat — pastikan audit internal dan fraud policy tersedia.')
    if (ratios?.der > 2) insights.push('❌ DER tinggi menunjukkan risiko utang yang perlu diperhatikan.')
    return insights
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2' }}>
      <Sidebar />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '240px' }}>

        {/* A. HEADER */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.9)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-base md:text-lg">Hasil Analisis Laporan</h1>
            {report && (
              <p className="text-slate-500 text-xs mt-0.5">
                {report.company_name} · {report.company_type} · {report.period_type} {report.period_start ? `(${new Date(report.period_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(report.period_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})` : report.year}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/upload" className="text-xs px-3 py-2 rounded-xl text-slate-400 border border-white/10 hover:border-white/20 transition-all">
              ← Upload Ulang
            </Link>
            <button onClick={() => window.print()}
              className="text-xs px-3 py-2 rounded-xl font-semibold text-black"
              style={{ background: '#00d4aa' }}>
              📄 Export PDF
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20"><p className="text-slate-400">Loading...</p></div>
        ) : !report ? (
          <div className="p-6 text-center">
            <p className="text-4xl mb-4">📊</p>
            <h3 className="font-semibold text-lg mb-4">Belum ada laporan</h3>
            <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black"
              style={{ background: '#00d4aa' }}>Upload Sekarang</Link>
          </div>
        ) : (
          <div className="p-4 md:p-6 space-y-5">

            {/* B. TAB ANALISIS */}
            <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] pb-0">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px"
                  style={{
                    color: activeTab === tab ? '#00d4aa' : '#64748b',
                    borderBottomColor: activeTab === tab ? '#00d4aa' : 'transparent',
                    background: activeTab === tab ? 'rgba(0,212,170,0.05)' : 'transparent'
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* C. RINGKASAN */}
            {activeTab === 'Ringkasan' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { label: 'ESG Score', value: esg?.overall_score ?? '-', color: esg?.overall_score >= 75 ? '#00d4aa' : esg?.overall_score >= 55 ? '#f59e0b' : '#ef4444', icon: '🌿' },
                    { label: 'Compliance OJK', value: regs.every(r => r.status === 'compliant') ? 'Patuh' : 'Perlu Perhatian', color: regs.every(r => r.status === 'compliant') ? '#00d4aa' : '#f59e0b', icon: '⚖️' },
                    { label: 'Financial Health', value: ratios ? (parseFloat(ratios.roa) >= 5 && parseFloat(ratios.der) <= 2 ? 'Sehat' : 'Warning') : '-', color: ratios && parseFloat(ratios.roa) >= 5 && parseFloat(ratios.der) <= 2 ? '#00d4aa' : '#f59e0b', icon: '💰' },
                    { label: 'SDG 12', value: (report?.carbon_emission ?? 0) < 600 ? 'Tercapai' : 'Belum', color: (report?.carbon_emission ?? 0) < 600 ? '#00d4aa' : '#f59e0b', icon: '♻️' },
                    { label: 'SDG 16', value: report?.has_internal_audit && report?.has_anti_corruption ? 'Tercapai' : 'Belum', color: report?.has_internal_audit && report?.has_anti_corruption ? '#00d4aa' : '#f59e0b', icon: '🏛️' },
                  ].map(card => (
                    <div key={card.label} className="rounded-2xl p-4 border border-white/[0.06] text-center"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <div className="font-extrabold text-2xl mb-1" style={{ color: card.color }}>{card.value}</div>
                      <div className="text-xs text-slate-400">{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* AI Insight / Summary */}
                <div className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">🤖 AI Insight & Interpretasi</h3>
                  <div className="space-y-2">
                    {getESGInsight().map((insight, i) => (
                      <p key={i} className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* D. FINANCIAL */}
            {activeTab === 'Financial' && ratios && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'ROA', value: `${ratios.roa}%`, color: parseFloat(ratios.roa) >= 5 ? '#00d4aa' : '#f59e0b' },
                    { label: 'ROE', value: `${ratios.roe}%`, color: parseFloat(ratios.roe) >= 10 ? '#00d4aa' : '#f59e0b' },
                    { label: 'DER', value: ratios.der, color: parseFloat(ratios.der) <= 2 ? '#00d4aa' : '#ef4444' },
                    { label: 'Liquidity Ratio', value: ratios.liquidityRatio, color: parseFloat(ratios.liquidityRatio) >= 1 ? '#00d4aa' : '#ef4444' },
                  ].map(item => (
                    <div key={item.label} className="rounded-2xl p-4 border border-white/[0.06] text-center"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="font-extrabold text-2xl mb-1" style={{ color: item.color }}>{item.value}</div>
                      <div className="text-xs text-slate-400">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Bar Chart Rasio */}
                <div className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">📊 Visualisasi Rasio Keuangan</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[
                      { name: 'ROA (%)', value: parseFloat(ratios.roa), target: 5 },
                      { name: 'ROE (%)', value: parseFloat(ratios.roe), target: 10 },
                      { name: 'DER', value: parseFloat(ratios.der), target: 2 },
                      { name: 'Likuiditas', value: parseFloat(ratios.liquidityRatio), target: 1 },
                    ]} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                      <Bar dataKey="value" name="Aktual" fill="#00d4aa" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" name="Target" fill="rgba(245,158,11,0.4)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Interpretasi */}
                <div className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">💡 Interpretasi Rasio Keuangan</h3>
                  <div className="space-y-3">
                    {['roa', 'roe', 'der', 'liquidityRatio'].map(key => (
                      <div key={key} className="p-3 rounded-xl border border-white/[0.06]"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{key.toUpperCase()}</p>
                        <p className="text-sm text-slate-300">{getInterpretation(key, parseFloat(ratios[key]))}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* E. ESG */}
            {activeTab === 'ESG' && esg && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Environmental Score', value: esg.environmental_score, color: '#22c55e', icon: '🌱' },
                    { label: 'Social Score', value: esg.social_score, color: '#0ea5e9', icon: '👥' },
                    { label: 'Governance Score', value: esg.governance_score, color: '#a78bfa', icon: '🏛️' },
                  ].map(item => (
                    <div key={item.label} className="rounded-2xl p-4 border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-400">{item.label}</span>
                        <span className="text-xl">{item.icon}</span>
                      </div>
                      <div className="font-extrabold text-3xl mb-2" style={{ color: item.color }}>{item.value}</div>
                      <div className="h-1.5 rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Governance Checklist */}
                <div className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">🏛️ Governance Checklist</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Audit Internal', value: report?.has_internal_audit },
                      { label: 'Anti Fraud Policy', value: report?.has_fraud_policy },
                      { label: 'Anti Corruption Policy', value: report?.has_anti_corruption },
                      { label: 'Laporan Tepat Waktu', value: report?.report_on_time },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <span className="text-lg">{item.value ? '✅' : '❌'}</span>
                        <span className="text-sm text-slate-300">{item.label}</span>
                        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            color: item.value ? '#00d4aa' : '#ef4444',
                            background: item.value ? 'rgba(0,212,170,0.15)' : 'rgba(239,68,68,0.15)'
                          }}>
                          {item.value ? 'Ada' : 'Belum Ada'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emisi Karbon */}
                <div className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <h3 className="font-semibold text-sm mb-4">🌱 Emisi Karbon vs Threshold</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={[{ name: 'Emisi Karbon', value: esg.carbon_emission, threshold: 600 }]}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                      <ReferenceLine y={600} stroke="#ef4444" strokeDasharray="4 4"
                        label={{ value: 'Max 600 ton', fill: '#ef4444', fontSize: 10 }} />
                      <Bar dataKey="value" name="Emisi Aktual (ton)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* F. COMPLIANCE */}
            {activeTab === 'Compliance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Audit Tersedia', value: report?.has_audit, desc: 'Laporan audit keuangan telah tersedia' },
                    { label: 'Anti Fraud Policy', value: report?.has_fraud_policy, desc: 'Kebijakan pencegahan fraud telah diterapkan' },
                    { label: 'Anti Corruption Policy', value: report?.has_anti_corruption, desc: 'Kebijakan anti korupsi telah diterapkan' },
                    { label: 'Legalitas Lengkap', value: report?.has_complete_legality, desc: 'Seluruh dokumen legalitas telah lengkap' },
                    { label: 'Laporan Tepat Waktu', value: report?.report_on_time, desc: 'Laporan disampaikan sesuai deadline OJK' },
                    { label: 'Ada Pelanggaran Regulator', value: report?.has_regulatory_violations, desc: 'Terdapat pelanggaran terhadap regulasi OJK/BI', invert: true },
                    { label: 'ESG Report Tersedia', value: report?.has_esg_report, desc: 'Laporan ESG tahunan telah dipublikasikan' },
                  ].map(item => {
                    const isGood = item.invert ? !item.value : item.value
                    const color = isGood ? '#00d4aa' : item.value === null || item.value === undefined ? '#64748b' : '#ef4444'
                    const status = isGood ? 'Baik' : item.value === null || item.value === undefined ? 'Tidak Ada Data' : 'Perlu Perhatian'
                    return (
                      <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border"
                        style={{ background: `${color}08`, borderColor: `${color}30` }}>
                        <span className="text-2xl">{isGood ? '✅' : '❌'}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
                          {status}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* OJK Regulations */}
                {regs.length > 0 && (
                  <div className="rounded-2xl p-5 border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h3 className="font-semibold text-sm mb-4">⚖️ Status Regulasi OJK</h3>
                    <div className="space-y-3">
                      {regs.map(reg => (
                        <div key={reg.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                          <div className="flex items-center gap-2">
                            <span>{reg.status === 'compliant' ? '✅' : reg.status === 'warning' ? '⚠️' : '❌'}</span>
                            <span className="text-sm text-slate-300">{reg.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-white/5">
                              <div className="h-full rounded-full" style={{ width: `${reg.score}%`, background: getColor(reg.status) }} />
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                              style={{ color: getColor(reg.status), background: `${getColor(reg.status)}15` }}>
                              {reg.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* G. SDG */}
            {activeTab === 'SDG' && (
              <div className="space-y-4">
                {/* SDG 12 */}
                <div className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">♻️</span>
                    <div>
                      <h3 className="font-semibold text-sm">SDG 12 — Konsumsi & Produksi Berkelanjutan</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Sustainability & Environmental indicators</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Emisi Karbon',
                        value: esg ? Math.max(0, 100 - ((esg.carbon_emission / 600) * 100)) : 0,
                        desc: `${esg?.carbon_emission ?? 0} ton (threshold: < 600 ton)`,
                        achieved: (esg?.carbon_emission ?? 0) < 600
                      },
                      {
                        label: 'Energi Terbarukan',
                        value: report?.renewable_energy_pct ?? 0,
                        desc: `${report?.renewable_energy_pct ?? 0}% penggunaan energi terbarukan`,
                        achieved: (report?.renewable_energy_pct ?? 0) >= 30
                      },
                      {
                        label: 'Environmental Score',
                        value: esg?.environmental_score ?? 0,
                        desc: `Score: ${esg?.environmental_score ?? 0}/100`,
                        achieved: (esg?.environmental_score ?? 0) >= 60
                      },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span>{item.achieved ? '✅' : '⚠️'}</span>
                            <span className="text-sm text-slate-300">{item.label}</span>
                          </div>
                          <span className="text-xs font-bold" style={{ color: item.achieved ? '#00d4aa' : '#f59e0b' }}>
                            {item.value.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, item.value)}%`, background: item.achieved ? '#00d4aa' : '#f59e0b' }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SDG 16 */}
                <div className="rounded-2xl p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h3 className="font-semibold text-sm">SDG 16 — Tata Kelola yang Baik</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Governance, Peace & Justice indicators</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Governance Score', value: esg?.governance_score ?? 0, desc: `Score: ${esg?.governance_score ?? 0}/100`, achieved: (esg?.governance_score ?? 0) >= 65 },
                      { label: 'Audit Internal', value: report?.has_internal_audit ? 100 : 0, desc: report?.has_internal_audit ? 'Audit internal tersedia' : 'Audit internal belum tersedia', achieved: report?.has_internal_audit },
                      { label: 'Anti Corruption', value: report?.has_anti_corruption ? 100 : 0, desc: report?.has_anti_corruption ? 'Kebijakan anti korupsi aktif' : 'Kebijakan anti korupsi belum ada', achieved: report?.has_anti_corruption },
                      { label: 'Compliance OJK', value: regs.length > 0 ? (regs.filter(r => r.status === 'compliant').length / regs.length) * 100 : 0, desc: `${regs.filter(r => r.status === 'compliant').length}/${regs.length} regulasi terpenuhi`, achieved: regs.every(r => r.status === 'compliant') },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span>{item.achieved ? '✅' : '⚠️'}</span>
                            <span className="text-sm text-slate-300">{item.label}</span>
                          </div>
                          <span className="text-xs font-bold" style={{ color: item.achieved ? '#00d4aa' : '#f59e0b' }}>
                            {item.value.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, item.value)}%`, background: item.achieved ? '#00d4aa' : '#f59e0b' }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}