'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  Zap,
  Flame,
  ChevronRight,
  ChevronDown,
  Plus,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  FolderPlus,
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Compass,
  Layers,
  Settings,
  Cloud,
  RefreshCw,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  Lock,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  renderSubjectIcon,
  SUBJECT_ICON_OPTIONS,
  SUBJECT_COLOR_OPTIONS,
} from '@/lib/subjectIcons';
import { DevForgeLogo } from '@/components/common/DevForgeLogo';

function SubjectIconPicker({
  selectedIcon,
  selectedColor,
  onSelectIcon,
  onSelectColor,
}: {
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (icon: string) => void;
  onSelectColor: (color: string) => void;
}) {
  return (
    <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl space-y-3">
      {/* Icon Selector Grid */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
          Choose Icon
        </span>
        <div className="grid grid-cols-5 gap-1.5 max-h-40 overflow-y-auto pr-1">
          {SUBJECT_ICON_OPTIONS.map(({ id, label, icon: IconComponent }) => {
            const isSelected = selectedIcon === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectIcon(id)}
                className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 ring-2 ring-indigo-500 shadow-sm'
                    : 'hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
                title={label}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selector */}
      <div className="pt-2.5 border-t border-[var(--border)]">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
          Accent Color
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {SUBJECT_COLOR_OPTIONS.map((c) => {
            const isSelected = selectedColor === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectColor(c.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-white scale-110 shadow-md' : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.colorHex }}
                title={c.label}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const {
    subjects,
    activeView,
    setActiveView,
    selectedNote,
    openNote,
    dueNotesQueue,
    streak,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsCommandPaletteOpen,
    setIsQuickCaptureOpen,
    setIsSettingsOpen,
    cloudStatus,
    setIsCloudSyncModalOpen,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    addNote,
    startRevisionQueue,
  } = useApp();

  const {
    user,
    signOut,
    openAuthModal,
    canEditSubject,
    canEditNote,
    requireAuth,
  } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Adding subject state with Icon and Color picker
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectIcon, setNewSubjectIcon] = useState('Cpu');
  const [newSubjectColor, setNewSubjectColor] = useState('indigo');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Edit existing subject state
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectTitle, setEditSubjectTitle] = useState('');
  const [editSubjectIcon, setEditSubjectIcon] = useState('Cpu');
  const [editSubjectColor, setEditSubjectColor] = useState('indigo');
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [menuSubjectId, setMenuSubjectId] = useState<string | null>(null);

  // Adding topic/note state
  const [activeTopicInput, setActiveTopicInput] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [activeNoteInput, setActiveNoteInput] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('create subjects')) return;
    if (!newSubjectTitle.trim()) return;
    const created = addSubject(newSubjectTitle.trim(), newSubjectIcon, newSubjectColor);
    setExpandedSubjects((prev) => ({ ...prev, [created.id]: true }));
    setNewSubjectTitle('');
    setNewSubjectIcon('Cpu');
    setNewSubjectColor('indigo');
    setIsAddingSubject(false);
    setShowIconPicker(false);
  };

  const handleStartEditSubject = (
    subject: { id: string; title: string; icon: string; color: string; userId?: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!canEditSubject(subject)) {
      requireAuth('edit this subject');
      return;
    }
    setEditingSubjectId(subject.id);
    setEditSubjectTitle(subject.title);
    setEditSubjectIcon(subject.icon || 'Cpu');
    setEditSubjectColor(subject.color || 'indigo');
    setShowEditIconPicker(false);
    setMenuSubjectId(null);
  };

  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubjectId || !editSubjectTitle.trim()) return;
    const target = subjects.find((s) => s.id === editingSubjectId);
    if (target && !canEditSubject(target)) {
      requireAuth('edit this subject');
      return;
    }
    updateSubject(editingSubjectId, {
      title: editSubjectTitle.trim(),
      icon: editSubjectIcon,
      color: editSubjectColor,
    });
    setEditingSubjectId(null);
    setShowEditIconPicker(false);
  };

  const handleDeleteSubject = (subjectId: string, subjectTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuSubjectId(null);
    const target = subjects.find((s) => s.id === subjectId);
    if (target && !canEditSubject(target)) {
      requireAuth('delete this subject');
      return;
    }
    if (confirm(`Delete subject "${subjectTitle}" and all its topics/notes?`)) {
      deleteSubject(subjectId);
    }
  };

  const handleCreateTopic = (subjectId: string) => {
    if (!newTopicTitle.trim()) return;
    const target = subjects.find((s) => s.id === subjectId);
    if (target && !canEditSubject(target)) {
      requireAuth('add topics to this subject');
      return;
    }
    if (!requireAuth('add topics')) return;
    const created = addTopic(subjectId, newTopicTitle.trim());
    setExpandedTopics((prev) => ({ ...prev, [created.id]: true }));
    setNewTopicTitle('');
    setActiveTopicInput(null);
  };

  const handleCreateNote = (topicId: string) => {
    if (!newNoteTitle.trim()) return;
    if (!requireAuth('create notes')) return;
    addNote(topicId, newNoteTitle.trim());
    setNewNoteTitle('');
    setActiveNoteInput(null);
  };

  if (isSidebarCollapsed) {
    return (
      <aside className="hidden md:flex flex-col items-center py-4 px-2 w-16 border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-200">
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="p-2.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors mb-4"
          title="Expand Sidebar (Ctrl + B)"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-3 w-full items-center">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`p-2.5 rounded-lg transition-colors ${
              activeView === 'dashboard'
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          <button
            onClick={() => startRevisionQueue()}
            className="relative p-2.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Due Revisions"
          >
            <Zap className="w-5 h-5" />
            {dueNotesQueue.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[var(--surface)]" />
            )}
          </button>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-2.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Search (Ctrl + K)"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-3 items-center">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 md:w-80 flex-shrink-0 h-full border-r border-[var(--border)] bg-[var(--surface)] flex flex-col transition-all duration-200">
      {/* Brand Header */}
      <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => setActiveView('dashboard')}
          title="DevForge - Return to Mission Control"
        >
          <DevForgeLogo size="md" showText={true} />
        </div>

        <button
          onClick={() => setIsSidebarCollapsed(true)}
          className="hidden md:flex p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Collapse Sidebar (Ctrl + B)"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* User Account / Guest Status Card */}
      <div className="px-3 pt-2.5 pb-1">
        {user ? (
          <div className="p-2.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 uppercase shadow-sm shadow-indigo-600/30">
                {user.name ? user.name[0] : user.email[0]}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[var(--foreground)] truncate">
                  {user.name || user.email.split('@')[0]}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Author Mode</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-amber-300">Guest Mode</div>
                <div className="text-[10px] text-[var(--muted)]">Read-Only View</div>
              </div>
            </div>
            <button
              onClick={() =>
                openAuthModal(
                  'signin',
                  'Sign in to create subjects and edit your notes.'
                )
              }
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Quick Mission Actions */}
      <div className="p-3 border-b border-[var(--border)] space-y-1">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'dashboard'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold'
              : 'text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Mission Control</span>
          </div>
          <span className="text-xs text-[var(--muted)] font-mono">⌘1</span>
        </button>

        <button
          onClick={() => setActiveView('landing')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'landing'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
          }`}
          title="Product Guide, Features & Shortcuts"
        >
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Guide & Shortcuts</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Guide
          </span>
        </button>

        <button
          onClick={() => startRevisionQueue()}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Due Revisions</span>
          </div>
          {dueNotesQueue.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
              {dueNotesQueue.length} Due
            </span>
          ) : (
            <span className="text-xs text-emerald-400 font-medium">Clear ✓</span>
          )}
        </button>

        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted)]">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Daily Streak</span>
          </div>
          <span className="font-bold text-orange-400 flex items-center gap-1 text-sm">
            {streak} Days 🔥
          </span>
        </div>

        <button
          onClick={() => {
            if (!requireAuth('create notes')) return;
            setIsQuickCaptureOpen(true);
          }}
          className="w-full mt-1.5 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Note</span>
          <kbd className="ml-auto text-xs bg-indigo-700/60 px-2 py-0.5 rounded font-mono">Ctrl+N</kbd>
        </button>
      </div>

      {/* Hierarchical Subject ➔ Topic ➔ Note Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
            Knowledge Base
          </span>
          <button
            onClick={() => {
              if (!requireAuth('create subjects')) return;
              setIsAddingSubject(true);
            }}
            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Add Subject"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">New</span>
          </button>
        </div>

        {/* New Subject Input Form with Icon & Color Picker */}
        {isAddingSubject && (
          <form onSubmit={handleCreateSubject} className="p-3 rounded-xl bg-[var(--surface-hover)] border border-indigo-500/30 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">Add New Subject</span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubject(false);
                  setShowIconPicker(false);
                }}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Title & Icon Selector Row */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g. Operating Systems"
                value={newSubjectTitle}
                onChange={(e) => setNewSubjectTitle(e.target.value)}
                autoFocus
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-indigo-500"
              />

              {/* Icon & Color Selector Trigger Button */}
              <button
                type="button"
                onClick={() => setShowIconPicker((prev) => !prev)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/40 text-xs font-medium cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)] font-semibold">Icon & Color:</span>
                  <div className="flex items-center gap-1.5">
                    {renderSubjectIcon(newSubjectIcon, newSubjectColor, "w-4 h-4")}
                    <span className="text-xs font-semibold text-[var(--foreground)] capitalize">{newSubjectIcon}</span>
                  </div>
                </div>
                <span className="text-xs text-indigo-400 font-semibold">{showIconPicker ? 'Close ▲' : 'Change Icon ▾'}</span>
              </button>
            </div>

            {/* Dropdown Icon & Color Grid */}
            {showIconPicker && (
              <SubjectIconPicker
                selectedIcon={newSubjectIcon}
                selectedColor={newSubjectColor}
                onSelectIcon={(ic) => setNewSubjectIcon(ic)}
                onSelectColor={(col) => setNewSubjectColor(col)}
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAddingSubject(false);
                  setShowIconPicker(false);
                }}
                className="px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newSubjectTitle.trim()}
                className="px-3.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                Create Subject
              </button>
            </div>
          </form>
        )}

        {/* Subjects Accordion List */}
        <div className="space-y-1">
          {subjects.length === 0 && !isAddingSubject && (
            <div className="p-4 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-hover)]/30 space-y-2.5 my-2">
              <Layers className="w-6 h-6 text-[var(--muted)] mx-auto opacity-50" />
              <p className="text-xs text-[var(--muted)]">No subjects yet.</p>
              <button
                type="button"
                onClick={() => setIsAddingSubject(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create First Subject</span>
              </button>
            </div>
          )}
          {subjects.map((subject) => {
            const isSubExpanded = expandedSubjects[subject.id] ?? true;
            const isEditing = editingSubjectId === subject.id;
            const isMenuOpen = menuSubjectId === subject.id;

            return (
              <div key={subject.id} className="space-y-0.5 relative">
                {isEditing ? (
                  /* Edit Subject Inline Form */
                  <form onSubmit={handleSaveEditSubject} className="p-3 rounded-xl bg-[var(--surface-hover)] border border-indigo-500/40 space-y-2.5 my-1 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">Edit Subject</span>
                      <button
                        type="button"
                        onClick={() => setEditingSubjectId(null)}
                        className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editSubjectTitle}
                        onChange={(e) => setEditSubjectTitle(e.target.value)}
                        autoFocus
                        className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg bg-[var(--surface)] border border-[var(--border)] outline-none text-[var(--foreground)] focus:border-indigo-500"
                      />

                      <button
                        type="button"
                        onClick={() => setShowEditIconPicker((prev) => !prev)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/40 text-xs font-medium cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--muted)] font-semibold">Icon & Color:</span>
                          <div className="flex items-center gap-1.5">
                            {renderSubjectIcon(editSubjectIcon, editSubjectColor, "w-4 h-4")}
                            <span className="text-xs font-semibold text-[var(--foreground)] capitalize">{editSubjectIcon}</span>
                          </div>
                        </div>
                        <span className="text-xs text-indigo-400 font-semibold">{showEditIconPicker ? 'Close ▲' : 'Change Icon ▾'}</span>
                      </button>
                    </div>

                    {showEditIconPicker && (
                      <SubjectIconPicker
                        selectedIcon={editSubjectIcon}
                        selectedColor={editSubjectColor}
                        onSelectIcon={(ic) => setEditSubjectIcon(ic)}
                        onSelectColor={(col) => setEditSubjectColor(col)}
                      />
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingSubjectId(null)}
                        className="px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!editSubjectTitle.trim()}
                        className="px-3.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Standard Subject Header Row */
                  <div
                    onClick={() => toggleSubject(subject.id)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-hover)] cursor-pointer group select-none transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isSubExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                      )}
                      {renderSubjectIcon(subject.icon, subject.color, "w-4 h-4")}
                      <span className="truncate">{subject.title}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!requireAuth('add topics')) return;
                          setActiveTopicInput(subject.id);
                          setExpandedSubjects((prev) => ({ ...prev, [subject.id]: true }));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--muted)] hover:text-indigo-400 hover:bg-[var(--surface)] transition-all cursor-pointer"
                        title="Add Topic"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuSubjectId(isMenuOpen ? null : subject.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-all cursor-pointer"
                          title="Subject Options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {/* Subject Action Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-1 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
                          >
                            {canEditSubject(subject) ? (
                              <>
                                <button
                                  onClick={(e) => handleStartEditSubject(subject, e)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] text-left transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Edit Icon & Name</span>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSubject(subject.id, subject.title, e)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Subject</span>
                                </button>
                              </>
                            ) : (
                              <div className="px-2.5 py-2 text-xs text-[var(--muted)] space-y-1">
                                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                                  <Lock className="w-3 h-3" />
                                  <span>Read-Only Subject</span>
                                </div>
                                <p className="text-[11px] leading-tight">
                                  Created by @{subject.authorEmail ? subject.authorEmail.split('@')[0] : 'author'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Topics */}
                {isSubExpanded && (
                  <div className="pl-4 ml-2 border-l border-[var(--border)] space-y-1 mt-0.5">
                    {/* Inline Add Topic Input */}
                    {activeTopicInput === subject.id && (
                      <div className="p-2 rounded bg-[var(--surface-hover)] border border-[var(--border)] my-1">
                        <input
                          type="text"
                          placeholder="Topic name (e.g. Concurrency)"
                          value={newTopicTitle}
                          onChange={(e) => setNewTopicTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateTopic(subject.id);
                            if (e.key === 'Escape') setActiveTopicInput(null);
                          }}
                          autoFocus
                          className="w-full text-xs sm:text-sm bg-transparent outline-none text-[var(--foreground)]"
                        />
                      </div>
                    )}

                    {subject.topics.map((topic) => {
                      const isTopExpanded = expandedTopics[topic.id] ?? false;
                      return (
                        <div key={topic.id} className="space-y-0.5">
                          {/* Topic Bar */}
                          <div
                            onClick={() => toggleTopic(topic.id)}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs sm:text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] cursor-pointer group select-none transition-colors"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {isTopExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                              )}
                              <span className="truncate">{topic.title}</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!requireAuth('create notes')) return;
                                setActiveNoteInput(topic.id);
                                setExpandedTopics((prev) => ({ ...prev, [topic.id]: true }));
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-indigo-400 transition-opacity"
                              title="Add Note"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Notes under Topic */}
                          {isTopExpanded && (
                            <div className="pl-3.5 ml-1.5 border-l border-[var(--border)] space-y-0.5">
                              {/* Inline Add Note Input */}
                              {activeNoteInput === topic.id && (
                                <div className="p-2 rounded bg-[var(--surface-hover)] border border-[var(--border)] my-1">
                                  <input
                                    type="text"
                                    placeholder="Note title..."
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCreateNote(topic.id);
                                      if (e.key === 'Escape') setActiveNoteInput(null);
                                    }}
                                    autoFocus
                                    className="w-full text-xs sm:text-sm bg-transparent outline-none text-[var(--foreground)]"
                                  />
                                </div>
                              )}

                              {topic.notes.map((note) => {
                                const isSelected = selectedNote?.id === note.id && activeView === 'editor';
                                const isAuthor = canEditNote(note);
                                return (
                                  <button
                                    key={note.id}
                                    onClick={() => openNote(note.id)}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs sm:text-[13px] transition-colors text-left group ${
                                      isSelected
                                        ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20'
                                        : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                                      <span className="truncate">{note.title}</span>
                                      {!isAuthor && (
                                        <span title={`Read-only: created by @${note.authorEmail ? note.authorEmail.split('@')[0] : 'author'}`}>
                                          <Lock className="w-2.5 h-2.5 text-amber-400 flex-shrink-0 opacity-70" />
                                        </span>
                                      )}
                                    </div>

                                    {/* Mastery Status Pill */}
                                    <span
                                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                        note.masteryLevel === 'GREEN'
                                          ? 'bg-emerald-500'
                                          : note.masteryLevel === 'YELLOW'
                                          ? 'bg-amber-500'
                                          : 'bg-rose-500 animate-pulse'
                                      }`}
                                      title={`Status: ${note.masteryLevel}`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls: Theme Toggle & Sync Status */}
      <div className="p-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
        <button
          onClick={() => setIsCloudSyncModalOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-md hover:bg-[var(--surface-hover)] transition-colors text-left cursor-pointer"
          title="Click to view Supabase Cloud Sync settings"
        >
          {cloudStatus === 'synced' && (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">Cloud Synced</span>
            </>
          )}
          {cloudStatus === 'syncing' && (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span className="text-xs font-medium text-blue-400">Syncing...</span>
            </>
          )}
          {cloudStatus === 'needs_setup' && (
            <>
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 underline decoration-amber-500/50">Setup Cloud</span>
            </>
          )}
          {(cloudStatus === 'offline' || cloudStatus === 'error') && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-[var(--muted)]">Saved Locally</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-md hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Settings & Export"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1.5 rounded-md hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Search (Ctrl + K)"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
