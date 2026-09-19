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
-- Game loop
-- ============================================================

function update_menu()
end

function update_waiting()
end

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
