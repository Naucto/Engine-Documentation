// Merges the api/ manifest into dist/manifest.json: every namespace, and an index of each function
// and value by its full name. A console entry takes its signature, summary and parameters from the
// engine's description where the Frontend has written one; without it, it carries its prose alone.
import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { engineApiPath, fullName, loadApi, readEngineApi, withEngine } from './api.mjs';

const root = resolve(import.meta.dirname, '..');
const api = resolve(root, 'api');
const engine = await readEngineApi();
if (!engine) console.warn(`manifest: no engine API at ${engineApiPath}; console entries carry their prose alone`);
const written = await loadApi(api);
const merged = engine ? withEngine(written, engine) : { namespaces: written, problems: [] };
if (merged.problems.length) throw new Error(merged.problems.join('\n'));
const namespaces = [];
const index = {};
for (const { dir, functions, values, ...own } of merged.namespaces) {
  // A picture is named from its entry's file; the manifest names it from api/, as one file did.
  const strip = ({ file, ...entry }) =>
    entry.picture ? { ...entry, picture: relative(api, resolve(dir, entry.picture)).split('\\').join('/') } : entry;
  const ns = { ...own, functions: functions.map(strip), values: values.map(strip) };
  namespaces.push(ns);
  for (const kind of ['functions', 'values'])
    for (const f of ns[kind]) index[fullName(ns, f)] = { namespace: ns.namespace, kind: kind === 'values' ? 'value' : 'function', ...f };
}
await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'dist/manifest.json'), JSON.stringify({ namespaces, index }, null, 2) + '\n');
console.warn(`manifest: ${namespaces.length} namespaces, ${Object.keys(index).length} entries`);
