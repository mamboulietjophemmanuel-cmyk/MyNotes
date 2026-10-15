/** Détection des types de fichiers, partagée par l'application (glisser-déposer, ouverture, collage). */

export const MARKDOWN_EXTENSION_PATTERN = /\.(md|markdown|txt)$/i;
export const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|webp|gif|svg)$/i;
const IMAGE_URL_PATTERN = /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i;

/** Fichier texte pouvant être ouvert comme note (.md, .markdown, .txt). */
export function isMarkdownFile(file: File): boolean {
  return (
    MARKDOWN_EXTENSION_PATTERN.test(file.name) ||
    file.type === 'text/markdown' ||
    file.type === 'text/plain'
  );
}

/** Image pouvant être insérée dans une note. */
export function isImageFile(file: File): boolean {
  return (
    file.type.startsWith('image/') || IMAGE_EXTENSION_PATTERN.test(file.name)
  );
}

/** Adresse web (ou chemin) se terminant par une extension d'image. */
export function isImageUrl(uri: string): boolean {
  return IMAGE_URL_PATTERN.test(uri.trim());
}
