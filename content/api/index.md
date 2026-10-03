---
title: API Reference
slug: api/index
section: api
order: 0
description: Every function of the Naucto Lua API in one line each, grouped by namespace, with a link to its full card.
---

# API Reference

Every function of the Lua API, one line each, by namespace. Click a name for its card: signature, parameters, what it does, an example.

The functions live in six tables, `gfx`, `map`, `input`, `sound`, `sys` and `net`, so **a call reads `gfx.clear(0)`**, never `clear(0)`. The one global is `print`, the same function as [[sys.log]].

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
| [[gfx.shift]] | Shift the display by whole pixels: the frame from anywhere but `_scanline`, this line on from inside it |
| [[gfx.blank]] | Show black instead: the whole frame from anywhere but `_scanline`, this line on from inside it |
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

`key_pressed` and `mouse_pressed` mean **held**, whatever their names say; the edges are `key_down` and `mouse_down`, as `pressed` is for an action.

## sound · Sound

| Function | What it does |
| --- | --- |
| [[sound.play_sfx]] | Play a numbered SFX slot |
| [[sound.play_note]] | Play a note now; pitch is MIDI or "C4" |
| [[sound.stop_note]] | Release a voice |
| [[sound.play_music]] | Start music 0..15; loops from its start unless told otherwise |
| [[sound.stop_music]] | Stop the music |
| [[sound.stop]] | Stop everything |
| [[sound.set_volume]] | Mixer levels 0..1 |
| [[sound.music_pos]] | Place in the music's chain and the step now sounding, 0-based; nil when nothing plays |
| [[sound.is_playing]] | Whether a voice is sounding |
| [[sound.set_instrument]] | Change an instrument for this run |
| [[sound.set_pattern]] | Change the tempo or length of a pattern for this run |
| [[sound.set_music]] | Change whether a music loops for this run |

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
| [[net.state]] | A table shared by every player in the session. Writes replicate to all peers automatically; reads always return the latest replicated value |

## Lua

The part of Lua 5.3's own library a game uses, documented on the [Lua](/learn/api/lua) pages with an example each.

### Lua

| Function | What it does |
| --- | --- |
| [`type`](/learn/api/lua#type) | The type of a value, as a string |
| [`tostring`](/learn/api/lua#tostring) | A value turned into text |
| [`tonumber`](/learn/api/lua#tonumber) | A string read as a number, or nil when it is not one |
| [`pairs`](/learn/api/lua#pairs) | Every key and value of a table, for a for loop |
| [`ipairs`](/learn/api/lua#ipairs) | The numbered entries of a table, from 1 up to the first nil, in order |
| [`next`](/learn/api/lua#next) | The key after a given one in a table, and its value |
| [`select`](/learn/api/lua#select) | The arguments from the nth on, or how many there are |
| [`assert`](/learn/api/lua#assert) | Stop with an error when a value is false or nil, or hand it back |
| [`error`](/learn/api/lua#error) | Stop the current function with an error |
| [`pcall`](/learn/api/lua#pcall) | Call a function and catch the error it raises instead of halting |
| [`xpcall`](/learn/api/lua#xpcall) | Like pcall, with a function that sees the error first |
| [`setmetatable`](/learn/api/lua#setmetatable) | Give a table a metatable, the table of its special behaviours |
| [`getmetatable`](/learn/api/lua#getmetatable) | The metatable of a value, or nil |
| [`rawget`](/learn/api/lua#rawget) | A field of a table, without its metatable's __index |
| [`rawset`](/learn/api/lua#rawset) | Set a field of a table, without its metatable's __newindex |
| [`rawequal`](/learn/api/lua#rawequal) | Whether two values are the same, without the __eq metamethod |
| [`rawlen`](/learn/api/lua#rawlen) | The length of a table or a string, without the __len metamethod |

### string · String manipulation

| Function | What it does |
| --- | --- |
| [[string.len]] | The length of a string in bytes |
| [[string.sub]] | The part of a string from position i to position j |
| [[string.upper]] | A copy of a string in capitals |
| [[string.lower]] | A copy of a string in small letters |
| [[string.rep]] | A string repeated n times, with an optional separator between copies |
| [[string.reverse]] | A string with its bytes in the opposite order |
| [[string.format]] | Text built from a template and values, like C's printf |
| [[string.find]] | Where a pattern first occurs in a string |
| [[string.match]] | The first match of a pattern in a string, or its captures |
| [[string.gmatch]] | Every match of a pattern in a string, for a for loop |
| [[string.gsub]] | A copy of a string with the matches of a pattern replaced |
| [[string.byte]] | The numeric codes of characters in a string |
| [[string.char]] | A string made of the characters with the given codes |

### table · Tables

| Function | What it does |
| --- | --- |
| [[table.insert]] | Add a value to a list, at the end or at a position |
| [[table.remove]] | Take a value out of a list, the last one or the one at a position |
| [[table.sort]] | Sort a list in place |
| [[table.concat]] | The elements of a list joined into one string |
| [[table.unpack]] | The elements of a list as separate values |
| [[table.pack]] | Its arguments gathered in a new list, with their count in n |
| [[table.move]] | Copy a run of elements within a list or into another one |

### math · Mathematics

| Function | What it does |
| --- | --- |
| [[math.floor]] | The largest whole number not above x |
| [[math.ceil]] | The smallest whole number not below x |
| [[math.abs]] | The distance of x from zero |
| [[math.min]] | The smallest of its arguments |
| [[math.max]] | The largest of its arguments |
| [[math.random]] | A random number, a float below 1 or a whole number in a range |
| [[math.randomseed]] | Restart the random sequence from a seed |
| [[math.sqrt]] | The square root of x |
| [[math.sin]] | The sine of an angle in radians |
| [[math.cos]] | The cosine of an angle in radians |
| [[math.tan]] | The tangent of an angle in radians |
| [[math.atan]] | The angle, in radians, of a direction given as y and x |
| [[math.asin]] | The angle, in radians, whose sine is x |
| [[math.acos]] | The angle, in radians, whose cosine is x |
| [[math.rad]] | An angle in degrees, in radians |
| [[math.deg]] | An angle in radians, in degrees |
| [[math.exp]] | e raised to the power x |
| [[math.log]] | The logarithm of x, natural or in a given base |
| [[math.fmod]] | The remainder of x divided by y, with the sign of x |
| [[math.modf]] | The whole part and the fractional part of x |
| [[math.tointeger]] | x as an integer, or nil when it has a fraction |
| [[math.type]] | Whether a number is an integer or a float |
| [[math.pi]] | The number pi |
| [[math.huge]] | A float larger than any other number |
| [[math.maxinteger]] | The largest integer, 2147483647 |
| [[math.mininteger]] | The smallest integer, -2147483648 |

### utf8 · UTF-8

| Function | What it does |
| --- | --- |
| [[utf8.len]] | The number of characters in a UTF-8 string |
| [[utf8.char]] | A UTF-8 string made of the characters with the given code points |
| [[utf8.codepoint]] | The code points of the characters of a UTF-8 string |
| [[utf8.codes]] | Every character of a UTF-8 string, for a for loop |
| [[utf8.offset]] | The byte position where the nth character of a UTF-8 string starts |
| [[utf8.charpattern]] | A pattern that matches exactly one UTF-8 character |

### coroutine · Coroutines

| Function | What it does |
| --- | --- |
| [[coroutine.create]] | A new coroutine that will run f |
| [[coroutine.resume]] | Run a coroutine until it yields or ends |
| [[coroutine.yield]] | Pause the running coroutine and hand values back to resume |
| [[coroutine.status]] | Whether a coroutine is suspended, running, normal or dead |
| [[coroutine.wrap]] | A coroutine you call like a function |
| [[coroutine.running]] | The running coroutine, and whether it is the main one |
| [[coroutine.isyieldable]] | Whether the running code may call yield |

### os · Operating system

| Function | What it does |
| --- | --- |
| [[os.time]] | The current time in seconds, or the time of a given date |
| [[os.date]] | A date written as text, or as a table of its parts |
| [[os.clock]] | Seconds of processor time the game has used |
| [[os.difftime]] | The seconds from one time to another |
