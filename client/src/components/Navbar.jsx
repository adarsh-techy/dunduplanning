import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser, clearCredentials } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApiSlice';
import { apiSlice } from '../app/apiSlice';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onMenuClick }) {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

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

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-brand-700 via-brand-600 to-fuchsia-600 px-4 shadow-sm dark:border-slate-700 dark:from-brand-900 dark:via-brand-800 dark:to-fuchsia-900 sm:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
        >
          ☰
        </button>
        <div className="flex items-center gap-2 text-white">
          <span className="text-xl">🗂️</span>
          <span className="hidden text-lg font-extrabold tracking-tight sm:inline">Dundu Planning</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {user && (
          <div className="hidden items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm text-white ring-1 ring-white/20 sm:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-brand-700">
              {initials}
            </span>
            {user.name}
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {user.role === 'superadmin' ? 'Super Admin' : user.role}
            </span>
          </div>
        )}
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/20"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
