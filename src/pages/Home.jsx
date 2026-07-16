import { Link, useLocation } from 'react-router-dom'
import { addBusinessDays, compactMoney, money, monthDay, signedMoney } from '../lib/format'
import { computeCountdown, investmentTotal } from '../lib/stats.js'
import { Callout, Milestones } from '../components/panels.jsx'
import { SocialCards } from '../components/social.jsx'
import { WinCelebration } from '../components/celebration.jsx'
import { CountUp } from '../components/fx/CountUp.jsx'
import { Reveal } from '../components/fx/Reveal.jsx'
import { Ticker } from '../components/fx/Ticker.jsx'
import { Constellation } from '../components/fx/Constellation.jsx'

function statusOf(stats) {
  const { latest } = stats
  if (!latest) return { word: 'PRE-GAME', emoji: '🏁' }
  if (latest.hitWinLock) return { word: 'LOCKED IN', emoji: '🔒' }
  if (latest.pnl > 0) return { word: 'PRINTING', emoji: '💸' }
  if (latest.hitLossLock) return { word: 'DAMAGE CONTAINED', emoji: '🛡️' }
  if (latest.pnl < 0) return { word: 'MINOR SETBACK', emoji: '😤' }
  return { word: 'FLAT', emoji: '😴' }
}

export default function Home({ stats, milestones, callout, config }) {
  const { search } = useLocation()
  const status = statusOf(stats)
  const { latest, streak, cumTotal } = stats
  const glow = cumTotal > 0 ? 'good' : cumTotal < 0 ? 'bad' : 'accent'
  const countdown = computeCountdown(stats, config)

  // Estimated payout dates, assuming every next day is a win (matches the
  // countdown model). Business days only. Computed at view time in the browser.
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

  return (
    <div className="home">
      <WinCelebration latest={latest} countdown={countdown} stats={stats} />
      <Ticker items={tickerItems} />
      <section className="hero-status">
        <div className={`hero-glow ${glow}`} aria-hidden="true" />
        <p className="hero-kicker">
          <span className="hk-name">{config.brand}</span>
          <span className="hk-sep" aria-hidden="true">•</span>
          <span className="hk-slogan">{config.slogan}</span>
        </p>
        <p className="eyebrow">
          Day {stats.daysTraded} · Status:{' '}
          <span className="glitch" data-text={status.word}>
            {status.word}
          </span>{' '}
          {status.emoji}
        </p>
        <h1 className="hero-title">{config.tagline}</h1>
        <p className="mega-figure">
          <CountUp value={cumTotal} format={(v) => signedMoney(v)} duration={1400} />
        </p>
        <p className="hero-sub">
          Total P&L across all {config.accounts} accounts
          {latest && (
            <>
              {' · '}
              <span className={`delta ${latest.pnl >= 0 ? 'up' : 'down'}`}>
                {signedMoney(latest.dailyTotal)} today
              </span>
            </>
          )}
          {streak >= 2 && <> · 🔥 {streak}-day green streak</>}
          {streak <= -2 && <> · {Math.abs(streak)} red days — lockouts holding</>}
        </p>
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
      </section>

      <section className="countdown" aria-live="polite">
        <div className={`cd-glow ${countdown.unlocked ? 'good' : 'accent'}`} aria-hidden="true" />
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

            <div className="cd-bar" aria-hidden="true">
              <span className="cd-bar-end">🚩</span>
              <span className="cd-bar-track">
                <span className="cd-bar-fill" style={{ width: `${Math.round(countdown.progressPct * 1000) / 10}%` }} />
                <span
                  className={`cd-bar-marker ${countdown.payout1.unlocked ? 'hit' : ''}`}
                  style={{ left: `${Math.round(countdown.payout1.pctOfBar * 1000) / 10}%` }}
                >
                  <span className="cd-marker-label">{money(countdown.payout1.total)}</span>
                </span>
              </span>
              <span className="cd-bar-end">🏆</span>
            </div>
            <p className="cd-bar-caption">
              {countdown.bankedWinningDays} / {countdown.totalWinningDays} winning days · {countdown.winningDays} to go
            </p>

            <p className="cd-sub">
              {countdown.evalPassed ? 'Eval passed — funded and counting. ' : ''}
              Assuming every next day is a +{money(countdown.winAmount)} win. Every green day ticks it down; every
              −{money(Math.abs(config.rules.dailyLossLockout))} day pushes it back.
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
      </section>

      <Reveal>
        <section className="section">
          <p className="section-eyebrow">The engine</p>
          <h2 className="section-title">One trade. Forty accounts. Zero hesitation.</h2>
          <p className="section-copy">
            Every order fires from one account and hits all {config.accounts} at once via {config.copyTrader}. Watch
            it happen — or tap the grid to fire one yourself.
          </p>
          <div className="card constellation-card">
            <Constellation
              accounts={config.accounts}
              winLockout={config.rules.dailyWinLockout}
              lossLockout={Math.abs(config.rules.dailyLossLockout)}
            />
          </div>
        </section>
      </Reveal>

      <Reveal>
      <section className="section">
        <p className="section-eyebrow">The mission</p>
        <h2 className="section-title">One trader. Forty accounts. Zero secrets.</h2>
        <p className="section-copy">
          I'm {config.brand} — trading {config.accounts} prop firm evaluations at the same time. Every account copies
          the exact same trades, so one good day is {config.accounts} good days. Hard lockout rules cap every single
          day, win or lose. That's the whole idea: <strong>{config.slogan.replace(/\.$/, '')}</strong>. The scoreboard
          here updates after every session, and every trade gets recapped on the {config.handle} channels.
        </p>
        <div className="fact-row">
          <div className="fact">
            <p className="fact-num">
              <CountUp value={config.accounts} />
            </p>
            <p className="fact-label">
              × $50K accounts in parallel — {compactMoney(config.accounts * (config.investment.accountSize || 0))} in
              combined funding
            </p>
          </div>
          <div className="fact">
            <p className="fact-num">
              <CountUp value={investmentTotal(config)} format={(v) => money(v)} />
            </p>
            <p className="fact-label">Total stake — all-in cost of every eval</p>
          </div>
          <div className="fact">
            <p className="fact-num">
              <CountUp value={countdown.withdrawalTotal} format={(v) => money(v)} />
            </p>
            <p className="fact-label">Total payout target — two cycles across all accounts</p>
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section className="section">
        <p className="section-eyebrow">The rules of the game</p>
        <h2 className="section-title">Discipline is the whole strategy.</h2>
        <div className="rule-cards">
          <div className="rule-card">
            <p className="rule-emoji">🎯</p>
            <p className="rule-title">+$250 and done</p>
            <p className="rule-copy">
              Hit +$250 on the day and every account locks in the win. No revenge of the greed — the platform shuts
              me off.
            </p>
          </div>
          <div className="rule-card">
            <p className="rule-emoji">🛑</p>
            <p className="rule-title">−$100 max pain</p>
            <p className="rule-copy">
              A red day can never cost more than $100 per account. Worst case across the whole challenge:{' '}
              −{money(Math.abs(config.rules.dailyLossLockout) * config.accounts)} — that's it.
            </p>
          </div>
          <div className="rule-card">
            <p className="rule-emoji">📋</p>
            <p className="rule-title">One plan × {config.accounts}</p>
            <p className="rule-copy">
              Same setups, same entries, mirrored to every account via {config.copyTrader}. Roughly{' '}
              {Math.round(config.rules.assumedWinRate * 100)}% of days end green — the math does the rest.
            </p>
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
      <section className="section">
        <p className="section-eyebrow">The roadmap</p>
        <h2 className="section-title">Three checkpoints to {money(countdown.withdrawalTotal)} in payouts.</h2>
        <Milestones milestones={milestones} stats={stats} />
      </section>
      </Reveal>

      <Reveal>
      <section className="section">
        <p className="section-eyebrow">Follow {config.handle}</p>
        <h2 className="section-title">Watch it happen, live and unfiltered.</h2>
        <p className="section-copy">
          Same handle everywhere — <strong>{config.handle}</strong> on YouTube, Kick, X, Instagram &amp; TikTok.{' '}
          {config.slogan}
        </p>
        <SocialCards socials={config.socials} />
      </section>
      </Reveal>
    </div>
  )
}
