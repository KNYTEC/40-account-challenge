import { money, pct, signedMoney } from '../lib/format'
import { computePayoutModel, investmentTotal } from '../lib/stats.js'

export default function StakePage({ stats, config }) {
  const { investment, payouts, rules, accounts } = config
  const total = investmentTotal(config)
  const model = computePayoutModel(config)
  const withdrawn = payouts.reduce((s, p) => s + p.amount, 0)
  const net = withdrawn - total
  const totalAccounts = (investment.firms || []).reduce((s, f) => s + f.accounts, 0)
  const combinedFunding = totalAccounts * (investment.accountSize || 0)

  return (
    <div className="page">
      <h1 className="page-title">Costs — full transparency</h1>
      <p className="page-sub">
        {investment.description}. Every dollar that went in, every dollar that comes out, in the open.
      </p>

      <div className="stack">
        {combinedFunding > 0 && (
          <div className="funding-flex">
            <div className="ff-item">
              <p className="ff-num">{money(combinedFunding)}</p>
              <p className="ff-label">in combined funding controlled</p>
            </div>
            <p className="ff-arrow" aria-hidden="true">
              for a stake of
            </p>
            <div className="ff-item">
              <p className="ff-num accent">{money(total)}</p>
              <p className="ff-label">total cost of all {totalAccounts} evals</p>
            </div>
          </div>
        )}

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
                  <th>Account type</th>
                  <th className="num">Accounts</th>
                  <th className="num">Cost per eval</th>
                  <th className="num">Total</th>
                  <th>First payout rule</th>
                  <th className="num">Payout / acct</th>
                </tr>
              </thead>
              <tbody>
                {(investment.firms || []).map((f) => (
                  <tr key={f.firm}>
                    <td className="note-cell">{f.firm}</td>
                    <td className="note-cell">{f.accountType}</td>
                    <td className="num">{f.accounts}</td>
                    <td className="num">{money(f.costPerAccount)}</td>
                    <td className="num">{money(f.accounts * f.costPerAccount)}</td>
                    <td className="note-cell">{f.payout?.note}</td>
                    <td className="num">
                      {f.payout ? money(f.payout.maxWithdraw * f.payout.traderShare) : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  <td className="note-cell">{totalAccounts} × $50K accounts</td>
                  <td className="num">{totalAccounts}</td>
                  <td className="num" />
                  <td className="num">{money(total)}</td>
                  <td className="note-cell">first payout cycle, after splits</td>
                  <td className="num">{money(model.cycle1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {investment.pricingNote && <p className="firms-note">{investment.pricingNote}</p>}
        </div>

        <div className="grid-2">
          <div className="card">
            <h2>Cash in, cash out</h2>
            <p className="card-sub">
              The only numbers that matter at the end of the story. Target: two payout cycles ={' '}
              {money(model.total)}, from each firm's real payout rules.
            </p>
            <table className="t-table">
              <tbody>
                <tr>
                  <td className="muted-cell">Initial investment</td>
                  <td>−{money(total)}</td>
                </tr>
                <tr>
                  <td className="muted-cell">Payout #1 target (real firm rules, after splits)</td>
                  <td>{money(model.cycle1)}</td>
                </tr>
                <tr>
                  <td className="muted-cell">
                    Payout #2 target ({model.rebuildDays} winning days later · Tradeify → live, excluded)
                  </td>
                  <td>{money(model.cycle2)}</td>
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
                <span className="rk">Copy trading</span>
                <span className="rv">{config.copyTrader} · all {accounts} accounts</span>
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
