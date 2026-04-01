-- ================================================================
-- KENNYQUIZ - COMPLETE DATABASE SCHEMA
-- Chạy TOÀN BỘ file này trong Supabase SQL Editor
-- Nếu đã có bảng cũ, script này sẽ tự bỏ qua (IF NOT EXISTS)
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- BẢNG 1: USERS (Tài khoản người dùng tùy chỉnh)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  username     TEXT        UNIQUE NOT NULL,
  password_hash TEXT       NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Tắt RLS - phân quyền xử lý bằng code (lọc theo user_id)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────────
-- BẢNG 2: PROJECTS (Dự án flashcard)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  user_id    UUID        REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Index để query nhanh theo user
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);


-- ────────────────────────────────────────────────────────────────
-- BẢNG 3: CARDS (Thẻ học trong mỗi dự án)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cards (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID    REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  question   TEXT    NOT NULL,
  answer     TEXT    NOT NULL,
  options    JSONB   DEFAULT NULL,  -- Lưu mảng đáp án MCQ: ["A", "B", "C", "D"]
  position   INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;

-- Index để query nhanh theo project
CREATE INDEX IF NOT EXISTS idx_cards_project_id ON public.cards(project_id);
CREATE INDEX IF NOT EXISTS idx_cards_position   ON public.cards(project_id, position);


-- ────────────────────────────────────────────────────────────────
-- BẢNG 4: USER_PROGRESS (Tiến độ học của mỗi user)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID    NOT NULL,
  project_id    UUID    NOT NULL,
  last_index    INTEGER DEFAULT 0,
  answered_data JSONB   DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;

-- Index để query nhanh
CREATE INDEX IF NOT EXISTS idx_progress_user_project ON public.user_progress(user_id, project_id);


-- ────────────────────────────────────────────────────────────────
-- XỬ LÝ CỘT user_id TRONG BẢNG PROJECTS (nếu cũ chưa có)
-- ────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Thêm cột user_id nếu chưa có
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projects'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  -- Cập nhật FK nếu đang trỏ sai tới auth.users
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'projects'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.column_name = 'user_id'
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth'
  ) THEN
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;


-- ────────────────────────────────────────────────────────────────
-- KIỂM TRA KẾT QUẢ
-- Sau khi chạy, bạn sẽ thấy đủ 4 bảng trong Results
-- ────────────────────────────────────────────────────────────────
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS so_cot
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('users', 'projects', 'cards', 'user_progress')
ORDER BY table_name;
