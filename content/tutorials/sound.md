---
title: Make it sound
slug: tutorials/sound
lua: sound/main.lua
section: tutorials
order: 3
description: Give a game a music that starts with the first frame and a zap on a key press, with an instrument from a preset, two patterns chained in the MUSIC grid, an SFX slot and a dozen lines of Lua.
---

# Make it sound

This tutorial gives a game its first sounds: a short loop that starts with the game, a zap on a key press, and a beat indicator drawn from where the music stands. It takes about ten minutes, visits SOUND for three steps and CODE for two, and needs no sprites and no map.

Each step explains one idea and shows only the lines that carry it. The [complete code](#complete-code) is at the foot of the page, and **Copy to new game** installs the code alone: instruments, patterns and slots are not carried over, so the copy runs silent until Steps 1 to 4 are done. A game that asks for a sound it does not have raises no error; it plays nothing.

## What you will build

A black screen with four boxes. While the music plays, the box of the current beat lights up and a line says which bar of the chain is going by. The `a` button (<kbd>X</kbd>) zaps; `pause` (<kbd>Enter</kbd>) fades the music out, and again brings it back.

## Step 1: An instrument from a preset

Open **SOUND**. A new game has no sound at all: the middle column says No sound yet, and there is no piano roll, because a note is written with an instrument and there is none yet.

### The New instrument dialog

Click the `+` at the head of INSTRUMENTS, or Add instrument in the middle. The **New instrument** dialog offers two starts: From a preset, or Custom, a plain square wave with a short envelope you set up yourself. Take From a preset.

![New instrument](../editors/img/sound-new-instrument.png "New instrument: From a preset, or Custom.")

### A family, then a card

The presets sit on shelves by family: All, Lead, Bass, Keys, Pad, Drums and Effects. A lead carries a melody, a bass sits under it, drums keep time, effects are for the game rather than the music. Open the **LEAD** shelf and click Square lead: a card plays when it is clicked, at the note it is written for, so you hear what you are about to get. Create makes the instrument under the preset's name.

![Presets](../editors/img/sound-presets.png "The same dialog on the DRUMS shelf: each card is a wave, an envelope and a line about what it is for. Kick has just been clicked, and heard.")

Square lead appears in INSTRUMENTS with a gold edge: it is the **selected** instrument, the one new notes are written with, and its colour is the colour its notes will have on the roll. The inspector on the right fills with its dials. Leave them; every one of them stays yours to change later.

> [!TIP]
> The keyboard at the left of the roll plays the selected instrument for as long as a key is held. Try a few before writing anything.

## Step 2: A pattern on the piano roll

The roll is there now: pitches down the side from C1 to B6, steps across, and a bar over it with the PATTERN number, the transport, BPM and STEPS. You are on pattern `00`.

### Length and tempo

Set **STEPS** to `16` and BPM to `120`. At four steps to the beat, sixteen steps are one bar of four beats, which is what the ruler over the roll numbers `1` to `4`; Step 5 counts on it. The defaults are 32 steps at 124 BPM. Both numbers belong to the pattern, not to the game: the next pattern has its own.

### Notes

Snap, in the inspector's head row, is the grid a note lands on. The default, 1/16, is one step, and it is the one you want. Left click on an empty cell places a note one step long with the selected instrument; keep the button down and drag to the right and the note stretches. Right click deletes one. A note that is placed or moved **sounds once**, so you hear what you wrote.

Write eight notes, each two steps long, one after the other, so the bar is full:

| Beat | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| Pattern 00 | C4 E4 | G4 C5 | G4 E4 | C4 G3 |

![The piano roll](../editors/img/sound-roll.png "A pattern of one bar: pitches down the side, the four beats across the top, each note in its instrument's colour. This one has four instruments; yours has one.")

### Hear it

Play in the pattern bar, or <kbd>Space</kbd>, plays the pattern from where the head stands, and **Loop** repeats it, so the bar goes round while you fix a note. Stop ends the take and the head goes out. Click is a metronome on every beat, louder on the downbeat, and never writes into the pattern.

![The transport](../editors/img/sound-transport.png "The transport: Play, Back to the start, Stop.")

> [!NOTE]
> Try it
>
> Press <kbd>Space</kbd> with Loop on. The bar plays round, the head sweeps the roll and the VOICES lane under it lights one voice per note. A note that sounds wrong can be dragged to another row while it plays.

## Step 3: A second pattern, and a music

A music is a chain of patterns. One pattern is a bar; two make something that goes somewhere.

### Pattern 01

Type `01` in the PATTERN field, or step to it with the arrow. Every number from `00` to `99` is already a pattern, most of them empty; you go to one the way you turn a page. Set STEPS to `16` and BPM to `120` again, they are this pattern's own, and write an answer to the first bar, two steps a note as before:

| Beat | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| Pattern 01 | A3 C4 | E4 A4 | E4 C4 | A3 G3 |

### The MUSIC grid

The MUSIC bank at the bottom left is the chain. The `#` field says which of the **16 musics**, `0` to `15`, the grid shows; leave it at `0`, the one the game will ask for. Each box is a place in the chain and takes a pattern number, played left to right, then top to bottom. Type `0` in the first box and `1` in the second: they read `00` and `01`.

![The music panel](../editors/img/sound-music.png "MUSIC #0 with five places filled. The empty box at the fourth place has music after it, so it is drawn in orange: the music stops before it.")

An empty box with music after it is a hole, drawn in **orange**, and the music stops before it: a pattern carries its own length and an empty place has none, so nothing could say how long the silence lasts. A rest is a pattern with no notes in it, chained like any other.

The section has a transport of its own. Play the music plays `00`, then `01`, then stops; the box that is sounding lights up in pink, and the head runs on the roll only while the roll shows the pattern that is sounding. Whether the chain goes round again is the game's decision, in Step 5.

> [!NOTE]
> Try it
>
> Play the music. The first bar, the second, silence. Switch the roll to pattern `01` and play it again: the head appears on the roll when the second box turns pink.

## Step 4: A sound effect

A sound effect is a pattern too, kept in a numbered slot that the game plays by number.

### The Laser, on pattern 02

Add a second instrument: `+`, From a preset, the **EFFECTS** shelf, Laser, Create. It is now the selected instrument. Go to pattern `02` and put a single note on its first step, `G6`, near the top of the roll. Play it once with Loop off: a zap, over long before the bar is. Each instrument has its own colour, so the note is not the colour of Step 2.

### SFX SLOTS

The bank above MUSIC is **SFX SLOTS**. With pattern `02` in front of you, click slot `00`: the slot now holds the pattern, and it is drawn as current because it holds the pattern the roll shows. Click it again to clear it. A free row always waits at the end, so there is always another number.

![SFX SLOTS](../editors/img/sound-sfx.png "SFX SLOTS: slot 01 holds the pattern in front of you, slot 00 another, and the row under them is free.")

### Play it from code

Switch to **CODE**, delete the starter script, and start with the numbers SOUND decided:

``` lua
SFX_ZAP    = 0   -- the SFX slot that holds the zap
MUSIC_MAIN = 0   -- the music, as the # field shows it
```

[[sound.play_sfx]] plays a slot by number, once, on the first free voice. Ask for it on the frame the button goes down with [[input.pressed]], which is true once per press. [[input.held]] would be true on every frame the key is held and start the zap sixty times a second.

``` lua
function _update()
  if input.pressed("a") then
    sound.play_sfx(SFX_ZAP)
  end
end
```

For now `_draw` only clears the screen with `gfx.clear(0)`.

> [!TIP]
> The third argument of [[sound.play_sfx]] transposes: `sound.play_sfx(SFX_ZAP, nil, 7)` is the same zap a fifth higher, so one pattern gives several sounds.

> [!NOTE]
> Try it
>
> Run the game and press <kbd>X</kbd>. One zap per press, however long the key is held. An empty slot plays nothing and raises no error, so a silent press means the number in the code and the slot in SOUND do not match.

## Step 5: Music from the first frame

### Start it in `_init`

[[sound.play_music]] starts a music by its `#` number and **loops it by default**; a second argument of `false` plays it once, and a third fades it in over that many seconds. A game plays one music at a time: starting another replaces it.

``` lua
function _init()
  music_on = true
  sound.play_music(MUSIC_MAIN)
end
```

> [!NOTE]
> A browser lets a page make sound only after you have clicked or pressed a key on it. Pressing Play counts, and the music asked for in `_init` waits for the audio to come up, so the first bar can arrive a moment after the first frame.

### Stop it on pause, and bring it back

[[sound.stop_music]] stops the music at once, or over a fade when given seconds. On the `pause` action (<kbd>Enter</kbd> on the keyboard, Start on a gamepad) fade it out over half a second; on the next press start it again from its first pattern. Add to `_update`:

``` lua
  if input.pressed("pause") then
    if music_on then
      sound.stop_music(0.5)
    else
      sound.play_music(MUSIC_MAIN)
    end
    music_on = not music_on
  end
```

What SOUND decided is not final: [[sound.set_pattern]] can raise the tempo of a pattern from code, and [[sound.set_instrument]] change how an instrument sounds, **for this run only**; the document keeps what you drew.

### A beat indicator

[[sound.music_position]] answers two numbers while a music plays: the **place in the chain**, counted from `0`, which is not the pattern's own number, and the step inside that pattern, rounded up. When nothing plays it answers `nil`. With four steps to a beat, `step // 4` is the beat. The step is rounded up, so at the very end of a bar it reads `16`; `math.min` keeps the fourth box lit until the next bar begins.

``` lua
function _draw()
  gfx.clear(0)

  local place, step = sound.music_position()
  if place == nil then
    gfx.print("NO MUSIC", 10, 10, 3)
    return
  end

  local beat = math.min(step // 4, 3)
  for i = 0, 3 do
    local colour = 15                    -- dark blue
    if i == beat then colour = 4 end     -- yellow on the beat
    gfx.fill_rect(10 + i * 20, 30, 16, 16, colour)
  end

  gfx.print("PATTERN " .. place .. "  STEP " .. step, 10, 10, 5)
end
```

> [!IMPORTANT]
> The position comes back from the audio thread a frame or two late, and a step lasts several frames, so a test like `step % 4 == 0` stays true for a few frames in a row. Fine for a light; for something that must happen once per beat, compare against the beat you saw last frame.

> [!NOTE]
> Try it
>
> Run the game. The four boxes light in turn, one per beat, and `PATTERN` reads `0` for the first bar, `1` for the second, then `0` again: the music loops. <kbd>Enter</kbd>: the music fades over half a second, and `NO MUSIC` appears once the fade is over, not before. <kbd>Enter</kbd> again brings it back from the top.

## Complete code

{{lua:main.lua}}

## Extending the example

- A kick under the melody: a third instrument from the DRUMS shelf, and a note of it on every beat of both patterns.
- A rest: a pattern with no notes, chained after `01`, so the music waits a bar before it loops.
- A zap on the beat: only play it when the beat has just changed, and see how the fade in [[sound.play_music]] sounds under it.
- A pause screen: [[sound.set_volume]] halves everything while it is up, without stopping the music.
- A note without a pattern: [[sound.play_note]] plays an instrument by name, from code, for a pickup jingle.
- A faster last lap: `sound.set_pattern(0, { bpm = 160 })` and the same for `1` when the timer runs low. The music picks up the tempo on its next step, and the patterns in SOUND still say 120.
