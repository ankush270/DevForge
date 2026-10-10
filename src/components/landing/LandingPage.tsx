'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { DevForgeLogo } from '@/components/common/DevForgeLogo';
import {
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
  RotateCcw,
  Cpu,
  FileText,
  Activity,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Bookmark,
  Database,
  LockKeyhole,
  GitBranch,
  Boxes,
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
    description: 'Reflexive recall: advances interval and increases memory stability',
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
  const { setActiveView, setIsCommandPaletteOpen } = useApp();
  const { user, openAuthModal, signOut } = useAuth();

  const [activeFeatureTab, setActiveFeatureTab] = useState<'srs' | 'modes' | 'diagrams' | 'recall' | 'cloud' | 'dsa'>('modes');
  const [interactiveModePreview, setInteractiveModePreview] = useState<'depth' | 'tricks' | 'traps' | 'code'>('depth');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-sky-500/25 selection:text-sky-300">
      {/* 🧭 Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--surface)]/90 border-b border-[var(--border)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Version */}
          <div className="flex items-center gap-3">
            <DevForgeLogo size="md" showText={true} />
            <span className="hidden sm:inline-block font-mono text-[11px] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)]">
              v2.4
            </span>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-[var(--muted)]">
              <a href="#about" className="hover:text-[var(--foreground)] transition-colors">
                Architecture
              </a>
              <a href="#modes" className="hover:text-[var(--foreground)] transition-colors">
                Study Modes
              </a>
              <a href="#features" className="hover:text-[var(--foreground)] transition-colors">
                Features
              </a>
              <a href="#shortcuts" className="hover:text-[var(--foreground)] transition-colors">
                Keybindings
              </a>
              <a
                href="https://github.com/ankush270/DevForge"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--foreground)] transition-colors flex items-center gap-1 font-mono text-xs"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </nav>

            {/* User Profile or Sign In CTA */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block font-mono text-xs text-sky-400">
                  @{user.name || user.email.split('@')[0]}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--foreground)] hover:border-sky-500/50 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Primary Launch CTA */}
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all cursor-pointer"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 🛠️ Hero Section (Structured Blueprint Aesthetic, Zero Glow Blobs) */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-[var(--border)] blueprint-grid">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Engineering Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[var(--foreground)] font-semibold">DEVFORGE WORKBENCH</span>
            <span className="text-[var(--border)]">|</span>
            <span>SUPERMEMO SM-2 INTERVAL ENGINE</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--foreground)] max-w-4xl mx-auto leading-[1.12]">
            The Personal Interview Operating System for Software Engineers
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-[var(--muted)] max-w-3xl mx-auto leading-relaxed">
            Software engineers forget 75% of System Design, OS, and DBMS concepts within 48 hours of passive reading. DevForge enforces active recall flash-intervals, multi-perspective study views, and live architectural flowcharts.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2.5 px-6 py-3 rounded-lg font-bold text-sm sm:text-base bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Local Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#shortcuts"
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm sm:text-base border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4 text-sky-400" />
              <span>Keybindings Reference</span>
            </a>
          </div>

          {/* Technical Specifications Matrix */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 text-left">
            <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              <div className="font-mono text-xs text-[var(--muted)] uppercase font-semibold">Decay Engine</div>
              <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">SuperMemo SM-2</div>
              <div className="text-[11px] text-[var(--muted)] mt-1">Adaptive ease factor 1.3 - 2.5</div>
            </div>
            <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              <div className="font-mono text-xs text-[var(--muted)] uppercase font-semibold">Perspective Tabs</div>
              <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">4+ Modular Modes</div>
              <div className="text-[11px] text-[var(--muted)] mt-1">Theory, Tricks, Traps, Code</div>
            </div>
            <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              <div className="font-mono text-xs text-[var(--muted)] uppercase font-semibold">Storage Architecture</div>
              <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">Local-First Engine</div>
              <div className="text-[11px] text-[var(--muted)] mt-1">100% offline + Supabase cloud</div>
            </div>
            <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              <div className="font-mono text-xs text-[var(--muted)] uppercase font-semibold">Diagram Engine</div>
              <div className="text-sm font-bold text-[var(--foreground)] mt-0.5">Native Mermaid.js</div>
              <div className="text-[11px] text-[var(--muted)] mt-1">Flowcharts, ERDs & Sequence</div>
            </div>
          </div>
        </div>

        {/* 💻 Live Interactive Workbench Console (Functional, NOT a static fake Mac mockup) */}
        <div className="max-w-5xl mx-auto mt-12 px-4 sm:px-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden">
            {/* Terminal Workspace Header Bar */}
            <div className="px-4 py-2.5 bg-[var(--surface-hover)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[var(--foreground)] font-semibold">devforge://workspace/systems/virtual-memory-and-tlb</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>SM-2 Memory State: Mastered</span>
                </span>
                <span className="text-[var(--muted)] hidden sm:inline">|</span>
                <span className="text-[var(--muted)] hidden sm:inline">Next Review: In 6 Days</span>
              </div>
            </div>

            {/* Interactive Mode Switcher Tabs */}
            <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-2 overflow-x-auto text-xs">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'depth', label: 'In-Depth Theory', icon: BookOpen },
                  { id: 'tricks', label: 'Quick Tricks & Mnemonics', icon: Bookmark },
                  { id: 'traps', label: 'Interview Traps & Q&A', icon: Target },
                  { id: 'code', label: 'Linux C/C++ Code', icon: Code },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = interactiveModePreview === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setInteractiveModePreview(mode.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-sky-600 text-white font-semibold'
                          : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-mono text-[var(--muted)] hidden md:inline">
                Click tabs to switch perspective
              </span>
            </div>

            {/* Live Mode Content Viewer */}
            <div className="p-6 sm:p-8 space-y-4 text-left font-sans text-xs sm:text-sm">
              {interactiveModePreview === 'depth' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      Virtual Memory Paging & Multi-Level Page Tables
                    </h3>
                    <span className="font-mono text-[11px] text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded">
                      x86_64 CR3 Register
                    </span>
                  </div>
                  <p className="text-[var(--muted)] leading-relaxed">
                    Virtual addresses are translated to physical DRAM addresses by the MMU using Translation Lookaside Buffers (TLB). On a TLB miss, a hardware page table walk traverses the 4-level page hierarchy (PML4, PDPT, PD, PT).
                  </p>
                  <div className="p-3.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-[11px] text-slate-300">
                    <div>Virtual Address (48-bit canonical):</div>
                    <div className="text-sky-400 mt-1">
                      [ Sign Ext 16b ] [ PML4: 9b ] [ PDPT: 9b ] [ PD: 9b ] [ PT: 9b ] [ Offset: 12b (4KB page) ]
                    </div>
                  </div>
                </div>
              )}

              {interactiveModePreview === 'tricks' && (
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Memory Management Rules of Thumb & Mnemonics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)]">
                      <span className="font-bold text-sky-400 block mb-1">TLB Reach Formula:</span>
                      <code>TLB Reach = Number of TLB Entries × Page Size</code>
                      <p className="text-[var(--muted)] text-[11px] mt-1">Use HugePages (2MB / 1GB) to multiply TLB reach by 512x without increasing hardware footprint.</p>
                    </div>
                    <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)]">
                      <span className="font-bold text-amber-400 block mb-1">Working Set Model (Thrashing):</span>
                      <code>Total Working Set &gt; Total DRAM ⇒ Thrashing</code>
                      <p className="text-[var(--muted)] text-[11px] mt-1">CPU utilization drops towards zero while disk I/O queue approaches 100% saturation.</p>
                    </div>
                  </div>
                </div>
              )}

              {interactiveModePreview === 'traps' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      Active Recall: Common Technical Traps
                    </h3>
                    <span className="text-[11px] font-mono text-[var(--muted)]">Interactive Flash-Card</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] space-y-2">
                    <div className="font-semibold text-[var(--foreground)]">
                      Q: Why does Belady&apos;s Anomaly occur in FIFO page replacement, and why is LRU provably immune?
                    </div>
                    {isAnswerRevealed ? (
                      <div className="p-3 rounded bg-[var(--surface)] border border-emerald-500/30 text-[var(--foreground)] text-xs leading-relaxed animate-in fade-in">
                        <strong className="text-emerald-400 block mb-1">Answer:</strong>
                        FIFO violates the <em>Stack Property</em>. In LRU, the set of pages in memory for <code>n</code> frames is always a strict subset of the pages for <code>n+1</code> frames (inclusion property). FIFO replacement ignores recency, so adding frames can discard critical pages prematurely.
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAnswerRevealed(true)}
                        className="px-3 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-sky-400 hover:border-sky-500/50 cursor-pointer"
                      >
                        [ Click to Reveal Active Recall Answer ]
                      </button>
                    )}
                  </div>
                </div>
              )}

              {interactiveModePreview === 'code' && (
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                    Kernel Level Virtual Memory Inspection (Linux C)
                  </h3>
                  <div className="p-3.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-[11px] text-slate-300 overflow-x-auto">
                    <pre>{`// Inspect memory mappings via mincore(2) system call
#include <sys/mman.h>
#include <unistd.h>

int is_page_in_ram(void *addr) {
    unsigned char vec[1];
    long page_size = sysconf(_SC_PAGESIZE);
    void *page_base = (void *)((uintptr_t)addr & ~(page_size - 1));
    if (mincore(page_base, page_size, vec) == 0) {
        return (vec[0] & 1); // Returns 1 if resident in physical DRAM
    }
    return -1;
}`}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 📖 Section 2: Architecture & Philosophy (#about) */}
      <section id="about" className="py-16 sm:py-20 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-left max-w-3xl space-y-2">
            <span className="font-mono text-xs text-sky-400 uppercase tracking-wider font-semibold">
              // ARCHITECTURAL RATIONALE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              Why Traditional Note Tools Fail Technical Interviews
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              General-purpose note tools are built for archival, not reflexive technical recall under high-stress interview conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Failure of Passive Archival */}
            <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="font-mono text-xs font-bold text-rose-400 uppercase">
                Traditional Notes (Notion / Obsidian / Docs)
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--muted)]">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>The 48-Hour Decay Curve:</strong> Engineers write extensive 15-page documents but retain less than 25% after one week without scheduled spaced reinforcement.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Flat 1-Dimensional Text:</strong> Reading theory does not prepare you for rapid trade-off grilling or tricky corner cases asked by interviewers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Zero Recall Testing:</strong> You trick yourself into believing you understand a concept simply because you read your own summarized text.</span>
                </li>
              </ul>
            </div>

            {/* The DevForge Engineered System */}
            <div className="p-6 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-4">
              <div className="font-mono text-xs font-bold text-sky-400 uppercase">
                The DevForge Personal Interview OS
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--foreground)]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>SuperMemo SM-2 Interval Math:</strong> Automatically schedules review dates based on recall ease (1d, 6d, 16d) and highlights rotting concepts before interview rounds.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Multi-Perspective Modes:</strong> Keeps architecture theory, quick tricks, interview trap questions, and production implementations cleanly segregated.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Active Recall Enforcement:</strong> Native spoiler tags and in-place blurring force you to retrieve answers from memory before revealing them.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 📚 Section 3: Study Modes Deep Dive (#modes) */}
      <section id="modes" className="py-16 sm:py-20 border-b border-[var(--border)] blueprint-dots">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-left max-w-3xl space-y-2">
            <span className="font-mono text-xs text-sky-400 uppercase tracking-wider font-semibold">
              // MULTI-PERSPECTIVE STUDY ENGINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              Four Specialized Lenses for Every Single Topic
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Every note in DevForge contains distinct perspective tabs so you can review at exactly the level of depth required at any moment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-sky-400">
                <BookOpen className="w-4 h-4" />
                <span>Mode 1: In-Depth</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Architecture & RFC Specs</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Complete internal mechanisms, data structure layouts, protocol handshakes, and distributed consensus math.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                <Bookmark className="w-4 h-4" />
                <span>Mode 2: Quick Tricks</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Mnemonics & Short Formulas</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Rules of thumb, time & space metrics, and rapid heuristics for back-of-the-envelope calculations during rounds.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-400">
                <Target className="w-4 h-4" />
                <span>Mode 3: Interview Traps</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Counter-Intuitive Questions</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                The exact tricky questions interviewers ask to distinguish candidates who memorized from candidates who deeply understand.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400">
                <Code className="w-4 h-4" />
                <span>Mode 4: Production Code</span>
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">Real-World Implementations</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Clean, idiomatic system code in C/C++, Java, Python, or Go demonstrating concrete algorithms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ⚙️ Section 4: Core Capabilities (#features) */}
      <section id="features" className="py-16 sm:py-20 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-left max-w-3xl space-y-2">
            <span className="font-mono text-xs text-sky-400 uppercase tracking-wider font-semibold">
              // CORE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              Engineered for Complete Technical Retention
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Explore the key engineering components that turn passive study into permanent technical reflexes.
            </p>
          </div>

          {/* Feature Selector Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'modes', label: 'Study Modes', icon: BookOpen },
              { id: 'srs', label: 'SM-2 Algorithm Math', icon: RotateCcw },
              { id: 'diagrams', label: 'Mermaid Diagrams', icon: Layers },
              { id: 'recall', label: 'Active Recall Spoilers', icon: Target },
              { id: 'cloud', label: 'Supabase PostgreSQL Sync', icon: Cloud },
              { id: 'dsa', label: 'DSA Complexity Badges', icon: Code },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Feature Presentation Panel */}
          <div className="p-6 sm:p-8 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {activeFeatureTab === 'modes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <span className="font-mono text-xs text-sky-400 font-bold uppercase">Dynamic Mode Architecture</span>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    Never Cram A Giant Document Again
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    Long linear documents are unreadable before an interview sprint. DevForge isolates concerns: review architecture when deep learning, and switch to quick mnemonics or interview traps right before heading into the room.
                  </p>
                  <div className="text-xs text-[var(--muted)] space-y-1 pt-1">
                    <div>• <strong>Custom Extensibility:</strong> Add your own study modes (e.g. &apos;Edge Cases&apos; or &apos;Live Coding Pitfalls&apos;) with custom names and icons.</div>
                    <div>• <strong>Instant Tab Switching:</strong> Seamless keyboard navigation between all perspectives.</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs space-y-2 text-slate-300">
                  <div className="text-[var(--muted)]">// Separate storage schema per perspective:</div>
                  <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--border)] text-sky-300">
                    mode_depth: &quot;Virtual addresses decoupled from DRAM...&quot;
                  </div>
                  <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--border)] text-amber-300">
                    mode_tricks: &quot;HugePages = 512x TLB reach without CPU penalty&quot;
                  </div>
                  <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--border)] text-emerald-300">
                    mode_traps: &quot;Belady Anomaly occurs only when Stack Property fails&quot;
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'srs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <span className="font-mono text-xs text-sky-400 font-bold uppercase">Scientific Spaced Repetition</span>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    SuperMemo SM-2 Decay Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    DevForge calculates optimal review dates using the proven SM-2 recurrence relation. When memory retention for a concept begins to decay, it automatically queues for review.
                  </p>
                  <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-[11px] text-slate-300">
                    <code>EF&apos; = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))</code>
                  </div>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] border border-rose-500/25 flex justify-between">
                    <span>Grade 1 (Again / Forgot)</span>
                    <span className="text-rose-400 font-bold">Next Review: Tomorrow (1 Day)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] border border-amber-500/25 flex justify-between">
                    <span>Grade 2 (Hard / Struggled)</span>
                    <span className="text-amber-400 font-bold">Next Review: In 2 Days</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] border border-emerald-500/25 flex justify-between">
                    <span>Grade 3 (Good / Standard)</span>
                    <span className="text-emerald-400 font-bold">Next Review: In 6 Days</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] border border-sky-500/25 flex justify-between">
                    <span>Grade 4 (Easy / Reflexive)</span>
                    <span className="text-sky-400 font-bold">Next Review: In 16 Days</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'diagrams' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <span className="font-mono text-xs text-sky-400 font-bold uppercase">System Design Visualization</span>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    Native Mermaid.js Architecture Rendering
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    System design interviews demand architectural clarity. DevForge renders Mermaid diagrams directly inside notes without external image dependencies or third-party plugins.
                  </p>
                  <div className="text-xs text-[var(--muted)] space-y-1">
                    <div>• <strong>Microservices & Load Balancers:</strong> Flowcharts showing gateways and caches.</div>
                    <div>• <strong>Database ER Schemas:</strong> Relational tables, foreign keys, and indexes.</div>
                    <div>• <strong>Distributed Sequences:</strong> Two-phase commit and Raft leader elections.</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs text-sky-300">
                  <div className="text-[var(--muted)] text-[11px] mb-2">// Direct markdown code-block execution:</div>
                  <pre className="p-3 rounded bg-[var(--surface)] border border-[var(--border)] overflow-x-auto text-[11px] leading-relaxed">
{`\`\`\`mermaid
graph TD
    Client[Browser / App] --> LB[Load Balancer]
    LB --> Gateway[API Gateway]
    Gateway --> Cache[(Redis Cache)]
    Gateway --> DB[(PostgreSQL)]
\`\`\``}
                  </pre>
                </div>
              </div>
            )}

            {activeFeatureTab === 'recall' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <span className="font-mono text-xs text-sky-400 font-bold uppercase">Cognitive Science</span>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    In-Place Active Recall Spoilers
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    Test yourself before looking at the solution. DevForge provides clickable spoiler blocks and an in-place Practice Blurring mode that hides all answers until toggled.
                  </p>
                  <div className="text-xs text-[var(--muted)] space-y-1">
                    <div>• <strong>Spoiler Syntax:</strong> Use <code>:::recall[Question]</code> to obscure critical answers.</div>
                    <div>• <strong>Practice Mode:</strong> 1-click blur toggle hides text while leaving headings exposed.</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-amber-500/30 space-y-2">
                    <div className="text-amber-400 font-bold">🎯 Question: What is the CAP theorem trade-off in distributed consensus?</div>
                    <div className="p-2 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--muted)] italic">
                      [Tap to test recall and reveal explanation]
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'cloud' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <span className="font-mono text-xs text-sky-400 font-bold uppercase">PostgreSQL Cloud Sync</span>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    Real-Time Database Sync With Supabase
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    DevForge is local-first (functions 100% offline via localStorage) and syncs directly to your personal Supabase PostgreSQL database in real-time.
                  </p>
                  <div className="text-xs text-[var(--muted)] space-y-1">
                    <div>• <strong>Your Database:</strong> Connects to your own Supabase project with automated SQL setup.</div>
                    <div>• <strong>Multi-Device:</strong> Write on desktop, review flash-cards on mobile.</div>
                    <div>• <strong>Zero Lock-In:</strong> 1-click Markdown ZIP export backs up all notes at any time.</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PostgreSQL Real-Time Channel Connected</span>
                  </div>
                  <div className="text-[var(--muted)] text-[11px] leading-relaxed">
                    Debounced sync safely stores application state in PostgreSQL table <code>interview_os_state</code>.
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'dsa' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <span className="font-mono text-xs text-sky-400 font-bold uppercase">Algorithms & Data Structures</span>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">
                    Complexity Badges & Problem Linking
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    Categorize algorithm notes with explicit Time & Space complexity metrics and direct external links to LeetCode, NeetCode, or Codeforces problem statements.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">O(N log N) Time</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">O(1) Space</span>
                  </div>
                  <div className="text-[var(--muted)] text-xs mt-2">
                    LC #42 Trapping Rain Water — Two Pointer Algorithm
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ⌨️ Section 5: Keybindings Hub (#shortcuts) */}
      <section id="shortcuts" className="py-16 sm:py-20 border-b border-[var(--border)] blueprint-grid">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-left max-w-3xl space-y-2">
            <span className="font-mono text-xs text-sky-400 uppercase tracking-wider font-semibold">
              // KEYBOARD WORKFLOWS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              Master DevForge Keyboard Shortcuts
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Engineered for keyboard-driven speed so you can draft, tag, navigate, and review without touching your mouse.
            </p>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] p-1 rounded-lg overflow-x-auto w-full sm:w-auto font-mono text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'global', label: 'Global' },
                { id: 'editor', label: 'Editor' },
                { id: 'review', label: 'SRS Review' },
                { id: 'modes', label: 'Modes' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setShortcutFilter(c.id as any)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    shortcutFilter === c.id
                      ? 'bg-sky-600 text-white font-semibold'
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
                placeholder="Filter shortcuts..."
                value={shortcutSearch}
                onChange={(e) => setShortcutSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] outline-none focus:border-sky-500 placeholder:text-[var(--muted)] font-mono"
              />
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredShortcuts.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-sky-500/40 transition-all space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.keys.map((k, ki) =>
                      k === 'or' ? (
                        <span key={ki} className="text-xs text-[var(--muted)] px-0.5">
                          or
                        </span>
                      ) : (
                        <kbd
                          key={ki}
                          className="px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-mono font-semibold text-[var(--foreground)] shadow-xs"
                        >
                          {k}
                        </kbd>
                      )
                    )}
                  </div>

                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {item.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-sky-400 transition-colors">
                    {item.action}
                  </h4>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 Section 6: Launch Callout */}
      <section className="py-16 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <div className="inline-flex justify-center">
            <DevForgeLogo size="lg" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            Build Your Engineering Knowledge Base
          </h2>

          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
            Local-first, private, open-source, and free. Run locally in your browser or connect your Supabase database.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all cursor-pointer"
            >
              <span>Open DevForge Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 📄 Section 7: Clean Footer */}
      <footer className="py-6 bg-[var(--background)] text-xs text-[var(--muted)] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--foreground)] font-sans">DevForge</span>
            <span>— Engineering Interview Knowledge OS</span>
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
              Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
