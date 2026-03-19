import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSimulados() {
  const { user } = useAuth()
  const [simulados, setSimulados] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSimulados = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: sims } = await supabase
      .from('simulados')
      .select('*, erros(*)')
      .eq('user_id', user.id)
      .order('data', { ascending: false })
    setSimulados(sims || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchSimulados() }, [fetchSimulados])

  const addSimulado = async (sim) => {
    const { data, error } = await supabase.from('simulados').insert({
      user_id: user.id,
      nome: sim.nome,
      data: sim.data,
      dias: sim.dias,
      total_questoes: sim.totalQuestoes,
      obs: sim.obs,
    }).select('*, erros(*)').single()
    if (!error && data) {
      setSimulados(prev => [data, ...prev])
      return data
    }
    return null
  }

  const deleteSimulado = async (id) => {
    await supabase.from('simulados').delete().eq('id', id)
    setSimulados(prev => prev.filter(s => s.id !== id))
  }

  const addErro = async (simuladoId, erro) => {
    const { data, error } = await supabase.from('erros').insert({
      simulado_id: simuladoId,
      user_id: user.id,
      questao: erro.questao,
      tipo: erro.tipo,
      area: erro.area,
      disciplina: erro.disciplina,
      topico: erro.topico,
      obs: erro.obs,
    }).select().single()
    if (!error && data) {
      setSimulados(prev => prev.map(s =>
        s.id === simuladoId
          ? { ...s, erros: [...(s.erros || []), data] }
          : s
      ))
    }
  }

  const deleteErro = async (simuladoId, erroId) => {
    await supabase.from('erros').delete().eq('id', erroId)
    setSimulados(prev => prev.map(s =>
      s.id === simuladoId
        ? { ...s, erros: (s.erros || []).filter(e => e.id !== erroId) }
        : s
    ))
  }

  return { simulados, loading, addSimulado, deleteSimulado, addErro, deleteErro, refresh: fetchSimulados }
}
