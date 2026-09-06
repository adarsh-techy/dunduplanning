import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { getPreferredTheme, setTheme } from '../config/theme';

export default function ThemeToggle() {
  const [theme, setThemeState] = useState(getPreferredTheme);

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  return (
    <button
      onClick={() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label="Toggle dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:text-white"
    >
      {theme === 'dark' ? (
        <FiSun className="text-xl text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <FiMoon className="text-xl text-slate-200 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
