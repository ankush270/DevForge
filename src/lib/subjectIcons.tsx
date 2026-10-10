import React from 'react';
import {
  Cpu,
  Database,
  Network,
  Binary,
  Layers,
  Code,
  Terminal,
  Cloud,
  Shield,
  Zap,
  Brain,
  GitBranch,
  Flame,
  Target,
  Globe,
  Smartphone,
  BookOpen,
  Users,
  Server,
  Folder,
  LucideIcon,
} from 'lucide-react';

export interface SubjectIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SubjectColorOption {
  id: string;
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  colorHex: string;
}

export const SUBJECT_ICON_OPTIONS: SubjectIconOption[] = [
  { id: 'Cpu', label: 'Hardware & OS', icon: Cpu },
  { id: 'Database', label: 'Databases & SQL', icon: Database },
  { id: 'Network', label: 'Networks & Web', icon: Network },
  { id: 'Binary', label: 'Algorithms & Math', icon: Binary },
  { id: 'Layers', label: 'System Design', icon: Layers },
  { id: 'Code', label: 'Coding & OOP', icon: Code },
  { id: 'Terminal', label: 'Linux & CLI', icon: Terminal },
  { id: 'Cloud', label: 'Cloud & DevOps', icon: Cloud },
  { id: 'Shield', label: 'Security & Auth', icon: Shield },
  { id: 'Zap', label: 'Performance & Redis', icon: Zap },
  { id: 'Brain', label: 'AI & Data Science', icon: Brain },
  { id: 'GitBranch', label: 'Git & Version Control', icon: GitBranch },
  { id: 'Flame', label: 'Interview Cramming', icon: Flame },
  { id: 'Target', label: 'Company Problems', icon: Target },
  { id: 'Globe', label: 'Web & Distributed', icon: Globe },
  { id: 'Smartphone', label: 'Mobile Apps', icon: Smartphone },
  { id: 'Server', label: 'Backend & APIs', icon: Server },
  { id: 'Users', label: 'Behavioral & Leadership', icon: Users },
  { id: 'BookOpen', label: 'Theory & Books', icon: BookOpen },
  { id: 'Folder', label: 'General Topic', icon: Folder },
];

export const SUBJECT_COLOR_OPTIONS: SubjectColorOption[] = [
  { id: 'indigo', label: 'Indigo', textClass: 'text-indigo-400', bgClass: 'bg-indigo-500/15', borderClass: 'border-indigo-500/30', colorHex: '#818cf8' },
  { id: 'blue', label: 'Blue', textClass: 'text-blue-400', bgClass: 'bg-blue-500/15', borderClass: 'border-blue-500/30', colorHex: '#60a5fa' },
  { id: 'emerald', label: 'Emerald', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/15', borderClass: 'border-emerald-500/30', colorHex: '#34d399' },
  { id: 'amber', label: 'Amber', textClass: 'text-amber-400', bgClass: 'bg-amber-500/15', borderClass: 'border-amber-500/30', colorHex: '#fbbf24' },
  { id: 'rose', label: 'Rose', textClass: 'text-rose-400', bgClass: 'bg-rose-500/15', borderClass: 'border-rose-500/30', colorHex: '#fb7185' },
  { id: 'violet', label: 'Violet', textClass: 'text-violet-400', bgClass: 'bg-violet-500/15', borderClass: 'border-violet-500/30', colorHex: '#a78bfa' },
  { id: 'cyan', label: 'Cyan', textClass: 'text-cyan-400', bgClass: 'bg-cyan-500/15', borderClass: 'border-cyan-500/30', colorHex: '#22d3ee' },
  { id: 'orange', label: 'Orange', textClass: 'text-orange-400', bgClass: 'bg-orange-500/15', borderClass: 'border-orange-500/30', colorHex: '#fb923c' },
];

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  Cpu,
  Database,
  Network,
  Binary,
  Layers,
  Code,
  Terminal,
  Cloud,
  Shield,
  Zap,
  Brain,
  GitBranch,
  Flame,
  Target,
  Globe,
  Smartphone,
  Server,
  Users,
  BookOpen,
  Folder,
};

export function renderSubjectIcon(
  iconName?: string,
  colorName = 'indigo',
  sizeClass = 'w-4 h-4'
) {
  const IconComponent = (iconName && ICON_COMPONENTS[iconName]) || BookOpen;
  const colorDef = SUBJECT_COLOR_OPTIONS.find((c) => c.id === colorName) || SUBJECT_COLOR_OPTIONS[0];

  return <IconComponent className={`${sizeClass} ${colorDef.textClass} flex-shrink-0`} />;
}
