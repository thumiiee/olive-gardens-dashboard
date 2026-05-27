# Olive Gardens Property Management Portal

[![GitHub Pages](https://github.com/thumiiee/olive-gardens-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/thumiiee/olive-gardens-dashboard/actions/workflows/deploy.yml)

A React single-page app for managing rental income, expenses, tenant details, and unit performance. This project is built with Create React App, Material UI, React Router, and Supabase integration.

## Features

- Dashboard with income, expenses, and profit summaries
- Transaction ledger and expense review pages
- Unit performance overview and detailed unit pages
- Tenant management with lease status filters
- Excel/XLSX upload and import support for multiple spreadsheet formats
- Settings page with account/sign-out flow
- Simulated login experience for local preview

## Tech stack

- React 18
- Create React App
- Material UI v9
- React Router v7
- Supabase JS client
- Chart.js + react-chartjs-2
- xlsx for spreadsheet parsing

## Prerequisites

- Node.js 18 or later
- npm 10 or later

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/thumiiee/olive-gardens-dashboard.git
   cd my-web-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file at the project root with your Supabase values:
   ```env
   REACT_APP_SUPABASE_URL=https://<project>.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=<anon-key>
   ```
4. Do not commit `.env` to GitHub.

## Running locally

Start the app in development mode:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for production

```bash
npm run build
```

The production-ready files will be created in the `build/` folder.

## Deployment

### Netlify

1. Create a new site from Git.
2. Connect your GitHub repo.
3. Set the build command to:
   ```bash
   npm run build
   ```
4. Set the publish directory to:
   ```bash
   build
   ```
5. Add environment variables in Netlify site settings:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
6. Deploy and share the site URL.

### Vercel

1. Import the GitHub repo in Vercel.
2. Confirm the framework is Create React App.
3. Use these settings:
   - Build command: `npm run build`
   - Output directory: `build`
4. Add env vars under Project > Settings > Environment Variables.
5. Deploy and share the Vercel URL.

### GitHub Pages

This repository includes a GitHub Actions workflow that deploys the app on every push to `main`.

1. Make sure `.github/workflows/deploy.yml` exists in the repo.
2. Confirm `homepage` is set in `package.json` to:
   ```json
   "homepage": "https://thumiiee.github.io/olive-gardens-dashboard"
   ```
3. Commit and push your changes to `main`.
4. GitHub Actions will automatically build and deploy the app.

If you prefer the classic `gh-pages` package deploy flow instead, you can still use:

```bash
npm install --save-dev gh-pages
```

and then run:

```bash
npm run deploy
```

## Sharing the running app only

- Host the app on Netlify or Vercel and send the live URL.
- Do not share `.env` or Supabase keys.
- If the client only needs a preview, a hosted app URL is best.

## Notes

- The current authentication is simulated locally in `src/DataContext.js`.
- For a real client deployment, enable Supabase Auth and secure session handling.
- Keep production environment variables private in your hosting provider.

## Helpful files

- `PROJECT_BLUEPRINT.md` — project audit and feature summary
- `src/supabaseClient.js` — Supabase client configuration
- `src/DataContext.js` — app state, Supabase logic, and auth stubs

## Need help?

If you want, I can also add a `.env.example` file and a deploy-ready GitHub Actions workflow for this project.
