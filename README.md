# 40 Account Challenge — Live P&L Dashboard

Public, manually updated P&L tracker for the MNQDegen 40 Account Challenge:
one trader running 40 prop firm evaluations in parallel, copying the same
trades to every account, with hard daily lockouts (+$250 win / −$100 loss
per account, per day).

**There is no API and no backend.** The daily result is entered by hand into
a JSON file in this repo. Every push redeploys the site on Vercel.

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

## What the dashboard shows

- **Hero + stat tiles** — cumulative challenge P&L (×40), today's result,
  win rate, streaks, days traded.
- **Milestones** — progress bars toward eval pass ($3,000/account), first
  payout unlock ($4,000 funded profit/account), and the $60,000 first
  withdrawal ($1,500 × 40), with estimated trading days remaining.
- **Motivational callout** — dynamic copy based on the latest day
  (win lockout, loss lockout, green/red day).
- **Charts** — equity curve and daily results, with hover tooltips.
- **Transparency panel** — the ~$3,800 stake, withdrawals to date, net cash
  position, and the challenge rules.
- **History table** — every recorded day, the source of truth.

### Demo preview

Append `?demo=1` to the URL to preview the dashboard with sample data
(clearly bannered). The real tracker starts empty at Day 0.

## Configuration

All challenge parameters live in `src/data/config.json`: account count,
lockout amounts, milestone targets, baseline pace ($250/day, used for
projections until real history exists), the investment breakdown shown in
the transparency panel, and a `payouts` array for recording real
withdrawals as they happen:

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
