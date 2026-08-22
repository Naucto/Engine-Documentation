============================
Platformer -- complete code
============================

The finished script from the :doc:`platformer` tutorial, ready to compare against your own
build.

.. code-block:: lua

   -- ============================================================
   -- Constants
   -- ============================================================

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

   -- ============================================================
   -- Helpers: the map is the collision data
   -- ============================================================

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

   -- ============================================================
   -- Initialization
   -- ============================================================

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

   -- ============================================================
   -- Input
   -- ============================================================

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

   -- ============================================================
   -- Animation
   -- ============================================================

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

   -- ============================================================
   -- Movement and collision, one axis at a time
   -- ============================================================

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

   -- ============================================================
   -- Special tiles
   -- ============================================================

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

     -- Announce the win in the output panel
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

   -- ============================================================
   -- Game loop
   -- ============================================================

   function _update()
     if game_finished then
       return
     end

     handle_input()
     move_x()
     move_y()
     check_special_tiles()

     -- check_special_tiles may have just won the game this frame
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
