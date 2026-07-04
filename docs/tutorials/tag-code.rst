===========================
Tag Arena -- complete code
===========================

The finished script from the :doc:`tag` tutorial, ready to compare against your own build.

.. code-block:: lua

   -- ============================================================
   -- Constants and local state
   -- ============================================================

   W, H         = 320, 180
   PLAYER_SIZE  = 8
   SPEED        = 2
   IT_SPEED     = 2.4          -- "it" runs slightly faster
   TAG_COOLDOWN = 60           -- frames before "it" can tag again (one second)

   COL_BG  = 0                 -- black
   COL_IT  = 8                 -- red
   COLORS  = { 12, 11, 10, 14 }-- blue, green, yellow, pink

   state        = "menu"       -- "menu" | "waiting" | "playing" | "over"
   is_host      = false
   next_color   = 1            -- host only
   tag_cooldown = 0            -- host only
   taunt_timer  = 0

   function _init()
     state        = "menu"
     is_host      = false
     next_color   = 1
     tag_cooldown = 0
     taunt_timer  = 0
     print("Press H to host a game, J to join one")
   end

   function clamp(v, lo, hi)
     if v < lo then return lo end
     if v > hi then return hi end
     return v
   end

   function overlaps(a, b)
     return a.x < b.x + PLAYER_SIZE and a.x + PLAYER_SIZE > b.x
        and a.y < b.y + PLAYER_SIZE and a.y + PLAYER_SIZE > b.y
   end

   -- ============================================================
   -- Session menu (same shape as the Pong tutorial)
   -- ============================================================

   function update_menu()
     if key_pressed("h") then
       state   = "waiting"
       is_host = true
       net.host({ max_players = 4, title = "Tag arena" }, on_connected)
     elseif key_pressed("j") then
       state   = "waiting"
       is_host = false
       net.join(on_connected)
     end
   end

   function update_waiting()
     if key_pressed("m") then
       state = "menu"
       print("Press H to host a game, J to join one")
     end
   end

   -- ============================================================
   -- Session setup: host provisions players and declares itself "it"
   -- ============================================================

   function provision_player(playerId)
     local entry = {
       x   = math.random(8, W - 8 - PLAYER_SIZE),
       y   = math.random(8, H - 8 - PLAYER_SIZE),
       col = COLORS[next_color],
     }
     next_color = next_color % #COLORS + 1

     -- The first entry has to create the players branch (see the net.state
     -- reference); later ones write through it
     if net.state.players then
       net.state.players[playerId] = entry
     else
       net.state.players = { [playerId] = entry }
     end
   end

   function on_connected()
     if is_host then
       provision_player(net.id())
       net.state.it = net.id()

       net.on("peer.joined", function(playerId)
         provision_player(playerId)
         print("Player " .. playerId .. " joined the arena")
       end)

       net.on("peer.left", function(playerId)
         net.state.players[playerId] = nil
         if net.state.it == playerId then
           net.state.it = net.id()   -- "it" left: the host takes over
         end
         print("Player " .. playerId .. " left")
       end)
     end

     -- Everyone announces tags by listening to the shared "it" key
     net.on("it", function(path, value)
       if value == net.id() then
         print("You are it! Catch someone!")
       else
         print("Player " .. value .. " is it -- run!")
       end
     end)

     net.on("event:taunt", function(from)
       print("Player " .. from .. " taunts you!")
     end)

     net.on("ended", function()
       state = "over"
       print("The host closed the session. Press M for the menu.")
     end)

     state = "playing"
     print("Connected as player " .. net.id() .. " (arrow keys; SPACE to taunt).")
   end

   -- ============================================================
   -- Movement and taunting
   -- ============================================================

   function my_player()
     local players = net.state.players
     if not players then
       return nil
     end
     return players[net.id()]
   end

   function update_movement()
     local me = my_player()
     if not me then
       return   -- not provisioned yet
     end

     local speed = SPEED
     if net.state.it == net.id() then
       speed = IT_SPEED
     end

     if key_pressed("ArrowLeft")  then me.x = me.x - speed end
     if key_pressed("ArrowRight") then me.x = me.x + speed end
     if key_pressed("ArrowUp")    then me.y = me.y - speed end
     if key_pressed("ArrowDown")  then me.y = me.y + speed end

     me.x = clamp(me.x, 0, W - PLAYER_SIZE)
     me.y = clamp(me.y, 0, H - PLAYER_SIZE)
   end

   function update_taunt()
     taunt_timer = taunt_timer - 1

     if key_pressed(" ") and taunt_timer <= 0 then
       taunt_timer = 60   -- once per second at most
       net.emit("taunt")
       print("You taunt everyone!")
     end
   end

   -- ============================================================
   -- Tagging: the host is the referee
   -- ============================================================

   function update_tagging()
     if tag_cooldown > 0 then
       tag_cooldown = tag_cooldown - 1
       return
     end

     local players = net.state.players
     if not players then
       return
     end

     local it = players[net.state.it]
     if not it then
       return
     end

     for id, p in pairs(players) do
       if tonumber(id) ~= net.state.it and overlaps(it, p) then
         net.state.it = tonumber(id)   -- everyone's "it" listener fires
         tag_cooldown = TAG_COOLDOWN
         break
       end
     end
   end

   -- ============================================================
   -- Game loop
   -- ============================================================

   function update_playing()
     update_movement()
     update_taunt()

     if is_host then
       update_tagging()
     end
   end

   function _update()
     if state == "menu" then
       update_menu()
     elseif state == "waiting" then
       update_waiting()
     elseif state == "playing" then
       update_playing()
     elseif state == "over" and key_pressed("m") then
       net.leave()
       _init()
     end
   end

   -- ============================================================
   -- Drawing
   -- ============================================================

   function draw_players()
     for id, p in pairs(net.state.players or {}) do
       fill_rect(p.col, p.x, p.y, PLAYER_SIZE, PLAYER_SIZE)

       if tonumber(id) == net.state.it then
         rect(COL_IT, p.x - 2, p.y - 2, PLAYER_SIZE + 4, PLAYER_SIZE + 4)
       end
     end
   end

   function _draw()
     clear(COL_BG)

     if state == "playing" or state == "over" then
       draw_players()

       -- Red arena border when you are the one chasing
       if net.state.it == net.id() then
         rect(COL_IT, 0, 0, W, H)
       end
     else
       for i = 1, #COLORS do
         fill_rect(COLORS[i], 60 * i + 20, (H - PLAYER_SIZE) / 2, PLAYER_SIZE, PLAYER_SIZE)
       end
     end
   end
