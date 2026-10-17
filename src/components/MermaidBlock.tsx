import React, { useState, useEffect, useRef, useId } from 'react';
import { loadMermaid } from '../utils/mermaidLoader';
import { MERMAID_MIN_WIDTH } from '../utils/mermaidFence';
import {
  Code2,
  Eye,
  Copy,
  Check,
  Maximize2,
  Download,
  Trash2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Workflow,
} from 'lucide-react';

interface MermaidBlockProps {
  code: string;
  onChange?: (newCode: string) => void;
  onDelete?: () => void;
  isEditable?: boolean;
  /** Largeur choisie (en % de la zone d'affichage) ; null = taille automatique d'origine */
  widthPct?: number | null;
  /** Appelé quand l'utilisateur relâche les poignées de redimensionnement */
  onWidthChange?: (pct: number) => void;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({
  code,
  onChange,
  onDelete,
  isEditable = true,
  widthPct = null,
  onWidthChange,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'split' | 'code'>(
    isEditable ? 'preview' : 'preview'
  );
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  // Redimensionnement à la souris (poignées aux coins du diagramme, comme pour les images)
  const [liveWidth, setLiveWidth] = useState<number | null>(widthPct);
  const [isResizing, setIsResizing] = useState(false);
  const diagramRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isResizing) setLiveWidth(widthPct);
  }, [widthPct, isResizing]);

  const handleResizeStart = (
    e: React.MouseEvent,
    side: 'left' | 'right'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const diagram = diagramRef.current;
    const area = diagram?.parentElement;
    if (!diagram || !area) return;
    const areaStyle = getComputedStyle(area);
    const available =
      area.clientWidth -
      parseFloat(areaStyle.paddingLeft) -
      parseFloat(areaStyle.paddingRight);
    if (available <= 0) return;
    const startX = e.clientX;
    const startPct = (diagram.getBoundingClientRect().width / available) * 100;
    let latest = Math.min(100, Math.max(MERMAID_MIN_WIDTH, Math.round(startPct)));
    setIsResizing(true);
    setLiveWidth(latest);

    const onMove = (ev: MouseEvent) => {
      // Le diagramme est centré : un déplacement de la poignée agrandit les deux côtés
      const dx = side === 'right' ? ev.clientX - startX : startX - ev.clientX;
      latest = Math.min(
        100,
        Math.max(MERMAID_MIN_WIDTH, Math.round(startPct + ((2 * dx) / available) * 100))
      );
      setLiveWidth(latest);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setIsResizing(false);
      onWidthChange?.(latest);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const renderCounter = useRef(0);

  // Detect theme
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains('dark');
      setIsDark(darkNow);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Detect diagram type for header badge
  const diagramType = React.useMemo(() => {
    const firstNonEmpty = code
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('%%'))[0];
    if (!firstNonEmpty) return 'mermaid';
    const firstWord = firstNonEmpty.split(/[\s(;:]/)[0].toLowerCase();
    return firstWord || 'mermaid';
  }, [code]);

  // Render Mermaid code to SVG
  useEffect(() => {
    let isCancelled = false;
    renderCounter.current += 1;
    const currentRender = renderCounter.current;
    const diagramId = `mermaid-${rawId}-${currentRender}`;

    const renderDiagram = async () => {
      const cleanCode = code.trim();
      if (!cleanCode) {
        setSvgContent('');
        setRenderError(null);
        return;
      }

      try {
        const mermaid = await loadMermaid(isDark);

        const { svg } = await mermaid.render(diagramId, cleanCode);
        if (!isCancelled) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'Erreur de syntaxe Mermaid';
          // Clean up any error element injected into DOM by mermaid
          const errorEl = document.getElementById(diagramId);
          if (errorEl) errorEl.remove();
          const dError = document.getElementById(`d${diagramId}`);
          if (dError) dError.remove();

          setRenderError(message);
        }
      }
    };

    const timer = setTimeout(renderDiagram, 120);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [code, isDark, rawId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1600);
  };

  const handleCopySvg = () => {
    if (!svgContent) return;
    navigator.clipboard.writeText(svgContent);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 1600);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagramme-${diagramType}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-[var(--adw-border)] bg-[var(--adw-card-bg)] shadow-xs transition-shadow">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--adw-border-subtle)] bg-[var(--adw-sidebar-bg)]/60 px-3.5 py-2 text-xs">
        {/* Left: Diagram Type Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-[var(--adw-accent-soft)] px-2 py-0.5 font-medium text-[var(--adw-accent)]">
            <Workflow className="h-3.5 w-3.5" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {diagramType}
            </span>
          </div>
          <span className="text-[11px] text-[var(--adw-fg-muted)]">
            Diagramme Mermaid
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* View Mode Switcher (if editable) */}
          {isEditable && (
            <div className="mr-1 flex items-center rounded-lg border border-[var(--adw-border-subtle)] bg-[var(--adw-view-bg)] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                title="Aperçu graphique seul"
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-[var(--adw-accent)] text-white shadow-xs'
                    : 'text-[var(--adw-fg-secondary)] hover:text-[var(--adw-fg)]'
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Rendu</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                title="Édition et aperçu côte-à-côte"
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  viewMode === 'split'
                    ? 'bg-[var(--adw-accent)] text-white shadow-xs'
                    : 'text-[var(--adw-fg-secondary)] hover:text-[var(--adw-fg)]'
                }`}
              >
                <Workflow className="h-3 w-3" />
                <span>Édition</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('code')}
                title="Code source seul"
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  viewMode === 'code'
                    ? 'bg-[var(--adw-accent)] text-white shadow-xs'
                    : 'text-[var(--adw-fg-secondary)] hover:text-[var(--adw-fg)]'
                }`}
              >
                <Code2 className="h-3 w-3" />
                <span>Code</span>
              </button>
            </div>
          )}

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copier le code Mermaid"
            className="adw-btn px-2 py-1 text-[11px] text-[var(--adw-fg-secondary)]"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Code</span>
              </>
            )}
          </button>

          {/* Copy SVG */}
          {svgContent && (
            <button
              type="button"
              onClick={handleCopySvg}
              title="Copier le code SVG"
              className="adw-btn px-2 py-1 text-[11px] text-[var(--adw-fg-secondary)]"
            >
              {copiedSvg ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>SVG copié</span>
                </>
              ) : (
                <span>SVG</span>
              )}
            </button>
          )}

          {/* Download SVG */}
          {svgContent && (
            <button
              type="button"
              onClick={handleDownloadSvg}
              title="Télécharger l'image vectorielle SVG"
              className="adw-btn p-1.5 text-[var(--adw-fg-secondary)] hover:text-[var(--adw-accent)]"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Fullscreen Modal View */}
          {svgContent && (
            <button
              type="button"
              onClick={() => {
                setZoomScale(1);
                setIsFullscreen(true);
              }}
              title="Agrandir en plein écran"
              className="adw-btn p-1.5 text-[var(--adw-fg-secondary)] hover:text-[var(--adw-fg)]"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Delete Block */}
          {onDelete && isEditable && (
            <button
              type="button"
              onClick={onDelete}
              title="Supprimer ce diagramme"
              className="adw-btn p-1.5 text-[var(--adw-fg-muted)] hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Body based on viewMode */}
      <div className="flex flex-col">
        {/* Code Editor Area (visible in 'split' or 'code') */}
        {isEditable && (viewMode === 'code' || viewMode === 'split') && (
          <div className="relative border-b border-[var(--adw-border-subtle)] bg-[var(--adw-code-bg)] p-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-[var(--adw-fg-muted)]">
              <span>Code source Mermaid :</span>
              <span>Modifications appliquées en direct</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => onChange?.(e.target.value)}
              rows={Math.max(4, Math.min(16, code.split('\n').length))}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-[var(--adw-border-subtle)] bg-[var(--adw-view-bg)] p-3 font-mono text-[13px] leading-relaxed text-[var(--adw-fg)] focus:border-[var(--adw-accent)] focus:outline-none"
              placeholder="flowchart TD&#10;    A[Début] --> B[Fin]"
            />
          </div>
        )}

        {/* Error notification banner if syntax is incorrect */}
        {renderError && (
          <div className="flex items-start gap-2.5 border-b border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="font-semibold">Erreur de syntaxe dans le diagramme</p>
              <p className="mt-0.5 font-mono text-[11px] opacity-90">{renderError}</p>
              {viewMode === 'preview' && isEditable && (
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className="mt-2 inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium hover:bg-amber-500/30"
                >
                  <Code2 className="h-3 w-3" />
                  <span>Ouvrir l'éditeur pour corriger</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rendered SVG Preview Area (visible in 'preview' or 'split') */}
        {viewMode !== 'code' && (
          <div
            className="group/diagram relative flex min-h-[140px] items-center justify-center overflow-x-auto bg-[var(--adw-view-bg)] p-6 transition-colors"
            onDoubleClick={() => {
              if (isEditable && viewMode === 'preview') {
                setViewMode('split');
              }
            }}
          >
            {svgContent ? (
              <div
                ref={diagramRef}
                className={`mermaid-svg-container relative max-w-full ${
                  liveWidth !== null
                    ? 'mx-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:!w-full [&_svg]:!max-w-none'
                    : '[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full'
                } ${isResizing ? 'ring-2 ring-[var(--adw-accent)] rounded' : ''}`}
                style={liveWidth !== null ? { width: `${liveWidth}%` } : undefined}
              >
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                {isEditable && onWidthChange && (
                  <>
                    {(['left', 'right'] as const).map((side) => (
                      <div
                        key={side}
                        onMouseDown={(e) => handleResizeStart(e, side)}
                        title="Tirer pour redimensionner le diagramme"
                        className={`absolute -bottom-2 ${
                          side === 'left' ? '-left-2 cursor-nesw-resize' : '-right-2 cursor-nwse-resize'
                        } z-10 h-3.5 w-3.5 rounded-full border-2 border-[var(--adw-accent)] bg-[var(--adw-card-bg)] shadow-sm ${
                          isResizing ? 'opacity-100' : 'opacity-0 group-hover/diagram:opacity-100'
                        } transition-opacity`}
                      />
                    ))}
                    {isResizing && liveWidth !== null && (
                      <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[var(--adw-accent)] px-2 py-0.5 text-[11px] font-semibold text-white shadow">
                        {liveWidth} %
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : !renderError ? (
              <div className="flex items-center gap-2 text-xs text-[var(--adw-fg-muted)]">
                <Workflow className="h-4 w-4 animate-spin text-[var(--adw-accent)]" />
                <span>Rendu du diagramme en cours...</span>
              </div>
            ) : null}

            {/* Floating quick edit pill on hover in preview mode */}
            {isEditable && viewMode === 'preview' && svgContent && (
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className="absolute top-3 right-3 hidden items-center gap-1.5 rounded-full border border-[var(--adw-border)] bg-[var(--adw-card-bg)]/90 px-3 py-1 text-xs font-medium text-[var(--adw-fg-secondary)] shadow-sm backdrop-blur-xs transition-colors hover:text-[var(--adw-accent)] group-hover/diagram:inline-flex"
                title="Double-cliquez sur le diagramme ou cliquez ici pour modifier le code"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Modifier</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm">
          {/* Top toolbar */}
          <div className="flex items-center justify-between border-b border-white/15 bg-neutral-900/90 px-6 py-3 text-white">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-[var(--adw-accent)]" />
              <span className="font-semibold text-sm">
                Aperçu plein écran du diagramme
              </span>
              <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-neutral-300">
                {diagramType}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-white/15 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.max(0.4, s - 0.2))}
                  title="Zoom arrière"
                  className="rounded p-1 text-white hover:bg-white/10"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-2 font-mono text-xs text-neutral-300">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.min(3, s + 0.2))}
                  title="Zoom avant"
                  className="rounded p-1 text-white hover:bg-white/10"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  title="Réinitialiser à 100%"
                  className="ml-1 rounded p-1 text-white hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Télécharger SVG</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-lg p-1.5 text-neutral-300 hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Diagram viewport */}
          <div className="flex flex-1 items-center justify-center overflow-auto p-8">
            <div
              style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center' }}
              className="transition-transform duration-100 [&>svg]:h-auto [&>svg]:max-h-[85vh] [&>svg]:max-w-[85vw]"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
