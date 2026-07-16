import { useEffect, useMemo, useRef, useState } from 'react'
import { prefersReducedMotion, useInView } from '../../hooks/useInView.js'

const SHORT_NAMES = { MyFundedFutures: 'MFF' }

// The Wall of 40: one tile per real funded account (built from
// config.investment.firms, so it always matches the Costs page). Tiles boot up
// rack-style when scrolled into view; every few seconds — and on any click —
// a trade sweep propagates across the wall and every tile stamps the result.
export function AccountWall({ firms, winLockout, lossLockout }) {
  const tiles = useMemo(
    () =>
      (firms || []).flatMap((f, fi) =>
        Array.from({ length: f.accounts }, (_, i) => ({
          key: `${fi}-${i}`,
          firm: (SHORT_NAMES[f.firm] || f.firm).toUpperCase(),
        })),
      ),
    [firms],
  )
  const [ref, inView] = useInView({ threshold: 0.2 })
  const [booted, setBooted] = useState(false)
  const [sweep, setSweep] = useState(null) // { win, id }
  const [tally, setTally] = useState({ fired: 0, wins: 0 })
  const clearTimer = useRef(null)

  useEffect(() => {
    if (inView) setBooted(true)
  }, [inView])

  const fire = (forced) => {
    const win = typeof forced === 'boolean' ? forced : Math.random() < 0.75
    clearTimeout(clearTimer.current)
    setSweep({ win, id: Date.now() })
    setTally((t) => ({ fired: t.fired + 1, wins: t.wins + (win ? 1 : 0) }))
    // wave in (~40 tiles * stagger) + hold, then wave back out
    clearTimer.current = setTimeout(() => setSweep(null), prefersReducedMotion() ? 1600 : 2600)
  }

  useEffect(() => {
    if (!inView) return
    const t0 = setTimeout(fire, 900)
    const iv = setInterval(fire, 4600)
    return () => {
      clearTimeout(t0)
      clearInterval(iv)
      clearTimeout(clearTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  const stamp = sweep ? (sweep.win ? `+$${winLockout}` : `−$${lossLockout}`) : ''

  return (
    <div className={`wall ${booted ? 'booted' : ''}`} ref={ref}>
      <div className="wall-bar">
        <span className="wall-live">
          <span className="wall-live-dot" /> SYNC 40/40 · LIVE
        </span>
        <span className="wall-tally">
          {sweep
            ? sweep.win
              ? `WIN LOCK — EVERY ACCOUNT +$${winLockout}`
              : `LOSS LOCK — DAMAGE CAPPED AT −$${lossLockout}`
            : tally.fired
              ? `${tally.wins}W – ${tally.fired - tally.wins}L THIS SESSION`
              : 'AWAITING FIRST SYNC'}
        </span>
        <button className="wall-fire" onClick={() => fire()}>
          ⚡ FIRE A TRADE
        </button>
      </div>
      <div
        className={`wall-grid ${sweep ? (sweep.win ? 'sweep-win' : 'sweep-loss') : ''}`}
        onClick={() => fire()}
        role="img"
        aria-label={`${tiles.length} funded accounts executing the same trade simultaneously.`}
      >
        {tiles.map((t, i) => {
          const col = i % 8
          const row = Math.floor(i / 8)
          const delay = `${(col + row) * 42}ms`
          return (
            <div
              key={t.key}
              className="wt"
              style={{ '--boot': `${i * 28}ms`, '--d': delay }}
            >
              <span className="wt-led" />
              <span className="wt-firm">{t.firm}</span>
              <span className="wt-size">$50K</span>
              <span className="wt-stamp">{stamp}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
