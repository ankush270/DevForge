'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Note, NoteMode } from '@/types';
import { MermaidDiagram } from './MermaidDiagram';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Image as ImageIcon,
  HelpCircle,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Layers,
  ChevronDown,
  X,
  Target,
  Tag as TagIcon,
  Plus,
  Clock,
  Calendar,
  RotateCcw,
  Activity,
  Cloud,
  BookOpen,
  Zap,
  Lightbulb,
  Shield,
  Flame,
  MoreHorizontal,
  Pencil,
  Check,
  LucideIcon,
} from 'lucide-react';

const MODE_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Zap,
  Target,
  Code,
  Lightbulb,
  Shield,
  Flame,
  Layers,
  Sparkles,
};

const MODE_ICON_OPTIONS = [
  { id: 'BookOpen', label: 'In-Depth Theory', icon: BookOpen },
  { id: 'Zap', label: 'Quick Tricks & Shortcuts', icon: Zap },
  { id: 'Target', label: 'Interview Q&A & Traps', icon: Target },
  { id: 'Code', label: 'Implementation / Code', icon: Code },
  { id: 'Lightbulb', label: 'Mental Models & Intuition', icon: Lightbulb },
  { id: 'Shield', label: 'Pitfalls & Edge Cases', icon: Shield },
  { id: 'Flame', label: 'High Priority Cram', icon: Flame },
  { id: 'Layers', label: 'System Architecture', icon: Layers },
  { id: 'Sparkles', label: 'Summary & Cheat Sheet', icon: Sparkles },
];

function getModeIcon(iconName?: string): LucideIcon {
  return (iconName && MODE_ICONS[iconName]) || BookOpen;
}

const DEFAULT_NOTE_MODES = (noteTitle: string, initialContent: string): NoteMode[] => [
  {
    id: 'depth',
    name: 'In-Depth',
    icon: 'BookOpen',
    contentMarkdown: initialContent || `# ${noteTitle}\n\nStart writing in-depth concept notes here...`,
  },
  {
    id: 'tricks',
    name: 'Quick Tricks',
    icon: 'Zap',
    contentMarkdown: `# ⚡ Quick Tricks & Mnemonics: ${noteTitle}\n\n- **Core Rule of Thumb:** \n- **Mental Shortcut:** \n- **Key Formula / Complexity:** \n- **Memory Hook / Acronym:** \n`,
  },
  {
    id: 'interview',
    name: 'Interview Q&A',
    icon: 'Target',
    contentMarkdown: `# 🎯 Common Interview Questions: ${noteTitle}\n\n### Q1: What is the most critical trade-off when using this in production?\n> **Answer:** \n\n### Q2: What edge cases or failures should you watch out for during an interview?\n> **Answer:** \n`,
  },
  {
    id: 'code',
    name: 'Real-World / Code',
    icon: 'Code',
    contentMarkdown: `# 🛠️ Practical Implementation & Mechanics\n\n\`\`\`c\n// Core implementation / Linux kernel / System code example\n\`\`\`\n`,
  },
];

export function NoteEditor() {
  const {
    selectedNote,
    updateNote,
    deleteNote,
    startRevisionQueue,
    subjects,
    openNote,
    addNote,
    setActiveView,
    cloudStatus,
    setIsCloudSyncModalOpen,
  } = useApp();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'write' | 'preview'>('preview');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showDiagramDropdown, setShowDiagramDropdown] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showDsaEditor, setShowDsaEditor] = useState(false);
  const [isInterviewPracticeMode, setIsInterviewPracticeMode] = useState(false);
  const [activeRecallRevealed, setActiveRecallRevealed] = useState<Record<string, boolean>>({});
  const [breadcrumbDropdown, setBreadcrumbDropdown] = useState<'subject' | 'topic' | null>(null);
  const [clientNow, setClientNow] = useState<number | null>(null);

  // Study Modes State
  const [modes, setModes] = useState<NoteMode[]>([]);
  const [activeModeId, setActiveModeId] = useState<string>('depth');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newModeName, setNewModeName] = useState('');
  const [newModeIcon, setNewModeIcon] = useState('Zap');
  const [editingModeId, setEditingModeId] = useState<string | null>(null);
  const [editModeName, setEditModeName] = useState('');
  const [editModeIcon, setEditModeIcon] = useState('Zap');

  useEffect(() => {
    setClientNow(Date.now());
  }, []);

  // Tag creation state
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // DSA edit state
  const [timeComp, setTimeComp] = useState('O(1)');
  const [spaceComp, setSpaceComp] = useState('O(1)');
  const [probUrl, setProbUrl] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setTimeComp(selectedNote.timeComplexity || 'O(1)');
      setSpaceComp(selectedNote.spaceComplexity || 'O(1)');
      setProbUrl(selectedNote.problemUrl || '');
      setSaveStatus('saved');
      setIsInterviewPracticeMode(false);
      setIsAddingMode(false);
      setEditingModeId(null);

      // Initialize or load modes
      let noteModes = selectedNote.modes;
      if (!noteModes || noteModes.length === 0) {
        noteModes = DEFAULT_NOTE_MODES(selectedNote.title, selectedNote.contentMarkdown || '');
      } else {
        const depthMode = noteModes.find((m) => m.id === 'depth');
        if (depthMode && !depthMode.contentMarkdown && selectedNote.contentMarkdown) {
          depthMode.contentMarkdown = selectedNote.contentMarkdown;
        }
      }

      setModes(noteModes);
      const initialModeId =
        selectedNote.activeModeId && noteModes.some((m) => m.id === selectedNote.activeModeId)
          ? selectedNote.activeModeId
          : noteModes[0].id;
      setActiveModeId(initialModeId);

      const active = noteModes.find((m) => m.id === initialModeId) || noteModes[0];
      setContent(active.contentMarkdown || '');
    }
  }, [selectedNote?.id]);

  // Close breadcrumb dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.breadcrumb-menu-container')) {
        setBreadcrumbDropdown(null);
      }
      if (!(e.target as HTMLElement).closest('.mode-menu-container')) {
        setEditingModeId(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Breadcrumbs: Subject > Topic > Note
  const breadcrumbs = useMemo(() => {
    if (!selectedNote) return null;
    for (const sub of subjects) {
      for (const top of sub.topics) {
        if (top.id === selectedNote.topicId) {
          return {
            subject: sub,
            topic: top,
            note: selectedNote,
            subjectTitle: sub.title,
            topicTitle: top.title,
            noteTitle: selectedNote.title,
          };
        }
      }
    }
    return null;
  }, [subjects, selectedNote]);

  const triggerAutoSave = (
    newContent: string,
    newTitle: string,
    currentModes = modes,
    currentActiveModeId = activeModeId
  ) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      if (selectedNote) {
        const updatedModes = currentModes.map((m) =>
          m.id === currentActiveModeId ? { ...m, contentMarkdown: newContent } : m
        );
        const depthMode = updatedModes.find((m) => m.id === 'depth') || updatedModes[0];
        const primaryContent = depthMode ? depthMode.contentMarkdown : newContent;

        setModes(updatedModes);
        updateNote(selectedNote.id, {
          title: newTitle,
          contentMarkdown: primaryContent,
          modes: updatedModes,
          activeModeId: currentActiveModeId,
        });
        setSaveStatus('saved');
      }
    }, 800);
  };

  const handleSwitchMode = (targetModeId: string) => {
    if (targetModeId === activeModeId || !selectedNote) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const updatedModes = modes.map((m) =>
      m.id === activeModeId ? { ...m, contentMarkdown: content } : m
    );
    const depthMode = updatedModes.find((m) => m.id === 'depth') || updatedModes[0];
    const primaryContent = depthMode ? depthMode.contentMarkdown : content;

    const target = updatedModes.find((m) => m.id === targetModeId) || updatedModes[0];

    setModes(updatedModes);
    setActiveModeId(target.id);
    setContent(target.contentMarkdown || '');
    setEditingModeId(null);
    setIsAddingMode(false);

    updateNote(selectedNote.id, {
      title,
      contentMarkdown: primaryContent,
      modes: updatedModes,
      activeModeId: target.id,
    });
    setSaveStatus('saved');
  };

  const handleCreateNewMode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModeName.trim() || !selectedNote) return;

    const newMode: NoteMode = {
      id: `mode-${Date.now()}`,
      name: newModeName.trim(),
      icon: newModeIcon,
      contentMarkdown: `# ${newModeName.trim()}: ${title}\n\nStart writing notes for this mode here...\n`,
    };

    const updatedModes = [
      ...modes.map((m) => (m.id === activeModeId ? { ...m, contentMarkdown: content } : m)),
      newMode,
    ];

    setModes(updatedModes);
    setActiveModeId(newMode.id);
    setContent(newMode.contentMarkdown);
    setIsAddingMode(false);
    setNewModeName('');
    setNewModeIcon('Zap');

    const depthMode = updatedModes.find((m) => m.id === 'depth') || updatedModes[0];
    updateNote(selectedNote.id, {
      contentMarkdown: depthMode ? depthMode.contentMarkdown : content,
      modes: updatedModes,
      activeModeId: newMode.id,
    });
    setSaveStatus('saved');
  };

  const handleStartEditMode = (m: NoteMode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingModeId(m.id);
    setEditModeName(m.name);
    setEditModeIcon(m.icon || 'Zap');
  };

  const handleSaveEditMode = (modeId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editModeName.trim() || !selectedNote) return;

    const updatedModes = modes.map((m) =>
      m.id === modeId ? { ...m, name: editModeName.trim(), icon: editModeIcon } : m
    );

    setModes(updatedModes);
    setEditingModeId(null);

    updateNote(selectedNote.id, {
      modes: updatedModes,
    });
  };

  const handleDeleteMode = (modeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (modes.length <= 1) {
      alert('A note must have at least one study mode.');
      return;
    }
    const modeToDelete = modes.find((m) => m.id === modeId);
    if (!confirm(`Delete study mode "${modeToDelete?.name || ''}"?`)) return;

    const updatedModes = modes.filter((m) => m.id !== modeId);
    let nextActiveId = activeModeId;
    let nextContent = content;

    if (activeModeId === modeId) {
      nextActiveId = updatedModes[0].id;
      nextContent = updatedModes[0].contentMarkdown || '';
      setActiveModeId(nextActiveId);
      setContent(nextContent);
    }

    setModes(updatedModes);
    setEditingModeId(null);

    if (selectedNote) {
      const depthMode = updatedModes.find((m) => m.id === 'depth') || updatedModes[0];
      updateNote(selectedNote.id, {
        contentMarkdown: depthMode ? depthMode.contentMarkdown : nextContent,
        modes: updatedModes,
        activeModeId: nextActiveId,
      });
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    triggerAutoSave(content, newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    triggerAutoSave(newContent, title);

    const textarea = textareaRef.current;
    if (textarea) {
      const cursor = textarea.selectionStart;
      const textBeforeCursor = newContent.slice(0, cursor);
      const lastLine = textBeforeCursor.split('\n').pop() || '';
      if (lastLine.trim() === '/') {
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    }
  };

  const insertFormatting = (prefix: string, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholder;

    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = content.slice(0, start) + replacement + content.slice(end);

    setContent(newContent);
    triggerAutoSave(newContent, title);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const applySlashCommand = (snippet: string) => {
    setShowSlashMenu(false);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const textBefore = content.slice(0, cursor);
    const lastSlashIdx = textBefore.lastIndexOf('/');

    if (lastSlashIdx !== -1) {
      const newContent = content.slice(0, lastSlashIdx) + snippet + content.slice(cursor);
      setContent(newContent);
      triggerAutoSave(newContent, title);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(lastSlashIdx + snippet.length, lastSlashIdx + snippet.length);
      }, 10);
    } else {
      insertFormatting(snippet);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            const dataUrl = uploadEvent.target?.result as string;
            insertFormatting(`\n![Pasted Architecture](${dataUrl})\n`, '');
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  const insertDiagramTemplate = (type: 'architecture' | 'er' | 'sequence') => {
    setShowDiagramDropdown(false);
    if (type === 'architecture') {
      const snippet = `\n\`\`\`mermaid\ngraph TD\n    Client[Mobile/Web App] --> CDN[Cloudflare CDN]\n    CDN --> LB[Load Balancer]\n    LB --> API[API Gateway]\n    API --> Cache[(Redis Cache)]\n    API --> DB[(PostgreSQL Database)]\n\`\`\`\n`;
      insertFormatting(snippet);
    } else if (type === 'er') {
      const snippet = `\n\`\`\`mermaid\nerDiagram\n    USER ||--o{ ORDER : places\n    USER { string id PK, string email }\n    ORDER ||--|{ ITEM : contains\n    ORDER { string id PK, decimal amount }\n\`\`\`\n`;
      insertFormatting(snippet);
    } else {
      const snippet = `\n\`\`\`mermaid\nsequenceDiagram\n    autonumber\n    actor User\n    User->>Frontend: Click Action\n    Frontend->>Backend: API Request\n    Backend->>Database: Query Data\n    Database-->>Backend: Return Result\n    Backend-->>Frontend: 200 OK Response\n\`\`\`\n`;
      insertFormatting(snippet);
    }
  };

  // Add Tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim() || !selectedNote) return;
    let tag = newTagInput.trim();
    if (!tag.startsWith('#')) tag = `#${tag}`;
    if (!selectedNote.tags.includes(tag)) {
      updateNote(selectedNote.id, {
        tags: [...selectedNote.tags, tag],
      });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, {
      tags: selectedNote.tags.filter((t) => t !== tagToRemove),
    });
  };

  const saveDsaDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNote) {
      updateNote(selectedNote.id, {
        timeComplexity: timeComp,
        spaceComplexity: spaceComp,
        problemUrl: probUrl,
      });
      setShowDsaEditor(false);
    }
  };

  // Format relative days
  const formatScheduleDue = (isoDate?: string) => {
    if (!isoDate || !clientNow) return 'Scheduled ⚡';
    const diff = Math.round((new Date(isoDate).getTime() - clientNow) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Overdue by ${Math.abs(diff)} days 🔴`;
    if (diff === 0) return 'Due Today ⚡';
    return `In ${diff} days 🟢`;
  };

  if (!selectedNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[var(--muted)]">
        <Sparkles className="w-12 h-12 text-indigo-400 mb-3 opacity-60" />
        <h3 className="text-base font-semibold text-[var(--foreground)]">No note selected</h3>
        <p className="text-xs max-w-sm mt-1">
          Select a note from the left sidebar or press <kbd className="font-mono bg-[var(--surface-hover)] px-1.5 py-0.5 rounded border border-[var(--border)]">Ctrl+N</kbd> to quick-capture a new topic.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)]">
      {/* 🧭 Interactive Breadcrumbs Bar */}
      {breadcrumbs && (
        <div className="px-4 py-2 bg-[var(--surface)]/70 border-b border-[var(--border)]/70 flex items-center justify-between text-xs sm:text-sm text-[var(--muted)] relative z-20">
          <div className="flex items-center gap-1.5 truncate breadcrumb-menu-container">
            {/* 1. Subject Clickable Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBreadcrumbDropdown((prev) => (prev === 'subject' ? null : 'subject'))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  breadcrumbDropdown === 'subject'
                    ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30'
                    : 'text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:text-indigo-400'
                }`}
                title="Switch Subject or View Topics"
              >
                <span>{breadcrumbs.subjectTitle}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Subject Dropdown Menu */}
              {breadcrumbDropdown === 'subject' && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-2 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    <span>Subjects</span>
                    <button
                      type="button"
                      onClick={() => {
                        setBreadcrumbDropdown(null);
                        setActiveView('dashboard');
                      }}
                      className="text-indigo-400 hover:underline capitalize"
                    >
                      Dashboard ➔
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {subjects.map((sub) => {
                      const isCurrent = sub.id === breadcrumbs.subject.id;
                      const noteCount = sub.topics.reduce((acc, t) => acc + t.notes.length, 0);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            if (sub.topics.length > 0 && sub.topics[0].notes.length > 0) {
                              openNote(sub.topics[0].notes[0].id);
                            }
                            setBreadcrumbDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors text-left cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-500/15 text-indigo-300 font-semibold'
                              : 'hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
                          }`}
                        >
                          <span className="truncate">{sub.title}</span>
                          <span className="text-xs text-[var(--muted)] font-mono">
                            {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] opacity-50 flex-shrink-0" />

            {/* 2. Topic Clickable Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBreadcrumbDropdown((prev) => (prev === 'topic' ? null : 'topic'))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  breadcrumbDropdown === 'topic'
                    ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30'
                    : 'text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:text-indigo-400'
                }`}
                title="Switch Notes in this Topic"
              >
                <span>{breadcrumbs.topicTitle}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Topic Dropdown Menu */}
              {breadcrumbDropdown === 'topic' && (
                <div className="absolute top-full left-0 mt-1 w-72 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-2 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    <span className="truncate max-w-[180px]">{breadcrumbs.topicTitle}</span>
                    <span className="text-xs text-[var(--muted)] font-mono">{breadcrumbs.topic.notes.length} notes</span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {breadcrumbs.topic.notes.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[var(--muted)]">
                        No other notes in this topic.
                      </div>
                    ) : (
                      breadcrumbs.topic.notes.map((n) => {
                        const isCurrent = n.id === selectedNote.id;
                        return (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              openNote(n.id);
                              setBreadcrumbDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs sm:text-sm transition-colors text-left cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20'
                                : 'hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
                            }`}
                          >
                            <span className="truncate max-w-[200px]">{n.title}</span>
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                n.masteryLevel === 'GREEN'
                                  ? 'bg-emerald-500'
                                  : n.masteryLevel === 'YELLOW'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              title={`Mastery: ${n.masteryLevel}`}
                            />
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => {
                        const newNote = addNote(breadcrumbs.topic.id, 'New Concept Note');
                        openNote(newNote.id);
                        setBreadcrumbDropdown(null);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Note in this Topic</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] opacity-50 flex-shrink-0" />

            {/* 3. Current Note Title Clickable Item (Focus to Edit) */}
            <button
              type="button"
              onClick={() => {
                titleInputRef.current?.focus();
                titleInputRef.current?.select();
              }}
              className="px-2 py-0.5 rounded-md font-semibold text-indigo-400 hover:bg-indigo-500/10 hover:underline transition-all truncate max-w-[260px] cursor-pointer text-left text-xs sm:text-sm"
              title="Click to edit or rename this note title"
            >
              {breadcrumbs.noteTitle}
            </button>
          </div>

          {/* Quick Tag Badges in header */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            {selectedNote.tags.map((tag) => (
              <span
                key={tag}
                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--muted)] hover:text-indigo-400"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 cursor-pointer"
                  title="Remove tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {isAddingTag ? (
              <form onSubmit={handleAddTag} className="inline-flex items-center">
                <input
                  type="text"
                  placeholder="#Tag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onBlur={() => setIsAddingTag(false)}
                  autoFocus
                  className="w-20 px-2 py-0.5 text-xs rounded-md bg-[var(--surface-hover)] border border-indigo-500 outline-none text-[var(--foreground)]"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="p-1 rounded text-xs text-[var(--muted)] hover:text-indigo-400 hover:bg-[var(--surface-hover)] flex items-center gap-1 cursor-pointer"
                title="Add Tag"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tag</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🎛️ Top Action Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3">
        {/* Title & Sync Badge */}
        <div className="flex items-center gap-3 truncate flex-1">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Note..."
            className="text-base sm:text-lg md:text-xl font-bold bg-transparent border-none outline-none text-[var(--foreground)] truncate w-full"
          />

          <button
            type="button"
            onClick={() => setIsCloudSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--surface-hover)] text-xs text-[var(--muted)] flex-shrink-0 cursor-pointer transition-colors"
            title="Click to view Supabase Cloud Sync status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                saveStatus === 'saved'
                  ? cloudStatus === 'synced'
                    ? 'bg-emerald-500'
                    : 'bg-emerald-400'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="hidden sm:inline font-medium">
              {saveStatus === 'saved'
                ? cloudStatus === 'synced'
                  ? 'Saved & Synced'
                  : cloudStatus === 'needs_setup'
                  ? 'Saved (Setup Cloud)'
                  : 'Saved Locally'
                : 'Saving...'}
            </span>
            {cloudStatus === 'synced' && <Cloud className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        {/* View Controls & Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 🔀 Segmented Toggle: [ Edit File ] vs [ Preview ] */}
          <div className="flex p-0.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-xs sm:text-sm shadow-inner">
            <button
              type="button"
              onClick={() => setMode('write')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                mode === 'write'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit File</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                mode === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* In-Place Interview Practice Mode Toggle */}
          <button
            onClick={() => setIsInterviewPracticeMode((prev) => !prev)}
            className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
              isInterviewPracticeMode
                ? 'bg-amber-500 text-black border-amber-500'
                : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
            }`}
            title="Interview Practice Mode (Blurs Answers)"
          >
            <Target className="w-4 h-4" />
            <span>{isInterviewPracticeMode ? 'Exit Practice' : 'Practice'}</span>
          </button>

          {/* Full Revision Queue CTA */}
          <button
            onClick={() => startRevisionQueue()}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
          >
            <span>Revise</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm('Delete this note permanently?')) {
                deleteNote(selectedNote.id);
              }
            }}
            className="p-2 rounded-lg text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 📑 Note Study Modes Bar (In-Depth, Quick Tricks, Interview Q&A, Custom Modes) */}
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-hover)]/40 flex items-center justify-between gap-3 overflow-x-auto relative z-10">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {modes.map((m) => {
            const isActive = m.id === activeModeId;
            const Icon = getModeIcon(m.icon);

            return (
              <div key={m.id} className="relative group/mode flex items-center">
                <button
                  type="button"
                  onClick={() => handleSwitchMode(m.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{m.name}</span>
                </button>

                {/* Edit / Delete trigger button */}
                <button
                  type="button"
                  onClick={(e) => handleStartEditMode(m, e)}
                  className={`p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-all cursor-pointer ${
                    isActive ? 'opacity-80 hover:opacity-100 ml-0.5' : 'opacity-0 group-hover/mode:opacity-100 ml-0.5'
                  }`}
                  title={`Configure "${m.name}" mode`}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* + Add Custom Mode Button */}
          <button
            type="button"
            onClick={() => {
              setIsAddingMode(true);
              setNewModeName('');
              setNewModeIcon('Zap');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[var(--border)] hover:border-indigo-500/50 hover:bg-[var(--surface)] text-xs font-semibold text-[var(--muted)] hover:text-indigo-400 transition-all cursor-pointer whitespace-nowrap ml-1"
            title="Create Custom Study Mode"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Mode</span>
          </button>
        </div>

        {/* Current Active Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium whitespace-nowrap">
          <span>Active Perspective:</span>
          <span className="font-semibold text-[var(--foreground)] px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
            {modes.find((m) => m.id === activeModeId)?.name}
          </span>
        </div>
      </div>

      {/* Add Mode Modal */}
      {isAddingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddingMode(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create New Study Mode</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingMode(false)}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMode} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                  Mode Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5-Min Cheat Sheet, Pitfalls & Traps, System Trade-offs"
                  value={newModeName}
                  onChange={(e) => setNewModeName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">
                  Mode Icon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MODE_ICON_OPTIONS.map(({ id, label, icon: IconComponent }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setNewModeIcon(id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        newModeIcon === id
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-semibold'
                          : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAddingMode(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newModeName.trim()}
                  className="px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors cursor-pointer shadow-sm shadow-indigo-600/30"
                >
                  Create Study Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mode Modal */}
      {editingModeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingModeId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-400" />
                <span>Edit Study Mode</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingModeId(null)}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => handleSaveEditMode(editingModeId, e)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                  Mode Name
                </label>
                <input
                  type="text"
                  value={editModeName}
                  onChange={(e) => setEditModeName(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">
                  Mode Icon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MODE_ICON_OPTIONS.map(({ id, label, icon: IconComponent }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setEditModeIcon(id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        editModeIcon === id
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-semibold'
                          : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={(e) => handleDeleteMode(editingModeId, e)}
                  disabled={modes.length <= 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Mode</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingModeId(null)}
                    className="px-3.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editModeName.trim()}
                    className="px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🧩 DSA Metadata Header */}
      {selectedNote.isDsaProblem && (
        <div className="px-4 py-2.5 bg-indigo-950/20 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-400">⚡ DSA Problem:</span>
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono text-xs border border-indigo-500/20">
              {timeComp} Time
            </span>
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono text-xs border border-indigo-500/20">
              {spaceComp} Space
            </span>
            <button
              onClick={() => setShowDsaEditor(true)}
              className="text-xs text-[var(--muted)] hover:text-indigo-400 underline ml-1 cursor-pointer"
            >
              Edit Badges
            </button>
          </div>

          {probUrl && (
            <a
              href={probUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-indigo-400 hover:underline"
            >
              <span>View LeetCode</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 🛠️ Zero-Markdown Visual Formatting Toolbar (Only in Edit mode) */}
      {mode === 'write' && (
        <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--surface-hover)]/40 flex items-center gap-1.5 overflow-x-auto text-[var(--foreground)] animate-in fade-in duration-100">
          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm font-bold cursor-pointer"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm italic cursor-pointer"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('\n# ', '\n', 'Heading 1')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm cursor-pointer"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('\n## ', '\n', 'Heading 2')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm cursor-pointer"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

          <button
            onClick={() => insertFormatting('\n- ', '\n', 'List item')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm cursor-pointer"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('\n1. ', '\n', 'List item')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

          <button
            onClick={() => insertFormatting('\n```cpp\n// Write solution here\n', '\n```\n')}
            className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm cursor-pointer"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* Diagram Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDiagramDropdown((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm text-indigo-400 font-semibold cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Diagram</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDiagramDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-1.5 z-30 space-y-0.5">
                <button
                  onClick={() => insertDiagramTemplate('architecture')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  📐 Microservice / Arch Flow
                </button>
                <button
                  onClick={() => insertDiagramTemplate('er')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  🗄️ Database ER Diagram
                </button>
                <button
                  onClick={() => insertDiagramTemplate('sequence')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] cursor-pointer"
                >
                  🔄 Sequence / User Flow
                </button>
              </div>
            )}
          </div>

          {/* Active Recall Inserter */}
          <button
            onClick={() =>
              insertFormatting(
                '\n:::recall[What is the key interview question here?]\nHere is the detailed answer that will be hidden until clicked or revealed during revision.\n:::\n'
              )
            }
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm text-amber-400 font-medium ml-1 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Active Recall</span>
          </button>

          {/* Image Attachment */}
          <label className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs sm:text-sm cursor-pointer" title="Attach Image">
            <ImageIcon className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (loadEvt) => {
                    insertFormatting(`\n![Uploaded Image](${loadEvt.target?.result})\n`, '');
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </div>
      )}

      {/* 📝 Workspace Content: Full Width based on Active Toggle Mode */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Slash Command Dropdown Menu */}
        {showSlashMenu && mode === 'write' && (
          <div className="absolute top-12 left-8 z-40 w-72 rounded-xl bg-[var(--surface)] border border-indigo-500/40 shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <span className="px-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              Quick Templates
            </span>
            <button
              onClick={() => applySlashCommand('## Heading Title\n')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <Heading2 className="w-4 h-4 text-indigo-400" />
              <span>/heading (Heading 2)</span>
            </button>
            <button
              onClick={() => applySlashCommand('- Bullet point\n')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <List className="w-4 h-4 text-emerald-400" />
              <span>/bullet (Bullet List)</span>
            </button>
            <button
              onClick={() => applySlashCommand('```cpp\n// Code snippet\n```\n')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <Code className="w-4 h-4 text-blue-400" />
              <span>/code (Code Snippet)</span>
            </button>
            <button
              onClick={() =>
                applySlashCommand(
                  '```mermaid\ngraph TD\n    A[Client] --> B[Server]\n    B --> C[(Database)]\n```\n'
                )
              }
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>/diagram (Architecture)</span>
            </button>
            <button
              onClick={() =>
                applySlashCommand(
                  ':::recall[What is the interview question?]\nHere is the answer.\n:::\n'
                )
              }
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>/recall (Active Recall Spoiler)</span>
            </button>
          </div>
        )}

        {/* 1. WRITE MODE: Clean, Full-Width Writing Canvas */}
        {mode === 'write' ? (
          <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 w-full overflow-y-auto animate-in fade-in duration-150">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onPaste={handlePaste}
              placeholder="Write notes here... (Tip: Paste screenshots directly with Ctrl+V, or type / for templates)"
              className="w-full h-full min-h-[500px] bg-transparent resize-none outline-none font-mono text-sm sm:text-base leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
          </div>
        ) : (
          /* 2. PREVIEW MODE: Clean, Full-Width Rendered Reading Canvas */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 w-full animate-in fade-in duration-150">
            {isInterviewPracticeMode && (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-400 flex items-center justify-between">
                <span>🎯 Interview Practice Mode Active: Content is blurred until clicked or hovered!</span>
                <button
                  onClick={() => setIsInterviewPracticeMode(false)}
                  className="font-bold underline cursor-pointer"
                >
                  Exit Practice
                </button>
              </div>
            )}

            {!content.trim() ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[var(--foreground)]">
                  No notes in &quot;{modes.find((m) => m.id === activeModeId)?.name || 'this mode'}&quot; yet
                </h4>
                <p className="text-xs text-[var(--muted)]">
                  Each study mode keeps its own separate notes, diagrams, and tricks.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('write')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Write notes for this mode</span>
                </button>
              </div>
            ) : (
              <div className={isInterviewPracticeMode ? 'filter blur-[4px] hover:filter-none transition-all duration-300 cursor-pointer' : ''}>
                <MarkdownRenderer
                  markdown={content}
                  revealedMap={activeRecallRevealed}
                  onToggleReveal={(id) =>
                    setActiveRecallRevealed((prev) => ({ ...prev, [id]: !prev[id] }))
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 📊 Note SRS Metadata Footer */}
      <footer className="px-4 py-2.5 bg-[var(--surface)] border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[var(--muted)] select-none">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5" title="Next Review Schedule">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Next: <strong>{formatScheduleDue(selectedNote.srsItem?.nextReviewAt)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5" title="Total Revisions Completed">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>Revisions: <strong>{selectedNote.srsItem?.repetitionCount ?? 0} times</strong></span>
          </div>

          <div className="flex items-center gap-1.5" title="SRS Interval & Ease Factor">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Interval: <strong>{selectedNote.srsItem?.intervalDays ?? 1}d</strong> (Ease: {selectedNote.srsItem?.easeFactor ?? 2.5})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                selectedNote.masteryLevel === 'GREEN'
                  ? 'bg-emerald-500'
                  : selectedNote.masteryLevel === 'YELLOW'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold text-[var(--foreground)]">{selectedNote.masteryLevel}</span>
          </span>
        </div>
      </footer>

      {/* 🧩 DSA Details Edit Modal */}
      {showDsaEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDsaEditor(false)} />
          <form
            onSubmit={saveDsaDetails}
            className="relative z-10 w-full max-w-sm rounded-xl bg-[var(--surface)] border border-[var(--border)] p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Edit DSA Problem Metadata</h3>
              <button type="button" onClick={() => setShowDsaEditor(false)} className="text-[var(--muted)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Time Complexity</label>
              <input
                type="text"
                value={timeComp}
                onChange={(e) => setTimeComp(e.target.value)}
                placeholder="e.g. O(N log N)"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Space Complexity</label>
              <input
                type="text"
                value={spaceComp}
                onChange={(e) => setSpaceComp(e.target.value)}
                placeholder="e.g. O(1)"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">LeetCode / Problem URL</label>
              <input
                type="url"
                value={probUrl}
                onChange={(e) => setProbUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowDsaEditor(false)}
                className="px-3.5 py-1.5 text-xs sm:text-sm text-[var(--muted)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/**
 * ⚡ Live Markdown Renderer with Mermaid diagrams & Active Recall toggles
 */
function MarkdownRenderer({
  markdown,
  revealedMap,
  onToggleReveal,
}: {
  markdown: string;
  revealedMap: Record<string, boolean>;
  onToggleReveal: (id: string) => void;
}) {
  if (!markdown.trim()) {
    return (
      <div className="text-sm text-[var(--muted)] italic">
        No content written yet. Switch to "Edit File" to add notes.
      </div>
    );
  }

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let inRecallBlock = false;
  let recallQuestion = '';
  let recallLines: string[] = [];
  let blockKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith(':::recall[')) {
      inRecallBlock = true;
      recallQuestion = line.slice(10, line.indexOf(']'));
      recallLines = [];
      continue;
    }
    if (inRecallBlock) {
      if (line.startsWith(':::')) {
        inRecallBlock = false;
        const qId = `recall-${blockKey++}`;
        const isRevealed = revealedMap[qId] ?? false;
        const answerText = recallLines.join('\n');

        elements.push(
          <div
            key={qId}
            className="my-4 rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden transition-all"
          >
            <div className="p-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                🎯 Active Recall Prompt:
              </span>
              <button
                onClick={() => onToggleReveal(qId)}
                className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                {isRevealed ? 'Hide Answer' : 'Tap to Reveal'}
              </button>
            </div>
            <div className="p-4 text-sm sm:text-base text-[var(--foreground)] font-semibold">
              {recallQuestion}
            </div>
            {isRevealed && (
              <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] text-sm sm:text-base text-[var(--foreground)]/90 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-200">
                {answerText}
              </div>
            )}
          </div>
        );
      } else {
        recallLines.push(line);
      }
      continue;
    }

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockLines.join('\n');
        const cKey = `code-${blockKey++}`;

        // 📐 Native Mermaid.js SVG Diagram Rendering
        if (codeBlockLang === 'mermaid') {
          elements.push(<MermaidDiagram key={cKey} chart={codeText} />);
        } else {
          elements.push(
            <div
              key={cKey}
              className="my-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#0d0d10]"
            >
              <div className="px-3.5 py-2 bg-[var(--surface-hover)] border-b border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--muted)]">
                <span>{codeBlockLang || 'Code'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(codeText)}
                  className="hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl sm:text-3xl font-bold mt-5 mb-2.5 text-[var(--foreground)]">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-xl sm:text-2xl font-bold mt-4 mb-2 text-[var(--foreground)] border-b border-[var(--border)] pb-1.5">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-lg sm:text-xl font-semibold mt-3 mb-1.5 text-[var(--foreground)]">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="ml-5 list-disc text-sm sm:text-base text-[var(--foreground)] my-1 leading-relaxed">
          {renderFormattedInline(line.slice(2))}
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={i} className="ml-5 list-decimal text-sm sm:text-base text-[var(--foreground)] my-1 leading-relaxed">
          {renderFormattedInline(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
    } else if (line.startsWith('![')) {
      const match = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        elements.push(
          <div key={i} className="my-4 rounded-xl overflow-hidden border border-[var(--border)]">
            <img src={match[2]} alt={match[1]} className="max-w-full h-auto object-contain mx-auto" />
            {match[1] && (
              <p className="text-xs text-center text-[var(--muted)] py-1.5 bg-[var(--surface)]">
                {match[1]}
              </p>
            )}
          </div>
        );
      }
    } else if (line.trim().length > 0) {
      elements.push(
        <p key={i} className="text-sm sm:text-base text-[var(--foreground)] leading-relaxed my-2">
          {renderFormattedInline(line)}
        </p>
      );
    }
  }

  return <div className="space-y-1.5">{elements}</div>;
}

function renderFormattedInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-[var(--foreground)]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx} className="italic text-[var(--foreground)]">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs sm:text-sm text-indigo-400">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
