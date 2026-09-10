// Checks every page has front-matter, every [[ref]] resolves, every api entry has a signature,
// every signature's parameters are documented, and no Lua example calls a v0 global.
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

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
      if (!f.summary) errors.push(`${full}: missing summary`);
      const declared = declaredParams(f.signature);
      const documented = (f.params ?? []).map((p) => p.name);
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
  pages.push({ file, body: src.slice(m[0].length) });
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

for (const { file, body } of pages) {
  for (const { line, name, use } of legacyCallsIn(body))
    errors.push(`${file}:${line}: lua example calls the v0 global ${name}(), use ${use}()`);
  for (const [, ref] of body.matchAll(/\[\[([a-z]+\.[a-z_]+)\]\]/g)) if (!known.has(ref)) errors.push(`${file}: unknown api ref [[${ref}]]`);
  for (const [, ref] of body.matchAll(/\{\{api:([a-z]+\.[a-z_]+)\}\}/g)) if (!known.has(ref)) errors.push(`${file}: unknown api card {{api:${ref}}}`);
  for (const [, target] of body.matchAll(/\]\(\/learn\/([^)#]+)/g)) if (!slugs.has(target)) errors.push(`${file}: broken link /learn/${target}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.warn(`validate: ${pages.length} pages, ${known.size} api names — ok`);
