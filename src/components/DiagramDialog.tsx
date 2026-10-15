import React, { useState, useEffect, useRef, useId } from 'react';
import { loadMermaid } from '../utils/mermaidLoader';
import {
  Workflow,
  X,
  Plus,
  AlertTriangle,
  Layers,
  GitBranch,
  Calendar,
  PieChart,
  Network,
  Share2,
  Cpu,
} from 'lucide-react';

interface DiagramPreset {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  code: string;
}

const DIAGRAM_PRESETS: DiagramPreset[] = [
  {
    id: 'flowchart',
    name: 'Organigramme (Flowchart)',
    category: 'Flux & Processus',
    icon: Workflow,
    description: 'Arbre de décision, logique algorithmique et flux conditionnels',
    code: `flowchart TD
    A[🚀 Démarrage de MyNotes] --> B{Fichier existant ?}
    B -- Oui --> C[Charger depuis le stockage local]
    B -- Non --> D[Créer un nouveau brouillon Sans titre]
    C --> E[Rendu Typora instantané]
    D --> E
    E --> F[Édition Markdown & Diagrammes]
    F --> G[Enregistrement atomique Ctrl+S]`,
  },
  {
    id: 'sequence',
    name: 'Diagramme de Séquence',
    category: 'Flux & Processus',
    icon: Share2,
    description: 'Échanges et messages chronologiques entre plusieurs acteurs et services',
    code: `sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant Editor as TyporaEditor
    participant Parser as MarkdownParser
    participant Mermaid as Mermaid.js
    participant Storage as Stockage Local

    U->>Editor: Saisit un bloc de diagramme
    Editor->>Parser: Détecte le type 'code mermaid'
    Editor->>Mermaid: Requête de rendu vectoriel
    Mermaid-->>Editor: Retourne l'élément SVG
    Editor-->>U: Affiche le diagramme interactif
    Editor->>Storage: Sauvegarde le document (.md)`,
  },
  {
    id: 'mindmap',
    name: 'Carte Mentale (Mindmap)',
    category: 'Créativité & Idées',
    icon: Network,
    description: 'Brainstorming visuel, arborescence d’idées et hiérarchies',
    code: `mindmap
  root((MyNotes))
    Édition Hybride
      Rendu instantané Typora
      Formules mathématiques KaTeX
      Tableaux Markdown
      Gestion des images
    Diagrammes & Graphiques
      Flowcharts & Décisions
      Diagrammes de séquence
      Cartes mentales
      Diagrammes de Gantt
    Gestionnaire Fichiers
      Multi-onglets
      Explorateur de projets
      Sauvegarde automatique
      Export Markdown & Impression`,
  },
  {
    id: 'architecture',
    name: 'Architecture & Classes',
    category: 'Technique & Dev',
    icon: Cpu,
    description: 'Classes orientées objet, modules logiciels et relations',
    code: `classDiagram
    class MarkdownDocument {
        +String id
        +String filename
        +String content
        +Boolean isDirty
        +computeStats()
        +saveToDisk()
    }
    class TyporaEditor {
        +parseBlocks()
        +renderBlocks()
        +insertSnippet()
    }
    class MermaidBlock {
        +renderSvg()
        +exportSvg()
        +toggleViewMode()
    }
    TyporaEditor --> MarkdownDocument : gère
    TyporaEditor --> MermaidBlock : affiche`,
  },
  {
    id: 'gantt',
    name: 'Planning de Gantt',
    category: 'Gestion de Projet',
    icon: Calendar,
    description: 'Suivi de feuille de route (roadmap), jalons et calendrier de projet',
    code: `gantt
    title Feuille de route MyNotes
    dateFormat YYYY-MM-DD
    section Core Editor
    Moteur Typora & Blocs        :done,    des1, 2026-10-01, 2026-10-05
    Mathématiques KaTeX & Tables :done,    des2, 2026-10-06, 2026-10-09
    section Diagrammes
    Intégration Mermaid.js       :active,  des3, 2026-10-10, 2026-10-14
    Exportation vectorielle SVG  :         des4, 2026-10-14, 2026-10-18
    section Finitions
    Tests de performance & Release:        des5, 2026-10-19, 2026-10-25`,
  },
  {
    id: 'state',
    name: 'Machine à États',
    category: 'Flux & Processus',
    icon: Layers,
    description: 'Transitions d’états, cycles de vie et statuts d’un système',
    code: `stateDiagram-v2
    [*] --> Inactif
    Inactif --> EnCours : Nouveau document
    EnCours --> Modifié : Frappe au clavier
    Modifié --> Sauvegardé : Raccourci Ctrl+S
    Sauvegardé --> Modifié : Nouvelle modification
    Sauvegardé --> Fermé : Fermer l'onglet
    Fermé --> [*]`,
  },
  {
    id: 'pie',
    name: 'Graphique Circulaire (Pie)',
    category: 'Données & Chiffres',
    icon: PieChart,
    description: 'Répartition statistique et pourcentages visuels',
    code: `pie title Répartition des notes par domaine
    "Recherche & Sciences" : 40
    "Architecture Système" : 35
    "Guides & Raccourcis" : 15
    "Idées & Brouillons" : 10`,
  },
  {
    id: 'git',
    name: 'Arborescence Git',
    category: 'Technique & Dev',
    icon: GitBranch,
    description: 'Branches, fusions (merge) et historique de versionnement',
    code: `gitGraph
    commit id: "v1.0"
    commit id: "Initial notes"
    branch feature/mermaid
    checkout feature/mermaid
    commit id: "Support Mermaid"
    commit id: "Templates & Dialog"
    checkout main
    merge feature/mermaid id: "Release 1.2"
    commit id: "v1.2"`,
  },
];

interface DiagramDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
}

export const DiagramDialog: React.FC<DiagramDialogProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('flowchart');
  const [code, setCode] = useState<string>(DIAGRAM_PRESETS[0].code);
  const [svgPreview, setSvgPreview] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');

  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const renderCounter = useRef(0);

  // Detect theme
  const isDark =
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false;

  // When selected preset changes, populate code
  const handleSelectPreset = (preset: DiagramPreset) => {
    setSelectedPresetId(preset.id);
    setCode(preset.code);
  };

  // Render preview on code change
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    renderCounter.current += 1;
    const currentRender = renderCounter.current;
    const diagramId = `diagmodal-${rawId}-${currentRender}`;

    const render = async () => {
      const clean = code.trim();
      if (!clean) {
        setSvgPreview('');
        setRenderError(null);
        return;
      }

      try {
        const mermaid = await loadMermaid(isDark);

        const { svg } = await mermaid.render(diagramId, clean);
        if (!isCancelled) {
          setSvgPreview(svg);
          setRenderError(null);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'Erreur de syntaxe Mermaid';
          const errorEl = document.getElementById(diagramId);
          if (errorEl) errorEl.remove();
          const dError = document.getElementById(`d${diagramId}`);
          if (dError) dError.remove();

          setRenderError(message);
        }
      }
    };

    const timer = setTimeout(render, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [code, isOpen, isDark, rawId]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!code.trim()) return;
    const snippet = `\`\`\`mermaid\n${code.trim()}\n\`\`\`\n`;
    onInsert(snippet);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagram-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--adw-border)] bg-[var(--adw-view-bg)] text-[var(--adw-fg)] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--adw-border-subtle)] bg-[var(--adw-sidebar-bg)]/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--adw-accent-soft)] text-[var(--adw-accent)]">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <h2 id="diagram-dialog-title" className="font-semibold text-base">
                Insérer un diagramme Mermaid
              </h2>
              <p className="text-xs text-[var(--adw-fg-muted)]">
                Choisissez un modèle prédéfini ou rédigez votre schéma personnalisé
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="adw-btn p-1.5 text-[var(--adw-fg-muted)] hover:text-[var(--adw-fg)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body : Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-0 flex-1 overflow-hidden">
          {/* Left Column: Preset library */}
          <div className="md:col-span-4 flex flex-col border-r border-[var(--adw-border-subtle)] bg-[var(--adw-sidebar-bg)]/40 p-3 overflow-y-auto">
            <span className="mb-2 px-2 font-medium text-[11px] uppercase tracking-wider text-[var(--adw-fg-muted)]">
              Modèles de schémas
            </span>
            <div className="space-y-1">
              {DIAGRAM_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border border-[var(--adw-accent)]/30 bg-[var(--adw-accent-soft)] text-[var(--adw-fg)]'
                        : 'border border-transparent hover:bg-[var(--adw-hover-bg)] text-[var(--adw-fg-secondary)]'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-[var(--adw-accent)] text-white'
                          : 'bg-[var(--adw-view-bg)] text-[var(--adw-fg-muted)] shadow-xs'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-semibold text-xs">
                          {preset.name}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--adw-fg-muted)]">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Code Editor & Live Preview */}
          <div className="md:col-span-8 flex flex-col min-h-0 bg-[var(--adw-view-bg)]">
            {/* View tabs inside modal */}
            <div className="flex items-center justify-between border-b border-[var(--adw-border-subtle)] px-4 py-2 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewTab('preview')}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                    previewTab === 'preview'
                      ? 'bg-[var(--adw-accent)] text-white'
                      : 'text-[var(--adw-fg-secondary)] hover:bg-[var(--adw-hover-bg)]'
                  }`}
                >
                  Aperçu en direct
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('code')}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                    previewTab === 'code'
                      ? 'bg-[var(--adw-accent)] text-white'
                      : 'text-[var(--adw-fg-secondary)] hover:bg-[var(--adw-hover-bg)]'
                  }`}
                >
                  Code source Mermaid
                </button>
              </div>
              <span className="text-[11px] text-[var(--adw-fg-muted)]">
                Syntaxe Mermaid officielle
              </span>
            </div>

            {/* Content view */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {previewTab === 'preview' ? (
                <div className="flex flex-1 flex-col overflow-hidden p-4">
                  {renderError ? (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <div>
                        <span className="font-semibold">Erreur de syntaxe :</span>
                        <p className="mt-0.5 font-mono text-[11px]">{renderError}</p>
                      </div>
                    </div>
                  ) : svgPreview ? (
                    <div className="flex flex-1 items-center justify-center overflow-auto rounded-xl border border-[var(--adw-border-subtle)] bg-[var(--adw-card-bg)] p-4 shadow-xs">
                      <div
                        className="max-h-full max-w-full [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-h-[380px] [&>svg]:max-w-full"
                        dangerouslySetInnerHTML={{ __html: svgPreview }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-xs text-[var(--adw-fg-muted)]">
                      <span>Rendu du schéma...</span>
                    </div>
                  )}

                  {/* Quick Code Snippet Preview below */}
                  <div className="mt-3">
                    <label className="mb-1 block text-[11px] font-medium text-[var(--adw-fg-muted)]">
                      Modifier rapidement le code du schéma :
                    </label>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      rows={4}
                      spellCheck={false}
                      className="w-full resize-none rounded-lg border border-[var(--adw-border-subtle)] bg-[var(--adw-code-bg)] p-2.5 font-mono text-xs leading-relaxed text-[var(--adw-fg)] focus:border-[var(--adw-accent)] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col p-4">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 w-full resize-none rounded-xl border border-[var(--adw-border-subtle)] bg-[var(--adw-code-bg)] p-4 font-mono text-[13px] leading-relaxed text-[var(--adw-fg)] focus:border-[var(--adw-accent)] focus:outline-none"
                    placeholder="flowchart TD..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-[var(--adw-border-subtle)] bg-[var(--adw-sidebar-bg)]/80 px-6 py-3.5">
          <div className="text-xs text-[var(--adw-fg-muted)]">
            Insère un bloc <code className="font-mono text-[var(--adw-accent)]">```mermaid</code> rendu automatiquement.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="adw-btn px-4 py-1.5 text-xs font-medium text-[var(--adw-fg-secondary)]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!code.trim() || !!renderError}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--adw-accent)] px-4 py-1.5 font-medium text-xs text-white shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Insérer dans la note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
