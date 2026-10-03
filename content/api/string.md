---
title: Lua · string
slug: api/string
section: api
order: 8
description: The string library of standard Lua, for cutting, searching, formatting and replacing the text a game shows.
namespace: string
---

# string · Text

The `string` functions work on text: a score written in a fixed width, a name cut to fit, a level read out of a string. Every one of them can also be called on the string itself, `name:upper()` for `string.upper(name)`. Positions count bytes from `1`, and a negative one counts from the end.

## Measuring and cutting

{{api:string.len}}

{{api:string.sub}}

{{api:string.upper}}

{{api:string.lower}}

{{api:string.rep}}

{{api:string.reverse}}

## Formatting

{{api:string.format}}

## Searching and replacing

`find`, `match`, `gmatch` and `gsub` take a **Lua pattern**, a smaller cousin of a regular expression: `%d` is a digit, `%a` a letter, `%s` a space, `.` any character, and `+`, `*` and `-` repeat what comes before. The [patterns section of the manual](https://www.lua.org/manual/5.3/manual.html#6.4.1) has them all.

{{api:string.find}}

{{api:string.match}}

{{api:string.gmatch}}

{{api:string.gsub}}

## Characters and codes

{{api:string.byte}}

{{api:string.char}}
