import { useState } from 'react'
import Modal from './Modal'
import { ENEM_CONTENT, AREAS } from '../data/enemContent'
import { genId } from '../hooks/useStorage'

const TIPOS = [
  { id: 'atencao',       icon: '⚠️', label: 'Atenção',       desc: 'Errou por distração' },
  { id: 'interpretacao', icon: '💬', label: 'Interpretação',  desc: 'Dificuldade no enunciado' },
  { id: 'conteudo',      icon: '📚', label: 'Conteúdo',       desc: 'Falta de conhecimento' },
]

const DIA_AREAS = {
  dia1: ['Língua Portuguesa', 'Literatura', 'Língua Estrangeira', 'Artes e Educação Física', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Atualidades', 'Redação'],
  dia2: ['Matemática', 'Química', 'Biologia', 'Física'],
}

export default function AddErroModal({ onClose, onSave, diaAtivo }) {
  const [questao, setQuestao]       = useState('')
  const [tipo, setTipo]             = useState('')
  const [materia, setMateria]       = useState('')
  const [conteudo, setConteudo]     = useState('')
  const [topico, setTopico]         = useState('')

  const [obs, setObs] = useState('')

  const areasDisponiveis = diaAtivo
    ? AREAS.filter(a => DIA_AREAS[diaAtivo]?.includes(a))
    : AREAS

  // Nível 2: conteúdos (subgrupos) da matéria
  const conteudos = materia
    ? Object.keys(ENEM_CONTENT[materia]).filter(k => k !== 'color' && k !== 'colorLight')
    : []

  // Nível 3: tópicos do conteúdo
  const topicos = (materia && conteudo)
    ? Object.keys(ENEM_CONTENT[materia][conteudo] || {})
    : []

  const handleMateriaChange = (v) => { setMateria(v); setConteudo(''); setTopico('') }
  const handleConteudoChange = (v) => { setConteudo(v); setTopico('') }

  const canSave = tipo && (tipo !== 'conteudo' || (materia && conteudo && topico))

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id: genId(),
      questao: questao.trim(),
      tipo,
      area:       tipo === 'conteudo' ? materia   : '',
      disciplina: tipo === 'conteudo' ? conteudo  : '',
      topico:     tipo === 'conteudo' ? topico    : '',
      obs: obs.trim(),
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  const diaNome = diaAtivo === 'dia1' ? 'Dia 1' : diaAtivo === 'dia2' ? 'Dia 2' : ''

  return (
    <Modal
      title={`Adicionar Erro${diaNome ? ` — ${diaNome}` : ''}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.45 }}>
            Salvar erro
          </button>
        </>
      }
    >
      {/* Questão */}
      <div className="form-group">
        <label className="form-label">Número da questão (opcional)</label>
        <input className="form-input" placeholder="Ex: 42" value={questao}
          onChange={e => setQuestao(e.target.value)} style={{ maxWidth: 140 }} />
      </div>

      {/* Tipo */}
      <div className="form-group">
        <label className="form-label">Tipo de erro *</label>
        <div className="error-type-grid">
          {TIPOS.map(t => (
            <div key={t.id}
              className={`error-type-option${tipo === t.id ? ` sel-${t.id === 'interpretacao' ? 'interp' : t.id}` : ''}`}
              onClick={() => setTipo(t.id)}
            >
              <span className="icon">{t.icon}</span>
              <strong style={{ display: 'block', fontSize: 13 }}>{t.label}</strong>
              <span style={{ fontSize: 11, opacity: 0.75 }}>{t.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo — seleção em cascata */}
      {tipo === 'conteudo' && (
        <div className="form-group">
          <label className="form-label">Localizar conteúdo *</label>
          <div className="content-chain">

            {/* Nível 1: Matéria */}
            <div>
              <label className="form-label" style={{ fontSize: 12 }}>Matéria</label>
              <select className="form-select" value={materia} onChange={e => handleMateriaChange(e.target.value)}>
                <option value="">Selecione a matéria...</option>
                {areasDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Nível 2: Conteúdo */}
            {materia && (
              <div style={{ paddingLeft: 16, borderLeft: '2px solid var(--border)' }}>
                <label className="form-label" style={{ fontSize: 12 }}>Conteúdo</label>
                <select className="form-select" value={conteudo} onChange={e => handleConteudoChange(e.target.value)}>
                  <option value="">Selecione o conteúdo...</option>
                  {conteudos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {/* Nível 3: Tópico */}
            {conteudo && topicos.length > 0 && (
              <div style={{ paddingLeft: 32, borderLeft: '2px solid var(--border)' }}>
                <label className="form-label" style={{ fontSize: 12 }}>Tópico</label>
                <select className="form-select" value={topico} onChange={e => setTopico(e.target.value)}>
                  <option value="">Selecione o tópico...</option>
                  {topicos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            {/* Se não há tópicos, o conteúdo já é o nível final */}
            {conteudo && topicos.length === 0 && (
              <div style={{ paddingLeft: 32, fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                ✓ Tópico selecionado: <strong style={{ color: 'var(--text-secondary)' }}>{conteudo}</strong>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Obs */}
      <div className="form-group">
        <label className="form-label">Observação (opcional)</label>
        <textarea className="form-textarea" placeholder="Anote algo sobre esse erro..." value={obs}
          onChange={e => setObs(e.target.value)} rows={2} />
      </div>
    </Modal>
  )
}
