'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'retro-y2k' | 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'light', 'retro-y2k');
  if (t === 'retro-y2k') {
    root.classList.add('retro-y2k');
  } else if (t === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('retro-y2k');

  useEffect(() => {
    const saved = localStorage.getItem('interview_os_theme') as Theme | null;
    if (saved === 'retro-y2k' || saved === 'dark' || saved === 'light') {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      setThemeState('retro-y2k');
      applyTheme('retro-y2k');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('interview_os_theme', newTheme);
    } catch {
      // ignore
    }
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    // Cycle between retro-y2k -> dark -> light -> retro-y2k
    const next: Theme = theme === 'retro-y2k' ? 'dark' : theme === 'dark' ? 'light' : 'retro-y2k';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
