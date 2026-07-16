import { longDate, money, pct, signedMoney } from '../lib/format'

export function Callout({ callout }) {
  const icon = callout.tone === 'good' ? '▲' : callout.tone === 'bad' ? '▼' : '◆'
  const color =
    callout.tone === 'good'
      ? 'var(--good-text)'
      : callout.tone === 'bad'
        ? 'var(--bad-text)'
        : 'var(--text-muted)'
  return (
    <div className={`callout ${callout.tone}`}>
      <div className="icon" style={{ color }} aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="title">{callout.title}</p>
        <p className="body">{callout.body}</p>
      </div>
    </div>
  )
}

export function Hero({ stats, config }) {
  const { cumTotal, cumPerAccount, latest, avgDaily } = stats
  return (
    <div className="card hero">
      <div>
        <p className="label">Total challenge P&L — {config.accounts} accounts combined</p>
        <p className="figure">{signedMoney(cumTotal)}</p>
      </div>
      <div className="side">
        <div>
          <p className="k">Per account</p>
          <p className="v">{signedMoney(cumPerAccount)}</p>
        </div>
        <div>
          <p className="k">Today{latest ? ` (${longDate(latest.date)})` : ''}</p>
          <p className="v">
            {latest ? (
              <span className={`delta ${latest.pnl >= 0 ? 'up' : 'down'}`}>
                {signedMoney(latest.dailyTotal)}
              </span>
            ) : (
              '—'
            )}
          </p>
        </div>
        <div>
          <p className="k">Avg / trading day</p>
          <p className="v">{avgDaily == null ? '—' : `${signedMoney(avgDaily * config.accounts)}`}</p>
        </div>
      </div>
    </div>
  )
}

export function StatTiles({ stats, config }) {
  const { latest, winRate, streak, bestWinStreak, daysTraded, wins, losses } = stats
  const streakText =
    streak === 0 ? '—' : `${Math.abs(streak)} ${streak > 0 ? 'green' : 'red'} day${Math.abs(streak) === 1 ? '' : 's'}`
  return (
    <div className="tiles">
      <div className="tile">
        <p className="k">Latest day, per account</p>
        <p className="v">
          {latest ? (
            <span className={`delta ${latest.pnl >= 0 ? 'up' : 'down'}`}>{signedMoney(latest.pnl)}</span>
          ) : (
            '—'
          )}
        </p>
        <p className="d">
          {latest
            ? latest.hitWinLock
              ? 'Win lockout hit'
              : latest.hitLossLock
                ? 'Loss lockout hit'
                : 'No lockout'
            : 'No days recorded yet'}
        </p>
      </div>
      <div className="tile">
        <p className="k">Win rate</p>
        <p className="v">{winRate == null ? '—' : pct(winRate)}</p>
        <p className="d">
          {winRate == null
            ? `Assumed ~${pct(config.rules.assumedWinRate)}`
            : `${wins}W – ${losses}L · assumed ~${pct(config.rules.assumedWinRate)}`}
        </p>
      </div>
      <div className="tile">
        <p className="k">Current streak</p>
        <p className="v">{streakText}</p>
        <p className="d">Best green run: {bestWinStreak || '—'}</p>
      </div>
      <div className="tile">
        <p className="k">Days traded</p>
        <p className="v">{daysTraded}</p>
        <p className="d">One entry per trading day</p>
      </div>
    </div>
  )
}

export function Milestones({ milestones, stats }) {
  return (
    <div className="card">
      <h2>Milestones</h2>
      <p className="card-sub">
        Projections use {stats.usingActualPace ? 'the actual average pace so far' : 'the +$250/day target pace'} for the
        representative account.
      </p>
      {milestones.map((m) => (
        <div className="milestone" key={m.key}>
          <div className="row">
            <p className="name">
              {m.title} {m.locked && <span className="locked-tag">· locked until eval passes</span>}
            </p>
            <span className={`eta ${m.done ? 'done' : ''}`}>
              {m.done ? '✓ Reached' : m.locked ? '' : `est. ${m.etaDays} trading day${m.etaDays === 1 ? '' : 's'} left`}
            </span>
          </div>
          <p className="target">{m.subtitle}</p>
          <div className={`meter ${m.locked ? 'locked' : ''}`}>
            <div
              className={`fill ${m.done ? 'done' : ''}`}
              style={{ width: `${Math.round(m.pct * 1000) / 10}%` }}
              role="progressbar"
              aria-valuenow={Math.round(m.pct * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={m.title}
            />
          </div>
          <div className="value-line">
            <span>{m.valueText}</span>
            <span>{Math.floor(m.pct * 100)}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Transparency({ config, stats }) {
  const { investment, payouts, rules, accounts } = config
  const withdrawn = payouts.reduce((s, p) => s + p.amount, 0)
  const net = withdrawn - investment.total
  return (
    <div className="grid-2">
      <div className="card">
        <h2>The stake — full transparency</h2>
        <p className="card-sub">{investment.description}. Every dollar in and out, in the open.</p>
        <table className="t-table">
          <tbody>
            {investment.breakdown.map((b) => (
              <tr key={b.label}>
                <td className="muted-cell">{b.label}</td>
                <td>{money(b.amount)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td>Initial investment</td>
              <td>{money(investment.total)}</td>
            </tr>
            <tr>
              <td className="muted-cell">Withdrawn to date</td>
              <td>{money(withdrawn)}</td>
            </tr>
            <tr className="total-row">
              <td>Net cash position</td>
              <td>
                <span className={`delta ${net >= 0 ? 'up' : 'down'}`}>{signedMoney(net)}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>The rules</h2>
        <p className="card-sub">Same trades copied across every account, hard stops every day.</p>
        <ul className="rules-list">
          <li>
            <span className="rk">Accounts running in parallel</span>
            <span className="rv">{accounts} × $50K evals</span>
          </li>
          <li>
            <span className="rk">Daily win lockout (per account)</span>
            <span className="rv">+{money(rules.dailyWinLockout)} hard stop</span>
          </li>
          <li>
            <span className="rk">Daily loss lockout (per account)</span>
            <span className="rv">−{money(Math.abs(rules.dailyLossLockout))} hard stop</span>
          </li>
          <li>
            <span className="rk">Assumed win rate</span>
            <span className="rv">~{pct(rules.assumedWinRate)}</span>
          </li>
          <li>
            <span className="rk">Data source</span>
            <span className="rv">Manual daily entry</span>
          </li>
          <li>
            <span className="rk">Worst case, per day</span>
            <span className="rv">−{money(Math.abs(rules.dailyLossLockout) * accounts)} across all accounts</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export function HistoryTable({ rows }) {
  if (!rows.length) return null
  const newestFirst = [...rows].reverse()
  return (
    <div className="card">
      <h2>Every trading day</h2>
      <p className="card-sub">The full record — newest first. This table is the source of truth for both charts.</p>
      <div className="history-scroll">
        <table className="h-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Date</th>
              <th className="num">Per account</th>
              <th className="num">All 40 accounts</th>
              <th className="num">Cumulative (×40)</th>
              <th>Lockout</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {newestFirst.map((r) => (
              <tr key={r.date}>
                <td>{r.day}</td>
                <td>{longDate(r.date)}</td>
                <td className="num">
                  <span className={`delta ${r.pnl >= 0 ? 'up' : 'down'}`}>{signedMoney(r.pnl)}</span>
                </td>
                <td className="num">{signedMoney(r.dailyTotal)}</td>
                <td className="num">{signedMoney(r.cumTotal)}</td>
                <td>
                  {r.hitWinLock ? (
                    <span className="lock-chip win">WIN LOCK</span>
                  ) : r.hitLossLock ? (
                    <span className="lock-chip loss">LOSS LOCK</span>
                  ) : (
                    ''
                  )}
                </td>
                <td className="note-cell">{r.note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
