/**
 * Historique d'annulation (Ctrl+Z) et de rétablissement (Ctrl+Y) du contenu d'une note.
 * Les modifications tapées en continu sont regroupées en une seule étape pour qu'un Ctrl+Z
 * annule un « paquet » de frappes plutôt qu'une lettre à la fois.
 */
export interface DocHistory {
  past: string[];
  future: string[];
  lastRecordedAt: number;
}

const GROUP_WINDOW_MS = 800;
const MAX_STEPS = 300;

export function createHistory(): DocHistory {
  return { past: [], future: [], lastRecordedAt: 0 };
}

/** À appeler quand le contenu change : `previous` est le contenu avant la modification. */
export function recordChange(
  history: DocHistory,
  previous: string,
  now: number = Date.now()
): void {
  history.future = [];
  if (now - history.lastRecordedAt > GROUP_WINDOW_MS || history.past.length === 0) {
    history.past.push(previous);
    if (history.past.length > MAX_STEPS) history.past.shift();
  }
  history.lastRecordedAt = now;
}

/** Renvoie le contenu à restaurer, ou null s'il n'y a rien à annuler. */
export function undoStep(history: DocHistory, current: string): string | null {
  const previous = history.past.pop();
  if (previous === undefined) return null;
  history.future.push(current);
  history.lastRecordedAt = 0; // la prochaine frappe ouvre une nouvelle étape
  return previous;
}

/** Renvoie le contenu à rétablir, ou null s'il n'y a rien à rétablir. */
export function redoStep(history: DocHistory, current: string): string | null {
  const next = history.future.pop();
  if (next === undefined) return null;
  history.past.push(current);
  history.lastRecordedAt = 0;
  return next;
}
