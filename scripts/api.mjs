// Reads the API manifest under api/: every directory holding a `_namespace.yaml` is a namespace,
// and every other `.yaml` beside it is one of its entries, named after the entry.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { parse } from 'yaml';

/**
 * The order the reference lists namespaces in: the console's own first, by how soon a new game
 * needs them, then the standard Lua libraries. A namespace missing here comes last, by name.
 */
const ORDER = ['gfx', 'map', 'input', 'sound', 'sys', 'net', 'base', 'string', 'table', 'math', 'utf8', 'coroutine', 'os'];

/**
 * An entry's name as a game writes it: `gfx.clear`, `math.floor`, or the bare `pairs` of a
 * library whose functions are globals.
 */
export const fullName = (ns, entry) => (ns.globals ? entry.name : `${ns.namespace}.${entry.name}`);

async function* namespaceDirs(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  if (items.some((e) => e.isFile() && e.name === '_namespace.yaml')) yield dir;
  for (const e of items) if (e.isDirectory() && e.name !== 'img') yield* namespaceDirs(join(dir, e.name));
}

/**
 * Every namespace, in the shape a single-file manifest had: its own fields, then `functions` and
 * `values` in the order `_namespace.yaml` gives them (`order:` for functions, `values:` for the
 * rest), each entry carrying the `file` it was read from. `dir` is where the entries live, which a
 * `picture` path is relative to.
 *
 * Throws, naming every file at fault, when a listed entry has no file, a file is listed nowhere,
 * or a file's `name` is not its file name: the order is what the reference shows, so an entry it
 * does not list would be built nowhere and noticed by no one.
 */
export async function loadApi(apiDir) {
  const namespaces = [];
  const problems = [];
  for await (const dir of namespaceDirs(apiDir)) {
    const { order = [], values: valueNames = [], ...own } = parse(await readFile(join(dir, '_namespace.yaml'), 'utf8'));
    const where = relative(apiDir, dir);
    const files = (await readdir(dir)).filter((f) => f.endsWith('.yaml') && f !== '_namespace.yaml');
    const read = async (name) => {
      const file = join(dir, `${name}.yaml`);
      if (!files.includes(`${name}.yaml`)) {
        problems.push(`${where}/_namespace.yaml lists ${name}, which has no ${name}.yaml`);
        return null;
      }
      const entry = parse(await readFile(file, 'utf8'));
      if (entry?.name !== name) problems.push(`${where}/${name}.yaml: name is ${entry?.name}, not ${name}`);
      return { ...entry, file };
    };
    const listed = new Set([...order, ...valueNames]);
    for (const f of files)
      if (!listed.has(f.slice(0, -'.yaml'.length))) problems.push(`${where}/${f}: listed in neither order nor values of _namespace.yaml`);
    namespaces.push({
      ...own,
      dir,
      functions: (await Promise.all(order.map(read))).filter(Boolean),
      values: (await Promise.all(valueNames.map(read))).filter(Boolean),
    });
  }
  if (problems.length) throw new Error(problems.join('\n'));
  const rank = (ns) => (ORDER.includes(ns.namespace) ? ORDER.indexOf(ns.namespace) : ORDER.length);
  return namespaces.sort((a, b) => rank(a) - rank(b) || a.namespace.localeCompare(b.namespace));
}
