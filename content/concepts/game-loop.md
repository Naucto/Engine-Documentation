---
title: Game Loop
slug: concepts/game-loop
section: concepts
order: 0
description: How a game runs, from the loading of the code tabs to the sixty fixed steps a second that call _update and _draw.
legacy_slugs:
- game-loop.html
---

# Game Loop

A Naucto game is not a program that runs from top to bottom: the engine loads it once, then calls three global functions on its own schedule. This page says what happens when, so you know where each piece of your code belongs.

## Lifecycle overview

```
code tabs run, in tab order      <-- once, before anything
        |
        v
    _init()                       <-- once
        |
        v
   +-----------+
   | _update() |  <-- one step, 1/60 s
   | _draw()   |
   +-----------+
        |
        v
   screen shown -> next step ...  (error anywhere: --- HALTED ---)
```

Each of the three functions is optional; a missing one is skipped.

## Loading

When you press Play, the top-level code of every tab of the CODE editor runs, **in the order of the tab strip**, and only then does `_init` run. There is no `require`: a tab is not a module you ask for, it is a chunk that has already run by the time the tabs to its right start. A `local` declared at the top level of a tab is private to that tab; anything another tab needs has to be a global. [Code structure](/learn/reference/structure) says how to split a game across tabs.

## `_init()`

``` lua
function _init()
  -- create variables, player state, enemy tables, level data
end
```

`_init` runs once, after all the tabs have loaded, and before the first step. Build your tables here, place the player, set the camera: anything that must exist before the first frame.

## `_update()`

``` lua
function _update()
  -- handle input, physics, collisions, timers
end
```

`_update` is called once per step and holds all the **game logic**: reading input, moving things, applying gravity, checking collisions, changing scores and states.

## `_draw()`

``` lua
function _draw()
  gfx.clear(0)
  -- draw map, sprites, shapes, UI
end
```

`_draw` is called right after `_update` and only **renders**: clear, move the camera, draw the map, the sprites, the shapes, the HUD. To watch a value while playing, draw it with [[gfx.print]] rather than `print`, which would write sixty lines a second to the Console.

> [!IMPORTANT]
> Update in `_update`, draw in `_draw`. Never change game state inside `_draw`, and avoid drawing inside `_update`. Keeping the two apart is what makes a game readable, and it is the one habit that pays every time you debug.

## Sixty steps a second

The loop is a **fixed step** of 1/60 s laid on the browser's animation frames. Every animation frame, the engine counts the time elapsed and runs as many `_update` + `_draw` pairs as fit, then shows the last picture. If the browser fell behind, up to five pairs run in one go before a single display, so `_draw` can run without its frame ever being shown; past five, the backlog is dropped rather than caught up, and a gap longer than a quarter of a second counts as a quarter of a second.

Because the step is fixed, speeds are written per step, not per second: a `speed = 2` moves two pixels every step, 120 pixels a second. The clocks in `sys` follow the same step: [[sys.dt]] is the constant `1/60`, [[sys.frame]] counts steps since `_init`, [[sys.time]] is that count in seconds, and [[sys.fps]] is the rate really measured.

## Stopping, pausing, stepping

An error in `_init`, `_update` or `_draw` halts the game: the screen freezes on the last frame, the Console prints the error and "--- HALTED ---", and the music stops. [Debugging](/learn/reference/debugging) shows what that looks like; on the page of a published game the screen says so itself, with a Restart button. The game is also paused while the browser tab is hidden, and in the editor while the screen column is collapsed on the ART and MAP tabs; it resumes when you come back.

The transport bar under the screen has **Pause, Step and Restart**. Step runs one `_update` and one `_draw`, pausing the game first if it was running. Restart reloads the tabs and runs `_init` again from scratch; with the Auto toggle on, so does every edit you make to the code.
