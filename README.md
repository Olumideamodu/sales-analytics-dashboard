# SalesPulse &mdash; Real-Time Sales Analytics Dashboard

A single-page, executive sales analytics dashboard built with pure vanilla HTML, CSS, and JavaScript. Zero external frameworks, zero CSS variables, zero backend infrastructure &mdash; powered entirely by browser Web Storage (`localStorage`) for real-time persistence.

## Features

- **Executive KPI Metrics**: Gross Revenue (with period-over-period trend %), Net Profit & Margins, Completed Orders, Average Order Value (AOV), and Refund Rates.
- **Pure Canvas Visualizations**:
  - **Revenue & Sales Velocity**: Daily revenue flow with smooth Bézier curve interpolation, area fill, crosshair guides, and dynamic hover tooltip. Toggleable between gross dollar amount and order count.
  - **Revenue by Category**: Donut chart with interactive arc hover highlighting and category breakdown.
  - **Sales by Channel**: Acquisition channel bar chart comparing Enterprise Direct, Inside Sales, Inbound Web, and Partner Referrals.
  - **Sales Rep Leaderboard**: Deals closed, revenue generated, and visual quota attainment bars.
- **Dynamic Timeframe Filters**: 7D, 30D, 90D, YTD, All Time, plus a custom date range picker.
- **Transactional Ledger**:
  - Live multi-field search (Customer name, Invoice ID, Product, Rep).
  - Category and Payment Status filtering.
  - Interactive table header column sorting.
  - Pagination controls.
  - View detailed printable invoice receipts, edit records, or delete transactions.
- **Data Portability**:
  - Web Storage (`localStorage`) persistence with automatic seed generation.
  - Export filtered transactions to CSV.
  - Import CSV/JSON dataset directly into browser storage.
  - Reset to default demo data.

## Getting Started

No build step, dependencies, or server setup required.

Simply open `index.html` in any modern web browser or serve it with any static file server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```

## Tech Stack

- **HTML5**: Semantic markup and accessible modal dialogs.
- **CSS3**: Responsive flexbox and grid layout (no CSS variables / custom properties).
- **JavaScript (ES6+)**: Vanilla state management, Canvas rendering engine, and Web Storage API.
