-- What SOUND decided
SFX_ZAP    = 0   -- the SFX slot that holds the zap
MUSIC_MAIN = 0   -- the music, as the # field shows it

-- Game loop

function _init()
  music_on = true
  sound.play_music(MUSIC_MAIN)      -- loops by default
end

function _update()
  if input.btnp("a") then
    sound.play_sfx(SFX_ZAP)
  end

  if input.btnp("pause") then
    if music_on then
      sound.stop_music(0.5)         -- fades out over half a second
    else
      sound.play_music(MUSIC_MAIN)  -- from its first pattern
    end
    music_on = not music_on
  end
end

function _draw()
  gfx.clear(0)

  local place, step = sound.music_position()
  if place == nil then
    gfx.print("NO MUSIC", 10, 10, 3)
    return
  end

  -- Four steps to a beat. The step is rounded up, so it reads 16 at the very
  -- end of a bar; math.min keeps the fourth box lit until the next bar begins.
  local beat = math.min(step // 4, 3)
  for i = 0, 3 do
    local colour = 15                    -- dark blue
    if i == beat then colour = 4 end     -- yellow on the beat
    gfx.fill_rect(10 + i * 20, 30, 16, 16, colour)
  end

  gfx.print("PATTERN " .. place .. "  STEP " .. step, 10, 10, 5)
end
