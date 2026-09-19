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

This page takes you from an empty account to a sprite you can move around the screen. It assumes nothing about Lua; the [Game loop](/learn/concepts/game-loop) page explains afterwards why the code is shaped the way it is. A word you do not know is in the [Glossary](/learn/reference/glossary).

> [!IMPORTANT]
> The editor needs a browser window at least **1024 px** wide. Narrower, it shows "The editor needs a bigger screen" instead of the workspace.

## Step 0: Create the game

On the My games page, press **+ New game** in the top bar (the list itself only offers the button while it is empty). The screen says "> creating a new game…" for a moment, then the editor opens on the GAME tab, where the game is called "Untitled game" until you name it.

A new game is not empty. Its `main` tab already holds a starter program, a moon driven with [[input.held]], and the moon itself is drawn in sprites 1, 2, 17 and 18 of the sheet. Run it once to see the console at work: open the **CODE** tab and press **▶**, the Play button under the game screen at the right. Then replace it.

## Step 1: Draw a sprite

Open the **ART** tab. The big canvas in the middle is the whole sheet, the picture your sprites are cut from; each sprite is one 8 × 8 cell of it. The cell you are working on is the **region**, drawn with a gold outline, and it is chosen on the small SHEET map at the top right: click a cell there. PREVIEW, at the bottom right of the canvas, then reads `SPRITE 000` and shows that cell at its real size.

A new game opens with the region on sprite 1, the moon. Click the top-left cell of the SHEET map to move it to sprite `0`, which the starter game leaves empty, and draw a small character in it. Lock, in the bar above the canvas, is an option that keeps a stroke inside the region; it is off to begin with, so stay inside the cell.

Colours are picked in PALETTE at the bottom right. The swatches count from `0`, left to right, top row first; click one and its number shows under the grid, as `SLOT 04`.

![The ART tab](editors/img/art.png "The ART tab of a new game: the starter moon on sprites 1, 2, 17 and 18, the gold outline on the second cell is the region, Lock is off, and PREVIEW at the bottom right reads SPRITE 001. SHEET, FLAGS and PALETTE are the panels at the right.")

> [!WARNING]
> Colour 0, the near-black at the start of the palette, is the transparent colour of a sprite. Pixels left in colour 0 are not drawn, so pick any other colour for your character.

## Step 2: Write the code

Open the **CODE** tab and replace the contents of the `main` tab with this:

``` lua
local player = { x = 156, y = 86 }

function _update()
  if input.held("left") then player.x = player.x - 2 end
  if input.held("right") then player.x = player.x + 2 end
  if input.held("up") then player.y = player.y - 2 end
  if input.held("down") then player.y = player.y + 2 end
end

function _draw()
  gfx.clear(0)
  gfx.draw_sprite(0, player.x, player.y)
end
```

Line by line: `{ x = 156, y = 86 }` is a **table**, a box with named slots, and `local` keeps the name `player` to this tab. The numbers put the sprite in the middle of the screen: the screen is 320 × 180, so its centre is (160, 90), and a sprite is 8 pixels wide, so half of it, 4, is taken off each. `function _update() … end` is a function, a block of code with a name; `if … then … end` runs what is between `then` and `end` only when the test before it is true.

`_update` runs sixty times a second and moves the player; `_draw` clears the screen and draws sprite `0` where the player is. [[input.held]] asks for an **action**, not a key: "left" answers to the left arrow, to A or Q, to a gamepad and to the touch controls alike.

## Step 3: Play

The game screen is in the column at the right of the code, with a small transport bar under it. If that column shows REFERENCE instead, press <kbd>F1</kbd>, or click the ⇄ button on the column's edge, to swap the screen back. Press the **▶** button (Play). Your sprite appears on the dark background, and the arrow keys move it.

![The CODE tab with the game screen](editors/img/code.png "The CODE tab of a new game after one ▶: the starter code on the left, the moon on the game screen at the top right with the transport under it, and the Console showing the game's greeting.")

The `Auto` switch beside the transport is on by default. With Auto on, an edit reruns the game while it runs, and after an error once you fix it; a paused game gets the new code and stays paused. The Console tab under the screen shows what `print` writes, and any error.

> [!TIP]
> Nothing to save. The game syncs as you type; the status bar of the CODE tab reads "Synced" or "Unsaved changes". To let someone else play it, name it in the GAME tab, write a one-line summary and press Publish.

## What to explore next

- [Your first game](/learn/tutorials/first-game): the tutorial to do next, a coin hunt in ten minutes.
- [Game loop](/learn/concepts/game-loop): how `_init`, `_update` and `_draw` work together.
- [Coordinates](/learn/concepts/coordinates): the screen, the camera, the sprite sheet and the map.
- [API reference](/learn/api/index): every Lua function, by namespace.
- [Editors](/learn/editors/index): how to use each tab.
- [Tutorials](/learn/tutorials/index): step-by-step builds of complete games.
- [Glossary](/learn/reference/glossary): the words used above, one paragraph each.
