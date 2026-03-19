import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useSimulados } from '../hooks/useSimulados'
import { formatDate } from '../hooks/useStorage'

function scoreColor(pct) {
  if (pct >= 70) return '#059669'
  if (pct >= 50) return '#D97706'
  return '#DC2626'
}

export default function Home() {
  const { simulados, loading } = useSimulados()
  const navigate = useNavigate()

  const totalErros = simulados.reduce((s, sim) => s + (sim.erros || []).length, 0)
  const totalSims = simulados.length
  const mediaErros = totalSims ? Math.round(totalErros / totalSims) : 0
  const last = simulados[0]
  const lastScore = last
    ? Math.round(((last.total_questoes - (last.erros || []).length) / last.total_questoes) * 100)
    : null

  if (loading) return (
    <div className="empty-state">
      <div className="empty-sub">Carregando simulados...</div>
    </div>
  )

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Meus Simulados</h1>
          <p className="page-subtitle">Registre e acompanhe seus erros no ENEM</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/app/novo-simulado')}>
          <Plus size={15} /> Novo Simulado
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Simulados feitos</div>
          <div className="stat-value">{totalSims}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total de erros</div>
          <div className="stat-value">{totalErros}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Média de erros</div>
          <div className="stat-value">{mediaErros}</div>
          <div className="stat-sub">por simulado</div>
        </div>
        {lastScore !== null && (
          <div className="stat-card">
            <div className="stat-label">Último aproveitamento</div>
            <div className="stat-value" style={{ color: scoreColor(lastScore) }}>{lastScore}%</div>
            <div className="stat-sub">{last.nome}</div>
          </div>
        )}
      </div>

      {simulados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">Nenhum simulado ainda</div>
          <div className="empty-sub">Clique em "Novo Simulado" para começar</div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/app/novo-simulado')}>
            <Plus size={15} /> Criar primeiro simulado
          </button>
        </div>
      ) : (
        <div>
          <div className="section-title">Histórico</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {simulados.map(sim => {
              const erros = sim.erros || []
              const total = sim.total_questoes || 90
              const pct = Math.round(((total - erros.length) / total) * 100)
              const atencao = erros.filter(e => e.tipo === 'atencao').length
              const interp  = erros.filter(e => e.tipo === 'interpretacao').length
              const cont    = erros.filter(e => e.tipo === 'conteudo').length
              return (
                <div key={sim.id} className="sim-card" onClick={() => navigate(`/app/simulado/${sim.id}`)}>
                  <div className="sim-card-header">
                    <div>
                      <div className="sim-card-name">{sim.nome}</div>
                      <div className="sim-card-date">{formatDate(sim.data)}</div>
                    </div>
                    <div className="sim-score" style={{ color: scoreColor(pct) }}>{pct}%</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {erros.length} erro{erros.length !== 1 ? 's' : ''} de {total} questões
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 10 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: scoreColor(pct) }} />
                  </div>
                  <div className="sim-tags">
                    {atencao > 0 && <span className="badge badge-atencao">⚠️ {atencao} atenção</span>}
                    {interp  > 0 && <span className="badge badge-interp">💬 {interp} interp.</span>}
                    {cont    > 0 && <span className="badge badge-conteudo">📚 {cont} conteúdo</span>}
                    {erros.length === 0 && <span className="badge badge-success">✓ Sem erros</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
