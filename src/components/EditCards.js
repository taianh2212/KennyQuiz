import React, { useState } from 'react'
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  PlusIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  BookOpenIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

const EditCards = ({ project, onBack, onSave }) => {
  const [name, setName] = useState(project.name)
  const [cards, setCards] = useState(project.cards || [])

  const handleAddCard = () => {
    setCards([...cards, { id: Date.now(), question: '', answer: '' }])
  }

  const handleDeleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id))
  }

  const handleUpdateCard = (id, field, value) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleSave = () => {
    onSave({ ...project, name, cards })
    onBack()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-1 pb-16">
      {/* Sticky Mobile Header */}
      <header className="flex items-center gap-3 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-100 sm:border-none">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-slate-700 active:scale-90 transition-all">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none truncate mb-1">Chỉnh sửa dự án</h2>
          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
            <BookOpenIcon className="w-3 h-3" /> {cards.length} thẻ học
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="btn-primary py-3 px-5 shadow-blue-500/25 text-sm sm:text-base whitespace-nowrap"
        >
          <CloudArrowUpIcon className="w-5 h-5 flex-shrink-0" /> Lưu lại
        </button>
      </header>

      {/* Project Name Input */}
      <div className="px-1 sm:px-0">
        <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest pl-2 mb-2 block">Tên dự án</label>
        <div className="relative group">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl sm:text-4xl font-black p-6 sm:p-10 rounded-[2rem] bg-white border-2 border-slate-50 focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all outline-none shadow-sm"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-100 group-hover:text-blue-100 transition-colors">
            <PencilIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4 pt-4">
        {cards.map((card, idx) => (
          <div key={card.id} className="card-glass p-0 overflow-hidden border-2 border-white hover:border-blue-100 transition-all group slide-in-bottom shadow-sm hover:shadow-xl" style={{ animationDelay: `${idx * 40}ms` }}>
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 py-1 bg-white rounded-lg shadow-sm border border-slate-100">STT #{idx + 1}</span>
              <button 
                onClick={() => handleDeleteCard(card.id)}
                className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-10 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Câu hỏi bài học</label>
                </div>
                <textarea 
                  value={card.question}
                  onChange={(e) => handleUpdateCard(card.id, 'question', e.target.value)}
                  className="w-full text-xl sm:text-2xl font-black bg-transparent border-none p-0 focus:ring-0 min-h-[40px] resize-none overflow-hidden placeholder-slate-200"
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={2}
                />
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <label className="text-[10px] font-black uppercase text-green-500 tracking-widest">Đáp án đúng</label>
                </div>
                <textarea 
                  value={card.answer}
                  onChange={(e) => handleUpdateCard(card.id, 'answer', e.target.value)}
                  className="w-full text-xl sm:text-2xl font-black bg-transparent border-none p-0 focus:ring-0 min-h-[40px] resize-none overflow-hidden text-green-600 placeholder-green-100"
                  placeholder="Nhập nội dung đáp án..."
                  rows={2}
                />
              </div>

              {/* Show MCQ options if present */}
              {card.options && card.options.length > 0 && (
                <div className="mt-4 p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 ring-4 ring-slate-50/50">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-3 h-3 text-blue-400" /> Các phương án trắc nghiệm sẵn có:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {card.options.map((opt, i) => (
                      <div key={i} className={`p-4 rounded-xl text-sm font-bold border transition-all flex items-center gap-3 ${opt === card.answer ? 'bg-green-50 border-green-200 text-green-700 ring-2 ring-green-50' : 'bg-white border-slate-100 text-slate-500'}`}>
                        <span className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">{String.fromCharCode(65 + i)}</span>
                        <span className="truncate flex-1">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddCard}
          className="w-full p-10 sm:p-14 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-300 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex flex-col items-center gap-4 font-black text-xl mb-10 group"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-blue-100 group-hover:scale-110 transition-all">
            <PlusIcon className="w-10 h-10" />
          </div>
          Thêm thẻ mới bằng tay
        </button>
      </div>

      {/* Floating Action Button for Mobile Save */}
      <div className="fixed bottom-6 right-6 sm:hidden z-20">
        <button 
          onClick={handleSave}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center animate-pulse-short active:scale-90 transition-all ring-8 ring-blue-500/20"
        >
          <CloudArrowUpIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  )
}

export default EditCards
