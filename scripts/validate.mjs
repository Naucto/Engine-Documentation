// Checks every page has front-matter, every [[ref]] resolves, every api entry has a signature.
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

const known = new Set();
for (const file of (await readdir(resolve(root, 'api'))).filter((f) => f.endsWith('.yaml'))) {
  const ns = parse(await readFile(resolve(root, 'api', file), 'utf8'));
  if (!ns?.namespace) errors.push(`${file}: missing namespace`);
  for (const kind of ['functions', 'values'])
    for (const f of ns?.[kind] ?? []) {
      const full = `${ns.namespace}.${f.name}`;
      known.add(full);
      for (const a of f.aliases ?? []) known.add(a);
      if (!f.signature) errors.push(`${full}: missing signature`);
      if (!f.summary) errors.push(`${full}: missing summary`);
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
for (const { file, body } of pages) {
  for (const [, ref] of body.matchAll(/\[\[([a-z]+\.[a-z_]+)\]\]/g)) if (!known.has(ref)) errors.push(`${file}: unknown api ref [[${ref}]]`);
  for (const [, ref] of body.matchAll(/\{\{api:([a-z]+\.[a-z_]+)\}\}/g)) if (!known.has(ref)) errors.push(`${file}: unknown api card {{api:${ref}}}`);
  for (const [, target] of body.matchAll(/\]\(\/learn\/([^)#]+)/g)) if (!slugs.has(target)) errors.push(`${file}: broken link /learn/${target}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.warn(`validate: ${pages.length} pages, ${known.size} api names — ok`);
