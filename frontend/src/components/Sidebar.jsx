import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ collapsed, onToggle, navItems, bottomItems }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <aside
      className="fixed top-0 left-0 h-full z-40 flex flex-col bg-white/[0.03] border-r border-white/[0.06] transition-all duration-300"
      style={{ width: collapsed ? '64px' : '256px' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
          {!collapsed && <span className="font-extrabold text-lg whitespace-nowrap">Admin Panel</span>}
        </div>
        <button
          onClick={onToggle}
          className="text-slate-500 hover:text-white text-sm flex-shrink-0 w-6 h-6 flex items-center justify-center"
        >
          {collapsed ? '>>' : '<<'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                color:      isActive ? '#f59e0b' : '#94a3b8',
                background: isActive ? 'rgba(245,158,11,0.08)' : 'transparent',
              }}
            >
              <span className="flex-shrink-0 text-base">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.06]">
        {bottomItems?.map(item => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-white hover:bg-white/5 transition-all mb-1"
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <span>🚪</span>
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}