import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../../hooks/useInView.js'

// Terminal-style stat ticker. Normal mode: seamless CSS marquee (content
// duplicated). Reduced-motion mode: no translation — one centered item that
// rotates on a timer with an opacity-only fade, so the content still cycles.
export function Ticker({ items }) {
  const reduced = prefersReducedMotion()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!reduced || items.length < 2) return
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), 3500)
    return () => clearInterval(id)
  }, [reduced, items.length])

  if (reduced) {
    return (
      <div className="ticker ticker-static" aria-hidden="true">
        <span className="ticker-item ticker-item-fade" key={idx}>
          {items[idx % items.length]}
        </span>
      </div>
    )
  }

  const row = items.map((item, i) => (
    <span className="ticker-item" key={i}>
      {item}
      <span className="ticker-sep" aria-hidden="true">
        ◆
      </span>
    </span>
  ))
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {row}
        {row}
      </div>
    </div>
  )
}
