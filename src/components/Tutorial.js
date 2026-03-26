import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const steps = [
  {
    icon: '➕',
    title: 'Tạo dự án mới',
    desc: 'Nhấn "Tạo dự án mới" ở trang chính để bắt đầu.'
  },
  {
    icon: '📄',
    title: 'Nhập nội dung',
    desc: 'Dán văn bản, bài học, từ vựng... vào vùng nhập liệu. Đặt tên dự án và chọn số thẻ muốn tạo.'
  },
  {
    icon: '🤖',
    title: 'AI tạo thẻ',
    desc: 'Nhấn "Tạo thẻ bằng AI" — Gemini sẽ phân tích và tạo câu hỏi tự động trong vài giây.'
  },
  {
    icon: '✏️',
    title: 'Chỉnh sửa & Lưu',
    desc: 'Xem lại các thẻ AI tạo, chỉnh sửa nếu cần, thêm/xóa thẻ, rồi lưu dự án.'
  },
  {
    icon: '🎯',
    title: 'Bắt đầu học',
    desc: 'Chọn "▶ Học" ở dự án. Đọc câu hỏi và chọn đáp án đúng. Hệ thống tự chấm điểm!'
  },
  {
    icon: '🔀',
    title: 'Tuỳ chọn học',
    desc: 'Bật "Trộn câu" và "Trộn đáp án" để thử thách bản thân. Học lại câu sai sau mỗi lượt.'
  },
  {
    icon: '📊',
    title: 'Xem kết quả',
    desc: 'Sau khi học, xem điểm tổng kết. Nhấn "Học lại câu sai" để ôn tập câu chưa đúng.'
  }
]

const Tutorial = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pop-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 rounded-t-3xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gradient">Chào mừng đến KennyQuiz! 👋</h2>
            <p className="text-sm text-gray-500 mt-1">Học thông minh hơn với AI</p>
          </div>
          <button
            id="btn-close-tutorial"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-8 py-6">
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-2xl border border-blue-100">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge bg-blue-500 text-white text-xs">{idx + 1}</span>
                    <h3 className="font-semibold text-gray-800">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
            <h4 className="font-bold text-amber-800 mb-3">💡 Mẹo sử dụng hiệu quả</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• Nội dung càng chi tiết → AI tạo thẻ càng chất lượng</li>
              <li>• Dùng tiếng Việt hoặc tiếng Anh đều được</li>
              <li>• Học ít nhất 3 lần để ghi nhớ lâu hơn</li>
              <li>• Bật "Trộn câu" để không học thuộc thứ tự</li>
            </ul>
          </div>

          <button
            id="btn-start-tutorial"
            onClick={onClose}
            className="w-full btn-primary py-4 mt-6 text-lg"
          >
            Bắt đầu ngay! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

export default Tutorial
