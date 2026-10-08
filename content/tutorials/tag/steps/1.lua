-- ============================================================
-- Constants and local state
-- ============================================================

W, H         = 320, 180
PLAYER_SIZE  = 8
SPEED        = 2
IT_SPEED     = 2.4          -- "it" runs slightly faster
TAG_COOLDOWN = 60           -- frames before "it" can tag again (one second)

COL_BG  = 0                 -- black
COL_IT  = 2                 -- red
COLORS  = { 11, 13, 4, 6 }  -- light blue, green, yellow, pink

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
  if input.key_pressed("h") then
    state   = "waiting"
    is_host = true
    net.host({ max_players = 4, title = "Tag arena" }, on_connected)
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
    net.host({ max_players = 4, title = "Tag arena" }, on_connected)
  elseif input.key_pressed("j") then
    is_host = false
    net.join(on_connected)
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
  print("Connected!")
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

  if input.key_pressed("ArrowLeft")  then me.x = me.x - speed end
  if input.key_pressed("ArrowRight") then me.x = me.x + speed end
  if input.key_pressed("ArrowUp")    then me.y = me.y - speed end
  if input.key_pressed("ArrowDown")  then me.y = me.y + speed end

  me.x = clamp(me.x, 0, W - PLAYER_SIZE)
  me.y = clamp(me.y, 0, H - PLAYER_SIZE)
end

-- ============================================================
-- Game loop
-- ============================================================

function update_playing()
  update_movement()
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
