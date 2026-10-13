/**
 * Accès aux vrais fichiers du disque via Tauri (boîtes de dialogue natives +
 * lecture / écriture directes). Dans un simple navigateur (npm run dev), rien
 * de tout cela n'est disponible : `isTauri()` renvoie false et l'application
 * garde son comportement web (sélecteur de fichier + téléchargement).
 *
 * Les plugins sont importés dynamiquement pour ne rien charger hors de Tauri.
 */

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
  return chosen ?? null;
}

export async function readTextFromPath(path: string): Promise<string> {
  const { readTextFile } = await import('@tauri-apps/plugin-fs');
  return readTextFile(path);
}

export async function writeTextToPath(
  path: string,
  content: string
): Promise<void> {
  const { writeTextFile } = await import('@tauri-apps/plugin-fs');
  await writeTextFile(path, content);
}
