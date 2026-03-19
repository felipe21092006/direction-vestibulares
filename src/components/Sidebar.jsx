import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Plus, BarChart2, Map, LogOut, Shield, User, CalendarDays, ClipboardCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePerfil } from '../hooks/usePerfil'

export default function Sidebar({ open, onClose, onSignOut, userEmail }) {
  const { isMentor } = useAuth()
  const { perfil } = usePerfil()
  const nome = perfil?.nome || userEmail?.split('@')[0] || 'Aluno'
  const initials = nome.charAt(0).toUpperCase()

  return (
    <>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 39 }} onClick={onClose} />
      )}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">Direction</div>
          <div className="logo-sub">Vestibulares · ENEM</div>
        </div>

        <nav className="sidebar-nav">
          {isMentor && (
            <>
              <div className="nav-section-label">Mentor</div>
              <NavLink to="/app/mentor" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
                <Shield /> Painel do Mentor
              </NavLink>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
            </>
          )}

          <div className="nav-section-label">Principal</div>
          <NavLink to="/app" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
            <LayoutDashboard /> Início
          </NavLink>
          <NavLink to="/app/novo-simulado" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
            <Plus /> Novo Simulado
          </NavLink>
          <NavLink to="/app/gabarito" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
            <ClipboardCheck /> Gabarito Inteligente
          </NavLink>

          <div className="nav-section-label" style={{ marginTop: 8 }}>Estudo</div>
          <NavLink to="/app/cronograma" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
            <CalendarDays /> Cronograma
          </NavLink>
          <NavLink to="/app/conteudos" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
            <Map /> Mapa de Conteúdos
          </NavLink>

          <div className="nav-section-label" style={{ marginTop: 8 }}>Análise</div>
          <NavLink to="/app/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
            <BarChart2 /> Dashboard
          </NavLink>

          <div className="nav-section-label" style={{ marginTop: 8 }}>Conta</div>
          <NavLink to="/app/perfil" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}>
            <User /> Meu Perfil
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {perfil?.avatar_url ? (
              <img src={perfil.avatar_url} alt="avatar"
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff',
              }}>{initials}</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {nome}
                {isMentor && (
                  <span style={{ marginLeft: 6, background: '#EDE9FE', color: '#6D28D9', fontSize: 10, padding: '1px 6px', borderRadius: 20, fontWeight: 700 }}>
                    mentor
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </div>
            </div>
          </div>
          <button onClick={onSignOut} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', fontSize: 13, padding: 0, fontFamily: 'var(--font-body)',
          }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>
    </>
  )
}
