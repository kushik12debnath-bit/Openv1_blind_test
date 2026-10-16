# Coca-Cola Sensory & Blind Taste Test Intelligence Platform

Executive single-page demo: double-blind evaluation terminal, 3D unblinding reveal, BI telemetry dashboard.

## Demo credentials (role-wise)

| Username | Password | Role | Access |
|---|---|---|---|
| `admin` | `admin123` | admin | Terminal + Reveal + Dashboard + CSV/PDF |
| `executive` | `exec123` | executive | Reveal + Dashboard + CSV/PDF (no terminal submit) |
| `tester` | `test123` | tester | Terminal + Reveal only (no dashboard, no exports) |

Auth is client-side demo only (`src/lib/auth.ts`, sessionStorage). Invalid logins show an error.

## Run locally

```bash
npm install
npm run dev -- --port 5174
npm run build
```

## Deploy (Vercel)

Import the GitHub repo in Vercel with Framework `Vite`, build `npm run build`, output `dist`. `vercel.json` already handles SPA rewrites.

## Stack

React 19 + TypeScript + Tailwind 3 + Recharts + Framer Motion + Lucide. Charts use `<ResponsiveContainer width="100%" height={320}>` with fixed-height parents.
