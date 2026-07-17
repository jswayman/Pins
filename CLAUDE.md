# Pins Golf Pool

Golf pool app. Host creates a pool for a PGA Tour tournament; players pick 10 golfers; highest combined earnings wins.

**Live URL:** pins.yourgamespot.com
**GitHub:** jswayman/Pins

---

## Architecture

```
Vercel (React + Vite SPA)  ←→  Railway (shared GameGrid server)
client/                          GameGrid/server/pins/
                                          ↓
                                 Railway PostgreSQL (shared DB)
                                 pins_* tables
```

- Frontend: `client/` — React 19 + Vite, **no React Router**, screen state in `App.jsx`
- Backend: `../GameGrid/server/pins/` — Express router mounted at `/api/pins/*`
- Auth: shared `/api/auth/*` routes (same JWT_SECRET), token stored as `pins_token`
- SSO: `ygs_token` domain cookie (same as GameGrid/GameNight/GridIron)

---

## Dev Commands

```bash
# Frontend
cd client && npm run dev   # http://localhost:5173 (proxies /api → :3001)

# Backend — run from GameGrid's server directory
cd ../GameGrid/server && node --watch index.js
```

---

## Deployment

> ⚠️ Vercel is NOT wired to this git repo. Always deploy manually:

```bash
cd Pins/client
npx vercel --prod
```

Backend: push changes to GameGrid repo → manually redeploy Railway `server` service.

---

## Golf Data

- **ESPN API** (free, no key): `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard`
  - Provides: tournament list, golfer field, live positions, score-to-par
  - Does NOT provide: earnings/prize money
- **Earnings calculation**: Admin sets `prize_purse_cents` per tournament; app uses the standard PGA payout table (hardcoded in `server/pins/db.js`) to calculate earnings by position
- **Polling**: `server/pins/poller.js` polls ESPN every 5 min for active tournaments (configurable via `PINS_POLL_SECONDS`)
- **Ties**: tied golfers share the combined earnings of their tied positions equally (standard PGA rule)

---

## Key Backend Files

| File | Purpose |
|---|---|
| `../GameGrid/server/pins/index.js` | All `/api/pins/*` Express routes |
| `../GameGrid/server/pins/db.js` | DB schema migrations + PGA payout table + `calcEarnings()` |
| `../GameGrid/server/pins/espnGolf.js` | ESPN golf API helpers |
| `../GameGrid/server/pins/poller.js` | Auto-refresh active tournament scores every 5 min |

## Key Frontend Files

| File | Purpose |
|---|---|
| `client/src/App.jsx` | Root component, screen state router |
| `client/src/api/index.js` | All fetch calls to backend |
| `client/src/hooks/useAuth.jsx` | Auth context (pins_token) |
| `client/src/components/styles.js` | All inline styles (S object + C color tokens) |
| `client/src/components/HomeScreen.jsx` | My pools + browse + join by code |
| `client/src/components/CreatePoolScreen.jsx` | Create a pool for a tournament |
| `client/src/components/PickEntryScreen.jsx` | Pick 10 golfers from field |
| `client/src/components/LeaderboardScreen.jsx` | Live pool standings |
| `client/src/components/HostDashboard.jsx` | Lock picks, payment tracker, payout report |
| `client/src/components/AdminScreen.jsx` | Sync tournaments, set prize purse |

---

## DB Tables

| Table | Purpose |
|---|---|
| `pins_tournaments` | PGA Tour events (synced from ESPN) |
| `pins_golfer_scores` | Per-tournament golfer positions + calculated earnings |
| `pins_pools` | Pool instances created by hosts |
| `pins_entries` | Player picks (10 golfer IDs) + total earnings |
| `pins_payments` | Host payment tracking (cash-based, manual) |

---

## Admin Workflow (you)

1. In app go to `/admin` or tap Admin button (admin user only)
2. Click "Sync Tournaments from ESPN" to import the season schedule
3. For each tournament, click Edit → enter Prize Purse (in cents, e.g. `900000000` = $9M)
4. Click "↺ Refresh" to pull live standings and recalculate all pool earnings

---

## Host Workflow

1. Create pool → select tournament, set entry fee and payout split
2. Share the 6-character join code with players
3. Lock picks before the tournament starts
4. Host Dashboard → Payments tab → mark entries as paid
5. Host Dashboard → Payout Report → see who won and how much to pay out

---

## Safety Rules

- **Never** modify the `users` table without coordinating with GameGrid/GameNight/GridIron
- **Never** push to Railway without testing schema migrations locally first
- **Ask before** changing the PGA payout percentage table in `server/pins/db.js` (affects all pool earnings)
- Deploy frontend with `npx vercel --prod` from `Pins/client/` — git push does NOT auto-deploy
