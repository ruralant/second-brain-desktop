import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextType = {
  theme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  preference: 'system',
  setPreference: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useColorScheme(): 'light' | 'dark' {
  return useTheme().theme;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [osScheme, setOsScheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Load preference from DB on mount
  useEffect(() => {
    window.api.settings.get('themePreference').then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
    });
  }, []);

  // Listen for OS theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setOsScheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const theme: 'light' | 'dark' = preference === 'system' ? osScheme : preference;

  // Apply theme to HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    window.api.settings.set('themePreference', pref);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}
