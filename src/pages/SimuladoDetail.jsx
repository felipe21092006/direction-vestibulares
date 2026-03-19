import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useSimulados } from '../hooks/useSimulados'
import { formatDate } from '../hooks/useStorage'
import { AREA_COLORS } from '../data/enemContent'
import AddErroModal from '../components/AddErroModal'

function scoreColor(pct) {
  if (pct >= 70) return '#059669'
  if (pct >= 50) return '#D97706'
  return '#DC2626'
}

function TipoBadge({ tipo }) {
  if (tipo === 'atencao')       return <span className="badge badge-atencao">⚠️ Atenção</span>
  if (tipo === 'interpretacao') return <span className="badge badge-interp">💬 Interpretação</span>
  if (tipo === 'conteudo')      return <span className="badge badge-conteudo">📚 Conteúdo</span>
  return null
}

const DIA_INFO = {
  dia1: { label: 'Dia 1', cor: '#7C3AED', areas: ['Linguagens e Códigos', 'Ciências Humanas', 'Redação'] },
  dia2: { label: 'Dia 2', cor: '#047857', areas: ['Ciências da Natureza', 'Matemática'] },
}

export default function SimuladoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { simulados, loading, deleteSimulado, addErro, deleteErro } = useSimulados()
  const [showModal, setShowModal] = useState(false)
  const [diaAtivo, setDiaAtivo] = useState(null)

  const sim = simulados.find(s => s.id === id)

  if (loading) return <div className="empty-state"><div className="empty-sub">Carregando...</div></div>

  if (!sim) return (
    <div className="empty-state">
      <div className="empty-icon">😕</div>
      <div className="empty-title">Simulado não encontrado</div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/app')}>← Voltar</button>
    </div>
  )

  const erros = sim.erros || []
  const total = sim.total_questoes || 90
  const pct = Math.round(((total - erros.length) / total) * 100)
  const atencao = erros.filter(e => e.tipo === 'atencao').length
  const interp  = erros.filter(e => e.tipo === 'interpretacao').length
  const cont    = erros.filter(e => e.tipo === 'conteudo').length
  const dias = sim.dias || ['dia1', 'dia2']
  const diaAtivoReal = diaAtivo || dias[0]

  const errosParaMostrar = erros.filter(e => {
    if (e.area) {
      return DIA_INFO[diaAtivoReal]?.areas.includes(e.area)
    }
    return diaAtivoReal === dias[0]
  })

  const handleDelete = async () => {
    if (!confirm(`Excluir "${sim.nome}"?`)) return
    await deleteSimulado(id)
    navigate('/app')
  }

  const handleAddErro = async (erro) => {
    await addErro(id, erro)
  }

  const handleDeleteErro = async (erroId) => {
    if (!confirm('Remover este erro?')) return
    await deleteErro(id, erroId)
  }

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <button className="btn btn-sm" style={{ marginBottom: 10 }} onClick={() => navigate('/app')}>
            <ArrowLeft size={14} /> Voltar
          </button>
          <h1 className="page-title">{sim.nome}</h1>
          <p className="page-subtitle">{formatDate(sim.data)} · {total} questões · {dias.length === 2 ? 'Simulado completo' : DIA_INFO[dias[0]]?.label}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={13} /> Excluir</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Adicionar erro</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-label">Aproveitamento</div>
          <div className="stat-value" style={{ color: scoreColor(pct) }}>{pct}%</div>
          <div className="stat-sub">{total - erros.length} / {total}</div>
        </div>
        <div className="stat-card"><div className="stat-label">Total de erros</div><div className="stat-value">{erros.length}</div></div>
        <div className="stat-card"><div className="stat-label" style={{ color: '#92400E' }}>⚠️ Atenção</div><div className="stat-value">{atencao}</div></div>
        <div className="stat-card"><div className="stat-label" style={{ color: '#3730A3' }}>💬 Interpretação</div><div className="stat-value">{interp}</div></div>
        <div className="stat-card"><div className="stat-label" style={{ color: '#991B1B' }}>📚 Conteúdo</div><div className="stat-value">{cont}</div></div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
          <span>Aproveitamento geral</span>
          <span style={{ fontWeight: 700, color: scoreColor(pct) }}>{pct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: scoreColor(pct) }} />
        </div>
      </div>

      {/* Tabs por dia */}
      {dias.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {dias.map(d => {
            const info = DIA_INFO[d]
            const count = erros.filter(e => e.area ? info.areas.includes(e.area) : d === dias[0]).length
            const ativo = diaAtivoReal === d
            return (
              <button key={d} onClick={() => setDiaAtivo(d)} style={{
                padding: '9px 20px', borderRadius: 8,
                border: `1.5px solid ${ativo ? info.cor : 'var(--border)'}`,
                background: ativo ? `${info.cor}12` : 'var(--surface)',
                color: ativo ? info.cor : 'var(--text-secondary)',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s',
                fontFamily: 'var(--font-body)',
              }}>
                {info.label} · {count} erro{count !== 1 ? 's' : ''}
              </button>
            )
          })}
        </div>
      )}

      {/* Lista de erros */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 0 }}>Erros — {DIA_INFO[diaAtivoReal]?.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{DIA_INFO[diaAtivoReal]?.areas.join(' · ')}</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={13} /> Adicionar</button>
        </div>

        <div className="card" style={{ padding: errosParaMostrar.length === 0 ? 0 : '4px 16px' }}>
          {errosParaMostrar.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <div className="empty-title">Nenhum erro neste dia</div>
              <div className="empty-sub">Clique em "Adicionar erro" para registrar</div>
              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setShowModal(true)}><Plus size={15} /> Adicionar erro</button>
            </div>
          ) : (
            errosParaMostrar.map((e, i) => (
              <div key={e.id} className="erro-item">
                <div className="erro-num">{e.questao ? `Q${e.questao}` : `#${i + 1}`}</div>
                <div className="erro-body">
                  <TipoBadge tipo={e.tipo} />
                  {e.tipo === 'conteudo' && e.disciplina && (
                    <>
                      <div className="erro-discipline">{e.disciplina} — {e.topico}</div>
                      <div className="erro-area">{e.area}</div>
                    </>
                  )}
                  {e.obs && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3, fontStyle: 'italic' }}>{e.obs}</div>}
                </div>
                <button className="btn btn-icon btn-danger" onClick={() => handleDeleteErro(e.id)}><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && <AddErroModal diaAtivo={diaAtivoReal} onClose={() => setShowModal(false)} onSave={handleAddErro} />}
    </div>
  )
}
