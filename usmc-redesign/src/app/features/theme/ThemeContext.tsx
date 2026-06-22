import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'od-green' | 'desert';

export const THEMES: { id: Theme; label: string; short: string; color: string }[] = [
  { id: 'dark',     label: 'BLACKOUT',  short: 'BLK', color: '#000000' },
  { id: 'od-green', label: 'WOODLAND',  short: 'WDL', color: '#1a2518' },
  { id: 'desert',   label: 'DESERT',    short: 'DST', color: '#e8dcc8' },
];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
});

const STORAGE_KEY = 'usmc-theme';
const VALID: Theme[] = ['dark', 'od-green', 'desert'];

function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && VALID.includes(v as Theme)) return v as Theme;
  } catch {}
  return 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(...VALID);
    if (theme !== 'dark') html.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
