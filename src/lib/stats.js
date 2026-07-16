// All derived numbers for the dashboard. Pure functions — entries in, stats out.
//
// The data model: one entry per trading day, `pnl` is the P&L of the single
// representative account. Every account copies the same trades, so the
// challenge-wide number is always pnl × accounts.

// Later entries for the same date overwrite earlier ones — that is the
// correction mechanism (re-report a date to fix it).
export function normalizeEntries(entries) {
  const byDate = new Map()
  for (const e of entries) byDate.set(e.date, e)
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function computeStats(rawEntries, config) {
  const entries = normalizeEntries(rawEntries)
  const { accounts } = config

  let cum = 0
  const rows = entries.map((e, i) => {
    cum += e.pnl
    return {
      ...e,
      day: i + 1,
      dailyTotal: e.pnl * accounts,
      cumPerAccount: cum,
      cumTotal: cum * accounts,
      hitWinLock: e.pnl >= config.rules.dailyWinLockout,
      hitLossLock: e.pnl <= config.rules.dailyLossLockout,
    }
  })

  const daysTraded = rows.length
  const wins = rows.filter((r) => r.pnl > 0).length
  const losses = rows.filter((r) => r.pnl < 0).length
  const winRate = daysTraded > 0 ? wins / daysTraded : null

  // Current streak: consecutive green (+) or red (−) days ending today.
  let streak = 0
  for (let i = rows.length - 1; i >= 0; i--) {
    const sign = Math.sign(rows[i].pnl)
    if (sign === 0) break
    if (streak === 0) streak = sign
    else if (Math.sign(streak) === sign) streak += sign
    else break
  }

  let bestWinStreak = 0
  let run = 0
  for (const r of rows) {
    run = r.pnl > 0 ? run + 1 : 0
    if (run > bestWinStreak) bestWinStreak = run
  }

  const cumPerAccount = daysTraded ? rows[daysTraded - 1].cumPerAccount : 0
  const avgDaily = daysTraded ? cumPerAccount / daysTraded : null

  // Pace used for "est. N trading days" projections. The published estimates
  // assume the +$250 win-lockout pace; once there is enough real history and
  // it is positive, project from the actual average instead.
  const usingActualPace = daysTraded >= 3 && avgDaily > 0
  const pace = usingActualPace ? avgDaily : config.baselineDailyPace

  return {
    rows,
    latest: daysTraded ? rows[daysTraded - 1] : null,
    daysTraded,
    wins,
    losses,
    winRate,
    streak,
    bestWinStreak,
    cumPerAccount,
    cumTotal: cumPerAccount * accounts,
    avgDaily,
    pace,
    usingActualPace,
  }
}

export function computeMilestones(stats, config) {
  const { accounts, milestones } = config
  const cum = stats.cumPerAccount
  const evalTarget = milestones.evalPassPerAccount
  const model = computePayoutModel(config)
  const payout1Target = evalTarget + milestones.fundedProfitForPayout // $7,000/acct
  // Payout #1 withdraws each firm's max at the $4,000 gate; payout #2 fires
  // when the slowest accounts have rebuilt to the same gate.
  const payout2Target = payout1Target + model.maxRebuild // $9,000/acct
  const payout1Total = model.perCycle // $65,000 to the trader
  const payout2Total = model.total // $130,000 across both cycles
  const etaDays = (remaining) =>
    remaining <= 0 ? 0 : Math.ceil(remaining / stats.pace)

  const bufferTarget = evalTarget + (milestones.bufferPerAccount || 0) // $5,000/acct
  const evalPct = clamp01(cum / evalTarget)
  const fundedProgress = Math.max(0, cum - evalTarget)
  const bufferPct = clamp01(fundedProgress / (milestones.bufferPerAccount || 1))
  const payout1Pct = clamp01(fundedProgress / milestones.fundedProfitForPayout)
  const payout2Span = payout2Target - payout1Target
  const payout2Pct = clamp01((cum - payout1Target) / payout2Span)

  return [
    {
      key: 'start',
      title: 'Evals purchased — challenge started',
      subtitle: `${accounts} × $50K evaluations across 5 firms — ${moneyish(investmentTotal(config))} deployed`,
      pct: 1,
      done: true,
      locked: false,
      valueText: `${moneyish(investmentTotal(config))} in · ${accounts} accounts live`,
      etaDays: 0,
    },
    {
      key: 'eval',
      title: 'Pass evaluation',
      subtitle: `${moneyish(evalTarget)} profit per account`,
      pct: evalPct,
      done: cum >= evalTarget,
      locked: false,
      valueText: `${moneyish(Math.max(0, Math.min(cum, evalTarget)))} of ${moneyish(evalTarget)}`,
      etaDays: etaDays(evalTarget - cum),
    },
    {
      key: 'buffer',
      title: 'Buffer built',
      subtitle: `${moneyish(milestones.bufferPerAccount)} cushion per funded account`,
      pct: bufferPct,
      done: cum >= bufferTarget,
      locked: cum < evalTarget,
      valueText: `${moneyish(Math.min(fundedProgress, milestones.bufferPerAccount))} of ${moneyish(milestones.bufferPerAccount)} buffer`,
      etaDays: etaDays(bufferTarget - cum),
    },
    {
      key: 'payout1',
      title: 'First payout',
      subtitle: `every account withdraws its firm's max at the ${moneyish(milestones.fundedProfitForPayout)} gate → ${moneyish(payout1Total)} to the trader`,
      pct: payout1Pct,
      done: cum >= payout1Target,
      locked: cum < bufferTarget,
      valueText: `${moneyish(Math.round(payout1Pct * payout1Total))} of ${moneyish(payout1Total)} unlocked`,
      etaDays: etaDays(payout1Target - cum),
    },
    {
      key: 'payout2',
      title: 'Second payout',
      subtitle: `rebuild to the ${moneyish(milestones.fundedProfitForPayout)} gate · +${moneyish(model.perCycle)} → ${moneyish(payout2Total)} total`,
      pct: payout2Pct,
      done: cum >= payout2Target,
      locked: cum < payout1Target,
      valueText: `${moneyish(payout2Total)} total · unlocks after ${model.rebuildDays} more winning days`,
      etaDays: etaDays(payout2Target - cum),
    },
  ]
}

// Total stake, computed from the per-firm rows so the whole site updates
// when the exact eval costs land in config.
export function investmentTotal(config) {
  const firms = config.investment.firms || []
  return firms.length
    ? firms.reduce((s, f) => s + f.accounts * f.costPerAccount, 0)
    : config.investment.total
}

// Real payout economics, derived from each firm's actual rules (config
// firms[].payout). At the $4K-profit gate every account withdraws its firm's
// max; the trader receives their share after the firm's split.
// - perCycle: what lands in the trader's pocket per payout cycle
// - maxRebuild: the largest per-account withdrawal — the wall moves together,
//   so payout #2 waits for the slowest accounts to rebuild to the $4K gate
export function computePayoutModel(config) {
  const firms = config.investment.firms || []
  let perCycle = 0
  let maxRebuild = 0
  for (const f of firms) {
    const w = f.payout?.maxWithdraw ?? 0
    perCycle += f.accounts * w * (f.payout?.traderShare ?? 1)
    maxRebuild = Math.max(maxRebuild, w)
  }
  return {
    perCycle, // $65,000
    total: perCycle * 2, // $130,000 across two cycles
    maxRebuild, // $2,000
    rebuildDays: Math.ceil(maxRebuild / config.rules.dailyWinLockout), // 8
  }
}

// The big motivational countdown: how many winning days (green days at the
// +$250 daily max) still stand between today and the FULL $130K in payouts.
// Assumes every next day is a win. Recomputes from cumulative P&L, so every
// new day moves it. Payout #1 ($65K) is a marker along the way.
export function computeCountdown(stats, config) {
  const { accounts, milestones, rules } = config
  const winAmount = rules.dailyWinLockout
  const cum = stats.cumPerAccount

  const model = computePayoutModel(config)
  const payout1TargetPerAccount = milestones.evalPassPerAccount + milestones.fundedProfitForPayout // $7,000
  // after each firm's max withdrawal, the slowest accounts rebuild $2,000
  // back to the same $4,000 gate
  const payout2TargetPerAccount = payout1TargetPerAccount + model.maxRebuild // $9,000

  const remaining = payout2TargetPerAccount - cum
  const winningDays = remaining <= 0 ? 0 : Math.ceil(remaining / winAmount)
  const totalWinningDays = Math.round(payout2TargetPerAccount / winAmount) // 35
  const bankedWinningDays = Math.max(0, Math.min(totalWinningDays, Math.round(cum / winAmount)))
  const progressPct = clamp01(cum / payout2TargetPerAccount)

  const payout1Total = model.perCycle // $65,000 to the trader
  const payout2Total = model.total // $130,000 across both cycles
  const payout1RemainingPerAccount = Math.max(0, payout1TargetPerAccount - cum)
  const payout1WinningDaysLeft =
    payout1RemainingPerAccount <= 0 ? 0 : Math.ceil(payout1RemainingPerAccount / winAmount)

  // How much a single winning day just moved the counter — for the "−1 today"
  // style motivation. Positive when the latest day was green.
  let movedToday = 0
  if (stats.latest) movedToday = stats.latest.pnl / winAmount

  return {
    unlocked: remaining <= 0,
    winningDays, // to the full $130K
    winAmount,
    totalWinningDays, // 35
    bankedWinningDays,
    progressPct,
    withdrawalTotal: payout2Total, // full $130K
    remainingPerAccount: Math.max(0, remaining),
    movedToday,
    evalPassed: cum >= milestones.evalPassPerAccount,
    payout1: {
      total: payout1Total,
      unlocked: cum >= payout1TargetPerAccount,
      winningDaysLeft: payout1WinningDaysLeft,
      pctOfBar: clamp01(payout1TargetPerAccount / payout2TargetPerAccount), // ~0.8 marker on the bar
    },
  }
}

// The current status word — shared by the hero, HUD frame, etc.
export function computeStatus(stats) {
  const { latest } = stats
  if (!latest) return { word: 'PRE-GAME', emoji: '🏁' }
  if (latest.hitWinLock) return { word: 'LOCKED IN', emoji: '🔒' }
  if (latest.pnl > 0) return { word: 'PRINTING', emoji: '💸' }
  if (latest.hitLossLock) return { word: 'DAMAGE CONTAINED', emoji: '🛡️' }
  if (latest.pnl < 0) return { word: 'MINOR SETBACK', emoji: '😤' }
  return { word: 'FLAT', emoji: '😴' }
}

// The motivational callout for the latest recorded day.
export function computeCallout(stats, config) {
  const { latest, pace } = stats
  if (!latest) {
    return {
      tone: 'neutral',
      title: 'Day 0 — the challenge begins soon.',
      body: `${config.accounts} accounts. Hard +$${config.rules.dailyWinLockout} win lockout, hard −$${Math.abs(config.rules.dailyLossLockout)} loss lockout, every single day. The first daily result lands here.`,
    }
  }

  const pnl = latest.pnl
  const daysMoved = Math.abs(pnl) / pace
  const totalToday = pnl * config.accounts

  if (latest.hitWinLock) {
    return {
      tone: 'good',
      title: `Win lockout hit: +$${pnl} per account.`,
      body: `That's ${fmtDays(daysMoved)} closer to the next payout — ${plusMoney(totalToday)} across all ${config.accounts} accounts today.`,
    }
  }
  if (pnl > 0) {
    return {
      tone: 'good',
      title: `Green day: +$${pnl} per account.`,
      body: `${plusMoney(totalToday)} across all ${config.accounts} accounts — ${fmtDays(daysMoved)} closer to the next milestone.`,
    }
  }
  if (latest.hitLossLock) {
    return {
      tone: 'bad',
      title: `Loss lockout did its job: −$${Math.abs(pnl)} per account.`,
      body: `Max damage contained. This only pushed the challenge back ~${fmtDays(daysMoved)}. Reset, and go again tomorrow.`,
    }
  }
  if (pnl < 0) {
    return {
      tone: 'bad',
      title: `Small setback: −$${Math.abs(pnl)} per account.`,
      body: `Only ~${fmtDays(daysMoved)} of progress given back — well inside the risk rules.`,
    }
  }
  return {
    tone: 'neutral',
    title: 'Flat day: $0.',
    body: 'Nothing gained, nothing lost. The challenge continues tomorrow.',
  }
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function moneyish(v) {
  return `$${Math.round(v).toLocaleString('en-US')}`
}

function plusMoney(v) {
  return `${v >= 0 ? '+' : '−'}${moneyish(Math.abs(v))}`
}

function fmtDays(v) {
  const r = Math.round(v * 10) / 10
  if (r < 0.1) return 'a tenth of a day'
  const n = r % 1 === 0 ? String(r) : r.toFixed(1)
  return `${n} ${r === 1 ? 'day' : 'days'}`
}
