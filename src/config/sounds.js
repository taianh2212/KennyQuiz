// ─────────────────────────────────────────────────────
// DANH SÁCH FILE ÂM THANH
// Thêm tên file của bạn vào đây (đặt file vào thư mục public/sounds/)
// Hỗ trợ: .mp3, .mp4, .wav, .ogg
// ─────────────────────────────────────────────────────

const SOUND_LIST = [
  '/sounds/song1.mp3',
  '/sounds/song2.mp3',
  '/sounds/song3.mp3',
  '/sounds/song4.mp3',
  '/sounds/song5.mp3',
  '/sounds/song6.mp3',
  '/sounds/song7.mp3',
  '/sounds/song8.mp3',
  '/sounds/song9.mp3',
  '/sounds/song10.mp3',
]

/**
 * Lịch sử phát – không lặp lại 7 bài gần nhất
 */
const HISTORY_SIZE = 7
let recentHistory = []

export const getRandomSound = () => {
  if (SOUND_LIST.length === 0) return null
  if (SOUND_LIST.length === 1) return SOUND_LIST[0]

  // Lọc các bài chưa nằm trong lịch sử gần đây
  const available = SOUND_LIST.filter(s => !recentHistory.includes(s))
  // Nếu tất cả đều đã phát (danh sách ít hơn HISTORY_SIZE) → reset lịch sử
  const pool = available.length > 0 ? available : SOUND_LIST

  const picked = pool[Math.floor(Math.random() * pool.length)]

  recentHistory.push(picked)
  if (recentHistory.length > HISTORY_SIZE) recentHistory.shift()

  return picked
}

export default SOUND_LIST
