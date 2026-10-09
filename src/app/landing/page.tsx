'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider } from '@/context/AppContext';
import { LandingPage } from '@/components/landing/LandingPage';

export default function LandingRoute() {
  return (
    <ThemeProvider>
      <AppProvider>
        <LandingPage />
      </AppProvider>
    </ThemeProvider>
  );
}
