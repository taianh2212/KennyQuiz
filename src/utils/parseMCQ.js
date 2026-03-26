/**
 * Parser cho định dạng MCQ (Trắc nghiệm) chuẩn:
 *
 * Question text (AUTHOR_NAME)
 * A. Option A text
 * B. Option B text
 * C. Option C text
 * D. Option D text
 * A      <-- đáp án đúng (chữ đứng một mình ở dòng cuối)
 */

const OPTION_RE = /^([A-Da-d])[.):\s]\s*(.+)/
const ANSWER_RE = /^([A-Da-d])\.?$/

// Xoá attribution author: (NHUNG HOÀNG), (Author Name), v.v.
const stripAuthor = (text) =>
  text.replace(/\([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐƠƯA-Z\s]+\)\s*$/, '').trim()

export const parseMCQText = (rawText) => {
  const cards = []
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())

  let questionLines = []
  let optionsMap = {}        // { A: 'text', B: 'text', ... }
  let inOptions = false

  const flush = (answerLetter) => {
    if (questionLines.length === 0) return
    if (Object.keys(optionsMap).length < 2) return

    const rawQuestion = questionLines.join(' ').replace(/\s+/g, ' ').trim()
    const questionText = stripAuthor(rawQuestion)
    if (!questionText) return

    const letter = answerLetter?.toUpperCase()
    const correctText =
      letter && optionsMap[letter] ? optionsMap[letter] : Object.values(optionsMap)[0]

    // Giữ thứ tự A → D
    const orderedLetters = ['A', 'B', 'C', 'D'].filter((l) => optionsMap[l])
    const allOptions = orderedLetters.map((l) => optionsMap[l])

    cards.push({
      id: Date.now() + cards.length + Math.random() * 9999,
      question: questionText,
      answer: correctText,
      options: allOptions, // 4 đáp án gốc từ đề cương
    })

    questionLines = []
    optionsMap = {}
    inOptions = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    const optMatch = line.match(OPTION_RE)
    const ansMatch = line.match(ANSWER_RE)

    if (optMatch) {
      // Nếu gặp A. mới trong khi đang làm options → vẫn thu thập tiếp (edge case)
      const ltr = optMatch[1].toUpperCase()
      optionsMap[ltr] = optMatch[2].trim()
      inOptions = true
    } else if (ansMatch && inOptions) {
      // Dòng đáp án đứng một mình, ví dụ: "A" hoặc "A."
      flush(ansMatch[1])
    } else {
      // Dòng thuộc câu hỏi
      if (inOptions && Object.keys(optionsMap).length >= 2) {
        // Đã xong options nhưng chưa tìm thấy dòng đáp án → flush không có đáp án
        flush(null)
      }
      questionLines.push(line)
    }
  }

  // Flush block cuối (nếu còn)
  if (questionLines.length > 0 && Object.keys(optionsMap).length >= 2) {
    flush(null)
  }

  return cards
}

/**
 * Phát hiện xem text có phải format MCQ không:
 * cần ít nhất 4 dòng option (A./B./C./D.) và 1 dòng đáp án đơn
 */
export const isMCQFormat = (text) => {
  const lines = text.split('\n').map((l) => l.trim())
  const optionLines = lines.filter((l) => OPTION_RE.test(l))
  const answerLines = lines.filter((l) => ANSWER_RE.test(l))
  return optionLines.length >= 4 && answerLines.length >= 1
}
