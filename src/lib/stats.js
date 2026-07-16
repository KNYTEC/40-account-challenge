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
  const payoutTarget = evalTarget + milestones.fundedProfitForPayout
  const withdrawalTotal = milestones.withdrawalPerAccount * accounts
  const etaDays = (remaining) =>
    remaining <= 0 ? 0 : Math.ceil(remaining / stats.pace)

  const evalPct = clamp01(cum / evalTarget)
  const fundedProgress = Math.max(0, cum - evalTarget)
  const payoutPct = clamp01(fundedProgress / milestones.fundedProfitForPayout)

  return [
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
      key: 'payout',
      title: 'Unlock first payout',
      subtitle: `${moneyish(milestones.fundedProfitForPayout)} funded profit per account`,
      pct: payoutPct,
      done: cum >= payoutTarget,
      locked: cum < evalTarget,
      valueText: `${moneyish(Math.min(fundedProgress, milestones.fundedProfitForPayout))} of ${moneyish(milestones.fundedProfitForPayout)}`,
      etaDays: etaDays(payoutTarget - cum),
    },
    {
      key: 'withdrawal',
      title: 'First withdrawal',
      subtitle: `${moneyish(milestones.withdrawalPerAccount)} × ${accounts} accounts = ${moneyish(withdrawalTotal)}`,
      pct: payoutPct,
      done: cum >= payoutTarget,
      locked: cum < evalTarget,
      valueText: `${moneyish(Math.round(payoutPct * withdrawalTotal))} of ${moneyish(withdrawalTotal)} unlocked`,
      etaDays: etaDays(payoutTarget - cum),
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

// The big motivational countdown: how many winning days (green days at the
// +$250 daily max) still stand between today and the first payout / $60K.
// Recomputes from cumulative P&L, so every new day moves it.
export function computeCountdown(stats, config) {
  const { accounts, milestones, rules } = config
  const payoutTargetPerAccount = milestones.evalPassPerAccount + milestones.fundedProfitForPayout
  const remaining = payoutTargetPerAccount - stats.cumPerAccount
  const winAmount = rules.dailyWinLockout
  const winningDays = remaining <= 0 ? 0 : Math.ceil(remaining / winAmount)

  // How much a single winning day just moved the counter — for the "−1 today"
  // style motivation. Positive when the latest day was green.
  let movedToday = 0
  if (stats.latest) movedToday = stats.latest.pnl / winAmount

  return {
    unlocked: remaining <= 0,
    winningDays,
    winAmount,
    withdrawalTotal: milestones.withdrawalPerAccount * accounts,
    remainingPerAccount: Math.max(0, remaining),
    movedToday,
    evalPassed: stats.cumPerAccount >= milestones.evalPassPerAccount,
  }
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
