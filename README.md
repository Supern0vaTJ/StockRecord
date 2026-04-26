# StockRecord
Stock market record for buy/sell shares data and manage account.

This is a professional-grade **Indian Stock Portfolio Manager** built with Next.js, Prisma, and Tailwind CSS. It allows users to track their NSE/BSE investments, view live prices via Yahoo Finance, and manage transaction history with realized/unrealized P&L calculations.

## Features
- **Dashboard Overview**: Global metrics for total value, realized profit, and active holdings.
- **Portfolio Management**: Create multiple portfolios (e.g., Retirement, Long-term) and manage assets within them.
- **Live Market Data**: Real-time price updates for Indian stocks (NSE/BSE).
- **Transaction History**: Detailed ledger of all Buy/Sell trades with custom dates.
- **Realized P&L**: Automated calculation of profit/loss on sold assets using average cost basis.
- **Modern UI**: Dark mode support, glassmorphism aesthetics, and smooth animations with Framer Motion.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS & Lucide Icons
- **Animations**: Framer Motion

## Getting Started
1. Install dependencies: `npm install`
2. Sync the database: `npx prisma db push`
3. Run the dev server: `npm run dev`
