---
title: Getting Started
slug: getting-started
section: start
order: 1
description: 'Naucto is a browser-based retro game engine that lets you create 2D
  pixel-art games using Lua. Everything happens in your browser: draw sprites, paint
  maps, write code, and play your game -- all in on'
legacy_slugs:
- getting-started.html
---

# Getting Started

## What is Naucto?

Naucto is a browser-based retro game engine that lets you create 2D pixel-art games using **Lua**. Everything happens in your browser: draw sprites, paint maps, write code, and play your game -- all in one place.

The engine renders on a **320 x 180 pixel** canvas using WebGL, with **8 x 8 pixel** sprite tiles. It is inspired by fantasy consoles and designed to make game creation accessible and fun.

## Your first game in 3 steps

### Step 1: Draw a sprite

Open the **Sprite Editor** and draw a small character on sprite slot `0`. Each sprite is an 8 x 8 pixel tile.

### Step 2: Write the code

Switch to the **Code Editor** and type:

``` lua
function _init()
  x = 160
  y = 90
end

function _update()
  if key_pressed("ArrowLeft") then x = x - 2 end
  if key_pressed("ArrowRight") then x = x + 2 end
  if key_pressed("ArrowUp") then y = y - 2 end
  if key_pressed("ArrowDown") then y = y + 2 end
end

function _draw()
  clear(0)
  sprite(0, x, y, 1, 1)
end
```

### Step 3: Play

Click the **Play** button. You should see your sprite on a black background. Use the arrow keys to move it around.

That's it -- you just made a game!

## What to explore next

- [game-loop](/learn/concepts/game-loop) -- understand how `_init`, `_update`, and `_draw` work together
- [coordinates](/learn/concepts/coordinates) -- learn about the screen, coordinate system, and sprite sheet layout
- [index](/learn/api/index) -- browse the full list of Lua functions available to you
- [index](/learn/editors/index) -- learn how to use each editor
- [index](/learn/tutorials/index) -- follow step-by-step tutorials to build complete games
