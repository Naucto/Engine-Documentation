==========================
Build a Platformer Game
==========================

This tutorial walks you through building a complete platformer with animated sprites, gravity,
jumping, platform collision, and camera scrolling.

What you will build
===================

A side-scrolling platformer where the player can:

- Move left and right
- Jump between platforms
- Fall with gravity
- Respawn when falling off the screen

The camera follows the player horizontally.

Step 1: Prepare your sprites
=============================

Open the **Sprite Editor** and draw these sprites:

+---------------+-----------------------------------------+
| Sprite index  | Content                                 |
+===============+=========================================+
| ``0``         | Player standing (idle)                  |
+---------------+-----------------------------------------+
| ``1``         | Player walking frame 1                  |
+---------------+-----------------------------------------+
| ``2``         | Player walking frame 2                  |
+---------------+-----------------------------------------+
| ``3``         | Player jumping                          |
+---------------+-----------------------------------------+
| ``32``        | Solid ground/platform tile              |
+---------------+-----------------------------------------+

The player character is **8 pixels wide and 16 pixels tall** (1 tile wide, 2 tiles tall).
Draw the top half of the character in the sprite slot and the bottom half in the slot directly
below it. The engine handles multi-tile drawing with ``sprite(index, x, y, 1, 2)``.

Select your solid ground/platform tile, then set **flag bit 0** in the Sprite Editor. The tutorial
uses that flag to decide which map tiles the player collides with.

.. tip::

   You can use any sprite indexes you want. Just update the constants at the top of the script
   to match and enable flag bit ``0`` on each tile that should be solid.

Step 2: Paint your level
========================

Open the **Map Editor** and paint your level with the solid tile you flagged in Step 1:

- **Ground row** -- a full row of solid tiles across the bottom
- **Floating platforms** -- smaller groups of tiles at different heights

Example layout (each cell = 8 pixels):

::

   Row 17 (y=136): platform at columns 9-13
   Row 15 (y=120): platform at columns 17-20
   Row 13 (y=104): platform at columns 25-31
   Row 17 (y=136): platform at columns 34-37
   Row 21 (y=168): ground spanning columns 0-52

The map now drives collision too. The code in Step 3 uses :func:`mget` to read the tile under the
player and :func:`fget` to check whether that tile has the solid flag.

Step 3: Write the code
=======================

Switch to the **Code Editor** and enter the full script below.

Constants
---------

.. code-block:: lua

   -- Change these to match your sprite sheet
   SPRITE_IDLE   = 0
   SPRITE_WALK_1 = 1
   SPRITE_WALK_2 = 2
   SPRITE_JUMP   = 3

   -- Player dimensions: 1 tile wide, 2 tiles tall (8x16 px)
   PLAYER_W = 8
   PLAYER_H = 16

   -- Tilemap settings
   TILE_SIZE  = 8
   MAP_W      = 128
   MAP_H      = 32
   FLAG_SOLID = 0

.. note::

   ``MAP_W`` and ``MAP_H`` match the default map size in tiles. ``FLAG_SOLID = 0`` means "check
   bit 0 on the sprite's flags." The sprite index itself comes from the map with :func:`mget`, so
   you do not need to list every platform in code.

Helper functions
----------------

.. code-block:: lua

   function clamp(v, lo, hi)
     if v < lo then return lo end
     if v > hi then return hi end
     return v
   end

   function is_solid_tile(tx, ty)
     if tx < 0 or tx >= MAP_W or ty < 0 or ty >= MAP_H then
       return false
     end

     local sprite_index = mget(tx, ty)
     return fget(sprite_index, FLAG_SOLID)
   end

Initialization
--------------

.. code-block:: lua

   player = {}
   anim_timer = 0

   function _init()
     player = {
       x          = 24,
       y          = 40,
       vx         = 0,
       vy         = 0,
       speed      = 1.8,
       gravity    = 0.30,
       jump_force = -5.0,
       max_fall   = 5.5,
       on_ground  = false,
       facing     = 1,
       anim_frame = SPRITE_IDLE,
     }
     anim_timer = 0
   end

Input handling
--------------

.. code-block:: lua

   function handle_input()
     player.vx = 0

     if key_pressed("ArrowLeft") or key_pressed("a") then
       player.vx    = -player.speed
       player.facing = -1
     end

     if key_pressed("ArrowRight") or key_pressed("d") then
       player.vx    = player.speed
       player.facing = 1
     end

     local wants_jump = key_pressed("ArrowUp")
                     or key_pressed("w")
                     or key_pressed(" ")
     if wants_jump and player.on_ground then
       player.vy        = player.jump_force
       player.on_ground = false
     end
   end

Animation
---------

.. code-block:: lua

   function update_animation()
     if not player.on_ground then
       player.anim_frame = SPRITE_JUMP
       return
     end

     if player.vx ~= 0 then
       anim_timer = anim_timer + 1
       if anim_timer >= 8 then
         anim_timer = 0
         if player.anim_frame == SPRITE_WALK_1 then
           player.anim_frame = SPRITE_WALK_2
         else
           player.anim_frame = SPRITE_WALK_1
         end
       end
     else
       player.anim_frame = SPRITE_IDLE
       anim_timer = 0
     end
   end

Movement and collision
----------------------

.. code-block:: lua

   function move_x()
     player.x = player.x + player.vx

     local top_tile    = math.floor(player.y / TILE_SIZE)
     local bottom_tile = math.floor((player.y + PLAYER_H - 1) / TILE_SIZE)

     if player.vx > 0 then
       local right_tile = math.floor((player.x + PLAYER_W - 1) / TILE_SIZE)

       for ty = top_tile, bottom_tile do
         if is_solid_tile(right_tile, ty) then
           player.x  = right_tile * TILE_SIZE - PLAYER_W
           player.vx = 0
           break
         end
       end
     elseif player.vx < 0 then
       local left_tile = math.floor(player.x / TILE_SIZE)

       for ty = top_tile, bottom_tile do
         if is_solid_tile(left_tile, ty) then
           player.x  = (left_tile + 1) * TILE_SIZE
           player.vx = 0
           break
         end
       end
     end
   end

   function move_y()
     player.vy = player.vy + player.gravity
     if player.vy > player.max_fall then
       player.vy = player.max_fall
     end

     player.y         = player.y + player.vy
     player.on_ground = false

     local left_tile  = math.floor(player.x / TILE_SIZE)
     local right_tile = math.floor((player.x + PLAYER_W - 1) / TILE_SIZE)

     if player.vy > 0 then
       local bottom_tile = math.floor((player.y + PLAYER_H - 1) / TILE_SIZE)

       for tx = left_tile, right_tile do
         if is_solid_tile(tx, bottom_tile) then
           player.y         = bottom_tile * TILE_SIZE - PLAYER_H
           player.vy        = 0
           player.on_ground = true
           break
         end
       end
     elseif player.vy < 0 then
       local top_tile = math.floor(player.y / TILE_SIZE)

       for tx = left_tile, right_tile do
         if is_solid_tile(tx, top_tile) then
           player.y  = (top_tile + 1) * TILE_SIZE
           player.vy = 0
           break
         end
       end
     end

     -- Fell off the bottom: respawn
     if player.y > 260 then
       player.x  = 24
       player.y  = 40
       player.vx = 0
       player.vy = 0
     end
   end

Game loop
---------

.. code-block:: lua

   function _update()
     handle_input()
     move_x()
     move_y()
     update_animation()
   end

   function draw_player()
     sprite(player.anim_frame, player.x, player.y, 1, 2)
   end

   function _draw()
     camera(clamp(player.x - 160, 0, MAP_W * TILE_SIZE - 320), 0)
     clear(12)
     map(0, 0)
     draw_player()
   end

How it all fits together
========================

::

   Sprite Editor          Map Editor              Lua Script
   ----------------       ----------------        --------------------------
   index 0 = idle         Paint sprite 32         map(0,0) renders the
   index 1 = walk 1       wherever the player     tilemap.
   index 2 = walk 2       should collide.
   index 3 = jump                                 mget() reads tile indexes.
   index 32 = solid       The painted map is      fget() checks flag bit 0.
   flag bit 0 = solid     the collision data.     sprite() draws the player.

Extending the example
=====================

- **Add coins** -- Paint coin tiles on the map; give them a different sprite flag bit; use
  ``mget()`` and ``fget()`` to detect them.
- **Add enemies** -- Add an ``enemies`` table; update positions each frame; use ``sprite()``
  to draw them.
- **Bigger player** -- Draw a 2x2 sprite and call ``sprite(index, x, y, 2, 2)``.
- **Animate tiles** -- Use ``set_col`` to tint selected colors each frame.
- **Level restart** -- Track a ``lives`` variable; reset player on death.
