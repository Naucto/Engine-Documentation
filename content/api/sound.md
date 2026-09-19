---
title: Audio
slug: api/sound
section: api
order: 4
description: The sound functions play the sound effects, notes and music made in the SOUND tab, and set the mixer levels.
legacy_slugs:
- api/audio.html
namespace: sound
---

# sound · Sound effects, notes and music

The SOUND tab writes instruments and patterns; the game plays them. A sound effect is a numbered slot the SFX bank points at a pattern; a music is a numbered song, a grid of patterns; a note is one pitch on one instrument, played from code. `set_volume` balances the three.

## The audio model

The synth has **five voices, numbered `0` to `4`**, and everything sounding is on one of them. Songs are numbered `0` to `15`, sound effect slots from `0` with no last one, and an instrument is named by the name the SOUND tab shows.

Music plays at priority 0, sound effects and notes at priority 1. A new sound takes the first free voice; when none is free it takes a voice from the music first, oldest first. Forcing a `channel` puts the whole sound on that one voice.

{{svg:img/voices.svg}}

> [!IMPORTANT]
> A browser plays nothing until the player has clicked or pressed a key on the game. Until then the last music command and the last sound effect are kept and start when sound is allowed; a held note is dropped.

## Sound effects

{{api:sound.play_sfx}}

![SFX SLOTS in the SOUND tab](../editors/img/sound-sfx.png "SFX SLOTS: the numbered slots, counted from 00; slots 00 and 01 hold a pattern each, 02 is drawn as current because it holds the pattern in front of you, and 03 onwards are free. sound.play_sfx(1) plays the pattern kept in slot 01.")

## Notes

A note plays on one of the five voices; name a channel to stop it or to keep two notes apart.

{{api:sound.play_note}}

{{api:sound.stop_note}}

## Music

A music loops from its start unless the code says otherwise: `loop` on [[sound.play_music]], or [[sound.set_music]] for that music.

{{api:sound.play_music}}

![MUSIC in the SOUND tab](../editors/img/sound-music.png "MUSIC: the # field picks the music, 0 here, and the grid holds the pattern numbers sound.play_music(0) plays left to right, then top to bottom.")

{{api:sound.stop_music}}

{{api:sound.music_pos}}

## Volume and state

{{api:sound.set_volume}}

{{api:sound.is_playing}}

{{api:sound.stop}}

## Changing sounds from code

The SOUND tab decides what an instrument, a pattern and a music are; a game may bend them while it runs. These three functions **change the sound for this run only**: the document is never written, and the next run starts from the tab's settings again, the way [[map.set]] changes a tile without touching the map. An instrument change lands from the next note on, a tempo or length change at the music's next step, a loop change at the music's next end. A sound effect already playing keeps the pattern it copied when it was triggered, so a tempo or length change reaches it from its next trigger.

{{api:sound.set_instrument}}

{{api:sound.set_pattern}}

{{api:sound.set_music}}
