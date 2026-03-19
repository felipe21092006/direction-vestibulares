import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePerfil } from '../hooks/usePerfil'
import { Camera, Save, User } from 'lucide-react'

export default function Perfil() {
  const { user } = useAuth()
  const { perfil, loading, savePerfil, uploadAvatar } = usePerfil()

  const [nome, setNome]     = useState('')
  const [turma, setTurma]   = useState('')
  const [cidade, setCidade] = useState('')
  const [escola, setEscola] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome || '')
      setTurma(perfil.turma || '')
      setCidade(perfil.cidade || '')
      setEscola(perfil.escola || '')
    }
  }, [perfil])

  const handleSave = async () => {
    setSaving(true)
    setSucesso(false)
    const { error } = await savePerfil({ nome, turma, cidade, escola, avatar_url: perfil?.avatar_url || '' })
    setSaving(false)
    if (!error) {
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Foto muito grande! Máximo 2MB.'); return }
    setUploading(true)
    await uploadAvatar(file)
    setUploading(false)
  }

  const initials = (nome || user?.email || '?').charAt(0).toUpperCase()

  if (loading) return <div className="empty-state"><div className="empty-sub">Carregando perfil...</div></div>

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Meu Perfil</h1>
        <p className="page-subtitle">Suas informações pessoais</p>
      </div>

      <div style={{ maxWidth: 520 }}>
        {/* Avatar */}
        <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {perfil?.avatar_url ? (
              <img
                src={perfil.avatar_url}
                alt="avatar"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 800, color: '#fff',
                fontFamily: 'var(--font-display)',
              }}>
                {initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', border: '2px solid var(--surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
            >
              <Camera size={13} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{nome || 'Sem nome'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</div>
            {turma && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{turma}</div>}
            {uploading && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>Enviando foto...</div>}
          </div>
        </div>

        {/* Form */}
        <div className="card">
          {sucesso && (
            <div style={{
              background: '#ECFDF5', border: '1px solid #A7F3D0',
              color: '#065F46', borderRadius: 8, padding: '10px 14px',
              fontSize: 13, marginBottom: 16,
            }}>
              ✓ Perfil salvo com sucesso!
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input className="form-input" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Turma / Curso</label>
              <input className="form-input" placeholder="Ex: 3º ano, Medicina..." value={turma} onChange={e => setTurma(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input className="form-input" placeholder="Ex: Aracaju" value={cidade} onChange={e => setCidade(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Escola / Cursinho</label>
            <input className="form-input" placeholder="Ex: Colégio X, Cursinho Y..." value={escola} onChange={e => setEscola(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={14} /> {saving ? 'Salvando...' : 'Salvar perfil'}
            </button>
          </div>
        </div>

        {/* Email info */}
        <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--surface2)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
          <strong>Email de acesso:</strong> {user?.email}
        </div>
      </div>
    </div>
  )
}
