import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bdnedmdzoxhpcabjnrco.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbmVkbWR6b3hocGNhYmpucmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODc0OTQsImV4cCI6MjA4OTM2MzQ5NH0.R0lmoJ8ZYjKpTXewgBm5fsdIStccREMdyAJbxFVAl58'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
// Helper to get perfil data
export async function getPerfilByUserId(userId) {
  const { data } = await supabase.from('perfis').select('*').eq('id', userId).single()
  return data
}
