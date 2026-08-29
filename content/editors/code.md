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

The Code Editor is where you write the Lua scripts that power your game. It is a full-featured code editor built on Monaco (the same editor that powers VS Code).

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

## Tips

- **Start small** -- get a single sprite moving on screen before adding complexity
- **Use** `print()` **liberally** -- the output panel is your debugger. Print positions, states, and values to understand what your code is doing
- **Organize with functions** -- as your script grows, break logic into named functions (see [structure](/learn/reference/structure))
- **Save often** -- changes are saved automatically, but the editor also supports collaborative sessions where multiple people edit simultaneously
