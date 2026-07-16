import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import config from './data/config.json'
import realEntries from './data/entries.json'
import demoEntries from './data/demoEntries.json'
import { computeCallout, computeMilestones, computeStats } from './lib/stats.js'
import { SocialIcons, socialList } from './components/social.jsx'
import { Avatar } from './components/avatar.jsx'
import { Backdrop } from './components/fx/Backdrop.jsx'
import { HudFrame } from './components/fx/HudFrame.jsx'
import Home from './pages/Home.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import StakePage from './pages/StakePage.jsx'

const TITLES = {
  '/': '35 Winning Days to $100K',
  '/calendar': 'Daily P&L Calendar',
  '/stats': 'Full Stats & Charts',
  '/costs': 'Costs',
}

function currentTheme() {
  const saved = document.documentElement.dataset.theme
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function Shell() {
  const { pathname, search } = useLocation()
  const demo = new URLSearchParams(search).has('demo')
  const entries = demo ? demoEntries : realEntries

  const [theme, setTheme] = useState(currentTheme)
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* private mode — theme just won't persist */
    }
    setTheme(next)
  }

  useEffect(() => {
    document.title = `${TITLES[pathname] ?? 'Live'} — MNQDegen · ${config.challengeName}`
  }, [pathname])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const stats = useMemo(() => computeStats(entries, config), [entries])
  const milestones = useMemo(() => computeMilestones(stats, config), [stats])
  const callout = useMemo(() => computeCallout(stats, config), [stats])

  return (
    <>
      <Backdrop />
      <HudFrame stats={stats} />
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" to={`/${search}`}>
            <Avatar src={config.avatar} alt={config.brand} className="brand-avatar" />
            <span className="brand-text">
              <span className="brand-name">{config.brand}</span>
              <span className="brand-tag">{config.slogan}</span>
            </span>
          </Link>
          <nav className="nav" aria-label="Site">
            <NavLink to={`/${search}`} end>
              Status
            </NavLink>
            <NavLink to={`/calendar${search}`}>Calendar</NavLink>
            <NavLink to={`/stats${search}`}>Stats</NavLink>
            <NavLink to={`/costs${search}`}>Costs</NavLink>
          </nav>
          <div className="header-right">
            <SocialIcons socials={config.socials} />
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle color theme">
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>

      <main className="wrap">
        {demo && (
          <div className="demo-banner">
            Demo data — this is a preview with sample numbers. <Link to={pathname}>View the real tracker</Link>.
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home stats={stats} milestones={milestones} callout={callout} config={config} />} />
          <Route path="/calendar" element={<CalendarPage stats={stats} config={config} />} />
          <Route path="/stats" element={<StatsPage stats={stats} config={config} />} />
          <Route path="/costs" element={<StakePage stats={stats} config={config} />} />
          <Route path="/stake" element={<Navigate to={`/costs${search}`} replace />} />
          <Route
            path="*"
            element={<Home stats={stats} milestones={milestones} callout={callout} config={config} />}
          />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="foot-col">
            <Avatar src={config.avatar} alt={config.brand} className="foot-avatar" />
            <p className="foot-wordmark">{config.brand}</p>
            <p className="foot-slogan">{config.slogan}</p>
            <p className="foot-copy">
              The {config.challengeName} — one trader, {config.accounts} prop accounts, every dollar public. Updated
              after each trading day. Not financial advice; entertainment and documentation, not a recommendation.
            </p>
            <p className="foot-handle">{config.handle} everywhere</p>
          </div>
          <div className="foot-col">
            <p className="foot-head">Explore</p>
            <Link to={`/${search}`}>Live status</Link>
            <Link to={`/calendar${search}`}>Daily P&L calendar</Link>
            <Link to={`/stats${search}`}>Full stats & charts</Link>
            <Link to={`/costs${search}`}>Costs</Link>
          </div>
          <div className="foot-col">
            <p className="foot-head">Follow {config.handle}</p>
            {socialList(config.socials).map((s) => (
              <a key={s.key} href={config.socials[s.key]} target="_blank" rel="noreferrer">
                {s.label} — {s.short}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
