// Reads the API manifest under api/: every directory holding a `_namespace.yaml` is a namespace,
// and every other `.yaml` beside it is one of its entries, named after the entry. A console entry
// holds only prose; its signature, summary, parameter types and return type are the engine's, merged
// in by `withEngine`.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

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

/**
 * Where the Frontend writes the engine's own description of the console API (`npm run docs:api`),
 * unless `DOCS_ENGINE_API` names another file.
 */
export const engineApiPath =
  process.env.DOCS_ENGINE_API ?? resolve(import.meta.dirname, '..', '..', 'node_modules', '.cache', 'docs', 'api-manifest.json');

/** The engine's description of the console API, or null where there is none, as in a checkout of the docs alone. */
export async function readEngineApi(path = engineApiPath) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

/**
 * The namespaces with each console entry completed from the engine: its signature, summary and
 * parameters (type, optional, default) are the engine's, a parameter's description is the page's,
 * looked up by name, and a function's return type is the engine's. The standard Lua libraries have
 * no engine counterpart and pass through as they are.
 *
 * `problems` names every engine member no page documents, every page the engine has no member for,
 * every entry listed as a function where the engine has a value or the reverse, and every parameter
 * a page describes that the engine does not take.
 */
export function withEngine(namespaces, engine) {
  const own = new Map(engine.map((e) => [`${e.ns}.${e.name}`, e]));
  const documented = new Set();
  const problems = [];
  const merged = namespaces.map((ns) => {
    if (ns.standard) return ns;
    const merge = (kind) => (entry) => {
      const full = fullName(ns, entry);
      documented.add(full);
      const member = own.get(full);
      if (!member) {
        problems.push(`${full}: documented, but the engine has no such ${kind}`);
        return entry;
      }
      if (member.kind !== kind) problems.push(`${full}: listed as a ${kind}, the engine has a ${member.kind}`);
      const prose = new Map(Object.entries(entry.params ?? {}));
      for (const name of prose.keys())
        if (!member.params.some((p) => p.name === name)) problems.push(`${full}: params describes ${name}, which the engine does not take`);
      return {
        ...entry,
        signature: member.signature,
        summary: member.summary,
        params: member.params.map((p) => ({ ...p, description: prose.get(p.name) })),
        ...(member.kind === 'function' && member.returns ? { returnType: member.returns } : {}),
      };
    };
    return { ...ns, functions: ns.functions.map(merge('function')), values: ns.values.map(merge('value')) };
  });
  for (const name of own.keys()) if (!documented.has(name)) problems.push(`${name}: the engine has it, no page documents it`);
  return { namespaces: merged, problems };
}
