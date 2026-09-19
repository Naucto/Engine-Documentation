# Naucto engine documentation

The documentation of the Naucto fantasy console, written in Markdown and rendered inside the app at
[beta.naucto.net/learn](https://beta.naucto.net/learn). The Frontend consumes this repository as a git
submodule (`docs/`) and builds it at compile time.

## Layout

| Path                                | What                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `content/**/*.md`                   | Pages. Front-matter: `title`, `slug`, `section`, `order`, `description`, `legacy_slugs`, and on API pages `namespace`    |
| `content/tutorials/<name>/main.lua` | The complete code of a tutorial, named by the page's `lua:` field: what Copy to new game installs, byte-identical to the last step file |
| `content/tutorials/<name>/steps/<n>.lua` | The whole game at the end of `## Step n`, for every step that shows code; every lua block of the step is a verbatim run of it, and `docs:shots` plays each one for the frame under the step |
| `content/tutorials/<name>/assets.json` | The rest of a tutorial's game — sprites as rows of hex colours, flags, map spans — named by the page's `assets:` field and copied along with the code |
| `content/**/img/`                   | The pictures a page shows, next to the page (see below)                                                                  |
| `api/<ns>.yaml`                     | The Lua API manifest, one file per namespace (`gfx`, `map`, `input`, `sound`, `sys`, `net`)                              |
| `scripts/`                          | `validate` (front-matter, refs, links, pictures, params) and `build` (`dist/manifest.json`)                              |

## Writing a page

Pages reference API entries with `[[gfx.draw_sprite]]` and embed a function card with
`{{api:gfx.draw_sprite}}`. Callouts use GitHub syntax (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`,
`> [!IMPORTANT]`). A fenced block with no language that is drawn as box art (`+--+`, `|`, `->`) is
rendered as a diagram.

The running text is set one shade down; what a reader has to keep goes in `**bold**` and comes back
up to full ink — at most one bold per paragraph. Every page opens with one or two sentences that say
what it is for. A tutorial never repeats its whole game in the prose: the listing is folded at the
foot of the page, and the button at its head copies the game.

### Pictures

A picture is written as `![alt](img/name.png "caption")` and lives in an `img/` folder next to the
page. The build copies it into the app and serves it at `/docs/img/<page dir>/img/name.png`. A
capture of the app is taken in both themes: `name.png` is the dark one and `name.light.png`, if it
exists beside it, is shown on the light theme. A capture of the console's own screen goes under
`img/frames/` and is drawn pixel for pixel. Captures are produced by the Frontend's `npm run
docs:shots`, from seeded content, so they can be taken again when the app changes; do not retouch
them by hand.

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

The engine's `luaApiTable.ts` is the source of truth for names, signatures and one-line summaries;
the Frontend runs a parity test so every engine function is documented here with the same signature
and summary, and nothing here is undocumented in the engine. Every parameter says `required: true`
or `optional: true`.

## Working on it

```sh
npm ci
npm run validate
npm run build
```

Commit messages follow `[DOCS] [TYPE] Message` (TYPE ∈ ADD / REMOVE / UPDATE / REFACTO / CLEAN / FIX).
