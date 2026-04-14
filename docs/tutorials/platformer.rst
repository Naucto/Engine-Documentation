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
- Respawn when touching deadly tiles
- Win when touching the end tile

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
| ``33``        | Deadly tile, such as spikes             |
+---------------+-----------------------------------------+
| ``34``        | End tile, such as a trophy or door      |
+---------------+-----------------------------------------+

The player character is **8 pixels wide and 8 pixels tall** (1 tile wide, 1 tile tall). Each player
animation frame fits in a single sprite slot.

Set these flags in the Sprite Editor:

- On your solid ground/platform tile, turn on **flag bit 0**
- On your deadly tile, turn on **flag bit 1**
- On your end tile, turn on **flag bit 2**

.. tip::

   You can use any sprite indexes you want. Just update the constants at the top of the script
   to match and enable the same flag bits on the matching tile sprites.

Step 2: Paint your level
========================

Open the **Map Editor** and paint your level with the tiles you flagged in Step 1:

- **Ground row** -- a full row of solid tiles across the bottom
- **Floating platforms** -- smaller groups of tiles at different heights
- **Deadly tiles** -- a few spikes or hazards that send the player back to the start
- **End tile** -- the tile the player touches to win

Example layout (each cell = 8 pixels):

::

   Row 17 (y=136): platform at columns 9-13
   Row 15 (y=120): platform at columns 17-20
   Row 13 (y=104): platform at columns 25-31
   Row 17 (y=136): platform at columns 34-37
   Row 20 (y=160): deadly tiles at columns 14-16
   Row 20 (y=160): end tile at column 50
   Row 21 (y=168): ground spanning columns 0-52

The map now drives collision too. The code in Step 3 uses :func:`mget` to read the tile under the
player and :func:`fget` to check whether that tile has the solid, deadly, or end flag.

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

   -- Player dimensions: 1 tile wide, 1 tile tall (8x8 px)
   PLAYER_W = 8
   PLAYER_H = 8

   -- Tilemap settings
   TILE_SIZE  = 8
   MAP_W      = 128
   MAP_H      = 32
   SPRITE_COUNT = 256
   FLAG_SOLID = 0
   FLAG_KILL  = 1
   FLAG_END   = 2

.. note::

   ``MAP_W`` and ``MAP_H`` match the default map size in tiles. ``FLAG_SOLID = 0`` means "check
   bit 0 on the sprite's flags." ``FLAG_KILL`` and ``FLAG_END`` work the same way with bits ``1``
   and ``2``. The sprite index itself comes from the map with :func:`mget`, so you do not need to
   list every platform, hazard, or goal in code. ``SPRITE_COUNT`` keeps :func:`fget` calls inside
   the sprite sheet's valid ``0`` to ``255`` range.

Helper functions
----------------

.. code-block:: lua

   function clamp(v, lo, hi)
     if v < lo then return lo end
     if v > hi then return hi end
     return v
   end

   function tile_has_flag(tx, ty, flag)
     if tx < 0 or tx >= MAP_W or ty < 0 or ty >= MAP_H then
       return false
     end

     local sprite_index = mget(tx, ty)
     if type(sprite_index) ~= "number" then
       return false
     end

     if sprite_index < 0 or sprite_index >= SPRITE_COUNT then
       return false
     end

     return fget(sprite_index, flag)
   end

   function is_solid_tile(tx, ty)
     return tile_has_flag(tx, ty, FLAG_SOLID)
   end

   function player_touching_flag(flag)
     local left_tile   = math.floor(player.x / TILE_SIZE)
     local right_tile  = math.floor((player.x + PLAYER_W - 1) / TILE_SIZE)
     local top_tile    = math.floor(player.y / TILE_SIZE)
     local bottom_tile = math.floor((player.y + PLAYER_H - 1) / TILE_SIZE)

     for ty = top_tile, bottom_tile do
       for tx = left_tile, right_tile do
         if tile_has_flag(tx, ty, flag) then
           return true
         end
       end
     end

     return false
   end

Initialization
--------------

.. code-block:: lua

   player = {}
   anim_timer = 0
   game_finished = false

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
     game_finished = false
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
       local bottom_tile = math.floor((player.y + PLAYER_H) / TILE_SIZE)

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
       respawn_player()
     end
   end

Special tiles
-------------

.. code-block:: lua

   function respawn_player()
     player.x         = 24
     player.y         = 40
     player.vx        = 0
     player.vy        = 0
     player.on_ground = false
     player.anim_frame = SPRITE_IDLE
   end

   function win_game()
     if game_finished then
       return
     end

     game_finished = true
     player.vx     = 0
     player.vy     = 0

     -- The current text output is the output panel.
     print("You Won")
   end

   function check_special_tiles()
     if player_touching_flag(FLAG_KILL) then
       respawn_player()
       return
     end

     if player_touching_flag(FLAG_END) then
       win_game()
     end
   end

Game loop
---------

.. code-block:: lua

   function _update()
     if game_finished then
       return
     end

     handle_input()
     move_x()
     move_y()
     check_special_tiles()

     if game_finished then
       return
     end

     update_animation()
   end

   function draw_player()
     sprite(player.anim_frame, player.x, player.y, 1, 1)
   end

   function _draw()
     camera(clamp(player.x - 160, 0, MAP_W * TILE_SIZE - 320), 0)
     clear(12)
     map(0, 0)
     draw_player()
   end

.. note::

   ``print("You Won")`` writes to the output panel. Once ``game_finished`` is ``true``,
   ``_update()`` returns immediately, so player input, gravity, and collision stop running.

How it all fits together
========================

::

   Sprite Editor          Map Editor              Lua Script
   ----------------       ----------------        --------------------------
   index 0 = idle         Paint sprite 32         map(0,0) renders the
   index 1 = walk 1       wherever the player     tilemap.
   index 2 = walk 2       should collide.
   index 3 = jump                                 mget() reads tile indexes.
   index 32 = solid       The painted map is      fget() checks flag bits:
   index 33 = deadly      the collision data.     0 = solid
   index 34 = end tile                            1 = deadly
   flag bits 0, 1, 2                              2 = end tile

Extending the example
=====================

- **Add coins** -- Paint coin tiles on the map; give them a different sprite flag bit; use
  ``mget()`` and ``fget()`` to detect them.
- **Add enemies** -- Add an ``enemies`` table; update positions each frame; use ``sprite()``
  to draw them.
- **Bigger player** -- Draw a 2x2 sprite and call ``sprite(index, x, y, 2, 2)``.
- **Animate tiles** -- Use ``set_col`` to tint selected colors each frame.
- **Level restart** -- Track a ``lives`` variable; reset player on death.
