import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiX, FiLogOut } from 'react-icons/fi';
import { selectCurrentUser, selectIsSuperAdmin, clearCredentials } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApiSlice';
import { apiSlice } from '../app/apiSlice';
import { MODULES } from '../config/modules';

// Sidebar background is a fixed navy, independent of light/dark mode (see
// tailwind.config.js), so these states are plain light-on-dark -- no
// dark: variants needed here.
const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-500/20 text-white shadow-sm ring-1 ring-brand-400/30'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`;
const sectionLabelClass = 'px-3 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400';

// Planning/Purchase use plural paths for historical reasons; the rest are singular.
const MODULE_PATHS = {
  planning: '/planning',
  purchase: '/purchases',
  marketing: '/marketing',
  features: '/features',
  delivery: '/delivery',
  app: '/app-progress',
  deployment: '/deployment',
  packing: '/packing',
};

export default function Sidebar({ open, onClose }) {
  const user = useSelector(selectCurrentUser);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const canSeePurchase = isSuperAdmin || Boolean(user?.permissions?.purchase);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(clearCredentials());
      dispatch(apiSlice.util.resetApiState());
      navigate('/login');
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Every "dashboard"-style overview page grouped together up top, so
  // they read as one family instead of being scattered among the modules
  // that feed them.
  const links = (
    <div className="space-y-4">
      <div>
        <p className={sectionLabelClass}>Dashboards</p>
        <ul className="space-y-1">
          <li>
            <NavLink to="/" end className={linkClass} onClick={onClose}>
              <span>📋</span> Planning Dashboard
            </NavLink>
          </li>
          {canSeePurchase && (
            <li>
              <NavLink to="/purchase-dashboard" className={linkClass} onClick={onClose}>
                <span>📊</span> Purchase Dashboard
              </NavLink>
            </li>
          )}
        </ul>
      </div>

      <div>
        <p className={sectionLabelClass}>Modules</p>
        <ul className="space-y-1">
          {MODULES.filter((m) => isSuperAdmin || user?.permissions?.[m.key]).map((m) => (
            <li key={m.key}>
              <NavLink to={MODULE_PATHS[m.key]} className={linkClass} onClick={onClose}>
                <span>{m.icon}</span> {m.label}
              </NavLink>
            </li>
          ))}
          {canSeePurchase && (
            <li>
              <NavLink to="/finance" className={linkClass} onClick={onClose}>
                <span>💰</span> Finance
              </NavLink>
            </li>
          )}
        </ul>
      </div>

      {isSuperAdmin && (
        <div>
          <p className={sectionLabelClass}>Admin</p>
          <ul className="space-y-1">
            <li>
              <NavLink to="/admin/users" className={linkClass} onClick={onClose}>
                <span>👥</span> Admin Users
              </NavLink>
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  const userFooter = user && (
    <div className="mt-2 flex items-center gap-2 border-t border-navy-700 pt-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-brand-700">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="truncate text-[11px] uppercase tracking-wide text-slate-400">
          {user.role === 'superadmin' ? 'Super Admin' : user.role}
        </p>
      </div>
      <button
        onClick={handleLogout}
        title="Log out"
        aria-label="Log out"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        <FiLogOut />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <nav className="hidden w-60 shrink-0 flex-col border-r border-navy-700 bg-navy-950 p-3 lg:flex">
        <div className="no-scrollbar flex-1 overflow-y-auto">{links}</div>
        {userFooter}
      </nav>

      {/* Mobile: off-canvas drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <nav className="absolute inset-y-0 left-0 flex w-64 max-w-[80vw] flex-col bg-navy-950 p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-sm font-bold text-white">Menu</span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <FiX />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto">{links}</div>
            {userFooter}
          </nav>
        </div>
      )}
    </>
  );
}
