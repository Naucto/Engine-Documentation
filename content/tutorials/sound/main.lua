-- What SOUND decided
SFX_ZAP    = 0   -- the sound effect, as the SFX menu shows it
MUSIC_MAIN = 0   -- the music, as the Timeline menu shows it

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

  local bar, beat = sound.music_pos()
  if bar == nil then
    gfx.print("NO MUSIC", 10, 30, 3)
    return
  end

  for i = 0, 3 do
    local colour = 15                    -- dark blue
    if i == beat then colour = 4 end     -- yellow on the beat
    gfx.fill_rect(10 + i * 20, 50, 16, 16, colour)
  end

  gfx.print("BAR " .. bar .. "  BEAT " .. beat, 10, 30, 5)
end
