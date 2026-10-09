'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '@/context/ThemeContext';
import { Copy, Check, Layers } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'var(--font-geist-sans), sans-serif',
      });

      const uniqueId = 'mermaid-' + Math.random().toString(36).substring(2, 9);

      mermaid
        .render(uniqueId, chart.trim())
        .then((result) => {
          if (isMounted) {
            setSvgHtml(result.svg);
            setHasError(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setHasError(true);
          }
        });
    } catch {
      if (isMounted) {
        setHasError(true);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [chart, theme]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl border border-indigo-500/20 bg-[var(--surface)] overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-indigo-950/20 border-b border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
            System Architecture Diagram
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Copy Diagram Code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* SVG Canvas / Fallback */}
      <div className="p-4 sm:p-6 flex items-center justify-center overflow-x-auto min-h-[140px]">
        {hasError ? (
          <div className="w-full space-y-2">
            <span className="text-xs font-medium text-amber-400">Diagram rendering (typing in progress):</span>
            <pre className="p-3 rounded-lg bg-[var(--surface-hover)] font-mono text-xs sm:text-sm text-indigo-300 overflow-x-auto whitespace-pre">
              {chart}
            </pre>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}
      </div>
    </div>
  );
}
