/**
 * Visual WYSIWYG & Table Utilities for DevForge
 * Zero-Markdown visual editing, real-time table manipulation, and backward-compatible converter
 */

export function isHtmlContent(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  // Check for common HTML block or inline tags
  return /<\s*(p|h1|h2|h3|h4|h5|h6|table|ul|ol|blockquote|div|pre|strong|em|u|s|span)\b/i.test(trimmed);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInlineFormatting(text: string): string {
  if (!text) return '<br>';
  let s = escapeHtml(text);
  // Bold
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/(^|[^\*])\*([^\*]+?)\*([^\*]|$)/g, '$1<em>$2</em>$3');
  // Strikethrough
  s = s.replace(/~~(.+?)~~/g, '<s>$1</s>');
  // Inline Code
  s = s.replace(
    /`([^`]+?)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs text-indigo-400">$1</code>'
  );
  // Links [text](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline hover:text-indigo-300">$1</a>'
  );
  return s;
}

/**
 * Converts legacy Markdown into clean, editable HTML for the WYSIWYG editor
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p><br></p>';
  if (isHtmlContent(markdown)) return markdown;

  const lines = markdown.split('\n');
  const out: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let inCode = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableAligns: ('left' | 'center' | 'right')[] = [];
  let tableRows: string[][] = [];

  const closeList = () => {
    if (inList) {
      out.push(inList === 'ul' ? '</ul>' : '</ol>');
      inList = null;
    }
  };

  const flushTable = () => {
    if (!inTable) return;
    let html = '<div class="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]"><table class="devforge-table w-full text-left text-xs sm:text-sm border-collapse font-sans" style="width:100%; border-collapse:collapse;">';
    html += '<thead><tr class="bg-[var(--surface-hover)] border-b border-[var(--border)]">';
    tableHeaders.forEach((h, idx) => {
      const align = tableAligns[idx] || 'left';
      html += `<th class="px-4 py-2.5 font-bold text-[var(--foreground)] border-r last:border-r-0 border-[var(--border)]" style="border:1px solid var(--border); padding:8px 12px; text-align:${align}; font-weight:bold;">${renderInlineFormatting(h)}</th>`;
    });
    html += '</tr></thead><tbody class="divide-y divide-[var(--border)]">';
    tableRows.forEach((row) => {
      html += '<tr class="hover:bg-[var(--surface-hover)]/40 transition-colors">';
      row.forEach((cell, idx) => {
        const align = tableAligns[idx] || 'left';
        html += `<td class="px-4 py-2 text-[var(--foreground)]/90 border-r last:border-r-0 border-[var(--border)]" style="border:1px solid var(--border); padding:8px 12px; text-align:${align};">${renderInlineFormatting(cell)}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></div><p><br></p>';
    out.push(html);
    inTable = false;
    tableHeaders = [];
    tableAligns = [];
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      closeList();
      flushTable();
      if (inCode) {
        inCode = false;
        const codeText = escapeHtml(codeBuffer.join('\n'));
        if (codeLang === 'mermaid') {
          out.push(
            `<div class="devforge-diagram-block my-4 rounded-xl border border-indigo-500/30 bg-[#0d0f17] p-3" data-type="mermaid"><div class="text-xs font-mono text-indigo-400 mb-1.5 flex items-center gap-1.5"><span>📐 Mermaid Diagram</span></div><pre class="text-xs font-mono text-indigo-300 p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-x-auto whitespace-pre">${codeText}</pre></div><p><br></p>`
          );
        } else {
          out.push(
            `<pre class="my-4 p-4 rounded-xl bg-[#0d0f17] border border-[var(--border)] font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto whitespace-pre"><code>${codeText}</code></pre><p><br></p>`
          );
        }
        codeBuffer = [];
      } else {
        inCode = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table Detection
    if (line.trim().startsWith('|')) {
      closeList();
      const parseRow = (str: string) =>
        str
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      if (!inTable) {
        if (i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].includes('---')) {
          inTable = true;
          tableHeaders = parseRow(line);
          const sep = parseRow(lines[i + 1]);
          tableAligns = sep.map((s) => {
            if (s.startsWith(':') && s.endsWith(':')) return 'center';
            if (s.endsWith(':')) return 'right';
            return 'left';
          });
          i++; // skip separator line
          continue;
        }
      } else {
        tableRows.push(parseRow(line));
        continue;
      }
    } else {
      flushTable();
    }

    // Active Recall Blocks
    if (line.startsWith(':::recall[')) {
      closeList();
      flushTable();
      const q = line.slice(10, line.indexOf(']'));
      const aLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith(':::')) {
        aLines.push(lines[j]);
        j++;
      }
      i = j;
      out.push(
        `<div class="devforge-recall-card my-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4" data-type="recall"><div class="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">🎯 Active Recall Question:</div><h4 class="font-bold text-base text-[var(--foreground)] mb-2">${renderInlineFormatting(
          q
        )}</h4><div class="text-xs font-bold text-amber-400/80 mb-1">Answer (Hidden in practice):</div><div class="text-sm text-[var(--foreground)]/90 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] leading-relaxed">${renderInlineFormatting(
          aLines.join('\n')
        )}</div></div><p><br></p>`
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      closeList();
      out.push(
        `<h1 class="text-2xl sm:text-3xl font-bold mt-5 mb-2.5 text-[var(--foreground)]">${renderInlineFormatting(
          line.slice(2)
        )}</h1>`
      );
    } else if (line.startsWith('## ')) {
      closeList();
      out.push(
        `<h2 class="text-xl sm:text-2xl font-bold mt-4 mb-2 text-[var(--foreground)] border-b border-[var(--border)] pb-1.5">${renderInlineFormatting(
          line.slice(3)
        )}</h2>`
      );
    } else if (line.startsWith('### ')) {
      closeList();
      out.push(
        `<h3 class="text-lg sm:text-xl font-semibold mt-3 mb-1.5 text-[var(--foreground)]">${renderInlineFormatting(
          line.slice(4)
        )}</h3>`
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inList !== 'ul') {
        closeList();
        inList = 'ul';
        out.push('<ul class="list-disc ml-6 my-2 space-y-1 text-sm sm:text-base text-[var(--foreground)]">');
      }
      out.push(`<li>${renderInlineFormatting(line.slice(2))}</li>`);
    } else if (line.match(/^\d+\.\s/)) {
      if (inList !== 'ol') {
        closeList();
        inList = 'ol';
        out.push('<ol class="list-decimal ml-6 my-2 space-y-1 text-sm sm:text-base text-[var(--foreground)]">');
      }
      out.push(`<li>${renderInlineFormatting(line.replace(/^\d+\.\s/, ''))}</li>`);
    } else if (line.startsWith('> ')) {
      closeList();
      out.push(
        `<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 italic my-2 text-[var(--muted)]">${renderInlineFormatting(
          line.slice(2)
        )}</blockquote>`
      );
    } else if (line.startsWith('![')) {
      closeList();
      const match = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        out.push(
          `<div class="my-4 rounded-xl overflow-hidden border border-[var(--border)] max-w-2xl"><img src="${match[2]}" alt="${escapeHtml(
            match[1]
          )}" class="max-w-full h-auto object-contain mx-auto" />${
            match[1]
              ? `<p class="text-xs text-center text-[var(--muted)] py-1.5 bg-[var(--surface)]">${escapeHtml(
                  match[1]
                )}</p>`
              : ''
          }</div><p><br></p>`
        );
      }
    } else if (!line.trim()) {
      closeList();
      out.push('<p><br></p>');
    } else {
      closeList();
      out.push(
        `<p class="my-2 leading-relaxed text-sm sm:text-base text-[var(--foreground)]">${renderInlineFormatting(
          line
        )}</p>`
      );
    }
  }

  closeList();
  flushTable();

  return out.join('');
}

/**
 * Table Active Cell Inspector
 */
export interface TableCellInfo {
  cell: HTMLTableCellElement;
  row: HTMLTableRowElement;
  table: HTMLTableElement;
  colIndex: number;
  rowIndex: number;
  totalRows: number;
  totalCols: number;
}

export function getActiveTableCell(): TableCellInfo | null {
  if (typeof window === 'undefined') return null;
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;

  let node: Node | null = selection.anchorNode;
  while (node && node !== document.body) {
    if (node.nodeName === 'TD' || node.nodeName === 'TH') {
      const cell = node as HTMLTableCellElement;
      const row = cell.parentElement as HTMLTableRowElement;
      const table = row?.closest('table') as HTMLTableElement;
      if (!table || !row) return null;

      const colIndex = Array.from(row.children).indexOf(cell);
      const rowIndex = Array.from(table.rows).indexOf(row);
      const totalRows = table.rows.length;
      const totalCols = table.rows[0]?.cells.length || 0;

      return { cell, row, table, colIndex, rowIndex, totalRows, totalCols };
    }
    node = node.parentNode;
  }
  return null;
}

/**
 * Creates and inserts a visual HTML table at cursor position
 */
export function insertTableAtCursor(cols: number, rows: number): void {
  const safeCols = Math.max(1, Math.min(10, cols));
  const safeRows = Math.max(1, Math.min(30, rows));

  let headerThs = '';
  for (let c = 0; c < safeCols; c++) {
    headerThs += `<th class="px-4 py-2.5 font-bold text-[var(--foreground)] border border-[var(--border)]" style="border:1px solid var(--border); padding:8px 12px; text-align:left; font-weight:bold;">Column ${c + 1}</th>`;
  }

  let bodyRows = '';
  for (let r = 0; r < safeRows; r++) {
    let rowTds = '';
    for (let c = 0; c < safeCols; c++) {
      rowTds += `<td class="px-4 py-2 text-[var(--foreground)] border border-[var(--border)]" style="border:1px solid var(--border); padding:8px 12px; text-align:left;">Cell ${r + 1}.${c + 1}</td>`;
    }
    bodyRows += `<tr class="hover:bg-[var(--surface-hover)]/40 transition-colors">${rowTds}</tr>`;
  }

  const tableHtml = `
    <div class="my-4 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table class="devforge-table w-full text-left text-xs sm:text-sm border-collapse font-sans" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr class="bg-[var(--surface-hover)] border-b border-[var(--border)]">
            ${headerThs}
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--border)]">
          ${bodyRows}
        </tbody>
      </table>
    </div>
    <p><br></p>
  `;

  document.execCommand('insertHTML', false, tableHtml);
}

/**
 * Add row above or below current cell
 */
export function addTableRow(table: HTMLTableElement, rowIndex: number, position: 'above' | 'below'): void {
  const colsCount = table.rows[0]?.cells.length || 1;
  const targetIndex = position === 'above' ? rowIndex : rowIndex + 1;
  const newRow = table.insertRow(targetIndex);
  newRow.className = 'hover:bg-[var(--surface-hover)]/40 transition-colors';

  for (let c = 0; c < colsCount; c++) {
    const newCell = newRow.insertCell(c);
    newCell.className = 'px-4 py-2 text-[var(--foreground)] border border-[var(--border)]';
    newCell.style.border = '1px solid var(--border)';
    newCell.style.padding = '8px 12px';
    newCell.style.textAlign = 'left';
    newCell.innerHTML = '<br>';
  }
}

/**
 * Add column to the left or right of current cell
 */
export function addTableCol(table: HTMLTableElement, colIndex: number, position: 'left' | 'right'): void {
  const insertIndex = position === 'left' ? colIndex : colIndex + 1;

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    const isHeader = row.parentElement?.tagName === 'THEAD' || row.rowIndex === 0;
    const newCell = document.createElement(isHeader ? 'th' : 'td');

    if (isHeader) {
      newCell.className = 'px-4 py-2.5 font-bold text-[var(--foreground)] border border-[var(--border)]';
      newCell.style.border = '1px solid var(--border)';
      newCell.style.padding = '8px 12px';
      newCell.style.textAlign = 'left';
      newCell.style.fontWeight = 'bold';
      newCell.innerHTML = 'New Header';
    } else {
      newCell.className = 'px-4 py-2 text-[var(--foreground)] border border-[var(--border)]';
      newCell.style.border = '1px solid var(--border)';
      newCell.style.padding = '8px 12px';
      newCell.style.textAlign = 'left';
      newCell.innerHTML = '<br>';
    }

    if (insertIndex >= row.children.length) {
      row.appendChild(newCell);
    } else {
      row.insertBefore(newCell, row.children[insertIndex]);
    }
  }
}

/**
 * Delete current row
 */
export function deleteTableRow(table: HTMLTableElement, rowIndex: number): void {
  if (table.rows.length > 1) {
    table.deleteRow(rowIndex);
  } else {
    deleteTable(table);
  }
}

/**
 * Delete current column
 */
export function deleteTableCol(table: HTMLTableElement, colIndex: number): void {
  const colsCount = table.rows[0]?.cells.length || 0;
  if (colsCount <= 1) {
    deleteTable(table);
    return;
  }
  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    if (row.children[colIndex]) {
      row.children[colIndex].remove();
    }
  }
}

/**
 * Align table column
 */
export function alignTableCol(table: HTMLTableElement, colIndex: number, align: 'left' | 'center' | 'right'): void {
  for (let r = 0; r < table.rows.length; r++) {
    const cell = table.rows[r].children[colIndex] as HTMLElement;
    if (cell) {
      cell.style.textAlign = align;
    }
  }
}

/**
 * Delete whole table
 */
export function deleteTable(table: HTMLTableElement): void {
  const parentContainer = table.closest('.overflow-x-auto');
  if (parentContainer) {
    parentContainer.remove();
  } else {
    table.remove();
  }
}

/**
 * Insert Active Recall Card into editor
 */
export function insertRecallCard(): void {
  const recallHtml = `
    <div class="devforge-recall-card my-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4" data-type="recall">
      <div class="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">🎯 Active Recall Question:</div>
      <h4 class="font-bold text-base text-[var(--foreground)] mb-2" contenteditable="true">What is the critical trade-off or concept here?</h4>
      <div class="text-xs font-bold text-amber-400/80 mb-1">Answer (Hidden during revision):</div>
      <div class="text-sm text-[var(--foreground)]/90 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] leading-relaxed" contenteditable="true">Write the core explanation or answer here...</div>
    </div>
    <p><br></p>
  `;
  document.execCommand('insertHTML', false, recallHtml);
}

/**
 * Insert Diagram template into editor
 */
export function insertDiagram(type: 'architecture' | 'er' | 'sequence'): void {
  let snippet = '';
  if (type === 'architecture') {
    snippet = `graph TD\n    Client[Mobile/Web App] --> CDN[Cloudflare CDN]\n    CDN --> LB[Load Balancer]\n    LB --> API[API Gateway]\n    API --> Cache[(Redis Cache)]\n    API --> DB[(PostgreSQL Database)]`;
  } else if (type === 'er') {
    snippet = `erDiagram\n    USER ||--o{ ORDER : places\n    USER { string id PK, string email }\n    ORDER ||--|{ ITEM : contains\n    ORDER { string id PK, decimal amount }`;
  } else {
    snippet = `sequenceDiagram\n    autonumber\n    actor User\n    User->>Frontend: Click Action\n    Frontend->>Backend: API Request\n    Backend->>Database: Query Data\n    Database-->>Backend: Return Result\n    Backend-->>Frontend: 200 OK Response`;
  }

  const diagramHtml = `
    <div class="devforge-diagram-block my-4 rounded-xl border border-indigo-500/30 bg-[#0d0f17] p-3" data-type="mermaid">
      <div class="text-xs font-mono text-indigo-400 mb-1.5 flex items-center justify-between">
        <span>📐 Mermaid Diagram (${type})</span>
      </div>
      <pre class="text-xs font-mono text-indigo-300 p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-x-auto whitespace-pre" contenteditable="true">${escapeHtml(
        snippet
      )}</pre>
    </div>
    <p><br></p>
  `;
  document.execCommand('insertHTML', false, diagramHtml);
}
