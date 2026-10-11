<div align="center">

<!-- EMPLACEMENT DU LOGO / BANNIÈRE (Nous l'ajouterons à la prochaine étape) -->

<!-- <img src="docs/assets/banner.png" alt="MyNotes Banner" width="100%" /> -->

<div align="center">
  <table border="0" style="border: none; border-collapse: collapse; background: transparent;">
    <tr style="border: none;">
      <td valign="middle" style="border: none;">
        <img src="https://github.com/user-attachments/assets/5b8fafb8-ddb5-47df-b7a9-8d1bed0b3ab9" alt="MyNotes Logo" width="60" />
      </td>
      <td valign="middle" style="border: none;">
        <h1>MyNotes</h1>
      </td>
    </tr>
  </table>
</div>

### **L'éditeur Markdown hybride (WYSIWYG), scientifique et minimaliste.**
*Inspiré par l'élégance de GNOME Libadwaita et la fluidité de Typora.*

[![Version](https://img.shields.io/badge/version-0.1.1-3584e4?style=for-the-badge)](https://github.com/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-FFC131?style=for-the-badge&logo=tauri&logoColor=black)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache_2.0-2ec27e?style=for-the-badge)](LICENSE)

<br />

[**⬇️ Télécharger pour Windows / Linux / macOS**](#🚀-installation--développement) · [**✨ Découvrir les fonctionnalités**](#-fonctionnalités-principales) · [**⌨️ Raccourcis clavier**](#️-raccourcis-clavier)

<br />

<!-- EMPLACEMENT DU GIF / CAPTURE PRINCIPALE DE L'INTERFACE -->
> 📸 **[Aperçu principal de MyNotes — *Visuel à venir*]**
> *(Capture d'écran en mode Clair / Sombre montrant le rendu mathématique, le code et les tableaux)*

</div>

---

## 💡 Pourquoi MyNotes ?

Les éditeurs Markdown classiques vous obligent souvent à choisir entre **deux extrêmes** : un écran divisé encombrant (code à gauche, aperçu à droite) ou une usine à gaz complexe.

**MyNotes** réunit le meilleur des deux mondes dans une application de bureau ultra-légère propulsée par **Tauri** :
- **Écriture sans distraction (Live Rendering)** : Tapez en Markdown, voyez le résultat mis en forme instantanément. Cliquez sur n'importe quel bloc pour modifier sa syntaxe brute exactement là où se trouve votre curseur.
- **Pensé pour les sciences et la tech** : Éditeur d'équations **LaTeX (KaTeX)** avec aperçu en direct, générateur de tableaux interactif et blocs de code avec copie en un clic.
- **Design Libadwaita natif** : Une interface épurée, sans bordures superflues, avec gestion multi-onglets intelligente et thèmes Clair / Sombre automatiques.

---

## ✨ Fonctionnalités principales

### 1. ✍️ Éditeur Hybride « Live-Preview » (Style Typora)
* **Rendu bloc par bloc instantané** : Les titres (`#` à `######`), listes, citations et séparateurs prennent forme dès que vous validez ou quittez le bloc.
* **Positionnement intelligent du curseur** : Cliquez sur n'importe quel mot d'un paragraphe rendu pour basculer en mode édition avec le curseur placé **exactement** sur la lettre cliquée.
* **Barre d'outils flottante au survol / sélection** : Sélectionnez du texte pour faire apparaître une palette contextuelle rapide (**Gras**, *Italique*, ~~Barré~~, `Code`, `Formule $`, Lien, Surlignage `==texte==`, Indice `~`, Exposant `^`).
* **Listes de tâches interactives** : Cochez ou décochez vos `todo-lists` (`- [ ]` / `- [x]`) directement dans l'aperçu sans ouvrir le code source.

<!-- EMPLACEMENT VISUEL 1 : GIF de l'édition hybride & barre flottante -->

---

### 2. 🧮 Équations Mathématiques & Scientifiques (LaTeX / KaTeX)
* **Blocs d'équations (`$$ ... $$`) et formules en ligne (`$ ... $`)** : Rendu typographique ultra-rapide propulsé par **KaTeX**.
* **Studio de formules intégré** : Un assistant visuel avec modèles prêts à l'emploi (fractions, intégrales, matrices, sommes, limites, symboles grecs) et prévisualisation en temps réel.
* **Édition au clic** : Cliquez sur une équation existante pour la modifier à la volée avec aperçu instantané.

<!-- EMPLACEMENT VISUEL 2 : Capture de l'éditeur de formules LaTeX -->

---

### 3. 📊 Tableaux Markdown Interactifs
* **Créateur de tableaux visuel** : Choisissez le nombre de lignes, de colonnes et l'alignement sans taper un seul caractère `|`.
* **Édition façon tableur** : Modifiez chaque cellule directement dans le tableau rendu, ajoutez ou supprimez des lignes/colonnes à la volée, et changez l'alignement (gauche, centre, droite) en un clic.

<!-- EMPLACEMENT VISUEL 3 : Capture ou GIF de l'édition de tableaux -->

---

### 4. 🖼️ Gestion Avancée des Images & Médias
* **Importation universelle** :
  * **Glisser-déposer (Drag & Drop)** d'images (`.png`, `.jpg`, `.webp`, `.gif`, `.svg`) directement dans la fenêtre.
  * **Coller depuis le presse-papiers (`Ctrl+V`)** pour insérer des captures d'écran instantanément.
* **Contrôle de mise en page avancé** :
  * Redimensionnement rapide (`25%`, `50%`, `75%`, `100%`) ou poignée de redimensionnement libre à la souris.
  * **Habillage du texte (Text Wrapping)** : Mode *Saut de ligne* (bloc centré) ou *Habillage* (image flottante à gauche ou à droite entourée par le texte).
  * **Visionneuse Lightbox** : Cliquez pour agrandir n'importe quelle image en plein écran.
* **Export autonome** : Lors de la sauvegarde en `.md`, vos images locales sont automatiquement intégrées pour que votre fichier reste 100 % portable.

---

### 5. 💻 Blocs de Code & Productivité Développeur
* **Blocs de code stylisés (` ```langage `)** : Affichage automatique du badge de langage (`python`, `typescript`, `rust`, `sql`, `json`, etc.).
* **Copie rapide en un clic** : Bouton **Copier** intégré dans l'en-tête de chaque bloc de code avec confirmation visuelle.

---

### 6. 🗂️ Gestion Multi-Onglets & Sessions Intelligentes
* **Barre d'onglets fluide** : Ouvrez plusieurs documents simultanément, renommez vos notes d'un simple clic sur le titre dans la barre supérieure.
* **Détection intelligente des brouillons** :
  * Les nouvelles notes vierges (`Sans titre 1.md`) non modifiées se ferment sans fenêtre d'alerte intrusive et libèrent automatiquement leur numéro.
  * Protection anti-perte de données avec dialogue de confirmation style Libadwaita lorsqu'une note contient de vraies modifications non enregistrées.
* **Persistance de session intelligente** :
  * Fermez la fenêtre (`✕`) pour retrouver tous vos onglets ouverts au prochain lancement.
  * Fermez le dernier onglet pour repartir sur un espace vierge à la prochaine ouverture.
* **Menu d'ouverture rapide (`Ouvrir ▾`)** : Recherche instantanée dans le titre et le contenu de vos notes récentes ou ouverture de fichiers `.md` / `.txt` depuis votre disque.

---

### 7. 🎨 Interface Libadwaita & Confort de Lecture
* **3 Modes de thème** : *Système (Auto)*, *Clair* ou *Sombre*, synchronisés en temps réel avec votre système d'exploitation.
* **Contrôle du zoom** : Ajustez la taille d'affichage de `80%` à `150%` depuis le menu principal.
* **Statistiques en temps réel** : Compteur de lignes, de mots et de caractères affiché en permanence dans la barre d'état inférieure.

---

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
| :--- | :--- |
| `Ctrl + N` / `Ctrl + T` | Créer une nouvelle note dans un nouvel onglet |
| `Ctrl + O` | Ouvrir un fichier Markdown (`.md`, `.markdown`, `.txt`) depuis l'ordinateur |
| `Ctrl + S` | Enregistrer / Exporter la note active au format `.md` |
| `Ctrl + W` | Fermer l'onglet actif |
| `Ctrl + V` | Coller du texte ou insérer une image depuis le presse-papiers |
| `Ctrl + B` | Mettre la sélection en **Gras** |
| `Ctrl + I` | Mettre la sélection en *Italique* |
| `Ctrl + K` | Insérer un lien hypertexte sur la sélection |
| `Entrée` / `Shift + Entrée` | Naviguer entre les blocs ou valider l'édition |
| `Retour arrière (Backspace)` | Fusionner le paragraphe actuel avec le paragraphe précédent (en début de bloc) |
| `Échap (Esc)` | Quitter l'édition du bloc actif et afficher le rendu final |

---

## 🛠️ Stack Technique

* **Framework Frontend** : [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Runtime Desktop Natif** : [Tauri 2.0](https://tauri.app/) (Rust) — *empreinte mémoire minimale et démarrage instantané*
* **Moteur de Style** : [Tailwind CSS v4](https://tailwindcss.com/) + Variables CSS personnalisées *GNOME Adwaita*
* **Moteur Mathématique** : [KaTeX](https://katex.org/)
* **Icônes** : [Lucide Icons](https://lucide.dev/)
* **Bundler** : [Vite](https://vitejs.dev/)

---

## 🚀 Installation & Développement

### Prérequis
* **Node.js** (v18+) ou **Bun**
* **Rust & Cargo** *(uniquement si vous souhaitez compiler l'exécutable de bureau natif avec Tauri)*

### 1. Cloner le dépôt et installer les dépendances
```bash
git clone https://github.com/mamboulietjophemmanuel-cmyk/MyNotes.git
cd MyNotes
npm install
```

### 2. Lancer en mode développement (Web / Aperçu rapide)
```bash
npm run dev
```

### 3. Lancer ou compiler l'application de bureau native (Tauri)
```bash
# Mode développement Desktop
npx tauri dev

# Générer l'installateur (.msi / .exe sur Windows, .deb / .AppImage sur Linux, .dmg sur macOS)
npx tauri build
```

---

## 🗺️ Feuille de route (Prochaines mises à jour)

- [ ] **Prise en charge des diagrammes Mermaid (` ```mermaid `)** : Organigrammes, diagrammes de séquence et de classes générés à la volée.
- [ ] **Export PDF & HTML stylisé** en un clic.
- [ ] **Mode Focus / Machine à écrire** pour centrer la ligne active à l'écran.
- [ ] **Explorateur de dossiers latéral** pour gérer des projets complets de notes.

---

<div align="center">

Conçu avec ❤️ pour une prise de notes rapide, propre et élégante.

</div>
