import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentUser, selectIsSuperAdmin } from '../features/auth/authSlice';

// Guards a route behind login, and optionally behind a module permission
// (`permission="planning"` / `"purchase"`) or super-admin-only access.
export default function ProtectedRoute({ children, permission, requireSuperAdmin }) {
  const user = useSelector(selectCurrentUser);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <AccessDenied />;
  }

  if (permission && !isSuperAdmin && !user.permissions?.[permission]) {
    return <AccessDenied />;
  }

  return children;
}

function AccessDenied() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
      <h2 className="text-lg font-semibold">Access denied</h2>
      <p className="mt-1 text-sm">
        You don't have permission to view this page. Ask your super admin to grant you access.
      </p>
    </div>
  );
}
