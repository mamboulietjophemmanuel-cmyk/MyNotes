/**
 * Coloration syntaxique des blocs de code (highlight.js, version « core » + langages choisis,
 * pour garder l'application légère). Les couleurs sont définies dans index.css (classes .hljs-*).
 */
import hljs from 'highlight.js/lib/core';

import arduino from 'highlight.js/lib/languages/arduino';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import dart from 'highlight.js/lib/languages/dart';
import diff from 'highlight.js/lib/languages/diff';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import dos from 'highlight.js/lib/languages/dos';
import go from 'highlight.js/lib/languages/go';
import graphql from 'highlight.js/lib/languages/graphql';
import haskell from 'highlight.js/lib/languages/haskell';
import ini from 'highlight.js/lib/languages/ini';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import latex from 'highlight.js/lib/languages/latex';
import lua from 'highlight.js/lib/languages/lua';
import makefile from 'highlight.js/lib/languages/makefile';
import markdown from 'highlight.js/lib/languages/markdown';
import matlab from 'highlight.js/lib/languages/matlab';
import perl from 'highlight.js/lib/languages/perl';
import php from 'highlight.js/lib/languages/php';
import powershell from 'highlight.js/lib/languages/powershell';
import python from 'highlight.js/lib/languages/python';
import r from 'highlight.js/lib/languages/r';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import scala from 'highlight.js/lib/languages/scala';
import scss from 'highlight.js/lib/languages/scss';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import verilog from 'highlight.js/lib/languages/verilog';
import vhdl from 'highlight.js/lib/languages/vhdl';
import x86asm from 'highlight.js/lib/languages/x86asm';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

const LANGUAGES = {
  arduino, bash, c, cpp, csharp, css, dart, diff, dockerfile, dos, go, graphql,
  haskell, ini, java, javascript, json, kotlin, latex, lua, makefile, markdown,
  matlab, perl, php, powershell, python, r, ruby, rust, scala, scss, shell, sql,
  swift, typescript, verilog, vhdl, x86asm, xml, yaml,
};

Object.entries(LANGUAGES).forEach(([name, definition]) => {
  hljs.registerLanguage(name, definition);
});

// Noms courants que highlight.js ne connaît pas par défaut
const EXTRA_ALIASES: Record<string, string> = {
  assembly: 'x86asm',
  asm: 'x86asm',
  'objective-c': 'c',
  'c#': 'csharp',
  'f#': 'haskell',
  'node': 'javascript',
  vue: 'xml',
  svelte: 'xml',
  toml: 'ini',
  powershell5: 'powershell',
  batch: 'dos',
  gradle: 'java',
  tex: 'latex',
};

/** Nom de langage normalisé (premier mot du « ```langage »), ou null si inconnu. */
export function resolveLanguage(language: string): string | null {
  const name = language.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  if (!name) return null;
  if (hljs.getLanguage(name)) return name;
  const alias = EXTRA_ALIASES[name];
  return alias && hljs.getLanguage(alias) ? alias : null;
}

/**
 * Renvoie le code coloré sous forme de HTML (le texte est échappé par highlight.js),
 * ou null si le langage est vide ou inconnu : le code s'affiche alors sans couleur.
 */
export function highlightCode(code: string, language: string): string | null {
  const name = resolveLanguage(language);
  if (!name) return null;
  try {
    return hljs.highlight(code, { language: name, ignoreIllegals: true }).value;
  } catch {
    return null;
  }
}
