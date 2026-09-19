---
title: Your First Game
slug: tutorials/first-game
lua: first-game/main.lua
assets: first-game/assets.json
section: tutorials
order: 1
description: Build a one-screen coin hunt in ten minutes, with a sprite that walks into walls, five coins to pick up, a score and a win message.
---

# Your First Game

This tutorial turns the sprite you moved in [Getting started](/learn/getting-started) into a game you can finish: a room with walls, five coins to collect, a score and a win. It takes about ten minutes and visits ART, MAP and CODE once each.

Each step explains one idea and gives the code it adds, whole: a function is always shown from `function` to `end`, so it can be typed or pasted as it stands, and a function shown again replaces the one you had. The editor needs a window at least **1024 pixels wide**; narrower, it shows a message instead of the tabs.

## What you will build

A top-down room that fits on one screen. The player walks in four directions and stops at the walls; each coin disappears when touched and counts one point; when the fifth is taken, the game says so. If you would rather start from the finished game, **Copy to new game** at the head of the page installs the code, the sprites, the flag and the map together.

## Step 1: Draw the sprites

Open **ART**. The sheet of `256` sprites is drawn in the canvas; the SHEET map at the right shows the whole sheet small, and a click on one of its cells selects that sprite. PREVIEW, over the canvas, then reads its number, such as `SPRITE 000`.

The colours are the swatches under PALETTE, in the right column. They are **numbered from `0`**, left to right, the top row first, and the number shows once a swatch is clicked; the code names a colour by that number.

### The player and the coin

Select sprite `0` and draw the player: a round body in colour `4` (yellow) with two eyes in colour `5` (white). Then select sprite `1` and draw the coin: a small disc in colour `4` with a rim in colour `3` (orange), leaving a one-pixel margin all round so it looks smaller than the player.

A new game does not start empty: the starter moon sits in sprites `1`, `2`, `17` and `18`. Drawing the coin over `1` is intended; clear the other three if you like, this game never draws them.

> [!TIP]
> Lock, at the right end of the tool bar, is off when a game opens. On, a stroke stays inside the selected sprite instead of running into the next one; worth switching on while the coin's rim is drawn one pixel from the edge.

### The wall and its flag

Select sprite `32`, the first of the third row, and draw a brick tile: bricks in colour `10` (navy) with mortar lines in colour `15` (dark blue). The tile repeats on the map, so keep the lines at its edges.

With sprite `32` selected, find **FLAGS** under the SHEET map, in the right column: eight buttons numbered `0` to `7`. Turn on button `0`. The engine never reads flags itself; Step 3 reads bit `0` with [[map.flag]] and decides that it means "solid".

![ART with the wall tile selected](img/first-game-art.png "ART, sprite 032 selected on the SHEET map: the brick tile in the canvas, and flag 0 already lit in the FLAGS panel under it.")

## Step 2: Paint the room

Open **MAP**. In the TILE PICKER of the right column, click sprite `32`, the first cell of the third row; the Stamp tool is the one selected when the tab opens. Paint:

- a border: row `0`, row `21`, column `0` and column `39`, all the way across
- a few inner walls, for instance row `6` from column `6` to `13`, row `15` from column `26` to `33`, and column `20` from row `8` to `13`

The status line at the bottom of the map reads the tile under the cursor, `TILE 6,15 · SPR 032`: the column, the row, and the sprite painted there. It is how you find row `6` or column `39` without counting.

The screen is `320 x 180` pixels, which is `40` tiles across and `22` and a half down. The map is bigger than that (`128 x 32` tiles), but the game never moves the camera, so **only the top-left `40 x 22` tiles are ever on screen**: keep everything inside rows `0` to `21` and columns `0` to `39`, and if the map has scrolled, scroll it back with the wheel.

> [!TIP]
> The **Flags** button of MAP tints every tile by the first flag set on its sprite. Switch it on: every wall should light up. A wall with no tint was painted with the wrong sprite, and the player will walk through it.

![MAP with the room painted](img/first-game-map.png "The room in MAP with the Flags overlay on: the border and the three inner walls, all tinted, inside the 40 by 22 tiles the screen shows; the TILE PICKER on sprite 032.")

## Step 3: Walk into walls

Switch to **CODE**. The middle column is the script, `main`; the right column is the game screen with its Play button and the console under it. If the right column shows REFERENCE instead of the game, press <kbd>F1</kbd> or click ⇄ on its edge to swap back.

Delete the starter script, and start with the numbers Step 1 and 2 decided:

``` lua
SPRITE_PLAYER = 0
SPRITE_COIN   = 1
SPRITE_WALL   = 32
FLAG_SOLID    = 0

TILE_SIZE = 8
SPEED     = 2
```

### Which tiles are solid

There is no separate collision data: the painted map is the collision data. One function answers the only question the walls ever get asked, is the pixel at `(px, py)` inside a solid tile? Divide by the tile size to get a tile coordinate, read the sprite painted there with [[map.get]], and ask its flag with [[map.flag]]:

``` lua
function solid_at(px, py)
  local tx = math.floor(px / TILE_SIZE)
  local ty = math.floor(py / TILE_SIZE)
  return map.flag(map.get(tx, ty), FLAG_SOLID)
end
```

The player is `8 x 8` pixels, so it can stand at `(x, y)` when none of its four corners is inside a wall. The right and bottom corners are at `+ 7`, not `+ 8`: an 8-pixel body covers pixels `x` to `x + 7`, and testing one further would read the tile next door.

``` lua
function can_stand(x, y)
  return not solid_at(x, y)
     and not solid_at(x + 7, y)
     and not solid_at(x, y + 7)
     and not solid_at(x + 7, y + 7)
end
```

> [!NOTE]
> [[map.get]] outside the map answers `0`, and sprite `0` is the player, which carries no flag, so the edges of the map read as empty. The border you painted is what keeps the player in. Give sprite `0` a flag some day and the [platformer](/learn/tutorials/platformer) shows the bounds guard you then need.

### Move, then check

`_init` creates the player where Getting started did, only closer to the corner:

``` lua
function _init()
  player = { x = 16, y = 16 }
end
```

`_update` reads the four directions with [[input.held]] into a step `dx, dy`, then applies each axis only if the player can stand there. Testing the two axes **separately** is what lets the player slide along a wall instead of sticking to it:

``` lua
function _update()
  local dx, dy = 0, 0
  if input.held("left")  then dx = -SPEED end
  if input.held("right") then dx = SPEED end
  if input.held("up")    then dy = -SPEED end
  if input.held("down")  then dy = SPEED end

  if can_stand(player.x + dx, player.y) then
    player.x = player.x + dx
  end
  if can_stand(player.x, player.y + dy) then
    player.y = player.y + dy
  end
end
```

`_draw` clears the screen, draws the map with [[map.draw]] at the origin, then the player on top:

``` lua
function _draw()
  gfx.clear(0)
  map.draw(0, 0)
  gfx.draw_sprite(SPRITE_PLAYER, player.x, player.y)
end
```

> [!TRY]
> Press Play: the game takes the keyboard. The player walks around the room with the arrows and stops flush against every wall, inner walls included. If it walks through one, check Step 1: the flag is on the sprite, not on the map.

![The room and the player](img/frames/first-game-step3.png "The game at the end of Step 3: the walls, and the player alone in the top-left corner.")

## Step 4: Coins and a score

A coin is a small table: where it is, and whether it has been taken. Five of them go in a list in `_init`, beside a `score` that starts at `0`. This `_init` replaces the one from Step 3:

``` lua
function _init()
  player = { x = 16, y = 16 }
  score  = 0
  coins  = {
    { x = 40,  y = 24,  taken = false },
    { x = 280, y = 24,  taken = false },
    { x = 120, y = 88,  taken = false },
    { x = 232, y = 104, taken = false },
    { x = 40,  y = 152, taken = false },
  }
end
```

### Touching a coin

Two `8 x 8` boxes overlap when each one starts before the other one ends, on both axes. That is the whole test, and it works for any two things with an `x` and a `y`:

``` lua
function overlaps(a, b)
  return a.x < b.x + 8 and b.x < a.x + 8
     and a.y < b.y + 8 and b.y < a.y + 8
end
```

`collect_coins` walks the list and takes every coin the player touches. The `taken` flag is what stops a coin from **scoring twice**; the coin itself stays in the list:

``` lua
function collect_coins()
  for _, coin in ipairs(coins) do
    if not coin.taken and overlaps(player, coin) then
      coin.taken = true
      score = score + 1
    end
  end
end
```

It is called at the end of `_update`, after the player has moved. The rest of the function is Step 3's:

``` lua
function _update()
  local dx, dy = 0, 0
  if input.held("left")  then dx = -SPEED end
  if input.held("right") then dx = SPEED end
  if input.held("up")    then dy = -SPEED end
  if input.held("down")  then dy = SPEED end

  if can_stand(player.x + dx, player.y) then
    player.x = player.x + dx
  end
  if can_stand(player.x, player.y + dy) then
    player.y = player.y + dy
  end

  collect_coins()
end
```

### Drawing them

`_draw` now draws the coins that are still there, between the map and the player, then the score with [[gfx.print]]. A number joins a string with `..`, and the last argument is the colour, `5` for white:

``` lua
function _draw()
  gfx.clear(0)
  map.draw(0, 0)

  for _, coin in ipairs(coins) do
    if not coin.taken then
      gfx.draw_sprite(SPRITE_COIN, coin.x, coin.y)
    end
  end
  gfx.draw_sprite(SPRITE_PLAYER, player.x, player.y)

  gfx.print("SCORE " .. score, 10, 10, 5)
end
```

> [!NOTE]
> The game screen in CODE wears an FPS badge in its top-left corner, right where the score is printed. It is the editor's, not the game's: turn it off in Settings, on the Account tab, under Show FPS counter, or print the score lower.

> [!TRY]
> Walk over a coin: it vanishes and the score goes up by one. Walk back over the spot: nothing happens.

![The first coin taken](img/frames/first-game-step4.png "One coin taken: four are left on the map and the score reads SCORE 1.")

## Step 5: Win

The game is won when the score reaches the number of coins, which `#coins` gives without counting. `_init` gets a `won` that starts false:

``` lua
function _init()
  player = { x = 16, y = 16 }
  score  = 0
  won    = false
  coins  = {
    { x = 40,  y = 24,  taken = false },
    { x = 280, y = 24,  taken = false },
    { x = 120, y = 88,  taken = false },
    { x = 232, y = 104, taken = false },
    { x = 40,  y = 152, taken = false },
  }
end
```

`_update` sets it after the coins are collected, and checks it first of all, so the player freezes where it stands once the game is won:

``` lua
function _update()
  if won then
    return
  end

  local dx, dy = 0, 0
  if input.held("left")  then dx = -SPEED end
  if input.held("right") then dx = SPEED end
  if input.held("up")    then dy = -SPEED end
  if input.held("down")  then dy = SPEED end

  if can_stand(player.x + dx, player.y) then
    player.x = player.x + dx
  end
  if can_stand(player.x, player.y + dy) then
    player.y = player.y + dy
  end

  collect_coins()

  if score == #coins then
    won = true
  end
end
```

`_draw` keeps running and adds the message. Every glyph of the built-in font is `4` pixels wide, so `#text * 4` is the width of the text and the subtraction centres it on the `320` pixel screen:

``` lua
function _draw()
  gfx.clear(0)
  map.draw(0, 0)

  for _, coin in ipairs(coins) do
    if not coin.taken then
      gfx.draw_sprite(SPRITE_COIN, coin.x, coin.y)
    end
  end
  gfx.draw_sprite(SPRITE_PLAYER, player.x, player.y)

  gfx.print("SCORE " .. score, 10, 10, 5)

  if won then
    local text = "YOU WIN"
    gfx.print(text, (320 - #text * 4) // 2, 84, 4)
  end
end
```

> [!TRY]
> Take all five coins. The score reads `SCORE 5`, the player stops, and `YOU WIN` appears in the middle of the room.

![The game won](img/frames/first-game-step5.png "All five coins taken: SCORE 5, the player frozen where it took the last one, and YOU WIN in the middle of the room.")

## Extending the example

- A timer: count frames in `_update` and print `frames // 60` beside the score.
- A second room: paint it to the right of the first and move the camera with [[gfx.camera]] once the player reaches the door.
- A chasing enemy: a table like a coin that moves one pixel towards the player each frame, and ends the game on `overlaps`.
- Then the [platformer](/learn/tutorials/platformer): the same map-as-collision idea with gravity, jumping and a camera.
