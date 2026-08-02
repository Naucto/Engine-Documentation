======================
Pong -- complete code
======================

The finished script from the :doc:`pong` tutorial, ready to compare against your own build.

.. code-block:: lua

   -- ============================================================
   -- Constants and local state
   -- ============================================================

   W, H       = 320, 180
   PAD_W      = 4
   PAD_H      = 28
   PAD_SPEED  = 3
   BALL_SIZE  = 4
   WIN_SCORE  = 5

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

   -- ============================================================
   -- Session menu
   -- ============================================================

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
     -- Cancelling a dialog fires no callback, so the game stays here. Let the
     -- player re-open host/join directly, or press M to return to the menu.
     if key_pressed("m") then
       state = "menu"
       print("Press H to host a game, J to join one")
     elseif key_pressed("h") then
       is_host = true
       net.host({ max_players = 2, title = "Pong" }, on_connected)
     elseif key_pressed("j") then
       is_host = false
       net.join(on_connected)
     end
   end

   -- ============================================================
   -- Session setup (runs once, on the successful host/join)
   -- ============================================================

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

   -- ============================================================
   -- Gameplay: own paddle, host-simulated ball
   -- ============================================================

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

   -- ============================================================
   -- Game loop
   -- ============================================================

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

   -- ============================================================
   -- Drawing (everything comes from net.state)
   -- ============================================================

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
