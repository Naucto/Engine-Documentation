---
title: Code Structure Guide
slug: reference/structure
section: reference
order: 2
description: How to lay out the Lua of a game that has outgrown one screen of code, across functions, tabs and a state variable.
legacy_slugs:
- structure.html
---

# Code Structure Guide

A first game fits in three functions. This page is for the day it no longer does: it shows how to split the work into functions, then into tabs, and how to give a game with a menu and a game-over screen a shape that stays readable.

## Basic structure

For a small game the three lifecycle functions are enough, and everything else sits at the top level beside them:

``` lua
local player = { x = 40, y = 40 }

function _init()
  -- set up everything
end

function _update()
  -- all game logic
end

function _draw()
  gfx.clear(0)
  -- all rendering
end
```

## Organized structure

As the game grows, keep the three lifecycle functions short and make each one a **list of calls**, one per system. The block below is a skeleton: each function it calls is one you write, and the game does not run until they all exist.

``` lua
function _init()
  init_player()
  init_level()
  init_enemies()
end

function _update()
  update_player()
  update_enemies()
  update_camera()
end

function _draw()
  gfx.clear(0)
  draw_level()
  draw_enemies()
  draw_player()
  draw_ui()
end
```

This scales because each function has one job, a bug is found by its name, and a new system (pickups, particles, a menu) is a new function rather than a change to an existing one.

## Several tabs

The CODE editor holds several tabs, and the natural next step is **one tab per system**: `main` for the lifecycle functions, `player` for `init_player` and friends, `enemies` for the enemies. Three things about how tabs run decide how to split them:

- The tabs run **in the order of the strip**, all of them, before `_init`. A tab that only defines functions can go anywhere; a tab whose top-level code uses a global defined in another tab must come after it.
- There is no `require`. A tab is not loaded on demand; it has already run.
- A top-level `local` is private to its tab. Anything two tabs share, a `player` table, a `SPRITE_PLAYER` constant, is a global.

A tab name is at most 24 characters, cannot hold a colon, and cannot be the name of a Lua library (`string`, `table`, `math`, ...). An error names the tab it came from, `enemies:12:`, with the line counted in that tab.

## Naming conventions

Consistent names are what let a reader guess where something lives before searching for it. Constants in `UPPER_CASE`, game objects as tables, functions named by what they do and prefixed by their system:

``` lua
SPRITE_PLAYER = 0
PLAYER_SPEED = 2
GRAVITY = 0.3

player = {}
enemies = {}
bullets = {}

function init_player()
  player.x, player.y, player.vy = 40, 40, 0
end

function update_player()
  if input.btn("left") then player.x = player.x - PLAYER_SPEED end
  if input.btn("right") then player.x = player.x + PLAYER_SPEED end
end

function draw_player()
  gfx.draw_sprite(SPRITE_PLAYER, player.x, player.y)
end
```

## Game state management

For a game with several screens (menu, gameplay, game over), use one **state variable** and branch on it in `_update` and `_draw`. Transitions are ordinary assignments to that variable; here the A button (X, space or a pad button) starts the game and a fall ends it. This too is a skeleton: `update_game`, `draw_menu` and the others are yours to write.

``` lua
state = "menu"

function _update()
  if state == "menu" then
    if input.btnp("a") then state = "play" end
  elseif state == "play" then
    update_game()
    if player.y > 180 then state = "gameover" end
  elseif state == "gameover" then
    if input.btnp("a") then state = "menu" end
  end
end

function _draw()
  gfx.clear(0)
  if state == "menu" then
    draw_menu()
  elseif state == "play" then
    draw_game()
  elseif state == "gameover" then
    draw_gameover()
  end
end
```
