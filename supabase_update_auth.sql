-- Bảng users tùy chỉnh (không dùng Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng tiến độ học tập
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  last_index INTEGER DEFAULT 0,
  answered_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Thêm cột user_id vào projects nếu chưa có
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Bật RLS cho users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc/ghi users (cần để đăng ký/đăng nhập)
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert users" ON public.users;
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);

-- Bật RLS cho user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for progress" ON public.user_progress;
CREATE POLICY "Allow all for progress" ON public.user_progress FOR ALL USING (true);

-- Bật RLS cho projects (cho phép tất cả - đã dùng user_id để phân biệt)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for projects" ON public.projects;
CREATE POLICY "Allow all for projects" ON public.projects FOR ALL USING (true);

-- Bật RLS cho cards
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for cards" ON public.cards;
CREATE POLICY "Allow all for cards" ON public.cards FOR ALL USING (true);
