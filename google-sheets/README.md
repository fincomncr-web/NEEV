# Portfolio Google Sheet setup

This makes the **Portfolio** page and **Decision Register** read directly from a
Google Sheet your team edits — no code, no passcode, just spreadsheet cells. The
site polls the published CSV every 5 minutes and always shows live prices from
Yahoo Finance on top of whatever holdings the sheet lists.

## 1. Create the sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Rename it (e.g. "Finception Portfolio").
3. Rename the first tab to **Holdings**. Import `holdings-template.csv` into it:
   File → Import → Upload → select `holdings-template.csv` → **Replace current sheet**.
4. Add a second tab (bottom-left `+`), name it **Decisions**. Import
   `decisions-template.csv` into it the same way.
5. Delete the example row in each tab once you have real data, or just start
   adding new rows below it.

### Holdings columns

| Column | Required | Notes |
|---|---|---|
| Symbol | yes | Yahoo Finance ticker, e.g. `HDFCBANK.NS`, `TCS.NS` (NSE) or `.BO` for BSE |
| Company Name | no | Falls back to the symbol if blank |
| Sector | yes | Use exactly one of the 5 mandated sectors: `Banking & Financial Services`, `IT`, `Healthcare`, `FMCG`, `Renewable Energy` |
| Quantity | yes | Number of shares |
| Avg Cost | yes | Average buy price per share |
| Entry Date | yes | `YYYY-MM-DD` |
| Status | no | `active` (default) or `exited` |
| Exit Date | only if exited | `YYYY-MM-DD` |
| Exit Price | only if exited | Price per share at exit |

Column **order doesn't matter** — the site matches headers by keyword. You can
add extra columns freely (e.g. `Live Price` with `=GOOGLEFINANCE(A2,"price")`
for your own reference) — anything not listed above is ignored.

### Decisions columns

| Column | Required | Notes |
|---|---|---|
| Date | yes | `YYYY-MM-DD` |
| Sector | yes | One of the 5 mandated sectors |
| Company Name | no | |
| Symbol | no | |
| Decision | yes | `BUY`, `HOLD`, or `SELL` |
| Rationale | yes | Shown in the Decision Register |
| Vote Count | no | e.g. `6-0` |

Newest rows can go anywhere — the site sorts by Date automatically.

## 2. Publish each tab as CSV

For **both** the Holdings tab and the Decisions tab:

1. Open the tab.
2. File → Share → **Publish to web**.
3. In the first dropdown, choose the specific sheet (**Holdings** or
   **Decisions**) — not "Entire document".
4. In the second dropdown, choose **Comma-separated values (.csv)**.
5. Click **Publish** → confirm.
6. Copy the URL it gives you.

You'll end up with two different CSV URLs, one per tab.

## 3. Connect it to the site

Paste the two URLs into `.env.local` at the project root:

```
PORTFOLIO_HOLDINGS_SHEET_CSV_URL=<the Holdings tab CSV link>
PORTFOLIO_DECISIONS_SHEET_CSV_URL=<the Decisions tab CSV link>
```

Restart the dev server (or redeploy) after editing `.env.local`. From then on:

- **`/portfolio`** and the homepage dashboard read holdings from the sheet —
  current NAV, total return, and deployed capital are computed live from those
  rows plus real-time market quotes (see `src/lib/fund-engine.ts`).
- **Decision Register** (`/portfolio/register` and the homepage preview) reads
  straight from the Decisions tab.
- If either env var is left blank, that section falls back to the matching tab
  in `/portfolio/admin` (Holdings / Decisions), so nothing breaks if you haven't
  set the sheet up yet.
- The NAV *history* chart can also be sheet-driven — see the
  `FUND_NAV_SHEET_CSV_URL` comment already in `.env.local` — that's a separate,
  optional third tab if you want the trend line sourced from the sheet too.

## Sharing access with your team

"Publish to web" makes the data **publicly readable** (needed for the site to
fetch it) but editing still requires being a collaborator: Share → add your Core
Committee's email addresses with **Editor** access. Anyone you add can edit
cells directly — no login to the website required.
