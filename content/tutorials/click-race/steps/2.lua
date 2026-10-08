-- ============================================================
-- Constants and local state
-- ============================================================

W, H        = 320, 180
PLAYER_SIZE = 8
COIN_SIZE   = 4
SPEED       = 2
COIN_COUNT  = 5
WIN_SCORE   = 10
RESPAWN_DELAY = 120           -- frames (two seconds at 60 FPS)

COL_BG    = 0                 -- black
COL_COIN  = 4                 -- yellow
COL_RING  = 5                 -- white
COLORS    = { 2, 11, 13, 6 }  -- red, light blue, green, pink

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

-- ============================================================
-- Session menu (same shape as the Pong tutorial)
-- ============================================================

function update_menu()
  if input.key_pressed("h") then
    state   = "waiting"
    is_host = true
    net.host({ max_players = 4, title = "Coin rush" }, on_connected)
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
    net.host({ max_players = 4, title = "Coin rush" }, on_connected)
  elseif input.key_pressed("j") then
    is_host = false
    net.join(on_connected)
  end
end

-- ============================================================
-- Session setup: the host provisions players and coins
-- ============================================================

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
    lock  = net.lock(),   -- each coin guards itself; lives in net.state.coins[i]
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

    net.state.respawns = net.queue()   -- shared work queue, host pops from it

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
    print("The host closed the session.")
    _init()
  end)

  state = "playing"
  print("Connected! Collect " .. WIN_SCORE .. " coins to win (arrow keys).")
end

-- ============================================================
-- Game loop
-- ============================================================

function update_playing()
end

function _update()
  if state == "menu" then
    update_menu()
  elseif state == "waiting" then
    update_waiting()
  elseif state == "playing" then
    update_playing()
  elseif state == "over" and input.key_pressed("m") then
    net.leave()
    _init()
  end
end
