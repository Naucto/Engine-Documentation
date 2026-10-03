---
title: Standard Lua
slug: api/lua
section: api
order: 7
description: What a game can use of standard Lua 5.3 beside the console's own namespaces, what the console leaves out, and where it differs, with the basic functions every game calls.
namespace: base
---

# Standard Lua

Beside `gfx`, `map`, `input`, `sound`, `sys` and `net`, a game has the standard library of **Lua 5.3**, the version the console runs. These pages document the part a game uses, each function with an example that runs in the console; the [Lua 5.3 reference manual](https://www.lua.org/manual/5.3/manual.html#6) is the full text, and every card links its own place in it.

## The libraries

| Library | What it holds |
| --- | --- |
| [Basic functions](/learn/api/lua#basic-functions) | `type`, `tostring`, `pairs`, `pcall` and the other globals |
| [`string`](/learn/api/string) | Cutting, searching, formatting and replacing text |
| [`table`](/learn/api/table) | Inserting, removing, sorting and joining lists |
| [`math`](/learn/api/math) | Rounding, random numbers, angles, limits |
| [`utf8`](/learn/api/utf8) | Text counted in characters rather than bytes |
| [`coroutine`](/learn/api/coroutine) | Functions that pause and go on later |
| [`os`](/learn/api/os) | The clock and the date |

## What the console leaves out

A game runs in a browser tab, beside other people's games, so the parts of Lua that reach outside it are gone. **There are no files, no modules and no shell**: `io`, `require`, `dofile`, `loadfile`, `package` and the `os` functions that run commands or read the environment are not there, and the tabs of the CODE editor run in their order instead of being required. The `debug` library is left undocumented, since the console already shows an error's traceback, and so are `load`, `collectgarbage` and the binary `string.pack` family, which a game has no use for.

## Where it differs

**Integers are 32 bits**, not the 64 of standard Lua: past `2147483647` an integer wraps round to a negative number without an error. A float, written with a decimal point, stays exact up to `2^53`; [[math.maxinteger]] shows both.

`print` is the console's own, the same function as [[sys.log]]: it writes a number the browser's way, so `3.0` prints as `3`, and a table as JSON. `tostring` keeps Lua's spelling.

> [!WARNING]
> `print` cannot print a coroutine itself: `print(co)` stops with `Unsupported Lua type thread`. Print `tostring(co)` instead; see [[coroutine.create]].

## Basic functions

The basic functions are globals, called by their bare name.

### Types and conversions

{{api:type}}

{{api:tostring}}

{{api:tonumber}}

### Walking a table

{{api:pairs}}

{{api:ipairs}}

{{api:next}}

{{api:select}}

### Errors

{{api:assert}}

{{api:error}}

{{api:pcall}}

{{api:xpcall}}

### Metatables

A metatable gives a table behaviour of its own: fields it inherits, operators, a way to print itself. It is how Lua writes classes.

{{api:setmetatable}}

{{api:getmetatable}}

{{api:rawget}}

{{api:rawset}}

{{api:rawequal}}

{{api:rawlen}}
