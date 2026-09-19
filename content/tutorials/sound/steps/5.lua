-- What SOUND decided
SFX_ZAP    = 0   -- the SFX slot that holds the zap
MUSIC_MAIN = 0   -- the music, as the # field shows it

-- Game loop

function _init()
  music_on = true
  sound.play_music(MUSIC_MAIN)
end

function _update()
  if input.pressed("a") then
    sound.play_sfx(SFX_ZAP)
  end

  if input.pressed("pause") then
    if music_on then
      sound.stop_music(0.5)
    else
      sound.play_music(MUSIC_MAIN)
    end
    music_on = not music_on
  end
end

function _draw()
  gfx.clear(0)

  local place, step = sound.music_pos()
  if place == nil then
    gfx.print("NO MUSIC", 10, 30, 3)
    return
  end

  -- Four steps to a beat, and the step counts from 0: 0 to 3 is the first beat.
  local beat = step // 4
  for i = 0, 3 do
    local colour = 15                    -- dark blue
    if i == beat then colour = 4 end     -- yellow on the beat
    gfx.fill_rect(10 + i * 20, 50, 16, 16, colour)
  end

  gfx.print("PATTERN " .. place .. "  STEP " .. step, 10, 30, 5)
end
