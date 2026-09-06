import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiX } from 'react-icons/fi';
import { selectCurrentUser, selectIsSuperAdmin } from '../features/auth/authSlice';
import { MODULES } from '../modules';

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-800'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
  }`;

// Planning/Purchase use plural paths for historical reasons; the rest are singular.
const MODULE_PATHS = {
  planning: '/planning',
  purchase: '/purchases',
  marketing: '/marketing',
  features: '/features',
  delivery: '/delivery',
  app: '/app-progress',
  packing: '/packing',
};

export default function Sidebar({ open, onClose }) {
  const user = useSelector(selectCurrentUser);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);

  const links = (
    <ul className="space-y-1">
      <li>
        <NavLink to="/" end className={linkClass} onClick={onClose}>
          <span>📊</span> Dashboard
        </NavLink>
      </li>
      {MODULES.filter((m) => isSuperAdmin || user?.permissions?.[m.key]).map((m) => (
        <li key={m.key}>
          <NavLink to={MODULE_PATHS[m.key]} className={linkClass} onClick={onClose}>
            <span>{m.icon}</span> {m.label}
          </NavLink>
        </li>
      ))}
      {isSuperAdmin && (
        <li>
          <NavLink to="/admin/users" className={linkClass} onClick={onClose}>
            <span>👥</span> Admin Users
          </NavLink>
        </li>
      )}
    </ul>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <nav className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 lg:block">
        <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu
        </p>
        {links}
      </nav>

      {/* Mobile: off-canvas drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <nav className="absolute inset-y-0 left-0 w-64 max-w-[80vw] overflow-y-auto bg-white p-3 shadow-2xl dark:bg-slate-800">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Menu</span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <FiX />
              </button>
            </div>
            {links}
          </nav>
        </div>
      )}
    </>
  );
}
