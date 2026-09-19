// Checks every page has front-matter, every [[ref]] resolves, every picture exists, every api
// entry has a signature, every signature's parameters are documented and say whether they are
// required, no Lua example calls a v0 global, and no prose uses a word the docs have retired.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const errors = [];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

/**
 * `print` is in an aliases list, and it is not one of these.
 *
 * The other aliases are v0 globals that exist only under the compat prelude, which a project
 * created today does not get -- so an example calling one is an example that errors. SysAPI
 * installs `print` unconditionally, so it is a second real name rather than a deprecated one.
 */
const REAL_GLOBALS = new Set(['print']);

/** Parameters written as a plain identifier list; a table, a union or `...` is skipped, not judged. */
function declaredParams(signature) {
  const m = /\(([^)]*)\)/.exec(signature ?? '');
  if (!m) return null;
  const inner = m[1].trim();
  if (!inner) return [];
  if (/[{}|.]/.test(inner)) return null;
  return inner.replace(/[[\]]/g, '').split(',').map((s) => s.trim()).filter(Boolean);
}

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

const known = new Set();
const legacyGlobals = new Map();
for (const file of (await readdir(resolve(root, 'api'))).filter((f) => f.endsWith('.yaml'))) {
  const ns = parse(await readFile(resolve(root, 'api', file), 'utf8'));
  if (!ns?.namespace) errors.push(`${file}: missing namespace`);
  for (const kind of ['functions', 'values'])
    for (const f of ns?.[kind] ?? []) {
      const full = `${ns.namespace}.${f.name}`;
      known.add(full);
      for (const a of f.aliases ?? []) {
        known.add(a);
        if (!REAL_GLOBALS.has(a)) legacyGlobals.set(a, full);
      }
      if (!f.signature) errors.push(`${full}: missing signature`);
      if (f.picture && !(await exists(resolve(root, 'api', f.picture))))
        errors.push(`${full}: picture ${f.picture} is not there`);
      if (!f.summary) errors.push(`${full}: missing summary`);
      const declared = declaredParams(f.signature);
      const documented = (f.params ?? []).map((p) => p.name);
      // Either word, but one of them: a parameter that says neither is rendered as required by
      // omission, which is a guess dressed as a fact.
      for (const p of f.params ?? [])
        if (p.required === undefined && p.optional === undefined)
          errors.push(`${full}: param ${p.name} says neither required nor optional`);
      for (const name of declared ?? [])
        if (!documented.includes(name)) errors.push(`${full}: signature takes ${name}, params does not document it`);
      for (const name of declared ? documented : [])
        if (!declared.includes(name)) errors.push(`${full}: params documents ${name}, which the signature does not take`);
    }
}

const slugs = new Set();
const pages = [];
for await (const file of walk(resolve(root, 'content'))) {
  if (!file.endsWith('.md')) continue;
  const src = await readFile(file, 'utf8');
  const m = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!m) {
    errors.push(`${file}: missing front-matter`);
    continue;
  }
  const meta = parse(m[1]);
  for (const key of ['title', 'slug', 'section', 'order']) if (meta[key] === undefined) errors.push(`${file}: front-matter lacks ${key}`);
  slugs.add(meta.slug);
  for (const key of ['lua', 'assets'])
    if (meta[key] && !(await exists(resolve(dirname(file), meta[key]))))
      errors.push(`${file}: ${key} file ${meta[key]} is not there`);
  if (meta.assets) {
    try {
      JSON.parse(await readFile(resolve(dirname(file), meta.assets), 'utf8'));
    } catch (e) {
      errors.push(`${file}: assets file ${meta.assets} does not parse: ${e.message}`);
    }
  }
  pages.push({ file, body: src.slice(m[0].length), offset: m[0].split('\n').length - 1 });
}
/**
 * The one thing a reader copies verbatim.
 *
 * The prose kept its v0 calls through the move to Markdown while the tutorials' own main.lua files
 * were migrated, so following a page step by step produced a game that errored while its "complete
 * code" ran. Nothing else here reads inside a fence, which is why nobody saw it.
 */
function legacyCallsIn(body) {
  const found = [];
  let inLua = false;
  body.split('\n').forEach((line, i) => {
    if (/^\s*```/.test(line)) {
      inLua = /^\s*```\s*lua\b/.test(line);
      return;
    }
    if (!inLua) return;
    for (const [, name] of line.replace(/--.*$/, '').matchAll(/(?<![\w.:])([a-z_][a-z0-9_]*)\s*\(/g))
      if (legacyGlobals.has(name)) found.push({ line: i + 1, name, use: legacyGlobals.get(name) });
  });
  return found;
}

/**
 * Words a page must not say, as prose. Each names an implementation the reader never sees, a panel
 * by a name the app does not use, or an em-dash, which the house writes as a full stop or a colon.
 * The names are matched as written: `CODE editor` is the tab's own label and passes.
 * Code is exempt: a fenced block quotes what the app prints, and an inline chip quotes a label.
 */
const RETIRED = ['Tone.js', 'Monaco', 'PICO-8 set', 'Sprite Editor', 'Code Editor', 'Map Editor', 'Sound Editor', 'output panel', '\u2014'];
const RETIRED_RE = new RegExp(RETIRED.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

/**
 * Names the engine no longer answers to, which a reader would copy from prose and code alike.
 *
 * The input readers and `input.declare` went with schema v2, the row effects with the virtual beam;
 * the migration rewrites a game, and nothing rewrites a page.
 */
const RETIRED_CALLS = ['input.btn(', 'input.btnp(', 'input.btnr(', 'input.declare', 'gfx.scanline', 'set_palette_row', 'persist_effects'];
const RETIRED_CALLS_RE = new RegExp(RETIRED_CALLS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

/** The retired words a body uses, outside fenced blocks and inline code, by line of the body. */
function retiredWordsIn(body) {
  const found = [];
  let fenced = false;
  body.split('\n').forEach((line, i) => {
    for (const [word] of line.matchAll(RETIRED_CALLS_RE)) found.push({ line: i + 1, word });
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (fenced) return;
    for (const [word] of line.replace(/`[^`]*`/g, '').matchAll(RETIRED_RE)) found.push({ line: i + 1, word });
  });
  return found;
}

for (const { file, body, offset } of pages) {
  for (const [, href] of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g))
    if (!/^(https?:)?\/\//.test(href) && !(await exists(resolve(dirname(file), href))))
      errors.push(`${file}: picture ${href} is not there`);
  for (const { line, name, use } of legacyCallsIn(body))
    errors.push(`${file}:${line + offset}: lua example calls the v0 global ${name}(), use ${use}()`);
  for (const { line, word } of retiredWordsIn(body))
    errors.push(`${file}:${line + offset}: prose says "${word === '\u2014' ? 'an em-dash' : word}", which the docs do not use`);
  for (const [, ref] of body.matchAll(/\[\[([a-z]+\.[a-z_]+)\]\]/g)) if (!known.has(ref)) errors.push(`${file}: unknown api ref [[${ref}]]`);
  for (const [, ref] of body.matchAll(/\{\{api:([a-z]+\.[a-z_]+)\}\}/g)) if (!known.has(ref)) errors.push(`${file}: unknown api card {{api:${ref}}}`);
  for (const [, target] of body.matchAll(/\]\(\/learn\/([^)#]+)/g)) if (!slugs.has(target)) errors.push(`${file}: broken link /learn/${target}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.warn(`validate: ${pages.length} pages, ${known.size} api names — ok`);
