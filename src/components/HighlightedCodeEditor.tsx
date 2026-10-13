import React, { useMemo } from 'react';
import { highlightCode } from '../utils/highlight';

interface HighlightedCodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

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
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
