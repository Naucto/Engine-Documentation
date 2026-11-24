-- What SOUND decided
SFX_ZAP    = 0   -- the sound effect, as the SFX menu shows it
MUSIC_MAIN = 0   -- the music, as the Timeline menu shows it

-- Game loop

function _update()
  if input.pressed("a") then
    sound.play_sfx(SFX_ZAP)
  end
end

function _draw()
  gfx.clear(0)
end
