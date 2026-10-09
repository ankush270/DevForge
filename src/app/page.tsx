'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { NoteEditor } from '@/components/editor/NoteEditor';
import { FocusDeck } from '@/components/revision/FocusDeck';
import { LandingPage } from '@/components/landing/LandingPage';

function MainContent() {
  const { activeView } = useApp();

  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (activeView === 'focus-deck') {
    return <FocusDeck />;
  }

  if (activeView === 'editor') {
    return <NoteEditor />;
  }

  return <Dashboard />;
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppShell>
          <MainContent />
        </AppShell>
      </AppProvider>
    </ThemeProvider>
  );
}
