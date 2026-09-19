---
title: API Reference
slug: api/index
section: api
order: 0
description: Every function of the Naucto Lua API in one line each, grouped by namespace, with a link to its full card.
legacy_slugs:
- api/index.html
---

# API Reference

Every function of the Lua API, one line each, by namespace. Click a name for its card: signature, parameters, what it does, an example.

The functions live in six tables, `gfx`, `map`, `input`, `sound`, `sys` and `net`, so a call reads `gfx.clear(0)`, never `clear(0)`. **The bare v0 names exist only in a game that has the `compat` prelude**, which a game created today does not have. The one global is `print`, the same function as [[sys.log]].

## gfx · Rendering and palette

| Function | What it does |
| --- | --- |
| [[gfx.clear]] | Fill the screen with a palette colour (default 0) |
| [[gfx.draw_sprite]] | Draw w×h tiles starting at sprite n. Colour 0 is the transparent one by default |
| [[gfx.draw_region]] | Draw a pixel rectangle of the sprite sheet, optionally scaled |
| [[gfx.pixel]] | Set one screen pixel |
| [[gfx.get_pixel]] | Read the palette index at a screen pixel (slow) |
| [[gfx.line]] | Draw a one-pixel line |
| [[gfx.rect]] | Draw a rectangle outline |
| [[gfx.fill_rect]] | Draw a filled rectangle |
| [[gfx.circle]] | Draw a circle outline |
| [[gfx.fill_circle]] | Draw a filled circle |
| [[gfx.print]] | Draw text with the built-in 4×6 font; returns its width |
| [[gfx.camera]] | Offset every later draw call; no arguments resets |
| [[gfx.clip]] | Restrict drawing to a rectangle; no arguments resets |
| [[gfx.set_col]] | Draw palette remap: pixels of colour `from` are drawn as `to` |
| [[gfx.reset_col]] | Clear the draw palette remap |
| [[gfx.set_color]] | Change a screen colour: for the frame, or from this line on inside `_scanline` |
| [[gfx.get_color]] | Current screen colour as "#rrggbb", of the frame or of the line being scanned |
| [[gfx.reset_palette]] | Restore the game palette; inside `_scanline`, put the line back to the frame palette |
| [[gfx.screen_col]] | Screen palette remap applied at display time, for the frame or from this line on |
| [[gfx.shift]] | Shift the display by whole pixels: the frame in `_draw`, this line on in `_scanline` |
| [[gfx.blank]] | Show black instead: the whole frame in `_draw`, this line on in `_scanline` |
| [[gfx.width]] | Screen width (320) |
| [[gfx.height]] | Screen height (180) |

## map · Tilemap

| Function | What it does |
| --- | --- |
| [[map.draw]] | Draw a map (or a sub-rectangle of its tiles) at a pixel position. m picks the map, from 1 |
| [[map.get]] | Sprite index at a tile of map m (the first by default) |
| [[map.set]] | Change a tile of map m (the first by default) for this run only |
| [[map.flag]] | Flags byte of sprite n, or one bit of it |
| [[map.width]] | Width of map m (the first by default), in tiles |
| [[map.height]] | Height of map m (the first by default), in tiles |

## input · Input

| Function | What it does |
| --- | --- |
| [[input.held]] | True while an action (left right up down a b x y pause) is held |
| [[input.pressed]] | True on the step an action was pressed |
| [[input.released]] | True on the step an action was released |
| [[input.key_pressed]] | True while a keyboard key (event.key name) is held |
| [[input.key_down]] | True on the step a key went down |
| [[input.get_mouse_pos]] | Mouse x, y in screen pixels (nil when outside) |
| [[input.mouse_pressed]] | True while a mouse button is held |
| [[input.mouse_down]] | True on the step a mouse button was pressed |
| [[input.players]] | Number of connected players (keyboard counts as one) |

## sound · Sound

| Function | What it does |
| --- | --- |
| [[sound.play_sfx]] | Play a numbered SFX slot |
| [[sound.play_note]] | Play a note now; pitch is MIDI or "C4" |
| [[sound.stop_note]] | Release a voice |
| [[sound.play_music]] | Start song slot 0..15 from the tracker |
| [[sound.stop_music]] | Stop the music |
| [[sound.stop]] | Stop everything |
| [[sound.set_volume]] | Mixer levels 0..1 |
| [[sound.music_position]] | pattern_index, step of the playing song (nil when stopped) |
| [[sound.is_playing]] | Whether a voice is sounding |

## sys · Time and console

| Function | What it does |
| --- | --- |
| [[sys.dt]] | Fixed step length in seconds (1/60) |
| [[sys.frame]] | Frames since _init |
| [[sys.time]] | Seconds since _init |
| [[sys.fps]] | Measured frames per second |
| [[sys.log]] | Write to the console (same as print) |
| [[sys.warn]] | Write a warning to the console |
| [[sys.error]] | Write an error line to the console |

## net · Multiplayer

| Function | What it does |
| --- | --- |
| [[net.host]] | Open the host dialog; callback() once the session exists |
| [[net.join]] | Open the join dialog |
| [[net.leave]] | Leave the current session |
| [[net.id]] | Your player id in the session |
| [[net.on]] | React to net.state changes or events |
| [[net.emit]] | Broadcast an event |
| [[net.lock]] | Create a replicated lock value |
| [[net.queue]] | Create a replicated queue value |
| [[net.state]] | A table shared by every player in the session; writes replicate to all peers, reads return the latest replicated value |
