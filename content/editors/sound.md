---
title: Sound Editor
slug: editors/sound
section: editors
order: 4
description: The Sound Editor allows you to compose music for your game using a built-in
  sequencer powered by Tone.js.
legacy_slugs:
- editors/sound-editor.html
---

# Sound Editor

The Sound Editor allows you to compose music for your game using a built-in sequencer powered by Tone.js.

![Sound Editor](img/sound.png "The SOUND tab: instruments, the piano roll and the inspector.")

## Music slots

Projects include **16 music slots**. The buttons on the side of the Sound Editor switch between those slots so you can keep separate tracks for menus, levels, battles, or short jingles.

![The music panel](img/sound-music.png "MUSIC: a numbered song, its transport, and the grid of pattern numbers it plays.")

The editor labels slots as `1` through `16`. Lua uses zero-based indexes, so slot `1` is played with `sound.play_music(0)`, slot `2` with `sound.play_music(1)`, and so on.

## Sequencer grid

The grid has **24 note rows** and **32 columns**. Each column is a beat, and the current music plays at `240` BPM by default.

![The piano roll](img/sound-roll.png "The piano roll: pitches down the side, steps across, each note in its instrument's colour, the voices lane under it.")

- Click an empty cell to add a one-beat note with the selected instrument.
- Click an existing note start to remove it.
- Drag across cells in the same row to create a longer note.
- Use **Play** and **Stop** to preview the current music.
- Use **Clear** to reset the current slot.
- Click the progress bar while playback is stopped to choose where the next preview starts.

## Instruments

The built-in instruments are **Piano**, **Guitar**, **Flute**, **Trumpet**, **Contrabass**, and **Harmonica**.

![The instrument list](img/sound-instruments.png "INSTRUMENTS and, under them, the SFX SLOTS the game plays with sound.play_sfx.")

You can also create custom instruments. Custom instruments expose Tone.js synth parameters such as volume, detune, portamento, harmonicity, oscillator type, oscillator partials, and envelope settings. Custom instruments can be edited or deleted after creation.

![New instrument](img/sound-new-instrument.png "The + opens New instrument: a preset to start from, or a custom square wave.")

![Presets](img/sound-presets.png "The presets, by family. A card plays when it is clicked; CREATE makes the instrument under the preset's name.")

![The inspector](img/sound-inspector.png "The inspector: oscillator, envelope, modulation and filter, mix — every dial of the instrument in hand.")

## Using music in Lua

Use [[sound.play_music]] and [[sound.stop_music]] from your game code:

``` lua
function _init()
  sound.play_music(0)  -- plays Sound Editor slot 1
end

function _update()
  if input.key_pressed(" ") then
    sound.stop_music()
  end
end
```

See [sound](/learn/api/sound) for the Lua audio API reference.
