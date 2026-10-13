export interface SearchOptions {
  matchCase: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface SearchMatch {
  index: number;
  start: number;
  end: number;
  text: string;
  blockIndex?: number;
  offsetInBlock?: number;
  matchInBlockIndex?: number;
}

export interface SearchResult {
  matches: SearchMatch[];
  regexError: string | null;
}

/**
 * Compiles a RegExp safely handling case sensitivity, whole-word and regex mode.
 */
export function compileSearchPattern(
  query: string,
  options: SearchOptions
): { regex: RegExp | null; error: string | null } {
  if (!query) {
    return { regex: null, error: null };
  }

  let pattern = query;
  if (!options.useRegex) {
    // Escape regex special chars
    pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  if (options.wholeWord) {
    pattern = `\\b(?:${pattern})\\b`;
  }

  const flags = options.matchCase ? 'g' : 'gi';

  try {
    const regex = new RegExp(pattern, flags);
    return { regex, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Syntaxe regex invalide';
    return { regex: null, error: message };
  }
}

/**
 * Finds all occurrences of the query in the markdown text and correlates them with block indices.
 */
export function findMatches(
  text: string,
  query: string,
  options: SearchOptions,
  blocks?: { raw: string }[]
): SearchResult {
  if (!query || !text) {
    return { matches: [], regexError: null };
  }

  const { regex, error } = compileSearchPattern(query, options);
  if (error || !regex) {
    return { matches: [], regexError: error };
  }

  const matches: SearchMatch[] = [];
  let m: RegExpExecArray | null;
  let idx = 0;

  // Pre-calculate block start/end boundaries if blocks are supplied
  const blockOffsets: { start: number; end: number; blockIndex: number }[] = [];
  if (blocks && blocks.length > 0) {
    let curr = 0;
    for (let b = 0; b < blocks.length; b++) {
      const len = blocks[b].raw.length;
      blockOffsets.push({ start: curr, end: curr + len, blockIndex: b });
      curr += len + 2; // '\n\n' separator between blocks
    }
  }

  const matchCountPerBlock: Record<number, number> = {};

  while ((m = regex.exec(text)) !== null) {
    // Guard against infinite loop for 0-length regex matches
    if (m[0].length === 0) {
      regex.lastIndex++;
      continue;
    }

    const start = m.index;
    const end = m.index + m[0].length;

    let blockIndex: number | undefined;
    let offsetInBlock: number | undefined;

    if (blockOffsets.length > 0) {
      for (const bo of blockOffsets) {
        if (start >= bo.start && start <= bo.end) {
          blockIndex = bo.blockIndex;
          offsetInBlock = start - bo.start;
          break;
        }
      }
    }

    const matchInBlock =
      blockIndex !== undefined
        ? (matchCountPerBlock[blockIndex] =
            (matchCountPerBlock[blockIndex] ?? 0) + 1) - 1
        : undefined;

    matches.push({
      index: idx++,
      start,
      end,
      text: m[0],
      blockIndex,
      offsetInBlock,
      matchInBlockIndex: matchInBlock,
    });
  }

  return { matches, regexError: null };
}

/**
 * Replaces a single match in the source text.
 */
export function replaceMatchAt(
  text: string,
  match: SearchMatch,
  replacement: string
): string {
  if (match.start < 0 || match.end > text.length || match.start > match.end) {
    return text;
  }
  return text.slice(0, match.start) + replacement + text.slice(match.end);
}

/**
 * Replaces all occurrences of the query in the source text.
 */
export function replaceAllMatches(
  text: string,
  query: string,
  replacement: string,
  options: SearchOptions
): { newText: string; count: number; error: string | null } {
  if (!query || !text) {
    return { newText: text, count: 0, error: null };
  }

  const { regex, error } = compileSearchPattern(query, options);
  if (error || !regex) {
    return { newText: text, count: 0, error };
  }

  let count = 0;
  const newText = text.replace(regex, () => {
    count++;
    return replacement;
  });

  return { newText, count, error: null };
}
