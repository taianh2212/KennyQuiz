# 🚀 KennyQuiz — AI-Powered Learning App

**KennyQuiz** là ứng dụng học tập thông minh sử dụng trí tuệ nhân tạo (Gemini AI) để biến mọi tài liệu thành thẻ câu hỏi (Flashcards) chỉ trong vài giây.

![Interface Screenshot](https://raw.githubusercontent.com/taianh2212/KennyQuiz/main/public/logo192.png)

## ✨ Tính năng nổi bật
- 🤖 **AI Model Fallback**: Tự động chuyển đổi thông minh giữa Gemini 1.5-flash, 2.0-flash và 1.5-pro để tối ưu hóa quota.
- ⚡ **Siêu tốc với MCQ Mode**: Nhận diện đề trắc nghiệm A/B/C/D tự động, parse 100+ câu hỏi chỉ trong < 1 giây mà không cần AI.
- ☁️ **Cloud Sync**: Lưu trữ và đồng bộ hóa toàn bộ dự án qua Supabase (PostgreSQL).
- 🤳 **Mobile Optimized**: Giao diện được thiết kế riêng cho màn hình điện thoại, phù hợp để ôn thi mọi lúc mọi nơi.
- 🔀 **Shuffle Mode**: Tự động trộn câu hỏi và các phương án trả lời để tăng hiệu quả ghi nhớ.

## 🛠️ Công nghệ sử dụng
- **Frontend**: React 18, Tailwind CSS, Heroicons.
- **Backend/DB**: Supabase (PostgreSQL), Edge Functions (Row Level Security).
- **AI**: Google Gemini AI API.
- **Deployment**: Vercel.

## 🚀 Cách cài đặt nhanh
1. Clone dự án: `git clone https://github.com/taianh2212/KennyQuiz.git`
2. Cài đặt dependencies: `npm install`
3. Cấu hình `.env`:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   ```
4. Chạy dự án: `npm start`

---
*Phát triển bởi taianh2212 với sự hỗ trợ từ Antigravity AI.*
