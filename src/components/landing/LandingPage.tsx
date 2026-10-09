'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { DevForgeLogo } from '@/components/common/DevForgeLogo';
import {
  Zap,
  Sparkles,
  BookOpen,
  Target,
  Code,
  Layers,
  ArrowRight,
  Flame,
  CheckCircle2,
  Keyboard,
  Search,
  Cloud,
  Moon,
  Sun,
  ChevronRight,
  Shield,
  RotateCcw,
  Cpu,
  FileText,
  Activity,
  Download,
  Copy,
  Check,
  ExternalLink,
  Laptop,
} from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  action: string;
  category: 'global' | 'editor' | 'review' | 'modes';
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  // Global Navigation
  {
    keys: ['Ctrl', 'K'],
    action: 'Command Palette & Search',
    category: 'global',
    description: 'Instant fuzzy search across all notes, topics, tags, and quick actions',
  },
  {
    keys: ['Ctrl', 'N'],
    action: 'Quick Note Capture',
    category: 'global',
    description: 'Open quick-capture modal from anywhere to draft a note instantly',
  },
  {
    keys: ['Ctrl', 'B'],
    action: 'Toggle Sidebar',
    category: 'global',
    description: 'Collapse or expand left navigation sidebar for distraction-free reading',
  },
  {
    keys: ['Esc'],
    action: 'Close / Back to Dashboard',
    category: 'global',
    description: 'Dismiss any open modal or return to the main dashboard workspace',
  },

  // Editor & Writing
  {
    keys: ['Ctrl', 'V'],
    action: 'Paste Screenshot Directly',
    category: 'editor',
    description: 'Directly paste images or screenshots into your note without manual file saving',
  },
  {
    keys: ['/'],
    action: 'Slash Commands Menu',
    category: 'editor',
    description: 'Type slash in editor to quickly insert headings, lists, code blocks, and diagrams',
  },
  {
    keys: ['Ctrl', 'B'],
    action: 'Bold Text',
    category: 'editor',
    description: 'Wrap selected text with **bold formatting**',
  },
  {
    keys: ['Ctrl', 'I'],
    action: 'Italic Text',
    category: 'editor',
    description: 'Wrap selected text with *italic formatting*',
  },

  // Review & Spaced Repetition (SRS)
  {
    keys: ['Space', 'or', 'Enter'],
    action: 'Reveal Active Recall Answer',
    category: 'review',
    description: 'Flips card and exposes hidden answer during revision sprints',
  },
  {
    keys: ['1'],
    action: 'Grade: Again (🔴 Reset)',
    category: 'review',
    description: 'Forgot concept: resets SM-2 review interval to 1 day for tomorrow',
  },
  {
    keys: ['2'],
    action: 'Grade: Hard (🟡 2 Days)',
    category: 'review',
    description: 'Difficult recall: schedules quick review in 2 days to reinforce memory',
  },
  {
    keys: ['3'],
    action: 'Grade: Good (🟢 6 Days)',
    category: 'review',
    description: 'Standard successful recall: advances interval according to ease factor',
  },
  {
    keys: ['4'],
    action: 'Grade: Easy (💎 16 Days)',
    category: 'review',
    description: 'Effortless recall: boosts interval and increases memory stability',
  },

  // Multi-Perspective Modes
  {
    keys: ['Tab Bar'],
    action: 'Switch Study Mode',
    category: 'modes',
    description: 'Switch between In-Depth, Quick Tricks, Interview Q&A, and Real-World Code',
  },
  {
    keys: ['+ Add Mode'],
    action: 'Create Custom Study Mode',
    category: 'modes',
    description: 'Create unlimited personalized perspectives (e.g. Cheat Sheet, Edge Cases)',
  },
  {
    keys: ['...'],
    action: 'Configure / Rename Mode',
    category: 'modes',
    description: 'Rename custom mode tab or change its visual icon',
  },
];

export function LandingPage() {
  const { setActiveView, setIsQuickCaptureOpen, setIsCommandPaletteOpen } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [activeFeatureTab, setActiveFeatureTab] = useState<'srs' | 'modes' | 'diagrams' | 'recall' | 'cloud' | 'dsa'>('modes');
  const [shortcutFilter, setShortcutFilter] = useState<'all' | 'global' | 'editor' | 'review' | 'modes'>('all');
  const [shortcutSearch, setShortcutSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredShortcuts = SHORTCUTS.filter((s) => {
    const matchesCategory = shortcutFilter === 'all' || s.category === shortcutFilter;
    const matchesSearch =
      shortcutSearch === '' ||
      s.action.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
      s.keys.join(' ').toLowerCase().includes(shortcutSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyCmd = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* 🌟 1. Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--surface)]/80 border-b border-[var(--border)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <DevForgeLogo size="md" showText={true} />
          </div>

          {/* Nav Links & Action */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-[var(--muted)]">
              <a href="#about" className="hover:text-[var(--foreground)] transition-colors">
                About
              </a>
              <a href="#features" className="hover:text-[var(--foreground)] transition-colors">
                Core Features
              </a>
              <a href="#modes" className="hover:text-[var(--foreground)] transition-colors">
                Study Modes
              </a>
              <a href="#shortcuts" className="hover:text-[var(--foreground)] transition-colors">
                Shortcuts
              </a>
              <a
                href="https://github.com/ankush270/DevForge"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </nav>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              title="Toggle Dark / Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Primary Launch CTA */}
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs sm:text-sm font-semibold animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Master Engineering Interviews Without Forgetting Concepts</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] max-w-4xl mx-auto leading-[1.15]">
            The Modern Note & Recall System Engineered for{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              Software Developers
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            Standard notes fail under interview pressure. <strong>DevForge</strong> pairs{' '}
            <span className="text-[var(--foreground)] font-semibold">SuperMemo SM-2 Spaced Repetition</span> with{' '}
            <span className="text-[var(--foreground)] font-semibold">Multi-Perspective Study Modes</span>, interactive Mermaid architecture diagrams, and real-time cloud sync.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Open DevForge Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#shortcuts"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4 text-indigo-400" />
              <span>Keyboard Shortcuts</span>
            </a>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8">
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-indigo-400">SM-2</div>
              <div className="text-xs text-[var(--muted)] font-medium">Spaced Repetition Algorithm</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-amber-400">4+ Modes</div>
              <div className="text-xs text-[var(--muted)] font-medium">Depth, Tricks, Traps, Code</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">100% Free</div>
              <div className="text-xs text-[var(--muted)] font-medium">Local-First & Open Source</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-black text-blue-400">Zero Lock-In</div>
              <div className="text-xs text-[var(--muted)] font-medium">1-Click Markdown ZIP Export</div>
            </div>
          </div>
        </div>

        {/* 💻 Interactive Hero Mockup Visual */}
        <div className="max-w-5xl mx-auto mt-12 px-4 sm:px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Mock Window Top Bar */}
            <div className="px-4 py-3 bg-[var(--surface-hover)] border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-[var(--muted)] font-mono ml-2 hidden sm:inline">
                  devforge://virtual-memory-paging
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Supabase Cloud Synced</span>
              </div>
            </div>

            {/* Mock Editor Modes Bar */}
            <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3 overflow-x-auto text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold flex items-center gap-1.5 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>In-Depth (Architecture)</span>
                </span>
                <span className="px-3 py-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Tricks</span>
                </span>
                <span className="px-3 py-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 font-semibold">
                  <Target className="w-3.5 h-3.5 text-rose-400" />
                  <span>Interview Q&A</span>
                </span>
                <span className="px-3 py-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 font-semibold">
                  <Code className="w-3.5 h-3.5 text-blue-400" />
                  <span>Real-World / Code</span>
                </span>
              </div>
              <span className="hidden md:inline-flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                <Flame className="w-3.5 h-3.5" />
                <span>Decay Radar: Retention 98%</span>
              </span>
            </div>

            {/* Mock Canvas Content */}
            <div className="p-6 sm:p-8 space-y-4 text-left font-sans">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">
                  Virtual Memory & Page Replacement Mechanics
                </h3>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                  SM-2 Mastery: GREEN
                </span>
              </div>

              <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                Virtual memory decouples logical program addresses from physical DRAM, creating an illusion of contiguous memory via hardware-level MMU address translations.
              </p>

              {/* Mock Active Recall Spoiler */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>🎯 Active Recall Question:</span>
                  <span className="underline cursor-pointer">Tap to Reveal Answer</span>
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  What causes Page Fault Thrashing and how does the Linux Kernel detect working sets?
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📖 3. About DevForge (The Core Problem & Architecture) */}
      <section id="about" className="py-16 sm:py-24 border-t border-[var(--border)] bg-[var(--surface)]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Why We Built DevForge
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
              Traditional Note-Taking Fails Engineering Interviews
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto">
              Preparing for FAANG, startups, and top engineering roles requires fast, reflexive recall under pressure — not passive reading.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="p-6 sm:p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base sm:text-lg">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">❌</div>
                <span>Traditional Note Apps (Notion / Google Docs)</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--muted)]">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>The Forgetting Curve:</strong> You read 20 pages of OS & System Design, but forget 75% within 48 hours without scheduled repetition.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Flat 1-Dimensional Text:</strong> Real interviews require distinct views: fast shortcuts, in-depth architecture, and interview traps.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Sluggish & Clunky:</strong> Heavy electron apps with complex databases that slow down quick idea capture.</span>
                </li>
              </ul>
            </div>

            {/* The DevForge Way */}
            <div className="p-6 sm:p-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-base sm:text-lg">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">⚡</div>
                <span>The DevForge Engineering OS</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--foreground)]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>SuperMemo SM-2 Decay Engine:</strong> Automatically calculates review intervals (1d, 6d, 16d) and highlights concepts before they fade.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Multi-Perspective Study Modes:</strong> Every topic contains separate tabs for Deep Dive, Quick Tricks, Interview Q&A, and Code.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Lock-in & Cloud Sync:</strong> Fast local-first offline storage + Supabase PostgreSQL real-time sync + 1-Click Markdown ZIP export.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ⚡ 4. Core Features Deep Dive */}
      <section id="features" className="py-16 sm:py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Engineered For Mastery
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
              Everything You Need To Crack Top Engineering Rounds
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto">
              Explore the key capabilities that turn passive reading into permanent retention.
            </p>
          </div>

          {/* Feature Tabs Selector */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id: 'modes', label: 'Multi-Perspective Modes', icon: BookOpen },
              { id: 'srs', label: 'SM-2 Spaced Repetition', icon: RotateCcw },
              { id: 'diagrams', label: 'Interactive Architecture', icon: Layers },
              { id: 'recall', label: 'Active Recall & Practice', icon: Target },
              { id: 'cloud', label: 'Supabase Cloud Sync', icon: Cloud },
              { id: 'dsa', label: 'DSA Complexity Tracker', icon: Code },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Feature Preview Card */}
          <div className="p-6 sm:p-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl transition-all">
            {activeFeatureTab === 'modes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    Multi-Perspective Study Modes
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                    A single long page is impossible to revise right before an interview. DevForge splits each concept into dedicated study modes:
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--foreground)]">
                    <li>📖 <strong>In-Depth:</strong> Comprehensive architectural theory and inner workings.</li>
                    <li>⚡ <strong>Quick Tricks:</strong> Mnemonics, rules of thumb, and formulas.</li>
                    <li>🎯 <strong>Interview Q&A:</strong> Counter-intuitive trade-offs and tricky trap questions.</li>
                    <li>🛠️ <strong>Real-World Code:</strong> Linux C/C++, Java, or Go production implementations.</li>
                    <li>➕ <strong>Custom User Modes:</strong> Add your own modes with custom names and icons!</li>
                  </ul>
                </div>
                <div className="p-5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] space-y-3 font-mono text-xs">
                  <div className="text-[var(--muted)]">// Every note has its own separate content tab:</div>
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-indigo-500/30 text-indigo-300">
                    Mode 1: In-Depth (Theory & Internal Architecture)
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-amber-500/30 text-amber-300">
                    Mode 2: Quick Tricks (Mnemonics & Shortcuts)
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-emerald-500/30 text-emerald-300">
                    Mode 3: Interview Traps (Common Mistakes & FAQs)
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-blue-500/30 text-blue-300">
                    Mode 4: Custom User Mode (+ Add Mode button)
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'srs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    SuperMemo SM-2 & Decay Radar
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                    DevForge implements the scientific SuperMemo SM-2 spaced repetition algorithm. The system tracks your repetition count, interval days, and ease factors.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--foreground)]">
                    <li>🔴 <strong>Decaying Radar:</strong> Warns you when memory retention for a concept is expiring.</li>
                    <li>⚡ <strong>Adaptive Intervals:</strong> Ratings (Again, Hard, Good, Easy) adapt schedules automatically.</li>
                    <li>🛡️ <strong>Fatigue Protection:</strong> Daily review caps prevent burn-out before interview day.</li>
                  </ul>
                </div>
                <div className="p-5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
                    <span>SPACED REPETITION SCHEDULE</span>
                    <span className="text-emerald-400">SM-2 Math</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-rose-500/25 flex justify-between">
                      <span>Rating 1 (Again)</span>
                      <span className="font-bold text-rose-400">Next Review: Tomorrow (1d)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-amber-500/25 flex justify-between">
                      <span>Rating 2 (Hard)</span>
                      <span className="font-bold text-amber-400">Next Review: In 2 Days</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-emerald-500/25 flex justify-between">
                      <span>Rating 3 (Good)</span>
                      <span className="font-bold text-emerald-400">Next Review: In 6 Days</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-blue-500/25 flex justify-between">
                      <span>Rating 4 (Easy)</span>
                      <span className="font-bold text-blue-400">Next Review: In 16 Days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'diagrams' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    Mermaid Architecture & Database Flowcharts
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                    System design interviews demand architectural diagrams. DevForge renders Mermaid.js code blocks directly inside notes with zero external plugins.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--foreground)]">
                    <li>📐 <strong>Microservice & Gateway Flows:</strong> Flowcharts showing load balancers, caching, and services.</li>
                    <li>🗄️ <strong>Database ER Schemas:</strong> Relational entity relationships and foreign keys.</li>
                    <li>🔄 <strong>Sequence Flows:</strong> Step-by-step API handshakes and distributed messaging.</li>
                  </ul>
                </div>
                <div className="p-5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs space-y-2 text-indigo-300">
                  <div className="text-[var(--muted)]">// Insert with 1 click from Editor Toolbar:</div>
                  <pre className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] overflow-x-auto text-[11px] leading-relaxed">
{`\`\`\`mermaid
graph TD
    Client[Browser / Mobile] --> LB[Load Balancer]
    LB --> API[API Gateway]
    API --> Cache[(Redis Cache)]
    API --> DB[(PostgreSQL)]
\`\`\``}
                  </pre>
                </div>
              </div>
            )}

            {activeFeatureTab === 'recall' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    Active Recall & In-Place Practice Blurring
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                    Test yourself before peeking at answers. DevForge supports clickable spoiler syntax and in-place answer blurring.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--foreground)]">
                    <li>🎯 <strong>Active Recall Spoilers:</strong> Use <code>:::recall[Question]</code> to hide critical answers until clicked.</li>
                    <li>👁️ <strong>Practice Blur Toggle:</strong> Click Practice button to blur all note text and test your memory recall.</li>
                  </ul>
                </div>
                <div className="p-5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="text-amber-400 font-bold">🎯 Question: What is CAP theorem?</div>
                    <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] italic">
                      [Tap or Click to Reveal Answer]
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'cloud' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    Supabase Real-Time Cloud Database Sync
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                    DevForge is local-first (works 100% offline via localStorage) and can seamlessly sync to your personal Supabase PostgreSQL database in real-time.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--foreground)]">
                    <li>🔒 <strong>Your Data, Your Cloud:</strong> Connects directly to your own Supabase project.</li>
                    <li>🔄 <strong>Real-time Multi-Device Sync:</strong> Edit on laptop, study on tablet.</li>
                    <li>📦 <strong>1-Click ZIP Export:</strong> Zero vendor lock-in. Export all notes as markdown at any time.</li>
                  </ul>
                </div>
                <div className="p-5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Supabase Real-Time Channel Connected</span>
                  </div>
                  <div className="text-[var(--muted)] text-[11px] leading-relaxed">
                    Automatic debounced auto-sync saves every keystroke safely to PostgreSQL table <code>interview_os_state</code>.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'dsa' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    LeetCode / DSA Complexity Badges
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                    Tag algorithm notes with Time & Space complexity metrics and direct links to LeetCode/Codeforces problem statements.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--foreground)]">
                    <li>⚡ <strong>Time & Space Complexity:</strong> O(N log N) Time and O(1) Space badges on every DSA problem.</li>
                    <li>🔗 <strong>Direct LeetCode Link:</strong> 1-click external link opens the problem directly in LeetCode.</li>
                  </ul>
                </div>
                <div className="p-5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold">O(N log N) Time</span>
                    <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold">O(1) Space</span>
                  </div>
                  <div className="text-[var(--muted)] text-xs mt-2">
                    Trapping Rain Water #42 — Two Pointer Technique
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ⌨️ 5. Master Keyboard Shortcuts Hub */}
      <section id="shortcuts" className="py-16 sm:py-24 border-t border-[var(--border)] bg-[var(--surface)]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Speed & Fluidity
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
              Master DevForge Keyboard Shortcuts
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto">
              Everything in DevForge is engineered for blazing speed without touching your mouse.
            </p>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Shortcuts' },
                { id: 'global', label: 'Global' },
                { id: 'editor', label: 'Editor' },
                { id: 'review', label: 'SRS Review' },
                { id: 'modes', label: 'Modes' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setShortcutFilter(c.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    shortcutFilter === c.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Quick Filter Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={shortcutSearch}
                onChange={(e) => setShortcutSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] outline-none focus:border-indigo-500 placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShortcuts.map((item, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/40 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.keys.map((k, ki) =>
                      k === 'or' ? (
                        <span key={ki} className="text-xs text-[var(--muted)] px-0.5">
                          or
                        </span>
                      ) : (
                        <kbd
                          key={ki}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--foreground)] shadow-sm"
                        >
                          {k}
                        </kbd>
                      )
                    )}
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors">
                    {item.action}
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 6. Call To Action Banner */}
      <section className="py-20 border-t border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex justify-center">
            <DevForgeLogo size="lg" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
            Ready to Build Your Engineering Second Brain?
          </h2>

          <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl mx-auto">
            Start completely clean or sync with your cloud database. Fast, private, open-source, and free forever.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>Launch DevForge Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 📄 7. Clean Footer */}
      <footer className="py-8 border-t border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--foreground)]">DevForge</span>
            <span>— The Engineering Interview Operating System</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/ankush270/DevForge"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--foreground)] transition-colors flex items-center gap-1 font-semibold"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setActiveView('dashboard')}
              className="hover:text-[var(--foreground)] transition-colors font-semibold cursor-pointer"
            >
              Open App
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
