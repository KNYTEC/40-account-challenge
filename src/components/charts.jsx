import { useEffect, useMemo, useRef, useState } from 'react'
import { longDate, money, shortDate, signedMoney } from '../lib/format'

function useMeasure() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

function niceTicks(min, max, count = 4) {
  if (max === min) max = min + 1
  const step0 = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(step0))
  const norm = step0 / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag
  const start = Math.ceil(min / step) * step
  const ticks = []
  for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(Math.round(v * 1e6) / 1e6)
  return ticks
}

function xTickIndices(n, want = 5) {
  if (n <= want) return [...Array(n).keys()]
  const idx = new Set()
  for (let k = 0; k < want; k++) idx.add(Math.round((k * (n - 1)) / (want - 1)))
  return [...idx].sort((a, b) => a - b)
}

const M = { top: 16, right: 84, bottom: 30, left: 60 }
const PLOT_H = 220

function useHoverIndex(n) {
  const [hover, setHover] = useState(null)
  const clamp = (i) => Math.max(0, Math.min(n - 1, i))
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setHover((h) => clamp((h ?? n - 1) - 1))
    else if (e.key === 'ArrowRight') setHover((h) => clamp((h ?? n - 1) + 1))
    else return
    e.preventDefault()
  }
  return { hover, setHover, onKeyDown }
}

function Tooltip({ x, y, width, date, rows }) {
  const flip = x > width / 2
  return (
    <div
      className="tooltip"
      style={{
        left: x,
        top: y,
        transform: `translate(${flip ? 'calc(-100% - 12px)' : '12px'}, -50%)`,
      }}
    >
      <div className="t-date">{date}</div>
      {rows.map((r) => (
        <div className="t-row" key={r.label}>
          <span className="t-key" style={{ color: r.color }} />
          <span className="t-val">{r.value}</span>
          <span className="t-label">{r.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Cumulative challenge P&L (per-account × 40) as an area + line. */
export function CumulativeChart({ rows }) {
  const [ref, width] = useMeasure()
  const n = rows.length
  const { hover, setHover, onKeyDown } = useHoverIndex(n)

  const geom = useMemo(() => {
    if (!width || !n) return null
    const innerW = Math.max(10, width - M.left - M.right)
    const values = rows.map((r) => r.cumTotal)
    const lo = Math.min(0, ...values)
    const hi = Math.max(0, ...values)
    const pad = (hi - lo) * 0.08 || 1
    const yMin = lo === 0 ? 0 : lo - pad
    const yMax = hi + pad
    const y = (v) => M.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H
    const x = (i) => (n === 1 ? M.left + innerW / 2 : M.left + (i / (n - 1)) * innerW)
    return { innerW, x, y, yMin, yMax, ticks: niceTicks(yMin, yMax, 4) }
  }, [width, rows, n])

  if (!n) return null

  const height = M.top + PLOT_H + M.bottom

  let body = null
  if (geom) {
    const { x, y, ticks } = geom
    const pts = rows.map((r, i) => [x(i), y(r.cumTotal)])
    const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join('')
    const area = `${line}L${pts[n - 1][0]},${y(0)}L${pts[0][0]},${y(0)}Z`
    const hi = hover ?? null
    const last = rows[n - 1]

    const toIndex = (clientX, svg) => {
      const rect = svg.getBoundingClientRect()
      const px = clientX - rect.left
      if (n === 1) return 0
      return Math.max(0, Math.min(n - 1, Math.round(((px - M.left) / geom.innerW) * (n - 1))))
    }

    body = (
      <>
        <svg
          height={height}
          role="img"
          aria-label={`Cumulative challenge P&L over ${n} trading days, currently ${money(last.cumTotal)}.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onFocus={() => setHover(n - 1)}
          onBlur={() => setHover(null)}
          onPointerMove={(e) => setHover(toIndex(e.clientX, e.currentTarget))}
          onPointerLeave={() => setHover(null)}
          style={{ outline: 'none' }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={M.left + geom.innerW}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? 'var(--baseline)' : 'var(--grid)'}
                strokeWidth="1"
              />
              <text className="axis-text" x={M.left - 8} y={y(t) + 3.5} textAnchor="end">
                {t.toLocaleString('en-US')}
              </text>
            </g>
          ))}
          {xTickIndices(n).map((i) => (
            <text
              key={i}
              className="axis-text"
              x={x(i)}
              y={M.top + PLOT_H + 18}
              textAnchor="middle"
            >
              {shortDate(rows[i].date)}
            </text>
          ))}
          <path d={area} fill="var(--accent)" opacity="0.1" />
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {hi != null && (
            <>
              <line
                x1={pts[hi][0]}
                x2={pts[hi][0]}
                y1={M.top}
                y2={M.top + PLOT_H}
                stroke="var(--baseline)"
                strokeWidth="1"
              />
              <circle cx={pts[hi][0]} cy={pts[hi][1]} r="5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
            </>
          )}
          <circle
            cx={pts[n - 1][0]}
            cy={pts[n - 1][1]}
            r="4.5"
            fill="var(--accent)"
            stroke="var(--surface)"
            strokeWidth="2"
          />
          <text className="end-label" x={pts[n - 1][0] + 10} y={pts[n - 1][1] + 4}>
            {money(last.cumTotal)}
          </text>
        </svg>
        {hi != null && (
          <Tooltip
            x={pts[hi][0]}
            y={pts[hi][1]}
            width={width}
            date={`${longDate(rows[hi].date)} — day ${rows[hi].day}`}
            rows={[
              { label: 'cumulative (×40)', value: money(rows[hi].cumTotal), color: 'var(--accent)' },
              {
                label: 'that day (×40)',
                value: signedMoney(rows[hi].dailyTotal),
                color: rows[hi].pnl >= 0 ? 'var(--good)' : 'var(--bad)',
              },
            ]}
          />
        )}
      </>
    )
  }

  return (
    <div className="chart-box" ref={ref}>
      {body}
    </div>
  )
}

/** Daily challenge P&L (per-account × 40) as diverging bars around zero. */
export function DailyChart({ rows }) {
  const [ref, width] = useMeasure()
  const n = rows.length
  const { hover, setHover, onKeyDown } = useHoverIndex(n)

  const geom = useMemo(() => {
    if (!width || !n) return null
    const innerW = Math.max(10, width - M.left - M.right)
    const values = rows.map((r) => r.dailyTotal)
    const lo = Math.min(0, ...values)
    const hi = Math.max(0, ...values)
    const pad = (hi - lo) * 0.08 || 1
    const yMin = lo < 0 ? lo - pad : 0
    const yMax = hi > 0 ? hi + pad : 0
    const y = (v) => M.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H
    const band = innerW / n
    const barW = Math.max(2, Math.min(24, band - 2))
    return { innerW, y, band, barW, ticks: niceTicks(yMin, yMax, 4) }
  }, [width, rows, n])

  if (!n) return null

  const height = M.top + PLOT_H + M.bottom

  let body = null
  if (geom) {
    const { y, band, barW, ticks } = geom
    const y0 = y(0)
    const xc = (i) => M.left + band * i + band / 2

    const barPath = (i) => {
      const v = rows[i].dailyTotal
      const xl = xc(i) - barW / 2
      const xr = xl + barW
      const yv = y(v)
      const h = Math.abs(y0 - yv)
      const r = Math.min(4, barW / 2, h)
      if (h < 0.5) return `M${xl},${y0 - 0.5}H${xr}V${y0 + 0.5}H${xl}Z`
      if (v >= 0) {
        return `M${xl},${y0}V${yv + r}Q${xl},${yv} ${xl + r},${yv}H${xr - r}Q${xr},${yv} ${xr},${yv + r}V${y0}Z`
      }
      return `M${xl},${y0}V${yv - r}Q${xl},${yv} ${xl + r},${yv}H${xr - r}Q${xr},${yv} ${xr},${yv - r}V${y0}Z`
    }

    body = (
      <>
        <svg
          height={height}
          role="img"
          aria-label={`Daily challenge P&L across ${n} trading days.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onFocus={() => setHover(n - 1)}
          onBlur={() => setHover(null)}
          onPointerLeave={() => setHover(null)}
          style={{ outline: 'none' }}
        >
          {ticks.map((t) => (
            <g key={t}>
              {t !== 0 && (
                <line
                  x1={M.left}
                  x2={M.left + geom.innerW}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="var(--grid)"
                  strokeWidth="1"
                />
              )}
              <text className="axis-text" x={M.left - 8} y={y(t) + 3.5} textAnchor="end">
                {t.toLocaleString('en-US')}
              </text>
            </g>
          ))}
          {xTickIndices(n).map((i) => (
            <text
              key={i}
              className="axis-text"
              x={xc(i)}
              y={M.top + PLOT_H + 18}
              textAnchor="middle"
            >
              {shortDate(rows[i].date)}
            </text>
          ))}
          {rows.map((r, i) => (
            <path
              key={r.date}
              d={barPath(i)}
              fill={r.pnl >= 0 ? 'var(--good)' : 'var(--bad)'}
              fillOpacity={hover === i ? 1 : 0.9}
              stroke={hover === i ? 'var(--text-primary)' : 'none'}
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          ))}
          <line
            x1={M.left}
            x2={M.left + geom.innerW}
            y1={y0}
            y2={y0}
            stroke="var(--baseline)"
            strokeWidth="1"
          />
          {rows.map((r, i) => (
            <rect
              key={r.date}
              x={M.left + band * i}
              y={M.top}
              width={band}
              height={PLOT_H}
              fill="transparent"
              onPointerMove={() => setHover(i)}
            />
          ))}
        </svg>
        {hover != null && (
          <Tooltip
            x={xc(hover)}
            y={y(rows[hover].dailyTotal / 2)}
            width={width}
            date={`${longDate(rows[hover].date)} — day ${rows[hover].day}`}
            rows={[
              {
                label: 'per account',
                value: signedMoney(rows[hover].pnl),
                color: rows[hover].pnl >= 0 ? 'var(--good)' : 'var(--bad)',
              },
              {
                label: 'all 40 accounts',
                value: signedMoney(rows[hover].dailyTotal),
                color: rows[hover].pnl >= 0 ? 'var(--good)' : 'var(--bad)',
              },
            ]}
          />
        )}
      </>
    )
  }

  return (
    <div className="chart-box" ref={ref}>
      {body}
    </div>
  )
}
