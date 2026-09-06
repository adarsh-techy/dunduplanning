const STORAGE_KEY = 'dundu-theme';

const safeGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore (private browsing / storage disabled)
  }
};

export const getPreferredTheme = () => {
  const stored = safeGet(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// Call once, as early as possible, to avoid a flash of the wrong theme.
export const initTheme = () => {
  const theme = getPreferredTheme();
  applyTheme(theme);
  return theme;
};

export const setTheme = (theme) => {
  safeSet(STORAGE_KEY, theme);
  applyTheme(theme);
};
