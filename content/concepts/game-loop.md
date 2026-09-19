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

A Naucto game is not a program that runs from top to bottom: the engine loads it once, then calls three global functions on its own schedule. This page says what happens when, so you know where each piece of your code belongs. The words it uses are in the [Glossary](/learn/reference/glossary).

## Lifecycle overview

{{svg:img/game-loop.svg}}

Each of the three functions is optional; a missing one is skipped.

## Loading

When you press Play, the code of every tab of the CODE editor runs, **in the order of the tab strip**, and only then does `_init` run. Each tab runs in turn, and what a tab creates without `local` is visible to the tabs after it: a function or a variable written without `local` is a **global**, there for every tab. A name declared with `local` at the top of a tab is that tab's own. [Code structure](/learn/reference/structure) says how to split a game across tabs.

## `_init()`

``` lua
function _init()
  -- create variables, player state, enemy tables, level data
end
```

`_init` runs once, after all the tabs have loaded, and before the first step. Build your tables here, place the player, set the camera: anything that must exist before the first picture is shown.

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

Two words, kept apart on this page. A **step** is one `_update` followed by one `_draw`, and it stands for 1/60 s of game time. The **picture shown** is what the screen displays; the browser shows a new one whenever it is ready, which is usually, but not always, once per step.

The loop is a **fixed step**: every time the browser is ready to show a picture, the engine counts the time that has passed and runs as many steps as fit in it, then shows the picture the last `_draw` made. If the browser fell behind, up to five steps run in one go before a single picture, so `_draw` can run without its picture ever being shown; past five, the missing steps are dropped rather than caught up, and a gap longer than a quarter of a second counts as a quarter of a second.

Because the step is fixed, speeds are written per step, not per second: a `speed = 2` moves two pixels every step, 120 pixels a second. The clocks in `sys` count steps too: [[sys.dt]] is the constant `1/60`, [[sys.frame]] counts steps since `_init`, [[sys.time]] is that count in seconds, and [[sys.fps]] is the number of pictures really shown in the last second.

## Stopping, pausing, stepping

An error in `_init`, `_update` or `_draw` halts the game: the screen freezes on the last picture, the Console prints the error and "--- HALTED ---", and the music stops. [Debugging](/learn/reference/debugging) shows what that looks like; on the page of a published game the screen says so itself, with a Restart button.

The game is also **paused whenever its screen is not shown**: while the browser tab is hidden, and in the editor on every tab but CODE (GAME, ART, MAP, SOUND, NET), unless the VIEWER is popped out into its floating card, which follows you from tab to tab. Even popped out, the game pauses when the REFERENCE takes the console's place, which it does in a window narrower than 1602 px. It resumes when the screen is back.

The transport bar under the screen has **Pause, Step and Restart**. Step runs one step, one `_update` and one `_draw`, pausing the game first if it was running. Restart reloads the tabs and runs `_init` again from scratch. With the Auto switch on, an edit to the code reruns the game while it runs, and after an error once you fix it; a paused game gets the new code and stays paused.

![The console column of CODE](../editors/img/code-console.png "The console column before the first run: an idle screen with the pointer, the transport under it with Play, Restart, Step and the Auto switch, and the Console saying the machine has nothing to say yet.")
