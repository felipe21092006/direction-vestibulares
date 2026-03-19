import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  Target, BookOpen, BarChart2, Users, CheckCircle,
  MessageCircle, X, ChevronRight, Star, Zap, Trophy
} from 'lucide-react'

// ── Modal de Login ────────────────────────────────────────────────
function LoginModal({ onClose, onSuccess }) {
  const { signIn, signUp } = useAuth()
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setErro(''); setSucesso('')
    if (!email || !senha) { setErro('Preencha email e senha.'); return }
    if (senha.length < 6) { setErro('A senha precisa ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    if (modo === 'login') {
      const { error } = await signIn(email, senha)
      if (error) setErro('Email ou senha incorretos.')
      else onSuccess()
    } else {
      const { error } = await signUp(email, senha)
      if (error) setErro('Erro ao criar conta: ' + error.message)
      else { setSucesso('Conta criada! Faça login para continuar.'); setModo('login') }
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#0D0D35', border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 20, padding: 36, width: '100%', maxWidth: 400,
        boxShadow: '0 0 60px rgba(0,212,255,0.15)',
        animation: 'modalIn .25s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-display)' }}>
              {modo === 'login' ? 'Entrar na plataforma' : 'Criar conta'}
            </div>
            <div style={{ color: '#00D4FF', fontSize: 13, marginTop: 2 }}>Direction Vestibulares</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
          {['login', 'cadastro'].map(m => (
            <button key={m} onClick={() => { setModo(m); setErro(''); setSucesso('') }} style={{
              flex: 1, padding: '10px', background: 'none', border: 'none',
              borderBottom: `2px solid ${modo === m ? '#00D4FF' : 'transparent'}`,
              color: modo === m ? '#00D4FF' : 'rgba(255,255,255,0.4)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all .15s',
            }}>
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {erro && (
          <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {erro}
          </div>
        )}
        {sucesso && (
          <div style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {sucesso}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Email</label>
          <input
            type="email" placeholder="seu@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontFamily: 'var(--font-body)', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Senha</label>
          <input
            type="password" placeholder="mínimo 6 caracteres" value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontFamily: 'var(--font-body)', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: 10,
          background: 'linear-gradient(135deg, #00D4FF, #0066FF)',
          border: 'none', color: '#fff', fontWeight: 800, fontSize: 15,
          cursor: 'pointer', fontFamily: 'var(--font-body)',
          opacity: loading ? 0.7 : 1, transition: 'opacity .15s',
          boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
        }}>
          {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'}
        </button>
      </div>
    </div>
  )
}

// ── Seções ───────────────────────────────────────────────────────
const NUMEROS = [
  { num: '11', label: 'alunos com 800+ no ENEM 2025' },
  { num: '95%', label: 'de aprovação nos mentorados' },
  { num: '3x', label: 'mais eficiência nos estudos' },
  { num: '100%', label: 'foco no ENEM' },
]

const COMO_FUNCIONA = [
  { icon: <Target size={24} />, titulo: 'Diagnóstico inicial', desc: 'Mapeamos seu nível atual, pontos fortes e lacunas para montar um plano personalizado.' },
  { icon: <BookOpen size={24} />, titulo: 'Plano de estudos', desc: 'Cronograma semanal adaptado à sua rotina escolar, priorizando o que mais cai no ENEM.' },
  { icon: <BarChart2 size={24} />, titulo: 'Simulados semanais', desc: 'Simulados toda semana com análise detalhada de erros — atenção, interpretação ou conteúdo.' },
  { icon: <Zap size={24} />, titulo: 'Mentoria contínua', desc: 'Acompanhamento próximo com mentores que já passaram pelo processo e entendem o que você sente.' },
]

const INCLUSOS = [
  'Plataforma exclusiva de mapeamento de erros',
  'Cronograma inverso personalizado',
  'Simulados semanais corrigidos',
  'Mentoria individual com feedback',
  'Mapa completo de conteúdos do ENEM',
  'Dashboard de evolução em tempo real',
  'Suporte via WhatsApp',
  'Grupo de estudos com outros mentorados',
]

const DEPOIMENTOS = [
  { nome: 'Ana Clara', curso: 'Medicina — UFSE', texto: 'A Direction mudou minha forma de estudar. O mapeamento de erros me fez entender onde eu realmente precisava focar.', nota: 5 },
  { nome: 'Pedro Henrique', curso: 'Direito — UFS', texto: 'Antes eu estudava muito, mas sem direção. Com a mentoria aprendi a estudar certo e minha nota no ENEM subiu 120 pontos.', nota: 5 },
  { nome: 'Mariana S.', curso: 'Engenharia — UFBA', texto: 'O suporte constante faz toda a diferença. Sempre que tive dúvida ou dificuldade, o mentor estava lá para ajudar.', nota: 5 },
]

// ── Componente principal ─────────────────────────────────────────
export default function Landing() {
  const [showLogin, setShowLogin] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleLoginSuccess = () => {
    setShowLogin(false)
    navigate('/')
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#08082A', color: '#fff', minHeight: '100vh' }}>
      <style>{`
        @keyframes modalIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .landing-btn-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 16px 36px; border-radius: 50px;
          background: linear-gradient(135deg, #00D4FF, #0066FF);
          border: none; color: #fff; font-weight: 800; font-size: 16px;
          cursor: pointer; font-family: var(--font-body);
          box-shadow: 0 8px 32px rgba(0,212,255,0.35);
          transition: all .2s; text-decoration: none;
        }
        .landing-btn-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,212,255,0.45); }
        .landing-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 50px;
          background: transparent;
          border: 2px solid rgba(255,255,255,0.3); color: #fff; font-weight: 700; font-size: 15px;
          cursor: pointer; font-family: var(--font-body);
          transition: all .2s;
        }
        .landing-btn-outline:hover { border-color: #00D4FF; color: #00D4FF; }
        .num-card { text-align: center; padding: 32px 20px; }
        .num-card .num { font-family: var(--font-display); font-size: 52px; font-weight: 800; background: linear-gradient(135deg, #00D4FF, #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
        .num-card .lbl { font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 8px; }
        .step-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; transition: all .2s; }
        .step-card:hover { background: rgba(0,212,255,0.06); border-color: rgba(0,212,255,0.2); transform: translateY(-4px); }
        .step-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(0,212,255,0.15); display: flex; align-items: center; justify-content: center; color: #00D4FF; margin-bottom: 16px; }
        .dep-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; }
        .section-label { font-size: 12px; font-weight: 700; color: #00D4FF; text-transform: uppercase; letter-spacing: .15em; margin-bottom: 12px; }
        .section-title { font-family: var(--font-display); font-size: clamp(28px, 5vw, 44px); font-weight: 800; line-height: 1.15; }
        .nav-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-weight: 500; transition: color .15s; }
        .nav-link:hover { color: #00D4FF; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,8,42,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 clamp(20px, 5vw, 80px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-0.02em' }}>
            DIRECTION
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00D4FF', letterSpacing: '.12em', textTransform: 'uppercase' }}>
            Vestibulares
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#como-funciona" className="nav-link" style={{ display: 'none' }}>Como funciona</a>
          <a href="#resultados" className="nav-link">Resultados</a>
          <a href="#inclusos" className="nav-link">O que inclui</a>
          {user ? (
            <button className="landing-btn-cta" style={{ padding: '10px 22px', fontSize: 14 }} onClick={() => navigate('/')}>
              Acessar plataforma
            </button>
          ) : (
            <button className="landing-btn-cta" style={{ padding: '10px 22px', fontSize: 14 }} onClick={() => setShowLogin(true)}>
              Entrar
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center',
        padding: 'clamp(60px, 10vh, 120px) clamp(20px, 8vw, 120px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background gradients */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,102,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 700, position: 'relative' }}>
          <div className="section-label" style={{ marginBottom: 20 }}>🚀 Mentoria para o ENEM</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.05, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
            Sua aprovação<br />
            <span style={{ background: 'linear-gradient(135deg, #00D4FF, #0066FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              começa aqui.
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 40px', maxWidth: 520 }}>
            A Direction transforma estudantes comuns em aprovados. Com mentoria individualizada, mapeamento de erros e cronograma inteligente, você estuda menos e aprende mais.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="landing-btn-cta" onClick={() => setShowLogin(true)}>
              Quero ser mentorado <ChevronRight size={18} />
            </button>
            <a href="https://wa.me/5579999999999" target="_blank" rel="noopener noreferrer" className="landing-btn-outline">
              <MessageCircle size={17} /> Falar no WhatsApp
            </a>
          </div>
          <div style={{ marginTop: 40, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {['11 alunos com 800+ no ENEM', '95% de aprovação', 'Suporte 7 dias/semana'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                <CheckCircle size={15} color="#00D4FF" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section id="resultados" style={{ background: 'rgba(0,212,255,0.04)', borderTop: '1px solid rgba(0,212,255,0.1)', borderBottom: '1px solid rgba(0,212,255,0.1)', padding: '20px clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {NUMEROS.map(n => (
            <div key={n.num} className="num-card">
              <div className="num">{n.num}</div>
              <div className="lbl">{n.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Como funciona</div>
            <h2 className="section-title">Do diagnóstico à aprovação</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, marginTop: 14, maxWidth: 500, margin: '14px auto 0' }}>
              Um processo estruturado e comprovado para levar você ao resultado que quer.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {COMO_FUNCIONA.map((s, i) => (
              <div key={i} className="step-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div className="step-icon">{s.icon}</div>
                  <span style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'rgba(255,255,255,0.06)' }}>
                    0{i + 1}
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px', color: '#fff' }}>{s.titulo}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O QUE ESTÁ INCLUSO */}
      <section id="inclusos" style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div>
            <div className="section-label">O que está incluso</div>
            <h2 className="section-title" style={{ marginBottom: 20 }}>Tudo que você precisa<br />em um só lugar</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
              A Direction não é só uma mentoria — é um ecossistema completo de preparação para o ENEM.
            </p>
            <button className="landing-btn-cta" onClick={() => setShowLogin(true)}>
              Começar agora <ChevronRight size={18} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {INCLUSOS.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <CheckCircle size={16} color="#00D4FF" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Depoimentos</div>
            <h2 className="section-title">Quem já passou pela Direction</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {DEPOIMENTOS.map((d, i) => (
              <div key={i} className="dep-card">
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {Array.from({ length: d.nota }).map((_, j) => (
                    <Star key={j} size={14} fill="#00D4FF" color="#00D4FF" />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, margin: '0 0 20px', fontStyle: 'italic' }}>
                  "{d.texto}"
                </p>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{d.nome}</div>
                  <div style={{ fontSize: 12, color: '#00D4FF', marginTop: 2 }}>{d.curso}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px)',
        background: 'linear-gradient(135deg, rgba(0,102,255,0.15), rgba(0,212,255,0.08))',
        borderTop: '1px solid rgba(0,212,255,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Trophy size={48} color="#00D4FF" style={{ marginBottom: 20 }} />
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Pronto para mudar<br />sua trajetória?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, lineHeight: 1.7, marginBottom: 36 }}>
            Junte-se aos alunos que escolheram estudar com direção e colham os resultados no ENEM.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="landing-btn-cta" onClick={() => setShowLogin(true)}>
              Quero minha aprovação <ChevronRight size={18} />
            </button>
            <a href="https://wa.me/5579999999999" target="_blank" rel="noopener noreferrer" className="landing-btn-outline">
              <MessageCircle size={17} /> Falar com um mentor
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '28px clamp(20px, 5vw, 80px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#fff' }}>DIRECTION</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#00D4FF', letterSpacing: '.12em', textTransform: 'uppercase' }}>Vestibulares</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          © 2025 Direction Vestibulares. Todos os direitos reservados.
        </div>
      </footer>

      {/* Modal de login */}
      {showLogin && !user && (
        <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}
