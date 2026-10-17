/**
 * Ligne d'ouverture d'un bloc Mermaid : « ```mermaid » ou « ```mermaid 60% » (largeur choisie
 * en tirant les poignées du diagramme). Les autres lecteurs Markdown ne regardent que le premier mot.
 */
export const MERMAID_MIN_WIDTH = 20;

export function parseMermaidInfo(info: string): {
  isMermaid: boolean;
  widthPct: number | null;
} {
  const words = info.trim().split(/\s+/);
  if (words[0]?.toLowerCase() !== 'mermaid') {
    return { isMermaid: false, widthPct: null };
  }
  const token = words.slice(1).find((w) => /^\d{2,3}%$/.test(w));
  if (!token) return { isMermaid: true, widthPct: null };
  const pct = Math.min(100, Math.max(MERMAID_MIN_WIDTH, parseInt(token, 10)));
  return { isMermaid: true, widthPct: pct };
}

export function buildMermaidFence(code: string, widthPct: number | null): string {
  const info = widthPct !== null ? `mermaid ${Math.round(widthPct)}%` : 'mermaid';
  return `\`\`\`${info}\n${code}\n\`\`\``;
}
