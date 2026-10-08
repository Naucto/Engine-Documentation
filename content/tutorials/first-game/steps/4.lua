-- What ART and MAP decided
SPRITE_PLAYER = 0
SPRITE_COIN   = 1
SPRITE_WALL   = 32
FLAG_SOLID    = 0

TILE_SIZE = 8
SPEED     = 2

-- Walls: the painted map is the collision data

function solid_at(px, py)
  local tx = math.floor(px / TILE_SIZE)
  local ty = math.floor(py / TILE_SIZE)
  return map.flag(map.get(tx, ty), FLAG_SOLID)
end

function can_stand(x, y)
  return not solid_at(x, y)
     and not solid_at(x + 7, y)
     and not solid_at(x, y + 7)
     and not solid_at(x + 7, y + 7)
end

-- Coins

function overlaps(a, b)
  return a.x < b.x + 8 and b.x < a.x + 8
     and a.y < b.y + 8 and b.y < a.y + 8
end

function collect_coins()
  for _, coin in ipairs(coins) do
    if not coin.taken and overlaps(player, coin) then
      coin.taken = true
      score = score + 1
    end
  end
end

-- Game loop

function _init()
  player = { x = 16, y = 16 }
  score  = 0
  coins  = {
    { x = 40,  y = 24,  taken = false },
    { x = 280, y = 24,  taken = false },
    { x = 120, y = 88,  taken = false },
    { x = 232, y = 104, taken = false },
    { x = 40,  y = 152, taken = false },
  }
end

function _update()
  local dx, dy = 0, 0
  if input.held("left")  then dx = -SPEED end
  if input.held("right") then dx = SPEED end
  if input.held("up")    then dy = -SPEED end
  if input.held("down")  then dy = SPEED end

  if can_stand(player.x + dx, player.y) then
    player.x = player.x + dx
  end
  if can_stand(player.x, player.y + dy) then
    player.y = player.y + dy
  end

  collect_coins()
end

function _draw()
  gfx.clear(0)
  map.draw(0, 0)

  for _, coin in ipairs(coins) do
    if not coin.taken then
      gfx.draw_sprite(SPRITE_COIN, coin.x, coin.y)
    end
  end
  gfx.draw_sprite(SPRITE_PLAYER, player.x, player.y)

  gfx.print("SCORE " .. score, 10, 10, 5)
end
