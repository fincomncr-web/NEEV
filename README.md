# NEEV — New-age Equity Evaluation & Valuation

NEEV is a perpetual, student-managed Indian equity research and portfolio-management initiative operated through Finception at Great Lakes Institute of Management, Gurgaon.

The website is deliberately designed as a research and governance record, not as a public investment-advice platform.

## Governing mandate

The NEEV Fund Charter is the governing source of truth. It defines the investment universe, 3–5 year horizon, research process, valuation framework, portfolio construction rules, risk limits, Investment Committee process and monitoring cadence.

Key portfolio controls include:

- India-only listed equity universe
- 3–5 year investment horizon
- 15–25 holdings at full deployment
- 8% maximum initial position
- 10% maximum individual security exposure
- 30% maximum sector exposure
- 0–5% cash range
- Nifty 500 TRI as the governing benchmark
- no leverage; derivatives are not core strategy

## Institutional data model

Production portfolio data is controlled in Supabase.

Book of record:

Investment Case → IC Decision → Transaction Ledger → Cash Ledger → Derived Holdings → Valuation/NAV → Performance & Risk → Public Reporting

The transaction ledger is the source of truth for positions. Holdings are derived rather than manually overwritten. Trades require an approved IC decision. Decision and trade records are audit-controlled and are not destructively deleted.

Research documents have controlled type, issue, version and publication-status metadata. Withdrawn documents remain in the record.

## Performance controls

The site does not present a benchmark-relative result until a verified Nifty 500 Total Return Index series is available and date-aligned with NEEV valuation observations.

Published performance is based only on approved valuation history. Annualized volatility is calculated only when the observation frequency supports the stated annualization. External flows, dividends, corporate actions and transaction costs require controlled ledger history before they are incorporated into institutional performance reporting.

## Market data

Equity quotes are market-data inputs for display and monitoring. Quote timestamps are retained where the provider supplies them. Missing prices are disclosed rather than silently treated as current market values.

## Research & Library

- NEEV Research contains recurring monthly sector research.
- NEEV Library contains formal non-monthly documents such as investment memos, IC records, methodology, performance reports and disclosures.
- Research documents are organized by sector without creating unnecessary duplicate pages.

## Development

npm install
npm run dev

The application is deployed through Vercel from the main branch.

## Important status

NEEV is an academic/student-managed initiative. It is not a SEBI-registered mutual fund, PMS, AIF, investment adviser or broker, and website content is not a solicitation or personalized investment advice.
