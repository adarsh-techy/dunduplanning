import User from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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

  const token = generateToken(user._id);
  setAuthCookie(res, token);
  res.json({ user: user.toSafeObject() });
});

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
};

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

  const token = generateToken(user._id);
  setAuthCookie(res, token);
  res.status(201).json({ user: user.toSafeObject() });
});

export const getSetupStatus = asyncHandler(async (req, res) => {
  const setupComplete = Boolean(await User.exists({ role: 'superadmin' }));
  res.json({ setupComplete });
});
