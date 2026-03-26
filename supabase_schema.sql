-- =====================================================
-- KennyQuiz Database Schema
-- Chạy trong: Supabase Dashboard → SQL Editor → New Query
-- =====================================================

-- 1. Bảng projects (dự án)
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Bảng cards (thẻ câu hỏi)
CREATE TABLE IF NOT EXISTS public.cards (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  options     JSONB DEFAULT NULL,   -- Lưu array đáp án MCQ gốc
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Index để query nhanh
CREATE INDEX IF NOT EXISTS idx_cards_project_id ON public.cards(project_id);
CREATE INDEX IF NOT EXISTS idx_cards_position    ON public.cards(project_id, position);

-- 4. Row Level Security (cho phép anon đọc/ghi – no auth)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards    ENABLE ROW LEVEL SECURITY;

-- Policy: cho phép tất cả (không cần đăng nhập)
DROP POLICY IF EXISTS "Allow all" ON public.projects;
CREATE POLICY "Allow all" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all" ON public.cards;
CREATE POLICY "Allow all" ON public.cards FOR ALL USING (true) WITH CHECK (true);

-- 5. Function tự update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.projects;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Xong! Kiểm tra bảng:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
