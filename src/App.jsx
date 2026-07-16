import { useMemo, useState } from 'react'
import config from './data/config.json'
import realEntries from './data/entries.json'
import demoEntries from './data/demoEntries.json'
import { computeCallout, computeMilestones, computeStats } from './lib/stats.js'
import { Callout, Hero, HistoryTable, Milestones, StatTiles, Transparency } from './components/panels.jsx'
import { CumulativeChart, DailyChart } from './components/charts.jsx'

function currentTheme() {
  const saved = document.documentElement.dataset.theme
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const demo = new URLSearchParams(window.location.search).has('demo')
  const entries = demo ? demoEntries : realEntries

  const [theme, setTheme] = useState(currentTheme)
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* private mode — theme just won't persist */
    }
    setTheme(next)
  }

  const stats = useMemo(() => computeStats(entries, config), [entries])
  const milestones = useMemo(() => computeMilestones(stats, config), [stats])
  const callout = useMemo(() => computeCallout(stats, config), [stats])

  return (
    <div className="wrap">
      <header className="header">
        <div>
          <h1>{config.challengeName}</h1>
          <p className="sub">
            One trader. {config.accounts} prop accounts. Every trade copied, every dollar public. · {config.series}
          </p>
        </div>
        <div className="header-right">
          <span className="day-chip">
            {stats.daysTraded > 0 ? `Day ${stats.daysTraded}` : 'Day 0'}
          </span>
          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle color theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>

      {demo && (
        <div className="demo-banner">
          Demo data — this is a preview with sample numbers. <a href="/">View the real tracker</a>.
        </div>
      )}

      <div className="stack">
        <Callout callout={callout} />
        <Hero stats={stats} config={config} />
        <StatTiles stats={stats} config={config} />
        <Milestones milestones={milestones} stats={stats} />

        <div className="grid-2">
          <div className="card">
            <h2>Equity curve — all {config.accounts} accounts</h2>
            <p className="card-sub">Cumulative P&L, one representative account × {config.accounts}.</p>
            {stats.rows.length ? (
              <CumulativeChart rows={stats.rows} />
            ) : (
              <div className="chart-empty">The curve starts with the first recorded trading day.</div>
            )}
          </div>
          <div className="card">
            <h2>Daily results</h2>
            <p className="card-sub">
              Green days cap at +$
              {(config.rules.dailyWinLockout * config.accounts).toLocaleString('en-US')}, red days at −$
              {(Math.abs(config.rules.dailyLossLockout) * config.accounts).toLocaleString('en-US')} — by rule.
            </p>
            {stats.rows.length ? (
              <DailyChart rows={stats.rows} />
            ) : (
              <div className="chart-empty">No trading days recorded yet.</div>
            )}
          </div>
        </div>

        <Transparency config={config} stats={stats} />
        <HistoryTable rows={stats.rows} />
      </div>

      <footer className="footer">
        Updated manually after each trading day · {config.series} — {config.challengeName} · Not financial advice
      </footer>
    </div>
  )
}
