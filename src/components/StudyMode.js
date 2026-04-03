import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  HomeIcon,
  SparklesIcon,
  ArrowUturnLeftIcon,
  PlayIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'
import { saveProgress, getProgress } from '../utils/supabaseService'
import Fireworks from './Fireworks'
import { getRandomSound } from '../config/sounds'

const shuffleArray = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const ANSWER_DELAY = 1200
const FIREWORKS_DURATION = 8000

const StudyMode = ({ project, onBack }) => {
  const [testMode, setTestMode] = useState(false)
  const [cards, setCards] = useState(project.cards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredMap, setAnsweredMap] = useState({})
  const [showFinalResult, setShowFinalResult] = useState(false)
  const [timerId, setTimerId] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [showFireworks, setShowFireworks] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(
    () => localStorage.getItem('kennyquiz_music') !== 'off'
  )
  const audioRef = useRef(null)
  const fireworksTimerRef = useRef(null)

  // ── Load Progress ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadSession = async () => {
      setLoadingProgress(true)
      const data = await getProgress(project.id)
      if (data) {
        setAnsweredMap(data.answered_data || {})
        setCurrentIndex(data.last_index || 0)
      }
      setLoadingProgress(false)
    }
    loadSession()
  }, [project.id])

  // ── Sync to Cloud ────────────────────────────────────────────────
  const syncProgress = useCallback(async (idx, amap) => {
    setSyncStatus('saving')
    const result = await saveProgress(project.id, idx, amap)
    if (result?.cloudOk) {
      setSyncStatus('saved')
      setTimeout(() => setSyncStatus('idle'), 2500)
    } else {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 4000)
    }
  }, [project.id])

  // ── Handle Mode Toggle ───────────────────────────────────────────────────
  const toggleTestMode = () => {
    if (!testMode) {
      if (window.confirm("Bắt đầu chế độ KIỂM TRA? Các câu hỏi sẽ được XÁO TRỘN và tiến độ cũ sẽ bị đặt lại.")) {
        setCards(shuffleArray(project.cards))
        setCurrentIndex(0)
        setAnsweredMap({})
        setTestMode(true)
      }
    } else {
      setCards(project.cards)
      setTestMode(false)
    }
  }

  const currentCard = cards[currentIndex]

  const options = useMemo(() => {
    if (!currentCard) return []
    // Ở chế độ kiểm tra, xáo cả đáp án
    const shuffleOptions = testMode
    
    if (currentCard.options && currentCard.options.length >= 2) {
      return shuffleOptions ? shuffleArray([...currentCard.options]) : [...currentCard.options]
    }
    
    // Fallback options
    const others = project.cards.filter(c => c.id !== currentCard.id).map(c => c.answer)
    const wrongOnes = shuffleArray(others).slice(0, 3)
    let all = [currentCard.answer, ...wrongOnes]
    return shuffleOptions ? shuffleArray(all) : all
  }, [currentCard, project.cards, testMode])

  const currentAnswered = currentCard ? answeredMap[currentCard.id] : null
  const correctCount = Object.values(answeredMap).filter(a => a.isCorrect).length

  const stopEffect = () => {
    // Dừng âm thanh
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    // Tắt pháo hoa
    clearTimeout(fireworksTimerRef.current)
    setShowFireworks(false)
  }

  const handleAnswer = (selected) => {
    if (!currentCard || currentAnswered) return

    // Dừng hiệu ứng từ câu trước (nếu đang chạy)
    stopEffect()

    const isCorrect = selected === currentCard.answer
    const newMap = { ...answeredMap, [currentCard.id]: { isCorrect, selected } }
    setAnsweredMap(newMap)
    syncProgress(currentIndex, newMap)

    // 🎉 Pháo hoa + âm thanh khi trả lời ĐÚNG
    if (isCorrect) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      clearTimeout(fireworksTimerRef.current)
      setShowFireworks(true)

      if (musicEnabled) {
        try {
          const soundPath = getRandomSound()
          if (soundPath) {
            const audio = new Audio(soundPath)
            audio.volume = 0.8
            audio.play().catch(() => {})
            audioRef.current = audio
          }
        } catch {}
      }

      fireworksTimerRef.current = setTimeout(() => {
        setShowFireworks(false)
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
      }, FIREWORKS_DURATION)
    }

    const tid = setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        const nextIdx = currentIndex + 1
        setCurrentIndex(nextIdx)
        syncProgress(nextIdx, newMap)
      } else {
        setShowFinalResult(true)
      }
    }, ANSWER_DELAY)
    setTimerId(tid)
  }

  const handleRedoCurrent = () => {
    if (!currentCard) return
    // Hủy timer tự-chuyển-câu từ lần trả lời sai trước
    clearTimeout(timerId)
    // Dừng âm thanh/pháo hoa nếu đang chạy
    stopEffect()
    const newMap = { ...answeredMap }
    delete newMap[currentCard.id]
    setAnsweredMap(newMap)
    syncProgress(currentIndex, newMap)
  }

  const goToQuestion = (idx) => {
    setCurrentIndex(idx)
    syncProgress(idx, answeredMap)
  }

  const handleRestart = () => {
    setAnsweredMap({})
    setCurrentIndex(0)
    setShowFinalResult(false)
    setCards(project.cards) // về thứ tự gốc
    setTestMode(false)
    syncProgress(0, {})
  }


  if (loadingProgress) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-xs">Đang rước tiến độ từ Cloud...</p>
      </div>
    )
  }

  if (showFinalResult) {
    const total = cards.length
    const score = Math.round((correctCount / total) * 100)
    return (
      <div className="max-w-2xl mx-auto pb-10 animate-in fade-in zoom-in duration-500">
        <div className="card-glass text-center p-8 sm:p-12 border-4 border-white shadow-2xl">
          <div className="text-7xl mb-4">{score >= 80 ? '🏆' : score >= 50 ? '🎯' : '💪'}</div>
          <h2 className="text-3xl font-black mb-1 text-slate-800">Kết quả bài học</h2>
          <div className="text-8xl font-black text-gradient my-4">{score}%</div>
          <p className="text-slate-400 font-bold mb-8 text-lg">Đúng {correctCount} / {total} câu</p>

          {/* Progress bar */}
          <div className="h-3 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="space-y-3 max-w-sm mx-auto">
            <button
              onClick={handleRestart}
              className="btn-primary w-full py-4 text-base bg-gradient-to-r from-blue-600 to-indigo-700"
            >
              <ArrowPathIcon className="w-5 h-5" /> Học lại từ đầu
            </button>
            <button onClick={onBack} className="btn-secondary w-full py-4 text-base">
              <HomeIcon className="w-5 h-5" /> Về trang chính
            </button>
          </div>
        </div>
      </div>
    )
  }


  if (!currentCard) return null

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-12 px-1">
      {/* 🎉 Pháo hoa overlay */}
      <Fireworks active={showFireworks} duration={FIREWORKS_DURATION} />

      <div className="flex items-center justify-between px-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 font-bold text-sm">
          <ArrowLeftIcon className="w-4 h-4" /> Thoát
        </button>

        {/* Cloud Sync Badge + Music Toggle */}
        <div className="flex items-center gap-2">
          {syncStatus === 'saving' && (
            <span className="flex items-center gap-1 text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
              <ArrowPathIcon className="w-3 h-3 animate-spin" /> Đang lưu...
            </span>
          )}
          {syncStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              ✅ Đã lưu Cloud
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg">
              ⚠️ Lỗi lưu Cloud
            </span>
          )}

          {/* Nút tắt/bật nhạc */}
          <button
            onClick={() => {
              const next = !musicEnabled
              setMusicEnabled(next)
              localStorage.setItem('kennyquiz_music', next ? 'on' : 'off')
              if (!next && audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
                setShowFireworks(false)
              }
            }}
            title={musicEnabled ? 'Tắt nhạc' : 'Bật nhạc'}
            className={`flex items-center justify-center w-8 h-8 rounded-xl text-base transition-all border-2 ${
              musicEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            {musicEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setTestMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!testMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <AcademicCapIcon className="w-3.5 h-3.5" /> HỌC
          </button>
          <button 
            onClick={toggleTestMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${testMode ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <PlayIcon className="w-3.5 h-3.5" /> KIỂM TRA
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
          <span>{testMode ? 'CHẾ ĐỘ KIỂM TRA' : 'CHẾ ĐỘ HỌC TẬP'}</span>
          <span>Câu {currentIndex + 1} / {cards.length}</span>
        </div>
        <div className="h-2.5 bg-white rounded-full border border-slate-100 shadow-inner overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${testMode ? 'bg-orange-500' : 'bg-blue-600'}`}
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card-glass p-6 sm:p-10 slide-in-top border-4 border-white shadow-xl min-h-[420px] flex flex-col relative transition-all duration-500">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border w-fit ${testMode ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
          <SparklesIcon className="w-3 h-3" /> {testMode ? 'Test Mode' : 'Learn Mode'} 
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-[1.4] mb-10 text-pretty">
          {currentCard.question}
        </h3>

        <div className="grid grid-cols-1 gap-3 mt-auto">
          {options.map((option, idx) => {
            let stateStyle = "bg-slate-50 border-slate-100 text-slate-700 hover:border-blue-300"
            if (currentAnswered) {
              if (option === currentCard.answer) {
                stateStyle = "bg-green-50 border-green-500 text-green-700 scale-[1.02] shadow-sm z-10"
              } else if (option === currentAnswered.selected) {
                stateStyle = "bg-red-50 border-red-500 text-red-700"
              } else {
                stateStyle = "bg-white border-slate-50 text-slate-200"
              }
            }

            return (
              <button
                key={`${currentCard.id}-${idx}`}
                onClick={() => handleAnswer(option)}
                disabled={!!currentAnswered}
                className={`w-full text-left p-5 border-2 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center gap-4 ${stateStyle}`}
              >
                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 text-xs font-black ${currentAnswered && option === currentCard.answer ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-1 leading-tight">{option}</div>
              </button>
            )
          })}
        </div>

        {currentAnswered && (
          <div className={`mt-8 p-5 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 ${currentAnswered.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentAnswered.isCorrect ? '✅' : '❌'}</div>
              <div>
                <p className="text-lg font-black leading-none">{currentAnswered.isCorrect ? 'Tuyệt lắm!' : 'Cố gắng lên!'}</p>
                {!currentAnswered.isCorrect && <p className="text-xs mt-1 font-bold opacity-75">Học kỹ lại rồi thử lại nhé.</p>}
              </div>
            </div>
            
            {!currentAnswered.isCorrect && (
              <button 
                onClick={handleRedoCurrent}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-red-100 rounded-xl text-xs font-black uppercase text-red-500 hover:bg-red-50 transition-all shadow-sm"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" /> Sửa lại
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation dots + Restart button */}
      <div className="flex flex-wrap gap-2 justify-center pt-4">
        {cards.map((card, idx) => {
          const ans = answeredMap[card.id]
          const isCurrent = idx === currentIndex
          return (
            <button
              key={card.id}
              onClick={() => goToQuestion(idx)}
              className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-100'
                  : ans
                  ? ans.isCorrect ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
                  : 'bg-white text-slate-300 border border-slate-100'
              }`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* Restart strip */}
      <div className="flex justify-center pt-2 pb-4">
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Học lại từ đầu
        </button>
      </div>
    </div>
  )
}

export default StudyMode
