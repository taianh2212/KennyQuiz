-- Tạo bảng lưu tiến độ học tập
-- KHÔNG có foreign key để tránh lỗi constraint
-- Chạy từng lệnh một nếu gặp lỗi

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL,
  last_index INTEGER DEFAULT 0,
  answered_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Tắt RLS để không cần policy phức tạp
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;

-- Kiểm tra bảng đã tạo thành công chưa
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'projects', 'cards', 'user_progress');
