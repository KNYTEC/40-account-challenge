import { useEffect, useRef, useState } from 'react'

// Progress (0..1) of a tall wrapper element scrolling through the viewport —
// 0 when its top hits the viewport top, 1 when its bottom reaches the viewport
// bottom. Runs a rAF loop only while the element is on screen, and quantizes
// to 1% so renders only fire when the value meaningfully changes.
export function useScrollProgress() {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let active = false

    const tick = () => {
      if (!active) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0
      setProgress(Math.round(p * 100) / 100)
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !active) {
        active = true
        raf = requestAnimationFrame(tick)
      } else if (!entry.isIntersecting && active) {
        active = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(el)
    return () => {
      active = false
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return [ref, progress]
}
