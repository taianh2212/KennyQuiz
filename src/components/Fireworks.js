import React, { useEffect, useRef } from 'react'

// ────────────────────────────────────────────────
// Fireworks Canvas Component
// Hiển thị pháo hoa trong 5 giây rồi tự ẩn
// ────────────────────────────────────────────────

const COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#FF6FC8', '#B5DEFF', '#FFA644', '#C77DFF',
  '#00F5D4', '#FFBE0B',
]

class Particle {
  constructor(x, y, canvas) {
    this.x = x
    this.y = y
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 8 + 3
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed - Math.random() * 4
    this.alpha = 1
    this.radius = Math.random() * 5 + 2
    this.gravity = 0.18
    this.decay = Math.random() * 0.012 + 0.008
    this.trail = []
    this.maxTrail = 5
    this.shape = Math.random() > 0.5 ? 'circle' : 'star'
  }

  update() {
    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > this.maxTrail) this.trail.shift()
    this.vx *= 0.98
    this.vy += this.gravity
    this.x += this.vx
    this.y += this.vy
    this.alpha -= this.decay
  }

  draw(ctx) {
    // Vệt đuôi
    this.trail.forEach((pos, i) => {
      const trailAlpha = (i / this.trail.length) * this.alpha * 0.4
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, this.radius * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.globalAlpha = trailAlpha
      ctx.fill()
    })

    // Hạt chính
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color

    if (this.shape === 'star') {
      drawStar(ctx, this.x, this.y, 4, this.radius * 1.2, this.radius * 0.5)
    } else {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  isDead() { return this.alpha <= 0 }
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes
  ctx.beginPath()
  ctx.moveTo(cx, cy - outerR)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR)
    rot += step
  }
  ctx.lineTo(cx, cy - outerR)
  ctx.closePath()
  ctx.fill()
}

function launchBurst(particles, canvasW, canvasH) {
  // Bắn từ nhiều điểm ngẫu nhiên
  const burstCount = Math.floor(Math.random() * 3) + 2
  for (let b = 0; b < burstCount; b++) {
    const x = canvasW * (0.2 + Math.random() * 0.6)
    const y = canvasH * (0.1 + Math.random() * 0.4)
    const count = Math.floor(Math.random() * 40) + 40
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y))
    }
  }
}

const Fireworks = ({ active, duration = 5000 }) => {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const particles = useRef([])
  const startTime = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    particles.current = []
    startTime.current = performance.now()

    // Bắn ngay một loạt đầu tiên
    launchBurst(particles.current, canvas.width, canvas.height)

    // Lên lịch thêm burst mỗi 800ms
    const intervals = []
    for (let t = 800; t < duration - 600; t += 800) {
      intervals.push(setTimeout(() => {
        launchBurst(particles.current, canvas.width, canvas.height)
      }, t))
    }

    const loop = (now) => {
      const elapsed = now - startTime.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach(p => {
        p.update()
        p.draw(ctx)
      })
      particles.current = particles.current.filter(p => !p.isDead())

      if (elapsed < duration || particles.current.length > 0) {
        animRef.current = requestAnimationFrame(loop)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    animRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animRef.current)
      intervals.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [active, duration])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}

export default Fireworks
