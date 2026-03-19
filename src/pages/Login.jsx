import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BookOpen } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [modo, setModo] = useState('login') // 'login' | 'cadastro'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setErro('')
    setSucesso('')
    if (!email || !senha) { setErro('Preencha email e senha.'); return }
    if (senha.length < 6) { setErro('A senha precisa ter pelo menos 6 caracteres.'); return }
    setLoading(true)

    if (modo === 'login') {
      const { error } = await signIn(email, senha)
      if (error) {
        setErro('Email ou senha incorretos.')
      } else {
        navigate('/')
      }
    } else {
      const { error } = await signUp(email, senha)
      if (error) {
        setErro('Erro ao criar conta: ' + error.message)
      } else {
        setSucesso('Conta criada! Verifique seu email para confirmar o cadastro.')
        setModo('login')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Direction
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Vestibulares · Mapeamento de Erros
          </div>
        </div>

        {/* Card */}
        <div className="card">
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
            {['login', 'cadastro'].map(m => (
              <button key={m} onClick={() => { setModo(m); setErro(''); setSucesso('') }} style={{
                flex: 1, padding: '10px', background: 'none', border: 'none',
                borderBottom: `2px solid ${modo === m ? 'var(--accent)' : 'transparent'}`,
                color: modo === m ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .15s',
                fontFamily: 'var(--font-body)',
              }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Erro */}
          {erro && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#991B1B', borderRadius: 8, padding: '10px 14px',
              fontSize: 13, marginBottom: 16,
            }}>
              {erro}
            </div>
          )}

          {/* Sucesso */}
          {sucesso && (
            <div style={{
              background: '#ECFDF5', border: '1px solid #A7F3D0',
              color: '#065F46', borderRadius: 8, padding: '10px 14px',
              fontSize: 13, marginBottom: 16,
            }}>
              {sucesso}
            </div>
          )}

          {/* Form */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              className="form-input"
              type="password"
              placeholder="mínimo 6 caracteres"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-tertiary)' }}>
          Direction Vestibulares © 2025
        </div>
      </div>
    </div>
  )
}
