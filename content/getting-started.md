---
title: Getting Started
slug: getting-started
section: start
order: 1
description: Create a game, draw a sprite, write ten lines of Lua and play it, without leaving the browser.
legacy_slugs:
- getting-started.html
---

# Getting Started

This page takes you from an empty account to a sprite you can move around the screen. It assumes nothing about Lua; the [Game loop](/learn/concepts/game-loop) page explains afterwards why the code is shaped the way it is.

## Step 0: Create the game

On the My games page, press **+ New game**. The screen says "> creating a new game…" for a moment, then the editor opens on the GAME tab, where the game is called "Untitled game" until you name it.

A new game is not empty. Its `main` tab already holds a starter program, a moon driven with [[input.btn]], and the moon itself is drawn in sprites 1, 2, 17 and 18 of the sheet. Run it once to see the console at work, then replace it.

## Step 1: Draw a sprite

Open the **ART** tab, select sprite `0` (the top-left cell of the sheet, which the starter game leaves empty) and draw a small character in it. Each sprite is an 8 × 8 tile.

> [!WARNING]
> Colour 0, the near-black at the start of the palette, is the transparent colour of a sprite. Pixels left in colour 0 are not drawn, so pick any other colour for your character.

## Step 2: Write the code

Open the **CODE** tab and replace the contents of the `main` tab with this:

``` lua
local player = { x = 156, y = 86 }

function _update()
  if input.btn("left") then player.x = player.x - 2 end
  if input.btn("right") then player.x = player.x + 2 end
  if input.btn("up") then player.y = player.y - 2 end
  if input.btn("down") then player.y = player.y + 2 end
end

function _draw()
  gfx.clear(0)
  gfx.draw_sprite(0, player.x, player.y)
end
```

`_update` runs sixty times a second and moves the player; `_draw` clears the screen and draws sprite `0` where the player is. [[input.btn]] asks for an **action**, not a key: "left" answers to the left arrow, to A or Q, to a gamepad and to the touch controls alike.

## Step 3: Play

The game screen is in the column to the right of the code, with a small transport bar under it. Press the **▶** button (Play). Your sprite appears on the dark background, and the arrow keys move it.

The `Auto` toggle beside the transport is on by default: once the game has run, every edit to the code reruns it a moment later, so you do not need to press Play again. The Console tab under the screen shows what `print` writes, and any error.

> [!TIP]
> Nothing to save. The game syncs as you type; the status bar of the CODE tab reads "Synced" or "Unsaved changes". To let someone else play it, name it in the GAME tab, write a one-line summary and press Publish.

## What to explore next

- [Game loop](/learn/concepts/game-loop): how `_init`, `_update` and `_draw` work together.
- [Coordinates](/learn/concepts/coordinates): the screen, the camera, the sprite sheet and the map.
- [API reference](/learn/api/index): every Lua function, by namespace.
- [Editors](/learn/editors/index): how to use each tab.
- [Tutorials](/learn/tutorials/index): step-by-step builds of complete games.
