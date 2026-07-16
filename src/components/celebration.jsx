import { useEffect, useRef, useState } from 'react'

const CONFETTI_COLORS = ['#f5424f', '#dc2626', '#fb8a3c', '#f97316', '#16b021', '#ffffff']

// A tiny self-contained canvas confetti burst — no external library (keeps the
// bundle small and satisfies the no-CDN constraint). Runs ~2.4s then removes
// its own canvas. Skipped entirely when the user prefers reduced motion.
function fireConfetti() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const resize = () => {
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
  }
  resize()

  const W = () => window.innerWidth
  const H = () => window.innerHeight
  const count = Math.min(160, Math.round(W() / 9))
  const parts = Array.from({ length: count }, (_, i) => ({
    x: W() / 2 + (Math.random() - 0.5) * W() * 0.4,
    y: H() * 0.28 + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -11 - 4,
    g: 0.28 + Math.random() * 0.15,
    size: 5 + Math.random() * 6,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    color: CONFETTI_COLORS[(i + Math.floor(Math.random() * CONFETTI_COLORS.length)) % CONFETTI_COLORS.length],
  }))

  const start = performance.now()
  const DURATION = 2400

  function frame(now) {
    const t = now - start
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)
    const fade = t > DURATION - 500 ? Math.max(0, (DURATION - t) / 500) : 1
    for (const p of parts) {
      p.vy += p.g
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.99
      p.rot += p.vr
      ctx.globalAlpha = fade
      ctx.fillStyle = p.color
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.rotate(-p.rot)
      ctx.translate(-p.x, -p.y)
    }
    ctx.restore()
    if (t < DURATION) {
      requestAnimationFrame(frame)
    } else {
      window.removeEventListener('resize', resize)
      canvas.remove()
    }
  }
  window.addEventListener('resize', resize)
  requestAnimationFrame(frame)
}

// Shows a one-time-per-day hype banner + confetti the first time the page loads
// after a fresh winning day is recorded. Uses sessionStorage keyed by the latest
// date so navigating between pages doesn't replay it.
export function WinCelebration({ latest, countdown, stats }) {
  const [show, setShow] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (!latest || latest.pnl <= 0) return
    const key = `mnq-celebrated-${latest.date}`
    let already = false
    try {
      already = sessionStorage.getItem(key) === '1'
    } catch {
      /* private mode — just show it */
    }
    if (already) return
    try {
      sessionStorage.setItem(key, '1')
    } catch {
      /* ignore */
    }
    setShow(true)
    fireConfetti()
    timer.current = setTimeout(() => setShow(false), 5200)
    return () => clearTimeout(timer.current)
  }, [latest])

  if (!show || !latest) return null

  const left = countdown.winningDays
  const streak = stats?.streak ?? 0

  return (
    <div className="celebrate-banner" role="status">
      <span className="cb-dot" aria-hidden="true">
        🟢
      </span>
      <span className="cb-text">
        <strong>MISSION COMPLETE</strong>
        <span className="cb-meta">
          +1 winning day
          {left > 0 && <> · {left} to $100K</>}
          {streak >= 2 && <> · 🔥 {streak} streak</>}
        </span>
      </span>
      <button className="cb-close" onClick={() => setShow(false)} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
