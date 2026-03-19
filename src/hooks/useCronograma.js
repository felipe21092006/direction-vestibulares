import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { ENEM_CONTENT } from '../data/enemContent'

// Conta total de tópicos únicos no ENEM
function countTotalTopicos() {
  let total = 0
  Object.values(ENEM_CONTENT).forEach(mat => {
    Object.keys(mat)
      .filter(k => k !== 'color' && k !== 'colorLight')
      .forEach(cont => {
        const topicos = Object.keys(mat[cont])
        total += topicos.length > 0 ? topicos.length : 1
      })
  })
  return total
}

const TOTAL_TOPICOS = countTotalTopicos()

export function useCronograma(userId) {
  const { user } = useAuth()
  const targetId = userId || user?.id
  const [entradas, setEntradas] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEntradas = useCallback(async () => {
    if (!targetId) return
    setLoading(true)
    const { data } = await supabase
      .from('cronograma')
      .select('*')
      .eq('user_id', targetId)
      .order('data', { ascending: false })
    setEntradas(data || [])
    setLoading(false)
  }, [targetId])

  useEffect(() => { fetchEntradas() }, [fetchEntradas])

  const addEntrada = async (entrada) => {
    const { data, error } = await supabase
      .from('cronograma')
      .insert({ user_id: targetId, ...entrada })
      .select()
      .single()
    if (!error && data) setEntradas(prev => [data, ...prev])
    return { error }
  }

  const deleteEntrada = async (id) => {
    await supabase.from('cronograma').delete().eq('id', id)
    setEntradas(prev => prev.filter(e => e.id !== id))
  }

  const estudados = new Set(
    entradas.map(e => `${e.materia}||${e.conteudo}||${e.topico}`)
  ).size

  const pctConcluido = Math.min(100, Math.round((estudados / TOTAL_TOPICOS) * 100))

  return {
    entradas,
    loading,
    addEntrada,
    deleteEntrada,
    estudados,
    totalTopicos: TOTAL_TOPICOS,
    pctConcluido,
    refresh: fetchEntradas,
  }
}
