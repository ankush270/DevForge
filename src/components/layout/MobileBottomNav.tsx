'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LayoutDashboard, BookOpen, Zap, Search, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMobileDrawer: () => void;
}

export function MobileBottomNav({ onOpenMobileDrawer }: MobileBottomNavProps) {
  const {
    activeView,
    setActiveView,
    dueNotesQueue,
    startRevisionQueue,
    setIsCommandPaletteOpen,
    setIsQuickCaptureOpen,
  } = useApp();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hiding on scroll down, reappearing on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling down -> Hide
        setIsVisible(false);
      } else {
        // Scrolling up -> Show
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] px-3 py-2 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            activeView === 'dashboard' ? 'text-indigo-400 font-semibold' : 'text-[var(--muted)]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-xs font-semibold">Home</span>
        </button>

        {/* Subjects Drawer */}
        <button
          onClick={onOpenMobileDrawer}
          className="flex flex-col items-center gap-1 p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-semibold">Subjects</span>
        </button>

        {/* Floating Quick Add */}
        <button
          onClick={() => setIsQuickCaptureOpen(true)}
          className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Revision Queue */}
        <button
          onClick={() => startRevisionQueue()}
          className={`relative flex flex-col items-center gap-1 p-1.5 transition-colors ${
            activeView === 'focus-deck' ? 'text-amber-400 font-semibold' : 'text-[var(--muted)]'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-xs font-semibold">Revise</span>
          {dueNotesQueue.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Search */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex flex-col items-center gap-1 p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs font-semibold">Search</span>
        </button>
      </div>
    </nav>
  );
}
