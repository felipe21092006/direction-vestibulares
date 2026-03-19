import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ChevronRight, RotateCcw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useSimulados } from '../hooks/useSimulados'

const ALTERNATIVAS = ['A', 'B', 'C', 'D', 'E']

// ── Extrai gabarito do PDF via edge function ──────────────────────
async function extrairGabaritoPDF(file, questaoInicial, totalQuestoes) {
  const pdfBase64 = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1])
    r.onerror = rej
    r.readAsDataURL(file)
  })

  const response = await fetch('/api/extract-gabarito', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64, questaoInicial, totalQuestoes })
  })

  const data = await response.json()
  if (data.error) throw new Error(data.error + (data.raw ? ` — ${data.raw}` : ''))
  return data.gabarito || {}
}

// ── Grade de respostas ────────────────────────────────────────────
function GradeRespostas({ questaoInicial, total, respostas, gabarito, onChange, soLeitura }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
      {Array.from({ length: total }, (_, i) => {
        const num = questaoInicial + i
        const resp = respostas[num] || ''
        const gab = gabarito[num] || ''
        const acertou = soLeitura ? resp === gab : null
        const anulada = gab === 'AN'

        return (
          <div key={num} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 10,
            background: soLeitura
              ? anulada ? 'rgba(107,114,128,0.1)'
              : acertou ? 'rgba(5,150,105,0.08)'
              : 'rgba(220,38,38,0.08)'
              : 'var(--surface2)',
            border: `1px solid ${soLeitura
              ? anulada ? 'rgba(107,114,128,0.2)'
              : acertou ? 'rgba(5,150,105,0.2)'
              : 'rgba(220,38,38,0.2)'
              : 'var(--border)'}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', width: 32, flexShrink: 0 }}>
              {num}
            </div>

            {soLeitura ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: acertou ? '#059669' : anulada ? '#6B7280' : '#DC2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0,
                }}>{resp || '—'}</div>
                {!anulada && !acertou && (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    correto: <strong style={{ color: '#059669' }}>{gab}</strong>
                  </div>
                )}
                {anulada && <div style={{ fontSize: 11, color: '#6B7280' }}>anulada</div>}
                {acertou && <div style={{ fontSize: 11, color: '#059669' }}>✓</div>}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                {ALTERNATIVAS.map(alt => (
                  <button key={alt} onClick={() => onChange(num, alt)} style={{
                    flex: 1, padding: '5px 2px', borderRadius: 6,
                    border: `1.5px solid ${resp === alt ? 'var(--accent)' : 'var(--border)'}`,
                    background: resp === alt ? 'var(--accent)' : 'transparent',
                    color: resp === alt ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'all .1s',
                  }}>
                    {alt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────
export default function Gabarito() {
  const { user } = useAuth()
  const { simulados } = useSimulados()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [etapa, setEtapa] = useState('upload')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Config
  const [nome, setNome] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [dia, setDia] = useState('dia1') // dia1 | dia2 | outro
  const [questaoInicial, setQuestaoInicial] = useState(1)
  const [totalQuestoes, setTotalQuestoes] = useState(90)
  const [simuladoId, setSimuladoId] = useState('')

  // Dados
  const [gabarito, setGabarito] = useState({})
  const [respostas, setRespostas] = useState({})
  const [pdfNome, setPdfNome] = useState('')
  const [resultado, setResultado] = useState(null)

  // Quando muda o dia, ajusta questão inicial automaticamente
  const handleDiaChange = (d) => {
    setDia(d)
    if (d === 'dia1') { setQuestaoInicial(1); setTotalQuestoes(90) }
    else if (d === 'dia2') { setQuestaoInicial(91); setTotalQuestoes(90) }
  }

  const handleUploadPDF = async (file) => {
    if (!file || file.type !== 'application/pdf') { setErro('Selecione um PDF válido.'); return }
    if (!nome.trim()) { setErro('Dê um nome ao simulado antes de fazer o upload.'); return }
    setErro('')
    setLoading(true)
    setPdfNome(file.name)
    try {
      const gab = await extrairGabaritoPDF(file, questaoInicial, totalQuestoes)
      const count = Object.keys(gab).length
      if (count < 5) {
        setErro('Não consegui extrair o gabarito. Verifique se o PDF contém o gabarito oficial.')
        setLoading(false)
        return
      }
      setGabarito(gab)
      setEtapa('respostas')
    } catch (e) {
      setErro(`Erro: ${e.message}`)
    }
    setLoading(false)
  }

  const handleResponder = (num, alt) => {
    setRespostas(prev => ({ ...prev, [num]: alt }))
  }

  const respondidas = Object.keys(respostas).length
  const pctRespondido = Math.round((respondidas / totalQuestoes) * 100)

  const calcularResultado = () => {
    const erros = []
    const acertos = []
    let anuladas = 0

    for (let i = 0; i < totalQuestoes; i++) {
      const num = questaoInicial + i
      const gab = gabarito[num]
      const resp = respostas[num] || ''
      if (gab === 'AN') { anuladas++; continue }
      if (resp === gab) acertos.push(num)
      else erros.push({ questao: num, resposta: resp, correta: gab })
    }

    const totalValidas = totalQuestoes - anuladas
    const pct = Math.round((acertos.length / totalValidas) * 100)
    return { acertos: acertos.length, erros, anuladas, totalValidas, pct }
  }

  const handleGerarRelatorio = async () => {
    const naoRespondidas = totalQuestoes - respondidas
    if (naoRespondidas > 0) {
      if (!confirm(`Você deixou ${naoRespondidas} questão(ões) sem resposta. Continuar?`)) return
    }

    setLoading(true)
    const res = calcularResultado()
    setResultado(res)

    try {
      await supabase.from('gabaritos').insert({
        user_id: user.id,
        simulado_id: simuladoId || null,
        nome: nome.trim(),
        data,
        total_questoes: totalQuestoes,
        gabarito_oficial: gabarito,
        respostas_aluno: respostas,
        resultado: res,
      })

      if (simuladoId && res.erros.length > 0) {
        await supabase.from('erros').insert(
          res.erros.map(e => ({
            simulado_id: simuladoId,
            user_id: user.id,
            questao: String(e.questao),
            tipo: 'conteudo',
            area: '', disciplina: '', topico: '',
            obs: `Marcou ${e.resposta || '—'}, correto: ${e.correta}`,
          }))
        )
      }
    } catch (e) { console.error('Erro ao salvar:', e) }

    setEtapa('relatorio')
    setLoading(false)
  }

  const reiniciar = () => {
    setEtapa('upload'); setGabarito({}); setRespostas({})
    setResultado(null); setPdfNome(''); setNome('')
    setSimuladoId(''); setErro(''); setDia('dia1')
    setQuestaoInicial(1); setTotalQuestoes(90)
  }

  const scoreColor = (pct) => pct >= 70 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626'

  // ── ETAPA 1: Upload ──────────────────────────────────────────────
  if (etapa === 'upload') return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gabarito Inteligente</h1>
        <p className="page-subtitle">Faça upload do gabarito oficial e registre suas respostas</p>
      </div>

      <div style={{ maxWidth: 560 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Nome do simulado *</label>
            <input className="form-input" placeholder="Ex: ENEM 2024 Dia 1, SAS Abril..." value={nome} onChange={e => setNome(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Data</label>
            <input className="form-input" type="date" value={data} onChange={e => setData(e.target.value)} style={{ maxWidth: 200 }} />
          </div>

          {/* Seletor de dia */}
          <div className="form-group">
            <label className="form-label">Dia do simulado</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { id: 'dia1', label: 'Dia 1', sub: 'Questões 1–90', q: 1 },
                { id: 'dia2', label: 'Dia 2', sub: 'Questões 91–180', q: 91 },
                { id: 'outro', label: 'Outro', sub: 'Personalizado', q: null },
              ].map(d => (
                <div key={d.id} onClick={() => handleDiaChange(d.id)} style={{
                  padding: '12px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `1.5px solid ${dia === d.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: dia === d.id ? 'var(--accent-light)' : 'var(--surface)',
                  transition: 'all .15s',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: dia === d.id ? 'var(--accent)' : 'var(--text-primary)' }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{d.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Campos personalizados para "Outro" */}
          {dia === 'outro' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Questão inicial</label>
                <input className="form-input" type="number" value={questaoInicial} min="1"
                  onChange={e => setQuestaoInicial(parseInt(e.target.value) || 1)} />
              </div>
              <div className="form-group">
                <label className="form-label">Total de questões</label>
                <input className="form-input" type="number" value={totalQuestoes} min="1" max="200"
                  onChange={e => setTotalQuestoes(parseInt(e.target.value) || 90)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Vincular a um simulado existente (opcional)</label>
            <select className="form-select" value={simuladoId} onChange={e => setSimuladoId(e.target.value)}>
              <option value="">Não vincular</option>
              {simulados.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Se vincular, os erros serão salvos automaticamente no simulado
            </div>
          </div>
        </div>

        {/* Upload PDF */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Gabarito oficial em PDF</div>

          {erro && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {erro}
            </div>
          )}

          <div
            onClick={() => !loading && fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleUploadPDF(e.dataTransfer.files[0]) }}
            style={{
              border: '2px dashed var(--border2)', borderRadius: 12,
              padding: '48px 24px', textAlign: 'center',
              cursor: loading ? 'wait' : 'pointer',
              background: 'var(--surface2)', transition: 'all .15s',
            }}
          >
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => handleUploadPDF(e.target.files[0])} />

            {loading ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Extraindo gabarito com IA...</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>Isso pode levar alguns segundos</div>
              </div>
            ) : (
              <div>
                <Upload size={36} color="var(--text-tertiary)" style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Arraste o PDF do gabarito aqui</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12 }}>ou clique para selecionar</div>
                <div style={{ fontSize: 12, color: 'var(--accent)' }}>✨ A IA extrai as respostas automaticamente</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--accent-light)', borderRadius: 8, fontSize: 12, color: 'var(--accent-text)' }}>
            <strong>Questões {questaoInicial} a {questaoInicial + totalQuestoes - 1}</strong> serão extraídas do PDF.
          </div>
        </div>
      </div>
    </div>
  )

  // ── ETAPA 2: Respostas ───────────────────────────────────────────
  if (etapa === 'respostas') return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Suas respostas</h1>
          <p className="page-subtitle">{nome} · Questões {questaoInicial}–{questaoInicial + totalQuestoes - 1}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={reiniciar}><RotateCcw size={14} /> Recomeçar</button>
          <button className="btn btn-primary" onClick={handleGerarRelatorio} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar relatório'} <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{respondidas} de {totalQuestoes} respondidas</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{pctRespondido}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pctRespondido}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      <div className="card">
        <GradeRespostas
          questaoInicial={questaoInicial}
          total={totalQuestoes}
          respostas={respostas}
          gabarito={gabarito}
          onChange={handleResponder}
          soLeitura={false}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-primary" onClick={handleGerarRelatorio} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar relatório'} <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  // ── ETAPA 3: Relatório ───────────────────────────────────────────
  if (etapa === 'relatorio' && resultado) return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Relatório</h1>
          <p className="page-subtitle">{nome} · {data} · Q{questaoInicial}–{questaoInicial + totalQuestoes - 1}</p>
        </div>
        <button className="btn" onClick={reiniciar}><RotateCcw size={14} /> Novo gabarito</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Aproveitamento</div>
          <div className="stat-value" style={{ color: scoreColor(resultado.pct) }}>{resultado.pct}%</div>
          <div className="stat-sub">{resultado.acertos} de {resultado.totalValidas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#059669' }}>✓ Acertos</div>
          <div className="stat-value" style={{ color: '#059669' }}>{resultado.acertos}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ color: '#DC2626' }}>✗ Erros</div>
          <div className="stat-value" style={{ color: '#DC2626' }}>{resultado.erros.length}</div>
        </div>
        {resultado.anuladas > 0 && (
          <div className="stat-card">
            <div className="stat-label">Anuladas</div>
            <div className="stat-value">{resultado.anuladas}</div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Aproveitamento geral</span>
          <span style={{ fontWeight: 700, color: scoreColor(resultado.pct) }}>{resultado.pct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div className="progress-fill" style={{ width: `${resultado.pct}%`, background: scoreColor(resultado.pct), borderRadius: 6 }} />
        </div>
      </div>

      {resultado.erros.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Questões erradas ({resultado.erros.length})</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            {simuladoId ? '✓ Erros salvos automaticamente no simulado vinculado.' : 'Vincule a um simulado para salvar os erros automaticamente.'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {resultado.erros.map(e => (
              <div key={e.questao} style={{
                padding: '5px 12px', borderRadius: 8,
                background: 'var(--danger-light)', border: '1px solid #FECACA', fontSize: 13,
              }}>
                <strong style={{ color: '#DC2626' }}>Q{e.questao}</strong>
                <span style={{ color: '#991B1B', marginLeft: 6 }}>
                  {e.resposta || '—'} → <strong>{e.correta}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Grade completa</div>
        <GradeRespostas
          questaoInicial={questaoInicial}
          total={totalQuestoes}
          respostas={respostas}
          gabarito={gabarito}
          onChange={() => {}}
          soLeitura={true}
        />
      </div>

      {simuladoId && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/app/simulado/${simuladoId}`)}>
            Ver simulado completo <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )

  return null
}
