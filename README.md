# Dundu Planning

A business setup, build-progress and operations tracker built with the MERN stack (MongoDB, Express, React, Node.js), Redux Toolkit (RTK Query), and Tailwind CSS.

It tracks, each behind its own permission and with a full detail page per item:
- **Planning** — the checklist of steps to set up the business (SIM registration, bank account, Udyam registration, GST registration, Panchayat trade permission, and any custom steps you add).
- **App Progress** — the build status of the Dundu-Online product itself, grouped by section (Platforms, Catalog, Orders & Fulfilment, Marketing & Engagement, etc.).
- **Features** — the product/business feature catalog, with full technical detail on how each one works.
- **Purchase** — equipment/expense purchases with vendor, quantity, cost and status.
- **Packing** — packing cover, printing and related fulfillment items.
- **Delivery** — logistics planning items.
- **Marketing** — campaigns, launches and ad spend.
- **Users** — one **Super Admin** with full control, who creates every other **Admin** (or additional Super Admin) account and grants each one access per module. There is no public sign-up after the first Super Admin exists.

## Project structure

```
dundu-planning/
├── package.json          # root scripts: run both apps, seed, build (see below)
├── server/                Express + MongoDB API
│   └── src/
│       ├── config/        env.js (all env vars, read once), db.js
│       ├── models/        one Mongoose model per module
│       ├── controllers/   one controller per module
│       ├── routes/        one router per module
│       ├── middleware/    auth, per-module permission, file upload, errors
│       ├── lib/checklist/ shared schema+controller+routes factory used by
│       │                  every checklist-style module (Planning, App
│       │                  Progress, Features, Delivery, Packing, Marketing) --
│       │                  Purchase is the one module with its own shape
│       └── utils/         token signing, one-time DB seed scripts
└── client/                React (Vite) + Redux Toolkit + Tailwind CSS
    └── src/
        ├── config/         env.js (API URL), modules.js (sidebar/permissions
        │                   source of truth), theme.js (dark mode)
        ├── app/            Redux store + the shared RTK Query base slice
        ├── components/     shared UI, incl. the generic Checklist page/
        │                   form/detail components every checklist module renders through
        ├── features/       one folder per module (page + detail page + API slice)
        └── routes/         route table
```

Every checklist-style module (Planning, App Progress, Features, Delivery, Packing, Marketing) is generated from the same three files in `server/src/lib/checklist/` and the same three components in `client/src/components/Checklist*`. To add a new module in that shape, wire up one model/controller/route file calling those factories, plus one API slice + two page components on the frontend — you never touch the shared files.

## Prerequisites
- Node.js 18+
- A MongoDB instance — a free MongoDB Atlas cluster is the easiest path

## Environment variables

Both apps read config from `.env` files that are **never committed** (see `.gitignore`) — you copy the checked-in `.env.example` and fill in real values. Every variable is documented inline in these files:

- [`server/.env.example`](server/.env.example) — database, port, JWT secret, allowed frontend origin(s), one-time super admin seed.
- [`client/.env.example`](client/.env.example) — the backend API URL (only needed when hosting the two apps on separate domains — left blank for local dev).

```bash
cp server/.env.example server/.env   # then edit: MONGO_URI, JWT_SECRET at minimum
cp client/.env.example client/.env   # local dev: no edits needed
```

## Running it locally

From the repo root, one command installs and runs both apps together:

```bash
npm run install:all   # installs server/ and client/ dependencies
npm run dev           # runs the API and the frontend together, color-coded logs
```

This starts the API on `http://localhost:5050` and the frontend on `http://localhost:5173` (the frontend's dev server proxies `/api` and `/uploads` to the API automatically — see `client/vite.config.js`). You can still run either side on its own with `npm run dev --prefix server` / `--prefix client` if you only need one.

## Create the Super Admin & log in

Open http://localhost:5173 — since no account exists yet, the Login page shows a **"Set up the Super Admin account"** link (`/signup`). Fill in a name, email and password there once; this creates the one Super Admin account and immediately locks the signup page for good. From **Admin Users**, the Super Admin then creates every other account (Admin or additional Super Admin) and chooses which modules each can access.

For scripted/headless setups, skip the signup page and run `npm run seed` from the root instead, using the `SUPERADMIN_*` values in `server/.env`. It also seeds the default Planning steps, App Progress items, Feature catalog and Packing items — each seed only runs once, when its collection is empty.

## Hosting it

A typical low-cost setup deploys the two apps separately — e.g. **Render or Railway** for `server/` (Node web service) and **Vercel or Netlify** for `client/` (static build). Whichever hosts you pick, four things need doing:

1. **Atlas Network Access** — your host's outbound IP needs to be allowed in Atlas (Network Access → Add IP Address). Most hosts don't have a static IP, so `0.0.0.0/0` ("allow from anywhere") is the practical choice — Atlas still enforces the username/password on top of it.
2. **Backend env vars** — set every key from `server/.env.example` in your host's dashboard, with `NODE_ENV=production` and `CLIENT_URL` set to your deployed frontend's real URL.
3. **Frontend env var** — set `VITE_API_URL` (in your host's dashboard) to your deployed backend's full URL including `/api`, then trigger a rebuild — Vite bakes this in at build time, not at runtime.
4. **Build & start commands** — point both services' **Root Directory at the repo root** (not `client/` or `server/`); the root `package.json`'s `build`/`start` scripts install that side's own dependencies first, so they work from a bare clone regardless of host:
   - **Backend** (Render Web Service, etc.): Build Command `npm install`, Start Command `npm start` (runs `npm install --prefix server && node server/src/server.js`, no nodemon).
   - **Frontend** (Render Static Site, Vercel, Netlify): Build Command `npm run build` (installs `client/`'s dependencies, then runs `vite build`), Publish/Output Directory `client/dist`.

   If a build ever fails with something like `sh: vite: not found`, it means the host ran a bare `npm install` at the root (which only installs the root's own tiny `devDependencies`) without also installing `client/`'s — `npm run build` from the root now does that itself, so just make sure the Build Command is `npm run build`, not `npm install && npm run build` with a separate install step in between.

Because the frontend and backend end up on two different domains once hosted, the app automatically switches its auth cookie to `sameSite: 'none'; secure: true` whenever `NODE_ENV=production` (see `server/src/utils/generateToken.js`) — that's what makes cross-domain login work; you don't need to change anything for it.

## Notes
- File attachments (receipts, certificates, photos) are stored on disk under `server/uploads/` and served at `/uploads/<filename>`. That's fine for a single-instance host; for anything with multiple instances or ephemeral disks, move this to a cloud bucket (S3, Cloudinary, etc.) instead.
- The Super Admin account can only be created once — via the one-time `/signup` page or `npm run seed`, whichever happens first. If you deploy before completing setup, do it quickly: `/signup` is reachable by anyone until then.
- To re-seed a module's defaults, clear that collection in the database and re-run `npm run seed` — each seed only runs when its collection is empty.
