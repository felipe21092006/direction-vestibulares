import { useState, useMemo } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, BookOpen, CheckCircle } from 'lucide-react'
import { useCronograma } from '../hooks/useCronograma'
import { ENEM_CONTENT, AREAS } from '../data/enemContent'
import Modal from '../components/Modal'

// ── helpers de data ──────────────────────────────────────────────
function toYMD(date) {
  return date.toISOString().split('T')[0]
}
function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay() // 0=dom
  d.setDate(d.getDate() - day)
  return d
}
function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}
function formatDia(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}`
}
function nomeDia(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ── Modal de adicionar conteúdo ──────────────────────────────────
function AddConteudoModal({ data, onClose, onSave }) {
  const [materia, setMateria] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [topico, setTopico] = useState('')

  const conteudos = materia
    ? Object.keys(ENEM_CONTENT[materia]).filter(k => k !== 'color' && k !== 'colorLight')
    : []
  const topicos = (materia && conteudo)
    ? Object.keys(ENEM_CONTENT[materia][conteudo] || {})
    : []

  const handleMateria = (v) => { setMateria(v); setConteudo(''); setTopico('') }
  const handleConteudo = (v) => { setConteudo(v); setTopico('') }

  const canSave = materia && conteudo && (topicos.length === 0 || topico)

  const handleSave = async () => {
    if (!canSave) return
    await onSave({
      data,
      materia,
      conteudo,
      topico: topico || conteudo,
    })
    onClose()
  }

  const [y, m, d] = data.split('-')

  return (
    <Modal
      title={`Adicionar conteúdo — ${d}/${m}/${y}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}
            disabled={!canSave} style={{ opacity: canSave ? 1 : 0.45 }}>
            Adicionar
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Matéria</label>
        <select className="form-select" value={materia} onChange={e => handleMateria(e.target.value)}>
          <option value="">Selecione...</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {materia && (
        <div className="form-group" style={{ paddingLeft: 16, borderLeft: '2px solid var(--border)' }}>
          <label className="form-label">Conteúdo</label>
          <select className="form-select" value={conteudo} onChange={e => handleConteudo(e.target.value)}>
            <option value="">Selecione...</option>
            {conteudos.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {conteudo && topicos.length > 0 && (
        <div className="form-group" style={{ paddingLeft: 32, borderLeft: '2px solid var(--border)' }}>
          <label className="form-label">Tópico</label>
          <select className="form-select" value={topico} onChange={e => setTopico(e.target.value)}>
            <option value="">Selecione...</option>
            {topicos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {conteudo && topicos.length === 0 && (
        <div style={{ paddingLeft: 32, fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
          ✓ Tópico: <strong style={{ color: 'var(--text-secondary)' }}>{conteudo}</strong>
        </div>
      )}
    </Modal>
  )
}

// ── Componente principal ─────────────────────────────────────────
export default function Cronograma() {
  const { entradas, loading, addEntrada, deleteEntrada, estudados, totalTopicos, pctConcluido } = useCronograma()
  const [semanaBase, setSemanaBase] = useState(() => startOfWeek(new Date()))
  const [modalData, setModalData] = useState(null) // data selecionada para adicionar
  const [diaExpandido, setDiaExpandido] = useState(null)

  // Dias da semana atual
  const diasSemana = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = addDays(semanaBase, i)
      return { date: d, ymd: toYMD(d), nome: DIAS_SEMANA[i] }
    }), [semanaBase])

  // Agrupa entradas por data
  const entradasPorDia = useMemo(() => {
    const map = {}
    entradas.forEach(e => {
      if (!map[e.data]) map[e.data] = []
      map[e.data].push(e)
    })
    return map
  }, [entradas])

  const hoje = toYMD(new Date())

  const semanaLabel = (() => {
    const ini = diasSemana[0]
    const fim = diasSemana[6]
    return `${formatDia(ini.ymd)} — ${formatDia(fim.ymd)}/${fim.date.getFullYear()}`
  })()

  // Conteúdos já estudados (Set de chaves únicas)
  const estudadosSet = useMemo(() =>
    new Set(entradas.map(e => `${e.materia}||${e.conteudo}||${e.topico}`)),
    [entradas]
  )

  // Matérias com progresso
  const progressoPorMateria = useMemo(() => {
    const result = {}
    AREAS.forEach(area => {
      const conteudos = Object.keys(ENEM_CONTENT[area]).filter(k => k !== 'color' && k !== 'colorLight')
      let total = 0, feitos = 0
      conteudos.forEach(cont => {
        const tops = Object.keys(ENEM_CONTENT[area][cont])
        if (tops.length === 0) {
          total++
          if (estudadosSet.has(`${area}||${cont}||${cont}`)) feitos++
        } else {
          tops.forEach(t => {
            total++
            if (estudadosSet.has(`${area}||${cont}||${t}`)) feitos++
          })
        }
      })
      result[area] = { total, feitos, pct: total ? Math.round((feitos / total) * 100) : 0 }
    })
    return result
  }, [estudadosSet])

  if (loading) return <div className="empty-state"><div className="empty-sub">Carregando cronograma...</div></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cronograma Inverso</h1>
        <p className="page-subtitle">Registre os conteúdos estudados na escola dia a dia</p>
      </div>

      {/* Progresso geral */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Progresso geral do ENEM</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {estudados} de {totalTopicos} tópicos estudados
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
            color: pctConcluido >= 70 ? '#059669' : pctConcluido >= 40 ? '#D97706' : 'var(--accent)' }}>
            {pctConcluido}%
          </div>
        </div>
        <div className="progress-bar" style={{ height: 12, borderRadius: 6 }}>
          <div className="progress-fill" style={{
            width: `${pctConcluido}%`,
            background: pctConcluido >= 70 ? '#059669' : pctConcluido >= 40 ? '#D97706' : 'var(--accent)',
            borderRadius: 6,
          }} />
        </div>

        {/* Progresso por matéria */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {AREAS.map(area => {
            const { feitos, total, pct } = progressoPorMateria[area] || {}
            const cor = ENEM_CONTENT[area]?.color || 'var(--accent)'
            return (
              <div key={area} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: cor }}>{area}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: cor }}>{pct}%</div>
                </div>
                <div className="progress-bar" style={{ height: 5 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: cor, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  {feitos}/{total} tópicos
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navegação de semana */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn btn-sm" onClick={() => setSemanaBase(s => addDays(s, -7))}>
          <ChevronLeft size={14} /> Semana anterior
        </button>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{semanaLabel}</div>
        <button className="btn btn-sm" onClick={() => setSemanaBase(s => addDays(s, 7))}>
          Próxima semana <ChevronRight size={14} />
        </button>
      </div>

      {/* Grade semanal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 24 }}>
        {diasSemana.map(({ date, ymd, nome }) => {
          const isHoje = ymd === hoje
          const isFuturo = ymd > hoje
          const entradasDia = entradasPorDia[ymd] || []
          const isExpandido = diaExpandido === ymd

          return (
            <div key={ymd} style={{
              borderRadius: 10,
              border: `1.5px solid ${isHoje ? 'var(--accent)' : 'var(--border)'}`,
              background: isHoje ? 'var(--accent-light)' : 'var(--surface)',
              overflow: 'hidden',
              opacity: isFuturo ? 0.6 : 1,
            }}>
              {/* Header do dia */}
              <div style={{
                padding: '8px 10px',
                borderBottom: '1px solid var(--border)',
                background: isHoje ? 'var(--accent)' : 'var(--surface2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700,
                  color: isHoje ? '#fff' : 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  {nome}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800,
                  color: isHoje ? '#fff' : 'var(--text-primary)' }}>
                  {formatDia(ymd)}
                </div>
                {entradasDia.length > 0 && (
                  <div style={{
                    background: isHoje ? 'rgba(255,255,255,0.3)' : 'var(--accent)',
                    color: '#fff', borderRadius: 20, padding: '1px 7px',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {entradasDia.length}
                  </div>
                )}
              </div>

              {/* Conteúdos do dia */}
              <div style={{ padding: '8px 8px 4px' }}>
                {entradasDia.slice(0, isExpandido ? 999 : 2).map(e => (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    gap: 4, marginBottom: 5, padding: '4px 6px',
                    background: 'var(--surface2)', borderRadius: 6,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: ENEM_CONTENT[e.materia]?.color || 'var(--accent)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.materia}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.topico}
                      </div>
                    </div>
                    <button onClick={() => deleteEntrada(e.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', padding: 0, flexShrink: 0,
                      fontSize: 13, lineHeight: 1,
                    }}>×</button>
                  </div>
                ))}

                {entradasDia.length > 2 && (
                  <button onClick={() => setDiaExpandido(isExpandido ? null : ymd)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 10, color: 'var(--accent)', padding: '2px 0', width: '100%', textAlign: 'left',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {isExpandido ? '▲ menos' : `+${entradasDia.length - 2} mais`}
                  </button>
                )}

                {!isFuturo && (
                  <button onClick={() => setModalData(ymd)} style={{
                    width: '100%', marginTop: 4, padding: '5px 0',
                    border: '1px dashed var(--border2)', borderRadius: 6,
                    background: 'none', cursor: 'pointer', fontSize: 11,
                    color: 'var(--text-tertiary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                    fontFamily: 'var(--font-body)',
                  }}>
                    <Plus size={10} /> Adicionar
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Histórico recente */}
      {entradas.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
            Histórico recente
          </div>
          <div>
            {(() => {
              // Agrupa por data
              const porData = {}
              entradas.slice(0, 30).forEach(e => {
                if (!porData[e.data]) porData[e.data] = []
                porData[e.data].push(e)
              })
              return Object.entries(porData).slice(0, 7).map(([data, items]) => {
                const [y, m, d] = data.split('-')
                return (
                  <div key={data} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)',
                      textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                      {d}/{m}/{y}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {items.map(e => (
                        <div key={e.id} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px 4px 8px',
                          background: 'var(--surface2)', borderRadius: 20,
                          fontSize: 12, border: '1px solid var(--border)',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%',
                            background: ENEM_CONTENT[e.materia]?.color || 'var(--accent)',
                            flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{e.materia}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                          <span style={{ color: 'var(--text-primary)' }}>{e.topico}</span>
                          <button onClick={() => deleteEntrada(e.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-tertiary)', padding: 0, fontSize: 14,
                            lineHeight: 1, marginLeft: 2,
                          }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {entradas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">Nenhum conteúdo registrado ainda</div>
          <div className="empty-sub">Clique em "+ Adicionar" em qualquer dia para começar</div>
        </div>
      )}

      {modalData && (
        <AddConteudoModal
          data={modalData}
          onClose={() => setModalData(null)}
          onSave={addEntrada}
        />
      )}
    </div>
  )
}
