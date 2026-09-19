---
title: Time and console
slug: api/sys
section: api
order: 6
description: The sys functions give the game its clock, the fixed step, the frame count and the measured frame rate, and write to the console under the viewer.
legacy_slugs:
- api/debug.html
namespace: sys
---

# sys · Time, frames and the console

What the game cannot get from drawing or input: the clock, and a way to say something. Everything printed lands in the **console** under the viewer in the editor, never on the screen.

## Time

The game runs `_update` at a fixed 60 steps per second (see the [game loop](/learn/concepts/game-loop)), so `dt` is the same number every step; multiply a speed by it all the same, and count in `frame` or `time` for anything that must stay in step with the game.

{{api:sys.dt}}

{{api:sys.frame}}

{{api:sys.time}}

{{api:sys.fps}}

## The console

`print` is the same function as `log`. `warn` and `error` only colour the line: neither stops the game. A Lua error raised by `error(...)` or a bug does stop it, and shows here too.

![The console column of the editor, with a print, a warning and an error line under the running game](../../api/img/sys-console.png "The console under the viewer after one print, one warn and one error: the values are joined with tabs, and only the colour and the mark at the left tell the three apart.")

{{api:sys.log}}

{{api:sys.warn}}

{{api:sys.error}}

> [!TIP]
> Print freely while building, and take the prints out when it works: they cost nothing on screen, but a console that scrolls is a console nobody reads.
