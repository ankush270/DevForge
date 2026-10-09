'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { LandingPage } from '@/components/landing/LandingPage';

export default function LandingRoute() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <LandingPage />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
