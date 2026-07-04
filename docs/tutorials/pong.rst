========================
Build Multiplayer Pong
========================

This tutorial builds a complete two-player online Pong: one player hosts, a friend joins, and
each controls a paddle on their own machine. It is the best place to start with the ``net``
API -- read the :doc:`/multiplayer` concepts page first if you have not.

What you will build
===================

- A menu where the player chooses to **host** or **join** a session
- Two paddles, each controlled by its own player, shared through ``net.state``
- A ball simulated by the host and replicated to the other player
- A score, point announcements via ``net.emit``, and a win condition
- Clean handling of the opponent leaving

No sprites or map are needed -- the whole game is drawn with :func:`fill_rect` and
:func:`rect`, so you can go straight to the **Code Editor**.

Step 1: Constants and game state
================================

The game is a small state machine around the session: ``"menu"`` until a player chooses a
role, ``"waiting"`` while the platform dialog is open, ``"playing"`` once connected, and
``"over"`` when someone wins or the session ends.

.. code-block:: lua

   -- Screen and objects
   W, H       = 320, 180
   PAD_W      = 4
   PAD_H      = 28
   PAD_SPEED  = 3
   BALL_SIZE  = 4
   WIN_SCORE  = 5

   -- Palette colors
   COL_BG    = 0    -- black
   COL_LEFT  = 12   -- blue
   COL_RIGHT = 8    -- red
   COL_BALL  = 7    -- white

   state   = "menu"   -- "menu" | "waiting" | "playing" | "over"
   is_host = false
   side    = nil      -- "left" (host) or "right" (joiner)

   function _init()
     state   = "menu"
     is_host = false
     side    = nil
     print("Press H to host a game, J to join one")
   end

   function clamp(v, lo, hi)
     if v < lo then return lo end
     if v > hi then return hi end
     return v
   end

.. note::

   There is no on-canvas text API, so menus and announcements go to the **output panel** with
   :func:`print`.

Step 2: Hosting and joining
===========================

``net.host`` and ``net.join`` open a platform dialog and return immediately; the callback
fires only if the session is actually created or joined. We switch to ``"waiting"`` *before*
calling them so the call cannot repeat on the next frame -- calling ``net.host`` again while
the dialog is open raises an error.

.. code-block:: lua

   function update_menu()
     if key_pressed("h") then
       state   = "waiting"
       is_host = true
       net.host({ max_players = 2, title = "Pong" }, on_connected)
     elseif key_pressed("j") then
       state   = "waiting"
       is_host = false
       net.join(on_connected)
     end
   end

   function update_waiting()
     -- If the player cancelled the dialog, the callback never fires:
     -- let them return to the menu.
     if key_pressed("m") then
       state = "menu"
       print("Press H to host a game, J to join one")
     end
   end

Step 3: Setting up the shared state
===================================

The host owns everything global: it creates the paddles, the score, and the ball in
``net.state``, and it subscribes to ``peer.joined`` / ``peer.left`` to pause the ball while it
has no opponent. Both sides subscribe to ``"ended"`` (the session dies when the host leaves)
and to the ``"point"`` event used in Step 5.

.. code-block:: lua

   function on_connected()
     side = is_host and "left" or "right"

     if is_host then
       net.state.pads    = { left = (H - PAD_H) / 2, right = (H - PAD_H) / 2 }
       net.state.score   = { left = 0, right = 0 }
       net.state.playing = false
       reset_ball(1)

       net.on("peer.joined", function(playerId)
         net.state.playing = true
         print("Player " .. playerId .. " joined -- game on!")
       end)

       net.on("peer.left", function(playerId)
         net.state.playing = false
         print("Player " .. playerId .. " left -- waiting for a new opponent")
       end)
     end

     net.on("event:point", function(from, scorer)
       print("Point for the " .. scorer .. " side!")
     end)

     net.on("ended", function()
       state = "over"
       print("The host closed the session. Press M for the menu.")
     end)

     state = "playing"
     print("Connected! You are the " .. side .. " paddle (arrow keys).")
   end

   function reset_ball(direction)
     net.state.ball = {
       x  = (W - BALL_SIZE) / 2,
       y  = (H - BALL_SIZE) / 2,
       dx = 2 * direction,
       dy = 1.5,
     }
   end

.. note::

   Assigning a whole table (``net.state.ball = { ... }``) replaces that subtree in one go --
   handy for (re)initialization. For per-frame updates we will write individual fields
   instead.

Step 4: Moving your own paddle
==============================

Ownership convention in action: each player writes **only its own** paddle key and merely
reads the other one. The joiner may run a frame or two before the host's state has replicated
to it, so every read is guarded with a ``nil`` check.

.. code-block:: lua

   function update_paddle()
     local pads = net.state.pads
     if not pads then
       return   -- state not replicated yet
     end

     local y = pads[side]
     if key_pressed("ArrowUp") then
       y = y - PAD_SPEED
     end
     if key_pressed("ArrowDown") then
       y = y + PAD_SPEED
     end

     pads[side] = clamp(y, 0, H - PAD_H)
   end

Step 5: The host simulates the ball
===================================

Only the host runs ball physics; the other player just reads the replicated ball. Note that
``net.state.ball`` returns a *live view*: writing ``ball.x`` goes straight into shared state.

When a point is scored the host updates the score, tells the other player with ``net.emit``
(remember: the sender does not receive its own event, hence the local :func:`print`), and
serves toward the player who conceded.

.. code-block:: lua

   function update_ball()
     if not net.state.playing or net.state.winner then
       return
     end

     local ball = net.state.ball
     local pads = net.state.pads

     ball.x = ball.x + ball.dx
     ball.y = ball.y + ball.dy

     -- Bounce off the top and bottom
     if ball.y <= 0 or ball.y >= H - BALL_SIZE then
       ball.dy = -ball.dy
     end

     -- Bounce off the paddles
     if ball.dx < 0 and ball.x <= 8 + PAD_W
        and ball.y + BALL_SIZE >= pads.left and ball.y <= pads.left + PAD_H then
       ball.dx = -ball.dx
     elseif ball.dx > 0 and ball.x + BALL_SIZE >= W - 8 - PAD_W
        and ball.y + BALL_SIZE >= pads.right and ball.y <= pads.right + PAD_H then
       ball.dx = -ball.dx
     end

     -- Out on the left: right scores (and vice versa)
     if ball.x < -BALL_SIZE then
       score_point("right", 1)
     elseif ball.x > W then
       score_point("left", -1)
     end
   end

   function score_point(scorer, serve_direction)
     net.state.score[scorer] = net.state.score[scorer] + 1
     net.emit("point", scorer)
     print("Point for the " .. scorer .. " side!")

     if net.state.score[scorer] >= WIN_SCORE then
       net.state.winner = scorer
     else
       reset_ball(serve_direction)
     end
   end

Step 6: The game loop
=====================

``_update`` dispatches on the game state. Both players watch ``net.state.winner`` -- the host
writes it, everyone reacts to it.

.. code-block:: lua

   function update_playing()
     update_paddle()

     if is_host then
       update_ball()
     end

     if net.state.winner then
       state = "over"
       print("The " .. net.state.winner .. " side wins! Press M for the menu.")
     end
   end

   function update_over()
     if key_pressed("m") then
       net.leave()
       _init()
     end
   end

   function _update()
     if state == "menu" then
       update_menu()
     elseif state == "waiting" then
       update_waiting()
     elseif state == "playing" then
       update_playing()
     elseif state == "over" then
       update_over()
     end
   end

.. note::

   ``net.leave()`` is safe to call even when the session already ended -- after an ``"ended"``
   callback it simply does nothing, so ``update_over`` works for both exits.

Step 7: Drawing
===============

Everything drawn comes from ``net.state``, so both screens always show the same game. The
guards matter on the joiner's side: right after connecting, the shared state may not have
arrived yet.

.. code-block:: lua

   function draw_score()
     local score = net.state.score
     if not score then
       return
     end

     for i = 1, score.left do
       fill_rect(COL_LEFT, 8 + (i - 1) * 6, 6, 4, 4)
     end
     for i = 1, score.right do
       fill_rect(COL_RIGHT, W - 8 - (i - 1) * 6 - 4, 6, 4, 4)
     end
   end

   function draw_game()
     local pads = net.state.pads
     local ball = net.state.ball

     if pads then
       fill_rect(COL_LEFT, 8, pads.left, PAD_W, PAD_H)
       fill_rect(COL_RIGHT, W - 8 - PAD_W, pads.right, PAD_W, PAD_H)
     end

     if ball and net.state.playing and not net.state.winner then
       fill_rect(COL_BALL, ball.x, ball.y, BALL_SIZE, BALL_SIZE)
     end

     draw_score()
   end

   function _draw()
     clear(COL_BG)

     if state == "playing" then
       draw_game()
     elseif state == "over" and net.state.winner then
       -- Fill the screen with the winner's color
       local col = net.state.winner == "left" and COL_LEFT or COL_RIGHT
       fill_rect(col, 0, 0, W, H)
     else
       -- Menu / waiting: a centered "net" between two idle paddles
       fill_rect(COL_LEFT, 8, (H - PAD_H) / 2, PAD_W, PAD_H)
       fill_rect(COL_RIGHT, W - 8 - PAD_W, (H - PAD_H) / 2, PAD_W, PAD_H)
       for y = 0, H - 8, 12 do
         fill_rect(5, W / 2 - 1, y, 2, 8)
       end
     end
   end

Step 8: Play it
===============

1. **Run the game** and press ``H``. The platform's host dialog opens: pick a title, choose
   *invite code* visibility, and confirm. Share the code with your opponent.
2. On another machine (or browser), your opponent runs the same project, presses ``J``, and
   enters the code -- or finds the session in the public list if you chose *public*.
3. As soon as they join, the host's ``peer.joined`` fires, ``net.state.playing`` flips to
   ``true``, and the ball starts moving on both screens.

How it all fits together
========================

.. code-block:: text

   Host machine                          Joiner machine
   --------------------------            --------------------------
   net.host{max_players = 2}   ------>   net.join()  (invite code)
   owns: ball, score, playing            owns: pads.right only
   writes pads.left                      reads ball, score, pads.left
   simulates the ball          ------>   draws the replicated ball
   net.emit("point", ...)      ------>   net.on("event:point", ...)
   sets net.state.winner       ------>   sees winner, shows "over"

Extending the example
=====================

- **Rematch** -- on the "over" screen, let the host reset the score and ball instead of
  leaving.
- **Faster rallies** -- increase ``ball.dx`` slightly on each paddle bounce.
- **Spin** -- adjust ``ball.dy`` based on where the ball hits the paddle.
- **Sound** -- call :func:`play_music` on ``event:point`` if your project has music slots.
