import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { MODULE_KEYS } from '../config/modules.js';

const FULL_ACCESS = MODULE_KEYS.reduce((acc, key) => ({ ...acc, [key]: true }), {});

// Builds a clean permissions object from arbitrary input, keeping only the
// known module keys and coercing each to a boolean.
const sanitizePermissions = (permissions = {}) =>
  MODULE_KEYS.reduce((acc, key) => ({ ...acc, [key]: Boolean(permissions[key]) }), {});

// Guards against ever ending up with zero active super admins. Pass the id
// of the super admin being deleted/deactivated so they're excluded from
// their own count.
const assertAnotherSuperAdminRemains = async (excludingId) => {
  const remaining = await User.countDocuments({
    role: 'superadmin',
    isActive: true,
    _id: { $ne: excludingId },
  });
  if (remaining < 1) {
    const err = new Error('Cannot remove the last remaining Super Admin account');
    err.status = 400;
    throw err;
  }
};

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: 1 }).lean();
  res.json({
    users: users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      permissions: u.permissions,
      isActive: u.isActive,
      createdAt: u.createdAt,
    })),
  });
});

// Lightweight id/name list for pickers (e.g. "who did this task") -- no
// email or permissions exposed, available to any authenticated user.
export const getUsersBasic = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select('name').sort({ name: 1 }).lean();
  res.json({ users: users.map((u) => ({ id: u._id, name: u.name })) });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, permissions } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const finalRole = role === 'superadmin' ? 'superadmin' : 'admin';

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: finalRole,
    // Super admins always have full access; permissions only matter for admins.
    permissions: finalRole === 'superadmin' ? FULL_ACCESS : sanitizePermissions(permissions),
    createdBy: req.user._id,
  });

  res.status(201).json({ user: user.toSafeObject() });
});

export const updateUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, permissions, isActive, password } = req.body;
  const isSelf = String(target._id) === String(req.user._id);

  // Deactivating a super admin is only safe if another active one remains.
  if (target.role === 'superadmin' && isActive === false) {
    if (isSelf) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }
    await assertAnotherSuperAdminRemains(target._id);
  }

  if (name !== undefined) target.name = name;
  if (isActive !== undefined) target.isActive = Boolean(isActive);
  if (permissions !== undefined && target.role !== 'superadmin') {
    target.permissions = sanitizePermissions(permissions);
  }
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    target.password = password;
  }

  await target.save();
  res.json({ user: target.toSafeObject() });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (String(target._id) === String(req.user._id)) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }
  if (target.role === 'superadmin') {
    await assertAnotherSuperAdminRemains(target._id);
  }

  await target.deleteOne();
  res.json({ message: 'User deleted' });
});
