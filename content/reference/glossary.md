---
title: Glossary
slug: reference/glossary
section: reference
order: 3
description: The words the editor and the API use, one short paragraph each, with a link to the page that goes deeper.
---

# Glossary

This page is for the moment a word in a dialog, a panel or an error line means nothing yet. Each entry says what the thing is and where the rest is written.

## Sprite

A **sprite** is one 8 × 8 cell of a sheet, named by its number: `0` is the top-left cell, and the numbers run left to right, then top to bottom, on from one sheet to the next. That number is what [[gfx.draw_sprite]] takes, and what a map tile holds. Colour `0` is transparent when a sprite is drawn. See [ART](/learn/editors/art).

## Sheet

A **sheet** is a picture cut into sprites. A new game has one sheet of 128 × 128 pixels, 256 sprites, and the ART tab can add more or resize one to anything from 8 to 256 pixels a side, in steps of 8. The MAP tab calls it a tileset; it is the same thing. See [ART](/learn/editors/art).

## Region

The **region** is the rectangle of cells the ART tab is working on, drawn with a gold outline on the canvas: one cell for a single sprite, 2 × 2 for a character that spans four. It is chosen on the SHEET map, PREVIEW shows it at its real size, and the FLAGS panel writes to every cell of it. The Lock option keeps a stroke inside it. See [ART](/learn/editors/art).

## Tile

A **tile** is one cell of a map, 8 × 8 pixels, holding a sprite number. Tile coordinates count tiles, not pixels: the tile under pixel `(px, py)` is `(px / 8, py / 8)`, floored. Tile `0` is always drawn empty, so sprite `0` never appears on a map. See [Coordinates](/learn/concepts/coordinates).

## Map

A **map** is a grid of tiles, 128 × 32 by default and anything from 1 to 256 tiles a side. A game can have several, numbered from `1` in the order of the MAP tab's strip; every `map.*` function but [[map.flag]], which reads a sprite rather than a map, takes the map as its last argument and works on the first one when it is left out. [[map.draw]] draws it, [[map.get]] and [[map.set]] read and write a tile. See [MAP](/learn/editors/map).

## Brush

The **brush** is what the Stamp tool of MAP lays on the map: one sprite, chosen by clicking a cell of the TILE PICKER, or a block of up to 8 × 8 cells framed by a drag on it. See [MAP](/learn/editors/map).

## Flag

A **flag** is one of the eight bits, `0` to `7`, every sprite carries. The FLAGS panel of ART sets them and [[map.flag]] reads them; the engine gives them no meaning, so it is your game that decides bit 0 is solid. Flags are read on the first sheet only. See [ART](/learn/editors/art).

## Pattern

A **pattern** is one page of the piano roll, numbered `00` to `99`, with a tempo and a length of its own. Every number is already a pattern, most of them empty. A sound effect is a pattern kept in an SFX slot; a music is a chain of them. See [SOUND](/learn/editors/sound).

## Step and frame

On the piano roll a **step** is one column of the grid, a quarter of a beat: a pattern has 16 to 64 of them in the SOUND tab (code accepts 1 to 64), and the default snap places a note on one.

The game loop has a step too: 1/60 s of game time, one `_update` followed by one `_draw`, which is what the Step button of the transport runs once. A **frame** is one picture shown on the screen. The two usually go together, but a browser that fell behind runs several steps before showing one picture, so a step can run without its frame ever being seen. [[sys.frame]] counts steps. See [Game loop](/learn/concepts/game-loop).

## Delta

The **delta** is the time one step stands for, which [[sys.dt]] returns. In Naucto it is always `1/60`: the step is fixed, so a speed is written per step rather than multiplied by a changing delta. See [Limitations](/learn/reference/limitations).

## Snap

**Snap** is the grid a note lands on when it is placed on the piano roll, so a click a little off still puts it on a step. The button in the inspector's head row cycles Off, 1/4, 1/8, 1/16, 1/32; 1/16, one step, is the default. See [SOUND](/learn/editors/sound).

## BPM

**BPM**, beats per minute, is the tempo of a pattern: how many beats go by in a minute, from 40 to 240, 124 by default. Each pattern keeps its own, at four steps to the beat. See [SOUND](/learn/editors/sound).

## SFX slot

An **SFX slot** is a numbered entry of the SFX SLOTS bank in SOUND, counted from `00`, holding one pattern. [[sound.play_sfx]] takes that number. A free row always waits at the end of the bank, so there is no last slot. See [SOUND](/learn/editors/sound).

## Music

A **music** is a chain of patterns, one of the sixteen the MUSIC bank holds, numbered `0` to `15`. Its grid is played left to right, then top to bottom, and stops at the first empty box that has more after it. [[sound.play_music]] starts one by number, looping by default. See [SOUND](/learn/editors/sound).

## Instrument

An **instrument** is what a note is written with: a wave, an envelope, modulation, a filter and a mix of its own, under a name of up to 16 characters and a colour that paints its notes on the roll. [[sound.play_note]] plays one from code, without a pattern. See [SOUND](/learn/editors/sound).

## Voice

A **voice** is one sound playing at a time. The console has five, so five notes can sound at once; a sound effect takes the first free one, and when none is free it takes one from the music. The keyboard of the piano roll plays on the fifth. See [SOUND](/learn/editors/sound).

## Envelope

The **envelope** is how loud a note is over its life, in four stages: attack, the time to reach full volume; decay, the time to fall from there to the sustain level; sustain, the level held while the note lasts; release, the time to fade once it ends. A, D and R are times, S is a level. See [SOUND](/learn/editors/sound).

## Sample

A **sample** is an audio file imported into an instrument whose wave is PCM. It is mixed to mono, resampled to 8-bit at 8 kHz and cut to 8 KB, about one second; ROOT is the note at which it plays at its recorded pitch. See [SOUND](/learn/editors/sound).

## Autosave

An **autosave** is a write of the game to the server that the editor makes on its own: a few seconds after the edits stop, and every five minutes while they keep coming. Each one is a row in the versions popover, and they come and go, unlike a named version. See [GAME](/learn/editors/game).

## Version

A **version** is a snapshot of the whole game in its history. A named one, `v1`, `v2`, stays until you delete it and counts against a cap the server sets; reusing a name overwrites that version. Any version can be restored, and the restore reaches everyone in the work session at once. See [GAME](/learn/editors/game).

## Release

A **release** is the state of the game the hub serves, the one people play. Publish makes the first one from the current save, Update release replaces it, and each leaves a version named `published` in the history. A game needs a name, a one-line summary and less than 1 MB to be released. See [GAME](/learn/editors/game).

## Remix

A **remix** is a copy of a published game that someone else makes their own, with a line back to the original: the copy says Forked from, and the original counts its remixes. Nobody can remix a game until it is published. See [GAME](/learn/editors/game).

## Work session

The **work session** is everyone who has the game open in the editor right now, editing the same document. The GAME tab lists them under IN THIS WORK SESSION, their avatars sit in the header, and the host of the work session has a Kick button. It is not a netplay session: a game is edited together whether or not it is played together. See [Editors](/learn/editors/index).

## Session (netplay)

A **session** is a game played online by several players. One player creates it with [[net.host]], the others enter it with [[net.join]], and it ends for everyone when the host leaves. The NET tab shows the one that is running. See [Multiplayer](/learn/concepts/multiplayer).

## Host and guest

The **host** is the player who called [[net.host]]: the referee of the session, who orders every shared write, lock grant and queue operation and is never refused. A guest, called a client in the NET tab, entered with [[net.join]], talks to the host only, and a write of its own can be rejected and rolled back. See [Multiplayer](/learn/concepts/multiplayer).

## Peer

A **peer** is one player's copy of the game in a session, the host included, known by the id [[net.id]] returns. The `peer.joined` and `peer.left` events name that id, and fire on the host only. See [net](/learn/api/net).

## Relay

A **relay** is a server in the middle that passes traffic between two peers that cannot reach each other directly. The platform falls back to one on its own, the Route line of NET says `relayed` when it does, and Force a relay in the TEST RIG asks for one on purpose, to measure what it costs. See [NET](/learn/editors/net).

## Snapshot

A **snapshot** is the whole of `net.state` as it stands, sent to a player on joining so that a late joiner starts from the same values as everyone else. Paths whose R flag is off are left out of it. Events are not in it: a player who joins later never sees past events. See [Multiplayer](/learn/concepts/multiplayer).

## Path

A **path** is the address of a value in `net.state`, written with dots: `net.state.players[3].x` is the path `players.3.x`, and each word between the dots is a segment. The NET tab lists the shared state one path per row, the permissions are set per path, and the patterns of `net.on` name paths, with `*` for one segment and `**` for any number. See [Multiplayer](/learn/concepts/multiplayer).

## Event

An **event** is a one-shot message sent with [[net.emit]] and received by the other peers through `net.on("event:<name>")`. It is not stored, so a player who joins later never sees it; anything that must survive a join belongs in `net.state`. The engine has events of its own too, `peer.joined`, `peer.left`, `ended` and `error`. See [net](/learn/api/net).

## Callback

A **callback** is a function you hand to another function, to be called later when something happens: the function given to [[net.host]] or [[net.join]] runs once the session exists, the one given to `net.on` runs at every matching change. An error inside a `net` callback does not halt the game; it is printed to the Console. See [Multiplayer](/learn/concepts/multiplayer).

## Lock

A **lock** is what [[net.lock]] creates: a coordination object placed in `net.state` so that two players competing for one thing take it in turn. Its `acquire` hands the holder a `release`, grants are ordered by the host, and a player who leaves releases every lock it held. The Lock toggle of ART is another thing: it keeps a stroke inside the region. See [Multiplayer](/learn/concepts/multiplayer).

## Queue

A **queue** is what [[net.queue]] creates: a shared list placed in `net.state`, where `push` appends and `pop` removes the head. Pops are ordered by the host, so an item is delivered to exactly one player. See [Multiplayer](/learn/concepts/multiplayer).

## Permissions

The **permissions** are the R and W flags on each path of `net.state`, set in the NET tab and carried by the game. With W off only the host writes the path; with R off the host never sends it to guests. A path nothing was set on inherits from the nearest configured ancestor, or stays open, and a refused write reaches the game as `net.on("error")` with the reason `"forbidden"`. See [Multiplayer](/learn/concepts/multiplayer).

## Palette

The **palette** is the sixteen colours of the whole game, slots `0` to `15`, shared by every sheet and every map; the screen holds slot numbers, not colours. Bubblegum 16 is the default and the PALETTE panel of ART edits any slot. In code, [[gfx.set_color]] changes a colour for the run and [[gfx.set_col]] draws one slot as another. See [Colours](/learn/api/gfx#colours).

## Camera

The **camera** is the offset [[gfx.camera]] sets: something drawn at `(px, py)` lands at `(px - x, py - y)`. It is not reset between frames, so a camera set in `_init` holds for the whole game, and `gfx.camera()` with no arguments puts it back at the origin. See [Coordinates](/learn/concepts/coordinates).

## Clip

The **clip** is the rectangle [[gfx.clip]] keeps every later draw call inside, in screen pixels, so the camera does not move it. Drawing outside it is dropped, `gfx.clip()` opens the whole screen again, and [[gfx.clear]] ignores it. See [Coordinates](/learn/concepts/coordinates).

## Beam and scanline

The **beam** is how the picture reaches the screen: one line at a time, from the top line, `0`, to the bottom one, `179`, each palette index turned into a colour on the way. A **scanline** is one of those lines. If the game defines `_scanline(y)`, the beam calls it just before showing line `y`, so a line can have its own palette or shift for that frame only. See [The display beam](/learn/api/gfx#the-display-beam).

## Action

An **action** is one of the nine inputs a game reads, `left`, `right`, `up`, `down`, `a`, `b`, `x`, `y` and `pause`, rather than a key: [[input.held]] and [[input.pressed]] take its name, and the player's keyboard, gamepad or touch controls are mapped to it. `a` is <kbd>X</kbd> or <kbd>Space</kbd> by default, and the key <kbd>A</kbd> is `left`. See [input](/learn/api/input).

## Table, global and local

A **table** is Lua's one container: a box with named slots, `{ x = 156, y = 86 }`, or numbered ones, `{ 1, 2, 3 }`. A **global** is a name written without `local`; it is visible to every tab and to `_init`, `_update` and `_draw` wherever they are. A **local** is a name declared with `local`, visible only in the block, or the tab, where it is written. Every launch starts with the globals empty. See [Code structure](/learn/reference/structure).
