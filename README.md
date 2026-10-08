# Naucto engine documentation

The documentation of the Naucto fantasy console, written in Markdown and rendered inside the app at
[beta.naucto.net/learn](https://beta.naucto.net/learn). The Frontend consumes this repository as a git
submodule (`docs/`) and builds it at compile time.

## Layout

| Path                                | What                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `content/**/*.md`                   | Pages. Front-matter: `title`, `slug`, `section`, `order`, `description`, and on API pages `namespace`                    |
| `content/tutorials/<name>/main.lua` | The complete code of a tutorial, named by the page's `lua:` field: what Copy to new game installs, byte-identical to the last step file |
| `content/tutorials/<name>/steps/<n>.lua` | The whole game at the end of `## Step n`, for every step that shows code; every lua block of the step is a verbatim run of it, and `docs:shots` plays each one for the frame under the step |
| `content/tutorials/<name>/assets.json` | The rest of a tutorial's game (sprites as rows of hex colours, flags, map spans), named by the page's `assets:` field and copied along with the code |
| `content/**/img/`                   | The pictures a page shows, next to the page (see below)                                                                  |
| `api/<ns>/_namespace.yaml`          | A namespace of the console (`gfx`, `map`, `input`, `sound`, `sys`, `net`): its `namespace`, `title`, and the `order:` its functions are listed in, `values:` for the rest |
| `api/<ns>/<name>.yaml`              | One function or value, named after it (`gfx/fill_rect.yaml`): its prose, and a `picture` relative to the file             |
| `api/lua/<lib>/`                    | The standard Lua libraries a game can reach (`base`, `string`, `table`, `math`, `utf8`, `coroutine`, `os`), same layout, marked `standard: true` |
| `scripts/`                          | `validate` (front-matter, refs, links, pictures and diagrams, the console entries against the engine, params and return types, retired words and calls, tutorial steps) and `build` (`dist/manifest.json`), both reading `api/` through `api.mjs` |

## Writing a page

Pages reference API entries with `[[gfx.draw_sprite]]` and embed a function card with
`{{api:gfx.draw_sprite}}`. Callouts use GitHub syntax (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`,
`> [!IMPORTANT]`). A fenced block with no language that is drawn as box art (`+--+`, `|`, `->`) is
rendered as a diagram.

The running text is set one shade down; what a reader has to keep goes in `**bold**` and comes back
up to full ink, at most one bold per paragraph. Every page opens with one or two sentences that say
what it is for and for whom, and a paragraph holds one idea. An identifier in a sentence goes in a
code chip, a function of the API is linked with `[[ns.fn]]`, and its card is embedded at most once
per page. Prose has no em-dash: a full stop or a colon does its work. A tutorial never repeats its
whole game in the prose: the listing is folded at the foot of the page, and the button at its head
copies the game.

### Pictures

A picture is written as `![alt](img/name.png "caption")` and lives in an `img/` folder next to the
page. It sits beside the text it illustrates, never in a gallery of several. The build copies it
into the app and serves it at `/docs/img/<page dir>/img/name.png`. A capture of the app is taken in
both themes: `name.png` is the dark one and `name.light.png`, if it exists beside it, is shown on
the light theme. A capture of the console's own screen goes under `img/frames/` and is drawn pixel
for pixel. Captures are produced by the Frontend's `npm run docs:shots`, from seeded content, so
they can be taken again when the app changes; do not retouch them by hand.

### Diagrams

A diagram is an SVG file next to the page, put on the page with `{{svg:img/name.svg}}`; the build
inlines it, so the stylesheet tones it for the theme it is read in. Draw on the 8 px grid, with a
`viewBox="0 0 W H"` and no `width`/`height`; strokes are 1 px on half-pixel coordinates (`x.5`), in a
`<g class="d-stroke">` (lines, paths, rects, polylines take the quiet ink); boxes with a filled
surface go in `<g class="d-box">`; arrowheads in `<g class="d-head">`; text in `<g class="d-label">`
(`<text>` in the UI face, `class="d-mono"` for an identifier, `class="d-quiet"` for a secondary
label, `class="d-gold"` for the thing the diagram is about). Flat fills take one of `d-fill-gold`,
`d-fill-jade`, `d-fill-sky`, `d-fill-hot`, `d-fill-orange`, `d-fill-inset`. Never write a colour in
the file: the palette is the theme's.

## API manifest

A console entry holds **only its prose**: `description`, `params` as each parameter's description
keyed by its name, `returns` as the prose of what comes back (`null` when nothing does), `examples`,
`notes`, `picture`, `caption`, `seeAlso` and `since`. The engine declares each function once, and
the Frontend's `npm run docs:api` writes that declaration to `node_modules/.cache/docs/api-manifest.json`:
the signature, the one-line summary, each parameter's type, whether it is optional and its default,
and the return type. `docs:build` merges the two, and `validate` refuses a console entry that writes
any of the engine's part, an engine function no page documents, a page for a function the engine
does not have, and a parameter described here that the engine does not take. Checked out alone,
without the engine's file (`DOCS_ENGINE_API` names another one), `validate` checks the prose only.

The standard Lua entries under `api/lua/` have no counterpart in the engine, so they carry the
whole entry: a `signature`, a `summary`, `params` as a list where each says `required: true` or
`optional: true` and its `type`, and a `returnType` beside `returns`, one of `number`, `string`,
`boolean`, `table`, `function`, `thread`, `nil`, `any` or a union such as `number|nil`. They also
carry `standard: true` and a `manual` link to their place in the Lua 5.3 reference manual, and the base
library's `_namespace.yaml` says `globals: true`, since `pairs` is called by its bare name. The
Frontend's test checks that each one exists in a running game, that every other library function a
game can reach is documented or listed there as left out on purpose, and runs every example: a
`-->` comment is the line the example prints, and the test holds it to it.

## Working on it

```sh
npm ci
npm run validate
npm run build
```

Commit messages follow `[DOCS] [TYPE] Message` (TYPE ∈ ADD / REMOVE / UPDATE / REFACTO / CLEAN / FIX).
