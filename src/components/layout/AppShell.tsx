'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { CommandPalette } from '@/components/modals/CommandPalette';
import { QuickCaptureModal } from '@/components/modals/QuickCaptureModal';
import { InterviewSprintModal } from '@/components/modals/InterviewSprintModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CloudSyncModal } from '@/components/modals/CloudSyncModal';
import { X, PanelLeft } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { activeView, setIsSidebarCollapsed } = useApp();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Focus-Deck mode & Landing Page take over full screen with 0 distractions
  const isFullScreen = activeView === 'focus-deck' || activeView === 'landing';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Desktop Sidebar (hidden in Focus Deck or Landing mode) */}
      {!isFullScreen && (
        <div className="hidden md:flex h-full">
          <Sidebar />
        </div>
      )}

      {/* Mobile Drawer (Slide-Over) */}
      {!isFullScreen && isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-4/5 max-w-sm h-full bg-[var(--surface)] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3.5 border-b border-[var(--border)]">
              <span className="text-xs sm:text-sm font-bold text-[var(--muted)] uppercase tracking-wider">
                Subjects & Notes
              </span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative pb-16 md:pb-0">
        {/* Mobile Top Header (only on mobile when not in focus deck) */}
        {!isFullScreen && (
          <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-20">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-[var(--foreground)]"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <span className="text-base font-bold tracking-tight text-[var(--foreground)]">
              InterviewOS
            </span>

            <div className="w-5" /> {/* Spacer */}
          </header>
        )}

        {children}
      </main>

      {/* Mobile Auto-Hiding Bottom Nav (hidden in focus deck or landing) */}
      {!isFullScreen && (
        <MobileBottomNav onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />
      )}

      {/* Modals & Command Palette */}
      <CommandPalette />
      <QuickCaptureModal />
      <InterviewSprintModal />
      <SettingsModal />
      <CloudSyncModal />
    </div>
  );
}
