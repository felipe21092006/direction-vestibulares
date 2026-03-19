import { useState } from 'react'
import { useMentor } from '../hooks/useMentor'
import { AREA_COLORS } from '../data/enemContent'
import { Users, BarChart2, TrendingUp, BookOpen, ChevronDown, ChevronRight, X } from 'lucide-react'
import { formatDate } from '../hooks/useStorage'

function scoreColor(pct) {
  if (pct >= 70) return '#059669'
  if (pct >= 50) return '#D97706'
  return '#DC2626'
}

function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="bar-chart-row">
      <div className="bar-label" title={label}>{label}</div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${Math.max(pct, 4)}%`, background: color, color: '#fff' }}>{value}</div>
      </div>
    </div>
  )
}

function EvolucaoChart({ simulados }) {
  if (!simulados || simulados.length < 2) return (
    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '8px 0' }}>
      Mínimo 2 simulados para exibir evolução
    </div>
  )
  const sorted = [...simulados].sort((a, b) => new Date(a.data) - new Date(b.data)).slice(-8)
  const scores = sorted.map(s => ({
    data: formatDate(s.data),
    nome: s.nome,
    pct: Math.round(((s.total_questoes - (s.erros || []).length) / s.total_questoes) * 100),
  }))
  const min = Math.max(0, Math.min(...scores.map(s => s.pct)) - 10)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, marginTop: 8 }}>
      {scores.map((s, i) => {
        const h = ((s.pct - min) / (100 - min)) * 100
        const color = scoreColor(s.pct)
        return (
          <div key={i} title={`${s.nome}: ${s.pct}%`}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color }}>{s.pct}%</div>
            <div style={{ width: '100%', height: `${Math.max(h, 8)}%`, background: color, borderRadius: '3px 3px 0 0', minHeight: 6 }} />
            <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textAlign: 'center' }}>{s.data}</div>
          </div>
        )
      })}
    </div>
  )
}

function AlunoCard({ aluno, onSelect, selected }) {
  const sims = aluno.simulados || []
  const allErros = sims.flatMap(s => s.erros || [])
  const totalErros = allErros.length
  const lastSim = sims[0]
  const lastScore = lastSim
    ? Math.round(((lastSim.total_questoes - (lastSim.erros || []).length) / lastSim.total_questoes) * 100)
    : null

  return (
    <div
      onClick={() => onSelect(aluno)}
      className="sim-card"
      style={{ borderColor: selected ? 'var(--accent)' : undefined, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{aluno.email}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            Desde {formatDate(aluno.created_at?.split('T')[0])}
          </div>
        </div>
        {lastScore !== null && (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: scoreColor(lastScore) }}>
            {lastScore}%
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
        <span>📋 {sims.length} simulado{sims.length !== 1 ? 's' : ''}</span>
        <span>❌ {totalErros} erros</span>
      </div>
    </div>
  )
}

function AlunoDetalhe({ aluno, onClose }) {
  const sims = aluno.simulados || []
  const allErros = sims.flatMap(s => s.erros || [])
  const totalErros = allErros.length
  const atencao = allErros.filter(e => e.tipo === 'atencao').length
  const interp  = allErros.filter(e => e.tipo === 'interpretacao').length
  const cont    = allErros.filter(e => e.tipo === 'conteudo').length

  const erroPorArea = {}
  allErros.filter(e => e.tipo === 'conteudo' && e.area).forEach(e => {
    erroPorArea[e.area] = (erroPorArea[e.area] || 0) + 1
  })
  const areasSorted = Object.entries(erroPorArea).sort((a, b) => b[1] - a[1])
  const maxArea = areasSorted[0]?.[1] || 1

  const erroPorTopico = {}
  allErros.filter(e => e.tipo === 'conteudo' && e.topico).forEach(e => {
    const key = `${e.disciplina} → ${e.topico}`
    erroPorTopico[key] = (erroPorTopico[key] || 0) + 1
  })
  const topicosSorted = Object.entries(erroPorTopico).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxTopico = topicosSorted[0]?.[1] || 1

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{aluno.email}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {sims.length} simulados · {totalErros} erros registrados
          </div>
        </div>
        <button className="btn btn-icon" onClick={onClose}><X size={16} /></button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-label">Simulados</div><div className="stat-value">{sims.length}</div></div>
        <div className="stat-card"><div className="stat-label" style={{ color: '#92400E' }}>⚠️ Atenção</div><div className="stat-value">{atencao}</div></div>
        <div className="stat-card"><div className="stat-label" style={{ color: '#3730A3' }}>💬 Interpretação</div><div className="stat-value">{interp}</div></div>
        <div className="stat-card"><div className="stat-label" style={{ color: '#991B1B' }}>📚 Conteúdo</div><div className="stat-value">{cont}</div></div>
      </div>

      {/* Evolução */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-title">Evolução do aproveitamento</div>
        <EvolucaoChart simulados={sims} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Erros por área */}
        {areasSorted.length > 0 && (
          <div>
            <div className="section-title">Erros por área</div>
            {areasSorted.map(([area, count]) => (
              <BarRow key={area} label={area} value={count} max={maxArea} color={AREA_COLORS[area]?.bg || '#6B7280'} />
            ))}
          </div>
        )}

        {/* Top tópicos */}
        {topicosSorted.length > 0 && (
          <div>
            <div className="section-title">Tópicos mais errados</div>
            {topicosSorted.map(([topico, count]) => (
              <BarRow key={topico} label={topico} value={count} max={maxTopico} color="#DC2626" />
            ))}
          </div>
        )}
      </div>

      {/* Lista de simulados */}
      <div>
        <div className="section-title">Simulados</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sims.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Nenhum simulado ainda</div>
          ) : sims.map(sim => {
            const erros = sim.erros || []
            const pct = Math.round(((sim.total_questoes - erros.length) / sim.total_questoes) * 100)
            return (
              <div key={sim.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{sim.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{formatDate(sim.data)} · {erros.length} erros</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: scoreColor(pct) }}>{pct}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ComparativoChart({ alunos }) {
  if (alunos.length < 2) return null
  const alunosComSims = alunos.filter(a => a.simulados?.length > 0)
  if (alunosComSims.length < 2) return null

  const dados = alunosComSims.map(aluno => {
    const sims = aluno.simulados || []
    const scores = sims.map(s =>
      Math.round(((s.total_questoes - (s.erros || []).length) / s.total_questoes) * 100)
    )
    const media = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const ultimo = scores[0] || 0
    return { email: aluno.email.split('@')[0], media, ultimo, total: sims.length }
  }).sort((a, b) => b.media - a.media).slice(0, 8)

  const maxMedia = Math.max(...dados.map(d => d.media), 1)

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Comparativo de aproveitamento médio</div>
      {dados.map(d => (
        <div key={d.email} className="bar-chart-row">
          <div className="bar-label" title={d.email}>{d.email}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{
              width: `${Math.max((d.media / maxMedia) * 100, 4)}%`,
              background: scoreColor(d.media), color: '#fff'
            }}>
              {d.media}%
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', width: 60, flexShrink: 0, textAlign: 'right' }}>
            {d.total} sim.
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MentorPanel() {
  const { alunos, loading } = useMentor()
  const [alunoSel, setAlunoSel] = useState(null)
  const [aba, setAba] = useState('alunos') // 'alunos' | 'comparativo' | 'conteudos'

  const allErros = alunos.flatMap(a => (a.simulados || []).flatMap(s => s.erros || []))

  const erroPorArea = {}
  allErros.filter(e => e.tipo === 'conteudo' && e.area).forEach(e => {
    erroPorArea[e.area] = (erroPorArea[e.area] || 0) + 1
  })
  const areasSorted = Object.entries(erroPorArea).sort((a, b) => b[1] - a[1])
  const maxArea = areasSorted[0]?.[1] || 1

  const erroPorTopico = {}
  allErros.filter(e => e.tipo === 'conteudo' && e.topico).forEach(e => {
    const key = `${e.disciplina} → ${e.topico}`
    erroPorTopico[key] = (erroPorTopico[key] || 0) + 1
  })
  const topicosSorted = Object.entries(erroPorTopico).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const maxTopico = topicosSorted[0]?.[1] || 1

  if (loading) return <div className="empty-state"><div className="empty-sub">Carregando dados dos alunos...</div></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Painel do Mentor</h1>
        <p className="page-subtitle">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Stats gerais */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Alunos</div>
          <div className="stat-value">{alunos.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Simulados totais</div>
          <div className="stat-value">{alunos.reduce((s, a) => s + (a.simulados || []).length, 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Erros registrados</div>
          <div className="stat-value">{allErros.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Erros de conteúdo</div>
          <div className="stat-value">{allErros.filter(e => e.tipo === 'conteudo').length}</div>
        </div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {[
          { id: 'alunos',      label: 'Alunos',         icon: <Users size={14} /> },
          { id: 'comparativo', label: 'Comparativo',    icon: <BarChart2 size={14} /> },
          { id: 'conteudos',   label: 'Conteúdos mais errados', icon: <BookOpen size={14} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setAba(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', background: 'none', border: 'none',
            borderBottom: `2px solid ${aba === t.id ? 'var(--accent)' : 'transparent'}`,
            color: aba === t.id ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'all .15s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ABA: Alunos */}
      {aba === 'alunos' && (
        <div>
          {alunos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">Nenhum aluno cadastrado ainda</div>
              <div className="empty-sub">Os alunos aparecerão aqui após se cadastrarem no site</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {alunos.map(a => (
                  <AlunoCard
                    key={a.id}
                    aluno={a}
                    selected={alunoSel?.id === a.id}
                    onSelect={(aluno) => setAlunoSel(alunoSel?.id === aluno.id ? null : aluno)}
                  />
                ))}
              </div>
              {alunoSel && (
                <AlunoDetalhe aluno={alunoSel} onClose={() => setAlunoSel(null)} />
              )}
            </>
          )}
        </div>
      )}

      {/* ABA: Comparativo */}
      {aba === 'comparativo' && (
        <div>
          <ComparativoChart alunos={alunos} />
          {alunos.filter(a => a.simulados?.length > 0).length < 2 && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-title">Dados insuficientes</div>
              <div className="empty-sub">É necessário pelo menos 2 alunos com simulados para comparar</div>
            </div>
          )}

          {/* Tabela comparativa */}
          {alunos.filter(a => a.simulados?.length > 0).length >= 2 && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Tabela comparativa</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Aluno', 'Simulados', 'Total erros', 'Atenção', 'Interpretação', 'Conteúdo', 'Último aproveit.'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.filter(a => a.simulados?.length > 0)
                      .sort((a, b) => (b.simulados?.length || 0) - (a.simulados?.length || 0))
                      .map(aluno => {
                        const sims = aluno.simulados || []
                        const erros = sims.flatMap(s => s.erros || [])
                        const lastSim = sims[0]
                        const lastPct = lastSim
                          ? Math.round(((lastSim.total_questoes - (lastSim.erros || []).length) / lastSim.total_questoes) * 100)
                          : null
                        return (
                          <tr key={aluno.id} style={{ borderBottom: '1px solid var(--border)' }}
                            onClick={() => { setAlunoSel(aluno); setAba('alunos') }}
                            className="sim-card" style={{ cursor: 'pointer' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{aluno.email.split('@')[0]}</td>
                            <td style={{ padding: '10px 12px' }}>{sims.length}</td>
                            <td style={{ padding: '10px 12px' }}>{erros.length}</td>
                            <td style={{ padding: '10px 12px', color: '#92400E' }}>{erros.filter(e => e.tipo === 'atencao').length}</td>
                            <td style={{ padding: '10px 12px', color: '#3730A3' }}>{erros.filter(e => e.tipo === 'interpretacao').length}</td>
                            <td style={{ padding: '10px 12px', color: '#991B1B' }}>{erros.filter(e => e.tipo === 'conteudo').length}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: lastPct ? scoreColor(lastPct) : 'var(--text-tertiary)' }}>
                              {lastPct ? `${lastPct}%` : '—'}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: Conteúdos mais errados */}
      {aba === 'conteudos' && (
        <div>
          {allErros.filter(e => e.tipo === 'conteudo').length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">Nenhum erro de conteúdo ainda</div>
              <div className="empty-sub">Os conteúdos mais errados pelos alunos aparecerão aqui</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {areasSorted.length > 0 && (
                <div className="card">
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Erros por área</div>
                  {areasSorted.map(([area, count]) => (
                    <BarRow key={area} label={area} value={count} max={maxArea} color={AREA_COLORS[area]?.bg || '#6B7280'} />
                  ))}
                </div>
              )}
              {topicosSorted.length > 0 && (
                <div className="card">
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Top tópicos mais errados</div>
                  {topicosSorted.map(([topico, count]) => (
                    <BarRow key={topico} label={topico} value={count} max={maxTopico} color="#DC2626" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
