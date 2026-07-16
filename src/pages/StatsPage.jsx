import { Hero, HistoryTable, StatTiles } from '../components/panels.jsx'
import { CumulativeChart, DailyChart } from '../components/charts.jsx'

export default function StatsPage({ stats, config }) {
  return (
    <div className="page">
      <h1 className="page-title">Full stats & charts</h1>
      <p className="page-sub">Everything behind the headline number — updated after every session.</p>

      <div className="stack">
        <Hero stats={stats} config={config} />
        <StatTiles stats={stats} config={config} />

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

        <HistoryTable rows={stats.rows} />
      </div>
    </div>
  )
}
