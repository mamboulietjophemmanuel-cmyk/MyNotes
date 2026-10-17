import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { highlightCode } from '../utils/highlight';

interface HighlightedCodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

const INDENT = '    ';

const TEXT_STYLE =
  'font-mono text-[13px] leading-relaxed whitespace-pre [tab-size:4]';

/**
 * Zone de saisie de code avec coloration syntaxique en direct.
 * Principe : une couche colorée (non interactive) est affichée derrière un <textarea> transparent
 * de même police, même taille et mêmes marges. On tape dans le textarea, on voit la couche colorée.
 * Pas de retour à la ligne automatique : les lignes longues défilent horizontalement, ce qui garde
 * les deux couches parfaitement alignées.
 */
export const HighlightedCodeEditor: React.FC<HighlightedCodeEditorProps> = ({
  value,
  language,
  onChange,
}) => {
  const html = useMemo(() => highlightCode(value, language), [value, language]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Sélection à restaurer après le prochain rendu (le texte est contrôlé par React)
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  useLayoutEffect(() => {
    const ta = textareaRef.current;
    if (ta && pendingSelection.current) {
      ta.setSelectionRange(
        pendingSelection.current.start,
        pendingSelection.current.end
      );
      pendingSelection.current = null;
    }
  });

  const applyEdit = (next: string, start: number, end: number = start) => {
    pendingSelection.current = { start, end };
    onChange(next);
  };

  // Comme dans VS Code : Tab indente (4 espaces), Maj+Tab désindente, Entrée garde l'indentation de la ligne
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const ta = e.currentTarget;
    const text = ta.value;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const indent = (text.slice(lineStart, start).match(/^[ \t]*/) || [''])[0];
      applyEdit(
        text.slice(0, start) + '\n' + indent + text.slice(end),
        start + 1 + indent.length
      );
      return;
    }

    if (e.key !== 'Tab') return;
    e.preventDefault();

    const multiLine = text.slice(start, end).includes('\n');
    if (!e.shiftKey && !multiLine) {
      applyEdit(text.slice(0, start) + INDENT + text.slice(end), start + INDENT.length);
      return;
    }

    // Indentation / désindentation de toutes les lignes touchées par la sélection
    const firstLineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lastChar = end > start && text[end - 1] === '\n' ? end - 1 : end;
    const lineBreak = text.indexOf('\n', lastChar);
    const lastLineEnd = lineBreak === -1 ? text.length : lineBreak;
    const lines = text.slice(firstLineStart, lastLineEnd).split('\n');

    let firstDelta = 0;
    let totalDelta = 0;
    const edited = lines.map((line, i) => {
      let delta: number;
      let out: string;
      if (e.shiftKey) {
        const lead = line.match(/^( {1,4}|\t)/);
        out = lead ? line.slice(lead[0].length) : line;
        delta = out.length - line.length;
      } else {
        out = INDENT + line;
        delta = INDENT.length;
      }
      if (i === 0) firstDelta = delta;
      totalDelta += delta;
      return out;
    });

    applyEdit(
      text.slice(0, firstLineStart) + edited.join('\n') + text.slice(lastLineEnd),
      Math.max(firstLineStart, start + firstDelta),
      Math.max(firstLineStart, end + totalDelta)
    );
  };
  // Le retour à la ligne final garantit que la dernière ligne vide garde sa hauteur ; minimum 2 lignes
  const tail = value.split('\n').length < 2 ? '\n\n' : '\n';

  return (
    <div className="overflow-x-auto">
      <div className="relative w-max min-w-full">
        <div
          aria-hidden="true"
          className={`pointer-events-none select-none p-4 text-[var(--adw-fg)] ${TEXT_STYLE}`}
        >
          {html !== null ? (
            <span dangerouslySetInnerHTML={{ __html: html + tail }} />
          ) : (
            <span>{value + tail}</span>
          )}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          className={`absolute inset-0 h-full w-full resize-none overflow-hidden border-0 bg-transparent p-4 text-transparent caret-[var(--adw-fg)] focus:outline-none ${TEXT_STYLE}`}
        />
      </div>
    </div>
  );
};
