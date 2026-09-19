# Naucto engine documentation

The documentation of the Naucto fantasy console, written in Markdown and rendered inside the app at
[beta.naucto.net/learn](https://beta.naucto.net/learn). The Frontend consumes this repository as a git
submodule (`docs/`) and builds it at compile time.

## Layout

| Path                                | What                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `content/**/*.md`                   | Pages. Front-matter: `title`, `slug`, `section`, `order`, `description`, `legacy_slugs`, and on API pages `namespace`    |
| `content/tutorials/<name>/main.lua` | The complete code of a tutorial, named by the page's `lua:` field and folded in where the page says `{{lua:main.lua}}` |
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
