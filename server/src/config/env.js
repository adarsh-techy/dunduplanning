import 'dotenv/config';

// Single place that reads process.env for the whole backend. Every other
// file imports `env` from here instead of touching process.env directly --
// so when you move this app to a host (Render, Railway, a VPS, etc.) there
// is exactly one file's worth of variables to configure, and a missing
// required one fails loudly at boot instead of silently misbehaving later.
//
// Local dev: copy .env.example to .env and fill it in.
// Hosting:   set the same keys in your provider's dashboard (Render/Railway
//            "Environment", Vercel "Environment Variables", etc.) --
//            never commit a real .env file.

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key} (see server/.env.example)`);
  }
  return value;
};

// CLIENT_URL accepts one URL or a comma-separated list, so a deployed
// frontend and a local/staging one can both be allowed at the same time,
// e.g. CLIENT_URL=https://dundu-planning.vercel.app,http://localhost:5173
const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const clientOrigins = parseOrigins(process.env.CLIENT_URL);
if (clientOrigins.length === 0) {
  clientOrigins.push('http://localhost:5173');
}

export const env = {
  nodeEnv,
  isProduction,

  // Port the API listens on. Most hosts (Render, Railway, Heroku-style
  // platforms) inject their own PORT at runtime -- always prefer that over
  // the .env value so deploys don't fail from a hardcoded port.
  port: Number(process.env.PORT) || 5050,

  // MongoDB Atlas (or any Mongo) connection string. In Atlas, remember to
  // whitelist your host's outbound IP under Network Access -- 0.0.0.0/0 is
  // the simplest option for most managed hosts that don't have a static IP.
  mongoUri: required('MONGO_URI'),

  // Signs the short-lived access token (sent on every request). Generate a
  // long random value for real use, e.g.
  // `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
  jwtSecret: required('JWT_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',

  // Signs the long-lived refresh token (only ever sent to /api/auth/*),
  // which is what actually keeps someone logged in -- the access token
  // above is deliberately short so a stolen one goes stale fast. Defaults
  // to JWT_SECRET so this works with zero extra config, but set a
  // different random value for real use: if the two ever leaked together
  // it wouldn't matter which secret was compromised.
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || required('JWT_SECRET'),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Every origin the frontend is served from -- used for CORS and to decide
  // whether auth cookies need cross-site settings (see generateToken.js).
  clientOrigins,

  // One-time first-boot seed for the super admin account (`npm run seed`).
  superAdmin: {
    name: process.env.SUPERADMIN_NAME || 'Super Admin',
    email: process.env.SUPERADMIN_EMAIL,
    password: process.env.SUPERADMIN_PASSWORD,
  },
};

export default env;
