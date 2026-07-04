==================
Build a Tag Arena
==================

A four-player game of tag: everyone runs around the arena, one player is "it", and touching
someone passes it on. This tutorial focuses on playing with **more than two peers**: reacting
to :data:`net.state` changes with ``net.on``, handling players who join *mid-game*, and
cleaning up after players who leave. Do :doc:`/tutorials/pong` and :doc:`/tutorials/click-race`
first -- the menu and host-provisioning patterns come from there.

What you will build
===================

- A host/join menu for up to **four** players
- One colored square per player; whoever is "it" gets a red ring
- Host-refereed tagging, announced through a ``net.state`` change listener
- A taunt button using ``net.emit``
- Correct behavior when players join mid-game or leave (even the tagged one)

Everything is drawn with :func:`fill_rect` and :func:`rect` -- no sprites needed.

Step 1: Constants, menu, and helpers
====================================

The menu is the same state machine as in the previous tutorials.

.. code-block:: lua

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

Step 2: Session setup
=====================

The host provisions every player (the same idiom as Coin Rush), declares itself "it", and
referees the game. Players who join mid-game need no special code at all: they receive the
full current state on arrival, and the host's ``peer.joined`` gives them a square.

``peer.left`` shows why cleanup matters with more than two players: the departed player's
entry must go, and if they were "it", someone else (the host, simply) inherits it.

.. code-block:: lua

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

.. note::

   The tag announcement is a **state change listener**, not an event. The host only writes
   ``net.state.it``; every peer -- including the host itself -- hears about it through
   ``net.on("it", ...)``. State your facts, listen for changes: this keeps late joiners
   correct too, since they read the current ``it`` from the snapshot instead of missing an
   old event.

Step 3: Movement and taunting
=============================

Each player writes only its own entry. Whoever is "it" moves slightly faster -- a small
reward for the chaser. The taunt shows ``net.emit``: a one-shot message with no game-state
meaning, exactly what events are for. (Remember the sender does not receive its own event.)

.. code-block:: lua

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

Step 4: The host referees tags
==============================

Only the host decides who is "it" -- one referee means no arguments when two players see the
touch a frame apart. After each tag a short cooldown stops it from bouncing straight back.

.. code-block:: lua

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

Step 5: The game loop and drawing
=================================

.. code-block:: lua

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

Step 6: Play with three or four
===============================

1. Host on one machine (``H``), pick *public* visibility this time, and have two or three
   friends find the session in the join dialog's public list (``J``).
2. Let one player join **after** the game has been running: they appear instantly with the
   right positions and the right "it" -- that is the state snapshot doing its job.
3. Close the tab of the player who is "it": the host's ``peer.left`` removes their square and
   takes the "it" role back. Close the host's tab instead, and everyone else gets the
   ``"ended"`` message.

How it all fits together
========================

.. code-block:: text

   Every player                       Host only
   ---------------------------        -----------------------------
   writes own players.<id>.x/y        provisions players (join/mid-game)
   net.on("it", ...) announces        removes them on peer.left
   net.emit("taunt")  ------->        checks overlap with "it"
   draws all players,                 writes net.state.it on a tag
   ring around the "it"                 (replicates to everyone)

Extending the example
=====================

- **Freeze tag** -- tagged players stop moving until a teammate touches them; store a
  ``frozen`` flag per player, written by the host.
- **Score by survival** -- host counts the frames each player spends *not* being it in
  ``net.state.players.<id>.score``.
- **Obstacles** -- draw a wall layout with :func:`fill_rect` and block movement against it;
  keep the layout in constants so every client agrees.
- **Round timer** -- host counts down in ``net.state.time_left``; whoever is "it" at zero
  loses.
