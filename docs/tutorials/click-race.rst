=====================
Build a Coin Rush
=====================

Up to four players race to collect coins scattered on the screen -- first to ten wins. When
two players touch the same coin on the same frame, only one may get the point: this tutorial
is all about :func:`net.lock` (settling races fairly) and :func:`net.queue` (feeding respawn
work to the host). Do the :doc:`/tutorials/pong` tutorial first; this one moves faster over
the parts they share.

What you will build
===================

- A host/join menu for up to **four** players
- One colored square per player, moved with the arrow keys
- Coins that only **one** player can collect, no matter how simultaneous the grab
  (``net.lock``)
- A respawn work queue processed by the host (``net.queue``)
- Per-player scores and a first-to-ten win

Everything is drawn with :func:`fill_rect` and :func:`rect` -- no sprites needed.

Step 1: Constants and the session menu
======================================

.. code-block:: lua

   W, H        = 320, 180
   PLAYER_SIZE = 8
   COIN_SIZE   = 4
   SPEED       = 2
   COIN_COUNT  = 5
   WIN_SCORE   = 10
   RESPAWN_DELAY = 120           -- frames (two seconds at 60 FPS)

   COL_BG    = 0                 -- black
   COL_COIN  = 10                -- yellow
   COLORS    = { 8, 12, 11, 14 } -- red, blue, green, pink

   state         = "menu"        -- "menu" | "waiting" | "playing" | "over"
   is_host       = false
   next_color    = 1             -- host only: next entry of COLORS to hand out
   respawn_timer = 0             -- host only
   claiming      = {}            -- coins we already have a pending lock request for

   function _init()
     state      = "menu"
     is_host    = false
     next_color = 1
     respawn_timer = 0
     claiming   = {}
     print("Press H to host a game, J to join one")
   end

   function clamp(v, lo, hi)
     if v < lo then return lo end
     if v > hi then return hi end
     return v
   end

   function update_menu()
     if key_pressed("h") then
       state   = "waiting"
       is_host = true
       net.host({ max_players = 4, title = "Coin rush" }, on_connected)
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

Step 2: The host provisions every player
========================================

In Pong each player wrote its own paddle from the start. With four players and host-assigned
colors it is cleaner to flip the pattern: **the host creates each player's entry** (spawn
position, color, score) -- for itself at session start and for the others in ``peer.joined``.
A joiner simply waits until its own entry appears in ``net.state``, then starts moving it.

This also handles players joining **mid-game**: a late joiner receives the full current state,
and the host's ``peer.joined`` provisions them a square like everyone else.

.. code-block:: lua

   function provision_player(playerId)
     local entry = {
       x     = math.random(8, W - 8 - PLAYER_SIZE),
       y     = math.random(8, H - 8 - PLAYER_SIZE),
       col   = COLORS[next_color],
       score = 0,
     }
     next_color = next_color % #COLORS + 1

     -- A net.state branch only exists once it holds a value, so the first
     -- player entry must create the branch itself
     if net.state.players then
       net.state.players[playerId] = entry
     else
       net.state.players = { [playerId] = entry }
     end
   end

   function new_coin()
     return {
       x     = math.random(8, W - 8 - COIN_SIZE),
       y     = math.random(8, H - 8 - COIN_SIZE),
       taken = false,
     }
   end

   function on_connected()
     if is_host then
       provision_player(net.id())

       local coins = {}
       for i = 1, COIN_COUNT do
         coins[i] = new_coin()
       end
       net.state.coins = coins

       net.on("peer.joined", function(playerId)
         provision_player(playerId)
         print("Player " .. playerId .. " joined")
       end)

       net.on("peer.left", function(playerId)
         net.state.players[playerId] = nil
         print("Player " .. playerId .. " left")
       end)
     end

     net.on("ended", function()
       state = "over"
       print("The host closed the session. Press M for the menu.")
     end)

     state = "playing"
     print("Connected! Collect " .. WIN_SCORE .. " coins to win (arrow keys).")
   end

.. note::

   Collected coins are *marked* ``taken`` rather than deleted. Keeping all ``COIN_COUNT``
   entries alive means the ``coins`` branch always exists and every index stays valid -- one
   less ``nil`` case everywhere else in the game.

Step 3: Moving your square
==========================

Each player writes only its own entry -- but here that entry is *created by the host*, so a
freshly joined player just returns until it appears.

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
       return   -- the host has not provisioned us yet
     end

     if key_pressed("ArrowLeft")  then me.x = me.x - SPEED end
     if key_pressed("ArrowRight") then me.x = me.x + SPEED end
     if key_pressed("ArrowUp")    then me.y = me.y - SPEED end
     if key_pressed("ArrowDown")  then me.y = me.y + SPEED end

     me.x = clamp(me.x, 0, W - PLAYER_SIZE)
     me.y = clamp(me.y, 0, H - PLAYER_SIZE)
   end

Step 4: Collecting coins with a lock
====================================

Here is the race: two players overlap coin ``3`` on the same frame and both try to take it.
Without protection, both would see an untaken coin, both would mark it, and both would score.

``net.lock("coin.3")`` settles it. Lock requests are granted one peer at a time, so the code
inside ``acquire`` runs exclusively: the first player finds the coin untaken, marks it, and
scores; the second finds ``taken`` already ``true`` and gets nothing.

.. code-block:: lua

   function overlaps_coin(me, coin)
     return me.x < coin.x + COIN_SIZE and me.x + PLAYER_SIZE > coin.x
        and me.y < coin.y + COIN_SIZE and me.y + PLAYER_SIZE > coin.y
   end

   function try_collect(i)
     if claiming[i] then
       return   -- we already have a pending request for this coin
     end
     claiming[i] = true

     net.lock("coin." .. i).acquire(function(release)
       claiming[i] = false

       local coin = net.state.coins[i]
       if not coin.taken then             -- still there: it is ours
         coin.taken = true
         local me = my_player()
         me.score = me.score + 1
         net.queue("respawns").push(i)    -- ask the host for a replacement (Step 5)

         if me.score >= WIN_SCORE then
           net.state.winner = net.id()
         end
       end

       release()
     end)
   end

   function update_collect()
     local me    = my_player()
     local coins = net.state.coins
     if not me or not coins then
       return
     end

     for i = 1, COIN_COUNT do
       local coin = coins[i]
       if coin and not coin.taken and overlaps_coin(me, coin) then
         try_collect(i)
       end
     end
   end

.. note::

   Two details worth copying into your own games. The ``claiming`` table stops ``_update``
   from piling up a new lock request every frame while you stand on a coin. And the
   ``taken`` re-check inside ``acquire`` is the whole point of the lock: state may have
   changed between asking for the lock and receiving it.

Step 5: The host respawns coins from a queue
============================================

Collectors push the coin's index to the ``"respawns"`` queue; the host pops one every couple
of seconds and puts a fresh coin on the field. A queue fits perfectly: pushes from all players
line up in order, each item is delivered to exactly one popper, and ``pop`` on an empty queue
just hands the callback ``nil``.

.. code-block:: lua

   function update_respawns()
     respawn_timer = respawn_timer + 1
     if respawn_timer < RESPAWN_DELAY then
       return
     end
     respawn_timer = 0

     net.queue("respawns").pop(function(i)
       if i and not net.state.winner then
         net.state.coins[i] = new_coin()
       end
     end)
   end

Step 6: The game loop and drawing
=================================

.. code-block:: lua

   function update_playing()
     update_movement()
     update_collect()

     if is_host then
       update_respawns()
     end

     if net.state.winner then
       state = "over"
       if net.state.winner == net.id() then
         print("You win! Press M for the menu.")
       else
         print("Player " .. net.state.winner .. " wins. Press M for the menu.")
       end
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

Iterating ``net.state.players`` with ``pairs`` yields **string** keys -- convert with
``tonumber`` before comparing against ``net.id()``. Each player draws its score as a row of
small squares in its own color.

.. code-block:: lua

   function draw_players()
     local row = 0
     for id, p in pairs(net.state.players or {}) do
       fill_rect(p.col, p.x, p.y, PLAYER_SIZE, PLAYER_SIZE)

       if tonumber(id) == net.id() then
         rect(7, p.x - 2, p.y - 2, PLAYER_SIZE + 4, PLAYER_SIZE + 4)   -- highlight yourself
       end

       for i = 1, p.score do
         fill_rect(p.col, 4 + (i - 1) * 6, 4 + row * 8, 4, 4)
       end
       row = row + 1
     end
   end

   function draw_coins()
     local coins = net.state.coins
     if not coins then
       return
     end

     for i = 1, COIN_COUNT do
       local coin = coins[i]
       if coin and not coin.taken then
         fill_rect(COL_COIN, coin.x, coin.y, COIN_SIZE, COIN_SIZE)
       end
     end
   end

   function _draw()
     clear(COL_BG)

     if state == "playing" or state == "over" then
       draw_coins()
       draw_players()
     else
       -- Menu / waiting: show one square per possible player
       for i = 1, #COLORS do
         fill_rect(COLORS[i], 60 * i + 20, (H - PLAYER_SIZE) / 2, PLAYER_SIZE, PLAYER_SIZE)
       end
     end
   end

Step 7: Prove the lock works
============================

Host on one machine, join on another, and park both squares on the same coin. Exactly one
score goes up, every time. Then remove the lock -- run the body of ``try_collect`` directly --
and repeat: sooner or later both players score off the same coin. That double-collect is the
race the lock removes.

How it all fits together
========================

.. code-block:: text

   Any player                    Host
   ----------------------        --------------------------------
   moves own players.<id>        provisions players on peer.joined
   sees a coin, wants it         cleans them up on peer.left
     |
     v
   net.lock("coin.i")   ---->    grants requests one at a time
     winner: taken = true,
     score + 1,
     push i to "respawns" ---->  pops one index every 2 s,
     loser: already taken,          respawns that coin
     does nothing

Extending the example
=====================

- **Bonus coins** -- store a ``value`` on each coin and add it to the score.
- **Sudden death** -- host shortens ``RESPAWN_DELAY`` as scores climb.
- **Announcements** -- ``net.emit("stolen", i)`` when you snatch a coin someone was standing
  on.
- **Round timer** -- host counts frames down in ``net.state.time_left``; highest score wins
  at zero.
