import { useEffect, useState } from 'react'
import { computeStatus } from '../../lib/stats.js'

function clock() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

// Fixed terminal chrome over every page: corner brackets + live readouts.
// Pointer-events: none — pure atmosphere.
export function HudFrame({ stats }) {
  const [time, setTime] = useState(clock)
  useEffect(() => {
    const id = setInterval(() => setTime(clock()), 1000)
    return () => clearInterval(id)
  }, [])
  const status = computeStatus(stats)

  return (
    <div className="hud" aria-hidden="true">
      <span className="hud-corner tl" />
      <span className="hud-corner tr" />
      <span className="hud-corner bl" />
      <span className="hud-corner br" />
      <span className="hud-read hud-left">MNQDEGEN://TERMINAL</span>
      <span className="hud-read hud-right">
        {time} · DAY {stats.daysTraded} · {status.word}
      </span>
    </div>
  )
}
