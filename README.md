# Ledgerly

A mobile-first personal finance tracker built with React, TypeScript, Tailwind CSS, and Supabase.

The app is designed for fast daily logging and clean monthly visibility across:

- expenses
- income
- lending and settlements
- bike-related costs
- lightweight analytics

## Features

- Expense tracking with categories and bike-specific sub-types
- Income tracking with source selection
- Monthly balance view combining income, expenses, and ledger activity
- Lending tracker for money you gave, borrowed, and settled
- Bike tracker for petrol, oil, maintenance, and repairs
- Analytics for monthly trends and category splits
- CSV export for expense history
- Local monthly budget support

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix UI
- Supabase
- Vitest + Testing Library

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Add a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. Start the app

```bash
npm run dev
```

The app usually runs on `http://localhost:8080`.

## Scripts

- `npm run dev` starts the development server
- `npm run build` builds the production bundle
- `npm run preview` previews the production build
- `npm run lint` runs ESLint
- `npm run test` runs the test suite once
- `npm run test:watch` runs tests in watch mode

## Project Structure

```text
src/
  components/    Shared UI and feature components
  hooks/         Shared hooks and derived state helpers
  lib/           Formatting, utilities, constants, Supabase client
  pages/         Route-level screens
  services/      Data access layer
  test/          Test setup and automated tests
  types/         Shared TypeScript models
```

## Data Areas

The app currently works with these main domains:

- `expenses`
- `incomes`
- `ledger_entries`
- `categories`

Ledger rows are normalized in the client so database fields like `person_name` and `entry_type` map cleanly into app-friendly types.

## User Data Isolation

To keep each user's finance data private, run the SQL migration in:

```text
supabase/migrations/20260430_user_data_isolation.sql
```

This adds `user_id` ownership and row-level security for:

- `expenses`
- `incomes`
- `ledger_entries`

Without that migration, authenticated users can still end up reading shared table data.

## Development Notes

- Date handling is normalized for local calendar behavior to avoid timezone drift.
- Create and delete flows are wired to refresh local UI state immediately.
- Service responses are normalized so the UI gets consistent shapes.

## Recommended Next Improvements

- Edit flows for expenses, incomes, and ledger entries
- Authentication and per-user data ownership
- Recurring transactions
- Better reporting and richer exports
- More automated tests around finance-critical flows
