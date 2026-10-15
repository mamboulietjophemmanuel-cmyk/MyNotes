/**
 * Chargement de Mermaid à la demande : la bibliothèque (lourde) n'est téléchargée et analysée
 * qu'au premier diagramme affiché, ce qui accélère le démarrage de l'application.
 * La configuration (thème clair / sombre) est partagée par l'éditeur et l'assistant de diagrammes.
 */
type MermaidApi = (typeof import('mermaid'))['default'];

let mermaidPromise: Promise<MermaidApi> | null = null;

export async function loadMermaid(isDark: boolean): Promise<MermaidApi> {
  mermaidPromise ??= import('mermaid').then((module) => module.default);
  const mermaid = await mermaidPromise;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: isDark ? 'dark' : 'neutral',
    fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
    themeVariables: isDark
      ? {
          primaryColor: '#3584E4',
          primaryTextColor: '#F6F5F4',
          primaryBorderColor: '#62A0EA',
          lineColor: '#9A9996',
          secondaryColor: '#28282C',
          tertiaryColor: '#222225',
          background: '#1E1E1E',
          mainBkg: '#28282C',
          nodeBorder: '#62A0EA',
        }
      : {
          primaryColor: '#E1EDFB',
          primaryTextColor: '#1E1E1E',
          primaryBorderColor: '#3584E4',
          lineColor: '#505050',
          secondaryColor: '#F4F4F6',
          tertiaryColor: '#FFFFFF',
          background: '#FFFFFF',
          mainBkg: '#F4F4F6',
          nodeBorder: '#3584E4',
        },
  });
  return mermaid;
}
