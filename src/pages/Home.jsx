import { Link, useLocation } from 'react-router-dom'
import { money, signedMoney } from '../lib/format'
import { computeCountdown, investmentTotal } from '../lib/stats.js'
import { Callout, Milestones } from '../components/panels.jsx'
import { SocialCards } from '../components/social.jsx'

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

  return (
    <div className="home">
      <section className="hero-status">
        <div className={`hero-glow ${glow}`} aria-hidden="true" />
        <p className="hero-kicker">
          <span className="hk-name">{config.brand}</span>
          <span className="hk-sep" aria-hidden="true">•</span>
          <span className="hk-slogan">{config.slogan}</span>
        </p>
        <p className="eyebrow">
          Day {stats.daysTraded} · Status: {status.word} {status.emoji}
        </p>
        <h1 className="hero-title">{config.tagline}</h1>
        <p className="mega-figure">{signedMoney(cumTotal)}</p>
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
          <Link className="btn ghost" to={`/stake${search}`}>
            💵 The stake
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
            <p className="cd-num">{countdown.winningDays}</p>
            <p className="cd-label">
              winning days to your first {money(countdown.withdrawalTotal)}
            </p>
            <p className="cd-sub">
              {countdown.evalPassed ? 'Eval passed — funded and counting. ' : ''}
              At +{money(countdown.winAmount)} a day, that's all that stands between here and the payout. Every green
              day ticks it down; every −{money(Math.abs(config.rules.dailyLossLockout))} day pushes it back.
              {latest && latest.pnl > 0 && (
                <>
                  {' '}
                  <span className="cd-moved">Yesterday moved it −{(Math.round(countdown.movedToday * 10) / 10)}.</span>
                </>
              )}
            </p>
          </div>
        )}
      </section>

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
            <p className="fact-num">{config.accounts}</p>
            <p className="fact-label">$50K eval accounts running in parallel</p>
          </div>
          <div className="fact">
            <p className="fact-num">{money(investmentTotal(config))}</p>
            <p className="fact-label">Total stake — all-in cost of every eval</p>
          </div>
          <div className="fact">
            <p className="fact-num">{money(config.milestones.withdrawalPerAccount * config.accounts)}</p>
            <p className="fact-label">First withdrawal target across all accounts</p>
          </div>
        </div>
      </section>

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
              Same setups, same entries, copied to every account. Roughly {Math.round(config.rules.assumedWinRate * 100)}%
              of days end green — the math does the rest.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="section-eyebrow">The roadmap</p>
        <h2 className="section-title">Three checkpoints to the first {money(config.milestones.withdrawalPerAccount * config.accounts)}.</h2>
        <Milestones milestones={milestones} stats={stats} />
      </section>

      <section className="section">
        <p className="section-eyebrow">Follow {config.handle}</p>
        <h2 className="section-title">Watch it happen, live and unfiltered.</h2>
        <p className="section-copy">
          Same handle everywhere — <strong>{config.handle}</strong> on YouTube and Instagram. {config.slogan}
        </p>
        <SocialCards socials={config.socials} />
      </section>
    </div>
  )
}
