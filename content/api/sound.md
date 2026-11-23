---
title: Audio
slug: api/sound
section: api
order: 4
description: The sound functions play the sound effects, notes and music made in the SOUND tab, and set the mixer levels.
namespace: sound
---

# sound · Sound effects, notes and music

The SOUND tab writes instruments, patterns, musics and sound effects; the game plays them. A music is a numbered timeline of patterns, with its own tempo; a sound effect is a short phrase of its own at a number of the SFX window; a note is one pitch on one instrument, played from code. `set_volume` balances the three.

## The audio model

The synth has **five voices, numbered `0` to `4`**, and everything sounding is on one of them. Musics and sound effects are numbered from `0` with no last one, and an instrument is named by the name the SOUND tab shows.

Music plays at priority 0, sound effects and notes at priority 1, above it. A new sound takes the first free voice; when none is free it takes a voice from the music first, oldest first. Forcing a `channel` puts the whole sound on that one voice.

{{svg:img/voices.svg}}

> [!IMPORTANT]
> A browser plays nothing until the player has clicked or pressed a key on the game. Until then the last music command and the last sound effect are kept and start when sound is allowed; a note played with `sound.play_note` is dropped.

## Sound effects

{{api:sound.play_sfx}}

![The SFX window of the SOUND tab](../editors/img/sound-sfx.png "The SFX window: the SFX menu says which number is in front of you; sound.play_sfx(1) plays the sound effect at number 01.")

## Notes

A note plays on one of the five voices; name a channel to stop it or to keep two notes apart.

{{api:sound.play_note}}

{{api:sound.stop_note}}

## Music

A music loops unless the code says otherwise, `loop` on [[sound.play_music]] or [[sound.set_music]] for that music: at the loop's end it goes back to the loop's start, as the timeline marks them.

{{api:sound.play_music}}

![The timeline of the SOUND tab](../editors/img/sound-timeline.png "The timeline: the music menu picks the music, 00 here, and its blocks are the patterns sound.play_music(0) plays, bar after bar.")

{{api:sound.stop_music}}

{{api:sound.music_pos}}

## Volume and state

{{api:sound.set_volume}}

{{api:sound.is_playing}}

{{api:sound.stop}}

## Changing sounds from code

The SOUND tab decides what an instrument, a pattern and a music are; a game may bend them while it runs. These three functions **change the sound for this run only**: the saved game is never written, and the next run starts from the tab's settings again, the way [[map.set]] changes a tile without touching the map. An instrument change lands from the next note on, a tempo or length change at the music's next beat, a loop change at the loop's next end. Sound effects have their own tempo and length, which none of these change.

{{api:sound.set_instrument}}

{{api:sound.set_pattern}}

{{api:sound.set_music}}
