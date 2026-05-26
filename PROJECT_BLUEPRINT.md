# Olive Gardens Project Blueprint

## 1. Project Overview

**Project name:** Olive Gardens Property Management Portal

This is a React-based single-page application built with Create React App and Material UI. It provides a property manager dashboard for tracking rental income, expenses, tenant details, units performance, and spreadsheet import workflows.

## 2. Core Capabilities

### User-facing features

- Login screen with simulated authentication and quick manager login
- Dashboard overview with:
  - Total Income
  - Total Expenses
  - Overall Profit
  - Airbnb Profit
  - Income/expense trend chart
  - Unit performance chart
- Transaction ledger page showing all income and expenses
- Expense-specific page for expense review
- Unit listing page with per-unit income/expense/profit summaries
- Unit details page with editable unit metadata and transaction history
- Tenant management page with lease status filters and editable tenant details
- Data entry page for:
  - manual transaction entry
  - Excel/XLSX upload
  - import of multiple formats: rental tracker, bank statement, standard spreadsheet
  - clear backend data action
- Settings page with UI toggles and sign-out

### Data & backend integration

- Supabase client integration via `src/supabaseClient.js`
- Fetches data from `transactions` and `units` tables
- Writes new transaction rows and unit metadata via Supabase
- Supports optimistic UI updates for transaction insert and unit update

## 3. Architecture

### Frontend

- React 18 with functional components
- React Context in `src/DataContext.js` for global app state
- React Router v7 for client-side routes
- Material UI v9 for theming and components
- Chart.js + `react-chartjs-2` for charts
- XLSX parsing with `xlsx` library

### Main pages/components

- `src/App.js` — app shell, theme provider, auth gating, route definitions
- `src/DataContext.js` — global state, Supabase data access, auth state
- `src/Layout.js`, `src/Navbar.js`, `src/Sidebar.js` — app navigation + responsive layout
- `src/Dashboard.js` — KPI summary cards and charts
- `src/DataEntryPage.js` — transaction form, file import, clear data
- `src/UnitsPage.js`, `src/UnitDetailsPage.js` — unit performance and detail editing
- `src/TenantsPage.js` — tenant roster and lease management
- `src/TransactionsPage.js` — central transaction ledger
- `src/SettingsPage.js` — account and preferences UI

## 4. Data Flow

### Initial load

- `DataProvider` loads on app start and calls `fetchData()`.
- If Supabase config is missing or placeholder values are present, it warns and loads app in local state only.
- Fetches `transactions` from `transactions` table and normalizes units.
- Fetches `units` metadata from `units` table and maps rows into `unitMetadata`.

### Transaction write flows

- `addTransaction()` inserts a single transaction into Supabase and updates `transactions` state.
- `importData()` processes uploaded rows then inserts many rows into Supabase.
- `clearData()` deletes all rows from `transactions` and `units` if confirmed.

### Unit metadata flows

- `updateUnitMetadata()` upserts the record into Supabase and updates local metadata state.

## 5. Authentication

- The app currently uses simulated local auth inside `src/DataContext.js`.
- `login()` accepts any email/password pair with a valid email format and length >= 4.
- No real Supabase auth or secure session handling is implemented.
- Protected routes are enforced by rendering `<LoginPage />` when `user` is null.

## 6. Supabase configuration

- `src/supabaseClient.js` uses `process.env.REACT_APP_SUPABASE_URL` and `process.env.REACT_APP_SUPABASE_ANON_KEY`.
- If env values are absent, it falls back to placeholder values.
- To enable real Supabase access, add a `.env` file with:
  - `REACT_APP_SUPABASE_URL=https://<project>.supabase.co`
  - `REACT_APP_SUPABASE_ANON_KEY=<anon-key>`

## 7. Current build/runtime status

- The app is buildable and can run successfully with the current code.
- A recent fix was applied for invalid icon imports (`EcoIcon` -> `HomeWorkIcon`).
- The app is not TypeScript; it is a JavaScript React project.

## 8. Known limitations / gaps

### Authentication & security

- Fake auth rather than secure backend login
- No password storage, hashing, or real user session management
- No role-based access control beyond a simulated `user.role`

### Backend & data reliability

- `clearData()` can delete all Supabase rows without safeguards
- There is no error UI path when Supabase writes fail
- Optimistic updates are used without rollback on failure
- No server-side validation of imported transaction data

### Data model assumptions

- `normalizeUnitName()` maps `Airbnb` to `Flat 8`, which may hide actual unit names
- `unitMetadata` only stores partial metadata fields (`customName`, `resident`, `email`)
- Tenant and unit data are partially mocked in UI fallback defaults

### UX and robustness

- No persistent user settings
- No confirmation modal for data imports or transaction edits
- No pagination or filters on large transaction tables
- Some pages currently have `error` variables imported but only used for loading state, not displayed to users
- No actual file upload success/failure feedback beyond raw alerts

## 9. Recommended next steps

### Immediate improvements

1. Add real authentication with Supabase Auth or another provider.
2. Store `password` & session state securely; replace fake login logic.
3. Add proper error handling UI for Supabase fetch/insert/upsert operations.
4. Add schema validation for imported Excel rows.
5. Add confirmation modals for destructive actions like `clearData()`.

### Backend data hardening

1. Add Supabase Row Level Security (RLS) policies for `transactions` and `units`.
2. Add database constraints for required fields and numeric types.
3. Implement a robust `unitMetadata` schema to store `id`, `custom_name`, `resident`, `email`, `phone`, `rent`, `lease_start`, `lease_end`.

### UX / product polish

1. Add search/filter options for transactions and units.
2. Add pagination or virtual scrolling for large datasets.
3. Show Supabase connection status and offline mode indicator.
4. Add export CSV/XLSX support for reports.

## 10. Deployment notes

- Build script: `npm run build`
- Start script: `npm start`
- CI/CD / hosting can use GitHub Pages if `build` output is sufficient, but real app should use a proper web host with secure env handling.
- Ensure `.env` is never committed with Supabase keys.

## 11. Recommended documentation items

- `README.md` should document:
  - project purpose
  - installation steps
  - `.env` variables
  - Supabase table schemas
  - auth limitations
  - local development commands

- Add `PROJECT_BLUEPRINT.md` as a living audit document for future handoff and enhancement planning.
