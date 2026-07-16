import { money, pct, signedMoney } from '../lib/format'
import { investmentTotal } from '../lib/stats.js'

export default function StakePage({ stats, config }) {
  const { investment, payouts, rules, accounts } = config
  const total = investmentTotal(config)
  const withdrawn = payouts.reduce((s, p) => s + p.amount, 0)
  const net = withdrawn - total
  const totalAccounts = (investment.firms || []).reduce((s, f) => s + f.accounts, 0)

  return (
    <div className="page">
      <h1 className="page-title">The stake — full transparency</h1>
      <p className="page-sub">
        {investment.description}. Every dollar that went in, every dollar that comes out, in the open.
      </p>

      <div className="stack">
        <div className="card">
          <h2>Where the {money(total)} went</h2>
          <p className="card-sub">
            {investment.breakdownFinal
              ? 'Exact eval costs, firm by firm.'
              : 'Exact per-firm costs being finalized — average shown until then.'}
          </p>
          <div className="history-scroll">
            <table className="h-table firms-table">
              <thead>
                <tr>
                  <th>Firm</th>
                  <th className="num">Accounts</th>
                  <th className="num">Cost per eval</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {(investment.firms || []).map((f) => (
                  <tr key={f.firm}>
                    <td className="note-cell">{f.firm}</td>
                    <td className="num">{f.accounts}</td>
                    <td className="num">{money(f.costPerAccount)}</td>
                    <td className="num">{money(f.accounts * f.costPerAccount)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  <td className="num">{totalAccounts}</td>
                  <td className="num" />
                  <td className="num">{money(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h2>Cash in, cash out</h2>
            <p className="card-sub">The only numbers that matter at the end of the story.</p>
            <table className="t-table">
              <tbody>
                <tr>
                  <td className="muted-cell">Initial investment</td>
                  <td>−{money(total)}</td>
                </tr>
                <tr>
                  <td className="muted-cell">Withdrawn to date</td>
                  <td>{money(withdrawn)}</td>
                </tr>
                {payouts.map((p) => (
                  <tr key={`${p.date}-${p.amount}`}>
                    <td className="muted-cell">↳ {p.label || p.date}</td>
                    <td>{money(p.amount)}</td>
                  </tr>
                ))}
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
      </div>
    </div>
  )
}
