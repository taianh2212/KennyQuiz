import { supabase } from './supabaseClient'

// ─────────────────────────────────────────────────
// CUSTOM AUTH (Không dùng Supabase Auth)
// ─────────────────────────────────────────────────

const SESSION_KEY = 'kennyquiz_user'

/** Mã hóa mật khẩu bằng SHA-256 */
const hashPassword = async (password) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Lấy user hiện tại từ localStorage */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Đăng ký tài khoản mới */
export const signUp = async (username, password) => {
  const trimmed = username.trim().toLowerCase()

  // Kiểm tra tên đã tồn tại chưa
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', trimmed)
    .single()

  if (existing) throw new Error('Tên đăng nhập đã tồn tại!')

  const password_hash = await hashPassword(password)

  const { data, error } = await supabase
    .from('users')
    .insert({ username: trimmed, password_hash })
    .select('id, username, created_at')
    .single()

  if (error) throw new Error('Không thể tạo tài khoản: ' + error.message)

  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
  return data
}

/** Đăng nhập */
export const signIn = async (username, password) => {
  const trimmed = username.trim().toLowerCase()
  const password_hash = await hashPassword(password)

  const { data, error } = await supabase
    .from('users')
    .select('id, username, created_at')
    .eq('username', trimmed)
    .eq('password_hash', password_hash)
    .single()

  if (error || !data) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng!')

  localStorage.setItem(SESSION_KEY, JSON.stringify(data))
  return data
}

/** Đăng xuất */
export const signOut = () => {
  localStorage.removeItem(SESSION_KEY)
}

// ─────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────

export const fetchProjects = async () => {
  const user = getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, created_at, updated_at, user_id,
      cards ( id, question, answer, options, position )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map((p) => ({
    ...p,
    cards: (p.cards || [])
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ ...c, options: c.options || null })),
  }))
}

export const createProject = async ({ name, cards }) => {
  const user = getCurrentUser()
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
// PROGRESS
// ─────────────────────────────────────────────────

export const saveProgress = async (projectId, lastIndex, answeredData) => {
  const user = getCurrentUser()
  if (!user) return

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      project_id: projectId,
      last_index: lastIndex,
      answered_data: answeredData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,project_id' })

  if (error) console.error('Lỗi lưu tiến độ:', error)
}

export const getProgress = async (projectId) => {
  const user = getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single()

  if (error && error.code !== 'PGRST116') {
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
