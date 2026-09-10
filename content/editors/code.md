---
title: Code Editor
slug: editors/code
section: editors
order: 3
description: The Code Editor is where you write the Lua scripts that power your game.
  It is a full-featured code editor built on Monaco (the same editor that powers VS
  Code).
legacy_slugs:
- editors/code-editor.html
---

# Code Editor

The Code Editor is where you write the Lua scripts that power your game. It is a full-featured code editor built on CodeMirror.

## Features

- **Lua syntax highlighting** -- keywords, strings, numbers, and comments are color-coded
- **Auto-indentation** -- code is automatically indented as you type
- **Real-time collaboration** -- when working with others, you can see their cursors and edits in real time
- **Error reporting** -- runtime errors from your Lua code appear in the output panel below the game canvas

## Writing your game

Your Lua script should define up to three global functions that the engine calls automatically:

``` lua
function _init()
  -- runs once when the game starts
end

function _update()
  -- runs every frame: handle input, physics, logic
end

function _draw()
  -- runs every frame: render everything
end
```

See [game-loop](/learn/concepts/game-loop) for a detailed explanation of the game lifecycle.

## Several tabs

A game can hold as many tabs as it needs, and the strip along the top is the order they run in.
Every launch runs each tab once, top to bottom, and only then calls `_init`. Drag a tab to change
that order; the number beside its name is its rank.

Tabs share through globals -- a function or a variable declared at the top level of one tab is there
for every tab after it, and for `_init`, `_update` and `_draw` whichever tab they are written in:

``` lua
-- tab 1, "helpers"
function clamp(v, lo, hi)
  if v < lo then return lo end
  if v > hi then return hi end
  return v
end

-- tab 2, "main"
function _update()
  x = clamp(x + dx, 0, 320)
end
```

There is no `require`. A tab is not a module: it runs when its turn comes, and asking for it by name
would say the opposite. If a tab needs something at the moment it runs -- rather than later, from
inside `_init` -- put the tab that provides it earlier in the strip.

Every launch starts clean. The globals go, the palette and the camera come back to what the editors
show, the sound stops, and a tile written with `map.set` is forgotten -- so nothing a run did is
still there in the next one. Nothing a running game changes is written back to your project either:
`map.set` and the palette functions last as long as the run and no longer.

## Tips

- **Start small** -- get a single sprite moving on screen before adding complexity
- **Use** `print()` **liberally** -- the output panel is your debugger. Print positions, states, and values to understand what your code is doing
- **Organize with functions** -- as your script grows, break logic into named functions (see [structure](/learn/reference/structure))
- **Save often** -- changes are saved automatically, but the editor also supports collaborative sessions where multiple people edit simultaneously
