import { useEffect, useState } from 'react';
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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-base text-white ring-1 ring-white/25 transition hover:bg-white/20"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
