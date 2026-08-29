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
    state = "over"
    print("The host closed the session. Press M for the menu.")
  end)

  state = "playing"
  print("Connected! Collect " .. WIN_SCORE .. " coins to win (arrow keys).")
end

-- ============================================================
-- Movement
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
    return   -- the host has not provisioned us yet
  end

  if input.key_pressed("ArrowLeft")  then me.x = me.x - SPEED end
  if input.key_pressed("ArrowRight") then me.x = me.x + SPEED end
  if input.key_pressed("ArrowUp")    then me.y = me.y - SPEED end
  if input.key_pressed("ArrowDown")  then me.y = me.y + SPEED end

  me.x = clamp(me.x, 0, W - PLAYER_SIZE)
  me.y = clamp(me.y, 0, H - PLAYER_SIZE)
end

-- ============================================================
-- Collecting coins: one winner per coin, thanks to net.lock
-- ============================================================

function overlaps_coin(me, coin)
  return me.x < coin.x + COIN_SIZE and me.x + PLAYER_SIZE > coin.x
     and me.y < coin.y + COIN_SIZE and me.y + PLAYER_SIZE > coin.y
end

function try_collect(i)
  if claiming[i] then
    return   -- we already have a pending request for this coin
  end
  claiming[i] = true

  net.state.coins[i].lock.acquire(function(release)
    claiming[i] = false

    local coin = net.state.coins[i]
    if not coin.taken then             -- still there: it is ours
      coin.taken = true
      local me = my_player()
      me.score = me.score + 1
      net.state.respawns.push(i)       -- ask the host for a replacement

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

-- ============================================================
-- Respawns: a work queue processed by the host
-- ============================================================

function update_respawns()
  respawn_timer = respawn_timer + 1
  if respawn_timer < RESPAWN_DELAY then
    return
  end
  respawn_timer = 0

  net.state.respawns.pop(function(i)
    if i and not net.state.winner then
      net.state.coins[i] = new_coin()
    end
  end)
end

-- ============================================================
-- Game loop
-- ============================================================

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
  elseif state == "over" and input.key_pressed("m") then
    net.leave()
    _init()
  end
end

-- ============================================================
-- Drawing
-- ============================================================

function draw_players()
  local row = 0
  for id, p in pairs(net.state.players or {}) do
    gfx.fill_rect(p.x, p.y, PLAYER_SIZE, PLAYER_SIZE, p.col)

    if tonumber(id) == net.id() then
      gfx.rect(p.x - 2, p.y - 2, PLAYER_SIZE + 4, PLAYER_SIZE + 4, 7)   -- highlight yourself
    end

    for i = 1, p.score do
      gfx.fill_rect(4 + (i - 1) * 6, 4 + row * 8, 4, 4, p.col)
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
      gfx.fill_rect(coin.x, coin.y, COIN_SIZE, COIN_SIZE, COL_COIN)
    end
  end
end

function _draw()
  gfx.clear(COL_BG)

  if state == "playing" or state == "over" then
    draw_coins()
    draw_players()
  else
    -- Menu / waiting: show one square per possible player
    for i = 1, #COLORS do
      gfx.fill_rect(60 * i + 20, (H - PLAYER_SIZE) / 2, PLAYER_SIZE, PLAYER_SIZE, COLORS[i])
    end
  end
end
