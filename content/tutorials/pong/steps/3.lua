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
COL_LEFT  = 11   -- light blue
COL_RIGHT = 2    -- red
COL_BALL  = 5    -- white

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
  if input.key_pressed("h") then
    state   = "waiting"
    is_host = true
    net.host({ max_players = 2, title = "Pong" }, on_connected)
  elseif input.key_pressed("j") then
    state   = "waiting"
    is_host = false
    net.join(on_connected)
  end
end

function update_waiting()
  -- Cancelling a dialog fires no callback, so the game stays here. Let the
  -- player re-open host/join directly, or press M to return to the menu.
  if input.key_pressed("m") then
    state = "menu"
    print("Press H to host a game, J to join one")
  elseif input.key_pressed("h") then
    is_host = true
    net.host({ max_players = 2, title = "Pong" }, on_connected)
  elseif input.key_pressed("j") then
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
    print("The host closed the session.")
    _init()
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
-- Game loop
-- ============================================================

function update_playing()
end

function update_over()
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
