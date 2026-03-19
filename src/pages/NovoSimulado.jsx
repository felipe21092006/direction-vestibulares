import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSimulados } from '../hooks/useSimulados'
import { today } from '../hooks/useStorage'

const DIAS_ENEM = [
  { id: 'dia1', label: 'Dia 1 — 90 questões', desc: 'Linguagens e Códigos + Ciências Humanas + Redação', cor: '#7C3AED' },
  { id: 'dia2', label: 'Dia 2 — 90 questões', desc: 'Ciências da Natureza + Matemática', cor: '#047857' },
]

export default function NovoSimulado() {
  const navigate = useNavigate()
  const { addSimulado } = useSimulados()
  const [nome, setNome] = useState('')
  const [data, setData] = useState(today())
  const [diasSel, setDiasSel] = useState({ dia1: true, dia2: true })
  const [obs, setObs] = useState('')
  const [loading, setLoading] = useState(false)

  const totalQ = Object.values(diasSel).filter(Boolean).length * 90

  const handleSave = async () => {
    const n = nome.trim()
    if (!n) { alert('Dê um nome ao simulado!'); return }
    if (!diasSel.dia1 && !diasSel.dia2) { alert('Selecione pelo menos um dia!'); return }
    setLoading(true)
    const sim = await addSimulado({
      nome: n,
      data,
      dias: Object.keys(diasSel).filter(d => diasSel[d]),
      totalQuestoes: totalQ,
      obs: obs.trim(),
    })
    setLoading(false)
    if (sim) navigate(`/app/simulado/${sim.id}`)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Novo Simulado</h1>
        <p className="page-subtitle">Registre um simulado do ENEM realizado</p>
      </div>

      <div className="card" style={{ maxWidth: 540 }}>
        <div className="form-group">
          <label className="form-label">Nome do simulado *</label>
          <input
            className="form-input"
            placeholder="Ex: Simulado ENEM #1, Simuladão de Abril..."
            value={nome}
            onChange={e => setNome(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group" style={{ maxWidth: 220 }}>
          <label className="form-label">Data de realização</label>
          <input className="form-input" type="date" value={data} onChange={e => setData(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Dias realizados</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DIAS_ENEM.map(d => (
              <label key={d.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px', borderRadius: 10,
                border: `1.5px solid ${diasSel[d.id] ? d.cor : 'var(--border)'}`,
                background: diasSel[d.id] ? `${d.cor}12` : 'var(--surface)',
                cursor: 'pointer', transition: 'all .15s',
              }}>
                <input
                  type="checkbox"
                  checked={diasSel[d.id]}
                  onChange={e => setDiasSel(prev => ({ ...prev, [d.id]: e.target.checked }))}
                  style={{ marginTop: 3, width: 16, height: 16, accentColor: d.cor, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: diasSel[d.id] ? d.cor : 'var(--text-primary)' }}>{d.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{d.desc}</div>
                </div>
              </label>
            ))}
          </div>
          {totalQ > 0 && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>Total: {totalQ} questões</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Observações (opcional)</label>
          <textarea className="form-textarea" placeholder="Banca, condições, anotações gerais..." value={obs} onChange={e => setObs(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => navigate('/app')}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Salvando...' : 'Criar simulado →'}
          </button>
        </div>
      </div>
    </div>
  )
}
