'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export function RetroSparkle({
  className = 'text-[#FF3D9A]',
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`sparkle inline-block flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Authentic 4-pointed geometric Y2K sparkle star */}
      <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
    </svg>
  );
}

export function RetroPixelHeart({
  className = 'text-[#FF3D6B]',
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`inline-block flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* 5x4 pixel grid heart */}
      <path d="M2 3h3v2H2z M7 3h2v2H7z M11 3h3v2h-3z M1 5h5v2H1z M6 5h4v2H6z M10 5h5v2h-5z M2 7h12v2H2z M3 9h10v2H3z M5 11h6v2H5z M7 13h2v2H7z" />
    </svg>
  );
}

interface RetroWindowBarProps {
  title: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

export function RetroWindowBar({
  title,
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}: RetroWindowBarProps) {
  const { theme } = useTheme();

  if (theme !== 'retro-y2k') return null;

  return (
    <div className={`y2k-title-bar ${className}`}>
      <div className="flex items-center gap-2 truncate">
        <RetroSparkle size={12} className="text-[#1A0A2E]" />
        <span className="font-['Press_Start_2P'] text-[9px] uppercase tracking-wider text-[#1A0A2E] truncate">
          {title}
        </span>
      </div>
      <div className="y2k-controls">
        <button
          type="button"
          onClick={onMinimize}
          className="min"
          title="Minimize"
          aria-label="Minimize"
        >
          _
        </button>
        <button
          type="button"
          onClick={onMaximize}
          className="max"
          title="Maximize"
          aria-label="Maximize"
        >
          □
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="close"
            title="Close"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
