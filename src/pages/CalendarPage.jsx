import { useMemo, useState } from 'react'
import { longDate, money, signedMoney } from '../lib/format'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function monthLabel(month) {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default function CalendarPage({ stats, config }) {
  const { rows } = stats
  const byDate = useMemo(() => new Map(rows.map((r) => [r.date, r])), [rows])
  const months = useMemo(() => [...new Set(rows.map((r) => r.date.slice(0, 7)))].sort(), [rows])
  const [mi, setMi] = useState(months.length - 1)
  const idx = Math.max(0, Math.min(mi, months.length - 1))

  if (!months.length) {
    return (
      <div className="page">
        <h1 className="page-title">Daily P&L calendar</h1>
        <p className="page-sub">Every trading day, on the calendar it happened.</p>
        <div className="card">
          <div className="chart-empty">No trading days recorded yet — Day 1 will light this up. 🏁</div>
        </div>
      </div>
    )
  }

  const month = months[idx]
  const [y, m] = month.split('-').map(Number)
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()

  const monthRows = rows.filter((r) => r.date.startsWith(month))
  const monthTotal = monthRows.reduce((s, r) => s + r.pnl, 0)
  const green = monthRows.filter((r) => r.pnl > 0).length
  const red = monthRows.filter((r) => r.pnl < 0).length

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="page">
      <h1 className="page-title">Daily P&L calendar</h1>
      <p className="page-sub">
        Per-account results, day by day. Multiply by {config.accounts} for the whole challenge — or hover any day.
      </p>

      <div className="card">
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => setMi(idx - 1)} disabled={idx === 0} aria-label="Previous month">
            ‹
          </button>
          <span className="cal-month">{monthLabel(month)}</span>
          <button
            className="icon-btn"
            onClick={() => setMi(idx + 1)}
            disabled={idx === months.length - 1}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="cal-grid cal-dow-row">
          {DOW.map((d) => (
            <span className="cal-dow" key={d}>
              {d}
            </span>
          ))}
        </div>
        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <div className="cal-cell empty" key={`e${i}`} />
            const iso = `${month}-${String(d).padStart(2, '0')}`
            const row = byDate.get(iso)
            const cls = row ? (row.pnl > 0 ? 'win' : row.pnl < 0 ? 'loss' : 'flat') : ''
            const title = row
              ? `${longDate(iso)} — ${signedMoney(row.pnl)} per account · ${signedMoney(row.dailyTotal)} across all ${config.accounts}${row.note ? ` · ${row.note}` : ''}`
              : undefined
            return (
              <div className={`cal-cell ${cls}`} key={iso} title={title}>
                <span className="cal-day">{d}</span>
                {row && (row.hitWinLock || row.hitLossLock) && (
                  <span className="cal-lock" aria-hidden="true">
                    {row.hitWinLock ? '🔒' : '🛑'}
                  </span>
                )}
                {row && (
                  <span className={`cal-pnl ${row.pnl >= 0 ? 'up' : 'down'}`}>{signedMoney(row.pnl)}</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="cal-summary">
          <span>
            <strong>{monthLabel(month)}:</strong>{' '}
            <span className={`delta ${monthTotal >= 0 ? 'up' : 'down'}`}>{signedMoney(monthTotal)}</span> per account ·{' '}
            <span className={`delta ${monthTotal >= 0 ? 'up' : 'down'}`}>
              {signedMoney(monthTotal * config.accounts)}
            </span>{' '}
            across all {config.accounts}
          </span>
          <span>
            {green} green · {red} red · 🔒 = win lockout, 🛑 = loss lockout
          </span>
        </div>
      </div>
    </div>
  )
}
