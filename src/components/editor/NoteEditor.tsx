'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Note, NoteMode } from '@/types';
import { MermaidDiagram } from './MermaidDiagram';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  HelpCircle,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Bookmark,
  FileCode2,
  ChevronRight,
  Layers,
  Table,
  ChevronDown,
  X,
  Target,
  Tag as TagIcon,
  Plus,
  Clock,
  Calendar,
  RotateCcw,
  Undo2,
  Redo2,
  Highlighter,
  Link2,
  Unlink,
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
  Lock,
  ShieldCheck,
  LucideIcon,
  Type,
} from 'lucide-react';
import mermaid from 'mermaid';
import {
  isHtmlContent,
  markdownToHtml,
  getActiveTableCell,
  TableCellInfo,
  insertTableAtCursor,
  addTableRow,
  addTableCol,
  deleteTableRow,
  deleteTableCol,
  alignTableCol,
  deleteTable,
  insertRecallCard,
  insertDiagram,
} from '@/lib/wysiwyg';
import { useAuth } from '@/context/AuthContext';

const MODE_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Zap,
  Target,
  Code,
  Lightbulb,
  Shield,
  Flame,
  Layers,
  Bookmark,
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
  { id: 'Bookmark', label: 'Summary & Cheat Sheet', icon: Bookmark },
];

function getModeIcon(iconName?: string): LucideIcon {
  return (iconName && MODE_ICONS[iconName]) || BookOpen;
}

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', color: '#fef08a', bgClass: 'bg-yellow-300' },
  { label: 'Green', color: '#bbf7d0', bgClass: 'bg-emerald-300' },
  { label: 'Cyan', color: '#a5f3fc', bgClass: 'bg-cyan-300' },
  { label: 'Pink', color: '#fbcfe8', bgClass: 'bg-pink-300' },
  { label: 'Orange', color: '#fed7aa', bgClass: 'bg-orange-300' },
  { label: 'Purple', color: '#e9d5ff', bgClass: 'bg-purple-300' },
  { label: 'Clear', color: 'transparent', bgClass: 'bg-transparent border border-dashed border-[var(--border)]' },
];

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
  const { user, canEditNote, openAuthModal } = useAuth();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'write' | 'preview'>('preview');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showDiagramDropdown, setShowDiagramDropdown] = useState(false);
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  const [customCols, setCustomCols] = useState(3);
  const [customRows, setCustomRows] = useState(3);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showDsaEditor, setShowDsaEditor] = useState(false);
  const [isInterviewPracticeMode, setIsInterviewPracticeMode] = useState(false);
  const [activeRecallRevealed, setActiveRecallRevealed] = useState<Record<string, boolean>>({});
  const [breadcrumbDropdown, setBreadcrumbDropdown] = useState<'subject' | 'topic' | null>(null);
  const [clientNow, setClientNow] = useState<number | null>(null);

  // Authorization check: "bina login ke koi kuch update nhi kr skta or bss apna likha content edit kr skte ho"
  const canEdit = useMemo(() => {
    return canEditNote(selectedNote);
  }, [canEditNote, selectedNote]);

  // If user cannot edit this note, force preview mode
  useEffect(() => {
    if (selectedNote && !canEdit) {
      setMode('preview');
    }
  }, [selectedNote, canEdit]);

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
  const editorRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [tableInfo, setTableInfo] = useState<TableCellInfo | null>(null);
  const [editorViewMode, setEditorViewMode] = useState<'visual' | 'raw'>('visual');

  // Visual Formatting & Inserter States
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  const [currentHighlightColor, setCurrentHighlightColor] = useState('#fef08a');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [savedLinkRange, setSavedLinkRange] = useState<Range | null>(null);

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
      setTableInfo(null);

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
      const initialMarkdown = active.contentMarkdown || '';
      setContent(initialMarkdown);
      if (editorRef.current) {
        editorRef.current.innerHTML = markdownToHtml(initialMarkdown);
      }
    }
  }, [selectedNote?.id]);

  // Synchronize editor innerHTML whenever mode toggles to write
  useEffect(() => {
    if (mode === 'write' && editorRef.current) {
      editorRef.current.innerHTML = markdownToHtml(content);
      const info = getActiveTableCell();
      setTableInfo(info);
    }
  }, [mode]);

  // Close breadcrumb dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.breadcrumb-menu-container')) {
        setBreadcrumbDropdown(null);
      }
      if (!(e.target as HTMLElement).closest('.mode-menu-container')) {
        setEditingModeId(null);
      }
      if (!(e.target as HTMLElement).closest('.highlight-menu-container')) {
        setShowHighlightDropdown(false);
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
    if (!canEdit) return;
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
    const targetContent = target.contentMarkdown || '';
    setContent(targetContent);
    if (editorRef.current) {
      editorRef.current.innerHTML = markdownToHtml(targetContent);
    }
    setTableInfo(null);
    setEditingModeId(null);
    setIsAddingMode(false);

    if (canEdit) {
      updateNote(selectedNote.id, {
        title,
        contentMarkdown: primaryContent,
        modes: updatedModes,
        activeModeId: target.id,
      });
      setSaveStatus('saved');
    }
  };

  const handleCreateNewMode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to add study modes.' : 'You can only edit notes created by you.');
      return;
    }
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
    if (editorRef.current) {
      editorRef.current.innerHTML = markdownToHtml(newMode.contentMarkdown);
    }
    setTableInfo(null);
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
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to configure modes.' : 'You can only edit notes created by you.');
      return;
    }
    setEditingModeId(m.id);
    setEditModeName(m.name);
    setEditModeIcon(m.icon || 'Zap');
  };

  const handleSaveEditMode = (modeId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit modes.' : 'You can only edit notes created by you.');
      return;
    }
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
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to delete modes.' : 'You can only edit notes created by you.');
      return;
    }
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
      if (editorRef.current) {
        editorRef.current.innerHTML = markdownToHtml(nextContent);
      }
      setTableInfo(null);
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
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
    setTitle(newTitle);
    triggerAutoSave(content, newTitle);
  };

  const updateTableContext = () => {
    const info = getActiveTableCell();
    setTableInfo(info);
  };

  const handleEditorInput = () => {
    if (!canEdit || !editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    setContent(newHtml);
    triggerAutoSave(newHtml, title);
    updateTableContext();
  };

  const executeFormat = (command: string, value: string | undefined = undefined) => {
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const formatBlockTag = (tag: 'p' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'pre') => {
    executeFormat('formatBlock', `<${tag}>`);
  };

  const formatAlign = (align: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull') => {
    executeFormat(align);
  };

  const applyHighlight = (color: string) => {
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
    editorRef.current?.focus();
    if (!color || color === 'transparent') {
      document.execCommand('hiliteColor', false, 'transparent');
      document.execCommand('backColor', false, 'transparent');
    } else {
      const ok = document.execCommand('hiliteColor', false, color);
      if (!ok) {
        document.execCommand('backColor', false, color);
      }
      setCurrentHighlightColor(color);
    }
    setShowHighlightDropdown(false);
    handleEditorInput();
  };

  const handleOpenLinkModal = () => {
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
    const sel = window.getSelection();
    let selectedStr = '';
    let range: Range | null = null;
    if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0).cloneRange();
      selectedStr = sel.toString().trim();
    }
    setSavedLinkRange(range);
    setLinkText(selectedStr);
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const handleApplyLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl.trim()) return;

    let finalUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl) && !/^#/i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    editorRef.current?.focus();
    const sel = window.getSelection();
    if (savedLinkRange && sel) {
      sel.removeAllRanges();
      sel.addRange(savedLinkRange);
    }

    const displayText = linkText.trim() || finalUrl;
    const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline hover:text-indigo-300 font-medium">${displayText}</a>`;
    document.execCommand('insertHTML', false, linkHtml);

    setShowLinkModal(false);
    setSavedLinkRange(null);
    setLinkUrl('');
    setLinkText('');
    handleEditorInput();
  };

  const handleRemoveLink = () => {
    editorRef.current?.focus();
    if (savedLinkRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedLinkRange);
    }
    document.execCommand('unlink', false);
    setShowLinkModal(false);
    handleEditorInput();
  };

  const handleInsertTable = (cols: number, rows: number) => {
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
    editorRef.current?.focus();
    insertTableAtCursor(cols, rows);
    setShowTableDropdown(false);
    handleEditorInput();
  };

  const handleAddRow = (position: 'above' | 'below') => {
    if (!tableInfo) return;
    addTableRow(tableInfo.table, tableInfo.rowIndex, position);
    handleEditorInput();
  };

  const handleAddCol = (position: 'left' | 'right') => {
    if (!tableInfo) return;
    addTableCol(tableInfo.table, tableInfo.colIndex, position);
    handleEditorInput();
  };

  const handleDeleteRow = () => {
    if (!tableInfo) return;
    deleteTableRow(tableInfo.table, tableInfo.rowIndex);
    handleEditorInput();
  };

  const handleDeleteCol = () => {
    if (!tableInfo) return;
    deleteTableCol(tableInfo.table, tableInfo.colIndex);
    handleEditorInput();
  };

  const handleAlignCol = (align: 'left' | 'center' | 'right') => {
    if (!tableInfo) return;
    alignTableCol(tableInfo.table, tableInfo.colIndex, align);
    handleEditorInput();
  };

  const handleDeleteTable = () => {
    if (!tableInfo) return;
    deleteTable(tableInfo.table);
    setTableInfo(null);
    handleEditorInput();
  };

  const handleInsertRecallCard = () => {
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
    editorRef.current?.focus();
    insertRecallCard();
    handleEditorInput();
  };

  const handleInsertDiagram = (type: 'architecture' | 'er' | 'sequence') => {
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
    setShowDiagramDropdown(false);
    editorRef.current?.focus();
    insertDiagram(type);
    handleEditorInput();
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+L / Cmd+L for link insertion
    if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      handleOpenLinkModal();
      return;
    }

    // Tab inside Table navigation
    if (e.key === 'Tab') {
      const info = getActiveTableCell();
      if (info) {
        e.preventDefault();
        const { cell, table } = info;
        const allCells = Array.from(table.querySelectorAll('th, td')) as HTMLElement[];
        const currentIndex = allCells.indexOf(cell);

        if (e.shiftKey) {
          if (currentIndex > 0) {
            allCells[currentIndex - 1].focus();
          }
        } else {
          if (currentIndex < allCells.length - 1) {
            allCells[currentIndex + 1].focus();
          } else {
            // Last cell: auto-append a new row
            addTableRow(table, table.rows.length - 1, 'below');
            handleEditorInput();
            setTimeout(() => {
              const updatedCells = Array.from(table.querySelectorAll('th, td')) as HTMLElement[];
              updatedCells[currentIndex + 1]?.focus();
            }, 10);
          }
        }
        updateTableContext();
        return;
      }
    }
  };

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    let imageFile: File | null = null;
    if (clipboardData.items) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          imageFile = item.getAsFile();
          break;
        }
      }
    }
    if (!imageFile && clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          imageFile = file;
          break;
        }
      }
    }

    if (imageFile) {
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        const imgHtml = `<div class="my-3 rounded-xl overflow-hidden border border-[var(--border)] max-w-2xl shadow-sm"><img src="${dataUrl}" alt="Pasted Screenshot" class="max-w-full h-auto object-contain mx-auto" /></div><p><br></p>`;
        editorRef.current?.focus();
        document.execCommand('insertHTML', false, imgHtml);
        handleEditorInput();
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
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
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
      return;
    }
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

  const insertCustomTable = (cols: number, rows: number) => {
    const safeCols = Math.max(1, Math.min(10, cols));
    const safeRows = Math.max(1, Math.min(30, rows));

    const headers = Array.from({ length: safeCols }, (_, idx) => `Column ${idx + 1}`).join(' | ');
    const separators = Array.from({ length: safeCols }, () => ':---').join(' | ');
    const rowLines = Array.from({ length: safeRows }, (_, rIdx) =>
      Array.from({ length: safeCols }, (_, cIdx) => `Data ${rIdx + 1}.${cIdx + 1}`).join(' | ')
    )
      .map((r) => `| ${r} |`)
      .join('\n');

    const tableMarkdown = `\n| ${headers} |\n| ${separators} |\n${rowLines}\n\n`;
    insertFormatting(tableMarkdown);
    setShowTableDropdown(false);
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
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to add tags.' : 'You can only edit notes created by you.');
      return;
    }
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
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to remove tags.' : 'You can only edit notes created by you.');
      return;
    }
    if (!selectedNote) return;
    updateNote(selectedNote.id, {
      tags: selectedNote.tags.filter((t) => t !== tagToRemove),
    });
  };

  const saveDsaDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      openAuthModal('signin', !user ? 'Sign in to edit DSA metadata.' : 'You can only edit notes created by you.');
      return;
    }
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
        <FileCode2 className="w-12 h-12 text-sky-400 mb-3 opacity-60" />
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
            readOnly={!canEdit}
            onChange={(e) => handleTitleChange(e.target.value)}
            onClick={() => {
              if (!canEdit) {
                openAuthModal('signin', !user ? 'Sign in to edit this note.' : 'You can only edit notes created by you.');
              }
            }}
            placeholder="Untitled Note..."
            className={`text-base sm:text-lg md:text-xl font-bold bg-transparent border-none outline-none text-[var(--foreground)] truncate w-full ${
              !canEdit ? 'cursor-not-allowed opacity-90' : ''
            }`}
          />

          {/* Author / Ownership Pill */}
          {canEdit ? (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0"
              title="You are the author of this note"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your Note</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                openAuthModal(
                  'signin',
                  !user
                    ? 'Sign in to edit notes.'
                    : 'This note belongs to another user. You can only edit notes you created.'
                )
              }
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer flex-shrink-0"
              title="Read-only mode: You can only edit your own notes"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {user
                  ? `Read-Only (@${
                      selectedNote.authorEmail ? selectedNote.authorEmail.split('@')[0] : 'author'
                    })`
                  : 'Sign In to Edit'}
              </span>
            </button>
          )}

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
              onClick={() => {
                if (!canEdit) {
                  openAuthModal(
                    'signin',
                    !user
                      ? 'Sign in to edit this note.'
                      : 'You can only edit notes created by you.'
                  );
                  return;
                }
                setMode('write');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                mode === 'write'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
              title={canEdit ? 'Edit File' : 'Locked: Sign in with author account to edit'}
            >
              {canEdit ? (
                <Edit3 className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{canEdit ? 'Edit File' : 'Locked'}</span>
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
              if (!canEdit) {
                openAuthModal(
                  'signin',
                  !user
                    ? 'Sign in to delete notes.'
                    : 'You can only delete notes created by you.'
                );
                return;
              }
              if (confirm('Delete this note permanently?')) {
                deleteNote(selectedNote.id);
              }
            }}
            className={`p-2 rounded-lg transition-colors ${
              canEdit
                ? 'text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer'
                : 'opacity-40 text-[var(--muted)] hover:text-amber-400 cursor-not-allowed'
            }`}
            title={canEdit ? 'Delete Note' : 'Only note creator can delete this note'}
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

                {/* Edit / Delete trigger button (Only for note author) */}
                {canEdit && (
                  <button
                    type="button"
                    onClick={(e) => handleStartEditMode(m, e)}
                    className={`p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-all cursor-pointer ${
                      isActive
                        ? 'opacity-80 hover:opacity-100 ml-0.5'
                        : 'opacity-0 group-hover/mode:opacity-100 ml-0.5'
                    }`}
                    title={`Configure "${m.name}" mode`}
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* + Add Custom Mode Button */}
          {canEdit && (
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
          )}
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

      {/* 🔗 Visual Hyperlink Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowLinkModal(false);
              setSavedLinkRange(null);
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-400" />
                <span>Insert or Edit Link</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setSavedLinkRange(null);
                }}
                className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLink} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                  Display Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Official Docs or LeetCode #206"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                {savedLinkRange && (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove Link from text"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Remove Link</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLinkModal(false);
                      setSavedLinkRange(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!linkUrl.trim()}
                    className="px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors cursor-pointer shadow-sm shadow-indigo-600/30"
                  >
                    Save Link
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
        <div className="border-b border-[var(--border)] bg-[var(--surface-hover)]/40 text-[var(--foreground)] animate-in fade-in duration-100 select-none">
          {/* Main Formatting Toolbar */}
          <div className="px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {/* Undo & Redo (Feature: Direct 1-Click Undo/Redo) */}
              <div className="flex items-center gap-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeFormat('undo')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeFormat('redo')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-0.5 hidden sm:block" />

              {/* Text Block Dropdown / Format Block */}
              <div className="flex items-center gap-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatBlockTag('p')}
                  className="px-2 py-1 rounded text-xs font-medium hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  title="Normal Text / Paragraph"
                >
                  Text
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatBlockTag('h1')}
                  className="px-2 py-1 rounded text-xs font-bold hover:bg-[var(--surface-hover)] text-indigo-400 transition-colors cursor-pointer"
                  title="Heading 1 (Large)"
                >
                  H1
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatBlockTag('h2')}
                  className="px-2 py-1 rounded text-xs font-bold hover:bg-[var(--surface-hover)] text-indigo-300 transition-colors cursor-pointer"
                  title="Heading 2 (Medium)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatBlockTag('h3')}
                  className="px-2 py-1 rounded text-xs font-bold hover:bg-[var(--surface-hover)] text-indigo-200 transition-colors cursor-pointer"
                  title="Heading 3 (Small)"
                >
                  H3
                </button>
              </div>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-0.5 hidden sm:block" />

              {/* Inline Formatting (Zero Markdown Characters) */}
              <div className="flex items-center gap-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeFormat('bold')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs font-bold cursor-pointer transition-colors"
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeFormat('italic')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs italic cursor-pointer transition-colors"
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeFormat('underline')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs underline cursor-pointer transition-colors"
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeFormat('strikeThrough')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs line-through cursor-pointer transition-colors"
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Highlighter Marker Pen */}
              <div className="relative highlight-menu-container">
                <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyHighlight(currentHighlightColor)}
                    className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-[var(--surface-hover)] text-xs cursor-pointer transition-colors"
                    title="Highlight Text (Marker Pen)"
                  >
                    <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: currentHighlightColor === 'transparent' ? 'transparent' : currentHighlightColor }}
                    />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowHighlightDropdown((prev) => !prev)}
                    className="p-1 rounded hover:bg-[var(--surface-hover)] text-xs text-[var(--muted)] cursor-pointer"
                    title="Choose Highlight Color"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {showHighlightDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-44 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-2 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <span className="text-[10px] font-bold uppercase text-[var(--muted)] tracking-wider px-1">
                      Marker Pen
                    </span>
                    <div className="grid grid-cols-2 gap-1 pt-1">
                      {HIGHLIGHT_COLORS.map((h) => (
                        <button
                          key={h.label}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyHighlight(h.color)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-[var(--surface-hover)] cursor-pointer text-left transition-colors"
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full border border-black/20 flex-shrink-0 ${h.bgClass}`}
                            style={h.color !== 'transparent' ? { backgroundColor: h.color } : {}}
                          />
                          <span className="text-[var(--foreground)] truncate">{h.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Visual Link Inserter */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleOpenLinkModal}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs text-indigo-400 font-medium cursor-pointer transition-colors shadow-2xs"
                title="Insert or Edit Hyperlink (Ctrl+L)"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Link</span>
              </button>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-0.5 hidden sm:block" />

              {/* Text Alignment (Directly solves alignment overhead) */}
              <div className="flex items-center gap-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatAlign('justifyLeft')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs cursor-pointer transition-colors"
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatAlign('justifyCenter')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs cursor-pointer transition-colors"
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatAlign('justifyRight')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs cursor-pointer transition-colors"
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-0.5 hidden sm:block" />

              {/* Lists & Quote */}
              <div className="flex items-center gap-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeFormat('insertUnorderedList')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs cursor-pointer transition-colors"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeFormat('insertOrderedList')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs cursor-pointer transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatBlockTag('blockquote')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs cursor-pointer transition-colors"
                  title="Quote / Callout"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatBlockTag('pre')}
                  className="p-1.5 rounded hover:bg-[var(--surface-hover)] text-xs cursor-pointer transition-colors"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-0.5 hidden sm:block" />

              {/* Visual Table Inserter with Custom Dimensions */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowTableDropdown((prev) => !prev);
                    setShowDiagramDropdown(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                    showTableDropdown
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      : 'bg-[var(--surface)] text-sky-400 border-[var(--border)] hover:bg-[var(--surface-hover)]'
                  }`}
                  title="Insert Interactive Visual Table"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Table</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showTableDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-3 z-30 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
                      <span className="text-xs font-bold text-[var(--foreground)]">Create Visual Table</span>
                      <button
                        type="button"
                        onClick={() => setShowTableDropdown(false)}
                        className="text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--muted)] tracking-wider">
                        Quick Presets
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertTable(2, 3)}
                          className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] hover:border-sky-500/50 hover:text-sky-400 text-center cursor-pointer transition-colors"
                          title="2 Columns × 3 Rows"
                        >
                          2 × 3
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertTable(3, 3)}
                          className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] hover:border-sky-500/50 hover:text-sky-400 text-center cursor-pointer transition-colors"
                          title="3 Columns × 3 Rows"
                        >
                          3 × 3
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertTable(4, 4)}
                          className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] hover:border-sky-500/50 hover:text-sky-400 text-center cursor-pointer transition-colors"
                          title="4 Columns × 4 Rows"
                        >
                          4 × 4
                        </button>
                      </div>
                    </div>

                    {/* Custom Dimensions Stepper */}
                    <div className="space-y-2 pt-1 border-t border-[var(--border)]">
                      <span className="text-[10px] font-bold uppercase text-[var(--muted)] tracking-wider">
                        Pick Exact Dimensions
                      </span>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--muted)]">Columns (1-10):</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            type="button"
                            onClick={() => setCustomCols((prev) => Math.max(1, prev - 1))}
                            className="w-5 h-5 rounded bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface)] text-[var(--foreground)] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-[var(--foreground)]">
                            {customCols}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCustomCols((prev) => Math.min(10, prev + 1))}
                            className="w-5 h-5 rounded bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface)] text-[var(--foreground)] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--muted)]">Rows (1-30):</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            type="button"
                            onClick={() => setCustomRows((prev) => Math.max(1, prev - 1))}
                            className="w-5 h-5 rounded bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface)] text-[var(--foreground)] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-[var(--foreground)]">
                            {customRows}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCustomRows((prev) => Math.min(30, prev + 1))}
                            className="w-5 h-5 rounded bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface)] text-[var(--foreground)] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertTable(customCols, customRows)}
                      className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-sky-600/30"
                    >
                      Insert Table ({customCols} Cols × {customRows} Rows)
                    </button>
                  </div>
                )}
              </div>

              {/* Diagram Inserter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowDiagramDropdown((prev) => !prev);
                    setShowTableDropdown(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                    showDiagramDropdown
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                      : 'bg-[var(--surface)] text-indigo-400 border-[var(--border)] hover:bg-[var(--surface-hover)]'
                  }`}
                  title="Insert Visual Mermaid Diagram"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Diagram</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showDiagramDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-1.5 z-30 space-y-0.5">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertDiagram('architecture')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[var(--surface-hover)] cursor-pointer"
                    >
                      📐 Microservice / Arch Flow
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertDiagram('er')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[var(--surface-hover)] cursor-pointer"
                    >
                      🗄️ Database ER Diagram
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertDiagram('sequence')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[var(--surface-hover)] cursor-pointer"
                    >
                      🔄 Sequence / User Flow
                    </button>
                  </div>
                )}
              </div>

              {/* Active Recall Card Inserter */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleInsertRecallCard}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs text-amber-400 font-semibold cursor-pointer transition-colors shadow-2xs"
                title="Insert Visual Active Recall Box"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Recall Box</span>
              </button>

              {/* Image Attachment */}
              <label
                className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-xs cursor-pointer shadow-2xs"
                title="Attach Image / Screenshot"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[var(--muted)] hover:text-[var(--foreground)]" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (loadEvt) => {
                        const dataUrl = loadEvt.target?.result as string;
                        const imgHtml = `<div class="my-3 rounded-xl overflow-hidden border border-[var(--border)] max-w-2xl"><img src="${dataUrl}" alt="Uploaded Image" class="max-w-full h-auto object-contain mx-auto" /></div><p><br></p>`;
                        editorRef.current?.focus();
                        document.execCommand('insertHTML', false, imgHtml);
                        handleEditorInput();
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Visual vs Raw Code Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs flex-shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setEditorViewMode('visual');
                  setTimeout(() => {
                    if (editorRef.current) {
                      editorRef.current.innerHTML = markdownToHtml(content);
                      updateTableContext();
                    }
                  }, 10);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  editorViewMode === 'visual'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
                title="Visual WYSIWYG Mode (Notion style: real formatting, direct clickable cells)"
              >
                Visual
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditorViewMode('raw');
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  editorViewMode === 'raw'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
                title="Raw Code Mode (Inspect or edit raw HTML/Markdown)"
              >
                Raw / Code
              </button>
            </div>
          </div>

          {/* 📊 Interactive Table Action Bar (Appears when cursor is inside any table cell) */}
          {tableInfo && editorViewMode === 'visual' && (
            <div className="px-3 py-1.5 bg-sky-950/40 border-t border-sky-500/30 flex items-center justify-between gap-2 text-xs flex-wrap animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="flex items-center gap-2 text-sky-400 font-semibold">
                <Table className="w-3.5 h-3.5" />
                <span>
                  Table: Row {tableInfo.rowIndex + 1}/{tableInfo.totalRows}, Col {tableInfo.colIndex + 1}/{tableInfo.totalCols}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAddRow('above')}
                  className="px-2 py-0.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] font-medium cursor-pointer"
                  title="Insert Row Above"
                >
                  + Row Above
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAddRow('below')}
                  className="px-2 py-0.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] font-medium cursor-pointer"
                  title="Insert Row Below"
                >
                  + Row Below
                </button>
                <div className="w-[1px] h-3.5 bg-[var(--border)] mx-0.5" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAddCol('left')}
                  className="px-2 py-0.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] font-medium cursor-pointer"
                  title="Insert Column Left"
                >
                  + Col Left
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAddCol('right')}
                  className="px-2 py-0.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] font-medium cursor-pointer"
                  title="Insert Column Right"
                >
                  + Col Right
                </button>
                <div className="w-[1px] h-3.5 bg-[var(--border)] mx-0.5" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleDeleteRow}
                  className="px-2 py-0.5 rounded hover:bg-rose-500/10 text-rose-400 border border-transparent hover:border-rose-500/30 cursor-pointer"
                  title="Delete Current Row"
                >
                  - Row
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleDeleteCol}
                  className="px-2 py-0.5 rounded hover:bg-rose-500/10 text-rose-400 border border-transparent hover:border-rose-500/30 cursor-pointer"
                  title="Delete Current Column"
                >
                  - Col
                </button>
                <div className="w-[1px] h-3.5 bg-[var(--border)] mx-0.5" />
                <span className="text-[var(--muted)] text-[11px]">Align Col:</span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAlignCol('left')}
                  className="p-1 rounded hover:bg-[var(--surface)] text-[var(--foreground)] cursor-pointer"
                  title="Align Column Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAlignCol('center')}
                  className="p-1 rounded hover:bg-[var(--surface)] text-[var(--foreground)] cursor-pointer"
                  title="Align Column Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleAlignCol('right')}
                  className="p-1 rounded hover:bg-[var(--surface)] text-[var(--foreground)] cursor-pointer"
                  title="Align Column Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3.5 bg-[var(--border)] mx-0.5" />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleDeleteTable}
                  className="px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 cursor-pointer font-medium"
                  title="Delete Entire Table"
                >
                  Delete Table
                </button>
              </div>
            </div>
          )}
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
              onClick={() => {
                formatBlockTag('h2');
                setShowSlashMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <Heading2 className="w-4 h-4 text-indigo-400" />
              <span>/heading (Heading 2)</span>
            </button>
            <button
              onClick={() => {
                executeFormat('insertUnorderedList');
                setShowSlashMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <List className="w-4 h-4 text-emerald-400" />
              <span>/bullet (Bullet List)</span>
            </button>
            <button
              onClick={() => {
                formatBlockTag('pre');
                setShowSlashMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <Code className="w-4 h-4 text-blue-400" />
              <span>/code (Code Block)</span>
            </button>
            <button
              onClick={() => {
                handleInsertDiagram('architecture');
                setShowSlashMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>/diagram (Architecture)</span>
            </button>
            <button
              onClick={() => {
                handleInsertTable(3, 3);
                setShowSlashMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <Table className="w-4 h-4 text-sky-400" />
              <span>/table (Visual Interactive Table)</span>
            </button>
            <button
              onClick={() => {
                handleInsertRecallCard();
                setShowSlashMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-[var(--surface-hover)] text-left cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>/recall (Active Recall Spoiler)</span>
            </button>
          </div>
        )}

        {/* 1. WRITE MODE: Visual WYSIWYG or Raw Code */}
        {mode === 'write' ? (
          <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 w-full overflow-y-auto animate-in fade-in duration-150">
            {editorViewMode === 'visual' ? (
              <div
                ref={editorRef}
                contentEditable={canEdit}
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onKeyUp={updateTableContext}
                onMouseUp={updateTableContext}
                onKeyDown={handleEditorKeyDown}
                onPaste={handleEditorPaste}
                data-placeholder="Start typing notes here... Click Bold to bold text, Table to create an interactive table, or type directly without any markdown symbols."
                className={`devforge-wysiwyg flex-1 outline-none text-sm sm:text-base leading-relaxed text-[var(--foreground)] min-h-[500px] ${
                  !canEdit ? 'cursor-not-allowed opacity-90' : ''
                }`}
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                readOnly={!canEdit}
                onChange={(e) => handleContentChange(e.target.value)}
                onPaste={handlePaste}
                placeholder="Raw code view... (HTML or Markdown format)"
                className={`w-full h-full min-h-[500px] bg-transparent resize-none outline-none font-mono text-sm sm:text-base leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted)] ${
                  !canEdit ? 'cursor-not-allowed opacity-90' : ''
                }`}
              />
            )}
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
                  onClick={() => {
                    if (!canEdit) {
                      openAuthModal(
                        'signin',
                        !user
                          ? 'Sign in to write notes.'
                          : 'You can only edit notes created by you.'
                      );
                      return;
                    }
                    setMode('write');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{canEdit ? 'Write notes for this mode' : 'Sign in to write notes'}</span>
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
 * ⚡ Live HTML Renderer with visual tables, active recall and Mermaid diagrams
 */
function HtmlRenderer({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const diagramBlocks = containerRef.current.querySelectorAll('.devforge-diagram-block[data-type="mermaid"]');
    diagramBlocks.forEach(async (block, idx) => {
      const pre = block.querySelector('pre');
      if (!pre) return;
      const chartCode = pre.textContent || '';
      if (!chartCode.trim()) return;

      try {
        const uniqueId = `mermaid-preview-${Date.now()}-${idx}`;
        const { svg } = await mermaid.render(uniqueId, chartCode.trim());
        const svgContainer = document.createElement('div');
        svgContainer.className = 'my-4 flex justify-center overflow-x-auto p-4 bg-[#0d0f17] rounded-xl border border-indigo-500/20';
        svgContainer.innerHTML = svg;
        block.replaceWith(svgContainer);
      } catch {
        // Keep fallback pre block if syntax error
      }
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="devforge-wysiwyg space-y-2 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
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

  // If content is already HTML, render via HtmlRenderer
  if (isHtmlContent(markdown)) {
    return <HtmlRenderer html={markdown} />;
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

    // 📊 Table Parsing (GitHub Flavored Markdown Tables with Alignment)
    if (
      line.trim().startsWith('|') &&
      i + 1 < lines.length &&
      lines[i + 1].includes('|') &&
      lines[i + 1].includes('---')
    ) {
      const headerLine = line;
      const separatorLine = lines[i + 1];
      const dataLines: string[] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith('|')) {
        dataLines.push(lines[j]);
        j++;
      }
      i = j - 1; // Advance loop pointer past table rows

      const parseCells = (rowStr: string) =>
        rowStr
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = parseCells(headerLine);
      const sepCells = parseCells(separatorLine);
      const alignments = sepCells.map((cell) => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'text-center';
        if (trimmed.endsWith(':')) return 'text-right';
        return 'text-left';
      });
      const rows = dataLines.map(parseCells);
      const tKey = `tbl-${blockKey++}`;

      elements.push(
        <div key={tKey} className="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm border-collapse font-sans">
            <thead>
              <tr className="bg-[var(--surface-hover)] border-b border-[var(--border)]">
                {headers.map((h, hIdx) => {
                  const alignClass = alignments[hIdx] || 'text-left';
                  return (
                    <th
                      key={hIdx}
                      className={`px-4 py-2.5 font-bold text-[var(--foreground)] border-r last:border-r-0 border-[var(--border)] ${alignClass}`}
                    >
                      {renderFormattedInline(h)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[var(--surface-hover)]/40 transition-colors">
                  {row.map((cell, cIdx) => {
                    const alignClass = alignments[cIdx] || 'text-left';
                    return (
                      <td
                        key={cIdx}
                        className={`px-4 py-2 text-[var(--foreground)]/90 border-r last:border-r-0 border-[var(--border)] ${alignClass}`}
                      >
                        {renderFormattedInline(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
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
