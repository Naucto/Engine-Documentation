# Naucto engine documentation

The documentation of the Naucto fantasy console, written in Markdown and rendered inside the app at
[beta.naucto.net/learn](https://beta.naucto.net/learn). The Frontend consumes this repository as a git
submodule (`docs/`) and builds it at compile time.

## Layout

| Path               | What                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| `content/**/*.md`  | Pages. Front-matter: `title`, `slug`, `section`, `order`, `description`, `legacy_slugs` |
| `content/tutorials/<name>/main.lua` | The complete code of a tutorial, inlined where the page says `{{lua:main.lua}}` |
| `api/<ns>.yaml`    | The Lua API manifest, one file per namespace (`gfx`, `map`, `input`, `sound`, `sys`, `net`) |
| `scripts/`         | `validate` (front-matter, `[[refs]]`, links) and `build` (`dist/manifest.json`)         |

Pages reference API entries with `[[gfx.draw_sprite]]` and embed a function card with
`{{api:gfx.draw_sprite}}`. Callouts use GitHub syntax (`> [!NOTE]`, `> [!WARNING]`, `> [!TIP]`).

The engine's `luaApiTable.ts` is the source of truth for names and signatures; the Frontend runs a
parity test so every engine function is documented here and nothing here is undocumented in the engine.

## Working on it

```sh
npm ci
npm run validate
npm run build
```

Commit messages follow `[DOC] [TYPE] Message` (TYPE ∈ ADD / REMOVE / UPDATE / REFACTO / CLEAN / FIX).
