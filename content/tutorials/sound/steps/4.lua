-- What SOUND decided
SFX_ZAP    = 0   -- the SFX slot that holds the zap
MUSIC_MAIN = 0   -- the music, as the # field shows it

-- Game loop

function _update()
  if input.pressed("a") then
    sound.play_sfx(SFX_ZAP)
  end
end

function _draw()
  gfx.clear(0)
end
