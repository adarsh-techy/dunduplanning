import User from '../models/User.js';
import { env } from '../config/env.js';

// Creates the one and only super admin account from env vars, if it doesn't
// already exist. Returns the super admin document either way.
export const seedSuperAdmin = async () => {
  const email = (env.superAdmin.email || '').toLowerCase().trim();
  const password = env.superAdmin.password;
  const name = env.superAdmin.name;

  if (!email || !password) {
    throw new Error('SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env to seed');
  }

  let superAdmin = await User.findOne({ role: 'superadmin' });
  if (superAdmin) {
    console.log(`Super admin already exists: ${superAdmin.email}`);
    return superAdmin;
  }

  superAdmin = await User.create({
    name,
    email,
    password,
    role: 'superadmin',
    permissions: { planning: true, purchase: true },
    isActive: true,
  });

  console.log(`Super admin created: ${superAdmin.email}`);
  return superAdmin;
};
