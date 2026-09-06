import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Two tokens, two jobs:
// - Access token ("token" cookie): sent on every request, verified by the
//   `protect` middleware, short-lived (15m by default) so a stolen one is
//   only useful for a few minutes.
// - Refresh token ("refreshToken" cookie): sent only to /api/auth/* (its
//   cookie is scoped to that path), long-lived (30d by default), and used
//   solely to silently mint a new access token via POST /api/auth/refresh
//   once the old one expires -- see authController.js's `refresh` handler
//   and client/src/app/apiSlice.js's reauth wrapper, which calls it
//   automatically whenever a request comes back 401.
//
// Each carries a `type` claim and is checked against it on verify, so even
// if JWT_REFRESH_SECRET is left equal to JWT_SECRET (the zero-config
// default), a refresh token can't be replayed as an access token or vice
// versa.
export const generateAccessToken = (userId) =>
  jwt.sign({ id: userId, type: 'access' }, env.jwtSecret, { expiresIn: env.jwtAccessExpiresIn });

export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId, type: 'refresh' }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });

// Parses the simple "15m" / "30d" duration strings jsonwebtoken accepts,
// into milliseconds, for the matching cookie `maxAge`. Falls back to 15
// minutes for anything it doesn't recognize, rather than throwing --
// cookie lifetime is a convenience, the JWT's own expiry is what's
// actually enforced server-side.
const MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
const parseDuration = (value) => {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(String(value).trim());
  return match ? Number(match[1]) * MS[match[2]] : MS.m * 15;
};

// In dev the frontend (5173) and API (5050) share `localhost`, so a plain
// `lax` cookie works. Once hosted, they're almost always on two different
// domains (e.g. a Vercel frontend + a Render API) -- a cross-site cookie
// needs `sameSite: 'none'`, which browsers only accept when `secure: true`
// (HTTPS). Deriving both from NODE_ENV means nothing needs to change by
// hand when you deploy; just set NODE_ENV=production on the host.
const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
};

// The refresh cookie is scoped to /api/auth so it's never sent on ordinary
// API calls -- it only ever needs to reach login/logout/refresh/me,
// limiting what any other endpoint's logs or an XSS payload could get at.
const REFRESH_COOKIE_PATH = '/api/auth';

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('token', accessToken, { ...baseCookieOptions, maxAge: parseDuration(env.jwtAccessExpiresIn) });
  res.cookie('refreshToken', refreshToken, {
    ...baseCookieOptions,
    path: REFRESH_COOKIE_PATH,
    maxAge: parseDuration(env.jwtRefreshExpiresIn),
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie('token', baseCookieOptions);
  res.clearCookie('refreshToken', { ...baseCookieOptions, path: REFRESH_COOKIE_PATH });
};
