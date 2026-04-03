# 📂 Thư mục âm thanh KennyQuiz

## Thêm nhạc mới - 2 bước đơn giản:

### Bước 1: Bỏ file vào đây
Đặt file âm thanh vào thư mục này:
```
public/sounds/correct.mp3
public/sounds/win.mp4
public/sounds/celebrate.mp3
...
```

### Bước 2: Đăng ký file trong danh sách nhạc
Mở file `src/config/sounds.js` và thêm tên file vào mảng:
```js
const SOUND_LIST = [
  '/sounds/correct.mp3',
  '/sounds/win.mp4',       // ← Thêm như thế này
  '/sounds/celebrate.mp3', // ← Và thế này
]
```

## Hỗ trợ định dạng
| Định dạng | Ghi chú |
|-----------|---------|
| `.mp3` | ✅ Khuyến nghị (nhẹ, tương thích cao) |
| `.mp4` | ✅ Chỉ phát phần âm thanh |
| `.wav` | ✅ Hỗ trợ |
| `.ogg` | ✅ Hỗ trợ |

## Cơ chế phát ngẫu nhiên
- Mỗi khi trả lời đúng, app sẽ **chọn ngẫu nhiên** một bài từ danh sách
- Không lặp lại bài vừa phát liên tiếp
- Nhạc tự dừng sau **8 giây** hoặc khi trả lời câu tiếp theo
