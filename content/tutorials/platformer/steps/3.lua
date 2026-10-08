-- ============================================================
-- Constants
-- ============================================================

-- Change these to match your sprite sheet
SPRITE_IDLE   = 0
SPRITE_WALK_1 = 1
SPRITE_WALK_2 = 2
SPRITE_JUMP   = 3

-- Player dimensions: 1 tile wide, 1 tile tall (8x8 px)
PLAYER_W = 8
PLAYER_H = 8

-- Tilemap settings
TILE_SIZE  = 8
MAP_W      = 128
MAP_H      = 32
SPRITE_COUNT = 256
FLAG_SOLID = 0
FLAG_KILL  = 1
FLAG_END   = 2

-- ============================================================
-- Helpers: the map is the collision data
-- ============================================================

function clamp(v, lo, hi)
  if v < lo then return lo end
  if v > hi then return hi end
  return v
end

function tile_has_flag(tx, ty, flag)
  if tx < 0 or tx >= MAP_W or ty < 0 or ty >= MAP_H then
    return false
  end

  local sprite_index = map.get(tx, ty)
  if type(sprite_index) ~= "number" then
    return false
  end

  if sprite_index < 0 or sprite_index >= SPRITE_COUNT then
    return false
  end

  return map.flag(sprite_index, flag)
end

function is_solid_tile(tx, ty)
  return tile_has_flag(tx, ty, FLAG_SOLID)
end

function player_touching_flag(flag)
  local left_tile   = math.floor(player.x / TILE_SIZE)
  local right_tile  = math.floor((player.x + PLAYER_W - 1) / TILE_SIZE)
  local top_tile    = math.floor(player.y / TILE_SIZE)
  local bottom_tile = math.floor((player.y + PLAYER_H - 1) / TILE_SIZE)

  for ty = top_tile, bottom_tile do
    for tx = left_tile, right_tile do
      if tile_has_flag(tx, ty, flag) then
        return true
      end
    end
  end

  return false
end
