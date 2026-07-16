const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function money(v) {
  return usd.format(Math.round(v))
}

export function signedMoney(v) {
  const r = Math.round(v)
  if (r > 0) return `+${usd.format(r)}`
  if (r < 0) return `−${usd.format(Math.abs(r))}`
  return usd.format(0)
}

export function pct(v, digits = 0) {
  return `${(v * 100).toFixed(digits)}%`
}

export function compactMoney(v) {
  const abs = Math.abs(v)
  const sign = v < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sign}$${trimZero((abs / 1_000_000).toFixed(1))}M`
  if (abs >= 1_000) return `${sign}$${trimZero((abs / 1_000).toFixed(1))}K`
  return `${sign}$${Math.round(abs)}`
}

function trimZero(s) {
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function shortDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// Add N business days (skip Sat/Sun) to a date, returning a new Date.
export function addBusinessDays(date, n) {
  const d = new Date(date.getTime())
  let added = 0
  while (added < n) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return d
}

export function monthDay(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function days(v) {
  if (v < 0.05) return 'less than a tenth of a day'
  const r = Math.round(v * 10) / 10
  const label = r === 1 ? 'day' : 'days'
  return `${r % 1 === 0 ? r : r.toFixed(1)} ${label}`
}
