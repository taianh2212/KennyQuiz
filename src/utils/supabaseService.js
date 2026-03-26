import { supabase } from './supabaseClient'

// ─────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────

/** Lấy toàn bộ dự án (sắp xếp mới nhất trước) */
export const fetchProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, created_at, updated_at,
      cards ( id, question, answer, options, position )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Chuẩn hoá: sắp xếp cards theo position
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

/** Tạo dự án mới kèm cards */
export const createProject = async ({ name, cards }) => {
  // 1. Insert project
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .insert({ name })
    .select()
    .single()

  if (pErr) throw pErr

  // 2. Insert cards (batch)
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

  // 3. Return full project with cards
  return fetchProjectById(project.id)
}

/** Lấy một dự án theo id */
export const fetchProjectById = async (id) => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, created_at, updated_at,
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

/** Cập nhật tên dự án và toàn bộ cards (xoá cũ, thêm mới) */
export const updateProject = async ({ id, name, cards }) => {
  // 1. Update project name
  const { error: pErr } = await supabase
    .from('projects')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (pErr) throw pErr

  // 2. Xoá toàn bộ cards cũ (cascade sẽ xoá tự động nếu project bị xoá, nhưng ở đây ta update)
  const { error: dErr } = await supabase
    .from('cards')
    .delete()
    .eq('project_id', id)

  if (dErr) throw dErr

  // 3. Thêm cards mới
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

/** Xoá dự án (cards bị xoá tự động do ON DELETE CASCADE) */
export const deleteProject = async (id) => {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────────────
// SYNC HELPER: localStorage ↔ Supabase
// ─────────────────────────────────────────────────

/**
 * Kiểm tra Supabase có kết nối được không.
 * Trả về true nếu OK, false nếu lỗi (sẽ dùng localStorage fallback).
 */
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('projects').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
