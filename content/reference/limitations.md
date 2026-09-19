---
title: Current Limitations
slug: reference/limitations
section: reference
order: 1
description: The numbers a game lives within, the things the API leaves to you, and what to do about each.
legacy_slugs:
- limitations.html
---

# Current Limitations

The Naucto API is small on purpose. This page lists what a game cannot exceed and what it has to do for itself, so you find out here rather than halfway through a project.

## The numbers

| What | Limit |
|------|-------|
| Screen | 320 × 180 pixels, 16 colours, one 4 × 6 font |
| Sprite sheet | 8 to 256 pixels a side, in steps of 8; several sheets, numbered on from one another |
| Map | 1 to 256 tiles a side; several maps, numbered from 1 |
| Sound | 5 voices; 100 patterns (`00` to `99`); 16 musics (`0` to `15`); a PCM sample of at most 8 KB |
| Code | 10 million Lua instructions per call; a tab name of at most 24 characters |
| Publishing | 1 MB for the whole game (code, art, maps, sound); a name and a one-line summary |

Two small ones that bite: sprite **flags** are read on the first sheet only, so [[map.flag]] returns `0` for any sprite of another sheet; and tile `0` is always drawn empty, so sprite `0` never appears on a map.

## No saved data

There is no API to keep anything from one play to the next: no high score table, no save slot. A game starts from its code and assets every time, and [[map.set]] changes a tile for this run only. What you can persist is the game itself, through the GAME tab's named versions.

## No collision queries

There are no built-in collision functions. Use [[map.get]] and [[map.flag]] when a check should be driven by the tilemap, and write the overlap test yourself; an axis-aligned box test is four comparisons:

``` lua
function overlaps(ax, ay, aw, ah, bx, by, bw, bh)
  return ax < bx + bw
     and ax + aw > bx
     and ay < by + bh
     and ay + ah > by
end
```

## A fixed step, not a delta time

The loop runs a **fixed step** of 1/60 s (see [Game loop](/learn/concepts/game-loop)). [[sys.dt]] exists, but it always returns `1/60`: there is nothing to scale by, so speeds are written per step. The [platformer](/learn/tutorials/platformer) tutorial uses `speed = 1.8` and `gravity = 0.30`, both in pixels per step.

## Instruction budget

Each call into your code, the loading of a tab, `_init`, and every `_update` and `_draw`, may execute at most **10 million Lua instructions**. Past that the game halts with:

```
execution aborted: possible infinite loop or recursion
```

Normal game logic never gets close; it trips on a `while` loop whose exit condition can never become true. If a legitimate computation is that heavy, spread it across frames, a slice per `_update`.

## Runtime errors halt the game

An uncaught error in `_init`, `_update` or `_draw` **halts the game**: the screen freezes on the last frame and the music stops until you fix the error and rerun ([Debugging](/learn/reference/debugging) shows the message). Errors inside `net` callbacks are the exception: they are printed and the game goes on.

Out-of-range arguments are not errors. A colour index is taken modulo 16, [[map.get]] and [[map.flag]] return `0` outside the map, and a sprite number no sheet holds is drawn from the first sheet.

## Tabs, not modules

The CODE editor holds several tabs, and they run in the order of the strip, each as its own chunk. There is no `require`, `dofile`, `loadfile` or `package`, and a top-level `local` is private to its tab. [Code structure](/learn/reference/structure) says how to split a game across tabs with that in mind.

## Multiplayer

A session has the capacity the game declares (`max_players`, `2` by default). Only numbers, strings and booleans are shared, there is no host migration, and a client's write to a protected path is rolled back. [Multiplayer](/learn/concepts/multiplayer) has the whole model.

## What works well today

Within these limits, the tutorials show the range: a [platformer](/learn/tutorials/platformer) with tilemap collisions, sprite flags and a camera; a two-player [pong](/learn/tutorials/pong) over the network; a [coin rush](/learn/tutorials/click-race) built on locks and events; a [tag arena](/learn/tutorials/tag) with a host-driven world. HUDs with [[gfx.print]] and shapes, palette swaps with [[gfx.set_col]] and musics from the SOUND tab all come from the same small API.
