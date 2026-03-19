import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePerfil() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPerfil = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single()
    setPerfil(data || { id: user.id, nome: '', turma: '', cidade: '', escola: '', avatar_url: '' })
    setLoading(false)
  }, [user])

  useEffect(() => { fetchPerfil() }, [fetchPerfil])

  const savePerfil = async (dados) => {
    const { data, error } = await supabase
      .from('perfis')
      .upsert({ id: user.id, ...dados, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (!error && data) setPerfil(data)
    return { error }
  }

  const uploadAvatar = async (file) => {
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) return { error: uploadError }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = data.publicUrl + '?t=' + Date.now()
    await savePerfil({ ...perfil, avatar_url: url })
    return { url }
  }

  return { perfil, loading, savePerfil, uploadAvatar, refresh: fetchPerfil }
}
