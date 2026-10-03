// Merges the api/ manifest into dist/manifest.json: every namespace, and an index of each function
// and value by its full name and by its aliases.
import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { fullName, loadApi } from './api.mjs';

const root = resolve(import.meta.dirname, '..');
const api = resolve(root, 'api');
const namespaces = [];
const index = {};
for (const { dir, functions, values, ...own } of await loadApi(api)) {
  // A picture is named from its entry's file; the manifest names it from api/, as one file did.
  const strip = ({ file, ...entry }) =>
    entry.picture ? { ...entry, picture: relative(api, resolve(dir, entry.picture)).split('\\').join('/') } : entry;
  const ns = { ...own, functions: functions.map(strip), values: values.map(strip) };
  namespaces.push(ns);
  for (const kind of ['functions', 'values'])
    for (const f of ns[kind]) {
      const full = fullName(ns, f);
      index[full] = { namespace: ns.namespace, kind: kind === 'values' ? 'value' : 'function', ...f };
      for (const alias of f.aliases ?? []) index[alias] = { aliasOf: full };
    }
}
await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'dist/manifest.json'), JSON.stringify({ namespaces, index }, null, 2) + '\n');
console.warn(`manifest: ${namespaces.length} namespaces, ${Object.keys(index).length} entries`);
