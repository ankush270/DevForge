'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { RetroWindowBar } from '@/components/common/RetroDeco';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

export function ConfirmModal() {
  const { confirmDialogState, closeConfirmDialog } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!confirmDialogState?.isOpen) return;
      if (e.key === 'Escape') {
        closeConfirmDialog();
      } else if (e.key === 'Enter') {
        confirmDialogState.onConfirm();
        closeConfirmDialog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialogState, closeConfirmDialog]);

  if (!confirmDialogState?.isOpen) return null;

  const {
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = true,
    onConfirm,
  } = confirmDialogState;

  const handleConfirm = () => {
    onConfirm();
    closeConfirmDialog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-100">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeConfirmDialog}
      />

      {/* Retro Window Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--surface)] border-2 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <RetroWindowBar
          title={`Prompt.exe — ${title}`}
          onClose={closeConfirmDialog}
        />

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                isDestructive
                  ? 'bg-rose-500/15 text-rose-500'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              {isDestructive ? (
                <Trash2 className="w-5 h-5 text-rose-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeConfirmDialog}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 border-black bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--foreground)] shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 border-black text-white shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
