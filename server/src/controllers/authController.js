import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Issues a fresh access + refresh token pair and sets both cookies -- the
// one thing login, signup and refresh all need to do identically.
const issueSession = (res, userId) => {
  setAuthCookies(res, {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  });
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'This account has been deactivated' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  issueSession(res, user._id);
  res.json({ user: user.toSafeObject() });
});

export const logout = (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out' });
};

// Silently mints a new access token from a still-valid refresh token, so a
// session survives past the access token's short lifetime without asking
// the user to log in again. The frontend calls this automatically whenever
// any API request comes back 401 (see client/src/app/apiSlice.js), so
// nothing needs to call it directly from the UI.
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtRefreshSecret);
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
  if (decoded.type !== 'refresh') {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Account not found or deactivated' });
  }

  // Rotate both tokens on every refresh, not just the access token -- a
  // leaked refresh token then only works until the legitimate session
  // happens to refresh next, instead of for its whole 30-day lifetime.
  issueSession(res, user._id);
  res.json({ user: user.toSafeObject() });
});

export const getMe = (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// One-time first-run setup: creates the super admin account. Locked out as
// soon as a super admin exists, so it can never be used to add more accounts
// -- all other users are added by the super admin from Admin Users.
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const setupAlreadyDone = await User.exists({ role: 'superadmin' });
  if (setupAlreadyDone) {
    return res.status(403).json({ message: 'Setup is already complete. Please sign in instead.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'superadmin',
    permissions: { planning: true, purchase: true },
  });

  issueSession(res, user._id);
  res.status(201).json({ user: user.toSafeObject() });
});

export const getSetupStatus = asyncHandler(async (req, res) => {
  const setupComplete = Boolean(await User.exists({ role: 'superadmin' }));
  res.json({ setupComplete });
});
