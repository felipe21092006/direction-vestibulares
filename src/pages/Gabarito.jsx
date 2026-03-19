import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ChevronRight, RotateCcw, CheckCircle, FileText } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useSimulados } from '../hooks/useSimulados'

const ALTERNATIVAS = ['A', 'B', 'C', 'D', 'E']

// ── Helpers ───────────────────────────────────────────────────────
async function fileTob64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result.split(',')[1])
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

async function extrairGabarito(file, questaoInicial, totalQuestoes) {
  const pdfBase64 = await fileTob64(file)
  const resp = await fetch('/api/extract-gabarito', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfBase64, questaoInicial, totalQuestoes })
  })
  const data = await resp.json()
  if (data.error) throw new Error(data.error)
  return { gabarito: data.gabarito || {}, pdfBase64 }
}

async function analisarErros(provaFile, erros) {
  const sizeMB = provaFile.size / (1024 * 1024)
  if (sizeMB > 3.5) {
    throw new Error('PDF muito grande (' + sizeMB.toFixed(1) + 'MB). Comprima em ilovepdf.com e tente novamente.')
  }
  const provaBase64 = await fileTob64(provaFile)
  const resp = await fetch('/api/analyze-errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provaBase64, erros })
  })
  const data = await resp.json()
  console.log("ANALYZE RESULT:", JSON.stringify(data).slice(0, 800))
  if (data.error) throw new Error(data.error)
  return data.erros || []
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
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
            background: soLeitura
              ? anulada ? 'rgba(107,114,128,0.1)' : acertou ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)'
              : 'var(--surface2)',
            border: `1px solid ${soLeitura
              ? anulada ? 'rgba(107,114,128,0.2)' : acertou ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'
              : 'var(--border)'}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', width: 32, flexShrink: 0 }}>{num}</div>
            {soLeitura ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: acertou ? '#059669' : anulada ? '#6B7280' : '#DC2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0,
                }}>{resp || '—'}</div>
                {!anulada && !acertou && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>correto: <strong style={{ color: '#059669' }}>{gab}</strong></div>}
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
                    fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>{alt}</button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Upload Box ────────────────────────────────────────────────────
function UploadBox({ label, sublabel, file, onFile, accept = '.pdf', disabled }) {
  const ref = useRef()
  return (
    <div
      onClick={() => !disabled && ref.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); if (!disabled) onFile(e.dataTransfer.files[0]) }}
      style={{
        border: `2px dashed ${file ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius: 12, padding: '24px 16px', textAlign: 'center',
        cursor: disabled ? 'default' : 'pointer',
        background: file ? 'var(--accent-light)' : 'var(--surface2)',
        transition: 'all .15s',
      }}
    >
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }}
        onChange={e => onFile(e.target.files[0])} />
      {file ? (
        <div>
          <CheckCircle size={24} color="var(--accent)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{file.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Clique para trocar</div>
        </div>
      ) : (
        <div>
          <Upload size={24} color="var(--text-tertiary)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{sublabel}</div>
        </div>
      )}
    </div>
  )
}

// ── Revisão de erros ──────────────────────────────────────────────
const TIPO_LABELS = {
  conteudo:      { label: '📚 Conteúdo',       badge: 'badge-conteudo' },
  atencao:       { label: '⚠️ Atenção',         badge: 'badge-atencao' },
  interpretacao: { label: '💬 Interpretação',   badge: 'badge-interp' },
}

function RevisaoErros({ errosAnalisados, onChangeTipo, onSalvar, loading }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '10px 14px', background: 'var(--accent-light)', borderRadius: 8, border: '1px solid #C7D2FE' }}>
          ℹ️ A IA categorizou todos os erros como <strong>Conteúdo</strong>. Troque para <strong>Atenção</strong> ou <strong>Interpretação</strong> se necessário antes de salvar.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {errosAnalisados.map((e, i) => (
          <div key={e.questao} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>Q{e.questao}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    Marcou <strong>{e.resposta || '—'}</strong> → correto: <strong style={{ color: '#059669' }}>{e.correta}</strong>
                  </span>
                </div>
                {e.area && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.area}</span>
                    {e.disciplina && <span> › {e.disciplina}</span>}
                  </div>
                )}
                {e.topico && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{e.topico}</div>
                )}
                {e.resumo && (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, fontStyle: 'italic' }}>{e.resumo}</div>
                )}
              </div>

              {/* Seletor de tipo */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {Object.entries(TIPO_LABELS).map(([tipo, { label }]) => (
                  <button key={tipo} onClick={() => onChangeTipo(i, tipo)} style={{
                    padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all .12s',
                    border: `1.5px solid ${e.tipo === tipo
                      ? tipo === 'conteudo' ? '#DC2626' : tipo === 'atencao' ? '#D97706' : '#4F46E5'
                      : 'var(--border)'}`,
                    background: e.tipo === tipo
                      ? tipo === 'conteudo' ? '#FEF2F2' : tipo === 'atencao' ? '#FFFBEB' : '#EEF2FF'
                      : 'transparent',
                    color: e.tipo === tipo
                      ? tipo === 'conteudo' ? '#991B1B' : tipo === 'atencao' ? '#92400E' : '#3730A3'
                      : 'var(--text-tertiary)',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={onSalvar} disabled={loading}>
          {loading ? 'Salvando...' : `Salvar ${errosAnalisados.length} erros`} <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────
export default function Gabarito() {
  const { user } = useAuth()
  const { simulados, addSimulado } = useSimulados()
  const navigate = useNavigate()

  const [etapa, setEtapa] = useState('upload')   // upload | respostas | analise | revisao | relatorio
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [erro, setErro] = useState('')

  // Config
  const [nome, setNome] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [dia, setDia] = useState('dia1')
  const [questaoInicial, setQuestaoInicial] = useState(1)
  const [totalQuestoes, setTotalQuestoes] = useState(90)
  const [simuladoId, setSimuladoId] = useState('')

  // Arquivos
  const [gabaritoFile, setGabaritoFile] = useState(null)
  const [provaFile, setProvaFile] = useState(null)

  // Dados
  const [gabarito, setGabarito] = useState({})
  const [gabaritoPdfBase64, setGabaritoPdfBase64] = useState('')
  const [respostas, setRespostas] = useState({})
  const [errosAnalisados, setErrosAnalisados] = useState([])
  const [resultado, setResultado] = useState(null)
  const [simIdFinal, setSimIdFinal] = useState('')

  const handleDiaChange = (d) => {
    setDia(d)
    if (d === 'dia1') { setQuestaoInicial(1); setTotalQuestoes(90) }
    else if (d === 'dia2') { setQuestaoInicial(91); setTotalQuestoes(90) }
  }

  // ETAPA 1 → 2: extrair gabarito
  const handleExtrairGabarito = async () => {
    if (!gabaritoFile) { setErro('Selecione o PDF do gabarito.'); return }
    if (!nome.trim()) { setErro('Dê um nome ao simulado.'); return }
    setErro(''); setLoading(true); setLoadingMsg('Extraindo gabarito com IA...')
    try {
      const { gabarito: gab, pdfBase64 } = await extrairGabarito(gabaritoFile, questaoInicial, totalQuestoes)
      if (Object.keys(gab).length < 5) { setErro('Não consegui extrair o gabarito. Verifique o PDF.'); setLoading(false); return }
      setGabarito(gab)
      setGabaritoPdfBase64(pdfBase64)
      setEtapa('respostas')
    } catch(e) { setErro(`Erro: ${e.message}`) }
    setLoading(false)
  }

  // ETAPA 2 → 3: calcular erros e analisar com IA
  const handleAnalisar = async () => {
    const naoRespondidas = totalQuestoes - Object.keys(respostas).length
    if (naoRespondidas > 0 && !confirm(`${naoRespondidas} questão(ões) sem resposta. Continuar?`)) return

    // Calcular resultado
    const errosList = []
    const acertos = []
    let anuladas = 0
    for (let i = 0; i < totalQuestoes; i++) {
      const num = questaoInicial + i
      const gab = gabarito[num]
      const resp = respostas[num] || ''
      if (gab === 'AN') { anuladas++; continue }
      if (resp === gab) acertos.push(num)
      else errosList.push({ questao: num, resposta: resp, correta: gab })
    }
    const totalValidas = totalQuestoes - anuladas
    const pct = Math.round((acertos.length / totalValidas) * 100)
    setResultado({ acertos: acertos.length, erros: errosList, anuladas, totalValidas, pct })

    if (errosList.length === 0) {
      // Sem erros, vai direto para relatório
      await salvarTudo([], acertos.length, totalValidas, pct, anuladas)
      return
    }

    setLoading(true)

    if (gabaritoPdfBase64) {
      setLoadingMsg('Categorizando erros com IA...')
      try {
        const analisados = await analisarErros(gabaritoPdfBase64, errosList)
        // Mescla dados do resultado com análise da IA
        const merged = errosList.map(e => {
          const ia = analisados.find(a => String(a.questao) === String(e.questao)) || {}
          return {
            ...e,
            tipo: 'conteudo',
            area: ia.area || '',
            disciplina: ia.disciplina || '',
            topico: ia.topico || '',
            resumo: ia.resumo || '',
          }
        })
        setErrosAnalisados(merged)
        setEtapa('revisao')
      } catch(ex) {
        // Se falhar a análise, vai com conteudo sem categorização
        const fallback = errosList.map(e => ({ ...e, tipo: 'conteudo', area: '', disciplina: '', topico: '', resumo: '' }))
        setErrosAnalisados(fallback)
        setEtapa('revisao')
      }
    } else {
      // Sem prova, vai para revisão sem categorização
      const fallback = errosList.map(e => ({ ...e, tipo: 'conteudo', area: '', disciplina: '', topico: '', resumo: '' }))
      setErrosAnalisados(fallback)
      setEtapa('revisao')
    }

    setLoading(false)
  }

  const handleChangeTipo = (index, tipo) => {
    setErrosAnalisados(prev => prev.map((e, i) => i === index ? { ...e, tipo } : e))
  }

  const salvarTudo = async (errosParaSalvar, acertosCount, totalValidas, pct, anuladas) => {
    setLoading(true); setLoadingMsg('Salvando...')

    // Criar ou usar simulado existente
    let finalSimId = simuladoId
    if (!finalSimId) {
      // Cria simulado automaticamente
      const dias = dia === 'dia1' ? ['dia1'] : dia === 'dia2' ? ['dia2'] : ['dia1']
      const novoSim = await addSimulado({
        nome: nome.trim(),
        data,
        dias,
        totalQuestoes,
        obs: 'Criado automaticamente pelo Gabarito Inteligente',
      })
      if (novoSim) finalSimId = novoSim.id
    }
    setSimIdFinal(finalSimId)

    // Salvar gabarito
    await supabase.from('gabaritos').insert({
      user_id: user.id,
      simulado_id: finalSimId || null,
      nome: nome.trim(),
      data,
      total_questoes: totalQuestoes,
      gabarito_oficial: gabarito,
      respostas_aluno: respostas,
      resultado: { acertos: acertosCount, erros: errosParaSalvar, anuladas, totalValidas, pct },
    })

    // Salvar erros
    if (finalSimId && errosParaSalvar.length > 0) {
      await supabase.from('erros').insert(
        errosParaSalvar.map(e => ({
          simulado_id: finalSimId,
          user_id: user.id,
          questao: String(e.questao),
          tipo: e.tipo,
          area: e.tipo === 'conteudo' ? (e.area || '') : '',
          disciplina: e.tipo === 'conteudo' ? (e.disciplina || '') : '',
          topico: e.tipo === 'conteudo' ? (e.topico || '') : '',
          obs: `Marcou ${e.resposta || '—'}, correto: ${e.correta}`,
        }))
      )
    }

    setLoading(false)
    setEtapa('relatorio')
  }

  const handleSalvar = () => salvarTudo(
    errosAnalisados,
    resultado.acertos,
    resultado.totalValidas,
    resultado.pct,
    resultado.anuladas,
  )

  const reiniciar = () => {
    setEtapa('upload'); setGabarito({}); setRespostas({})
    setResultado(null); setErrosAnalisados([])
    setNome(''); setSimuladoId(''); setErro('')
    setDia('dia1'); setQuestaoInicial(1); setTotalQuestoes(90)
    setGabaritoFile(null); setProvaFile(null); setSimIdFinal('')
  }

  const scoreColor = (pct) => pct >= 70 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626'
  const respondidas = Object.keys(respostas).length
  const pctRespondido = Math.round((respondidas / totalQuestoes) * 100)

  // ── Loading overlay ────────────────────────────────────────────
  if (loading) return (
    <div>
      <div className="page-header"><h1 className="page-title">Gabarito Inteligente</h1></div>
      <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{loadingMsg || 'Processando...'}</div>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Aguarde alguns segundos</div>
      </div>
    </div>
  )

  // ── ETAPA 1: Upload ────────────────────────────────────────────
  if (etapa === 'upload') return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gabarito Inteligente</h1>
        <p className="page-subtitle">Upload do gabarito + prova para análise automática com IA</p>
      </div>

      <div style={{ maxWidth: 580 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Nome do simulado *</label>
            <input className="form-input" placeholder="Ex: ENEM 2024 Dia 1, SAS Abril..." value={nome} onChange={e => setNome(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Data</label>
            <input className="form-input" type="date" value={data} onChange={e => setData(e.target.value)} style={{ maxWidth: 200 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Dia do simulado</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { id: 'dia1', label: 'Dia 1', sub: 'Q 1–90' },
                { id: 'dia2', label: 'Dia 2', sub: 'Q 91–180' },
                { id: 'outro', label: 'Outro', sub: 'Personalizado' },
              ].map(d => (
                <div key={d.id} onClick={() => handleDiaChange(d.id)} style={{
                  padding: '10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
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

          {dia === 'outro' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Questão inicial</label>
                <input className="form-input" type="number" value={questaoInicial} min="1" onChange={e => setQuestaoInicial(parseInt(e.target.value) || 1)} />
              </div>
              <div className="form-group">
                <label className="form-label">Total de questões</label>
                <input className="form-input" type="number" value={totalQuestoes} min="1" max="200" onChange={e => setTotalQuestoes(parseInt(e.target.value) || 90)} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Vincular a simulado existente (opcional)</label>
            <select className="form-select" value={simuladoId} onChange={e => setSimuladoId(e.target.value)}>
              <option value="">Criar simulado automaticamente</option>
              {simulados.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Se não vincular, um simulado será criado automaticamente com o nome acima
            </div>
          </div>
        </div>

        {/* Uploads */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>PDFs da prova</div>

          {erro && (
            <div style={{ background: 'var(--danger-light)', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
              {erro}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Gabarito oficial em PDF *
            </div>
            <UploadBox
              label="PDF do gabarito oficial"
              sublabel="Gabaritos SAS, ENEM, Anglo, pH e outros"
              file={gabaritoFile}
              onFile={setGabaritoFile}
            />
          </div>

          <div style={{ fontSize: 12, padding: '10px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, color: '#065F46' }}>
            ✨ Se o gabarito tiver o conteúdo de cada questão (como o SAS), a IA categoriza os erros automaticamente!
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleExtrairGabarito}>
            Extrair gabarito <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  // ── ETAPA 2: Respostas ─────────────────────────────────────────
  if (etapa === 'respostas') return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Suas respostas</h1>
          <p className="page-subtitle">{nome} · Q{questaoInicial}–{questaoInicial + totalQuestoes - 1}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={reiniciar}><RotateCcw size={14} /> Recomeçar</button>
          <button className="btn btn-primary" onClick={handleAnalisar}>
            {provaFile ? '✨ Analisar com IA' : 'Ver resultado'} <ChevronRight size={15} />
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
        <GradeRespostas questaoInicial={questaoInicial} total={totalQuestoes} respostas={respostas} gabarito={gabarito} onChange={(n, a) => setRespostas(p => ({ ...p, [n]: a }))} soLeitura={false} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-primary" onClick={handleAnalisar}>
            {provaFile ? '✨ Analisar com IA' : 'Ver resultado'} <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  // ── ETAPA 3: Revisão dos erros ─────────────────────────────────
  if (etapa === 'revisao') return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Revisar erros</h1>
          <p className="page-subtitle">{errosAnalisados.length} erro{errosAnalisados.length !== 1 ? 's' : ''} encontrado{errosAnalisados.length !== 1 ? 's' : ''} · Confirme o tipo de cada um</p>
        </div>
        <button className="btn" onClick={reiniciar}><RotateCcw size={14} /> Recomeçar</button>
      </div>
      <RevisaoErros
        errosAnalisados={errosAnalisados}
        onChangeTipo={handleChangeTipo}
        onSalvar={handleSalvar}
        loading={loading}
      />
    </div>
  )

  // ── ETAPA 4: Relatório ─────────────────────────────────────────
  if (etapa === 'relatorio' && resultado) return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Relatório</h1>
          <p className="page-subtitle">{nome} · {data}</p>
        </div>
        <button className="btn" onClick={reiniciar}><RotateCcw size={14} /> Novo gabarito</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Aproveitamento</div>
          <div className="stat-value" style={{ color: scoreColor(resultado.pct) }}>{resultado.pct}%</div>
          <div className="stat-sub">{resultado.acertos} de {resultado.totalValidas}</div>
        </div>
        <div className="stat-card"><div className="stat-label" style={{ color: '#059669' }}>✓ Acertos</div><div className="stat-value" style={{ color: '#059669' }}>{resultado.acertos}</div></div>
        <div className="stat-card"><div className="stat-label" style={{ color: '#DC2626' }}>✗ Erros</div><div className="stat-value" style={{ color: '#DC2626' }}>{resultado.erros.length}</div></div>
        {resultado.anuladas > 0 && <div className="stat-card"><div className="stat-label">Anuladas</div><div className="stat-value">{resultado.anuladas}</div></div>}
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

      {errosAnalisados.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Erros salvos ({errosAnalisados.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {errosAnalisados.map(e => (
              <div key={e.questao} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                background: 'var(--surface2)', borderRadius: 8,
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#DC2626', flexShrink: 0 }}>Q{e.questao}</span>
                <div style={{ flex: 1 }}>
                  <span className={`badge badge-${e.tipo === 'interpretacao' ? 'interp' : e.tipo}`} style={{ fontSize: 11 }}>
                    {e.tipo === 'conteudo' ? '📚 Conteúdo' : e.tipo === 'atencao' ? '⚠️ Atenção' : '💬 Interpretação'}
                  </span>
                  {e.tipo === 'conteudo' && e.area && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {e.area} › {e.topico}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Grade completa</div>
        <GradeRespostas questaoInicial={questaoInicial} total={totalQuestoes} respostas={respostas} gabarito={gabarito} onChange={() => {}} soLeitura={true} />
      </div>

      {simIdFinal && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/app/simulado/${simIdFinal}`)}>
            Ver simulado completo <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )

  return null
}
