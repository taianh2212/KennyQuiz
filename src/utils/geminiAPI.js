const GEMINI_API_KEY =
  process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyAHfQqVA0tZONNRPeYIOk2GOnLZNi9VY0Q'

// Chỉ dùng flash model (có free quota)
const API_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash']
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const callGemini = async (model, prompt) => {
  const url = `${BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`${response.status}:${err?.error?.message || 'API error'}`)
  }
  return response.json()
}

const parseCards = (aiText) => {
  // Chiến lược 1: "Câu hỏi: ... | Đáp án: ..."
  let lines = aiText
    .split('\n')
    .filter((l) => l.includes('|') && /câu hỏi:/i.test(l) && /đáp án:/i.test(l))

  // Chiến lược 2: bất kỳ dòng nào có pipe
  if (!lines.length) {
    lines = aiText.split('\n').filter((l) => l.includes('|') && l.trim().length > 8)
  }

  return lines
    .map((line, idx) => {
      const sep = line.indexOf('|')
      return {
        id: Date.now() + idx + Math.random(),
        question: line.substring(0, sep).replace(/câu hỏi:/i, '').replace(/^\d+[.)]\s*/, '').trim(),
        answer: line.substring(sep + 1).replace(/đáp án:/i, '').trim(),
      }
    })
    .filter((c) => c.question && c.answer)
}

/**
 * Gọi Gemini AI để sinh flashcard từ văn bản tự do.
 * Không có giới hạn số thẻ cứng — AI tự quyết.
 */
export const generateFlashcards = async (text, count = null) => {
  const countHint = count ? `Tạo khoảng ${count} thẻ.` : 'Tạo càng nhiều thẻ càng tốt, bao phủ hết nội dung.'

  const prompt = `Bạn là trợ lý học tập. Từ nội dung bên dưới, hãy tạo thẻ câu hỏi - đáp án.

QUY TẮC BẮT BUỘC:
- Mỗi thẻ PHẢI theo định dạng CHÍNH XÁC: Câu hỏi: [câu hỏi] | Đáp án: [đáp án]
- Mỗi thẻ trên 1 dòng riêng biệt
- Câu hỏi rõ ràng, đáp án ngắn gọn chính xác
- ${countHint}
- Chỉ trả về danh sách thẻ theo định dạng, KHÔNG thêm bất cứ text nào khác

NỘI DUNG:
${text}`.trim()

  let lastError = null

  for (const model of API_MODELS) {
    try {
      const data = await callGemini(model, prompt)
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (!aiText) throw new Error('Phản hồi trống')

      const cards = parseCards(aiText)
      if (!cards.length) throw new Error('Không parse được thẻ')

      return cards
    } catch (err) {
      lastError = err
      const code = parseInt(err.message)
      if (code === 429 || code === 503) {
        await sleep(2500)
      }
      console.warn(`[${model}] failed:`, err.message)
    }
  }

  throw new Error(lastError?.message || 'Tất cả models thất bại')
}
/** 
 * Kiểm tra xem văn bản có chứa định dạng trắc nghiệm trần (A/B/C/D) không.
 */
export const isMCQFormat = (text) => {
  const sample = text.substring(0, 1000).split('\n')
  return sample.some((l) => /^[A-D][.)]\s*/i.test(l.trim()))
}

// Alias cho CreateProject.js
export const generateCards = generateFlashcards
