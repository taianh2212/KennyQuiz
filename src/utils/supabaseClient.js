import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || 'https://ofixcdecytqqxfdewmdd.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''  // ← điền vào .env

if (!SUPABASE_ANON_KEY) {
  console.warn('[KennyQuiz] Chưa có SUPABASE_ANON_KEY — dữ liệu sẽ lưu localStorage.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
