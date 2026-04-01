import { supabase } from './supabaseClient'

// ─────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────

export const fetchProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, created_at, updated_at, user_id,
      cards ( id, question, answer, options, position )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map((p) => ({
    ...p,
    cards: (p.cards || [])
      .sort((a, b) => a.position - b.position)
      .map((c) => ({
        ...c,
        options: c.options || null,
      })),
  }))
}

export const createProject = async ({ name, cards }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Cần đăng nhập để tạo dự án!')

  const { data: project, error: pErr } = await supabase
    .from('projects')
    .insert({ name, user_id: user.id })
    .select()
    .single()

  if (pErr) throw pErr

  if (cards && cards.length > 0) {
    const cardRows = cards.map((c, idx) => ({
      project_id: project.id,
      question: c.question,
      answer: c.answer,
      options: c.options || null,
      position: idx,
    }))
    const { error: cErr } = await supabase.from('cards').insert(cardRows)
    if (cErr) throw cErr
  }
  return fetchProjectById(project.id)
}

export const fetchProjectById = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, created_at, updated_at, user_id,
      cards ( id, question, answer, options, position )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return {
    ...data,
    cards: (data.cards || [])
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ ...c, options: c.options || null })),
  }
}

export const updateProject = async ({ id, name, cards }) => {
  const { error: pErr } = await supabase
    .from('projects')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (pErr) throw pErr

  const { error: dErr } = await supabase.from('cards').delete().eq('project_id', id)
  if (dErr) throw dErr

  if (cards && cards.length > 0) {
    const cardRows = cards.map((c, idx) => ({
      project_id: id,
      question: c.question,
      answer: c.answer,
      options: c.options || null,
      position: idx,
    }))
    const { error: cErr } = await supabase.from('cards').insert(cardRows)
    if (cErr) throw cErr
  }
  return fetchProjectById(id)
}

export const deleteProject = async (id) => {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────────────
// PROGRESS SYNC
// ─────────────────────────────────────────────────

export const saveProgress = async (projectId, lastIndex, answeredData) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      project_id: projectId,
      last_index: lastIndex,
      answered_data: answeredData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, project_id' })
  
  if (error) console.error('Lỗi lưu tiến độ:', error)
}

export const getProgress = async (projectId) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
    console.error('Lỗi tải tiến độ:', error)
  }
  return data || null
}

export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('projects').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
