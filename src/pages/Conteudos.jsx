import { useState } from 'react'
import { useSimulados } from '../hooks/useSimulados'
import { ENEM_CONTENT, AREAS, AREA_COLORS } from '../data/enemContent'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function Conteudos() {
  const { simulados } = useSimulados()
  const [expandedArea, setExpandedArea] = useState(null)
  const [expandedDisc, setExpandedDisc] = useState({})

  const allErros = simulados.flatMap(s => s.erros || []).filter(e => e.tipo === 'conteudo')

  const erroMap = {}
  allErros.forEach(e => {
    if (!e.area || !e.disciplina || !e.topico) return
    erroMap[e.area] = (erroMap[e.area] || 0) + 1
    erroMap[`${e.area}||${e.disciplina}`] = (erroMap[`${e.area}||${e.disciplina}`] || 0) + 1
    erroMap[`${e.area}||${e.disciplina}||${e.topico}`] = (erroMap[`${e.area}||${e.disciplina}||${e.topico}`] || 0) + 1
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mapa de Conteúdos</h1>
        <p className="page-subtitle">{allErros.length} erros de conteúdo registrados</p>
      </div>

      {allErros.length === 0 && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          ℹ️ Adicione erros do tipo "Conteúdo" nos simulados para ver os tópicos destacados aqui.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {AREAS.map(area => {
          const c = AREA_COLORS[area]
          const areaCount = erroMap[area] || 0
          const isOpen = expandedArea === area
          const disciplinas = Object.keys(ENEM_CONTENT[area]).filter(k => k !== 'color' && k !== 'colorLight')

          return (
            <div key={area} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div onClick={() => setExpandedArea(isOpen ? null : area)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', cursor: 'pointer',
                background: isOpen ? c?.light : 'transparent',
                borderBottom: isOpen ? `1px solid ${c?.light}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: c?.bg }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: isOpen ? c?.text : 'var(--text-primary)' }}>{area}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{disciplinas.length} disciplinas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {areaCount > 0 && (
                    <span style={{ background: c?.bg, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                      {areaCount} erro{areaCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: '8px 12px 12px' }}>
                  {disciplinas.map(disc => {
                    const discKey = `${area}||${disc}`
                    const discCount = erroMap[discKey] || 0
                    const isDiscOpen = !!expandedDisc[discKey]
                    const topicos = ENEM_CONTENT[area][disc] || []

                    return (
                      <div key={disc} style={{ marginBottom: 6 }}>
                        <div onClick={() => setExpandedDisc(prev => ({ ...prev, [discKey]: !prev[discKey] }))} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                          background: isDiscOpen ? 'var(--surface2)' : 'transparent',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isDiscOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{disc}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{topicos.length} tópicos</span>
                          </div>
                          {discCount > 0 && <span className="badge badge-conteudo">{discCount} erro{discCount !== 1 ? 's' : ''}</span>}
                        </div>

                        {isDiscOpen && (
                          <div style={{ paddingLeft: 28, paddingTop: 6, paddingBottom: 4 }}>
                            {topicos.map(topico => {
                              const topicoCount = erroMap[`${area}||${disc}||${topico}`] || 0
                              return (
                                <div key={topico} style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '5px 10px', borderRadius: 6,
                                  background: topicoCount > 0 ? '#FEF2F2' : 'transparent', marginBottom: 2,
                                }}>
                                  <span style={{ fontSize: 13, color: topicoCount > 0 ? '#991B1B' : 'var(--text-secondary)', fontWeight: topicoCount > 0 ? 500 : 400 }}>
                                    {topicoCount > 0 ? '● ' : '○ '}{topico}
                                  </span>
                                  {topicoCount > 0 && (
                                    <span style={{ background: '#DC2626', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700, marginLeft: 8 }}>
                                      {topicoCount}×
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
