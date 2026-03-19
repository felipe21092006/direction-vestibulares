import { useSimulados } from '../hooks/useSimulados'
import { formatDate } from '../hooks/useStorage'
import { AREA_COLORS } from '../data/enemContent'

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

function scoreColor(pct) {
  if (pct >= 70) return '#059669'
  if (pct >= 50) return '#D97706'
  return '#DC2626'
}

function ScoreEvolution({ simulados }) {
  if (simulados.length < 2) return null
  const sorted = [...simulados].sort((a, b) => new Date(a.data) - new Date(b.data)).slice(-8)
  const scores = sorted.map(s => ({
    data: formatDate(s.data),
    nome: s.nome,
    pct: Math.round(((s.total_questoes - (s.erros || []).length) / s.total_questoes) * 100),
  }))
  const min = Math.max(0, Math.min(...scores.map(s => s.pct)) - 10)

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Evolução do aproveitamento</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {scores.map((s, i) => {
          const h = ((s.pct - min) / (100 - min)) * 100
          const color = scoreColor(s.pct)
          return (
            <div key={i} title={s.nome} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color }}>{s.pct}%</div>
              <div style={{ width: '100%', height: `${Math.max(h, 8)}%`, background: color, borderRadius: '4px 4px 0 0', minHeight: 8 }} />
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>{s.data}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ComparativoSimulados({ simulados }) {
  if (simulados.length < 2) return null
  const sorted = [...simulados].sort((a, b) => new Date(a.data) - new Date(b.data))

  // Comparar primeiro vs último
  const primeiro = sorted[0]
  const ultimo   = sorted[sorted.length - 1]

  const pctPrimeiro = Math.round(((primeiro.total_questoes - (primeiro.erros || []).length) / primeiro.total_questoes) * 100)
  const pctUltimo   = Math.round(((ultimo.total_questoes   - (ultimo.erros   || []).length) / ultimo.total_questoes)   * 100)
  const diff = pctUltimo - pctPrimeiro
  const diffColor = diff > 0 ? '#059669' : diff < 0 ? '#DC2626' : '#6B7280'
  const diffLabel = diff > 0 ? `+${diff}pp` : diff < 0 ? `${diff}pp` : '0pp'

  // Erros por tipo ao longo do tempo
  const timeline = sorted.map(s => {
    const erros = s.erros || []
    return {
      nome: s.nome,
      data: formatDate(s.data),
      atencao: erros.filter(e => e.tipo === 'atencao').length,
      interpretacao: erros.filter(e => e.tipo === 'interpretacao').length,
      conteudo: erros.filter(e => e.tipo === 'conteudo').length,
      total: erros.length,
    }
  })

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Comparativo entre simulados</div>

      {/* Primeiro vs Último */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>PRIMEIRO SIMULADO</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{primeiro.nome}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDate(primeiro.data)}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor(pctPrimeiro), marginTop: 6, fontFamily: 'var(--font-display)' }}>{pctPrimeiro}%</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: diffColor, fontFamily: 'var(--font-display)' }}>{diffLabel}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{diff > 0 ? '↑ melhora' : diff < 0 ? '↓ piora' : '= igual'}</div>
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>ÚLTIMO SIMULADO</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{ultimo.nome}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDate(ultimo.data)}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor(pctUltimo), marginTop: 6, fontFamily: 'var(--font-display)' }}>{pctUltimo}%</div>
        </div>
      </div>

      {/* Timeline de erros por tipo */}
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--text-secondary)' }}>Erros por tipo ao longo dos simulados</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Simulado', 'Data', 'Total', '⚠️ Atenção', '💬 Interp.', '📚 Conteúdo'].map(h => (
                <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeline.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 500 }}>{row.nome}</td>
                <td style={{ padding: '8px 10px', color: 'var(--text-tertiary)' }}>{row.data}</td>
                <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.total}</td>
                <td style={{ padding: '8px 10px', color: '#92400E' }}>{row.atencao}</td>
                <td style={{ padding: '8px 10px', color: '#3730A3' }}>{row.interpretacao}</td>
                <td style={{ padding: '8px 10px', color: '#991B1B' }}>{row.conteudo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { simulados, loading } = useSimulados()
  const allErros = simulados.flatMap(s => s.erros || [])

  if (loading) return <div className="empty-state"><div className="empty-sub">Carregando...</div></div>

  if (!simulados.length) return (
    <div>
      <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <div className="empty-title">Sem dados ainda</div>
        <div className="empty-sub">Cadastre simulados para ver as análises</div>
      </div>
    </div>
  )

  const totalErros = allErros.length
  const atencao = allErros.filter(e => e.tipo === 'atencao').length
  const interp  = allErros.filter(e => e.tipo === 'interpretacao').length
  const cont    = allErros.filter(e => e.tipo === 'conteudo').length

  const erroPorArea = {}
  allErros.filter(e => e.tipo === 'conteudo' && e.area).forEach(e => { erroPorArea[e.area] = (erroPorArea[e.area] || 0) + 1 })
  const areasSorted = Object.entries(erroPorArea).sort((a, b) => b[1] - a[1])
  const maxArea = areasSorted[0]?.[1] || 1

  const erroPorDisc = {}
  allErros.filter(e => e.tipo === 'conteudo' && e.disciplina).forEach(e => { erroPorDisc[e.disciplina] = (erroPorDisc[e.disciplina] || 0) + 1 })
  const discSorted = Object.entries(erroPorDisc).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const maxDisc = discSorted[0]?.[1] || 1

  const erroPorTopico = {}
  allErros.filter(e => e.tipo === 'conteudo' && e.topico).forEach(e => {
    const key = `${e.disciplina} → ${e.topico}`
    erroPorTopico[key] = (erroPorTopico[key] || 0) + 1
  })
  const topicosSorted = Object.entries(erroPorTopico).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxTopico = topicosSorted[0]?.[1] || 1

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{simulados.length} simulado{simulados.length !== 1 ? 's' : ''} · {totalErros} erros</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total de erros</div><div className="stat-value">{totalErros}</div></div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#92400E' }}>⚠️ Atenção</div>
          <div className="stat-value">{atencao}</div>
          <div className="stat-sub">{totalErros ? Math.round((atencao/totalErros)*100) : 0}% dos erros</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#3730A3' }}>💬 Interpretação</div>
          <div className="stat-value">{interp}</div>
          <div className="stat-sub">{totalErros ? Math.round((interp/totalErros)*100) : 0}% dos erros</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#991B1B' }}>📚 Conteúdo</div>
          <div className="stat-value">{cont}</div>
          <div className="stat-sub">{totalErros ? Math.round((cont/totalErros)*100) : 0}% dos erros</div>
        </div>
      </div>

      {totalErros > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Distribuição por tipo</div>
          <div style={{ display: 'flex', gap: 10, height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
            {atencao > 0 && <div style={{ flex: atencao, background: '#FCD34D' }} />}
            {interp  > 0 && <div style={{ flex: interp,  background: '#818CF8' }} />}
            {cont    > 0 && <div style={{ flex: cont,    background: '#FCA5A5' }} />}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {atencao > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#FCD34D' }}/> Atenção ({atencao})</div>}
            {interp  > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#818CF8' }}/> Interpretação ({interp})</div>}
            {cont    > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#FCA5A5' }}/> Conteúdo ({cont})</div>}
          </div>
        </div>
      )}

      <ScoreEvolution simulados={simulados} />
      <ComparativoSimulados simulados={simulados} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        {areasSorted.length > 0 && (
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Erros por área</div>
            {areasSorted.map(([area, count]) => (
              <BarRow key={area} label={area} value={count} max={maxArea} color={AREA_COLORS[area]?.bg || '#6B7280'} />
            ))}
          </div>
        )}
        {discSorted.length > 0 && (
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Top disciplinas</div>
            {discSorted.map(([disc, count]) => (
              <BarRow key={disc} label={disc} value={count} max={maxDisc} color="#4F46E5" />
            ))}
          </div>
        )}
      </div>

      {topicosSorted.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Top tópicos mais errados</div>
          {topicosSorted.map(([topico, count]) => (
            <BarRow key={topico} label={topico} value={count} max={maxTopico} color="#DC2626" />
          ))}
        </div>
      )}
    </div>
  )
}
