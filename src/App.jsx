import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import Sidebar from './components/Sidebar'
import InstallBanner from './components/InstallBanner'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Home from './pages/Home'
import NovoSimulado from './pages/NovoSimulado'
import SimuladoDetail from './pages/SimuladoDetail'
import Dashboard from './pages/Dashboard'
import Conteudos from './pages/Conteudos'
import MentorPanel from './pages/MentorPanel'
import Perfil from './pages/Perfil'
import Cronograma from './pages/Cronograma'
import Gabarito from './pages/Gabarito'
import './styles/global.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Carregando...</div>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  return children
}

function MentorRoute({ children }) {
  const { isMentor, loading } = useAuth()
  if (loading) return null
  if (!isMentor) return <Navigate to="/app" replace />
  return children
}

function AppLayout() {
  const { user, signOut } = useAuth()
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSignOut={signOut} userEmail={user?.email} />
      <div className="main-content">
        <div className="mobile-header">
          <button className="btn btn-icon" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>Direction</span>
          <div style={{ width: 36 }} />
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/novo-simulado" element={<NovoSimulado />} />
          <Route path="/simulado/:id" element={<SimuladoDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/conteudos" element={<Conteudos />} />
          <Route path="/cronograma" element={<Cronograma />} />
          <Route path="/gabarito" element={<Gabarito />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/mentor" element={<MentorRoute><MentorPanel /></MentorRoute>} />
        </Routes>
      </div>
      <button className="theme-toggle-btn" onClick={toggle} title={dark ? 'Modo claro' : 'Modo escuro'}>
        {dark ? '☀️' : '🌙'}
      </button>
      <InstallBanner />
    </div>
  )
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#08082A' }}>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Carregando...</div>
    </div>
  )
  if (user) return <Navigate to="/app" replace />
  return <Landing />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
