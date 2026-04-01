-- 1. Bảng lưu tiến độ học tập của từng user cho từng dự án
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  last_index INTEGER DEFAULT 0,
  answered_data JSONB DEFAULT '{}'::jsonb, -- Lưu { card_id: { isCorrect, selected } }
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 2. Bật RLS cho bảng tiến độ
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 3. Policy cho bảng tiến độ (User chỉ thấy tiến độ của mình)
CREATE POLICY "Users can manage their own progress" 
ON public.user_progress FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 4. Cập nhật bảng cards (thêm metadata nếu cần, hiện tại giữ nguyên)
-- 5. Cập nhật bảng projects (thêm owner_id để bảo mật dự án cá nhân)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 6. Cập nhật Policy cho projects (Chỉ chủ sở hữu mới thấy dự án của họ)
-- Xóa policy cũ nếu có rồi chạy cái này
DROP POLICY IF EXISTS "Allow all for projects" ON public.projects;
CREATE POLICY "Users can manage their own projects" 
ON public.projects FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow all for cards" ON public.cards;
CREATE POLICY "Users can manage cards of their projects" 
ON public.cards FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = public.cards.project_id 
    AND (public.projects.user_id = auth.uid() OR public.projects.user_id IS NULL)
  )
);
