import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, useInView } from '../../hooks/useInView.js'

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)

// Animates a number from 0 to `value` when it scrolls into view.
// `format` receives the interpolated number and returns the display string.
export function CountUp({ value, format = (v) => Math.round(v).toLocaleString('en-US'), duration = 1100, className }) {
  const [ref, inView] = useInView({ threshold: 0.4 })
  const [display, setDisplay] = useState(() => format(prefersReducedMotion() ? value : 0))
  const done = useRef(false)

  useEffect(() => {
    if (!inView || done.current) return
    done.current = true
    if (prefersReducedMotion()) {
      setDisplay(format(value))
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setDisplay(format(value * easeOutCubic(p)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value])

  // re-sync instantly if the underlying value changes after the animation
  useEffect(() => {
    if (done.current) setDisplay(format(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
