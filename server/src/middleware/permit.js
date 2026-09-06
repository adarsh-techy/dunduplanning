// Module-level permission gate. Super admin always passes; an admin passes
// only if they were granted access to the given module (e.g. "planning" or
// "purchase") by the super admin.
export const permit = (moduleName) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (req.user.role === 'superadmin') {
    return next();
  }
  if (req.user.permissions?.[moduleName]) {
    return next();
  }
  return res.status(403).json({ message: `Forbidden: no access to the ${moduleName} module` });
};
