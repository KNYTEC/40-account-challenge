import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useInView.js'

// Full-page animated backdrop: synthwave perspective grid + rising embers +
// cursor glow. Fixed behind all content, dark theme only (hidden via CSS in
// light mode). Pauses when the tab is hidden; static when reduced motion.
export function Backdrop() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    let W = 0
    let H = 0
    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // resizing wipes the canvas; with no animation loop under reduced
      // motion, repaint the static frame once
      if (reduced) requestAnimationFrame(() => draw())
    }
    resize()
    window.addEventListener('resize', resize)

    // cursor glow (lerped)
    const mouse = { x: W / 2, y: H * 0.3, tx: W / 2, ty: H * 0.3 }
    const onMove = (e) => {
      mouse.tx = e.clientX
      mouse.ty = e.clientY
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    // embers
    const EMBERS = reduced ? 0 : Math.min(55, Math.round(W / 26))
    const embers = Array.from({ length: EMBERS }, () => spawnEmber(true))
    function spawnEmber(anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 10,
        r: 0.8 + Math.random() * 1.8,
        vy: 0.15 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.15,
        a: 0.05 + Math.random() * 0.3,
        hue: Math.random() < 0.7 ? '245, 66, 79' : '251, 138, 60',
        tw: Math.random() * Math.PI * 2,
      }
    }

    let raf = 0
    let t = 0
    let running = true

    const draw = () => {
      if (!running) return
      // skip all work while hidden via CSS (light mode)
      if (canvas.offsetParent === null) {
        raf = 0
        setTimeout(() => {
          if (running) raf = requestAnimationFrame(draw)
        }, 800)
        return
      }
      t += 1
      ctx.clearRect(0, 0, W, H)

      // cursor glow
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 320)
      glow.addColorStop(0, 'rgba(245, 66, 79, 0.055)')
      glow.addColorStop(1, 'rgba(245, 66, 79, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      // perspective grid floor (bottom third)
      const horizon = H * 0.72
      const cx = W / 2
      ctx.strokeStyle = 'rgba(245, 66, 79, 0.07)'
      ctx.lineWidth = 1
      // radial lines
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo(cx, horizon)
        ctx.lineTo(cx + i * W * 0.14, H + 40)
        ctx.stroke()
      }
      // horizontal lines scrolling toward viewer
      const scroll = reduced ? 0 : (t * 0.35) % 44
      for (let j = 0; j < 14; j++) {
        // exponential spacing for depth
        const p = (j * 44 + scroll) / (14 * 44)
        const y = horizon + (H + 40 - horizon) * p * p
        const alpha = 0.02 + p * 0.09
        ctx.strokeStyle = `rgba(245, 66, 79, ${alpha})`
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
      // horizon glow
      const hg = ctx.createLinearGradient(0, horizon - 60, 0, horizon + 40)
      hg.addColorStop(0, 'rgba(245, 66, 79, 0)')
      hg.addColorStop(0.6, 'rgba(245, 66, 79, 0.05)')
      hg.addColorStop(1, 'rgba(245, 66, 79, 0)')
      ctx.fillStyle = hg
      ctx.fillRect(0, horizon - 60, W, 100)

      // embers
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i]
        e.y -= e.vy
        e.x += e.vx + Math.sin((t + e.tw * 60) * 0.01) * 0.12
        if (e.y < -12 || e.x < -12 || e.x > W + 12) embers[i] = spawnEmber(false)
        const flicker = 0.7 + 0.3 * Math.sin(t * 0.08 + e.tw)
        ctx.fillStyle = `rgba(${e.hue}, ${e.a * flicker})`
        ctx.beginPath()
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (reduced) {
        // one static frame is enough
        return
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
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="fx-backdrop" aria-hidden="true" />
}
