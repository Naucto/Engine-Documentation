// Merges api/*.yaml into dist/manifest.json (the shape the Frontend and the engine parity test read).
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { parse } from 'yaml';

const root = resolve(import.meta.dirname, '..');
const namespaces = [];
const index = {};
for (const file of (await readdir(resolve(root, 'api'))).filter((f) => f.endsWith('.yaml')).sort()) {
  const ns = parse(await readFile(resolve(root, 'api', file), 'utf8'));
  namespaces.push(ns);
  for (const kind of ['functions', 'values'])
    for (const f of ns[kind] ?? []) {
      const full = `${ns.namespace}.${f.name}`;
      index[full] = { namespace: ns.namespace, kind: kind === 'values' ? 'value' : 'function', ...f };
      for (const alias of f.aliases ?? []) index[alias] = { aliasOf: full };
    }
}
await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'dist/manifest.json'), JSON.stringify({ namespaces, index }, null, 2) + '\n');
console.warn(`manifest: ${namespaces.length} namespaces, ${Object.keys(index).length} entries`);
