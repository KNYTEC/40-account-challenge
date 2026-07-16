# MNQDegen — 40 Account Challenge

**Live at [mnqdegen.com](https://mnqdegen.com)** — the home of MNQDegen's
trading challenge (and anything else built later).

Public, manually updated P&L tracker for the MNQDegen 40 Account Challenge:
one trader running 40 prop firm evaluations in parallel, copying the same
trades to every account, with hard daily lockouts (+$250 win / −$100 loss
per account, per day). The mission: **34 winning days → $100K in payouts**,
degenerate with discipline.

**There is no API and no backend.** The daily result is entered by hand into
a JSON file in this repo. Every push to `main` auto-deploys on Vercel and
updates mnqdegen.com.

## How a daily update works

1. Tell Claude (or edit yourself) the day's P&L for the representative
   account, e.g. *"July 16: +250"* or *"today was −100, choppy open"*.
2. That becomes one line in `src/data/entries.json`:

   ```json
   { "date": "2026-07-16", "pnl": 250, "note": "optional note" }
   ```

   - `pnl` is the **per-account** number. The dashboard multiplies by 40.
   - `note` is optional and shows up in the history table.
3. Commit + push → Vercel redeploys → the public dashboard updates.

**Corrections:** add the same date again with the right number — the latest
entry for a date wins. (Or just edit the existing line.)

## The site

- **`/` Live status (home)** — landing page: day counter + status word,
  giant cumulative P&L, today's result, motivational callout, the mission /
  rules / roadmap sections, and follow links (YouTube + Instagram).
- **`/calendar`** — daily P&L calendar, month by month, trading-journal
  style (green/red day cells with lockout badges and month totals).
- **`/stats`** — stat tiles, equity curve, daily results chart, and the
  full history table (the source of truth).
- **`/costs`** — full transparency: per-firm eval cost table, cash
  in / cash out, net position, and the challenge rules.

Socials are configured in `src/data/config.json` → `socials`
(YouTube + Instagram, currently `@mnqdegen`).

### Demo preview

Append `?demo=1` to the URL to preview the dashboard with sample data
(clearly bannered). The real tracker starts empty at Day 0.

## Configuration

All challenge parameters live in `src/data/config.json`: account count,
lockout amounts, milestone targets, baseline pace ($250/day, used for
projections until real history exists), socials, and a `payouts` array for
recording real withdrawals as they happen.

The costs page's firm table is driven by `investment.firms` — one row per
prop firm. The total cost shown across the site is computed from these
rows, so updating them updates everything. Set `breakdownFinal: true` once
the exact costs are in to drop the "being finalized" note:

```json
"firms": [
  { "firm": "Topstep", "accounts": 10, "costPerAccount": 49 },
  { "firm": "Apex", "accounts": 15, "costPerAccount": 35 }
]
```

```json
"payouts": [{ "date": "2026-08-15", "amount": 60000, "label": "First payout cycle" }]
```

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # production build (dist/)
```

Built with Vite + React. Deploys to Vercel with zero config (framework
auto-detected).
