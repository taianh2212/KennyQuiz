import React, { useState, useEffect, useRef } from 'react'
import { 
  SparklesIcon, 
  ArrowLeftIcon, 
  TrashIcon, 
  PlusIcon,
  CheckBadgeIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { generateCards, isMCQFormat } from '../utils/geminiAPI'
import { parseMCQText } from '../utils/parseMCQ'

const CreateProject = ({ onBack, onSave }) => {
  const [step, setStep] = useState('choose') // 'choose', 'input', 'review'
  const [projectName, setProjectName] = useState('')
  const [mode, setMode] = useState(null) // 'ai', 'mcq', 'manual'
  const [rawText, setRawText] = useState('')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isMCQDetected, setIsMCQDetected] = useState(false)
  
  const textareaRef = useRef(null)

  // Auto detect MCQ
  useEffect(() => {
    if (rawText.length > 20) {
      setIsMCQDetected(isMCQFormat(rawText))
    } else {
      setIsMCQDetected(false)
    }
  }, [rawText])

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError('Cần đặt tên dự án trước nhé!')
      return
    }
    setError(null)
    setLoading(true)
    
    try {
      let generated = []
      if (mode === 'ai') {
        generated = await generateCards(rawText)
      } else if (mode === 'mcq') {
        generated = parseMCQText(rawText)
      } else {
        generated = [{ id: Date.now(), question: '', answer: '' }]
      }
      
      setCards(generated)
      setStep('review')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = () => {
    setCards([...cards, { id: Date.now(), question: '', answer: '' }])
  }

  const handleDeleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id))
  }

  const handleUpdateCard = (id, field, value) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const submitProject = () => {
    if (cards.length === 0) {
      setError('Ít nhất phải có 1 thẻ chứ!')
      return
    }
    onSave({ name: projectName, cards })
  }

  // =================== STEP: CHOOSE ===================
  if (step === 'choose') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in px-1">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-800">Khởi tạo dự án</h2>
          <p className="text-slate-400 text-lg sm:text-xl font-medium">Bắt đầu bằng một cái tên thật kêu!</p>
        </div>

        <div className="card-glass p-6 sm:p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-blue-500">📁 Tên dự án</label>
            <input 
              type="text" 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ví dụ: Lịch sứ Đảng, English Unit 1..."
              className="w-full text-2xl sm:text-3xl font-black p-5 sm:p-8 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <button 
              onClick={() => { setMode('ai'); setStep('input'); }}
              className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-slate-50 hover:border-blue-400 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                <SparklesIcon className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black text-slate-800">Dùng AI</div>
                <p className="text-xs font-bold text-slate-400">Từ file PDF, ảnh, text...</p>
              </div>
            </button>

            <button 
              onClick={() => { setMode('mcq'); setStep('input'); }}
              className="p-8 bg-green-50 rounded-[2.5rem] border-2 border-slate-50 hover:border-green-400 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 bg-green-500 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:-rotate-12 transition-transform">
                <ClipboardDocumentListIcon className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black text-slate-800">Dán MCQ</div>
                <p className="text-xs font-bold text-slate-400">Đề trắc nghiệm A/B/C/D</p>
              </div>
            </button>

            <button 
              onClick={() => { setMode('manual'); setStep('review'); setCards([{ id: Date.now(), question: '', answer: '' }]); }}
              className="p-8 bg-indigo-50 rounded-[2.5rem] border-2 border-slate-50 hover:border-indigo-400 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <PencilSquareIcon className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <div className="text-xl font-black text-slate-800">Tự nhập</div>
                <p className="text-xs font-bold text-slate-400">Thêm thẻ thủ công</p>
              </div>
            </button>
          </div>

          <button onClick={onBack} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors">
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    )
  }

  // =================== STEP: INPUT (AI/MCQ) ===================
  if (step === 'input') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-1">
        <header className="flex items-center gap-3">
          <button onClick={() => setStep('choose')} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-slate-700">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 leading-none">Nhập tài liệu</h2>
            <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">Dự án: {projectName}</p>
          </div>
        </header>

        {isMCQDetected && (
          <div className="p-4 sm:p-5 bg-green-50 border-2 border-green-200 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm flex-shrink-0">
              <ClipboardDocumentListIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-green-800 leading-none mb-1">📋 Đề cương MCQ được phát hiện!</h4>
              <p className="text-xs font-bold text-green-700/60 uppercase">Dành cho định dạng trắc nghiệm A/B/C/D</p>
            </div>
            <button 
              onClick={() => { setMode('mcq'); handleCreate(); }} 
              className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-95 transition-all hidden sm:block"
            >
              Parse ngay ⚡
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm">
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="card-glass p-1">
          <textarea
            ref={textareaRef}
            className="w-full h-80 sm:h-[400px] p-6 sm:p-10 text-xl font-bold bg-transparent border-none focus:ring-0 outline-none placeholder-slate-200 no-scrollbar"
            placeholder="Dán nội dung bài học, đề cương hoặc câu hỏi vào đây..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            disabled={loading || !rawText.trim()}
            onClick={() => { setMode('ai'); handleCreate(); }}
            className="btn-primary w-full py-5 sm:py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-700"
          >
            {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
            {loading ? 'Đang tạo thẻ...' : 'AI phân tích tài liệu'}
          </button>
          
          <button 
            disabled={loading || !rawText.trim()}
            onClick={() => { setMode('mcq'); handleCreate(); }}
            className="btn-primary w-full py-5 sm:py-4 text-lg bg-green-600 shadow-green-500/25"
          >
            ⚡ Parse MCQ trực tiếp
          </button>
        </div>
      </div>
    )
  }

  // =================== STEP: REVIEW ===================
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-1 pb-12">
      <header className="flex items-center gap-3 sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10 py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button onClick={() => setStep('choose')} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-none">Kiểm tra thẻ học</h2>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{cards.length} thẻ đang được tạo</p>
        </div>
        <button 
          onClick={submitProject}
          className="btn-primary py-3 px-6 shadow-green-500/30 bg-green-600 text-sm sm:text-base outline-none ring-4 ring-green-100"
        >
          <CloudArrowUpIcon className="w-5 h-5" /> Lưu ngay
        </button>
      </header>

      <div className="space-y-4">
        {cards.map((card, idx) => (
          <div key={card.id} className="card-glass p-0 overflow-hidden border-2 border-slate-50 transition-all hover:border-blue-100 slide-in-bottom" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thẻ #{idx + 1}</span>
              <button 
                onClick={() => handleDeleteCard(card.id)}
                className="p-2 text-red-300 hover:text-red-500"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-blue-400 tracking-tighter">Câu hỏi</label>
                <textarea 
                  value={card.question}
                  onChange={(e) => handleUpdateCard(card.id, 'question', e.target.value)}
                  className="w-full text-xl sm:text-2xl font-black bg-transparent border-none p-0 focus:ring-0 min-h-[40px] resize-none overflow-hidden"
                  placeholder="Nhập câu hỏi..."
                  rows={2}
                />
              </div>
              <div className="space-y-2 border-t border-slate-50 pt-6">
                <label className="text-[10px] font-black uppercase text-green-500 tracking-tighter">Đáp án</label>
                <textarea 
                  value={card.answer}
                  onChange={(e) => handleUpdateCard(card.id, 'answer', e.target.value)}
                  className="w-full text-xl sm:text-2xl font-black bg-transparent border-none p-0 focus:ring-0 min-h-[40px] resize-none overflow-hidden text-green-600"
                  placeholder="Nhập đáp án chính xác..."
                  rows={2}
                />
              </div>
              
              {card.options && card.options.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/30">
                  <div className="text-[10px] font-black uppercase text-blue-400 mb-2">Đáp án MCQ gốc:</div>
                  <div className="flex flex-wrap gap-2">
                    {card.options.map((opt, i) => (
                      <span key={i} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${opt === card.answer ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-slate-100 text-slate-500'}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddCard}
          className="w-full p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 hover:text-blue-400 hover:border-blue-100 hover:bg-blue-50/30 transition-all flex flex-col items-center gap-3 font-black text-xl mb-20"
        >
          <PlusIcon className="w-10 h-10" />
          Thêm thẻ mới
        </button>
      </div>
    </div>
  )
}

export default CreateProject
