'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'retro-y2k';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add('retro-y2k');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme: Theme = 'retro-y2k';

  useEffect(() => {
    applyTheme();
    try {
      localStorage.setItem('interview_os_theme', 'retro-y2k');
    } catch {
      // ignore
    }
  }, []);

  const setTheme = () => {
    applyTheme();
  };

  const toggleTheme = () => {
    applyTheme();
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
