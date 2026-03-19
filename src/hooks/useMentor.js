import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMentor() {
  const [alunos, setAlunos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAlunos = useCallback(async () => {
    setLoading(true)
    // Busca todos os simulados com erros
    const { data: simulados } = await supabase
      .from('simulados')
      .select('*, erros(*)')
      .order('data', { ascending: false })

    // Busca a view de alunos
    const { data: alunosData } = await supabase
      .from('alunos_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (!alunosData) { setLoading(false); return }

    // Agrupa simulados por aluno
    const alunosComSimulados = alunosData.map(aluno => ({
      ...aluno,
      simulados: (simulados || [])
        .filter(s => s.user_id === aluno.id)
        .sort((a, b) => new Date(b.data) - new Date(a.data)),
    }))

    setAlunos(alunosComSimulados)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAlunos() }, [fetchAlunos])

  return { alunos, loading, refresh: fetchAlunos }
}
