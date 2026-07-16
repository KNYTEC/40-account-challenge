import { Link, useLocation } from 'react-router-dom'
import { addBusinessDays, money, monthDay, signedMoney } from '../lib/format'
import { computeCountdown, computeStatus } from '../lib/stats.js'
import { Callout } from '../components/panels.jsx'
import { SocialCards } from '../components/social.jsx'
import { WinCelebration } from '../components/celebration.jsx'
import { CountUp } from '../components/fx/CountUp.jsx'
import { Reveal } from '../components/fx/Reveal.jsx'
import { Ticker } from '../components/fx/Ticker.jsx'
import { AccountWall } from '../components/fx/AccountWall.jsx'
import { MoneyMath } from '../components/fx/MoneyMath.jsx'
import { KineticMarquee } from '../components/fx/KineticMarquee.jsx'

export default function Home({ stats, callout, config }) {
  const { search } = useLocation()
  const status = computeStatus(stats)
  const { latest, streak, cumTotal } = stats
  const glow = cumTotal > 0 ? 'good' : cumTotal < 0 ? 'bad' : 'accent'
  const countdown = computeCountdown(stats, config)

  const now = new Date()
  const payout1Date = countdown.payout1.unlocked
    ? null
    : monthDay(addBusinessDays(now, countdown.payout1.winningDaysLeft))
  const payoutFullDate = countdown.unlocked ? null : monthDay(addBusinessDays(now, countdown.winningDays))

  const tickerItems = [
    `${config.accounts} accounts synced`,
    `Day ${stats.daysTraded}`,
    `${signedMoney(cumTotal)} total P&L`,
    `${countdown.winningDays} winning days to $100K`,
    `Win lock +$${config.rules.dailyWinLockout}`,
    `Loss lock −$${Math.abs(config.rules.dailyLossLockout)}`,
    '$2M in funding',
    `${config.handle} everywhere`,
    config.slogan,
  ]

  // mission-track checkpoint positions (share the countdown's 0..1 scale)
  const p2Target =
    config.milestones.evalPassPerAccount +
    config.milestones.fundedProfitForPayout +
    config.milestones.payout2WinningDaysAfter * config.rules.dailyWinLockout
  const checkpoints = [
    {
      pct: config.milestones.evalPassPerAccount / p2Target,
      wd: Math.round(config.milestones.evalPassPerAccount / config.rules.dailyWinLockout),
      label: 'EVAL PASS',
      done: countdown.evalPassed,
    },
    {
      pct: countdown.payout1.pctOfBar,
      wd: Math.round((countdown.payout1.pctOfBar * p2Target) / config.rules.dailyWinLockout),
      label: `$60K PAYOUT`,
      done: countdown.payout1.unlocked,
    },
    {
      pct: 1,
      wd: countdown.totalWinningDays,
      label: '$100K TOTAL',
      done: countdown.unlocked,
    },
  ]

  const ruleChips = [
    `+$${config.rules.dailyWinLockout} WIN LOCK / DAY`,
    `−$${Math.abs(config.rules.dailyLossLockout)} LOSS LOCK / DAY`,
    `SYNC: ${config.copyTrader.toUpperCase()} ×${config.accounts}`,
    'DATA: MANUAL ENTRY, DAILY',
  ]

  return (
    <div className="home machine">
      <WinCelebration latest={latest} countdown={countdown} stats={stats} />
      <Ticker items={tickerItems} />

      {/* ACT 1 — HERO */}
      <section className="act act-hero">
        <div className={`hero-glow ${glow}`} aria-hidden="true" />
        <p className="hero-hudline">
          DAY {stats.daysTraded} · STATUS:{' '}
          <span className="glitch" data-text={status.word}>
            {status.word}
          </span>{' '}
          {status.emoji}
          {latest && (
            <>
              {' '}
              · <span className={`delta ${latest.pnl >= 0 ? 'up' : 'down'}`}>{signedMoney(latest.dailyTotal)}</span>{' '}
              TODAY
            </>
          )}
          {streak >= 2 && <> · 🔥 {streak} STREAK</>}
        </p>
        <h1 className="hero-title kinetic">
          {config.tagline.split(' ').map((w, i) => (
            <span className="kw" key={i} style={{ '--kd': `${120 + i * 90}ms` }}>
              <span className="kwi">{w}</span>
            </span>
          ))}
        </h1>
        <p className="mega-figure">
          <CountUp value={cumTotal} format={(v) => signedMoney(v)} duration={1400} />
        </p>
        <p className="hero-sub">Total P&L across all {config.accounts} accounts — every dollar public.</p>
        <Callout callout={callout} />
        <div className="cta-row">
          <Link className="btn" to={`/calendar${search}`}>
            📅 Daily P&L calendar
          </Link>
          <Link className="btn ghost" to={`/stats${search}`}>
            📊 Full stats & charts
          </Link>
          <Link className="btn ghost" to={`/costs${search}`}>
            💵 Costs
          </Link>
        </div>
        <p className="scroll-cue">SCROLL TO ENTER THE MACHINE ▾</p>
      </section>

      {/* ACT 2 — THE WALL OF 40 */}
      <section className="act act-wall">
        <Reveal>
          <div className="act-inner">
            <p className="section-eyebrow">The engine</p>
            <h2 className="section-title">One click. Forty fills.</h2>
            <p className="section-copy">
              These are the real {config.accounts} accounts — every order I fire is mirrored to all of them at once
              via {config.copyTrader}. One good day is forty good days. {config.slogan}
            </p>
          </div>
        </Reveal>
        <AccountWall
          firms={config.investment.firms}
          winLockout={config.rules.dailyWinLockout}
          lossLockout={Math.abs(config.rules.dailyLossLockout)}
        />
      </section>

      {/* ACT 3 — MONEY MATH (scroll scrub) */}
      <MoneyMath config={config} />

      {/* ACT 4 — THE CLIMB */}
      <section className="act act-climb" aria-live="polite">
        <div className="act-inner">
          {countdown.unlocked ? (
            <div className="cd-inner">
              <p className="cd-num unlocked">🎉</p>
              <p className="cd-label">Payout unlocked</p>
              <p className="cd-sub">
                The first {money(countdown.withdrawalTotal)} is on the table — {config.slogan}
              </p>
            </div>
          ) : (
            <div className="cd-inner">
              <p className="cd-kick">The countdown</p>
              <p className="cd-num">
                <CountUp
                  value={countdown.totalWinningDays - countdown.winningDays}
                  format={(v) => countdown.totalWinningDays - Math.round(v)}
                  duration={1600}
                />
              </p>
              <p className="cd-label">winning days to {money(countdown.withdrawalTotal)} in payouts</p>

              <div className="track" aria-hidden="true">
                <div className="track-line">
                  <div className="track-fill" style={{ width: `${Math.round(countdown.progressPct * 1000) / 10}%` }} />
                  <span
                    className="track-now"
                    style={{ left: `${Math.round(countdown.progressPct * 1000) / 10}%` }}
                  />
                  {checkpoints.map((c) => (
                    <span key={c.label} className={`ck ${c.done ? 'done' : ''}`} style={{ left: `${c.pct * 100}%` }}>
                      <span className="ck-node" />
                      <span className="ck-label">
                        {c.label}
                        <em>{c.wd} WD</em>
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <p className="cd-bar-caption">
                {countdown.bankedWinningDays} / {countdown.totalWinningDays} winning days banked ·{' '}
                {countdown.winningDays} to go
              </p>

              <p className="cd-sub">
                Assuming every next day is a +{money(countdown.winAmount)} win.
                {latest && latest.pnl > 0 && (
                  <>
                    {' '}
                    <span className="cd-moved">Yesterday moved it −{Math.round(countdown.movedToday * 10) / 10}.</span>
                  </>
                )}
              </p>
              <p className="cd-dates">
                If you win every day from here:
                {payout1Date && (
                  <>
                    {' '}
                    <span className="cd-date-item">
                      first {money(countdown.payout1.total)} <strong>~{payout1Date}</strong>
                    </span>
                  </>
                )}
                {payout1Date && payoutFullDate && <span className="cd-date-sep"> · </span>}
                {payoutFullDate && (
                  <span className="cd-date-item">
                    full {money(countdown.withdrawalTotal)} <strong>~{payoutFullDate}</strong>
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="rule-chips">
            {ruleChips.map((r) => (
              <span className="rule-chip" key={r}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ACT 5 — KINETIC MARQUEE */}
      <KineticMarquee
        lines={[
          { text: 'DEGENERATE WITH DISCIPLINE' },
          { text: `$100K IN PAYOUTS · ${countdown.totalWinningDays} WINNING DAYS`, solid: true },
        ]}
      />

      {/* ACT 6 — FOLLOW */}
      <section className="act act-follow">
        <Reveal>
          <div className="act-inner">
            <p className="section-eyebrow">Follow {config.handle}</p>
            <h2 className="section-title">Watch it happen, live and unfiltered.</h2>
            <p className="section-copy">
              Same handle everywhere — <strong>{config.handle}</strong> on YouTube, Kick, X, Instagram &amp; TikTok.{' '}
              {config.slogan}
            </p>
            <SocialCards socials={config.socials} />
          </div>
        </Reveal>
      </section>
    </div>
  )
}
