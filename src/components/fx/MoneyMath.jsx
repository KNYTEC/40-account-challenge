import { useScrollProgress } from '../../hooks/useScrollProgress.js'
import { money } from '../../lib/format.js'
import { investmentTotal } from '../../lib/stats.js'

// Pinned scroll-scrub scene: a 320vh wrapper with a sticky full-viewport
// stage. Scrolling scrubs through four giant beats of the money math,
// ending on the leverage punchline. All numbers derive from config.
export function MoneyMath({ config }) {
  const [ref, p] = useScrollProgress()
  const total = investmentTotal(config)
  const funding = config.accounts * (config.investment.accountSize || 0)
  const leverage = Math.round(funding / total)
  const firms = (config.investment.firms || []).map((f) => f.firm).join(' · ')

  const beats = [
    { big: money(Math.round(total / config.accounts)), label: 'average cost of one $50K evaluation' },
    { big: `×${config.accounts}`, label: `accounts across 5 firms — ${firms}` },
    { big: money(total), label: 'the entire stake. that is the whole risk.' },
    { big: money(funding), label: 'in funded buying power controlled', punch: `${leverage}× leverage on discipline` },
  ]
  const beat = Math.min(beats.length - 1, Math.floor(p * beats.length))
  const b = beats[beat]

  return (
    <div className="mm-wrap" ref={ref}>
      <div className="mm-sticky">
        <p className="mm-kick">The money math</p>
        <div className="mm-stage" key={beat}>
          <p className={`mm-big ${beat === beats.length - 1 ? 'gold' : ''}`}>{b.big}</p>
          <p className="mm-label">{b.label}</p>
          {b.punch && <p className="mm-punch">{b.punch}</p>}
        </div>
        <div className="mm-dots">
          {beats.map((_, i) => (
            <span key={i} className={`mm-dot ${i <= beat ? 'on' : ''}`} />
          ))}
        </div>
        <p className="mm-hint">keep scrolling ▾</p>
      </div>
    </div>
  )
}
