'use client';

import React from 'react';
import Image from 'next/image';

interface DevForgeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function DevForgeLogo({
  size = 'md',
  showText = false,
  className = '',
}: DevForgeLogoProps) {
  const sizeMap = {
    sm: { px: 28, box: 'w-7 h-7 rounded-lg' },
    md: { px: 38, box: 'w-9.5 h-9.5 rounded-xl' },
    lg: { px: 52, box: 'w-13 h-13 rounded-2xl' },
    xl: { px: 80, box: 'w-20 h-20 rounded-3xl' },
  };

  const { px, box } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Iconic Cyber-Forge Emblem */}
      <div
        className={`relative ${box} overflow-hidden border border-indigo-500/30 bg-black/40 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10 flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
      >
        <Image
          src="/logo.png"
          alt="DevForge Logo"
          width={px}
          height={px}
          priority
          className="object-cover w-full h-full"
        />
        {/* Subtle glowing ambient pulse */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-amber-500/15 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              DevForge
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 uppercase tracking-wider">
              PRO
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)] font-medium -mt-0.5">
            Engineering Knowledge OS
          </span>
        </div>
      )}
    </div>
  );
}
