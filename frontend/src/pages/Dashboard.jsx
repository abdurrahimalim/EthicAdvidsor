import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS_ESG = ['#22c55e', '#0ea5e9', '#a78bfa']
const COLORS_COMPLIANCE = ['#00d4aa', '#f59e0b', '#ef4444']

const tooltipStyle = {
  contentStyle: { background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' },
  labelStyle: { color: '#e8edf2' },
  cursor: { fill: 'rgba(255,255,255,0.05)' }
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '📤', label: 'Upload Report', path: '/upload' },
  { icon: '🌿', label: 'ESG Report', path: '/esg-report' },
  { icon: '⚖️', label: 'OJK Status', path: '/ojk-status' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
  { icon: '📄', label: 'SDG Reports', path: '/result' },
  { icon: '🕓', label: 'History', path: '/history' },
]
  const BOTTOM_ITEMS = [
  { icon: '👤', label: 'Profile', path: '/profile' },
]

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const latest = data?.latest_report
  const esg = latest?.esg_score
  const regs = latest?.regulations ?? []
  const fin = data?.financial_health
  const trend = data?.trend_data ?? []
  const notifications = data?.notifications ?? []

  const getESGStatus = (score) => {
    if (!score) return { label: 'Belum Ada Data', color: '#64748b' }
    if (score >= 75) return { label: 'Baik', color: '#00d4aa' }
    if (score >= 55) return { label: 'Warning', color: '#f59e0b' }
    return { label: 'Buruk', color: '#ef4444' }
  }

  const getOJKStatus = (regs) => {
    if (!regs.length) return { label: 'Belum Ada Data', color: '#64748b' }
    const nonCompliant = regs.filter(r => r.status === 'non-compliant').length
    const warning = regs.filter(r => r.status === 'warning').length
    if (nonCompliant > 0) return { label: 'Tidak Patuh', color: '#ef4444' }
    if (warning > 0) return { label: 'Warning', color: '#f59e0b' }
    return { label: 'Patuh', color: '#00d4aa' }
  }

  const getSDGStatus = (sdgNum, report) => {
    if (!report) return { label: 'Belum Ada Data', color: '#64748b' }
    if (sdgNum === 12) {
      const ok = (report.carbon_emission ?? 0) < 600
      return ok ? { label: 'Tercapai', color: '#00d4aa' } : { label: 'Belum', color: '#f59e0b' }
    }
    if (sdgNum === 16) {
      const ok = report.has_internal_audit && report.has_anti_corruption
      return ok ? { label: 'Tercapai', color: '#00d4aa' } : { label: 'Belum', color: '#f59e0b' }
    }
  }

  const esgStatus = getESGStatus(esg?.overall_score)
  const ojkStatus = getOJKStatus(regs)
  const sdg12Status = getSDGStatus(12, latest)
  const sdg16Status = getSDGStatus(16, latest)
  const finStatus = fin ? { label: fin.status, color: fin.status === 'Sehat' ? '#00d4aa' : fin.status === 'Warning' ? '#f59e0b' : '#ef4444' } : { label: 'Belum Ada Data', color: '#64748b' }

  const complianceDonut = [
    { name: 'Patuh', value: regs.filter(r => r.status === 'compliant').length },
    { name: 'Warning', value: regs.filter(r => r.status === 'warning').length },
    { name: 'Tidak Patuh', value: regs.filter(r => r.status === 'non-compliant').length },
  ].filter(d => d.value > 0)

  const finBarData = fin ? [
    { name: 'ROA (%)', value: fin.roa, target: 5 },
    { name: 'ROE (%)', value: fin.roe, target: 10 },
    { name: 'DER', value: fin.der, target: 2 },
    { name: 'Likuiditas', value: fin.liquidity_ratio, target: 1 },
  ] : []

  return (
    <div className="min-h-screen flex" style={{ background: '#080c10', color: '#e8edf2' }}>
    <Sidebar
      collapsed={collapsed}
      onToggle={() => setCollapsed(!collapsed)}
      navItems={NAV_ITEMS}
      bottomItems={BOTTOM_ITEMS}
    />    
      <main className="flex-1 min-h-screen" style={{ marginLeft: '240px' }}>
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(8,12,16,0.9)', backdropFilter: 'blur(12px)' }}>
          <div>
            <h1 className="font-extrabold text-lg">Dashboard</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {latest ? `${latest.company_name} · ${latest.period_type}` : 'Belum ada laporan'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/upload"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
              style={{ background: '#00d4aa' }}>
              📤 <span className="hidden sm:inline">Upload Laporan</span>
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : !latest ? (
            <div className="rounded-2xl p-10 border border-white/[0.06] text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-5xl mb-4">📊</p>
              <h3 className="font-semibold text-lg mb-2">Belum ada laporan</h3>
              <p className="text-slate-400 text-sm mb-6">Upload laporan pertama untuk melihat dashboard analisis</p>
              <Link to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black"
                style={{ background: '#00d4aa' }}>
                📤 Upload Laporan Sekarang
              </Link>
            </div>
          ) : (
            <>
              {/* A. TOP SUMMARY CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'ESG Score', value: esg?.overall_score ?? '-', status: esgStatus, icon: '🌿' },
                  { label: 'Compliance OJK', value: ojkStatus.label, status: ojkStatus, icon: '⚖️' },
                  { label: 'SDG 12', value: sdg12Status.label, status: sdg12Status, icon: '♻️' },
                  { label: 'SDG 16', value: sdg16Status.label, status: sdg16Status, icon: '🏛️' },
                  { label: 'Financial Health', value: finStatus.label, status: finStatus, icon: '💰' },
                ].map(card => (
                  <div key={card.label}
                    className="rounded-2xl p-4 border border-white/[0.06] relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-10 blur-xl"
                      style={{ background: card.status.color, transform: 'translate(30%,-30%)' }} />
                    <div className="text-xl mb-2">{card.icon}</div>
                    <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                    <p className="font-extrabold text-lg leading-tight" style={{ color: card.status.color }}>
                      {card.value}
                    </p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ color: card.status.color, background: `${card.status.color}20` }}>
                      {card.status.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* B. GRAFIK */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ESG Multi Line Chart */}
                {esg && (
                  <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h3 className="font-semibold text-sm mb-4">🌿 ESG Score Chart</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={trend.length > 1 ? trend : [{
                        period_label: latest.year,
                        env_score: esg.environmental_score,
                        social_score: esg.social_score,
                        gov_score: esg.governance_score,
                      }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="period_label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                        <Tooltip {...tooltipStyle} />
                        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                        <Line type="monotone" dataKey="env_score" name="Environmental" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                        <Line type="monotone" dataKey="social_score" name="Social" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 3 }} />
                        <Line type="monotone" dataKey="gov_score" name="Governance" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Financial Ratio Bar Chart */}
                {fin && (
                  <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h3 className="font-semibold text-sm mb-4">💰 Financial Ratio Chart</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={finBarData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
                )}

                {/* Trend Analysis - hanya muncul jika > 1 periode */}
                {trend.length > 1 && (
                  <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h3 className="font-semibold text-sm mb-4">📈 Trend Analysis</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="period_label" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Tooltip {...tooltipStyle} />
                        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                        <Line type="monotone" dataKey="net_profit" name="Laba Bersih (jt)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="esg_score" name="ESG Score" stroke="#00d4aa" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="carbon" name="Emisi Karbon" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Compliance Donut */}
                {complianceDonut.length > 0 && (
                  <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <h3 className="font-semibold text-sm mb-4">🍩 Compliance Status</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={complianceDonut} cx="50%" cy="50%"
                          innerRadius="40%" outerRadius="65%"
                          paddingAngle={4} dataKey="value">
                          {complianceDonut.map((_, i) => (
                            <Cell key={i} fill={COLORS_COMPLIANCE[i]} />
                          ))}
                        </Pie>
                        <Tooltip cursor={false}
                          contentStyle={{ background: '#0f1419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-1">
                      {[
                        { label: 'Patuh', count: regs.filter(r => r.status === 'compliant').length, color: '#00d4aa' },
                        { label: 'Warning', count: regs.filter(r => r.status === 'warning').length, color: '#f59e0b' },
                        { label: 'Tidak Patuh', count: regs.filter(r => r.status === 'non-compliant').length, color: '#ef4444' },
                      ].map(item => (
                        <div key={item.label} className="text-center">
                          <div className="font-bold" style={{ color: item.color }}>{item.count}</div>
                          <div className="text-xs text-slate-500">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* C. NOTIFICATION PREVIEW */}
              {notifications.length > 0 && (
                <div className="rounded-2xl p-4 md:p-5 border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">🔔 Notifikasi Terbaru</h3>
                    <Link to="/notifications" className="text-xs" style={{ color: '#00d4aa' }}>Lihat semua</Link>
                  </div>
                  <div className="space-y-2">
                    {notifications.map(notif => {
                      const color = notif.type === 'ok' ? '#00d4aa' : notif.type === 'warning' ? '#f59e0b' : '#ef4444'
                      const icon = notif.type === 'ok' ? '✅' : notif.type === 'warning' ? '⚠️' : '❌'
                      return (
                        <div key={notif.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.04]"
                          style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="flex-shrink-0 mt-0.5">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-300 leading-snug">{notif.message}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* D. QUICK ACTION */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: '📤', label: 'Upload Laporan Baru', path: '/upload', color: '#00d4aa' },
                  { icon: '📊', label: 'Lihat Analisis', path: '/result', color: '#0ea5e9' },
                  { icon: '🕒', label: 'History Laporan', path: '/history', color: '#a78bfa' },
                ].map(action => (
                  <Link key={action.label} to={action.path}
                    className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] hover:border-white/20 transition-all"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-sm font-medium text-slate-300">{action.label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}