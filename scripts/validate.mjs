// Checks every page has front-matter, every [[ref]] resolves, every picture exists, every api
// entry has a signature, every signature's parameters are documented and say whether they are
// required, every function that returns something says what type it returns, no Lua example calls
// a v0 global, no prose uses a word the docs have retired, and every tutorial step's code is whole
// and in the step file that holds the game at that point.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

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

/** The type names a `returnType` may be made of, alone or in a union like `number|nil`. */
const TYPES = new Set(['number', 'string', 'boolean', 'table', 'function', 'nil', 'any']);

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

/**
 * Every picture a page, an api card or a diagram names, so a file nobody names is reported.
 *
 * A capture is taken again by `docs:shots` whenever the app changes; one that no page shows is
 * retaken forever and reviewed by nobody, and the list of pictures stops saying what the docs
 * show. The `.light.png` beside a referenced `.png` is the same picture in the other theme, and
 * `img/src/` holds a picture's source with its credit, so those two are not orphans.
 */
const referenced = new Set();
const refer = (from, href) => referenced.add(resolve(dirname(from), href));

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
      if (f.picture) {
        refer(resolve(root, 'api', file), f.picture);
        if (!(await exists(resolve(root, 'api', f.picture)))) errors.push(`${full}: picture ${f.picture} is not there`);
      }
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
      // The prose says what comes back; the type is what the cards colour it by, so one without
      // the other is a card with a hole in it.
      if (kind === 'functions' && f.returns && !f.returnType) errors.push(`${full}: returns something but says no returnType`);
      if (f.returnType && !f.returns) errors.push(`${full}: has a returnType but returns nothing`);
      for (const t of f.returnType ? String(f.returnType).split('|') : [])
        if (!TYPES.has(t)) errors.push(`${full}: returnType ${t} is not one of ${[...TYPES].join(', ')}`);
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
  pages.push({ file, meta, body: src.slice(m[0].length), offset: m[0].split('\n').length - 1 });
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

/**
 * The code a tutorial page hands out, step by step, against the game it says it builds.
 *
 * A reader follows a page in the app without the copy button, so a step's Lua block has to be
 * pasteable: the whole function, not a body cut out of one. `steps/N.lua` beside the page's
 * `main.lua` is the complete game at the end of Step N, for every step that gives code, and the
 * check is that each block of the step is in that file line for line. A fragment cannot be, since
 * the file only has whole functions; and `main.lua`, which the copy button installs, has to be the
 * last step byte for byte, or the page and the button would give two games.
 *
 * Blank lines and lines that are only a comment are left out of the comparison on both sides, so
 * a page may quote a function without the file's comments, and the file may have section banners
 * between the functions a step gives one after the other.
 */
function codeLines(text) {
  return text
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() && !/^\s*--/.test(l));
}

function stepsIn(body) {
  const steps = [];
  let current = null;
  let fence = null;
  for (const line of body.split('\n')) {
    const head = /^## Step (\d+):/.exec(line);
    if (head && !fence) {
      current = { n: Number(head[1]), blocks: [] };
      steps.push(current);
      continue;
    }
    if (/^## /.test(line) && !fence) current = null;
    if (/^\s*```/.test(line)) {
      if (fence) {
        if (fence.lua && current) current.blocks.push(fence.lines.join('\n'));
        fence = null;
      } else fence = { lua: /^\s*```\s*lua\b/.test(line), lines: [] };
      continue;
    }
    if (fence) fence.lines.push(line);
  }
  return steps.filter((s) => s.blocks.length);
}

async function checkSteps(file, body, meta) {
  if (meta.section !== 'tutorials') return;
  const steps = stepsIn(body);
  if (!steps.length) return;
  if (!meta.lua) {
    errors.push(`${file}: gives code in steps but names no lua file`);
    return;
  }
  const dir = resolve(dirname(file), dirname(meta.lua));
  let last = null;
  for (const step of steps) {
    const stepFile = resolve(dir, 'steps', `${step.n}.lua`);
    if (!(await exists(stepFile))) {
      errors.push(`${file}: Step ${step.n} gives code but ${dirname(meta.lua)}/steps/${step.n}.lua is not there`);
      continue;
    }
    last = stepFile;
    const fileLines = codeLines(await readFile(stepFile, 'utf8'));
    for (const block of step.blocks) {
      const want = codeLines(block);
      if (!want.length) continue;
      const found = fileLines.some((_, i) => want.every((l, j) => fileLines[i + j] === l));
      if (!found)
        errors.push(
          `${file}: Step ${step.n} has a lua block that is not verbatim in steps/${step.n}.lua (starts "${want[0].trim()}")`,
        );
    }
  }
  if (last && (await readFile(last, 'utf8')) !== (await readFile(resolve(dirname(file), meta.lua), 'utf8')))
    errors.push(`${file}: ${meta.lua} is not byte-identical to the last step, ${relative(dirname(file), last)}`);
}

/**
 * The staged scenes the network tutorials are pictured with, against the step each one copies.
 *
 * A Pong or Tag game needs a session to draw anything, so the frame under a step is taken from a
 * scene in the Frontend's `e2e/docs/lua/` that fills `net.state` by hand and calls the step's own
 * draw functions. The scene's first line says which step (`-- scene of: pong/steps/5.lua`), and
 * every `function draw_…` in the scene has to be in that file line for line, under the same
 * normalisation as the step blocks: otherwise the picture is of code the page never gave.
 *
 * The scenes live beside the app, not in this repository, so a checkout of the docs alone skips
 * this; `DOCS_SCENES` points elsewhere when they are not at the default path.
 */
const SCENES = process.env.DOCS_SCENES ?? resolve(root, '..', 'e2e', 'docs', 'lua');

function drawFunctionsIn(scene) {
  const blocks = [];
  let block = null;
  for (const line of scene.split('\n')) {
    if (/^function draw_\w*\(/.test(line)) block = [];
    if (block) block.push(line);
    if (block && /^end\b/.test(line)) {
      blocks.push(block.join('\n'));
      block = null;
    }
  }
  return blocks;
}

async function checkScenes() {
  if (!(await exists(SCENES))) return;
  for (const name of (await readdir(SCENES)).filter((f) => /^tut-.*\.lua$/.test(f))) {
    const scene = await readFile(resolve(SCENES, name), 'utf8');
    const head = /^-- scene of: ([\w-]+)\/steps\/(\d+)\.lua\s*$/m.exec(scene.split('\n')[0] ?? '');
    if (!head) {
      errors.push(`${name}: a tutorial scene starts with "-- scene of: <tutorial>/steps/<n>.lua"`);
      continue;
    }
    const stepFile = resolve(root, 'content', 'tutorials', head[1], 'steps', `${head[2]}.lua`);
    if (!(await exists(stepFile))) {
      errors.push(`${name}: scene of ${head[1]}/steps/${head[2]}.lua, which is not there`);
      continue;
    }
    const fileLines = codeLines(await readFile(stepFile, 'utf8'));
    for (const block of drawFunctionsIn(scene)) {
      const want = codeLines(block);
      const found = fileLines.some((_, i) => want.every((l, j) => fileLines[i + j] === l));
      if (!found)
        errors.push(`${name}: ${want[0].trim()} is not verbatim in ${head[1]}/steps/${head[2]}.lua`);
    }
  }
}

await checkScenes();

for (const { file, body, offset, meta } of pages) {
  await checkSteps(file, body, meta);
  for (const [, href] of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    if (/^(https?:)?\/\//.test(href)) continue;
    refer(file, href);
    if (!(await exists(resolve(dirname(file), href)))) errors.push(`${file}: picture ${href} is not there`);
  }
  for (const [, href] of body.matchAll(/\{\{svg:([^}\s]+)\}\}/g)) {
    refer(file, href);
    if (!(await exists(resolve(dirname(file), href)))) {
      errors.push(`${file}: diagram ${href} is not there`);
      continue;
    }
    const svg = await readFile(resolve(dirname(file), href), 'utf8');
    for (const [, target] of svg.matchAll(/\bhref="([^"#:]+)"/g)) refer(resolve(dirname(file), href), target);
    if (!/viewBox="0 0 \d+ \d+"/.test(svg)) errors.push(`${file}: diagram ${href} has no viewBox`);
    if (/(fill|stroke)="#|style="[^"]*#/.test(svg))
      errors.push(`${file}: diagram ${href} writes a colour; use the d-* classes`);
  }
  for (const { line, name, use } of legacyCallsIn(body))
    errors.push(`${file}:${line + offset}: lua example calls the v0 global ${name}(), use ${use}()`);
  for (const { line, word } of retiredWordsIn(body))
    errors.push(`${file}:${line + offset}: prose says "${word === '\u2014' ? 'an em-dash' : word}", which the docs do not use`);
  for (const [, ref] of body.matchAll(/\[\[([a-z]+\.[a-z_]+)\]\]/g)) if (!known.has(ref)) errors.push(`${file}: unknown api ref [[${ref}]]`);
  for (const [, ref] of body.matchAll(/\{\{api:([a-z]+\.[a-z_]+)\}\}/g)) if (!known.has(ref)) errors.push(`${file}: unknown api card {{api:${ref}}}`);
  for (const [, target] of body.matchAll(/\]\(\/learn\/([^)#]+)/g)) if (!slugs.has(target)) errors.push(`${file}: broken link /learn/${target}`);
}

for (const dir of ['content', 'api'])
  for await (const file of walk(resolve(root, dir))) {
    const inside = relative(root, file).split('\\').join('/');
    if (!/(^|\/)img\//.test(inside) || /\/img\/src\//.test(inside)) continue;
    const theme = /^(.*)\.light(\.[a-z0-9]+)$/i.exec(file);
    if (referenced.has(file) || (theme && referenced.has(theme[1] + theme[2]))) continue;
    errors.push(`${inside}: no page, api card or diagram shows it`);
  }

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.warn(`validate: ${pages.length} pages, ${known.size} api names — ok`);
