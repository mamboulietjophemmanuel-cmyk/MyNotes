/**
 * Accès aux vrais fichiers du disque via Tauri (boîtes de dialogue natives +
 * lecture / écriture directes). Dans un simple navigateur (npm run dev), rien
 * de tout cela n'est disponible : `isTauri()` renvoie false et l'application
 * garde son comportement web (sélecteur de fichier + téléchargement).
 *
 * Les plugins sont importés dynamiquement pour ne rien charger hors de Tauri.
 */

import {
  IMAGE_EXTENSION_PATTERN,
  MARKDOWN_EXTENSION_PATTERN,
} from './fileTypes';

const MARKDOWN_FILTER = [
  { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
];

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Nom du fichier à partir d'un chemin Windows ou Unix. */
export function baseName(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
}

/** Dossier contenant le fichier (sans le séparateur final). */
export function dirName(path: string): string {
  const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return idx > 0 ? path.slice(0, idx) : '';
}

/** Assemble un dossier et un nom de fichier avec le séparateur du chemin d'origine. */
export function joinPath(dir: string, name: string): string {
  if (!dir) return name;
  const sep = dir.includes('\\') && !dir.includes('/') ? '\\' : '/';
  return `${dir}${sep}${name}`;
}

/** Remplace le dossier personnel par « ~ » pour l'affichage (ex. ~/Documents). */
export function displayDir(path: string, home: string | null): string {
  const dir = dirName(path);
  if (!dir) return path;
  if (home) {
    const norm = (v: string) => v.replace(/\\/g, '/').replace(/\/+$/, '');
    const nDir = norm(dir);
    const nHome = norm(home);
    if (nDir.toLowerCase() === nHome.toLowerCase()) return '~';
    if (nDir.toLowerCase().startsWith(`${nHome.toLowerCase()}/`)) {
      return `~${nDir.slice(nHome.length)}`;
    }
  }
  return dir;
}

let cachedHome: string | null | undefined;

export async function getHomeDir(): Promise<string | null> {
  if (!isTauri()) return null;
  if (cachedHome !== undefined) return cachedHome;
  try {
    const { homeDir } = await import('@tauri-apps/api/path');
    cachedHome = await homeDir();
  } catch {
    cachedHome = null;
  }
  return cachedHome;
}

export interface OpenedFile {
  path: string;
  name: string;
  content: string;
}

/** Boîte « Ouvrir » native ; renvoie les fichiers lus, ou null si annulé. */
export async function openMarkdownFilesDialog(): Promise<OpenedFile[] | null> {
  const { open } = await import('@tauri-apps/plugin-dialog');
  const picked = await open({
    multiple: true,
    directory: false,
    filters: MARKDOWN_FILTER,
  });
  if (!picked) return null;
  const paths = Array.isArray(picked) ? picked : [picked];
  if (paths.length === 0) return null;
  const files: OpenedFile[] = [];
  for (const path of paths) {
    files.push({ path, name: baseName(path), content: await readTextFromPath(path) });
  }
  return files;
}

/** Boîte « Enregistrer sous » native ; renvoie le chemin choisi, ou null si annulé. */
export async function saveFileDialog(
  defaultPath: string
): Promise<string | null> {
  const { save } = await import('@tauri-apps/plugin-dialog');
  const chosen = await save({ defaultPath, filters: MARKDOWN_FILTER });
  if (!chosen) return null;
  // Sans extension reconnue, on ajoute .md (seuls .md, .markdown et .txt peuvent être écrits)
  return MARKDOWN_EXTENSION_PATTERN.test(chosen) ? chosen : `${chosen}.md`;
}

export async function readTextFromPath(path: string): Promise<string> {
  const { readTextFile } = await import('@tauri-apps/plugin-fs');
  return readTextFile(path);
}

/** Écrit une note sur le disque (commande Rust `write_text_file_at`, voir src-tauri/src/lib.rs). */
export async function writeTextToPath(
  path: string,
  content: string
): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('write_text_file_at', { path, content });
}

const IMAGE_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export function isMarkdownPath(path: string): boolean {
  return MARKDOWN_EXTENSION_PATTERN.test(path);
}

export function isImagePath(path: string): boolean {
  return IMAGE_EXTENSION_PATTERN.test(path);
}

/** Lit une image du disque et la renvoie sous forme de `File` (réutilisable par le code d'insertion d'images). */
export async function readImageFile(path: string): Promise<File> {
  const { readFile } = await import('@tauri-apps/plugin-fs');
  const bytes = await readFile(path);
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return new File([bytes as BlobPart], baseName(path), {
    type: IMAGE_MIME[ext] ?? 'image/png',
  });
}

export interface FileDropHandlers {
  /** true quand un fichier survole la fenêtre, false quand il en sort ou est déposé */
  onHover: (hovering: boolean) => void;
  /** Chemins déposés + position du curseur en pixels CSS (relative à la fenêtre) */
  onDrop: (paths: string[], point: { x: number; y: number }) => void;
}

/**
 * Sous Tauri, les fichiers déposés sur la fenêtre sont interceptés par l'application
 * (le navigateur intégré ne reçoit pas d'événement « drop » pour eux). Cette fonction écoute
 * les événements de Tauri et fournit les vrais chemins. Renvoie la fonction de désabonnement.
 */
export async function listenFileDrops(
  handlers: FileDropHandlers
): Promise<() => void> {
  const { getCurrentWebview } = await import('@tauri-apps/api/webview');
  return getCurrentWebview().onDragDropEvent((event) => {
    const payload = event.payload;
    if (payload.type === 'enter' || payload.type === 'over') {
      handlers.onHover(true);
    } else if (payload.type === 'leave') {
      handlers.onHover(false);
    } else if (payload.type === 'drop') {
      handlers.onHover(false);
      // La position fournie par Tauri est en pixels physiques : on la convertit en pixels CSS
      const ratio = window.devicePixelRatio || 1;
      handlers.onDrop(payload.paths, {
        x: payload.position.x / ratio,
        y: payload.position.y / ratio,
      });
    }
  });
}

/** Lit plusieurs fichiers texte du disque. */
export async function readOpenedFiles(paths: string[]): Promise<OpenedFile[]> {
  return Promise.all(
    paths.map(async (path) => ({
      path,
      name: baseName(path),
      content: await readTextFromPath(path),
    }))
  );
}

/** Fichiers passés à MyNotes au lancement (double-clic sur un .md dans l'explorateur, « Ouvrir avec »…). */
export async function getLaunchFiles(): Promise<string[]> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<string[]>('get_launch_files');
}

/** Fichiers envoyés par une seconde instance de MyNotes (la fenêtre déjà ouverte les reçoit). */
export async function listenOpenFiles(
  callback: (paths: string[]) => void
): Promise<() => void> {
  const { listen } = await import('@tauri-apps/api/event');
  return listen<string[]>('open-files', (event) => callback(event.payload));
}

/** Réduit la fenêtre dans la barre des tâches (la barre de titre native est désactivée). */
export async function minimizeWindow(): Promise<void> {
  const { getCurrentWindow } = await import('@tauri-apps/api/window');
  await getCurrentWindow().minimize();
}
