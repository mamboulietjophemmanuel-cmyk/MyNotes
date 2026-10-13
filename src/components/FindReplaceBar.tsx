import React, { useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  CaseSensitive,
  WholeWord,
  Regex,
  Replace,
  ReplaceAll,
  AlertTriangle,
} from 'lucide-react';
import { SearchOptions } from '../utils/searchEngine';

export interface FindReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  options: SearchOptions;
  onOptionsChange: (opts: SearchOptions) => void;
  showReplace: boolean;
  onToggleReplace: (show: boolean) => void;
  replaceText: string;
  onReplaceTextChange: (val: string) => void;
  matchesCount: number;
  currentMatchIndex: number | null; // 0-based
  regexError: string | null;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplaceCurrent: () => void;
  onReplaceAll: () => void;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  options,
  onOptionsChange,
  showReplace,
  onToggleReplace,
  replaceText,
  onReplaceTextChange,
  matchesCount,
  currentMatchIndex,
  regexError,
  onFindNext,
  onFindPrev,
  onReplaceCurrent,
  onReplaceAll,
}) => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  // Focus and select text when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen]);

  // If showReplace was just toggled open via shortcut, focus replace input if search has text
  const prevShowReplaceRef = useRef<boolean>(showReplace);
  useEffect(() => {
    if (!prevShowReplaceRef.current && showReplace && query.trim() !== '') {
      setTimeout(() => {
        replaceInputRef.current?.focus();
        replaceInputRef.current?.select();
      }, 50);
    }
    prevShowReplaceRef.current = showReplace;
  }, [showReplace, query]);

  if (!isOpen) return null;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onFindPrev();
      } else {
        onFindNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown' && showReplace) {
      e.preventDefault();
      replaceInputRef.current?.focus();
    }
  };

  const handleReplaceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey || e.altKey) {
        onReplaceAll();
      } else {
        onReplaceCurrent();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };

  const toggleOption = (key: keyof SearchOptions) => {
    onOptionsChange({
      ...options,
      [key]: !options[key],
    });
  };

  const hasQuery = query.length > 0;
  const matchDisplay = (() => {
    if (!hasQuery) return null;
    if (regexError) return 'Erreur regex';
    if (matchesCount === 0) return '0 résultat';
    const currentNum = currentMatchIndex !== null ? currentMatchIndex + 1 : 1;
    return `${currentNum} / ${matchesCount}`;
  })();

  return (
    <div
      role="search"
      aria-label="Rechercher et remplacer"
      className="absolute top-3 right-6 z-40 flex flex-col gap-1.5 rounded-2xl border border-[var(--adw-border)] bg-[var(--adw-popover-bg)]/95 p-2 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-2 w-[390px] max-w-[calc(100vw-3rem)]"
      style={{ boxShadow: 'var(--adw-shadow-popover)' }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      {/* ROW 1: Find input + toggles + arrows + close */}
      <div className="flex items-center gap-1.5">
        {/* Toggle Replace disclosure button */}
        <button
          type="button"
          onClick={() => onToggleReplace(!showReplace)}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--adw-fg-muted)] hover:bg-[var(--adw-hover-bg)] hover:text-[var(--adw-fg)] transition-colors ${
            showReplace ? 'text-[var(--adw-accent)]' : ''
          }`}
          title={showReplace ? 'Masquer le remplacement' : 'Afficher le remplacement (Ctrl+H)'}
          aria-expanded={showReplace}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${
              showReplace ? 'rotate-90 text-[var(--adw-accent)]' : ''
            }`}
          />
        </button>

        {/* Search input container */}
        <div className="relative flex-1 flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Rechercher..."
            className={`w-full rounded-lg border py-1.5 pl-2.5 text-xs text-[var(--adw-fg)] bg-[var(--adw-view-bg)] placeholder-[var(--adw-fg-muted)] focus:outline-none transition-all ${
              regexError
                ? 'border-red-500/70 focus:border-red-500 ring-1 ring-red-500/30'
                : 'border-[var(--adw-border)] focus:border-[var(--adw-accent)] focus:ring-1 focus:ring-[var(--adw-accent)]/30'
            } ${hasQuery ? 'pr-20' : 'pr-3'}`}
          />

          {/* Match badge inside input */}
          {matchDisplay && (
            <div className="pointer-events-none absolute right-2 flex items-center gap-1">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                  regexError
                    ? 'bg-red-500/15 text-red-500 dark:text-red-400'
                    : matchesCount === 0
                    ? 'bg-[var(--adw-border)]/50 text-[var(--adw-fg-muted)]'
                    : 'bg-[var(--adw-accent-soft)] text-[var(--adw-accent)] font-semibold'
                }`}
              >
                {matchDisplay}
              </span>
            </div>
          )}
        </div>

        {/* Search Options: Case Sensitive, Whole Word, Regex */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => toggleOption('matchCase')}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors text-xs font-semibold ${
              options.matchCase
                ? 'bg-[var(--adw-accent)] text-white shadow-xs'
                : 'text-[var(--adw-fg-muted)] hover:bg-[var(--adw-hover-bg)] hover:text-[var(--adw-fg)]'
            }`}
            title="Respecter la casse (Aa)"
            aria-pressed={options.matchCase}
          >
            <CaseSensitive className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => toggleOption('wholeWord')}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors text-xs ${
              options.wholeWord
                ? 'bg-[var(--adw-accent)] text-white shadow-xs'
                : 'text-[var(--adw-fg-muted)] hover:bg-[var(--adw-hover-bg)] hover:text-[var(--adw-fg)]'
            }`}
            title="Mot entier (\b)"
            aria-pressed={options.wholeWord}
          >
            <WholeWord className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => toggleOption('useRegex')}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors text-xs ${
              options.useRegex
                ? 'bg-[var(--adw-accent)] text-white shadow-xs'
                : 'text-[var(--adw-fg-muted)] hover:bg-[var(--adw-hover-bg)] hover:text-[var(--adw-fg)]'
            }`}
            title="Expression régulière (.*)"
            aria-pressed={options.useRegex}
          >
            <Regex className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Previous & Next arrows */}
        <div className="flex items-center gap-0.5 shrink-0 border-l border-[var(--adw-border)] pl-1">
          <button
            type="button"
            onClick={onFindPrev}
            disabled={matchesCount === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--adw-fg-muted)] hover:bg-[var(--adw-hover-bg)] hover:text-[var(--adw-fg)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Occurrence précédente (Maj+Entrée)"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onFindNext}
            disabled={matchesCount === 0}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--adw-fg-muted)] hover:bg-[var(--adw-hover-bg)] hover:text-[var(--adw-fg)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Occurrence suivante (Entrée)"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--adw-fg-muted)] hover:bg-[var(--adw-hover-bg)] hover:text-[var(--adw-fg)] transition-colors"
          title="Fermer la recherche (Échap)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Regex error notice if any */}
      {regexError && (
        <div className="flex items-center gap-1.5 px-2 text-[11px] text-red-500 dark:text-red-400">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span className="truncate">{regexError}</span>
        </div>
      )}

      {/* ROW 2: Replace input + Replace and Replace All actions */}
      {showReplace && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--adw-border-subtle)] animate-in fade-in duration-150">
          {/* Spacer to align under the search input */}
          <div className="h-7 w-7 shrink-0 flex items-center justify-center text-[var(--adw-fg-muted)]">
            <Replace className="h-3.5 w-3.5 opacity-60" />
          </div>

          <div className="flex-1">
            <input
              ref={replaceInputRef}
              type="text"
              value={replaceText}
              onChange={(e) => onReplaceTextChange(e.target.value)}
              onKeyDown={handleReplaceKeyDown}
              placeholder="Remplacer par..."
              className="w-full rounded-lg border border-[var(--adw-border)] bg-[var(--adw-view-bg)] py-1.5 px-2.5 text-xs text-[var(--adw-fg)] placeholder-[var(--adw-fg-muted)] focus:border-[var(--adw-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--adw-accent)]/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onReplaceCurrent}
              disabled={matchesCount === 0}
              className="adw-btn px-2.5 py-1 text-xs font-medium border border-[var(--adw-border)] bg-[var(--adw-card-bg)] text-[var(--adw-fg)] hover:bg-[var(--adw-hover-bg)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Remplacer l'occurrence active (Entrée)"
            >
              <span>Remplacer</span>
            </button>

            <button
              type="button"
              onClick={onReplaceAll}
              disabled={matchesCount === 0}
              className="adw-btn px-2.5 py-1 text-xs font-semibold bg-[var(--adw-accent)] text-white hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none shadow-xs transition-colors"
              title="Remplacer toutes les occurrences (Alt+A / Ctrl+Alt+Entrée)"
            >
              <span>Tout remplacer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
