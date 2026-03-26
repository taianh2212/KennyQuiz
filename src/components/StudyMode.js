import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  HomeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const shuffleArray = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const ANSWER_DELAY = 1000 // ms before moving to next question

const StudyMode = ({ project, onBack }) => {
  const [shuffleQuestions, setShuffleQuestions] = useState(true)
  const [shuffleOptions, setShuffleOptions] = useState(true)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredMap, setAnsweredMap] = useState({}) // { cardId: { isCorrect, selected } }
  const [showFinalResult, setShowFinalResult] = useState(false)

  // Init study session
  const initSession = useCallback((sourceCards = project.cards) => {
    const ordered = shuffleQuestions ? shuffleArray(sourceCards) : [...sourceCards]
    setCards(ordered)
    setCurrentIndex(0)
    setAnsweredMap({})
    setShowFinalResult(false)
  }, [shuffleQuestions, project.cards])

  useEffect(() => {
    initSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  const currentCard = cards[currentIndex]

  // Generate options for current card: MCQ options or random cards
  const options = useMemo(() => {
    if (!currentCard) return []

    if (currentCard.options && currentCard.options.length >= 2) {
      // Use original MCQ options from exam deck
      return shuffleOptions ? shuffleArray([...currentCard.options]) : [...currentCard.options]
    }

    // AI/Manual fallback: pick 3 wrong answers from other cards
    const others = cards.filter(c => c.id !== currentCard.id).map(c => c.answer)
    const shuffledOthers = shuffleArray(others)
    const wrongOnes = shuffledOthers.slice(0, Math.min(3, shuffledOthers.length))
    let all = [currentCard.answer, ...wrongOnes]
    while (all.length < 2) all.push('(No other options)')
    return shuffleOptions ? shuffleArray(all) : all
  }, [currentCard, cards, shuffleOptions])

  const currentAnswered = currentCard ? answeredMap[currentCard.id] : null
  const correctCount = Object.values(answeredMap).filter(a => a.isCorrect).length
  const answeredCount = Object.keys(answeredMap).length

  const handleAnswer = (selected) => {
    if (!currentCard || currentAnswered) return
    const isCorrect = selected === currentCard.answer
    setAnsweredMap(prev => ({
      ...prev,
      [currentCard.id]: { isCorrect, selected }
    }))

    // Auto advance
    setTimeout(() => {
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(prev => prev + 1)
      } else {
        setShowFinalResult(true)
      }
    }, ANSWER_DELAY)
  }

  const goToQuestion = (idx) => setCurrentIndex(idx)

  const handleRetryIncorrect = () => {
    const inc = cards.filter(c => !answeredMap[c.id]?.isCorrect)
    if (inc.length === 0) return
    initSession(inc)
  }

  const handleRestart = () => initSession(project.cards)

  // =================== FINAL RESULT SCREEN ===================
  if (showFinalResult) {
    const total = cards.length
    const score = Math.round((correctCount / total) * 100)
    const msg = score >= 80 ? "Xuất sắc!" : score >= 50 ? "Khá lắm!" : "Cố lên nhé!"
    const color = score >= 50 ? "text-green-600" : "text-amber-500"

    return (
      <div className="max-w-2xl mx-auto pb-10 pop-in">
        <div className="card-glass text-center p-8 sm:p-12">
          <div className="text-7xl sm:text-8xl mb-6"> {score >= 80 ? '🏆' : score >= 50 ? '🥈' : '💪'} </div>
          <h2 className={`text-3xl sm:text-4xl font-black mb-2 ${color}`}>{msg}</h2>
          <div className="text-7xl sm:text-8xl font-black text-gradient mb-4">{score}%</div>
          <p className="text-slate-400 font-bold mb-10 text-lg sm:text-xl">
            Đúng {correctCount} / Sai {total - correctCount} / Tổng {total}
          </p>

          <div className="space-y-4 max-w-sm mx-auto">
            {total - correctCount > 0 && (
              <button onClick={handleRetryIncorrect} className="btn-primary w-full bg-orange-500 shadow-orange-500/20 py-4 text-lg">
                <ArrowPathIcon className="w-6 h-6" /> Học lại câu sai
              </button>
            )}
            <button onClick={handleRestart} className="btn-primary w-full py-4 text-lg">
              <ArrowPathIcon className="w-6 h-6" /> Học lại từ đầu
            </button>
            <button onClick={onBack} className="btn-secondary w-full py-4 text-lg">
              <HomeIcon className="w-6 h-6" /> Về trang chính
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentCard) return null

  // =================== STUDY SCREEN ===================
  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-12 px-1 sm:px-0">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 font-bold text-sm">
          <ArrowLeftIcon className="w-4 h-4" /> Thoát
        </button>
        <div className="text-xs font-black text-slate-300 uppercase letter tracking-widest truncate max-w-[150px]">
          {project.name}
        </div>
        <div className="text-xs font-black text-blue-500 uppercase tracking-widest whitespace-nowrap">
          Đúng: {correctCount}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
          <span>Câu {currentIndex + 1} / {cards.length}</span>
          <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Control Buttons (Shuffle) */}
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => setShuffleOptions(!shuffleOptions)}
          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight border-2 transition-all ${shuffleOptions ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
        >
          🔀 Trộn đáp án: {shuffleOptions ? 'Bật' : 'Tắt'}
        </button>
      </div>

      {/* Main Card */}
      <div className="card-glass p-6 sm:p-10 slide-in-top">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100 shadow-sm">
          <SparklesIcon className="w-3 h-3" /> Flashcard 
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 leading-[1.3] mb-10 text-pretty">
          {currentCard.question}
        </h3>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {options.map((option, idx) => {
            let stateStyle = "bg-slate-50 border-slate-100 text-slate-700 hover:border-blue-400 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]"
            
            if (currentAnswered) {
              if (option === currentCard.answer) {
                stateStyle = "bg-green-50 border-green-500 text-green-700 shadow-lg shadow-green-500/10 ring-2 ring-green-100"
              } else if (option === currentAnswered.selected) {
                stateStyle = "bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-500/10 opacity-70"
              } else {
                stateStyle = "bg-slate-50 border-slate-100 text-slate-300 opacity-40"
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!currentAnswered}
                className={`w-full text-left p-5 sm:p-6 border-2 rounded-2xl sm:rounded-3xl font-bold text-lg sm:text-xl transition-all duration-200 flex items-center gap-4 ${stateStyle}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-sm font-black ${currentAnswered && option === currentCard.answer ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-1 text-balance">
                  {option}
                </div>
              </button>
            )
          })}
        </div>

        {/* Result Message Overlay */}
        {currentAnswered && (
          <div className={`mt-8 p-6 rounded-[2rem] flex items-center gap-4 animate-bounce-short ${currentAnswered.isCorrect ? 'bg-green-50 text-green-700 border-2 border-green-100' : 'bg-red-50 text-red-700 border-2 border-red-100'}`}>
            <div className="text-4xl">{currentAnswered.isCorrect ? '✅' : '❌'}</div>
            <div>
              <p className="text-2xl font-black leading-none">{currentAnswered.isCorrect ? 'Tuyệt đỉnh!' : 'Tiếc quá...'}</p>
              {!currentAnswered.isCorrect && <p className="text-sm mt-1 font-bold opacity-80">Đáp án đúng là: <span className="underline">{currentCard.answer}</span></p>}
            </div>
          </div>
        )}
      </div>

      {/* Question Navigation Dots - Mini version on mobile */}
      <div className="flex flex-wrap gap-2 justify-center pt-4">
        {cards.map((card, idx) => {
          const ans = answeredMap[card.id]
          const isCurrent = idx === currentIndex
          return (
            <button
              key={idx}
              onClick={() => goToQuestion(idx)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs font-black transition-all transform ${isCurrent ? 'bg-blue-600 text-white scale-125 shadow-xl shadow-blue-500/40 ring-4 ring-blue-100' : ans ? (ans.isCorrect ? 'bg-green-400 text-white' : 'bg-red-400 text-white') : 'bg-white text-slate-400 border border-slate-100 hover:bg-blue-50 hover:text-blue-500'}`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default StudyMode
