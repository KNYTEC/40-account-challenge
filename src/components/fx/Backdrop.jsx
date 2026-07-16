import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useInView.js'

// Full-page animated particle network: drifting nodes that link up when they
// come near each other, plus lines to the cursor and a soft cursor glow.
// Fixed behind all content; dark theme only (hidden via CSS in light mode).
// Deliberately still animates under reduced-motion — just slower and sparser —
// per the site owner's preference; pauses entirely when the tab is hidden.
export function Backdrop() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const calm = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    let W = 0
    let H = 0
    let parts = []

    const speed = calm ? 0.35 : 1
    const spawn = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35 * speed,
      vy: (Math.random() - 0.5) * 0.35 * speed,
      r: 1 + Math.random() * 1.8,
      warm: Math.random() < 0.22, // some orange among the red
    })

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const target = Math.round(Math.min(90, (W * H) / 22000) * (calm ? 0.6 : 1))
      while (parts.length < target) parts.push(spawn())
      parts.length = target
    }
    resize()
    window.addEventListener('resize', resize)

    const mouse = { x: -9999, y: -9999 }
    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerout', onLeave)

    const LINK = 120
    const MOUSE_LINK = 170

    let raf = 0
    let running = true

    const draw = () => {
      if (!running) return
      // CSS hides the canvas in light mode — skip the work while hidden.
      // (offsetParent is always null for position:fixed, so use client rects.)
      if (canvas.getClientRects().length === 0) {
        setTimeout(() => {
          if (running) raf = requestAnimationFrame(draw)
        }, 800)
        return
      }
      ctx.clearRect(0, 0, W, H)

      // cursor glow
      if (mouse.x > -999) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300)
        glow.addColorStop(0, 'rgba(245, 66, 79, 0.05)')
        glow.addColorStop(1, 'rgba(245, 66, 79, 0)')
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, W, H)
      }

      // move
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -20) p.x = W + 20
        if (p.x > W + 20) p.x = -20
        if (p.y < -20) p.y = H + 20
        if (p.y > H + 20) p.y = -20
      }

      // links between nearby particles
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i]
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < LINK * LINK) {
            const alpha = (1 - Math.sqrt(d2) / LINK) * 0.14
            ctx.strokeStyle = `rgba(245, 66, 79, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        // link to cursor
        const mdx = a.x - mouse.x
        const mdy = a.y - mouse.y
        const md2 = mdx * mdx + mdy * mdy
        if (md2 < MOUSE_LINK * MOUSE_LINK) {
          const alpha = (1 - Math.sqrt(md2) / MOUSE_LINK) * 0.22
          ctx.strokeStyle = `rgba(251, 138, 60, ${alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
      }

      // dots
      for (const p of parts) {
        ctx.fillStyle = p.warm ? 'rgba(251, 138, 60, 0.5)' : 'rgba(245, 66, 79, 0.45)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    const onVis = () => {
      if (document.hidden) {
        running = false
        if (raf) cancelAnimationFrame(raf)
      } else {
        running = true
        raf = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(draw)

    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerout', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="fx-backdrop" aria-hidden="true" />
}
