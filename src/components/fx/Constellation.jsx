import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useInView.js'

const GOLDEN = 2.399963229728653

// The copy-trade engine, visualized: one hub (the trader) wired to 40 account
// nodes. Every few seconds a trade "fires" — a pulse travels every wire at
// once and all 40 nodes flash with the result (green win / red loss).
// Pointer proximity lights nearby nodes; click/tap fires a pulse manually.
export function Constellation({ accounts = 40, winLockout = 250, lossLockout = 100 }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    const reduced = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let W = 0
    let H = 0
    let nodes = []
    let maxDist = 1

    const layout = () => {
      W = wrap.clientWidth
      H = W < 560 ? 340 : 430
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cx = W / 2
      const cy = H / 2
      const maxR = Math.min(W * 0.46, H * 0.62)
      nodes = Array.from({ length: accounts }, (_, i) => {
        const r = maxR * Math.sqrt((i + 1) / accounts)
        const th = i * GOLDEN
        return {
          bx: cx + Math.cos(th) * r,
          by: cy + Math.sin(th) * r * 0.66,
          tw: Math.random() * Math.PI * 2,
          energy: 0,
          color: '245, 66, 79',
        }
      })
      maxDist = nodes.reduce((m, n) => Math.max(m, Math.hypot(n.bx - cx, n.by - cy)), 1)
    }
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(wrap)

    const mouse = { x: -9999, y: -9999 }
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    canvas.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('pointerleave', onLeave)

    // trade pulses
    let pulse = null
    let lastResult = { win: true, label: 'AWAITING FIRST SYNC' }
    const fire = () => {
      const win = Math.random() < 0.75
      pulse = { start: performance.now(), win }
      lastResult = {
        win,
        label: win
          ? `LAST SYNC: WIN LOCK +$${winLockout} × ${accounts}`
          : `LAST SYNC: LOSS LOCK −$${lossLockout} × ${accounts}`,
      }
    }
    const onDown = () => fire()
    canvas.addEventListener('pointerdown', onDown)
    let interval = 0
    if (!reduced) {
      interval = setInterval(fire, 3400)
      setTimeout(fire, 700)
    }

    let raf = 0
    let running = true
    let t = 0

    const draw = () => {
      if (!running) return
      t += 1
      const now = performance.now()
      const cx = W / 2
      const cy = H / 2
      ctx.clearRect(0, 0, W, H)

      const PULSE_MS = 620
      const MAX_DELAY = 500

      for (const n of nodes) {
        // gentle organic drift
        const dx = reduced ? 0 : Math.sin(t * 0.011 + n.tw) * 3.5
        const dy = reduced ? 0 : Math.cos(t * 0.013 + n.tw * 1.7) * 3
        n.x = n.bx + dx
        n.y = n.by + dy

        // pointer proximity glow
        const md = Math.hypot(mouse.x - n.x, mouse.y - n.y)
        n.hover = Math.max(0, 1 - md / 110)

        // pulse arrival
        if (pulse) {
          const dist = Math.hypot(n.bx - cx, n.by - cy)
          const delay = (dist / maxDist) * MAX_DELAY
          const p = (now - pulse.start - delay) / PULSE_MS
          if (p >= 1 && n.pulseId !== pulse.start) {
            n.pulseId = pulse.start
            n.energy = 1
            n.color = pulse.win ? '22, 176, 33' : '239, 68, 68'
          }
          n.p = Math.max(0, Math.min(1, p))
        }
        n.energy *= 0.986
      }

      // wires
      for (const n of nodes) {
        const active = pulse && n.p > 0 && n.p < 1
        const a = 0.08 + n.energy * 0.3 + (active ? 0.14 : 0) + n.hover * 0.12
        ctx.strokeStyle = `rgba(${n.energy > 0.05 ? n.color : '245, 66, 79'}, ${a})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(n.x, n.y)
        ctx.stroke()

        // traveling pulse dot
        if (active) {
          const px = cx + (n.x - cx) * n.p
          const py = cy + (n.y - cy) * n.p
          ctx.fillStyle = `rgba(${pulse.win ? '22, 176, 33' : '239, 68, 68'}, ${0.9 - n.p * 0.3})`
          ctx.beginPath()
          ctx.arc(px, py, 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // account nodes
      for (const n of nodes) {
        const e = reduced ? 0.5 : n.energy
        const r = 3 + e * 2.5 + n.hover * 1.5
        const col = reduced ? '22, 176, 33' : e > 0.05 ? n.color : '245, 66, 79'
        if (e > 0.15 || n.hover > 0.2) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5)
          g.addColorStop(0, `rgba(${col}, ${0.22 * Math.max(e, n.hover)})`)
          g.addColorStop(1, `rgba(${col}, 0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = `rgba(${col}, ${0.55 + e * 0.45 + n.hover * 0.3})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      // hub
      const hubPulse = reduced ? 0 : 0.5 + 0.5 * Math.sin(t * 0.05)
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 44)
      hg.addColorStop(0, `rgba(245, 66, 79, ${0.35 + hubPulse * 0.15})`)
      hg.addColorStop(1, 'rgba(245, 66, 79, 0)')
      ctx.fillStyle = hg
      ctx.beginPath()
      ctx.arc(cx, cy, 44, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f5424f'
      ctx.beginPath()
      ctx.arc(cx, cy, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, 11 + hubPulse * 2, 0, Math.PI * 2)
      ctx.stroke()

      // HUD text
      ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace'
      ctx.fillStyle = 'rgba(137, 135, 129, 0.9)'
      ctx.textAlign = 'left'
      ctx.fillText(`SYNC ${accounts}/${accounts} ACCOUNTS · LIVE`, 12, H - 14)
      ctx.textAlign = 'right'
      ctx.fillStyle = lastResult.win ? 'rgba(47, 190, 55, 0.95)' : 'rgba(245, 85, 95, 0.95)'
      ctx.fillText(lastResult.label, W - 12, H - 14)

      if (reduced) return
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
      if (interval) clearInterval(interval)
      ro.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [accounts, winLockout, lossLockout])

  return (
    <div className="constellation" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Visualization: one trader's orders copied live to all ${accounts} accounts.`}
      />
      <p className="constellation-hint">tap to fire a trade →</p>
    </div>
  )
}
