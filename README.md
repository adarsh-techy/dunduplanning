# Dundu Planning

A business-setup and purchase tracker built with the MERN stack (MongoDB, Express, React, Node.js), Redux Toolkit (RTK Query), and Tailwind CSS.

It tracks:
- **Planning** — the checklist of steps needed to set up the business (SIM registration, bank account, Udyam registration, GST registration, Panchayat trade permission, and any custom steps you add), each with a status (Pending / In Progress / Complete), estimated & actual cost, due date, notes, and attached documents/photos.
- **Purchases** — equipment/expense purchases with vendor, quantity, cost, status, and attachments, optionally linked to a planning step.
- **Users** — one **Super Admin** with full control, who can create **Admin** accounts and grant each one access to the Planning module, the Purchase module, or both.

## Project Structure
```
server/   Express + MongoDB API (JWT auth via httpOnly cookie)
client/   React (Vite) + Redux Toolkit + Tailwind CSS
```

## Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

## 1. Backend setup
```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET
npm run dev    # starts the API on http://localhost:5000
```

## 2. Frontend setup
```bash
cd client
npm install
npm run dev    # starts the app on http://localhost:5173
```
The dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so no extra config is needed to talk to the backend.

## 3. Create the Super Admin & log in
Open http://localhost:5173 — since no account exists yet, the Login page shows a **"Set up the Super Admin account"** link (`/signup`). Fill in a name, email and password there once; this creates the one Super Admin account and immediately locks the signup page for good (it responds "Setup already complete" from then on, even if someone else finds the URL). From **Admin Users**, the super admin can then create additional admin accounts and choose whether each one can access Planning, Purchase, or both — there is no other way to create an account.

Alternatively, for scripted/headless setups you can skip the signup page and run `npm run seed` in `server/` instead, using the `SUPERADMIN_NAME` / `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` values in `.env` (it does nothing if a super admin already exists either way).

## Notes
- File attachments (receipts, certificates, photos) are stored on disk under `server/uploads/` and served at `/uploads/<filename>`. For production, consider moving this to a cloud bucket (S3, Cloudinary, etc.).
- The Super Admin account can only be created once — via the one-time `/signup` page or `npm run seed`, whichever happens first. All other accounts are added by the Super Admin from Admin Users, never via self-signup.
- If you deploy this somewhere before you've completed setup, do it quickly — `/signup` is reachable by anyone until the first Super Admin is created.
- To reset default planning steps, you'd need to clear the `steps` collection and re-run the seed script (it only seeds when the collection is empty).
