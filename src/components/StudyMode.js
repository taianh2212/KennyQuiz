import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  HomeIcon,
  SparklesIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline'

const shuffleArray = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const ANSWER_DELAY = 1200 

const StudyMode = ({ project, onBack }) => {
  const [shuffleQuestions, setShuffleQuestions] = useState(true)
  const [shuffleOptions, setShuffleOptions] = useState(true)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answeredMap, setAnsweredMap] = useState({}) // { cardId: { isCorrect, selected } }
  const [showFinalResult, setShowFinalResult] = useState(false)
  const [timerId, setTimerId] = useState(null)

  const initSession = useCallback((sourceCards = project.cards) => {
    const ordered = shuffleQuestions ? shuffleArray(sourceCards) : [...sourceCards]
    setCards(ordered)
    setCurrentIndex(0)
    setAnsweredMap({})
    setShowFinalResult(false)
    if (timerId) clearTimeout(timerId)
  }, [shuffleQuestions, project.cards, timerId])

  useEffect(() => {
    initSession()
    return () => { if (timerId) clearTimeout(timerId) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  const currentCard = cards[currentIndex]

  const options = useMemo(() => {
    if (!currentCard) return []
    if (currentCard.options && currentCard.options.length >= 2) {
      return shuffleOptions ? shuffleArray([...currentCard.options]) : [...currentCard.options]
    }
    const others = cards.filter(c => c.id !== currentCard.id).map(c => c.answer)
    const shuffledOthers = shuffleArray(others)
    const wrongOnes = shuffledOthers.slice(0, Math.min(3, shuffledOthers.length))
    let all = [currentCard.answer, ...wrongOnes]
    while (all.length < 2) all.push('(No other options)')
    return shuffleOptions ? shuffleArray(all) : all
  }, [currentCard, cards, shuffleOptions])

  const currentAnswered = currentCard ? answeredMap[currentCard.id] : null
  const correctCount = Object.values(answeredMap).filter(a => a.isCorrect).length

  const handleAnswer = (selected) => {
    if (!currentCard || currentAnswered) return
    const isCorrect = selected === currentCard.answer
    setAnsweredMap(prev => ({
      ...prev,
      [currentCard.id]: { isCorrect, selected }
    }))

    // Auto advance only if correct
    if (isCorrect) {
      const tid = setTimeout(() => {
        if (currentIndex + 1 < cards.length) {
          setCurrentIndex(prev => prev + 1)
        } else {
          setShowFinalResult(true)
        }
      }, ANSWER_DELAY)
      setTimerId(tid)
    }
  }

  const handleRedoCurrent = () => {
    if (!currentCard) return
    if (timerId) clearTimeout(timerId)
    setAnsweredMap(prev => {
      const newMap = { ...prev }
      delete newMap[currentCard.id]
      return newMap
    })
  }

  const goToQuestion = (idx) => {
    if (timerId) clearTimeout(timerId)
    setCurrentIndex(idx)
  }

  const handleRetryIncorrect = () => {
    const inc = cards.filter(c => !answeredMap[c.id]?.isCorrect)
    if (inc.length === 0) return
    initSession(inc)
  }

  const handleRestart = () => initSession(project.cards)

  if (showFinalResult) {
    const total = cards.length
    const score = Math.round((correctCount / total) * 100)
    return (
      <div className="max-w-2xl mx-auto pb-10 pop-in">
        <div className="card-glass text-center p-8 sm:p-12 border-4 border-white shadow-2xl">
          <div className="text-7xl mb-6"> {score >= 80 ? '🏆' : score >= 50 ? '🥈' : '💪'} </div>
          <h2 className="text-3xl font-black mb-2 text-slate-800">{score >= 80 ? 'Xuất sắc!' : 'Học nữa học mãi!'}</h2>
          <div className="text-8xl font-black text-gradient mb-4">{score}%</div>
          <p className="text-slate-400 font-bold mb-10 text-lg">Đúng {correctCount} / Tổng {total}</p>
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

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-12 px-1">
      <div className="flex items-center justify-between px-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 font-bold text-sm">
          <ArrowLeftIcon className="w-4 h-4" /> Thoát
        </button>
        <div className="text-[10px] font-black text-slate-300 uppercase letter-widest truncate max-w-[150px]">
          {project.name}
        </div>
        <div className="text-xs font-black text-blue-500 uppercase tracking-widest whitespace-nowrap">
          Đúng: {correctCount}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
          <span>Câu {currentIndex + 1} / {cards.length}</span>
          <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
          <div 
            className={`h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out`}
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card-glass p-6 sm:p-10 slide-in-top border-4 border-white shadow-xl min-h-[400px] flex flex-col">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100 w-fit">
          <SparklesIcon className="w-3 h-3" /> Flashcard 
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-[1.4] mb-10 text-pretty">
          {currentCard.question}
        </h3>

        <div className="grid grid-cols-1 gap-3 mt-auto">
          {options.map((option, idx) => {
            let stateStyle = "bg-slate-50 border-slate-100 text-slate-700 hover:border-blue-300 hover:bg-white active:scale-[0.98]"
            if (currentAnswered) {
              if (option === currentCard.answer) {
                stateStyle = "bg-green-50 border-green-500 text-green-700 ring-4 ring-green-100 z-10 scale-[1.02]"
              } else if (option === currentAnswered.selected) {
                stateStyle = "bg-red-50 border-red-500 text-red-700 opacity-80"
              } else {
                stateStyle = "bg-white border-slate-50 text-slate-200 opacity-40"
              }
            }

            return (
              <button
                key={idx}
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
          <div className={`mt-8 p-5 rounded-2xl flex items-center justify-between sm:justify-start gap-4 animate-in fade-in slide-in-from-bottom-2 ${currentAnswered.isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentAnswered.isCorrect ? '✅' : '❌'}</div>
              <div>
                <p className="text-lg font-black leading-none">{currentAnswered.isCorrect ? 'Tuyệt lắm!' : 'Sai rồi...'}</p>
                {!currentAnswered.isCorrect && <p className="text-xs mt-1 font-bold">Hãy xem lại đáp án và thử lại!</p>}
              </div>
            </div>
            
            {!currentAnswered.isCorrect && (
              <button 
                onClick={handleRedoCurrent}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-red-100 rounded-xl text-xs font-black uppercase text-red-500 hover:bg-red-50 transition-all active:scale-90"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" /> Làm lại
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center pt-4">
        {cards.map((card, idx) => {
          const ans = answeredMap[card.id]
          const isCurrent = idx === currentIndex
          return (
            <button
              key={idx}
              onClick={() => goToQuestion(idx)}
              className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${isCurrent ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200 ring-2 ring-blue-100' : ans ? (ans.isCorrect ? 'bg-green-400 text-white' : 'bg-red-400 text-white') : 'bg-white text-slate-300 border border-slate-100 hover:text-blue-500'}`}
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
